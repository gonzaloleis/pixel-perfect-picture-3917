import { describe, expect, it } from "vitest";
import { jumpPos, nextPos, prevPos } from "@/lib/deck-nav";

describe("deck navigation", () => {
  it("advances a build step before moving to the next slide", () => {
    expect(nextPos({ slide: 1, step: 1 })).toEqual({ slide: 1, step: 2 });
    expect(nextPos({ slide: 1, step: 2 })).toEqual({ slide: 2, step: 1 });
  });
  it("going back from step 1 lands on the previous slide fully built", () => {
    expect(prevPos({ slide: 5, step: 1 })).toEqual({ slide: 4, step: 4 });
  });
  it("key 0 jumps to slide 10 fully built", () => {
    expect(jumpPos("0")).toEqual({ slide: 10, step: 3 });
    expect(jumpPos("4")).toEqual({ slide: 4, step: 4 });
  });
});
