import { describe, expect, it } from "vitest";
import { customerSchema } from "./schemas";

describe("customerSchema", () => {
  it("normalizes a Brazilian phone number", () => {
    const result = customerSchema.safeParse({
      name: "Maria da Silva",
      phone: "(85) 99999-1234",
      origin: "new",
      acquiredAt: "2026-10-13",
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBe("85999991234");
  });

  it("requires an acquisition date for a new customer", () => {
    expect(
      customerSchema.safeParse({
        name: "Maria",
        phone: "",
        origin: "new",
        acquiredAt: "",
      }).success,
    ).toBe(false);
  });

  it("allows an existing customer without an acquisition date", () => {
    expect(
      customerSchema.safeParse({
        name: "João",
        phone: "85999991234",
        origin: "existing",
        acquiredAt: "",
      }).success,
    ).toBe(true);
  });
});
