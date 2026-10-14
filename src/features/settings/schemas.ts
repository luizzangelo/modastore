import { z } from "zod";

export const storeSchema = z.object({
  name: z.string().trim().min(2).max(120),
});

export const passwordSchema = z
  .object({
    password: z.string().min(8).max(128),
    confirmation: z.string(),
  })
  .refine((value) => value.password === value.confirmation, {
    path: ["confirmation"],
    message: "As senhas não coincidem.",
  });
