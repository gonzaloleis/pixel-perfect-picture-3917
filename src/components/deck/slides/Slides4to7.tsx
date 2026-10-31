import { useId } from "react";
import { motion } from "framer-motion";
import { s4, s5, s6, s7 } from "@/content/slides";
import { cn } from "@/lib/utils";
import { Build, Capture, CountText, DrawPath, EASE, Title, accentText, useIsStatic, type SlideProps } from "../primitives";

/* ---------------- shared ---------------- */

function GrowBar({ active, fraction, className, delay = 0 }: { active: boolean; fraction: number; className?: string; delay?: number }) {
  const isStatic = useIsStatic();
  if (isStatic) return <div className={className} style={{ width: `${fraction * 100}%` }} />;
  return (
    <motion.div
      className={cn("origin-left", className)}
      style={{ width: `${fraction * 100}%` }}
      initial={false}
      animate={{ scaleX: active ? 1 : 0 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    />
  );
}

/* ---------------- Slide 4: timeline ---------------- */

const X0 = 140;
const X1 = 1780;
const AXIS_Y = 620;
const t = (d: string) => new Date(d + "T00:00:00Z").getTime();
const T0 = t(s4.start.date);
const T1 = t(s4.end.date);
const dx = (d: string) => X0 + ((t(d) - T0) / (T1 - T0)) * (X1 - X0);

const bandFill = { grey: "fill-ink/[0.07]", amber: "fill-amber/25", ink: "fill-ink/[0.09]" } as const;

export function Slide4({ step }: SlideProps) {
  const isStatic = useIsStatic();
  const progress = s4.axisProgress[Math.min(step, s4.axisProgress.length) - 1] ?? 1;
  const markerX = dx(s4.marker.date);

  return (
    <>
      <Title>{s4.title}</Title>
      <svg className="absolute inset-0" width={1920} height={1080} viewBox="0 0 1920 1080">
        {s4.bands.map((b) => {
          const visible = step >= b.step;
          const rect = (
            <rect
              x={dx(b.from)}
              y={430}
              width={Math.max(dx(b.to) - dx(b.from), 2)}
              height={370}
              className={bandFill[b.tone]}
            />
          );
          if (isStatic) return visible ? <g key={b.from}>{rect}</g> : null;
          return (
            <motion.g key={b.from} initial={false} animate={{ opacity: visible ? 1 : 0 }} transition={{ duration: 0.6, ease: EASE }}>
              {rect}
            </motion.g>
          );
        })}
        <line x1={X0} x2={X1} y1={AXIS_Y} y2={AXIS_Y} className="stroke-hair" strokeWidth={1} />
        {isStatic ? (
          <line x1={X0} x2={X0 + (X1 - X0) * progress} y1={AXIS_Y} y2={AXIS_Y} className="stroke-ink" strokeWidth={2} />
        ) : (
          <motion.line
            x1={X0}
            y1={AXIS_Y}
            y2={AXIS_Y}
            className="stroke-ink"
            strokeWidth={2}
            initial={false}
            animate={{ x2: X0 + (X1 - X0) * progress }}
            transition={{ duration: 1.1, ease: EASE }}
          />
        )}
        {step >= s4.marker.step && (
          <line x1={markerX} x2={markerX} y1={384} y2={800} className="stroke-amber" strokeWidth={2} />
        )}
        {s4.milestones.map((m) =>
          step >= m.step ? (
            <circle key={m.date} cx={dx(m.date)} cy={AXIS_Y} r={9} className="fill-stage stroke-ink" strokeWidth={2} />
          ) : null,
        )}
      </svg>

      {/* Axis end labels */}
      <div className="k-label absolute left-[140px] text-ink-2" style={{ top: AXIS_Y - 44 }}>
        {s4.start.label}
      </div>
      <div className="k-label absolute right-[140px] top-[812px] text-ink-2">{s4.end.label}</div>

      {/* Band labels: grey ones below the bands, coloured ones above */}
      {s4.bands.map((b) => (
        <Build
          key={b.from + "l"}
          at={b.step}
          step={step}
          className={cn("k-label absolute whitespace-nowrap", b.tone === "amber" ? "text-amber" : b.tone === "ink" ? "text-ink" : "text-ink-2")}
          style={{ left: dx(b.from), top: b.tone === "grey" ? 812 : 398 }}
        >
          {b.label}
        </Build>
      ))}

      <Build
        at={s4.marker.step}
        step={step}
        className="k-label absolute whitespace-nowrap text-amber"
        style={{ right: 1920 - markerX, top: 352 }}
      >
        {s4.marker.label}
      </Build>

      {s4.milestones.map((m) => {
        const x = dx(m.date);
        const pos = m.align === "start" ? { left: x - 4 } : { right: 1920 - x - 4 };
        const textAlign = m.align === "start" ? "text-left" : "text-right";
        return (
          <div key={m.date}>
            <Build
              at={m.step}
              step={step}
              i={1}
              className={cn("k-label absolute whitespace-nowrap", accentText[m.accent], textAlign)}
              style={{ ...pos, top: AXIS_Y + 26 }}
            >
              {m.slack}
            </Build>
            <Build
              at={m.step}
              step={step}
              className={cn("absolute w-[460px]", textAlign)}
              style={m.side === "above" ? { ...pos, bottom: 1080 - (AXIS_Y - 34) } : { ...pos, top: AXIS_Y + 82 }}
            >
              <div className="k-label text-ink-2">{m.head}</div>
              <div className="k-small mt-2 text-ink">{m.text}</div>
            </Build>
          </div>
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
      <div className="absolute top-[290px] left-[140px] w-[840px]">
        {s5.units.map((u, idx) => (
          <Build key={u.name} at={1} step={step} i={idx} className="flex h-[64px] items-center border-b border-hair">
            <div className="k-small w-[250px] shrink-0 text-ink-2">{u.name}</div>
            <div className="flex flex-1 items-center gap-5">
              <div className="w-[430px]">
                <GrowBar active={step >= 1} fraction={u.hours / max} delay={idx * 0.07} className="h-[12px] rounded-full bg-ink" />
              </div>
            </div>
            <div className="k-label w-[140px] shrink-0 text-right text-ink">
              <CountText text={u.label} active={step >= 1} />
            </div>
          </Build>
        ))}
      </div>
      <Build at={2} step={step} className="absolute top-[268px] left-[1020px]">
        <Capture slot={s5.capture} width={760} />
      </Build>
      <div className="absolute top-[796px] left-[140px] grid w-[1640px] grid-cols-2 gap-10">
        {s5.cards.map((c, idx) => (
          <Build
            key={c.text}
            at={3}
            step={step}
            i={idx}
            className={cn("k-card flex gap-6 px-8 py-7", c.accent === "mint" ? "border-mint/40" : "border-amber/40")}
          >
            <span className={cn("mt-[14px] h-[10px] w-[10px] shrink-0 rounded-full", c.accent === "mint" ? "bg-mint" : "bg-amber")} />
            <p className="k-small text-ink">{c.text}</p>
          </Build>
        ))}
      </div>
    </>
  );
}

/* ---------------- Slide 6: cost breakdown ---------------- */

const CX = 600;
const CY = 600;
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
    const seg = { ...s, a0: a + 0.8, a1: a + span - 0.8, mid: a + span / 2 };
    a += span;
    return seg;
  });
  const total = s6.stack.direct.value + s6.stack.indirect.value;

  return (
    <>
      <Title>{s6.title}</Title>
      <svg className="absolute inset-0" width={1920} height={1080} viewBox="0 0 1920 1080">
        {segs.map((s, idx) => (
          <g key={s.name} style={{ opacity: s.tone }}>
            <DrawPath d={arc(s.a0, s.a1)} active={step >= 1} className="stroke-ink [stroke-width:40px]" duration={0.8} delay={idx * 0.25} />
          </g>
        ))}
      </svg>
      <Build at={1} step={step} className="absolute flex w-[300px] flex-col items-center text-center" style={{ left: CX - 150, top: CY - 50 }}>
        <span className="k-figure text-ink">
          <CountText text={s6.centre.value} active={step >= 1} />
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
            i={idx + 2}
            className={cn("absolute flex flex-col gap-1 whitespace-nowrap", right ? "items-start" : "items-end")}
            style={{ left: lx, top: ly, transform: `translate(${right ? "0" : "-100%"}, -50%)` }}
          >
            <span className="k-small text-ink">{s.name}</span>
            <span className="k-label text-ink-2">{s.label}</span>
          </Build>
        );
      })}

      {/* Stacked bar */}
      <Build at={2} step={step} className="absolute top-[290px] left-[1100px] w-[680px]">
        <div className="flex h-[28px] w-full gap-[3px]">
          <div className="h-full rounded-l-md bg-ink" style={{ width: `${(s6.stack.direct.value / total) * 100}%` }} />
          <div className="h-full flex-1 rounded-r-md bg-ink-2" />
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
      <Build at={3} step={step} className="absolute top-[580px] left-[1100px]">
        <Capture slot={s6.capture} width={680} />
      </Build>
    </>
  );
}

