import { slides } from "@/content/slides";

/** Slide and step are both 1-based. Step 1 = first build visible on arrival. */
export type DeckPos = { slide: number; step: number };

const total = () => slides.length;
const stepsOf = (slide: number) => slides[slide - 1]?.steps ?? 1;

export function clampPos(slide?: number, step?: number): DeckPos {
  const s = Math.min(Math.max(Math.round(slide ?? 1), 1), total());
  const st = Math.min(Math.max(Math.round(step ?? 1), 1), stepsOf(s));
  return { slide: s, step: st };
}

export function nextPos({ slide, step }: DeckPos): DeckPos {
  if (step < stepsOf(slide)) return { slide, step: step + 1 };
  if (slide < total()) return { slide: slide + 1, step: 1 };
  return { slide, step };
}

export function prevPos({ slide, step }: DeckPos): DeckPos {
  if (step > 1) return { slide, step: step - 1 };
  if (slide > 1) return { slide: slide - 1, step: stepsOf(slide - 1) };
  return { slide, step };
}

/** Number keys: "1".."9" → slides 1–9, "0" → slide 10. Lands fully built. */
export function jumpPos(key: string): DeckPos | null {
  if (!/^[0-9]$/.test(key)) return null;
  const slide = key === "0" ? 10 : Number(key);
  if (slide > total()) return null;
  return { slide, step: stepsOf(slide) };
}

/** 0..1 overall progress through all build steps. */
export function progressOf({ slide, step }: DeckPos): number {
  const all = slides.reduce((a, s) => a + s.steps, 0);
  const done = slides.slice(0, slide - 1).reduce((a, s) => a + s.steps, 0) + step;
  return done / all;
}
