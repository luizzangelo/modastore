import { describe, expect, it } from "vitest";
import { productSchema } from "./schemas";

const base = {
  name: "Camiseta",
  costPrice: "20",
  salePrice: "49.90",
  minStock: "2",
  gridType: "single",
  unico: "3",
  p: "0",
  m: "0",
  g: "0",
  gg: "0",
};

describe("productSchema", () => {
  it("accepts non-negative stock and cost", () => {
    expect(productSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a non-positive sale price", () => {
    expect(productSchema.safeParse({ ...base, salePrice: "0" }).success).toBe(
      false,
    );
  });
});
