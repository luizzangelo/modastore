import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  Plus,
  ShoppingBag,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const metrics = [
  {
    label: "Vendas hoje",
    value: "R$ 0,00",
    detail: "0% vs. ontem",
    icon: ShoppingBag,
    positive: true,
  },
  {
    label: "Clientes novos",
    value: "0",
    detail: "Nesta semana",
    icon: Users,
    positive: true,
  },
  {
    label: "Vendas do mês",
    value: "R$ 0,00",
    detail: "0% vs. mês anterior",
    icon: CircleDollarSign,
    positive: true,
  },
  {
    label: "Produtos",
    value: "0",
    detail: "0 com estoque baixo",
    icon: Boxes,
    positive: false,
  },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-primary mb-1 text-sm font-medium">Visão geral</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h1>
            <p className="text-muted mt-1 text-sm">
              Acompanhe os principais números da sua loja.
            </p>
          </div>
          <Button>
            <Plus aria-hidden="true" size={18} /> Nova venda
          </Button>
        </div>
        <section
          aria-label="Indicadores"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {metrics.map(({ label, value, detail, icon: Icon, positive }) => (
            <Card key={label} className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-muted text-sm font-medium">{label}</span>
                <span className="text-primary grid size-10 place-items-center rounded-xl bg-violet-50">
                  <Icon aria-hidden="true" size={20} />
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              <p className="text-muted mt-2 flex items-center gap-1 text-xs">
                {positive ? (
                  <ArrowUpRight
                    aria-hidden="true"
                    className="text-emerald-600"
                    size={15}
                  />
                ) : (
                  <ArrowDownRight
                    aria-hidden="true"
                    className="text-red-500"
                    size={15}
                  />
                )}
                {detail}
              </p>
            </Card>
          ))}
        </section>
        <Card className="mt-4 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-muted text-sm font-medium">A receber</p>
              <p className="mt-1 text-2xl font-bold">R$ 0,00</p>
            </div>
            <div className="text-left sm:text-right">
              <Badge tone="red">R$ 0,00 vencido</Badge>
              <p className="text-muted mt-2 text-xs">
                Nenhuma parcela pendente
              </p>
            </div>
          </div>
        </Card>
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <Card className="min-h-72 p-5 sm:p-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="font-bold">Vendas recentes</h2>
                <p className="text-muted text-sm">
                  As 5 últimas vendas realizadas
                </p>
              </div>
              <Button variant="ghost">Ver todas</Button>
            </div>
            <div className="border-border grid min-h-36 place-items-center rounded-xl border border-dashed bg-zinc-50/70 text-center">
              <div>
                <ShoppingBag
                  aria-hidden="true"
                  className="mx-auto mb-3 text-zinc-300"
                />
                <p className="text-sm font-medium">Nenhuma venda registrada</p>
                <p className="text-muted mt-1 text-xs">
                  Suas vendas mais recentes aparecerão aqui.
                </p>
              </div>
            </div>
          </Card>
          <Card className="min-h-72 p-5 sm:p-6">
            <h2 className="font-bold">Alertas</h2>
            <p className="text-muted text-sm">
              Itens que precisam da sua atenção
            </p>
            <div className="mt-8 grid min-h-36 place-items-center rounded-xl bg-emerald-50/60 text-center">
              <div>
                <span className="mx-auto mb-3 grid size-9 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  ✓
                </span>
                <p className="text-sm font-medium text-emerald-900">
                  Tudo em ordem
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  Você não possui alertas no momento.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
