import { describe, expect, it } from "vitest";
import { manualReceivableSchema, paymentSchema } from "./schemas";

describe("receivable schemas", () => {
  it("validates a manual account", () => {
    expect(
      manualReceivableSchema.safeParse({
        customerId: crypto.randomUUID(),
        description: "Saldo anterior",
        total: "120.50",
        installments: "3",
        firstDueDate: "2026-10-31",
      }).success,
    ).toBe(true);
  });

  it("rejects a zero payment", () => {
    expect(
      paymentSchema.safeParse({
        receivableId: crypto.randomUUID(),
        amount: "0",
        paidAt: "2026-10-13",
        method: "pix",
        notes: "",
      }).success,
    ).toBe(false);
  });
});
