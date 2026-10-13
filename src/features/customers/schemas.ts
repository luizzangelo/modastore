import { z } from "zod";

const optionalPhone = z.preprocess(
  (value) => String(value ?? "").replace(/\D/g, ""),
  z.union([
    z.literal(""),
    z.string().regex(/^\d{10,11}$/, "Informe um telefone com DDD."),
  ]),
);

export const customerSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    phone: optionalPhone,
    origin: z.enum(["new", "existing"]),
    acquiredAt: z.string().trim(),
  })
  .superRefine((value, context) => {
    if (
      value.origin === "new" &&
      !/^\d{4}-\d{2}-\d{2}$/.test(value.acquiredAt)
    ) {
      context.addIssue({
        code: "custom",
        path: ["acquiredAt"],
        message: "Informe a data de aquisição.",
      });
    }
  });

export const customerIdSchema = z.uuid();
