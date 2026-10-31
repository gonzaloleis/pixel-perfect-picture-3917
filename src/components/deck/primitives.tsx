import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SAMPLE_DATA_LABEL, type Accent, type CaptureSlot } from "@/content/slides";

export const EASE = [0.22, 1, 0.36, 1] as const;

/** When true (thumbnails, print), everything renders in its final state with no motion. */
export const StaticContext = createContext(false);
export const useIsStatic = () => useContext(StaticContext);

export type SlideProps = { step: number };

export const accentText: Record<Accent, string> = {
  ink: "text-ink",
  amber: "text-amber",
  mint: "text-mint",
};

/** Fade + 12px rise when `step >= at`. `i` staggers siblings by 70ms. */
export function Build({
  at,
  step,
  i = 0,
  className,
  style,
  children,
  as = "div",
}: {
  at: number;
  step: number;
  i?: number;
  className?: string;
  style?: CSSProperties;
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
  return (
    <M
      className={className}
      style={style}
      initial={false}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.45, ease: EASE, delay: visible ? i * 0.07 : 0 }}
      aria-hidden={!visible}
    >
      {children}
    </M>
  );
}

const NUM = /\d[\d,]*(?:\.\d+)?/g;

function formatLike(sample: string, value: number) {
  const decimals = sample.includes(".") ? sample.split(".")[1].length : 0;
  const grouped = sample.includes(",");
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouped,
  });
}

/** Renders `text` exactly, counting every number in it up from 0 when it becomes active. */
export function CountText({ text, active = true, duration = 900 }: { text: string; active?: boolean; duration?: number }) {
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
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min((t - t0) / duration, 1);
      setP(1 - Math.pow(1 - k, 3));
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active, skip, duration]);

  if (p >= 1) return <span className="tabular-nums">{text}</span>;
  return (
    <span className="tabular-nums">
      {text.replace(NUM, (m) => formatLike(m, Number(m.replace(/,/g, "")) * p))}
    </span>
  );
}

export function SampleDataTag() {
  return <div className="k-label pointer-events-none absolute right-12 bottom-9 text-ink-2">{SAMPLE_DATA_LABEL}</div>;
}

export function Title({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("k-title absolute top-[112px] left-[140px] text-ink", className)}>{children}</h2>;
}

/** MS Project screenshot slot: real image if /captures/<file> exists, dashed placeholder otherwise. */
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
      <div className={cn("k-capture-filled overflow-hidden p-3", className)} style={{ width: w, height: h }}>
        <img src={src} alt={slot.description} className="h-full w-full object-contain" />
      </div>
    );
  }
  return (
    <div
      className={cn("k-capture-empty flex flex-col items-center justify-center gap-4 px-10 text-center", className)}
      style={{ width: w, height: h }}
    >
      <div className="k-label text-amber">MS PROJECT CAPTURE</div>
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
  if (isStatic) return active ? <path d={d} className={className} fill="none" /> : null;
  return (
    <motion.path
      d={d}
      className={className}
      fill="none"
      initial={false}
      animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }}
      transition={{ pathLength: { duration, ease: EASE, delay }, opacity: { duration: 0.2, delay } }}
    />
  );
}
