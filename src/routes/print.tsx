import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { slides } from "@/content/slides";
import { SlideFrame } from "@/components/deck/registry";

export const Route = createFileRoute("/print")({
  head: () => ({
    meta: [
      { title: "Print — CIPRI Project Plan" },
      { name: "description", content: "All ten CIPRI keynote slides, fully built, one per landscape page." },
      { property: "og:title", content: "Print — CIPRI Project Plan" },
      { property: "og:description", content: "All ten CIPRI keynote slides, fully built, one per landscape page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrintDeck,
});

function PrintDeck() {
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const update = () => setZoom(Math.min(window.innerWidth / 1920, 1));
    update();
    window.addEventListener("resize", update);
    const before = () => setZoom(1);
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", update);
    };
  }, []);

  return (
    <div className="bg-stage" style={{ zoom }}>
      {slides.map((s) => (
        <div key={s.id} className="k-print-page h-[1080px] w-[1920px] overflow-hidden">
          <SlideFrame id={s.id} step={s.steps} isStatic />
        </div>
      ))}
    </div>
  );
}
