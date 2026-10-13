"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "./schemas";

export async function createProduct(formData: FormData) {
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/estoque/novo?error=invalid");
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/login");
  const { data: store } = await supabase.from("stores").select("id").single();
  if (!store) redirect("/estoque/novo?error=store");
  const value = parsed.data;
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      store_id: store.id,
      name: value.name,
      cost_price: value.costPrice,
      sale_price: value.salePrice,
      min_stock: value.minStock,
    })
    .select("id")
    .single();
  if (error || !product) redirect("/estoque/novo?error=save");
  const variants =
    value.gridType === "single"
      ? [{ size: "UNICO", quantity: value.unico }]
      : (["P", "M", "G", "GG"] as const).map((size) => ({
          size,
          quantity: value[size.toLowerCase() as "p" | "m" | "g" | "gg"],
        }));
  const { error: variantError } = await supabase
    .from("product_variants")
    .insert(
      variants.map((variant) => ({
        ...variant,
        product_id: product.id,
        store_id: store.id,
      })),
    );
  if (variantError) {
    await supabase.from("products").delete().eq("id", product.id);
    redirect("/estoque/novo?error=save");
  }
  revalidatePath("/estoque");
  redirect("/estoque?created=1");
}

export async function toggleProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
  await supabase.from("products").update({ active: !active }).eq("id", id);
  revalidatePath("/estoque");
}
