import { describe, expect, it } from "vitest";
import { addMonthsClamped, buildInstallments } from "./money";

describe("buildInstallments", () => {
  it("keeps the exact total in cents and puts the remainder in the last installment", () => {
    const installments = buildInstallments(100, 3, "2026-01-10");
    expect(installments.map((item) => item.amount)).toEqual([
      33.33, 33.33, 33.34,
    ]);
    expect(
      installments.reduce(
        (sum, item) => sum + Math.round(item.amount * 100),
        0,
      ),
    ).toBe(10000);
  });

  it("clamps monthly due dates to the end of the month", () => {
    expect(addMonthsClamped("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonthsClamped("2026-01-31", 2)).toBe("2026-03-31");
  });
});
