import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  costPrice: z.coerce.number().min(0),
  salePrice: z.coerce.number().positive(),
  minStock: z.coerce.number().int().min(0),
  gridType: z.enum(["single", "sizes"]),
  unico: z.coerce.number().int().min(0).default(0),
  p: z.coerce.number().int().min(0).default(0),
  m: z.coerce.number().int().min(0).default(0),
  g: z.coerce.number().int().min(0).default(0),
  gg: z.coerce.number().int().min(0).default(0),
});
