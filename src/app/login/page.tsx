import { ReceiptText } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { login } from "@/features/auth/actions";

export const metadata: Metadata = { title: "Entrar" };
export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#ede9fe,transparent_42%),#f7f7fb] p-4">
      <div className="w-full max-w-md">
        <div className="mb-7 flex justify-center">
          <div className="flex items-center gap-3 text-xl font-bold">
            <span className="bg-primary grid size-11 place-items-center rounded-xl text-white shadow-lg shadow-violet-200">
              <ReceiptText aria-hidden="true" size={22} />
            </span>
            ModaStore
          </div>
        </div>
        <Card className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Bem-vindo de volta
          </h1>
          <p className="text-muted mt-2 text-sm">
            Entre para acessar a gestão da sua loja.
          </p>
          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              E-mail ou senha inválidos. Tente novamente.
            </div>
          )}
          <form action={login} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold">
              E-mail
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="border-border focus:border-primary mt-2 h-11 w-full rounded-xl border bg-white px-3 font-normal transition outline-none"
                placeholder="voce@loja.com.br"
              />
            </label>
            <label className="block text-sm font-semibold">
              Senha
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                className="border-border focus:border-primary mt-2 h-11 w-full rounded-xl border bg-white px-3 font-normal transition outline-none"
                placeholder="Sua senha"
              />
            </label>
            <Button type="submit" className="mt-2 w-full">
              Entrar
            </Button>
          </form>
          <p className="text-muted mt-6 text-center text-xs leading-5">
            O cadastro público está desativado. Solicite seu acesso ao
            administrador.
          </p>
        </Card>
      </div>
    </main>
  );
}
