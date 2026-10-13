import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { SaleForm } from "@/features/sales/sale-form";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function NewSalePage() {
  const supabase = await createClient();
  const [{ data: customers }, { data: products }, { data: variants }] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id,name,phone")
        .eq("active", true)
        .order("name"),
      supabase
        .from("products")
        .select("id,name,sale_price,cost_price")
        .eq("active", true)
        .order("name"),
      supabase
        .from("product_variants")
        .select("id,product_id,size,quantity")
        .gt("quantity", 0),
    ]);
  const productMap = new Map(
    (products ?? []).map((product) => [product.id, product]),
  );
  const options = (variants ?? []).flatMap((variant) => {
    const product = productMap.get(variant.product_id);
    return product
      ? [
          {
            id: variant.id,
            label: `${product.name} · ${variant.size === "UNICO" ? "Único" : variant.size}`,
            stock: variant.quantity,
            salePrice: Number(product.sale_price),
            costPrice: Number(product.cost_price),
          },
        ]
      : [];
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <Link
          href="/vendas"
          className="text-muted mb-5 inline-flex items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft size={17} /> Voltar
        </Link>
        <h1 className="text-3xl font-bold">Nova venda</h1>
        <p className="text-muted mt-1 mb-6 text-sm">
          Registre produtos ou informe os valores de uma venda manual.
        </p>
        <SaleForm customers={customers ?? []} variants={options} />
      </div>
    </AppShell>
  );
}
