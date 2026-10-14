"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { passwordSchema, storeSchema } from "./schemas";

async function authenticatedClient() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
  return supabase;
}

export async function updateStore(formData: FormData) {
  const parsed = storeSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) redirect("/configuracoes?error=store");
  const supabase = await authenticatedClient();
  const { error } = await supabase
    .from("stores")
    .update({ name: parsed.data.name })
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) redirect("/configuracoes?error=store");
  revalidatePath("/configuracoes");
  redirect("/configuracoes?store=updated");
}

export async function updatePassword(formData: FormData) {
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirmation: formData.get("confirmation"),
  });
  if (!parsed.success) redirect("/configuracoes?error=password");
  const supabase = await authenticatedClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) redirect("/configuracoes?error=password");
  redirect("/configuracoes?password=updated");
}
