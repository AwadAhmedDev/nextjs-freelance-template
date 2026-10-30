import { describe, expect, it } from "vitest";
import { formatCents } from "./utils";

describe("formatCents", () => {
  it("affiche des euros au format français", () => {
    // Intl utilise des espaces insécables : on les normalise pour comparer.
    expect(formatCents(1050).replace(/\s/g, " ")).toBe("10,50 €");
  });
});
