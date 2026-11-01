import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion, type MotionStyle } from "framer-motion";
import { cn } from "@/lib/utils";
import { SAMPLE_DATA_LABEL, type Accent, type CaptureSlot } from "@/content/slides";

export const EASE = [0.22, 1, 0.36, 1] as const;
/** Soft, quick, never bouncy. */
export const SPRING = { type: "spring", stiffness: 260, damping: 28, mass: 1 } as const;
/** First-step content waits for the title to land on its own. */
export const AFTER_TITLE = 0.38;

/** When true (thumbnails, print), everything renders in its final state with no motion. */
export const StaticContext = createContext(false);
export const useIsStatic = () => useContext(StaticContext);

export type SlideProps = { step: number };

export const accentText: Record<Accent, string> = {
  ink: "text-ink",
  blue: "text-blue",
  amber: "text-amber",
  mint: "text-mint",
};

export const accentPill: Record<Accent, string> = {
  ink: "bg-ink/10 text-ink",
  blue: "bg-blue/10 text-blue",
  amber: "bg-amber/10 text-amber",
  mint: "bg-mint/10 text-mint",
};

/** Fade + scale 0.98→1 (spring) when `step >= at`. `i` staggers siblings by 70ms. */
export function Build({
  at,
  step,
  i = 0,
  delay = 0,
  className,
  style,
  children,
  as = "div",
}: {
  at: number;
  step: number;
  i?: number;
  delay?: number;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  children?: ReactNode;
  as?: "div" | "span";
}) {
  const isStatic = useIsStatic();
  const visible = step >= at;
  if (isStatic) {
    if (!visible) return null;
    const Tag = as;
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    );
  }
  const M = as === "span" ? motion.span : motion.div;
  const base = at === 1 ? AFTER_TITLE : 0;
  return (
    <M
      className={className}
      style={(style ?? {}) as MotionStyle}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
      transition={{ ...SPRING, opacity: { duration: 0.35, ease: EASE, delay: visible ? base + delay + i * 0.07 : 0 }, delay: visible ? base + delay + i * 0.07 : 0 }}
      aria-hidden={!visible}
    >
      {children}
    </M>
  );
}

const NUM = /\d[\d,]*(?:\.\d+)?/g;

function formatLike(sample: string, value: number) {
  const decimals = sample.includes(".") ? (sample.split(".")[1] ?? "").length : 0;
  const grouped = sample.includes(",");
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouped,
  });
}

/** Renders `text` exactly, counting every number in it up from 0 when it becomes active. */
export function CountText({
  text,
  active = true,
  duration = 900,
  delay = 0,
}: {
  text: string;
  active?: boolean;
  duration?: number;
  delay?: number;
}) {
  const isStatic = useIsStatic();
  const reduce = useReducedMotion();
  const skip = isStatic || reduce;
  const [p, setP] = useState(skip ? 1 : 0);
  const raf = useRef(0);

  useEffect(() => {
    if (skip) {
      setP(1);
      return;
    }
    if (!active) {
      setP(0);
      return;
    }
    const t0 = performance.now() + delay * 1000;
    const tick = (t: number) => {
      const k = Math.min(Math.max((t - t0) / duration, 0), 1);
      setP(1 - Math.pow(1 - k, 3));
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active, skip, duration, delay]);

  if (p >= 1) return <span className="tabular-nums">{text}</span>;
  return (
    <span className="tabular-nums">
      {text.replace(NUM, (m) => formatLike(m, Number(m.replace(/,/g, "")) * p))}
    </span>
  );
}

export function Pill({ accent, children, className }: { accent: Accent; children: ReactNode; className?: string }) {
  return <span className={cn("k-pill k-label", accentPill[accent], className)}>{children}</span>;
}

export function SampleDataTag() {
  return <div className="k-label pointer-events-none absolute right-12 bottom-9 text-ink-2">{SAMPLE_DATA_LABEL}</div>;
}

/** Slide title: the hero of the slide, enters alone. */
export function Title({ children, className, center = false }: { children: ReactNode; className?: string; center?: boolean }) {
  const isStatic = useIsStatic();
  const cls = cn(
    "k-title absolute top-[96px] text-ink",
    center ? "left-0 w-full text-center" : "left-[140px]",
    className,
  );
  if (isStatic) return <h2 className={cls}>{children}</h2>;
  return (
    <motion.h2 className={cls} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING}>
      {children}
    </motion.h2>
  );
}

/** Large rounded card that holds the "product" on slides 3–7. */
export function StageCard({ className }: { className?: string }) {
  return <div className={cn("k-stage-card absolute top-[232px] left-[100px] h-[768px] w-[1720px]", className)} />;
}

/** MS Project screenshot slot: app-window frame if /captures/<file> exists, dashed placeholder otherwise. */
export function Capture({ slot, width, className }: { slot: CaptureSlot; width?: number; className?: string }) {
  const w = width ?? slot.width;
  const h = Math.round((w * slot.height) / slot.width);
  const src = `/captures/${slot.file}`;
  const [state, setState] = useState<"unknown" | "ok" | "missing">("unknown");

  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onload = () => alive && setState(img.naturalWidth > 0 ? "ok" : "missing");
    img.onerror = () => alive && setState("missing");
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);

  if (state === "ok") {
    return (
      <div className={cn("k-window flex flex-col overflow-hidden", className)} style={{ width: w, height: h }}>
        <div className="flex h-[34px] shrink-0 items-center gap-2 border-b border-hair px-4">
          <span className="h-[10px] w-[10px] rounded-full bg-track" />
          <span className="h-[10px] w-[10px] rounded-full bg-track" />
          <span className="h-[10px] w-[10px] rounded-full bg-track" />
        </div>
        <div className="min-h-0 flex-1 p-2">
          <img src={src} alt={slot.description} className="h-full w-full object-contain" />
        </div>
      </div>
    );
  }
  return (
    <div
      className={cn("k-capture-empty flex flex-col items-center justify-center gap-4 px-10 text-center", className)}
      style={{ width: w, height: h }}
    >
      <div className="k-label text-blue">MS PROJECT CAPTURE</div>
      <div className="k-small text-ink-2">{slot.description}</div>
    </div>
  );
}

/** SVG path that draws itself from start to end. */
export function DrawPath({
  d,
  active,
  className,
  duration = 1.4,
  delay = 0,
}: {
  d: string;
  active: boolean;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const isStatic = useIsStatic();
  if (isStatic) return active ? <path d={d} className={className} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null;
  return (
    <motion.path
      d={d}
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }}
      transition={{ pathLength: { duration, ease: EASE, delay }, opacity: { duration: 0.2, delay } }}
    />
  );
}
