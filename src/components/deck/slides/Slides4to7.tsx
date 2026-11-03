import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion, type MotionStyle } from "framer-motion";
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
  formatEs,
  SPRING,
  StageCard,
  Title,
  useIsStatic,
  type SlideProps,
} from "../primitives";

/* ---------------- shared ---------------- */

function GrowBar({
  active,
  fraction,
  className,
  delay = 0,
  duration,
}: {
  active: boolean;
  fraction: number;
  className?: string;
  delay?: number;
  /** Seconds; when set, grows with a soft ease-out instead of the spring. */
  duration?: number;
}) {
  const isStatic = useIsStatic();
  if (isStatic) return <div className={className} style={{ width: `${fraction * 100}%` }} />;
  return (
    <motion.div
      className={cn("origin-left", className)}
      style={{ width: `${fraction * 100}%` }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: active ? 1 : 0 }}
      transition={duration ? { duration, ease: [0.16, 1, 0.3, 1], delay } : { ...SPRING, delay }}
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

/* ---------------- Slide 4: milestone cards over a month ruler ---------------- */

const t = (d: string) => new Date(d + "T00:00:00Z").getTime();
const RX0 = 160;
const RX1 = 1760;
const R_T0 = t(s4.ruler.from);
const R_T1 = t(s4.ruler.to);
const rx = (d: string) => RX0 + ((t(d) - R_T0) / (R_T1 - R_T0)) * (RX1 - RX0);

const CARD_TOP = 256;
const CARD_H = 300;
const CARD_GAP = 24;
const CARD_W = Math.floor((RX1 + 20 - 140 - CARD_GAP * (s4.milestones.length - 1)) / s4.milestones.length);
const CARD_LEFT = 140;
const RULER_Y = 650;
const LANE_TOP = [704, 764] as const;
const LANE_H = 52;
const BAND_TOP = 600;
const BAND_BOTTOM = 826;
const RULER_DRAW_S = 1.4;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function rulerMonths() {
  const out: { iso: string; m: number; y: number }[] = [];
  const d = new Date(s4.ruler.from + "T00:00:00Z");
  while (d.getTime() < R_T1) {
    out.push({ iso: d.toISOString().slice(0, 10), m: d.getUTCMonth(), y: d.getUTCFullYear() });
    d.setUTCMonth(d.getUTCMonth() + 1);
  }
  return out;
}

const bandClass = { grey: "bg-ink/[0.06]", amber: "bg-amber/15" } as const;
const laneClass = ["bg-mesh-1", "bg-mesh-2"] as const;

function RiseCard({
  visible,
  delay,
  className,
  style,
  children,
}: {
  visible: boolean;
  delay: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const isStatic = useIsStatic();
  if (isStatic)
    return visible ? (
      <div className={className} style={style}>
        {children}
      </div>
    ) : null;
  return (
    <motion.div
      className={className}
      style={style as MotionStyle}
      initial={{ opacity: 0, y: 28 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ ...SPRING, opacity: { duration: 0.4, ease: EASE, delay: visible ? delay : 0 }, delay: visible ? delay : 0 }}
      aria-hidden={!visible}
    >
      {children}
    </motion.div>
  );
}

export function Slide4({ step }: SlideProps) {
  const isStatic = useIsStatic();
  const months = rulerMonths();
  const markerX = rx(s4.marker.date);
  const rulerDone = AFTER_TITLE + RULER_DRAW_S;

  const ruler = (
    <div className="absolute inset-0">
      {s4.phases.map((ph) => {
        const left = rx(ph.from);
        const width = rx(ph.to) - left - 4;
        return (
          <div
            key={ph.name}
            className={cn("absolute flex items-center rounded-[14px] px-4 text-[18px] leading-[1.1] font-medium text-ink", laneClass[ph.lane])}
            style={{ left: left + 2, top: LANE_TOP[ph.lane], width, height: LANE_H }}
          >
            {ph.name}
          </div>
        );
      })}
      {s4.bands.map((b) => (
        <div
          key={b.from}
          className={cn("pointer-events-none absolute rounded-[8px]", bandClass[b.tone])}
          style={{ left: rx(b.from), width: Math.max(rx(b.to) - rx(b.from), 4), top: BAND_TOP, height: BAND_BOTTOM - BAND_TOP }}
        />
      ))}
      <div className="absolute h-px bg-ink/20" style={{ left: RX0, width: RX1 - RX0, top: RULER_Y }} />
      {months.map((m, i) => (
        <div key={m.iso}>
          <div className="absolute w-px bg-ink/20" style={{ left: rx(m.iso), top: RULER_Y, height: i % 2 === 0 ? 10 : 6 }} />
          {i % 2 === 0 && (
            <div className="k-label absolute font-normal text-ink-2" style={{ left: rx(m.iso) + 6, top: RULER_Y + 14, fontSize: 18 }}>
              {MONTHS[m.m]}
            </div>
          )}
          {(i === 0 || m.m === 0) && (
            <div className="k-label absolute text-ink" style={{ left: i === 0 ? 214 : rx(m.iso) + 6, top: RULER_Y - 36, fontSize: 18 }}>
              {m.y}
            </div>
          )}
        </div>
      ))}
      <div className="absolute w-[2px] rounded-full bg-amber" style={{ left: markerX - 1, top: BAND_TOP, height: BAND_BOTTOM - BAND_TOP }} />
    </div>
  );

  return (
    <>
      <Title>{s4.title}</Title>

      {isStatic ? (
        ruler
      ) : (
        <motion.div
          className="absolute inset-0"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: RULER_DRAW_S, ease: EASE, delay: AFTER_TITLE }}
        >
          {ruler}
        </motion.div>
      )}

      <Build at={1} step={step} delay={RULER_DRAW_S} className="absolute flex items-center gap-10" style={{ left: RX0, top: 856 }}>
        <span className="flex items-center gap-3">
          <span className="h-[18px] w-[34px] rounded-[5px] bg-ink/[0.08]" />
          <span className="k-label font-normal text-ink-2">{s4.legend.grey}</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="h-[18px] w-[34px] rounded-[5px] bg-amber/25" />
          <span className="k-label font-normal text-ink-2">{s4.legend.amber}</span>
        </span>
      </Build>
      <Build at={1} step={step} delay={RULER_DRAW_S} className="k-label absolute whitespace-nowrap text-amber" style={{ right: 1920 - RX1, top: 856 }}>
        {s4.marker.label}
      </Build>

      <svg className="pointer-events-none absolute inset-0" width={1920} height={1080} viewBox="0 0 1920 1080">
        {s4.milestones.map((m, idx) => {
          const visible = step >= m.step;
          const left = CARD_LEFT + idx * (CARD_W + CARD_GAP);
          const dateX = rx(m.date);
          const ax = Math.min(Math.max(dateX, left + 40), left + CARD_W - 40);
          const y0 = CARD_TOP + CARD_H;
          const d = ax === dateX ? `M ${ax} ${y0} V ${RULER_Y}` : `M ${ax} ${y0} V ${y0 + 22} H ${dateX} V ${RULER_Y}`;
          const delay = (m.step === 1 ? rulerDone : 0) + 0.25;
          return (
            <g key={m.date}>
              <DrawPath d={d} active={visible} className="stroke-ink/30 [stroke-width:1.5px]" duration={0.6} delay={delay} />
              {visible &&
                (isStatic ? (
                  <circle cx={dateX} cy={RULER_Y} r={7} className="fill-ink" />
                ) : (
                  <motion.circle
                    cx={dateX}
                    cy={RULER_Y}
                    r={7}
                    className="fill-ink"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: delay + 0.5 }}
                  />
                ))}
            </g>
          );
        })}
      </svg>

      {s4.milestones.map((m, idx) => {
        const visible = step >= m.step;
        const delay = m.step === 1 ? rulerDone : 0;
        const last = idx === s4.milestones.length - 1;
        return (
          <RiseCard
            key={m.date}
            visible={visible}
            delay={delay}
            className="k-card absolute flex flex-col p-7"
            style={{ left: CARD_LEFT + idx * (CARD_W + CARD_GAP), top: CARD_TOP, width: CARD_W, height: CARD_H }}
          >
            <div className="text-[38px] leading-none whitespace-nowrap font-semibold tracking-[-0.03em] text-ink tabular-nums">{m.title}</div>
            <div className="mt-5 flex flex-col gap-1">
              {m.lines.map((l, li) => (
                <div key={l} className={cn("k-small", li === 0 ? "font-medium text-ink" : "text-ink-2")}>
                  {l}
                </div>
              ))}
            </div>
            <div className="mt-auto">
              {last ? (
                <Build at={m.step} step={step} delay={0.7} as="span" className="inline-block">
                  <Pill accent={m.accent}>{m.pill}</Pill>
                </Build>
              ) : (
                <Pill accent={m.accent}>{m.pill}</Pill>
              )}
            </div>
          </RiseCard>
        );
      })}
    </>
  );
}

