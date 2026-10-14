import { z } from "zod";

export const manualReceivableSchema = z.object({
  customerId: z.uuid(),
  description: z.string().trim().min(2).max(240),
  total: z.coerce.number().positive(),
  installments: z.coerce.number().int().min(1).max(12),
  firstDueDate: z.iso.date(),
});

export const paymentSchema = z.object({
  receivableId: z.uuid(),
  amount: z.coerce.number().positive(),
  paidAt: z.iso.date(),
  method: z.enum(["pix", "card", "cash"]),
  notes: z.string().trim().max(500),
});

export const paymentIdSchema = z.uuid();
