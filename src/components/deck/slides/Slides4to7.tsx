import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { s4, s5, s6, s7 } from "@/content/slides";
import { cn } from "@/lib/utils";
import {
  AFTER_TITLE,
  Build,
  Capture,
  CountText,
  DrawPath,
  EASE,
  Pill,
  SPRING,
  StageCard,
  Title,
  useIsStatic,
  type SlideProps,
} from "../primitives";

/* ---------------- shared ---------------- */

function GrowBar({ active, fraction, className, delay = 0 }: { active: boolean; fraction: number; className?: string; delay?: number }) {
  const isStatic = useIsStatic();
  if (isStatic) return <div className={className} style={{ width: `${fraction * 100}%` }} />;
  return (
    <motion.div
      className={cn("origin-left", className)}
      style={{ width: `${fraction * 100}%` }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: active ? 1 : 0 }}
      transition={{ ...SPRING, delay }}
    />
  );
}

/** 0→1 over `duration` once `active` turns true (after `delay`). Static/reduced motion → 1. */
function useProgress(active: boolean, duration: number, delay: number) {
  const isStatic = useIsStatic();
  const reduce = useReducedMotion();
  const instant = isStatic || reduce;
  const [p, setP] = useState(instant && active ? 1 : 0);
  const raf = useRef(0);
  useEffect(() => {
    if (!active) {
      setP(0);
      return;
    }
    if (instant) {
      setP(1);
      return;
    }
    const t0 = performance.now() + delay * 1000;
    const tick = (t: number) => {
      const k = Math.min(Math.max((t - t0) / (duration * 1000), 0), 1);
      setP(k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active, instant, duration, delay]);
  return p;
}

/* ---------------- Slide 4: timeline with a travelling cursor ---------------- */

const X0 = 180;
const X1 = 1740;
const AXIS_Y = 620;
const CURSOR_S = 0.9;
const t = (d: string) => new Date(d + "T00:00:00Z").getTime();
const T0 = t(s4.start.date);
const T1 = t(s4.end.date);
const dx = (d: string) => X0 + ((t(d) - T0) / (T1 - T0)) * (X1 - X0);

const bandFill = { grey: "fill-ink/[0.05]", amber: "fill-amber/15", ink: "fill-blue/[0.07]" } as const;

export function Slide4({ step }: SlideProps) {
  const isStatic = useIsStatic();
  const progress = s4.axisProgress[Math.min(step, s4.axisProgress.length) - 1] ?? 1;
  const markerX = dx(s4.marker.date);
  const visibleMs = s4.milestones.filter((m) => step >= m.step);
  const latest = visibleMs[visibleMs.length - 1];
  const cursorX = latest ? dx(latest.date) : X0;
  const landDelay = step === 1 ? AFTER_TITLE + 0.2 : CURSOR_S * 0.9;

  return (
    <>
      <Title>{s4.title}</Title>
      <Build at={1} step={step} className="absolute inset-0">
        <StageCard />
      </Build>
      <Build at={1} step={step} i={1} className="absolute inset-0">
        <svg className="absolute inset-0" width={1920} height={1080} viewBox="0 0 1920 1080">
          {s4.bands.map((b) => {
            const visible = step >= b.step;
            const rect = (
              <rect x={dx(b.from)} y={420} width={Math.max(dx(b.to) - dx(b.from), 2)} height={380} rx={10} className={bandFill[b.tone]} />
            );
            if (isStatic) return visible ? <g key={b.from}>{rect}</g> : null;
            return (
              <motion.g key={b.from} initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }} transition={{ duration: 0.6, ease: EASE }}>
                {rect}
              </motion.g>
            );
          })}
          <line x1={X0} x2={X1} y1={AXIS_Y} y2={AXIS_Y} className="stroke-hair" strokeWidth={3} strokeLinecap="round" />
          {isStatic ? (
            <line x1={X0} x2={X0 + (X1 - X0) * progress} y1={AXIS_Y} y2={AXIS_Y} className="stroke-ink" strokeWidth={3} strokeLinecap="round" />
          ) : (
            <motion.line
              x1={X0}
              y1={AXIS_Y}
              y2={AXIS_Y}
              className="stroke-ink"
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ x2: X0 }}
              animate={{ x2: X0 + (X1 - X0) * progress }}
              transition={{ duration: 1.1, ease: EASE }}
            />
          )}
          {step >= s4.marker.step && <line x1={markerX} x2={markerX} y1={384} y2={800} className="stroke-amber" strokeWidth={3} strokeLinecap="round" />}

          {/* Soft cursor dot travelling along the timeline */}
          {!isStatic && (
            <motion.g initial={{ x: X0 }} animate={{ x: cursorX }} transition={{ duration: CURSOR_S, ease: EASE }}>
              <circle cx={0} cy={AXIS_Y} r={26} className="fill-blue/15" />
              <circle cx={0} cy={AXIS_Y} r={12} className="fill-blue" />
            </motion.g>
          )}

          {/* Milestone pins: dropped when the cursor lands, with a gentle pulse */}
          {s4.milestones.map((m) => {
            if (step < m.step) return null;
            const x = dx(m.date);
            if (isStatic) return <circle key={m.date} cx={x} cy={AXIS_Y} r={11} className="fill-surface stroke-ink" strokeWidth={3} />;
            const isLatest = m === latest;
            const d = isLatest ? landDelay : 0;
            return (
              <g key={m.date}>
                {isLatest && (
                  <motion.circle
                    cx={x}
                    cy={AXIS_Y}
                    className="fill-blue/20"
                    initial={{ r: 10, opacity: 0 }}
                    animate={{ r: [10, 40], opacity: [0.9, 0] }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: d }}
                  />
                )}
                <motion.circle
                  cx={x}
                  cy={AXIS_Y}
                  r={11}
                  className="fill-surface stroke-ink"
                  strokeWidth={3}
                  style={{ transformOrigin: `${x}px ${AXIS_Y}px` }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ ...SPRING, delay: d }}
                />
              </g>
            );
          })}

        </svg>

        <div className="k-label absolute text-ink-2" style={{ left: X0, top: AXIS_Y - 92 }}>
          {s4.start.label}
        </div>
        <div className="k-label absolute text-ink-2" style={{ right: 1920 - X1, top: 816 }}>
          {s4.end.label}
        </div>
      </Build>

      {s4.bands.map((b) => (
        <Build
          key={b.from + "l"}
          at={b.step}
          step={step}
          className={cn("k-label absolute whitespace-nowrap", b.tone === "amber" ? "text-amber" : b.tone === "ink" ? "text-blue" : "text-ink-2")}
          style={{ left: dx(b.from), top: b.tone === "grey" ? 816 : 388 }}
        >
          {b.label}
        </Build>
      ))}

      <Build at={s4.marker.step} step={step} className="k-label absolute whitespace-nowrap text-amber" style={{ right: 1920 - markerX, top: 346 }}>
        {s4.marker.label}
      </Build>

      {s4.milestones.map((m) => {
        const x = dx(m.date);
        const pos = m.align === "start" ? { left: x - 4 } : { right: 1920 - x - 4 };
        const textAlign = m.align === "start" ? "text-left" : "text-right";
        const d = m === latest && !isStatic ? landDelay - (step === 1 ? AFTER_TITLE : 0) + 0.1 : 0;
        return (
          <div key={m.date}>
            <Build at={m.step} step={step} delay={d + 0.08} className="absolute" style={{ ...pos, top: AXIS_Y + 26 }}>
              <Pill accent={m.accent}>{m.slack}</Pill>
            </Build>
            <Build
              at={m.step}
              step={step}
              delay={d}
              className={cn("absolute w-[460px]", textAlign)}
              style={m.side === "above" ? { ...pos, bottom: 1080 - (AXIS_Y - 34) } : { ...pos, top: AXIS_Y + 86 }}
            >
              <div className="k-label text-ink-2">{m.head}</div>
              <div className="k-small mt-2 font-medium text-ink">{m.text}</div>
            </Build>
          </div>
        );
      })}
    </>
  );
}

