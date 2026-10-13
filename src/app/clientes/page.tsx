import { MessageCircle, Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toggleCustomer } from "@/features/customers/actions";
import { formatCurrency, formatDate, formatPhone } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    created?: string;
    updated?: string;
    error?: string;
  }>;
}) {
  const { q = "", created, updated, error } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("customer_summary").select("*").order("name");
  if (q.trim()) query = query.ilike("name", `%${q.trim()}%`);
  const { data: customers } = await query;

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

        {(created || updated) && (
          <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            Cliente {created ? "cadastrado" : "atualizado"} com sucesso.
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            Não foi possível concluir a operação.
          </p>
        )}

        <form className="mb-4 flex max-w-lg gap-2" role="search">
          <label className="border-border flex h-11 flex-1 items-center gap-2 rounded-xl border bg-white px-3">
            <Search className="text-muted" size={18} aria-hidden="true" />
            <span className="sr-only">Buscar cliente</span>
            <input
              className="min-w-0 flex-1 bg-transparent outline-none"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nome"
            />
          </label>
          <button className="border-border rounded-xl border bg-white px-4 text-sm font-semibold">
            Buscar
          </button>
        </form>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-border text-muted border-b bg-zinc-50">
                <tr>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Telefone</th>
                  <th className="p-4">Última compra</th>
                  <th className="p-4">Compras</th>
                  <th className="p-4">Saldo devedor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {customers?.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-border border-b last:border-0"
                  >
                    <td className="p-4 font-semibold">{customer.name}</td>
                    <td className="p-4">{formatPhone(customer.phone)}</td>
                    <td className="p-4">
                      {formatDate(customer.last_purchase)}
                    </td>
                    <td className="p-4">{customer.purchases_count ?? 0}</td>
                    <td className="p-4 font-medium">
                      {formatCurrency(customer.outstanding_balance)}
                    </td>
                    <td className="p-4">
                      <Badge tone={customer.active ? "green" : "neutral"}>
                        {customer.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-3">
                        {customer.phone && (
                          <a
                            href={`https://wa.me/55${customer.phone}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Conversar com ${customer.name} no WhatsApp`}
                            className="text-emerald-600"
                          >
                            <MessageCircle size={18} />
                          </a>
                        )}
                        <Link
                          href={`/clientes/${customer.id}/editar`}
                          className="text-primary font-semibold"
                        >
                          Editar
                        </Link>
                        <form action={toggleCustomer}>
                          <input
                            type="hidden"
                            name="id"
                            value={customer.id ?? ""}
                          />
                          <input
                            type="hidden"
                            name="active"
                            value={String(customer.active)}
                          />
                          <button className="text-muted font-semibold">
                            {customer.active ? "Inativar" : "Ativar"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!customers?.length && (
            <div className="grid min-h-64 place-items-center text-center">
              <div>
                <Users className="mx-auto mb-3 text-zinc-300" />
                <p className="font-semibold">Nenhum cliente encontrado</p>
                <p className="text-muted text-sm">
                  {q
                    ? "Tente buscar por outro nome."
                    : "Cadastre o primeiro cliente da loja."}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
