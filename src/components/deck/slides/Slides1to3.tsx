import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { s1, s2, s3 } from "@/content/slides";
import { cn } from "@/lib/utils";
import { AFTER_TITLE, Build, Capture, CountText, SPRING, StageCard, Title, accentText, useIsStatic, type SlideProps } from "../primitives";

export function Slide1({ step }: SlideProps) {
  const isStatic = useIsStatic();
  const title = <h1 className="k-display text-ink">{s1.title}</h1>;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
      {isStatic ? (
        title
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING}>
          {title}
        </motion.div>
      )}
      <Build at={1} step={step}>
        <p className="k-lead mt-8 font-normal text-ink-2">{s1.subtitle}</p>
      </Build>
      <Build at={2} step={step} className="mt-20 flex flex-col items-center gap-4">
        <div className="k-small text-ink-2">{s1.baseline}</div>
        <div className="k-small text-ink-2">{s1.credit}</div>
      </Build>
    </div>
  );
}

export function Slide2({ step }: SlideProps) {
  const cols = "grid grid-cols-[360px_470px_1fr] items-baseline";
  return (
    <>
      <Title center>{s2.title}</Title>
      <Build at={1} step={step} className="k-card absolute top-[248px] left-[240px] w-[1440px] px-14 pt-10 pb-6">
        <div className={cn(cols, "border-b border-hair pb-5")}>
          {s2.headers.map((h) => (
            <div key={h} className="k-label text-ink-2">
              {h}
            </div>
          ))}
        </div>
        {s2.rows.map((r, idx) => (
          <Build
            key={r.item}
            at={r.step}
            step={step}
            i={idx % 2}
            className={cn(cols, "border-b border-hair py-[20px] last:border-b-0")}
          >
            <div className="k-small text-ink-2">{r.item}</div>
            <div className="k-small text-ink">
              {r.count ? <CountText text={r.offer} active={step >= r.step} /> : r.offer}
            </div>
            <div className={cn("k-small font-medium", r.accent ? accentText[r.accent] : "text-ink")}>
              {r.count ? <CountText text={r.contract} active={step >= r.step} /> : r.contract}
            </div>
          </Build>
        ))}
      </Build>
      <Build at={1} step={step} i={3} className="k-small absolute top-[912px] left-0 w-full text-center text-ink-2">
        {s2.footer}
      </Build>
    </>
  );
}

/* ---------- Slide 3: planning assistant fills in the WBS ---------- */

const ROW_MS = 300;

function useChecklist(count: number, active: boolean) {
  const isStatic = useIsStatic();
  const reduce = useReducedMotion();
  const instant = isStatic || reduce;
  const [checked, setChecked] = useState(instant ? count : 0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (instant) {
      setChecked(count);
      return;
    }
    if (!active) return;
    let c = 0;
    let interval = 0;
    const start = window.setTimeout(() => {
      setRunning(true);
      interval = window.setInterval(() => {
        c += 1;
        setChecked(c);
        if (c >= count) {
          window.clearInterval(interval);
          setRunning(false);
        }
      }, ROW_MS);
    }, AFTER_TITLE * 1000 + 250);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [active, instant, count]);

  return { checked, running };
}

function Spinner() {
  return (
    <motion.svg width={26} height={26} viewBox="0 0 26 26" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}>
      <circle cx={13} cy={13} r={10} className="fill-none stroke-track" strokeWidth={3} />
      <path d="M13 3 A10 10 0 0 1 23 13" className="fill-none stroke-blue" strokeWidth={3} strokeLinecap="round" />
    </motion.svg>
  );
}

function Check({ tone = "blue" }: { tone?: "blue" | "mint" }) {
  return (
    <motion.svg width={26} height={26} viewBox="0 0 26 26" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING}>
      <circle cx={13} cy={13} r={13} className={tone === "blue" ? "fill-blue" : "fill-mint"} />
      <path d="M7.5 13.5 L11.5 17.2 L18.5 9.5" className="fill-none stroke-surface" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}

export function Slide3({ step }: SlideProps) {
  const isStatic = useIsStatic();
  const { checked, running } = useChecklist(s3.phases.length, step >= 1);
  const done = checked >= s3.phases.length;
  const status = s3.status.find((s) => checked < s.until) ?? s3.status[s3.status.length - 1]!;

  return (
    <>
      <Title>{s3.title}</Title>
      <Build at={1} step={step} className="absolute inset-0">
        <StageCard />
      </Build>

      <Build at={1} step={step} i={1} className="absolute top-[272px] left-[150px] w-[640px]">
        {s3.phases.map(([n, name], idx) => {
          const isChecked = idx < checked;
          const isSpinning = running && idx === checked;
          return (
            <div key={n} className="flex h-[46px] items-center gap-5 border-b border-hair last:border-b-0">
              <span className="flex w-[26px] shrink-0 items-center justify-center">
                {isChecked ? (
                  isStatic ? (
                    <svg width={26} height={26} viewBox="0 0 26 26">
                      <circle cx={13} cy={13} r={13} className="fill-blue" />
                      <path d="M7.5 13.5 L11.5 17.2 L18.5 9.5" className="fill-none stroke-surface" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <Check />
                  )
                ) : isSpinning ? (
                  <Spinner />
                ) : (
                  <span className="h-[22px] w-[22px] rounded-full border-2 border-track" />
                )}
              </span>
              <span className="k-label w-8 text-ink-2">{n}</span>
              <span className={cn("text-[24px] leading-none transition-colors duration-300", isChecked ? "text-ink" : "text-ink-2/60")}>
                {name}
              </span>
            </div>
          );
        })}
        <div className="mt-5 flex h-[30px] items-center gap-3">
          {done ? (
            <span className="h-[10px] w-[10px] rounded-full bg-blue" />
          ) : (
            <motion.span
              className="h-[10px] w-[10px] rounded-full bg-blue"
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            />
          )}
          <span className={cn("k-label", done ? "text-blue" : "text-ink-2")}>{status.text}</span>
        </div>
      </Build>

      <div className="absolute top-[838px] left-[150px] grid w-[640px] grid-cols-3 gap-4">
        {s3.stats.map((s, idx) => (
          <Build key={s.unit} at={3} step={step} i={idx} className="k-inset flex h-[124px] flex-col justify-center px-6">
            <span className="k-figure text-[48px] text-ink">
              <CountText text={s.value} active={step >= 3} />
            </span>
            <span className="text-[22px] text-ink-2">{s.unit}</span>
          </Build>
        ))}
      </div>

      {isStatic ? (
        step >= 2 && (
          <div className="absolute top-[272px] left-[830px]">
            <Capture slot={s3.capture} width={940} />
          </div>
        )
      ) : (
        <motion.div
          className="absolute top-[272px] left-[830px]"
          initial={{ opacity: 0, x: 120 }}
          animate={step >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 120 }}
          transition={SPRING}
        >
          <Capture slot={s3.capture} width={940} />
        </motion.div>
      )}
    </>
  );
}
