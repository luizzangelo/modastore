import { describe, expect, it } from "vitest";
import { saleSchema } from "./schemas";

const base = {
  customerType: "new",
  customerId: "",
  customerName: "",
  customerPhone: "",
  soldAt: "2026-10-13",
  paymentMethod: "pix",
  channel: "physical_store",
  items: [],
  totalAmount: "100",
  totalCost: "40",
  piecesCount: "2",
  entryAmount: "0",
  entryMethod: "cash",
  installments: "1",
  firstDueDate: "",
};

describe("saleSchema", () => {
  it("accepts a manual sale", () => {
    expect(saleSchema.safeParse(base).success).toBe(true);
  });

  it("requires amount for a sale without products", () => {
    expect(saleSchema.safeParse({ ...base, totalAmount: "0" }).success).toBe(
      false,
    );
  });

  it("requires a registered customer for an existing customer sale", () => {
    expect(
      saleSchema.safeParse({ ...base, customerType: "existing" }).success,
    ).toBe(false);
  });

  it("requires customer and due date for credit", () => {
    expect(
      saleSchema.safeParse({ ...base, paymentMethod: "credit" }).success,
    ).toBe(false);
  });
});
