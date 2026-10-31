import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { slides, TIMER_TARGET_SECONDS, TIMER_WARNING_SECONDS } from "@/content/slides";
import { openChannel, type DeckMessage } from "@/lib/deck-channel";
import { nextPos, type DeckPos } from "@/lib/deck-nav";
import { ScaledStage } from "@/components/deck/ScaledStage";
import { SlideFrame } from "@/components/deck/registry";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/presenter")({
  head: () => ({
    meta: [
      { title: "Presenter view — CIPRI Project Plan" },
      { name: "description", content: "Speaker notes, next slide and timer for the CIPRI keynote." },
      { property: "og:title", content: "Presenter view — CIPRI Project Plan" },
      { property: "og:description", content: "Speaker notes, next slide and timer for the CIPRI keynote." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Presenter,
});

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function Presenter() {
  const [pos, setPos] = useState<DeckPos>({ slide: 1, step: 1 });
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const chan = useRef<BroadcastChannel | null>(null);
  const startRef = useRef(0);
  const baseRef = useRef(0);

  useEffect(() => {
    const ch = openChannel();
    chan.current = ch;
    if (!ch) return;
    ch.onmessage = (e: MessageEvent<DeckMessage>) => {
      if (e.data.type === "state") setPos(e.data.pos);
    };
    ch.postMessage({ type: "hello" } satisfies DeckMessage);
    return () => ch.close();
  }, []);

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now();
    const id = window.setInterval(() => {
      setElapsed(baseRef.current + (performance.now() - startRef.current) / 1000);
    }, 250);
    return () => {
      baseRef.current += (performance.now() - startRef.current) / 1000;
      window.clearInterval(id);
    };
  }, [running]);

  useEffect(() => {
    const send = (dir: "next" | "prev") => chan.current?.postMessage({ type: "nav", dir } satisfies DeckMessage);
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", " ", "PageDown"].includes(e.key)) {
        e.preventDefault();
        send("next");
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        send("prev");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const reset = () => {
    baseRef.current = 0;
    startRef.current = performance.now();
    setElapsed(0);
  };

  const meta = slides[pos.slide - 1]!;
  const upcoming = nextPos(pos);
  const isLast = upcoming.slide === pos.slide && upcoming.step === pos.step;
  const nextSlide = upcoming.slide !== pos.slide ? upcoming.slide : pos.slide < slides.length ? pos.slide + 1 : null;
  const warn = elapsed >= TIMER_WARNING_SECONDS;

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-stage p-8 font-sans text-ink">
      <div className="flex items-center justify-between">
        <div className="font-mono text-sm tracking-[0.12em] text-ink-2 uppercase">
          Slide {pos.slide}/{slides.length} · Step {pos.step}/{meta.steps} · {meta.name}
        </div>
        <div className="flex items-center gap-4">
          <span className={cn("font-mono text-5xl tabular-nums", warn ? "text-amber" : "text-ink")}>{fmt(elapsed)}</span>
          <span className="font-mono text-sm tracking-[0.12em] text-ink-2 uppercase">/ {fmt(TIMER_TARGET_SECONDS)}</span>
          <button type="button" onClick={() => setRunning((r) => !r)} className="rounded-md border border-hair px-3 py-1.5 font-mono text-xs tracking-[0.12em] text-ink uppercase hover:bg-panel">
            {running ? "Pause" : "Start"}
          </button>
          <button type="button" onClick={reset} className="rounded-md border border-hair px-3 py-1.5 font-mono text-xs tracking-[0.12em] text-ink uppercase hover:bg-panel">
            Reset
          </button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-[3fr_2fr] gap-6">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs tracking-[0.12em] text-ink-2 uppercase">Current</span>
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-hair">
            <ScaledStage>
              <SlideFrame id={pos.slide} step={pos.step} isStatic />
            </ScaledStage>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs tracking-[0.12em] text-ink-2 uppercase">
              {isLast ? "End of deck" : upcoming.slide === pos.slide ? `Next build · step ${upcoming.step}` : "Next slide"}
            </span>
            <div className="aspect-video w-full overflow-hidden rounded-lg border border-hair">
              {!isLast && (
                <ScaledStage>
                  <SlideFrame id={upcoming.slide} step={upcoming.step} isStatic />
                </ScaledStage>
              )}
            </div>
            {nextSlide && upcoming.slide === pos.slide && (
              <span className="font-mono text-xs tracking-[0.12em] text-ink-2 uppercase">
                Then: {nextSlide} · {slides[nextSlide - 1]?.name}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs tracking-[0.12em] text-ink-2 uppercase">Notes</span>
            <p className="text-2xl leading-relaxed text-ink">{meta.notes}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
