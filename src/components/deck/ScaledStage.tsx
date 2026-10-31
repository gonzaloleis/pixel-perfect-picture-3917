import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const W = 1920;
const H = 1080;

/** Fits a 1920×1080 canvas into its parent with a uniform scale, centred (letterboxed). */
export function ScaledStage({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min(el.clientWidth / W, el.clientHeight / H));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("relative h-full w-full overflow-hidden", className)}>
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: W,
          height: H,
          marginLeft: -W / 2,
          marginTop: -H / 2,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          visibility: scale ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
