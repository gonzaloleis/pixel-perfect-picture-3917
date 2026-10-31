import { motion } from "framer-motion";
import { s8, s9, s10 } from "@/content/slides";
import { cn } from "@/lib/utils";
import { Build, CountText, EASE, Title, useIsStatic, type SlideProps } from "../primitives";
import { Glow } from "../Glow";

/* ---------------- Slide 8 ---------------- */

export function Slide8({ step }: SlideProps) {
  // Running-total waterfall
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
  const W = 440;
  const sx = (v: number) => ((v - min) / (max - min)) * W;

  return (
    <>
      <Title>{s8.title}</Title>
      <div className="absolute top-[280px] left-[140px] grid w-[1640px] grid-cols-2 gap-10">
        <Build at={1} step={step} className="k-card flex h-[330px] flex-col border-mint/40 p-12">
          <div className="k-label text-mint">{s8.time.label}</div>
          <div className="k-lead mt-auto text-ink">{s8.time.headline}</div>
          <div className="k-small mt-4 text-ink-2">{s8.time.detail}</div>
        </Build>
        <Build at={1} step={step} i={1} className="k-card flex h-[330px] flex-col border-amber/40 p-12">
          <div className="k-label text-amber">{s8.cost.label}</div>
          <div className="k-lead mt-auto text-ink">
            <CountText text={s8.cost.headline} active={step >= 1} />
          </div>
          <div className="k-body mt-4 text-amber">{s8.cost.detail}</div>
        </Build>
      </div>

      <div className="absolute top-[656px] left-[980px] w-[800px]">
        {bars.map((b, idx) => {
          const tone = b.kind === "result" ? "bg-amber" : b.kind === "total" ? "bg-ink" : "bg-ink-2";
          return (
            <Build key={b.label} at={2} step={step} i={idx} className="flex h-[54px] items-center border-b border-hair">
              <div className={cn("k-small w-[360px] shrink-0", b.kind === "result" ? "text-amber" : "text-ink")}>
                <span className={b.kind === "result" ? "" : "text-ink-2"}>{b.label}</span> {b.text}
              </div>
              <div className="relative h-[14px]" style={{ width: W }}>
                <div className="absolute top-[-14px] bottom-[-14px] w-px bg-hair" style={{ left: sx(0) }} />
                <div
                  className={cn("absolute h-full rounded-[3px]", tone)}
                  style={{ left: sx(b.lo), width: Math.max(sx(b.hi) - sx(b.lo), 2) }}
                />
              </div>
            </Build>
          );
        })}
      </div>

      <Build at={3} step={step} className="k-small absolute top-[930px] left-[140px] w-[1640px] text-ink-2">
        {s8.footer}
      </Build>
    </>
  );
}

/* ---------------- Slide 9 ---------------- */

function CardColumn({ label, items, at, step }: { label: string; items: string[]; at: number; step: number }) {
  return (
    <div className="flex flex-col gap-4">
      <Build at={at} step={step} className="k-label mb-2 text-ink-2">
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
      <div className="absolute top-[272px] left-[140px] grid w-[1640px] grid-cols-2 gap-10">
        <CardColumn label={s9.missing.label} items={s9.missing.items} at={1} step={step} />
        <CardColumn label={s9.assumptions.label} items={s9.assumptions.items} at={2} step={step} />
      </div>
      <Build at={2} step={step} i={5} className="k-small absolute top-[940px] left-[140px] text-ink-2">
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
      <Build at={1} step={step} className="absolute top-[250px] left-0 w-full text-center">
        <h2 className="k-title text-[80px] text-ink">{s10.title}</h2>
      </Build>
      <div className="absolute top-[470px] left-[140px] grid w-[1640px] grid-cols-3 gap-10">
        {s10.cards.map((c, idx) => (
          <Build key={c.date} at={2} step={step} i={idx} className="k-card flex h-[270px] flex-col p-10">
            <div className="k-label text-ink-2">{c.date}</div>
            <div className="k-lead mt-auto text-ink">{c.name}</div>
            <div className="k-small mt-3 text-ink-2">{c.text}</div>
          </Build>
        ))}
      </div>
    </>
  );

  return (
    <>
      <Glow rise={closing} baseY={420} riseY={0} />
      {isStatic ? (
        !closing && body
      ) : (
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: closing ? 0 : 1 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          {body}
        </motion.div>
      )}
      <Build at={3} step={step} className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="k-display text-[96px] text-ink">{s10.closing.text}</p>
        <p className="k-label mt-10 text-ink-2">{s10.closing.mark}</p>
      </Build>
    </>
  );
}
