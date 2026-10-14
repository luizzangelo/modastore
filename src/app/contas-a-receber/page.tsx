import { Plus, WalletCards } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ReceivableActions } from "@/features/receivables/receivable-actions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

export const instant = false;
const statusMeta: Record<
  string,
  { label: string; tone: "green" | "red" | "amber" | "neutral" }
> = {
  paid: { label: "Paga", tone: "green" },
  overdue: { label: "Vencida", tone: "red" },
  partial: { label: "Parcial", tone: "amber" },
  open: { label: "Em aberto", tone: "amber" },
  canceled: { label: "Cancelada", tone: "neutral" },
};

export default async function ReceivablesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    customer?: string;
    created?: string;
    paid?: string;
    reversed?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("receivables_with_status")
    .select("*")
    .order("due_date");
  if (params.status) query = query.eq("computed_status", params.status);
  if (params.customer) query = query.eq("customer_id", params.customer);
  const [{ data: receivables }, { data: summary }, { data: customers }] =
    await Promise.all([
      query,
      supabase.from("receivables_summary").select("*").single(),
      supabase
        .from("customers")
        .select("id,name")
        .eq("active", true)
        .order("name"),
    ]);
  const ids = (receivables ?? []).flatMap((item) => (item.id ? [item.id] : []));
  const { data: payments } = ids.length
    ? await supabase
        .from("receivable_payments")
        .select("id,receivable_id,amount,paid_at,method,notes,reversed_at")
        .in("receivable_id", ids)
        .order("paid_at", { ascending: false })
    : { data: [] };
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-primary text-sm font-medium">Financeiro</p>
            <h1 className="text-3xl font-bold">Contas a receber</h1>
            <p className="text-muted mt-1 text-sm">
              Parcelas, recebimentos e cobranças.
            </p>
          </div>
          <Link
            href="/contas-a-receber/nova"
            className="bg-primary inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white"
          >
            <Plus size={18} /> Nova conta
          </Link>
        </div>
        {(params.created || params.paid || params.reversed) && (
          <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            Operação concluída com sucesso.
          </p>
        )}
        {params.error && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            Não foi possível concluir. Confira o saldo e tente novamente.
          </p>
        )}
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total a receber", summary?.total_outstanding],
            ["Vencido", summary?.overdue],
            ["Próximos 7 dias", summary?.due_next_seven_days],
            ["Recebido no mês", summary?.received_this_month],
          ].map(([label, value]) => (
            <Card className="p-5" key={String(label)}>
              <p className="text-muted text-sm">{label}</p>
              <p className="mt-2 text-2xl font-bold">
                {formatCurrency(Number(value ?? 0))}
              </p>
            </Card>
          ))}
        </div>
        <form className="mb-4 flex flex-wrap gap-3">
          <select
            className="border-border h-11 rounded-xl border bg-white px-3"
            name="status"
            defaultValue={params.status ?? ""}
          >
            <option value="">Todos os status</option>
            <option value="overdue">Vencidas</option>
            <option value="open">Em aberto</option>
            <option value="partial">Parciais</option>
            <option value="paid">Pagas</option>
            <option value="canceled">Canceladas</option>
          </select>
          <select
            className="border-border h-11 rounded-xl border bg-white px-3"
            name="customer"
            defaultValue={params.customer ?? ""}
          >
            <option value="">Todos os clientes</option>
            {customers?.map((customer) => (
              <option value={customer.id} key={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          <button className="border-border rounded-xl border bg-white px-4 text-sm font-semibold">
            Filtrar
          </button>
        </form>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="border-border text-muted border-b bg-zinc-50">
                <tr>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Venda</th>
                  <th className="p-4">Parcela</th>
                  <th className="p-4">Vencimento</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">Pago</th>
                  <th className="p-4">Saldo</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {receivables?.map((item) => {
                  const meta =
                    statusMeta[item.computed_status ?? "open"] ??
                    statusMeta.open;
                  return (
                    <tr
                      className="border-border border-b last:border-0"
                      key={item.id}
                    >
                      <td className="p-4 font-semibold">
                        <Link
                          className="hover:text-primary"
                          href={`/contas-a-receber?customer=${item.customer_id}`}
                        >
                          {item.customer_name}
                        </Link>
                      </td>
                      <td className="p-4">
                        {item.sale_id ? (
                          <Link
                            className="text-primary"
                            href={`/vendas/${item.sale_id}`}
                          >
                            Ver venda
                          </Link>
                        ) : (
                          "Manual"
                        )}
                      </td>
                      <td className="p-4">
                        {item.installment_number}/{item.installments_total}
                      </td>
                      <td className="p-4">{formatDate(item.due_date)}</td>
                      <td className="p-4">{formatCurrency(item.amount)}</td>
                      <td className="p-4">
                        {formatCurrency(item.paid_amount)}
                      </td>
                      <td className="p-4 font-bold">
                        {formatCurrency(item.balance)}
                      </td>
                      <td className="p-4">
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </td>
                      <td className="p-4">
                        <ReceivableActions
                          receivableId={item.id ?? ""}
                          customerName={item.customer_name ?? "Cliente"}
                          phone={item.customer_phone}
                          balance={Number(item.balance ?? 0)}
                          dueDate={item.due_date ?? ""}
                          payments={(payments ?? [])
                            .filter(
                              (payment) => payment.receivable_id === item.id,
                            )
                            .map((payment) => ({
                              ...payment,
                              amount: Number(payment.amount),
                            }))}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!receivables?.length && (
            <div className="grid min-h-64 place-items-center text-center">
              <div>
                <WalletCards className="mx-auto mb-3 text-zinc-300" />
                <p className="font-semibold">Nenhuma conta encontrada</p>
                <p className="text-muted text-sm">
                  Vendas no fiado aparecem aqui automaticamente.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
