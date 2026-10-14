"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.types";
import { saleIdSchema, saleSchema } from "./schemas";

export type SaleActionState = { message: string };

export async function createSale(
  _state: SaleActionState,
  formData: FormData,
): Promise<SaleActionState> {
  let items: unknown = [];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { message: "Os produtos selecionados são inválidos." };
  }
  if (Array.isArray(items) && items.length === 0) {
    const variantIds = formData.getAll("variantId").map(String);
    const quantities = formData.getAll("quantity").map(Number);
    items = variantIds.flatMap((variantId, index) =>
      variantId
        ? [{ variant_id: variantId, quantity: quantities[index] ?? 0 }]
        : [],
    );
  }

  const parsed = saleSchema.safeParse({
    customerType: formData.get("customerType"),
    customerId: formData.get("customerId"),
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    soldAt: formData.get("soldAt"),
    paymentMethod: formData.get("paymentMethod"),
    channel: formData.get("channel"),
    items,
    totalAmount: formData.get("totalAmount"),
    totalCost: formData.get("totalCost"),
    piecesCount: formData.get("piecesCount"),
    entryAmount: formData.get("entryAmount"),
    entryMethod: formData.get("entryMethod"),
    installments: formData.get("installments"),
    firstDueDate: formData.get("firstDueDate"),
  });
  if (!parsed.success)
    return { message: parsed.error.issues[0]?.message ?? "Revise os campos." };

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/login");
  const value = parsed.data;

  if (!value.customerId && value.customerPhone) {
    const { data: duplicate } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", value.customerPhone)
      .maybeSingle();
    if (duplicate)
      return {
        message:
          "Esse telefone já está cadastrado. Selecione o cliente existente.",
      };
  }

  const payload: Record<string, Json | undefined> = {
    customer_type: value.customerType,
    customer_id: value.customerId || undefined,
    sold_at: value.soldAt,
    payment_method: value.paymentMethod,
    channel: value.channel,
    items: value.items,
    total_amount: value.totalAmount,
    total_cost: value.totalCost,
    pieces_count: value.piecesCount,
    entry_amount: value.entryAmount,
    entry_method: value.entryMethod,
    installments: value.installments,
    first_due_date: value.firstDueDate || undefined,
  };
  if (!value.customerId && value.customerName) {
    payload.customer = { name: value.customerName, phone: value.customerPhone };
  }

  const { error } = await supabase.rpc("create_sale", { payload });
  if (error)
    return { message: error.message || "Não foi possível concluir a venda." };
  revalidatePath("/vendas");
  revalidatePath("/estoque");
  revalidatePath("/clientes");
  revalidatePath("/contas-a-receber");
  redirect("/vendas?created=1");
}

export async function cancelSale(formData: FormData) {
  const id = saleIdSchema.safeParse(formData.get("id"));
  if (!id.success) redirect("/vendas?error=invalid");
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/login");
  const { error } = await supabase.rpc("cancel_sale", { p_sale_id: id.data });
  if (error) redirect(`/vendas/${id.data}?error=cancel`);
  revalidatePath("/vendas");
  revalidatePath("/estoque");
  revalidatePath("/contas-a-receber");
  redirect(`/vendas/${id.data}?canceled=1`);
}