/* ---------------- Slide 5: resources ---------------- */

export function Slide5({ step }: SlideProps) {
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
            className={cn("flex gap-5 rounded-[20px] px-8 py-6", c.accent === "mint" ? "bg-mint/10" : "bg-amber/10")}
          >
            <span className={cn("mt-[12px] h-[10px] w-[10px] shrink-0 rounded-full", c.accent === "mint" ? "bg-mint" : "bg-amber")} />
            <p className="k-small text-ink">{c.text}</p>
          </Build>
        ))}
      </div>
    </>
  );
}

/* ---------------- Slide 6: cost breakdown ---------------- */

const CX = 430;
const CY = 610;
const R = 190;
const RING = 44;
const LABEL_X = CX + R + 150;

function arc(a0: number, a1: number, r = R) {
  const rad = (a: number) => (a * Math.PI) / 180;
  const p = (a: number) => [CX + r * Math.cos(rad(a)), CY + r * Math.sin(rad(a))];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

export function Slide6({ step }: SlideProps) {
  const sum = s6.segments.reduce((a, s) => a + s.value, 0);
  let a = s6.donutStartDeg;
  const segs = s6.segments.map((s) => {
    const span = (s.value / sum) * 360;
    const a0 = a;
    const a1 = a + span;
    a += span;
    // Leader anchor on the right half of the ring, so the leader never crosses the ring.
    const n0 = a0 > 180 ? a0 - 360 : a0;
    const anchor = clamp(clamp(n0 + span / 2, -72, 80), n0 + 6, n0 + span - 6);
    const rad = (anchor * Math.PI) / 180;
    const ro = R + RING / 2 + 6;
    return { ...s, a0: a0 + 1.2, a1: a1 - 1.2, ax: CX + ro * Math.cos(rad), ay: CY + ro * Math.sin(rad) };
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
          <circle cx={CX} cy={CY} r={R} className="fill-none stroke-inset" strokeWidth={RING} />
          {segs.map((s, idx) => (
            <g key={s.name} style={{ opacity: s.tone }}>
              <DrawPath d={arc(s.a0, s.a1)} active={step >= 1} className="stroke-blue [stroke-width:44px] [stroke-linecap:butt]" duration={0.8} delay={AFTER_TITLE + idx * 0.25} />
            </g>
          ))}
          {segs.map((s, idx) => (
            <g key={s.name + "leader"}>
              <DrawPath d={`M ${s.ax} ${s.ay} H ${LABEL_X - 18}`} active={step >= 1} className="stroke-ink/30 [stroke-width:1.5px]" duration={0.5} delay={AFTER_TITLE + 0.9 + idx * 0.12} />
              {step >= 1 && <circle cx={s.ax} cy={s.ay} r={4} className="fill-ink/50" />}
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
      {segs.map((s, idx) => (
        <Build key={s.name + "l"} at={1} step={step} delay={0.9} i={idx} className="absolute flex flex-col gap-1 whitespace-nowrap" style={{ left: LABEL_X, top: s.ay - 34 }}>
          <span className="k-small font-medium text-ink">{s.name}</span>
          <span className="k-label text-ink-2 tabular-nums">{s.label}</span>
        </Build>
      ))}

      <Build at={2} step={step} className="absolute top-[290px] left-[1120px] w-[650px]">
        <div className="flex h-[30px] w-full gap-[4px]">
          <GrowBar active={step >= 2} fraction={s6.stack.direct.value / total} duration={1.6} className="h-full rounded-l-full bg-blue" />
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
  const [preA = "", preB = ""] = s7.prefinancing.label.split(/(?<=:) /);
  const preNextX = xm(s7.payments.find((pm) => months.indexOf(pm.month) > preIdx)?.month ?? s7.prefinancing.month);

  // Floating label follows the drawing tip
  const fi = p * (n - 1);
  const i0 = Math.min(Math.floor(fi), n - 2);
  const frac = fi - i0;
  const v0 = s7.bcws[i0]?.[1] ?? 0;
  const v1 = s7.bcws[i0 + 1]?.[1] ?? v0;
  const tipV = v0 + (v1 - v0) * frac;
  const tipX = PL + p * (PR - PL);
  const tipY = y(tipV);
  const tipMonth = months[Math.round(fi)] ?? "";
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
                <text x={PL - 16} y={y(v) + 6} textAnchor="end" className="k-label fill-ink-2 tabular-nums" style={{ fontSize: 18 }}>
                  {v === 0 ? "0\u00A0€" : `${formatEs(v)}\u00A0k€`}
                </text>
              </g>
            ))}
            <line x1={PL} x2={PR} y1={PB} y2={PB} className="stroke-hair" strokeWidth={1} />
            {months.map((m, i) =>
              i % 2 === 0 ? (
                <text key={m} x={xi(i)} y={PB + 40} textAnchor="middle" className="k-label fill-ink-2 tabular-nums" style={{ fontSize: 18 }}>
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
            <text x={PR + 16} y={y(pre[pre.length - 1]?.value ?? 0) + 24} className="k-label fill-mint" style={{ fontSize: 18 }}>
              {s7.lineLabels.payments}
            </text>
          </g>
        )}
        {chartOn && p >= 1 && (
          <text x={PR + 16} y={y(s7.bcws[n - 1]?.[1] ?? 0) - 10} className="k-label fill-ink" style={{ fontSize: 18 }}>
            {s7.lineLabels.bcws}
          </text>
        )}
        {drawing && <circle cx={tipX} cy={tipY} r={7} className="fill-blue" />}
      </svg>

      {/* Payment labels on small white pills, on the free side of each step */}
      {chartOn &&
        s7.payments.map((pm, idx) => {
          const x = xm(pm.month);
          const yy = y(pm.value);
          const last = idx === s7.payments.length - 1;
          let pos: CSSProperties;
          if (last) {
            pos = { right: 1920 - (x - 14), top: yy + 30 };
          } else if (y(0) - yy >= 60) {
            pos = { left: x + 14, top: yy + 14 };
          } else {
            const from = months.indexOf(pm.month);
            const j = s7.bcws.findIndex(([, v], k) => k > from && y(v) <= yy - 70);
            pos = { left: xi(Math.max(j, from + 1)) + 8, top: yy - 48 };
          }
          return (
            <div
              key={pm.label}
              className="k-label pointer-events-none absolute rounded-[10px] bg-surface px-3 py-[6px] whitespace-nowrap text-mint shadow-[var(--shadow-card)]"
              style={{ ...pos, fontSize: 18, ...revealStyle(1.1) }}
            >
              {pm.label}
            </div>
          );
        })}
      {chartOn && (
        <div
          className="k-label pointer-events-none absolute rounded-[10px] bg-surface px-3 py-[6px] text-right whitespace-nowrap text-amber shadow-[var(--shadow-card)]"
          style={{ right: 1920 - (preNextX - 14), top: preY - 12, fontSize: 18, lineHeight: 1.25, ...revealStyle(1.4) }}
        >
          <div>{preA}</div>
          <div>{preB}</div>
        </div>
      )}

      {drawing && (
        <div className="k-card k-pill k-label pointer-events-none absolute text-ink" style={{ left: tipX, top: tipY - 64, transform: "translateX(-50%)" }}>
          <span className="text-blue">{tipMonth}</span>
          <span>
            {formatEs(Math.round(tipV))}
            {"\u00A0"}k€
          </span>
        </div>
      )}

      <Build at={3} step={step} className="absolute top-[272px] right-[140px]">
        <Capture slot={s7.capture} width={340} />
      </Build>
    </>
  );
}
