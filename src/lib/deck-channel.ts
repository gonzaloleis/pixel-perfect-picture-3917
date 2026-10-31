import type { DeckPos } from "./deck-nav";

export const CHANNEL_NAME = "cipri-keynote";

export type DeckMessage =
  | { type: "state"; pos: DeckPos }
  | { type: "hello" }
  | { type: "nav"; dir: "next" | "prev" };

export function openChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  return new BroadcastChannel(CHANNEL_NAME);
}
