import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { slides } from "@/content/slides";
import { cn } from "@/lib/utils";
import { jumpPos, nextPos, prevPos, progressOf, type DeckPos } from "@/lib/deck-nav";
import { openChannel, type DeckMessage } from "@/lib/deck-channel";
import { ScaledStage } from "./ScaledStage";
import { SlideFrame } from "./registry";
import { EASE } from "./primitives";

export function Deck({ pos, onChange }: { pos: DeckPos; onChange: (p: DeckPos) => void }) {
  const [grid, setGrid] = useState(false);
  const [recording, setRecording] = useState(false);
  const [idle, setIdle] = useState(false);
  const posRef = useRef(pos);
  const dirRef = useRef(1);
  if (pos.slide !== posRef.current.slide) dirRef.current = pos.slide > posRef.current.slide ? 1 : -1;
  posRef.current = pos;
  const chanRef = useRef<BroadcastChannel | null>(null);

  const go = useCallback((p: DeckPos) => onChange(p), [onChange]);
  const next = useCallback(() => go(nextPos(posRef.current)), [go]);
  const prev = useCallback(() => go(prevPos(posRef.current)), [go]);

  // Presenter sync
  useEffect(() => {
    const ch = openChannel();
    chanRef.current = ch;
    if (!ch) return;
    ch.onmessage = (e: MessageEvent<DeckMessage>) => {
      const m = e.data;
      if (m.type === "hello") ch.postMessage({ type: "state", pos: posRef.current } satisfies DeckMessage);
      if (m.type === "nav") (m.dir === "next" ? next : prev)();
    };
    return () => ch.close();
  }, [next, prev]);

  useEffect(() => {
    chanRef.current?.postMessage({ type: "state", pos } satisfies DeckMessage);
    const meta = slides[pos.slide - 1]!;
    document.title = `${pos.slide}/${slides.length}: ${meta.name}, CIPRI Project Plan`;
  }, [pos]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === "ArrowRight" || k === " " || k === "PageDown" || k === "ArrowDown") {
        e.preventDefault();
        next();
      } else if (k === "ArrowLeft" || k === "PageUp" || k === "ArrowUp") {
        e.preventDefault();
        prev();
      } else if (k === "f" || k === "F") {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen?.();
      } else if (k === "g" || k === "G") {
        setGrid((g) => !g);
      } else if (k === "Escape") {
        setGrid(false);
      } else if (k === "r" || k === "R") {
        setRecording((r) => !r);
      } else if (k === "p" || k === "P") {
        window.open(`/presenter`, "cipri-presenter", "width=1280,height=800");
      } else {
        const j = jumpPos(k);
        if (j) {
          setGrid(false);
          go(j);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, next, prev]);

  // Cursor hides after 2 s idle
  useEffect(() => {
    let timer = window.setTimeout(() => setIdle(true), 2000);
    const onMove = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), 2000);
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.clearTimeout(timer);
    };
  }, []);

  // Touch swipe
  const touchX = useRef<number | null>(null);

  const hideCursor = recording || (idle && !grid);

  return (
    <div
      className={cn("fixed inset-0 bg-letterbox select-none", hideCursor && "cursor-none")}
      onClick={() => !grid && next()}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const d = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
        if (Math.abs(d) > 50) (d < 0 ? next : prev)();
        touchX.current = null;
      }}
    >
      <ScaledStage>
        <AnimatePresence initial={false} custom={dirRef.current}>
          <motion.div
            key={pos.slide}
            className="absolute inset-0"
            custom={dirRef.current}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: 40 * d }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: -40 * d }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: EASE }}
          >
            <SlideFrame id={pos.slide} step={pos.step} />
          </motion.div>
        </AnimatePresence>
        {!recording && (
          <div className="pointer-events-none absolute bottom-0 left-0 h-[3px] w-full bg-track">
            <motion.div
              className="h-full bg-blue/70"
              initial={false}
              animate={{ width: `${progressOf(pos) * 100}%` }}
              transition={{ duration: 0.6, ease: EASE }}
            />
          </div>
        )}
      </ScaledStage>

      <AnimatePresence>
        {grid && (
          <motion.div
            className="fixed inset-0 overflow-y-auto bg-letterbox/95 p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              e.stopPropagation();
              setGrid(false);
            }}
          >
            <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
              {slides.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setGrid(false);
                    go({ slide: s.id, step: 1 });
                  }}
                  className={cn(
                    "group flex flex-col gap-2 text-left",
                    s.id === pos.slide ? "opacity-100" : "opacity-70 hover:opacity-100",
                  )}
                >
                  <div
                    className={cn(
                      "aspect-video w-full overflow-hidden rounded-md border",
                      s.id === pos.slide ? "border-ink/70" : "border-hair",
                    )}
                  >
                    <ScaledStage>
                      <SlideFrame id={s.id} step={s.steps} isStatic />
                    </ScaledStage>
                  </div>
                  <span className="text-sm font-medium text-ink-2">
                    {s.id}. {s.name}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
