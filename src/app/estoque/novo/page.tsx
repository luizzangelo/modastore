import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createProduct } from "@/features/products/actions";

export const instant = false;
const input =
  "mt-2 h-11 w-full rounded-xl border border-border bg-white px-3 outline-none focus:border-primary";

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
          <form action={createProduct} className="space-y-5">
            <label className="block text-sm font-semibold">
              Nome
              <input className={input} name="name" required minLength={2} />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-semibold">
                Custo (R$)
                <input
                  className={input}
                  name="costPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                />
              </label>
              <label className="text-sm font-semibold">
                Venda (R$)
                <input
                  className={input}
                  name="salePrice"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                />
              </label>
              <label className="text-sm font-semibold">
                Estoque mínimo
                <input
                  className={input}
                  name="minStock"
                  type="number"
                  min="0"
                  defaultValue="0"
                  required
                />
              </label>
            </div>
            <fieldset>
              <legend className="text-sm font-semibold">Tipo de grade</legend>
              <div className="mt-3 flex gap-6">
                <label>
                  <input
                    type="radio"
                    name="gridType"
                    value="single"
                    defaultChecked
                  />{" "}
                  Tamanho único
                </label>
                <label>
                  <input type="radio" name="gridType" value="sizes" /> P, M, G e
                  GG
                </label>
              </div>
            </fieldset>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                ["unico", "Único"],
                ["p", "P"],
                ["m", "M"],
                ["g", "G"],
                ["gg", "GG"],
              ].map(([name, label]) => (
                <label key={name} className="text-sm font-semibold">
                  {label}
                  <input
                    className={input}
                    name={name}
                    type="number"
                    min="0"
                    defaultValue="0"
                  />
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <Link
                href="/estoque"
                className="border-border inline-flex h-10 items-center rounded-xl border px-4 text-sm font-semibold"
              >
                Cancelar
              </Link>
              <Button type="submit">Salvar produto</Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
