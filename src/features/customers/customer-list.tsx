"use client";

import { MessageCircle, Search, Trash2, Users, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate, formatPhone } from "@/lib/formatters";
import { deleteCustomer, toggleCustomer } from "./actions";

type Customer = {
  id: string | null;
  name: string | null;
  phone: string | null;
  last_purchase: string | null;
  purchases_count: number | null;
  outstanding_balance: number | null;
  active: boolean | null;
};

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function CustomerList({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState("");
  const [blockedMessage, setBlockedMessage] = useState("");
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );
  const filteredCustomers = useMemo(() => {
    const query = normalizeSearch(search);
    return query
      ? customers.filter((customer) =>
          normalizeSearch(customer.name ?? "").includes(query),
        )
      : customers;
  }, [customers, search]);

  return (
    <>
      {blockedMessage && (
        <div
          className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          <span>{blockedMessage}</span>
          <button
            type="button"
            aria-label="Fechar aviso"
            onClick={() => setBlockedMessage("")}
          >
            <X size={18} />
          </button>
        </div>
      )}
      <div className="mb-4 max-w-lg" role="search">
        <label className="border-border focus-within:border-primary flex h-11 items-center gap-2 rounded-xl border bg-white px-3">
          <Search className="text-muted" size={18} aria-hidden="true" />
          <span className="sr-only">Buscar cliente</span>
          <input
            className="min-w-0 flex-1 bg-transparent outline-none"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome"
            type="search"
          />
        </label>
      </div>

      <Card className="overflow-hidden">
        {filteredCustomers.length > 0 && (
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
                {filteredCustomers.map((customer) => (
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
                        <button
                          type="button"
                          aria-label={`Excluir ${customer.name}`}
                          title={
                            (customer.purchases_count ?? 0) > 0
                              ? "Cancele as vendas antes de excluir o cliente"
                              : "Excluir cliente"
                          }
                          className={
                            (customer.purchases_count ?? 0) > 0
                              ? "text-zinc-300"
                              : "text-red-600 hover:text-red-700"
                          }
                          onClick={() => {
                            if ((customer.purchases_count ?? 0) > 0) {
                              setBlockedMessage(
                                `Cancele todas as vendas de ${customer.name ?? "cliente"} antes de excluir o cadastro.`,
                              );
                              return;
                            }
                            setBlockedMessage("");
                            setCustomerToDelete(customer);
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!filteredCustomers.length && (
          <div className="grid min-h-64 place-items-center text-center">
            <div>
              <Users className="mx-auto mb-3 text-zinc-300" />
              <p className="font-semibold">Nenhum cliente encontrado</p>
              <p className="text-muted text-sm">
                {search
                  ? "Tente buscar por outro nome."
                  : "Cadastre o primeiro cliente da loja."}
              </p>
            </div>
          </div>
        )}
      </Card>

      {customerToDelete && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCustomerToDelete(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-customer-title"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 id="delete-customer-title" className="text-xl font-bold">
                Excluir cliente
              </h2>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setCustomerToDelete(null)}
              >
                <X />
              </button>
            </div>
            <p className="text-muted mt-3 text-sm">
              O cadastro de <strong>{customerToDelete.name}</strong> será
              excluído permanentemente. Deseja continuar?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCustomerToDelete(null)}
              >
                Cancelar
              </Button>
              <form action={deleteCustomer}>
                <input
                  type="hidden"
                  name="id"
                  value={customerToDelete.id ?? ""}
                />
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  Excluir cliente
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
