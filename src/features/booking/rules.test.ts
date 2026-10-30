import { describe, expect, it } from "vitest";
import {
  computeDepositCents,
  eurosToCents,
  isPendingBookingExpired,
  isSlotBookable,
  MIN_BOOKING_NOTICE_MINUTES,
  PAYMENT_WINDOW_MINUTES,
} from "./rules";

const minutes = (n: number) => n * 60_000;

describe("computeDepositCents", () => {
  it("calcule 30 % du prix, arrondi au centime", () => {
    expect(computeDepositCents(3500)).toBe(1050);
    expect(computeDepositCents(999)).toBe(300);
  });

  it("refuse un prix nul, négatif ou non entier", () => {
    expect(() => computeDepositCents(0)).toThrow(RangeError);
    expect(() => computeDepositCents(-100)).toThrow(RangeError);
    expect(() => computeDepositCents(10.5)).toThrow(RangeError);
  });
});

describe("isSlotBookable", () => {
  const now = new Date("2026-11-02T10:00:00Z");

  it("accepte un créneau assez loin dans le futur", () => {
    const startsAt = new Date(now.getTime() + minutes(MIN_BOOKING_NOTICE_MINUTES));
    expect(isSlotBookable(startsAt, now)).toBe(true);
  });

  it("refuse un créneau trop proche ou passé", () => {
    expect(isSlotBookable(new Date(now.getTime() + minutes(10)), now)).toBe(false);
    expect(isSlotBookable(new Date(now.getTime() - minutes(60)), now)).toBe(false);
  });
});

describe("isPendingBookingExpired", () => {
  const now = new Date("2026-11-02T10:00:00Z");

  it("garde une réservation récente", () => {
    expect(
      isPendingBookingExpired(new Date(now.getTime() - minutes(PAYMENT_WINDOW_MINUTES)), now),
    ).toBe(false);
  });

  it("libère une réservation abandonnée", () => {
    expect(
      isPendingBookingExpired(new Date(now.getTime() - minutes(PAYMENT_WINDOW_MINUTES + 6)), now),
    ).toBe(true);
  });
});

describe("eurosToCents", () => {
  it("convertit sans erreur d'arrondi", () => {
    expect(eurosToCents(49.9)).toBe(4990);
    expect(eurosToCents(0.1 + 0.2)).toBe(30);
  });
});