/* ---------------- Slide 7: S-curve ---------------- */

const PL = 230;
const PR = 1680;
const PT = 500;
const PB = 900;

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
  const clipId = "k-above-pay-" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const n = s7.bcws.length;
  const months = s7.bcws.map(([m]) => m);
  const xi = (i: number) => PL + (i * (PR - PL)) / (n - 1);
  const xm = (m: string) => xi(Math.max(months.indexOf(m), 0));
  const y = (v: number) => PB - (v / s7.yMax) * (PB - PT);

  const pts = s7.bcws.map(([, v], i) => [xi(i), y(v)] as [number, number]);
  const cost = smooth(pts);
  const costArea = `${cost} L ${xi(n - 1)} ${PB} L ${xi(0)} ${PB} Z`;

  let pay = `M ${xi(0)} ${y(0)}`;
  s7.payments.forEach((p) => {
    pay += ` H ${xm(p.month)} V ${y(p.value)}`;
  });
  // Region above the payments step line (used to clip the pre-financing fill).
  let above = `M ${xi(0)} ${PT - 40} L ${xi(0)} ${y(0)}`;
  s7.payments.forEach((p) => {
    const x = xm(p.month);
    above += ` H ${x} V ${y(p.value)}`;
  });
  above += ` H ${xi(n - 1) + 2} V ${PT - 40} Z`;

  const pre = s7.payments;
  const preX = xm(s7.prefinancing.month);
  const preIdx = months.indexOf(s7.prefinancing.month);
  const prePaid = [...pre].reverse().find((p) => months.indexOf(p.month) <= preIdx)?.value ?? 0;
  const preY = (y(s7.bcws[preIdx]?.[1] ?? 0) + y(prePaid)) / 2;
  const [preA, preB] = s7.prefinancing.label.split(" · ");

  const chartOn = step >= 2;
  const fill = (
    <path d={costArea} className="fill-amber/12" clipPath={`url(#${clipId})`} />
  );

  return (
    <>
      <Title>{s7.title}</Title>
      <Build at={1} step={step} className="absolute top-[236px] left-[140px]">
        <div className="flex items-baseline gap-8">
          <span className="k-label text-[20px] text-ink-2">{s7.bac.label}</span>
          <span className="text-[140px] leading-none font-medium tracking-[-0.03em] text-ink tabular-nums">
            <CountText text={s7.bac.value} active={step >= 1} />
          </span>
        </div>
        <div className="k-small mt-3 text-ink-2">{s7.bac.caption}</div>
      </Build>

      <svg className="absolute inset-0" width={1920} height={1080} viewBox="0 0 1920 1080">
        <defs>
          <clipPath id={clipId}>
            <path d={above} />
          </clipPath>
        </defs>
        {chartOn && (
          <g>
            {s7.yTicks.map((v) => (
              <g key={v}>
                <line x1={PL} x2={PR} y1={y(v)} y2={y(v)} className="stroke-hair" strokeWidth={1} />
                <text x={140} y={y(v) + 6} className="k-label fill-ink-2 text-[17px]">
                  €{v}K
                </text>
              </g>
            ))}
            <line x1={PL} x2={PR} y1={PB} y2={PB} className="stroke-hair" strokeWidth={1} />
            {months.map((m, i) =>
              i % 2 === 0 ? (
                <text key={m} x={xi(i)} y={PB + 40} textAnchor="middle" className="k-label fill-ink-2 text-[17px]">
                  {m}
                </text>
              ) : null,
            )}
          </g>
        )}
        {chartOn &&
          (isStatic ? (
            fill
          ) : (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.3 }}>
              {fill}
            </motion.g>
          ))}
        <DrawPath d={cost} active={chartOn} className="stroke-ink [stroke-width:2.5px]" duration={1.8} />
        <DrawPath d={pay} active={chartOn} className="stroke-mint [stroke-width:2px]" duration={1.8} delay={0.2} />
        {chartOn && (
          <g>
            {s7.payments.map((p, idx) => {
              const x = xm(p.month);
              const last = idx === s7.payments.length - 1;
              return (
                <text
                  key={p.label}
                  x={last ? x - 14 : x + 14}
                  y={last ? y(p.value) + 34 : y(p.value) - 14}
                  textAnchor={last ? "end" : "start"}
                  className="k-label fill-mint text-[17px]"
                >
                  {p.label}
                </text>
              );
            })}
            <text x={PR + 16} y={y(s7.bcws[n - 1]?.[1] ?? 0) - 10} className="k-label fill-ink text-[17px]">
              {s7.lineLabels.bcws}
            </text>
            <text x={PR + 16} y={y(pre[pre.length - 1]?.value ?? 0) + 24} className="k-label fill-mint text-[17px]">
              {s7.lineLabels.payments}
            </text>
            <text x={preX - 200} y={preY - 4} className="k-label fill-amber text-[17px]">
              {preA} ·
            </text>
            <text x={preX - 200} y={preY + 24} className="k-label fill-amber text-[17px]">
              {preB}
            </text>
          </g>
        )}
      </svg>

      <Build at={3} step={step} className="absolute top-[112px] left-[1260px]">
        <Capture slot={s7.capture} width={520} />
      </Build>
    </>
  );
}
