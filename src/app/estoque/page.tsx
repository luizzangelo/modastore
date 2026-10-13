import { Plus, PackageOpen } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toggleProduct } from "@/features/products/actions";
import { formatCurrency } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("product_inventory")
    .select("*")
    .order("name");
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="text-primary text-sm font-medium">Catálogo</p>
            <h1 className="text-3xl font-bold">Estoque</h1>
            <p className="text-muted mt-1 text-sm">
              Produtos, tamanhos e quantidades disponíveis.
            </p>
          </div>
          <Link
            href="/estoque/novo"
            className="bg-primary inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white"
          >
            <Plus size={18} /> Novo produto
          </Link>
        </div>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-border text-muted border-b bg-zinc-50">
                <tr>
                  <th className="p-4">Produto</th>
                  <th className="p-4">Venda</th>
                  <th className="p-4">Estoque</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {products?.map((product) => (
                  <tr
                    key={product.id}
                    className="border-border border-b last:border-0"
                  >
                    <td className="p-4 font-semibold">{product.name}</td>
                    <td className="p-4">
                      {formatCurrency(product.sale_price)}
                    </td>
                    <td className="p-4">{product.total_stock}</td>
                    <td className="p-4">
                      <Badge
                        tone={product.stock_status === "low" ? "red" : "green"}
                      >
                        {product.stock_status === "low"
                          ? "Estoque baixo"
                          : "Normal"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <form action={toggleProduct}>
                        <input
                          type="hidden"
                          name="id"
                          value={product.id ?? ""}
                        />
                        <input
                          type="hidden"
                          name="active"
                          value={String(product.active)}
                        />
                        <button className="text-primary font-semibold">
                          {product.active ? "Inativar" : "Ativar"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!products?.length && (
            <div className="grid min-h-64 place-items-center text-center">
              <div>
                <PackageOpen className="mx-auto mb-3 text-zinc-300" />
                <p className="font-semibold">Nenhum produto cadastrado</p>
                <p className="text-muted text-sm">
                  Cadastre o primeiro item do estoque.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
