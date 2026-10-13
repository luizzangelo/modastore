import { Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

export const instant = false;
const paymentLabels: Record<string, string> = {
  pix: "PIX",
  card: "Cartão",
  cash: "Dinheiro",
  credit: "Fiado",
};

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{
    payment?: string;
    status?: string;
    created?: string;
  }>;
}) {
  const { payment = "", status = "", created } = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("sales")
    .select("*,customers(name)")
    .order("sold_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (payment) query = query.eq("payment_method", payment);
  if (status) query = query.eq("status", status);
  const { data: sales } = await query;
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-primary text-sm font-medium">Operação</p>
            <h1 className="text-3xl font-bold">Vendas</h1>
            <p className="text-muted mt-1 text-sm">
              Histórico de vendas da loja.
            </p>
          </div>
          <Link
            href="/vendas/novo"
            className="bg-primary inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white"
          >
            <Plus size={18} /> Nova venda
          </Link>
        </div>
        {created && (
          <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            Venda concluída com sucesso.
          </p>
        )}
        <form className="mb-4 flex flex-wrap gap-3">
          <select
            className="border-border h-11 rounded-xl border bg-white px-3"
            name="payment"
            defaultValue={payment}
          >
            <option value="">Todos os pagamentos</option>
            <option value="pix">PIX</option>
            <option value="card">Cartão</option>
            <option value="cash">Dinheiro</option>
            <option value="credit">Fiado</option>
          </select>
          <select
            className="border-border h-11 rounded-xl border bg-white px-3"
            name="status"
            defaultValue={status}
          >
            <option value="">Todos os status</option>
            <option value="completed">Concluída</option>
            <option value="canceled">Cancelada</option>
          </select>
          <button className="border-border rounded-xl border bg-white px-4 text-sm font-semibold">
            Filtrar
          </button>
        </form>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-border text-muted border-b bg-zinc-50">
                <tr>
                  <th className="p-4">Data</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Pagamento</th>
                  <th className="p-4">Peças</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {sales?.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-border border-b last:border-0"
                  >
                    <td className="p-4">{formatDate(sale.sold_at)}</td>
                    <td className="p-4 font-semibold">
                      {sale.customers?.name ?? "Consumidor não identificado"}
                    </td>
                    <td className="p-4">
                      {paymentLabels[sale.payment_method] ??
                        sale.payment_method}
                    </td>
                    <td className="p-4">{sale.pieces_count}</td>
                    <td className="p-4 font-semibold">
                      {formatCurrency(sale.total_amount)}
                    </td>
                    <td className="p-4">
                      <Badge
                        tone={sale.status === "completed" ? "green" : "red"}
                      >
                        {sale.status === "completed"
                          ? "Concluída"
                          : "Cancelada"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        className="text-primary font-semibold"
                        href={`/vendas/${sale.id}`}
                      >
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!sales?.length && (
            <div className="grid min-h-64 place-items-center text-center">
              <div>
                <ShoppingBag className="mx-auto mb-3 text-zinc-300" />
                <p className="font-semibold">Nenhuma venda encontrada</p>
                <p className="text-muted text-sm">
                  Registre a primeira venda da loja.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
