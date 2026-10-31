import { motion } from "framer-motion";
import { EASE, useIsStatic } from "./primitives";

/** Deep-blue blurred radial glow, drifting very slowly. `rise` lifts and brightens it. */
export function Glow({ rise = false, baseY = 260, riseY = 0 }: { rise?: boolean; baseY?: number; riseY?: number }) {
  const isStatic = useIsStatic();
  const y = rise ? riseY : baseY;
  const opacity = rise ? 1 : 0.7;
  if (isStatic) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="k-glow absolute top-[90px] left-[460px] h-[900px] w-[1000px]"
          style={{ transform: `translateY(${y}px)`, opacity }}
        />
      </div>
    );
  }
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute top-[90px] left-[460px] h-[900px] w-[1000px]"
        initial={false}
        animate={{ y, opacity }}
        transition={{ duration: 2.2, ease: EASE }}
      >
        <motion.div
          className="k-glow h-full w-full"
          animate={{ x: [0, 90, -60, 0], y: [0, -40, 30, 0], scale: [1, 1.06, 0.97, 1] }}
          transition={{ duration: 36, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}
