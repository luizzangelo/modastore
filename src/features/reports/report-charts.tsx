"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

type ReportRow = {
  month: string;
  revenue: number;
  netProfit: number;
  newCustomers: number;
  piecesSold: number;
  creditSold: number;
  received: number;
};

function monthLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function ReportCharts({ data }: { data: ReportRow[] }) {
  const rows = data.map((row) => ({ ...row, label: monthLabel(row.month) }));
  const moneyTooltip = (value: unknown) =>
    formatCurrency(Number(Array.isArray(value) ? value[0] : (value ?? 0)));
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="Faturamento e lucro">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis
              width={70}
              tickFormatter={(value) => `R$${Math.round(value / 1000)}k`}
            />
            <Tooltip formatter={moneyTooltip} />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Faturamento"
              stroke="#7c3aed"
              strokeWidth={3}
            />
            <Line
              type="monotone"
              dataKey="netProfit"
              name="Lucro líquido"
              stroke="#10b981"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Clientes novos">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar
              dataKey="newCustomers"
              name="Clientes"
              fill="#7c3aed"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Peças vendidas">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar
              dataKey="piecesSold"
              name="Peças"
              fill="#8b5cf6"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Fiado vendido x recebido">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis
              width={70}
              tickFormatter={(value) => `R$${Math.round(value / 1000)}k`}
            />
            <Tooltip formatter={moneyTooltip} />
            <Line
              type="monotone"
              dataKey="creditSold"
              name="Vendido no fiado"
              stroke="#f59e0b"
              strokeWidth={3}
            />
            <Line
              type="monotone"
              dataKey="received"
              name="Recebido"
              stroke="#10b981"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <h2 className="mb-5 font-bold">{title}</h2>
      {children}
    </Card>
  );
}
