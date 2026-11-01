import { motion } from "framer-motion";
import { EASE, useIsStatic } from "./primitives";

const blobs = [
  { cls: "bg-mesh-1", x: 260, y: 120, w: 900, h: 700, drift: [0, 120, -40, 0], driftY: [0, 60, -30, 0], dur: 38 },
  { cls: "bg-mesh-2", x: 900, y: 360, w: 860, h: 680, drift: [0, -100, 50, 0], driftY: [0, -50, 40, 0], dur: 44 },
  { cls: "bg-mesh-3", x: 560, y: 520, w: 820, h: 560, drift: [0, 80, -90, 0], driftY: [0, 40, -40, 0], dur: 50 },
];

/** Pastel gradient mesh, heavily blurred, drifting slowly. `rise` brightens and lifts it. */
export function Glow({ rise = false, baseY = 0, riseY = -60 }: { rise?: boolean; baseY?: number; riseY?: number }) {
  const isStatic = useIsStatic();
  const y = rise ? riseY : baseY;
  const opacity = rise ? 1 : 0.85;
  const scale = rise ? 1.12 : 1;

  if (isStatic) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ transform: `translateY(${y}px) scale(${scale})`, opacity }}>
        {blobs.map((b) => (
          <div key={b.cls} className={`k-mesh-blob absolute ${b.cls}`} style={{ left: b.x, top: b.y, width: b.w, height: b.h }} />
        ))}
      </div>
    );
  }
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      initial={false}
      animate={{ y, opacity, scale }}
      transition={{ duration: 2, ease: EASE }}
    >
      {blobs.map((b) => (
        <motion.div
          key={b.cls}
          className={`k-mesh-blob absolute ${b.cls}`}
          style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
          animate={{ x: b.drift, y: b.driftY, scale: [1, 1.08, 0.96, 1] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </motion.div>
  );
}
