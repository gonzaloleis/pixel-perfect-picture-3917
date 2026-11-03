import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { s8, s9, s10 } from "@/content/slides";
import { cn } from "@/lib/utils";
import { AFTER_TITLE, Build, CountText, EASE, Pill, SPRING, Title, useIsStatic, type SlideProps } from "../primitives";
import { Glow } from "../Glow";

/* ---------------- Slide 8 ---------------- */

function FlipCard({ delay, className, children }: { delay: number; className?: string; children: ReactNode }) {
  const isStatic = useIsStatic();
  if (isStatic) return <div className={className}>{children}</div>;
  return (
    <div style={{ perspective: 1600 }}>
      <motion.div
        className={className}
        style={{ transformOrigin: "50% 50%" }}
        initial={{ rotateY: -80, opacity: 0, scale: 0.98 }}
        animate={{ rotateY: 0, opacity: 1, scale: 1 }}
        transition={{ ...SPRING, opacity: { duration: 0.3, delay }, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function Slide8({ step }: SlideProps) {
  let run = 0;
  const bars = s8.waterfall.map((w) => {
    let from: number, to: number;
    if (w.kind === "total") {
      from = 0;
      to = w.delta;
      run = w.delta;
    } else if (w.kind === "step") {
      from = run;
      to = run + w.delta;
      run = to;
    } else {
      from = 0;
      to = w.delta;
    }
    return { ...w, lo: Math.min(from, to), hi: Math.max(from, to) };
  });
  const min = Math.min(0, ...bars.map((b) => b.lo));
  const max = Math.max(...bars.map((b) => b.hi));
  // Plot area inside the full-width card; room on both sides for the amounts.
  const W = 1180;
  const PAD_L = 190;
  const PAD_R = 200;
  const sx = (v: number) => PAD_L + ((v - min) / (max - min)) * (W - PAD_L - PAD_R);
  const second = AFTER_TITLE + 0.45;

  return (
    <>
      <Title center>{s8.title}</Title>
      <div className="absolute top-[256px] left-[160px] grid w-[1600px] grid-cols-2 gap-10">
        <FlipCard delay={AFTER_TITLE} className="k-card flex h-[320px] flex-col p-12">
          <div>
            <Pill accent="mint">{s8.time.label}</Pill>
          </div>
          <div className="k-lead mt-auto text-ink">{s8.time.headline}</div>
          <div className="k-small mt-4 text-ink-2">{s8.time.detail}</div>
        </FlipCard>
        <FlipCard delay={second} className="k-card flex h-[320px] flex-col p-12">
          <div>
            <Pill accent="amber">{s8.cost.label}</Pill>
          </div>
          <div className="k-lead mt-auto text-ink">{s8.cost.headline}</div>
          <div className="k-body mt-4 font-medium text-amber">
            <CountText text={s8.cost.detail} active={step >= 1} delay={second + 0.3} />
          </div>
        </FlipCard>
      </div>

      <Build at={2} step={step} className="k-card absolute top-[612px] left-[160px] w-[1600px] px-12 pt-4 pb-5">
        <div className="relative flex h-[34px]">
          <div className="w-[300px] shrink-0" />
          <div className="relative" style={{ width: W }}>
            <span className="k-label absolute top-[6px] -translate-x-1/2 text-ink-2" style={{ left: sx(0) }}>
              0{"\u00A0"}€
            </span>
          </div>
        </div>
        {bars.map((b, idx) => {
          const result = b.kind === "result";
          const tone = result ? "bg-amber" : b.kind === "total" ? "bg-blue" : "bg-ink-2/40";
          return (
            <Build key={b.label} at={2} step={step} i={idx} className="flex h-[58px] items-center">
              <div className={cn("k-small w-[300px] shrink-0", result ? "font-medium text-amber" : "text-ink-2")}>{b.label}</div>
              <div className="relative h-[26px]" style={{ width: W }}>
                <div className="absolute top-[-16px] bottom-[-16px] w-[2px] bg-ink/25" style={{ left: sx(0) - 1 }} />
                <div className={cn("absolute h-full rounded-[8px]", tone)} style={{ left: sx(b.lo), width: Math.max(sx(b.hi) - sx(b.lo), 4) }} />
                <span
                  className={cn("k-small absolute top-1/2 -translate-y-1/2 whitespace-nowrap tabular-nums", result ? "font-medium text-amber" : "text-ink")}
                  style={result ? { right: W - sx(b.lo) + 14 } : { left: sx(b.hi) + 14 }}
                >
                  {b.text}
                </span>
              </div>
            </Build>
          );
        })}
      </Build>

      <Build at={3} step={step} className="k-small absolute top-[956px] left-0 w-full text-center text-ink-2">
        {s8.footer}
      </Build>
    </>
  );
}

/* ---------------- Slide 9 ---------------- */

function CardColumn({ label, items, at, step }: { label: string; items: string[]; at: number; step: number }) {
  return (
    <div className="flex flex-col gap-4">
      <Build at={at} step={step} className="mb-1 text-[24px] leading-tight font-semibold text-ink-2">
        {label}
      </Build>
      {items.map((it, idx) => (
        <Build key={it} at={at} step={step} i={idx + 1} className="k-card px-8 py-6">
          <p className="k-small text-ink">{it}</p>
        </Build>
      ))}
    </div>
  );
}

export function Slide9({ step }: SlideProps) {
  return (
    <>
      <Title>{s9.title}</Title>
      <div className="absolute top-[262px] left-[140px] grid w-[1640px] grid-cols-2 gap-10">
        <CardColumn label={s9.missing.label} items={s9.missing.items} at={1} step={step} />
        <CardColumn label={s9.assumptions.label} items={s9.assumptions.items} at={2} step={step} />
      </div>
      <Build at={2} step={step} i={5} className="k-small absolute top-[948px] left-[140px] text-ink-2">
        {s9.footer}
      </Build>
    </>
  );
}

/* ---------------- Slide 10 ---------------- */

export function Slide10({ step }: SlideProps) {
  const isStatic = useIsStatic();
  const closing = step >= 3;
  const body = (
    <>
      <Title center className="top-[250px] text-[96px]">
        {s10.title}
      </Title>
      <div className="absolute top-[470px] left-[160px] grid w-[1600px] grid-cols-3 gap-8">
        {s10.cards.map((c, idx) => (
          <Build key={c.date} at={2} step={step} i={idx} className="k-card flex h-[270px] flex-col p-10">
            <div className="k-small font-medium text-blue">{c.date}</div>
            <div className="k-lead mt-auto text-ink">{c.name}</div>
            <div className="k-small mt-3 text-ink-2">{c.text}</div>
          </Build>
        ))}
      </div>
    </>
  );

  return (
    <>
      <Glow rise={closing} />
      {isStatic ? (
        !closing && body
      ) : (
        <motion.div className="absolute inset-0" initial={false} animate={{ opacity: closing ? 0 : 1, scale: closing ? 0.98 : 1 }} transition={{ duration: 0.8, ease: EASE }}>
          {body}
        </motion.div>
      )}
      <Build at={3} step={step} delay={0.4} className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="k-title text-[84px] text-ink">{s10.closing.text}</p>
        <p className="k-small mt-10 font-medium text-ink-2">{s10.closing.mark}</p>
      </Build>
    </>
  );
}
