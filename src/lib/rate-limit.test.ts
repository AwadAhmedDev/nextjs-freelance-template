import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimits } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => resetRateLimits());

  it("autorise jusqu'à la limite puis refuse", () => {
    const options = { limit: 3, windowSeconds: 60 };
    const now = 1_000_000;
    expect(checkRateLimit("contact:1.2.3.4", options, now)).toBe(true);
    expect(checkRateLimit("contact:1.2.3.4", options, now)).toBe(true);
    expect(checkRateLimit("contact:1.2.3.4", options, now)).toBe(true);
    expect(checkRateLimit("contact:1.2.3.4", options, now)).toBe(false);
  });

  it("repart à zéro après la fenêtre", () => {
    const options = { limit: 1, windowSeconds: 60 };
    expect(checkRateLimit("k", options, 0)).toBe(true);
    expect(checkRateLimit("k", options, 1_000)).toBe(false);
    expect(checkRateLimit("k", options, 61_000)).toBe(true);
  });

  it("sépare les compteurs par clé", () => {
    const options = { limit: 1, windowSeconds: 60 };
    expect(checkRateLimit("a", options, 0)).toBe(true);
    expect(checkRateLimit("b", options, 0)).toBe(true);
  });
});
