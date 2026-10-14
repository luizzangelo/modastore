import {
  AlertTriangle,
  Boxes,
  ShoppingBag,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

function variation(current: number, previous: number) {
  if (!previous) return current ? "+100%" : "0%";
  const value = ((current - previous) / previous) * 100;
  return `${value >= 0 ? "+" : ""}${value.toFixed(0)}%`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const [
    { data: summaryRows },
    { data: recent },
    { data: lowStock },
    { data: overdue },
  ] = await Promise.all([
    supabase.rpc("get_dashboard_summary"),
    supabase
      .from("sales")
      .select("id,sold_at,total_amount,status,customers(name)")
      .order("sold_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("product_inventory")
      .select("id,name,total_stock")
      .eq("active", true)
      .eq("stock_status", "low")
      .order("total_stock")
      .limit(5),
    supabase
      .from("receivables_with_status")
      .select("id,customer_name,due_date,balance")
      .eq("computed_status", "overdue")
      .order("due_date")
      .limit(5),
  ]);
  const summary = summaryRows?.[0];
  const salesToday = Number(summary?.sales_today ?? 0);
  const salesYesterday = Number(summary?.sales_yesterday ?? 0);
  const salesMonth = Number(summary?.sales_month ?? 0);
  const previousMonth = Number(summary?.sales_previous_month ?? 0);
  const cards = [
    {
      label: "Vendas hoje",
      value: formatCurrency(salesToday),
      detail: `${variation(salesToday, salesYesterday)} vs. ontem`,
      icon: ShoppingBag,
    },
    {
      label: "Clientes novos",
      value: String(summary?.new_customers_week ?? 0),
      detail: "nos últimos 7 dias",
      icon: Users,
    },
    {
      label: "Vendas do mês",
      value: formatCurrency(salesMonth),
      detail: `${variation(salesMonth, previousMonth)} vs. mês anterior`,
      icon: ShoppingBag,
    },
    {
      label: "Produtos",
      value: String(summary?.products_total ?? 0),
      detail: `${summary?.low_stock ?? 0} com estoque baixo`,
      icon: Boxes,
    },
    {
      label: "A receber",
      value: formatCurrency(summary?.total_outstanding),
      detail: `${formatCurrency(summary?.overdue)} vencido`,
      icon: WalletCards,
    },
  ];
  const alerts = [
    ...(lowStock ?? []).map((product) => ({
      href: "/estoque",
      title: product.name ?? "Produto",
      detail: `${product.total_stock ?? 0} unidade(s) em estoque`,
    })),
    ...(overdue ?? []).map((item) => ({
      href: "/contas-a-receber?status=overdue",
      title: item.customer_name ?? "Cliente",
      detail: `${formatCurrency(item.balance)} · venceu em ${formatDate(item.due_date)}`,
    })),
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7">
          <p className="text-primary text-sm font-medium">Visão geral</p>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted mt-1 text-sm">
            Acompanhe os principais números da sua loja.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map(({ label, value, detail, icon: Icon }) => (
            <Card className="p-5" key={label}>
              <div className="text-primary mb-4 grid size-10 place-items-center rounded-xl bg-violet-50">
                <Icon size={20} />
              </div>
              <p className="text-muted text-sm">{label}</p>
              <p className="mt-1 text-2xl font-bold">{value}</p>
              <p className="text-muted mt-1 text-xs">{detail}</p>
            </Card>
          ))}
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="border-border flex items-center justify-between border-b p-5">
              <h2 className="font-bold">Vendas recentes</h2>
              <Link
                href="/vendas"
                className="text-primary text-sm font-semibold"
              >
                Ver todas
              </Link>
            </div>
            {recent?.length ? (
              recent.map((sale) => (
                <Link
                  href={`/vendas/${sale.id}`}
                  key={sale.id}
                  className="border-border flex items-center justify-between border-b p-4 text-sm last:border-0"
                >
                  <div>
                    <p className="font-semibold">
                      {sale.customers?.name ?? "Consumidor não identificado"}
                    </p>
                    <p className="text-muted">{formatDate(sale.sold_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatCurrency(sale.total_amount)}
                    </p>
                    <Badge tone={sale.status === "completed" ? "green" : "red"}>
                      {sale.status === "completed" ? "Concluída" : "Cancelada"}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-muted p-8 text-center text-sm">
                Nenhuma venda registrada.
              </p>
            )}
          </Card>
          <Card className="overflow-hidden">
            <div className="border-border border-b p-5">
              <h2 className="font-bold">Alertas</h2>
            </div>
            {alerts.map((alert, index) => (
              <Link
                href={alert.href}
                key={`${alert.title}-${index}`}
                className="border-border flex gap-3 border-b p-4 last:border-0"
              >
                <AlertTriangle className="shrink-0 text-amber-500" size={19} />
                <div>
                  <p className="text-sm font-semibold">{alert.title}</p>
                  <p className="text-muted text-xs">{alert.detail}</p>
                </div>
              </Link>
            ))}
            {!alerts.length && (
              <p className="text-muted p-8 text-center text-sm">
                Tudo em ordem por aqui.
              </p>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
