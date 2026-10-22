import { Plus } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { CustomerList } from "@/features/customers/customer-list";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  const { created, updated, deleted, error } = await searchParams;
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customer_summary")
    .select("*")
    .order("name");

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-primary text-sm font-medium">Relacionamento</p>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted mt-1 text-sm">
              Histórico de compras e valores a receber.
            </p>
          </div>
          <Link
            href="/clientes/novo"
            className="bg-primary inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white"
          >
            <Plus size={18} /> Novo cliente
          </Link>
        </div>

        {(created || updated || deleted) && (
          <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            Cliente{" "}
            {created ? "cadastrado" : updated ? "atualizado" : "excluído"} com
            sucesso.
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error === "sales"
              ? "Cancele todas as vendas do cliente antes de excluir o cadastro."
              : error === "receivables"
                ? "Exclua as contas a receber do cliente antes de excluir o cadastro."
                : "Não foi possível concluir a operação."}
          </p>
        )}

        <CustomerList customers={customers ?? []} />
      </div>
    </AppShell>
  );
}
