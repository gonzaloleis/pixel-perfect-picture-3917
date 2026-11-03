/* ---------------- Slide 4: milestone cards over a month ruler ---------------- */

const t = (d: string) => new Date(d + "T00:00:00Z").getTime();
const RX0 = 160;
const RX1 = 1760;
const R_T0 = t(s4.ruler.from);
const R_T1 = t(s4.ruler.to);
const rx = (d: string) => RX0 + ((t(d) - R_T0) / (R_T1 - R_T0)) * (RX1 - RX0);

const CARD_TOP = 256;
const CARD_H = 300;
const CARD_W = 386;
const CARD_GAP = 32;
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
          const ax = Math.min(Math.max(dateX, left + 48), left + CARD_W - 48);
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
            className="k-card absolute flex flex-col p-9"
            style={{ left: CARD_LEFT + idx * (CARD_W + CARD_GAP), top: CARD_TOP, width: CARD_W, height: CARD_H }}
          >
            <div className="text-[46px] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums">{m.title}</div>
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

