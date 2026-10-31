import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MotionConfig } from "framer-motion";
import { useCallback } from "react";
import { Deck } from "@/components/deck/Deck";
import { clampPos, type DeckPos } from "@/lib/deck-nav";

type Search = { slide?: number | undefined; step?: number | undefined };

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    slide: s["slide"] !== undefined ? Number(s["slide"]) || 1 : undefined,
    step: s["step"] !== undefined ? Number(s["step"]) || 1 : undefined,
  }),
  head: () => ({
    meta: [
      { title: "CIPRI Project Plan — Keynote" },
      { name: "description", content: "Baseline project plan for CIPRI, from signed contract to an operational wildfire coordination centre." },
      { property: "og:title", content: "CIPRI Project Plan — Keynote" },
      { property: "og:description", content: "From signed contract to an operational centre: the CIPRI baseline plan in ten slides." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const pos = clampPos(search.slide, search.step);
  const onChange = useCallback(
    (p: DeckPos) => navigate({ search: { slide: p.slide, step: p.step }, replace: true }),
    [navigate],
  );
  return (
    <MotionConfig reducedMotion="user">
      <Deck pos={pos} onChange={onChange} />
    </MotionConfig>
  );
}
