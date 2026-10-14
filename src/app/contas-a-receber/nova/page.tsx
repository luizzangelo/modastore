import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createManualReceivable } from "@/features/receivables/actions";
import { createClient } from "@/lib/supabase/server";

export const instant = false;
const input =
  "mt-2 h-11 w-full rounded-xl border border-border bg-white px-3 outline-none focus:border-primary";

export default async function NewReceivablePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("id,name")
    .eq("active", true)
    .order("name");
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <Link
          href="/contas-a-receber"
          className="text-muted mb-5 inline-flex items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft size={17} /> Voltar
        </Link>
        <h1 className="text-3xl font-bold">Nova conta</h1>
        <p className="text-muted mt-1 text-sm">
          Registre uma dívida anterior sem criar venda ou movimentar estoque.
        </p>
        <Card className="mt-6 p-6">
          {error && (
            <p
              role="alert"
              className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              Revise os campos e tente novamente.
            </p>
          )}
          <form action={createManualReceivable} className="space-y-5">
            <label className="block text-sm font-semibold">
              Cliente
              <select
                className={input}
                name="customerId"
                required
                defaultValue=""
              >
                <option value="" disabled>
                  Selecione
                </option>
                {customers?.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Descrição
              <input
                className={input}
                name="description"
                required
                minLength={2}
                maxLength={240}
                placeholder="Ex.: saldo anterior"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-semibold">
                Valor total (R$)
                <input
                  className={input}
                  name="total"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                />
              </label>
              <label className="text-sm font-semibold">
                Parcelas
                <input
                  className={input}
                  name="installments"
                  type="number"
                  min="1"
                  max="12"
                  defaultValue="1"
                  required
                />
              </label>
              <label className="text-sm font-semibold">
                Primeiro vencimento
                <input
                  className={input}
                  name="firstDueDate"
                  type="date"
                  required
                />
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <Link
                href="/contas-a-receber"
                className="border-border inline-flex h-10 items-center rounded-xl border px-4 text-sm font-semibold"
              >
                Cancelar
              </Link>
              <Button type="submit">Salvar conta</Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
