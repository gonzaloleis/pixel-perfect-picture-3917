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
    const anchor = clamp(clamp(a0 + span / 2, -72, 80), a0 + 6, a1 - 6);
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
          <span className="k-label text-ink-2">{s.label}</span>
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

