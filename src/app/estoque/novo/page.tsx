import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { ProductForm } from "@/features/products/product-form";

export const instant = false;

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <Link
          href="/estoque"
          className="text-muted mb-5 inline-flex items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft size={17} /> Voltar
        </Link>
        <h1 className="text-3xl font-bold">Novo produto</h1>
        <p className="text-muted mt-1 text-sm">
          Informe preços e estoque por tamanho.
        </p>
        <Card className="mt-6 p-6">
          {error && (
            <p
              role="alert"
              className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              Não foi possível salvar. Revise os campos.
            </p>
          )}
          <ProductForm />
        </Card>
      </div>
    </AppShell>
  );
}
