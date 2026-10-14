import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { updatePassword, updateStore } from "@/features/settings/actions";
import { createClient } from "@/lib/supabase/server";

export const instant = false;
const input =
  "mt-2 h-11 w-full rounded-xl border border-border bg-white px-3 outline-none focus:border-primary";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string; password?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: store } = await supabase.from("stores").select("name").single();
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-7">
          <p className="text-primary text-sm font-medium">Administração</p>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted mt-1 text-sm">
            Dados da loja e segurança da conta.
          </p>
        </div>
        {(params.store || params.password) && (
          <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            Alteração salva com sucesso.
          </p>
        )}
        {params.error && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            Não foi possível salvar. Revise os campos.
          </p>
        )}
        <Card className="p-6">
          <h2 className="text-lg font-bold">Dados da loja</h2>
          <form action={updateStore} className="mt-4 space-y-4">
            <label className="block text-sm font-semibold">
              Nome da loja
              <input
                className={input}
                name="name"
                defaultValue={store?.name}
                minLength={2}
                maxLength={120}
                required
              />
            </label>
            <div className="text-right">
              <Button type="submit">Salvar nome</Button>
            </div>
          </form>
        </Card>
        <Card className="mt-5 p-6">
          <h2 className="text-lg font-bold">Alterar senha</h2>
          <p className="text-muted mt-1 text-sm">
            Use no mínimo 8 caracteres e evite senhas reutilizadas.
          </p>
          <form action={updatePassword} className="mt-4 space-y-4">
            <label className="block text-sm font-semibold">
              Nova senha
              <input
                className={input}
                name="password"
                type="password"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </label>
            <label className="block text-sm font-semibold">
              Confirmar nova senha
              <input
                className={input}
                name="confirmation"
                type="password"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </label>
            <div className="text-right">
              <Button type="submit">Atualizar senha</Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
