import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cancelSale } from "@/features/sales/actions";
import { saleIdSchema } from "@/features/sales/schemas";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function SaleDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; canceled?: string }>;
}) {
  const [{ id }, statusParams] = await Promise.all([params, searchParams]);
  if (!saleIdSchema.safeParse(id).success) notFound();
  const supabase = await createClient();
  const [{ data: sale }, { data: items }, { data: receivables }] =
    await Promise.all([
      supabase
        .from("sales")
        .select("*,customers(name,phone)")
        .eq("id", id)
        .single(),
      supabase
        .from("sale_items")
        .select("*")
        .eq("sale_id", id)
        .order("product_name"),
      supabase
        .from("receivables_with_status")
        .select("*")
        .eq("sale_id", id)
        .order("installment_number"),
    ]);
  if (!sale) notFound();
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <Link
          href="/vendas"
          className="text-muted mb-5 inline-flex items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft size={17} /> Voltar
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Detalhes da venda</h1>
            <p className="text-muted mt-1 text-sm">
              {formatDate(sale.sold_at)} ·{" "}
              {sale.customers?.name ?? "Consumidor não identificado"}
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={`/vendas/${id}/comprovante`}
              className="border-border inline-flex h-10 items-center gap-2 rounded-xl border bg-white px-4 text-sm font-semibold"
            >
              <Download size={17} /> CSV
            </a>
            {sale.status === "completed" && (
              <form action={cancelSale}>
                <input type="hidden" name="id" value={id} />
                <Button type="submit" variant="outline">
                  Cancelar venda
                </Button>
              </form>
            )}
          </div>
        </div>
        {statusParams.error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            Não foi possível cancelar. Estorne todos os pagamentos recebidos
            antes.
          </p>
        )}
        {statusParams.canceled && (
          <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            Venda cancelada e estoque devolvido.
          </p>
        )}
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <Card className="p-4">
            <p className="text-muted text-xs">Total</p>
            <p className="mt-1 text-xl font-bold">
              {formatCurrency(sale.total_amount)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-muted text-xs">Custo</p>
            <p className="mt-1 text-xl font-bold">
              {formatCurrency(sale.total_cost)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-muted text-xs">Peças</p>
            <p className="mt-1 text-xl font-bold">{sale.pieces_count}</p>
          </Card>
          <Card className="p-4">
            <p className="text-muted text-xs">Status</p>
            <Badge
              className="mt-2"
              tone={sale.status === "completed" ? "green" : "red"}
            >
              {sale.status === "completed" ? "Concluída" : "Cancelada"}
            </Badge>
          </Card>
        </div>
        <Card className="mt-5 overflow-hidden">
          <div className="border-border border-b p-4 font-bold">Itens</div>
          {items?.length ? (
            items.map((item) => (
              <div
                key={item.id}
                className="border-border flex justify-between border-b p-4 text-sm last:border-0"
              >
                <span>
                  {item.product_name} · {item.size} · {item.quantity} un.
                </span>
                <span>
                  {formatCurrency(Number(item.unit_price) * item.quantity)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-muted p-4 text-sm">
              Venda manual, sem movimentação de estoque.
            </p>
          )}
        </Card>
        {receivables && receivables.length > 0 && (
          <Card className="mt-5 overflow-hidden">
            <div className="border-border border-b p-4 font-bold">
              Parcelas do fiado
            </div>
            {receivables.map((item) => (
              <div
                key={item.id}
                className="border-border grid grid-cols-2 gap-2 border-b p-4 text-sm last:border-0 sm:grid-cols-4"
              >
                <span>
                  {item.installment_number}/{item.installments_total}
                </span>
                <span>{formatDate(item.due_date)}</span>
                <span>{formatCurrency(item.amount)}</span>
                <Badge
                  tone={
                    item.computed_status === "paid"
                      ? "green"
                      : item.computed_status === "overdue"
                        ? "red"
                        : "amber"
                  }
                >
                  {item.computed_status === "paid"
                    ? "Paga"
                    : item.computed_status === "overdue"
                      ? "Vencida"
                      : item.computed_status === "partial"
                        ? "Parcial"
                        : "Em aberto"}
                </Badge>
              </div>
            ))}
          </Card>
        )}
      </div>
    </AppShell>
  );
}
