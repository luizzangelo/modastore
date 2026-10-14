import { describe, expect, it } from "vitest";
import { passwordSchema, storeSchema } from "./schemas";

describe("settings schemas", () => {
  it("requires a meaningful store name", () => {
    expect(storeSchema.safeParse({ name: "A" }).success).toBe(false);
  });

  it("requires matching passwords with at least eight characters", () => {
    expect(
      passwordSchema.safeParse({
        password: "NovaSenha123!",
        confirmation: "NovaSenha123!",
      }).success,
    ).toBe(true);
    expect(
      passwordSchema.safeParse({
        password: "NovaSenha123!",
        confirmation: "outra",
      }).success,
    ).toBe(false);
  });
});