/* ---------------- Slide 5: resources ---------------- */

export function Slide5({ step }: SlideProps) {
  const isStatic = useIsStatic();
  const max = Math.max(...s5.units.map((u) => u.hours));
  return (
    <>
      <Title>{s5.title}</Title>
      <Build at={1} step={step} className="absolute inset-0">
        <StageCard />
      </Build>
      <div className="absolute top-[284px] left-[160px] w-[820px]">
        {s5.units.map((u, idx) => (
          <Build key={u.name} at={1} step={step} i={idx + 1} className="flex h-[66px] items-center border-b border-hair last:border-b-0">
            <div className="k-small w-[240px] shrink-0 text-ink-2">{u.name}</div>
            <div className="w-[440px]">
              <GrowBar
                active={step >= 1}
                fraction={u.hours / max}
                delay={AFTER_TITLE + 0.15 + idx * 0.07}
                className="h-[14px] rounded-full bg-blue"
              />
            </div>
            <div className="k-label w-[140px] shrink-0 text-right text-ink">
              <CountText text={u.label} active={step >= 1} delay={AFTER_TITLE} />
            </div>
          </Build>
        ))}
      </div>
      <Build at={2} step={step} className="absolute top-[272px] left-[1030px]">
        <Capture slot={s5.capture} width={740} />
      </Build>
      <div className="absolute top-[792px] left-[150px] grid w-[1620px] grid-cols-2 gap-8">
        {s5.cards.map((c, idx) => (
          <Build
            key={c.text}
            at={3}
            step={step}
            delay={idx * 0.35}
            className={cn("relative flex gap-5 overflow-hidden rounded-[20px] px-8 py-6", c.accent === "mint" ? "bg-mint/10" : "bg-amber/10")}
          >
            <span className={cn("mt-[12px] h-[10px] w-[10px] shrink-0 rounded-full", c.accent === "mint" ? "bg-mint" : "bg-amber")} />
            <p className="k-small text-ink">{c.text}</p>
            {c.accent === "amber" && !isStatic && step >= 3 && (
              <motion.span
                className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-amber/30 to-transparent"
                initial={{ x: "-110%" }}
                animate={{ x: "220%" }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.55 }}
              />
            )}
          </Build>
        ))}
      </div>
    </>
  );
}

