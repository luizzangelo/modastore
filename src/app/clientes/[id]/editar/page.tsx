import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { updateCustomer } from "@/features/customers/actions";
import { CustomerForm } from "@/features/customers/customer-form";
import { customerIdSchema } from "@/features/customers/schemas";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

const messages: Record<string, string> = {
  phone: "Esse telefone já pertence a outro cliente.",
  save: "Não foi possível salvar as alterações.",
};

export default async function EditCustomerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  if (!customerIdSchema.safeParse(id).success) notFound();
  const supabase = await createClient();
  const { data: customer } = await supabase
    .from("customers")
    .select("id,name,phone,origin,acquired_at")
    .eq("id", id)
    .single();
  if (!customer) notFound();

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <Link
          href="/clientes"
          className="text-muted mb-5 inline-flex items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft size={17} /> Voltar
        </Link>
        <h1 className="text-3xl font-bold">Editar cliente</h1>
        <p className="text-muted mt-1 text-sm">Atualize os dados cadastrais.</p>
        <Card className="mt-6 p-6">
          {error && (
            <p
              role="alert"
              className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {messages[error] ?? messages.save}
            </p>
          )}
          <CustomerForm action={updateCustomer} customer={customer} />
        </Card>
      </div>
    </AppShell>
  );
}
