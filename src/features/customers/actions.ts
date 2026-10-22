"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { customerIdSchema, customerSchema } from "./schemas";

async function getAuthenticatedStore() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/login");

  const { data: store } = await supabase.from("stores").select("id").single();
  if (!store) redirect("/clientes?error=store");
  return { supabase, storeId: store.id };
}

function customerValues(formData: FormData) {
  return customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    origin: formData.get("origin"),
    acquiredAt: formData.get("acquiredAt"),
  });
}

export async function createCustomer(formData: FormData) {
  const parsed = customerValues(formData);
  if (!parsed.success) redirect("/clientes/novo?error=invalid");

  const { supabase, storeId } = await getAuthenticatedStore();
  const value = parsed.data;
  const { error } = await supabase.from("customers").insert({
    store_id: storeId,
    name: value.name,
    phone: value.phone || null,
    origin: value.origin,
    acquired_at: value.origin === "new" ? value.acquiredAt : null,
  });

  if (error?.code === "23505") redirect("/clientes/novo?error=phone");
  if (error) redirect("/clientes/novo?error=save");
  revalidatePath("/clientes");
  redirect("/clientes?created=1");
}

export async function updateCustomer(formData: FormData) {
  const id = customerIdSchema.safeParse(formData.get("id"));
  const parsed = customerValues(formData);
  if (!id.success || !parsed.success) redirect("/clientes?error=invalid");

  const { supabase } = await getAuthenticatedStore();
  const value = parsed.data;
  const { error } = await supabase
    .from("customers")
    .update({
      name: value.name,
      phone: value.phone || null,
      origin: value.origin,
      acquired_at: value.origin === "new" ? value.acquiredAt : null,
    })
    .eq("id", id.data);

  if (error?.code === "23505") {
    redirect(`/clientes/${id.data}/editar?error=phone`);
  }
  if (error) redirect(`/clientes/${id.data}/editar?error=save`);
  revalidatePath("/clientes");
  redirect("/clientes?updated=1");
}

export async function toggleCustomer(formData: FormData) {
  const id = customerIdSchema.safeParse(formData.get("id"));
  const active = formData.get("active") === "true";
  if (!id.success) redirect("/clientes?error=invalid");

  const { supabase } = await getAuthenticatedStore();
  await supabase
    .from("customers")
    .update({ active: !active })
    .eq("id", id.data);
  revalidatePath("/clientes");
}

export async function deleteCustomer(formData: FormData) {
  const id = customerIdSchema.safeParse(formData.get("id"));
  if (!id.success) redirect("/clientes?error=invalid");

  const { supabase } = await getAuthenticatedStore();
  const { error } = await supabase.rpc("delete_customer", {
    p_customer_id: id.data,
  });

  if (error?.message.includes("Cancele todas as vendas")) {
    redirect("/clientes?error=sales");
  }
  if (error?.message.includes("contas a receber")) {
    redirect("/clientes?error=receivables");
  }
  if (error) redirect("/clientes?error=delete");

  revalidatePath("/clientes");
  revalidatePath("/vendas");
  revalidatePath("/contas-a-receber");
  redirect("/clientes?deleted=1");
}
