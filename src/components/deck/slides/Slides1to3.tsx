import { s1, s2, s3 } from "@/content/slides";
import { Build, Capture, CountText, Title, accentText, type SlideProps } from "../primitives";
import { cn } from "@/lib/utils";

export function Slide1({ step }: SlideProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <Build at={1} step={step}>
        <h1 className="k-display text-ink">{s1.title}</h1>
      </Build>
      <Build at={1} step={step} i={1}>
        <p className="k-lead mt-8 font-normal text-ink-2">{s1.subtitle}</p>
      </Build>
      <Build at={2} step={step} className="mt-24 flex flex-col items-center gap-5">
        <div className="k-label text-[20px] text-ink">{s1.baseline}</div>
        <div className="k-small text-ink-2">{s1.credit}</div>
      </Build>
    </div>
  );
}

export function Slide2({ step }: SlideProps) {
  const cols = "grid grid-cols-[400px_560px_1fr] items-baseline";
  return (
    <>
      <Title>{s2.title}</Title>
      <div className="absolute top-[290px] left-[140px] w-[1640px]">
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
            className={cn(cols, "border-b border-hair py-[22px]")}
          >
            <div className="k-body text-ink-2">{r.item}</div>
            <div className="k-body text-ink">
              {r.count ? <CountText text={r.offer} active={step >= r.step} /> : r.offer}
            </div>
            <div className={cn("k-body", r.accent ? accentText[r.accent] : "text-ink")}>
              {r.count ? <CountText text={r.contract} active={step >= r.step} /> : r.contract}
            </div>
          </Build>
        ))}
      </div>
      <Build at={1} step={step} i={2} className="k-small absolute top-[930px] left-[140px] text-ink-2">
        {s2.footer}
      </Build>
    </>
  );
}

export function Slide3({ step }: SlideProps) {
  return (
    <>
      <Title>{s3.title}</Title>
      <div className="absolute top-[268px] left-[140px] w-[660px]">
        {s3.phases.map(([n, name], idx) => (
          <Build
            key={n}
            at={1}
            step={step}
            i={idx}
            className="flex h-[49px] items-center gap-7 border-b border-hair first:border-t"
          >
            <span className="k-label w-9 text-ink-2">{n}</span>
            <span className="text-[25px] leading-none text-ink">{name}</span>
          </Build>
        ))}
        <div className="mt-8 grid grid-cols-3 gap-5">
          {s3.stats.map((s, idx) => (
            <Build key={s.unit} at={3} step={step} i={idx} className="k-card flex flex-col gap-2 px-6 py-5">
              <span className="k-figure text-ink">
                <CountText text={s.value} active={step >= 3} />
              </span>
              <span className="k-small text-ink-2">{s.unit}</span>
            </Build>
          ))}
        </div>
      </div>
      <Build at={2} step={step} className="absolute top-[268px] left-[840px]">
        <Capture slot={s3.capture} width={940} />
      </Build>
    </>
  );
}
