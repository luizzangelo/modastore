import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { createCustomer } from "@/features/customers/actions";
import { CustomerForm } from "@/features/customers/customer-form";

export const instant = false;

const messages: Record<string, string> = {
  invalid: "Revise os campos informados.",
  phone: "Esse telefone já pertence a outro cliente.",
  save: "Não foi possível salvar o cliente.",
};

export default async function NewCustomerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <Link
          href="/clientes"
          className="text-muted mb-5 inline-flex items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft size={17} /> Voltar
        </Link>
        <h1 className="text-3xl font-bold">Novo cliente</h1>
        <p className="text-muted mt-1 text-sm">
          Cadastre os dados básicos do cliente.
        </p>
        <Card className="mt-6 p-6">
          {error && (
            <p
              role="alert"
              className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {messages[error] ?? messages.save}
            </p>
          )}
          <CustomerForm action={createCustomer} />
        </Card>
      </div>
    </AppShell>
  );
}
