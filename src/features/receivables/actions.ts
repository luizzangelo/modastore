"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  manualReceivableSchema,
  paymentIdSchema,
  paymentSchema,
} from "./schemas";

async function authenticatedClient() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
  return supabase;
}

export async function createManualReceivable(formData: FormData) {
  const parsed = manualReceivableSchema.safeParse({
    customerId: formData.get("customerId"),
    description: formData.get("description"),
    total: formData.get("total"),
    installments: formData.get("installments"),
    firstDueDate: formData.get("firstDueDate"),
  });
  if (!parsed.success) redirect("/contas-a-receber/nova?error=invalid");
  const supabase = await authenticatedClient();
  const value = parsed.data;
  const { error } = await supabase.rpc("create_manual_receivables", {
    p_customer_id: value.customerId,
    p_description: value.description,
    p_total: value.total,
    p_installments: value.installments,
    p_first_due_date: value.firstDueDate,
  });
  if (error) redirect("/contas-a-receber/nova?error=save");
  revalidatePath("/contas-a-receber");
  revalidatePath("/clientes");
  redirect("/contas-a-receber?created=1");
}

export async function registerPayment(formData: FormData) {
  const parsed = paymentSchema.safeParse({
    receivableId: formData.get("receivableId"),
    amount: formData.get("amount"),
    paidAt: formData.get("paidAt"),
    method: formData.get("method"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) redirect("/contas-a-receber?error=payment");
  const supabase = await authenticatedClient();
  const value = parsed.data;
  const { error } = await supabase.rpc("register_receivable_payment", {
    p_receivable_id: value.receivableId,
    p_amount: value.amount,
    p_paid_at: value.paidAt,
    p_method: value.method,
    p_notes: value.notes || undefined,
  });
  if (error) redirect("/contas-a-receber?error=payment");
  revalidatePath("/contas-a-receber");
  revalidatePath("/clientes");
  redirect("/contas-a-receber?paid=1");
}

export async function reversePayment(formData: FormData) {
  const id = paymentIdSchema.safeParse(formData.get("paymentId"));
  if (!id.success) redirect("/contas-a-receber?error=reverse");
  const supabase = await authenticatedClient();
  const { error } = await supabase.rpc("reverse_receivable_payment", {
    p_payment_id: id.data,
  });
  if (error) redirect("/contas-a-receber?error=reverse");
  revalidatePath("/contas-a-receber");
  revalidatePath("/clientes");
  redirect("/contas-a-receber?reversed=1");
}
