import type { ComponentType } from "react";
import { slides, type SlideMeta } from "@/content/slides";
import { SampleDataTag, StaticContext, type SlideProps } from "./primitives";
import { Glow } from "./Glow";
import { Slide1, Slide2, Slide3 } from "./slides/Slides1to3";
import { Slide4, Slide5, Slide6, Slide7 } from "./slides/Slides4to7";
import { Slide8, Slide9, Slide10 } from "./slides/Slides8to10";

const components: Record<number, ComponentType<SlideProps>> = {
  1: Slide1,
  2: Slide2,
  3: Slide3,
  4: Slide4,
  5: Slide5,
  6: Slide6,
  7: Slide7,
  8: Slide8,
  9: Slide9,
  10: Slide10,
};

export const metaOf = (id: number): SlideMeta => slides[id - 1]!;

/** One 1920×1080 slide: background, optional glow, content, grain, sample-data tag. */
export function SlideFrame({ id, step, isStatic = false }: { id: number; step: number; isStatic?: boolean }) {
  const Comp = components[id] ?? Slide1;
  const meta = metaOf(id);
  return (
    <StaticContext.Provider value={isStatic}>
      <div className="relative h-[1080px] w-[1920px] overflow-hidden bg-stage font-sans text-ink">
        {meta.glow && id === 1 && <Glow baseY={240} />}
        <Comp step={step} />
        <div className="k-grain pointer-events-none absolute inset-0" />
        {meta.sampleData && <SampleDataTag />}
      </div>
    </StaticContext.Provider>
  );
}
