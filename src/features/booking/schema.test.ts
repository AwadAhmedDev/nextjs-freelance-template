import { describe, expect, it } from "vitest";
import { createSlotSchema } from "./schema";

describe("createSlotSchema", () => {
  it("accepte un créneau valide", () => {
    const result = createSlotSchema.safeParse({
      startsAt: "2026-12-01T09:00:00.000Z",
      durationMinutes: 60,
      priceEuros: 35,
    });
    expect(result.success).toBe(true);
  });

  it("refuse une date mal formée et un prix négatif", () => {
    const result = createSlotSchema.safeParse({
      startsAt: "demain",
      durationMinutes: 60,
      priceEuros: -5,
    });
    expect(result.success).toBe(false);
  });
});
