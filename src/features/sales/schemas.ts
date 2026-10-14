import { z } from "zod";

const itemSchema = z.object({
  variant_id: z.uuid(),
  quantity: z.number().int().positive(),
});

export const saleSchema = z
  .object({
    customerType: z.enum(["new", "existing"]),
    customerId: z.union([z.literal(""), z.uuid()]),
    customerName: z.string().trim().max(160),
    customerPhone: z.string().transform((value) => value.replace(/\D/g, "")),
    soldAt: z.iso.date(),
    paymentMethod: z.enum(["pix", "card", "cash", "credit"]),
    channel: z.enum(["physical_store", "online", "mail", "whatsapp", "other"]),
    items: z.array(itemSchema),
    totalAmount: z.coerce.number().min(0),
    totalCost: z.coerce.number().min(0),
    piecesCount: z.coerce.number().int().min(0),
    entryAmount: z.coerce.number().min(0),
    entryMethod: z.enum(["pix", "card", "cash"]),
    installments: z.coerce.number().int().min(1).max(12),
    firstDueDate: z.string(),
  })
  .superRefine((value, context) => {
    if (value.customerType === "existing" && !value.customerId) {
      context.addIssue({
        code: "custom",
        path: ["customerId"],
        message: "Selecione um cliente cadastrado.",
      });
    }
    const hasCustomer = Boolean(value.customerId || value.customerName);
    if (value.paymentMethod === "credit" && !hasCustomer) {
      context.addIssue({
        code: "custom",
        path: ["customerId"],
        message: "Fiado exige cliente.",
      });
    }
    if (
      !value.customerId &&
      value.customerName.length > 0 &&
      value.customerName.length < 2
    ) {
      context.addIssue({
        code: "custom",
        path: ["customerName"],
        message: "Nome inválido.",
      });
    }
    if (value.customerPhone && !/^\d{10,11}$/.test(value.customerPhone)) {
      context.addIssue({
        code: "custom",
        path: ["customerPhone"],
        message: "Telefone inválido.",
      });
    }
    if (!value.items.length && value.totalAmount <= 0) {
      context.addIssue({
        code: "custom",
        path: ["totalAmount"],
        message: "Informe o valor total.",
      });
    }
    if (value.paymentMethod === "credit") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value.firstDueDate)) {
        context.addIssue({
          code: "custom",
          path: ["firstDueDate"],
          message: "Informe o vencimento.",
        });
      }
      const knownTotal = value.items.length
        ? Number.POSITIVE_INFINITY
        : value.totalAmount;
      if (value.entryAmount > knownTotal) {
        context.addIssue({
          code: "custom",
          path: ["entryAmount"],
          message: "Entrada maior que a venda.",
        });
      }
    }
  });

export const saleIdSchema = z.uuid();
