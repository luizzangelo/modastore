import { connection } from "next/server";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { ReportCharts } from "@/features/reports/report-charts";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

function defaultPeriod() {
  const end = new Date();
  const start = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 11, 1),
  );
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  await connection();
  const selected = await searchParams;
  const defaults = defaultPeriod();
  const start = /^\d{4}-\d{2}-\d{2}$/.test(selected.start ?? "")
    ? selected.start!
    : defaults.start;
  const end = /^\d{4}-\d{2}-\d{2}$/.test(selected.end ?? "")
    ? selected.end!
    : defaults.end;
  const supabase = await createClient();
  const [{ data: monthly }, { data: ranking }] = await Promise.all([
    supabase.rpc("get_monthly_reports", { p_start: start, p_end: end }),
    supabase.rpc("get_top_customers", { p_start: start, p_end: end }),
  ]);
  const chartData = (monthly ?? []).map((row) => ({
    month: row.month,
    revenue: Number(row.revenue),
    netProfit: Number(row.net_profit),
    newCustomers: Number(row.new_customers),
    piecesSold: Number(row.pieces_sold),
    creditSold: Number(row.credit_sold),
    received: Number(row.received),
  }));
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7">
          <p className="text-primary text-sm font-medium">Análises</p>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted mt-1 text-sm">
            Resultados por competência e recebimentos por regime de caixa.
          </p>
        </div>
        <form className="mb-5 flex flex-wrap items-end gap-3">
          <label className="text-sm font-semibold">
            De
            <input
              className="border-border mt-2 block h-11 rounded-xl border bg-white px-3"
              name="start"
              type="date"
              defaultValue={start}
            />
          </label>
          <label className="text-sm font-semibold">
            Até
            <input
              className="border-border mt-2 block h-11 rounded-xl border bg-white px-3"
              name="end"
              type="date"
              defaultValue={end}
            />
          </label>
          <button className="bg-primary h-11 rounded-xl px-4 text-sm font-semibold text-white">
            Aplicar período
          </button>
        </form>
        <ReportCharts data={chartData} />
        <Card className="mt-5 overflow-hidden">
          <div className="border-border border-b p-5">
            <h2 className="font-bold">Top 10 melhores clientes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-muted border-border border-b bg-zinc-50">
                <tr>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Quantidade de compras</th>
                  <th className="p-4">Última compra</th>
                  <th className="p-4 text-right">Total gasto</th>
                </tr>
              </thead>
              <tbody>
                {ranking?.map((customer) => (
                  <tr
                    key={customer.customer_id}
                    className="border-border border-b last:border-0"
                  >
                    <td className="p-4 font-semibold">{customer.name}</td>
                    <td className="p-4">{customer.purchases_count}</td>
                    <td className="p-4">
                      {formatDate(customer.last_purchase)}
                    </td>
                    <td className="p-4 text-right">
                      {formatCurrency(customer.total_spent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!ranking?.length && (
            <p className="text-muted p-8 text-center text-sm">
              Sem vendas no período selecionado.
            </p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