/* ---------------- Slide 6: cost breakdown ---------------- */

const CX = 620;
const CY = 610;
const R = 190;

function arc(a0: number, a1: number, r = R) {
  const rad = (a: number) => (a * Math.PI) / 180;
  const p = (a: number) => [CX + r * Math.cos(rad(a)), CY + r * Math.sin(rad(a))];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

export function Slide6({ step }: SlideProps) {
  const sum = s6.segments.reduce((a, s) => a + s.value, 0);
  let a = s6.donutStartDeg;
  const segs = s6.segments.map((s) => {
    const span = (s.value / sum) * 360;
    const seg = { ...s, a0: a + 1.2, a1: a + span - 1.2, mid: a + span / 2 };
    a += span;
    return seg;
  });
  const total = s6.stack.direct.value + s6.stack.indirect.value;

  return (
    <>
      <Title>{s6.title}</Title>
      <Build at={1} step={step} className="absolute inset-0">
        <StageCard />
      </Build>
      <Build at={1} step={step} i={1} className="absolute inset-0">
        <svg className="absolute inset-0" width={1920} height={1080} viewBox="0 0 1920 1080">
          <circle cx={CX} cy={CY} r={R} className="fill-none stroke-inset" strokeWidth={44} />
          {segs.map((s, idx) => (
            <g key={s.name} style={{ opacity: s.tone }}>
              <DrawPath d={arc(s.a0, s.a1)} active={step >= 1} className="stroke-blue [stroke-width:44px] [stroke-linecap:butt]" duration={0.8} delay={AFTER_TITLE + idx * 0.25} />
            </g>
          ))}
        </svg>
      </Build>
      <Build at={1} step={step} i={2} className="absolute flex w-[300px] flex-col items-center text-center" style={{ left: CX - 150, top: CY - 50 }}>
        <span className="k-figure text-ink">
          <CountText text={s6.centre.value} active={step >= 1} delay={AFTER_TITLE} />
        </span>
        <span className="k-small text-ink-2">{s6.centre.caption}</span>
      </Build>
      {segs.map((s, idx) => {
        const rad = (s.mid * Math.PI) / 180;
        const lx = CX + (R + 62) * Math.cos(rad);
        const ly = CY + (R + 62) * Math.sin(rad);
        const right = Math.cos(rad) >= 0;
        return (
          <Build
            key={s.name + "l"}
            at={1}
            step={step}
            i={idx + 4}
            className={cn("absolute flex flex-col gap-1 whitespace-nowrap", right ? "items-start" : "items-end")}
            style={right ? { left: lx, top: ly - 32 } : { right: 1920 - lx, top: ly - 32 }}
          >
            <span className="k-small font-medium text-ink">{s.name}</span>
            <span className="k-label text-ink-2">{s.label}</span>
          </Build>
        );
      })}

      <Build at={2} step={step} className="absolute top-[290px] left-[1120px] w-[650px]">
        <div className="flex h-[30px] w-full gap-[4px]">
          <GrowBar active={step >= 2} fraction={s6.stack.direct.value / total} className="h-full rounded-l-full bg-blue" />
          <div className="h-full flex-1 rounded-r-full bg-blue/30" />
        </div>
        <div className="mt-5 flex justify-between gap-6">
          <div>
            <div className="k-label text-ink-2">{s6.stack.direct.label}</div>
            <div className="k-small mt-1 text-ink">
              <CountText text={s6.stack.direct.text} active={step >= 2} />
            </div>
          </div>
          <div className="text-right">
            <div className="k-label text-ink-2">+ {s6.stack.indirect.label}</div>
            <div className="k-small mt-1 text-ink">{s6.stack.indirect.text}</div>
          </div>
        </div>
        <div className="mt-6 flex items-baseline justify-between border-t border-hair pt-5">
          <span className="k-label text-ink-2">= {s6.stack.total.label}</span>
          <span className="k-figure text-ink">
            <CountText text={s6.stack.total.text} active={step >= 2} />
          </span>
        </div>
      </Build>
      <Build at={3} step={step} className="absolute top-[598px] left-[1120px]">
        <Capture slot={s6.capture} width={650} />
      </Build>
    </>
  );
}

/* ---------------- Slide 7: S-curve drawn live ---------------- */

const PL = 240;
const PR = 1640;
const PT = 500;
const PB = 900;
const DRAW_S = 2;

function smooth(pts: [number, number][]) {
  let d = `M ${pts[0]![0]} ${pts[0]![1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p0 = pts[i - 1] ?? p1;
    const p3 = pts[i + 2] ?? p2;
    const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export function Slide7({ step }: SlideProps) {
  const isStatic = useIsStatic();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipPay = "k-above-pay-" + uid;
  const clipDraw = "k-draw-" + uid;
  const n = s7.bcws.length;
  const months = s7.bcws.map(([m]) => m);
  const xi = (i: number) => PL + (i * (PR - PL)) / (n - 1);
  const xm = (m: string) => xi(Math.max(months.indexOf(m), 0));
  const y = (v: number) => PB - (v / s7.yMax) * (PB - PT);

  const chartOn = step >= 2;
  const p = useProgress(chartOn, DRAW_S, 0.2);

  const pts = s7.bcws.map(([, v], i) => [xi(i), y(v)] as [number, number]);
  const cost = smooth(pts);
  const costArea = `${cost} L ${xi(n - 1)} ${PB} L ${xi(0)} ${PB} Z`;

  let pay = `M ${xi(0)} ${y(0)}`;
  s7.payments.forEach((pm) => {
    pay += ` H ${xm(pm.month)} V ${y(pm.value)}`;
  });
  let above = `M ${xi(0)} ${PT - 40} L ${xi(0)} ${y(0)}`;
  s7.payments.forEach((pm) => {
    above += ` H ${xm(pm.month)} V ${y(pm.value)}`;
  });
  above += ` H ${xi(n - 1) + 2} V ${PT - 40} Z`;

  const pre = s7.payments;
  const preX = xm(s7.prefinancing.month);
  const preIdx = months.indexOf(s7.prefinancing.month);
  const prePaid = [...pre].reverse().find((pm) => months.indexOf(pm.month) <= preIdx)?.value ?? 0;
  const preY = (y(s7.bcws[preIdx]?.[1] ?? 0) + y(prePaid)) / 2;
  const [preA, preB] = s7.prefinancing.label.split(" · ");

  // Floating label follows the drawing tip
  const fi = p * (n - 1);
  const i0 = Math.min(Math.floor(fi), n - 2);
  const frac = fi - i0;
  const v0 = s7.bcws[i0]?.[1] ?? 0;
  const v1 = s7.bcws[i0 + 1]?.[1] ?? v0;
  const tipV = v0 + (v1 - v0) * frac;
  const tipX = PL + p * (PR - PL);
  const tipY = y(tipV);
  const tipMonth = (months[Math.round(fi)] ?? "").toUpperCase();
  const drawing = !isStatic && chartOn && p > 0 && p < 1;
  // Revealed (in CSS) once the S-curve has finished drawing; payments line draws in the meantime.
  const revealStyle = (afterS: number) => ({
    opacity: p >= 1 ? 1 : 0,
    transition: isStatic ? "none" : `opacity 600ms ease ${afterS}s`,
  });

  const fill = <path d={costArea} className="fill-amber/12" clipPath={`url(#${clipPay})`} />;

  return (
    <>
      <Title>{s7.title}</Title>
      <Build at={1} step={step} className="absolute inset-0">
        <StageCard />
      </Build>
      <Build at={1} step={step} i={1} className="absolute top-[272px] left-[150px]">
        <div className="flex items-baseline gap-6">
          <span className="k-label text-[20px] text-ink-2">{s7.bac.label}</span>
          <span className="text-[120px] leading-none font-semibold tracking-[-0.035em] text-ink tabular-nums">
            <CountText text={s7.bac.value} active={step >= 1} delay={AFTER_TITLE} />
          </span>
        </div>
        <div className="k-small mt-3 text-ink-2">{s7.bac.caption}</div>
      </Build>

      <svg className="pointer-events-none absolute inset-0" width={1920} height={1080} viewBox="0 0 1920 1080">
        <defs>
          <clipPath id={clipPay}>
            <path d={above} />
          </clipPath>
          <clipPath id={clipDraw}>
            <rect x={PL - 10} y={PT - 60} width={Math.max(tipX - PL + 10, 0)} height={PB - PT + 80} />
          </clipPath>
        </defs>
        {chartOn && (
          <g>
            {s7.yTicks.map((v) => (
              <g key={v}>
                <line x1={PL} x2={PR} y1={y(v)} y2={y(v)} className="stroke-hair" strokeWidth={1} />
                <text x={150} y={y(v) + 6} className="k-label fill-ink-2 text-[16px]">
                  €{v}K
                </text>
              </g>
            ))}
            <line x1={PL} x2={PR} y1={PB} y2={PB} className="stroke-hair" strokeWidth={1} />
            {months.map((m, i) =>
              i % 2 === 0 ? (
                <text key={m} x={xi(i)} y={PB + 40} textAnchor="middle" className="k-label fill-ink-2 text-[16px]">
                  {m}
                </text>
              ) : null,
            )}
          </g>
        )}
        {chartOn && <g style={revealStyle(1.6)}>{fill}</g>}
        {chartOn && (
          <path d={cost} clipPath={`url(#${clipDraw})`} className="fill-none stroke-ink" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        )}
        <DrawPath d={pay} active={chartOn && p >= 1} className="stroke-mint [stroke-width:3px]" duration={1.2} />
        {chartOn && (
          <g style={revealStyle(1.1)}>
            {s7.payments.map((pm, idx) => {
              const x = xm(pm.month);
              const last = idx === s7.payments.length - 1;
              return (
                <text
                  key={pm.label}
                  x={last ? x - 14 : x + 14}
                  y={last ? y(pm.value) + 34 : y(pm.value) - 14}
                  textAnchor={last ? "end" : "start"}
                  className="k-label fill-mint text-[16px]"
                >
                  {pm.label}
                </text>
              );
            })}
            <text x={PR + 16} y={y(pre[pre.length - 1]?.value ?? 0) + 24} className="k-label fill-mint text-[16px]">
              {s7.lineLabels.payments}
            </text>
            <text x={preX - 200} y={preY - 4} className="k-label fill-amber text-[16px] normal-case">
              {preA} ·
            </text>
            <text x={preX - 200} y={preY + 24} className="k-label fill-amber text-[16px] normal-case">
              {preB}
            </text>
          </g>
        )}
        {chartOn && p >= 1 && (
          <text x={PR + 16} y={y(s7.bcws[n - 1]?.[1] ?? 0) - 10} className="k-label fill-ink text-[16px]">
            {s7.lineLabels.bcws}
          </text>
        )}
        {drawing && <circle cx={tipX} cy={tipY} r={7} className="fill-blue" />}
      </svg>

      {drawing && (
        <div
          className="k-card k-pill k-label pointer-events-none absolute text-ink"
          style={{ left: tipX, top: tipY - 64, transform: "translateX(-50%)" }}
        >
          <span className="text-blue">{tipMonth}</span>
          <span>€{Math.round(tipV)}K</span>
        </div>
      )}

      <Build at={3} step={step} className="absolute top-[40px] right-[140px]">
        <Capture slot={s7.capture} width={480} />
      </Build>
    </>
  );
}
