"use client";

import { History, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { registerPayment, reversePayment } from "./actions";

type Payment = {
  id: string;
  amount: number;
  paid_at: string;
  method: string;
  notes: string | null;
  reversed_at: string | null;
};
type Props = {
  receivableId: string;
  customerName: string;
  phone: string | null;
  balance: number;
  dueDate: string;
  payments: Payment[];
};
const input =
  "mt-2 h-10 w-full rounded-xl border border-border bg-white px-3 outline-none focus:border-primary";

export function ReceivableActions(props: Props) {
  const [panel, setPanel] = useState<"receive" | "history" | null>(null);
  const message = encodeURIComponent(
    `Olá, ${props.customerName}! Lembramos que há um saldo de ${formatCurrency(props.balance)} com vencimento em ${formatDate(props.dueDate)}.`,
  );
  return (
    <div className="flex items-center justify-end gap-3">
      {props.balance > 0 && (
        <button
          type="button"
          className="text-primary font-semibold"
          onClick={() => setPanel("receive")}
        >
          Receber
        </button>
      )}
      {props.phone && props.balance > 0 && (
        <a
          href={`https://wa.me/55${props.phone}?text=${message}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Cobrar ${props.customerName} no WhatsApp`}
          className="text-emerald-600"
        >
          <MessageCircle size={18} />
        </a>
      )}
      <button
        type="button"
        className="text-muted"
        aria-label="Histórico de pagamentos"
        onClick={() => setPanel("history")}
      >
        <History size={18} />
      </button>
      {panel && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPanel(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={
              panel === "receive"
                ? "Receber parcela"
                : "Histórico de pagamentos"
            }
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {panel === "receive" ? "Receber parcela" : "Histórico"}
              </h2>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setPanel(null)}
              >
                <X />
              </button>
            </div>
            {panel === "receive" ? (
              <form action={registerPayment} className="mt-5 space-y-4">
                <input
                  type="hidden"
                  name="receivableId"
                  value={props.receivableId}
                />
                <label className="block text-sm font-semibold">
                  Valor (saldo {formatCurrency(props.balance)})
                  <input
                    className={input}
                    name="amount"
                    type="number"
                    min="0.01"
                    max={props.balance}
                    step="0.01"
                    defaultValue={props.balance}
                    required
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Data
                  <input
                    className={input}
                    name="paidAt"
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    required
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Forma
                  <select className={input} name="method" defaultValue="pix">
                    <option value="pix">PIX</option>
                    <option value="card">Cartão</option>
                    <option value="cash">Dinheiro</option>
                  </select>
                </label>
                <label className="block text-sm font-semibold">
                  Observação
                  <input className={input} name="notes" maxLength={500} />
                </label>
                <Button className="w-full" type="submit">
                  Confirmar recebimento
                </Button>
              </form>
            ) : (
              <div className="mt-5 space-y-3">
                {props.payments.length ? (
                  props.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="border-border rounded-xl border p-3 text-sm"
                    >
                      <div className="flex justify-between">
                        <span>{formatDate(payment.paid_at)}</span>
                        <strong>{formatCurrency(payment.amount)}</strong>
                      </div>
                      <p className="text-muted mt-1">
                        {payment.method.toUpperCase()}
                        {payment.notes ? ` · ${payment.notes}` : ""}
                      </p>
                      {payment.reversed_at ? (
                        <p className="mt-2 text-red-600">Estornado</p>
                      ) : (
                        <form
                          action={reversePayment}
                          className="mt-2 text-right"
                        >
                          <input
                            type="hidden"
                            name="paymentId"
                            value={payment.id}
                          />
                          <button className="font-semibold text-red-600">
                            Estornar
                          </button>
                        </form>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-sm">
                    Nenhum pagamento registrado.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
