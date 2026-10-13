import Link from "next/link";
import { Button } from "@/components/ui/button";

const input =
  "mt-2 h-11 w-full rounded-xl border border-border bg-white px-3 outline-none focus:border-primary";

type CustomerFormProps = {
  action: (formData: FormData) => Promise<void>;
  customer?: {
    id: string;
    name: string;
    phone: string | null;
    origin: string;
    acquired_at: string | null;
  };
};

export function CustomerForm({ action, customer }: CustomerFormProps) {
  return (
    <form action={action} className="space-y-5">
      {customer && <input type="hidden" name="id" value={customer.id} />}
      <label className="block text-sm font-semibold">
        Nome
        <input
          className={input}
          name="name"
          defaultValue={customer?.name}
          required
          minLength={2}
          maxLength={160}
          autoComplete="name"
        />
      </label>
      <label className="block text-sm font-semibold">
        Telefone com DDD
        <input
          className={input}
          name="phone"
          defaultValue={customer?.phone ?? ""}
          inputMode="tel"
          autoComplete="tel"
          placeholder="(85) 99999-9999"
        />
      </label>
      <fieldset>
        <legend className="text-sm font-semibold">Origem</legend>
        <div className="mt-3 flex flex-wrap gap-6">
          <label>
            <input
              type="radio"
              name="origin"
              value="new"
              defaultChecked={!customer || customer.origin === "new"}
            />{" "}
            Cliente novo
          </label>
          <label>
            <input
              type="radio"
              name="origin"
              value="existing"
              defaultChecked={customer?.origin === "existing"}
            />{" "}
            Cliente antigo
          </label>
        </div>
      </fieldset>
      <label className="block text-sm font-semibold">
        Data de aquisição
        <input
          className={input}
          name="acquiredAt"
          type="date"
          defaultValue={
            customer?.acquired_at ?? new Date().toISOString().slice(0, 10)
          }
        />
        <span className="text-muted mt-1 block text-xs">
          Obrigatória para clientes novos; ignorada para clientes antigos.
        </span>
      </label>
      <div className="flex justify-end gap-3">
        <Link
          href="/clientes"
          className="border-border inline-flex h-10 items-center rounded-xl border px-4 text-sm font-semibold"
        >
          Cancelar
        </Link>
        <Button type="submit">
          {customer ? "Salvar alterações" : "Salvar cliente"}
        </Button>
      </div>
    </form>
  );
}
