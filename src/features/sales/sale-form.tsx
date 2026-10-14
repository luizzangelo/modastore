"use client";

import { Check, ChevronDown, Plus, Trash2 } from "lucide-react";
import {
  Fragment,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate, formatPhone } from "@/lib/formatters";
import { buildInstallments } from "@/lib/money";
import { createSale, type SaleActionState } from "./actions";

type Customer = { id: string; name: string; phone: string | null };
type Variant = {
  id: string;
  label: string;
  stock: number;
  salePrice: number;
  costPrice: number;
};

const input =
  "mt-2 h-11 w-full rounded-xl border border-border bg-white px-3 outline-none focus:border-primary";
const initialState: SaleActionState = { message: "" };

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function SaleForm({
  customers,
  variants,
}: {
  customers: Customer[];
  variants: Variant[];
}) {
  const [state, formAction, pending] = useActionState(createSale, initialState);
  const [customerType, setCustomerType] = useState<"new" | "existing">(
    "existing",
  );
  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerListOpen, setCustomerListOpen] = useState(false);
  const customerPicker = useRef<HTMLDivElement>(null);
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [items, setItems] = useState([{ variant_id: "", quantity: 1 }]);
  const [manualTotal, setManualTotal] = useState(0);
  const [installments, setInstallments] = useState(1);
  const [firstDueDate, setFirstDueDate] = useState("");
  const selectedItems = items.filter((item) => item.variant_id);
  const itemizedTotal = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) =>
          sum +
          (variants.find((v) => v.id === item.variant_id)?.salePrice ?? 0) *
            item.quantity,
        0,
      ),
    [selectedItems, variants],
  );
  const total = selectedItems.length ? itemizedTotal : manualTotal;
  const selectedCustomer = customers.find(
    (customer) => customer.id === customerId,
  );
  const matchingCustomers = useMemo(() => {
    const search = normalizeSearch(customerSearch);
    return customers
      .filter(
        (customer) =>
          !search || normalizeSearch(customer.name).includes(search),
      )
      .slice(0, 10);
  }, [customerSearch, customers]);
  const preview =
    paymentMethod === "credit" && firstDueDate && total > 0
      ? buildInstallments(total, installments, firstDueDate)
      : [];

  useEffect(() => {
    function closeCustomerList(event: PointerEvent) {
      if (!customerPicker.current?.contains(event.target as Node)) {
        setCustomerListOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeCustomerList);
    return () => document.removeEventListener("pointerdown", closeCustomerList);
  }, []);

  function updateItem(
    index: number,
    field: "variant_id" | "quantity",
    value: string,
  ) {
    setItems((current) =>
      current.map((item, position) =>
        position === index
          ? { ...item, [field]: field === "quantity" ? Number(value) : value }
          : item,
      ),
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="items" value={JSON.stringify(selectedItems)} />
      {state.message && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {state.message}
        </p>
      )}

      <Card className="p-5">
        <h2 className="font-bold">Cliente e venda</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Tipo de cliente
            <select
              className={input}
              name="customerType"
              value={customerType}
              onChange={(event) => {
                setCustomerType(event.target.value as "new" | "existing");
                setCustomerId("");
                setCustomerSearch("");
              }}
            >
              <option value="new">Cliente novo</option>
              <option value="existing">Cliente antigo</option>
            </select>
          </label>
          {customerType === "existing" ? (
            <Fragment key="existing-customer">
              <div
                className="relative text-sm font-semibold"
                ref={customerPicker}
              >
                <label htmlFor="registered-customer-search">
                  Buscar cliente cadastrado
                </label>
                <div className="relative">
                  <input
                    id="registered-customer-search"
                    className={`${input} pr-10`}
                    type="search"
                    value={customerSearch}
                    placeholder="Digite o nome do cliente"
                    autoComplete="off"
                    required
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={customerListOpen}
                    aria-controls="registered-customers"
                    onFocus={() => setCustomerListOpen(true)}
                    onChange={(event) => {
                      const search = event.target.value;
                      setCustomerSearch(search);
                      setCustomerId("");
                      setCustomerListOpen(true);
                    }}
                  />
                  <ChevronDown
                    aria-hidden="true"
                    className="text-muted pointer-events-none absolute top-1/2 right-3 mt-1 -translate-y-1/2"
                    size={18}
                  />
                </div>
                {customerListOpen && (
                  <div
                    id="registered-customers"
                    role="listbox"
                    className="border-border absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border bg-white p-1.5 shadow-lg"
                  >
                    {matchingCustomers.length ? (
                      matchingCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          role="option"
                          aria-selected={customer.id === customerId}
                          className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left outline-none hover:bg-violet-50 focus:bg-violet-50"
                          onClick={() => {
                            setCustomerId(customer.id);
                            setCustomerSearch(customer.name);
                            setCustomerListOpen(false);
                          }}
                        >
                          <span>
                            <span className="block font-semibold">
                              {customer.name}
                            </span>
                            <span className="text-muted block text-xs font-normal">
                              {formatPhone(customer.phone)}
                            </span>
                          </span>
                          {customer.id === customerId && (
                            <Check
                              className="text-primary shrink-0"
                              size={18}
                            />
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="text-muted px-3 py-4 text-center text-sm font-normal">
                        Nenhum cliente encontrado.
                      </p>
                    )}
                  </div>
                )}
              </div>
              <input type="hidden" name="customerId" value={customerId} />
              <input type="hidden" name="customerName" value="" />
              <input type="hidden" name="customerPhone" value="" />
              {selectedCustomer && (
                <div className="border-border rounded-xl border bg-zinc-50 p-4 sm:col-span-2">
                  <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                    Cliente selecionado
                  </p>
                  <p className="mt-1 font-bold">{selectedCustomer.name}</p>
                  <p className="text-muted mt-1 text-sm">
                    Telefone: {formatPhone(selectedCustomer.phone)}
                  </p>
                </div>
              )}
            </Fragment>
          ) : (
            <Fragment key="new-customer">
              <label className="text-sm font-semibold">
                Nome do cliente (opcional)
                <input className={input} name="customerName" maxLength={160} />
              </label>
              <label className="text-sm font-semibold">
                Telefone com DDD
                <input
                  className={input}
                  name="customerPhone"
                  inputMode="tel"
                  placeholder="(85) 99999-9999"
                />
              </label>
              <input type="hidden" name="customerId" value="" />
            </Fragment>
          )}
          <label className="text-sm font-semibold">
            Data da compra
            <input
              className={input}
              name="soldAt"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
          </label>
          <label className="text-sm font-semibold">
            Canal
            <select
              className={input}
              name="channel"
              defaultValue="physical_store"
            >
              <option value="physical_store">Loja física</option>
              <option value="online">Online</option>
              <option value="mail">Correios</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="other">Outro</option>
            </select>
          </label>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold">Produtos</h2>
            <p className="text-muted text-sm">
              Deixe sem produto para informar os valores manualmente.
            </p>
          </div>
          <button
            type="button"
            className="text-primary inline-flex items-center gap-1 text-sm font-semibold"
            onClick={() =>
              setItems((value) => [...value, { variant_id: "", quantity: 1 }])
            }
          >
            <Plus size={17} /> Adicionar
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 sm:grid-cols-[1fr_110px_40px]"
            >
              <select
                className={input}
                name="variantId"
                value={item.variant_id}
                onChange={(event) =>
                  updateItem(index, "variant_id", event.target.value)
                }
                aria-label={`Produto ${index + 1}`}
              >
                <option value="">Selecione um produto</option>
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.label} — estoque {variant.stock} —{" "}
                    {formatCurrency(variant.salePrice)}
                  </option>
                ))}
              </select>
              <input
                className={input}
                name="quantity"
                value={item.quantity}
                onChange={(event) =>
                  updateItem(index, "quantity", event.target.value)
                }
                type="number"
                min="1"
                aria-label={`Quantidade ${index + 1}`}
              />
              <button
                type="button"
                aria-label="Remover produto"
                className="text-muted mt-2 grid size-11 place-items-center"
                onClick={() =>
                  setItems((value) =>
                    value.filter((_, position) => position !== index),
                  )
                }
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        {selectedItems.length ? (
          <p className="mt-4 text-right font-bold">
            Total: {formatCurrency(itemizedTotal)}
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-semibold">
              Custo total (R$)
              <input
                className={input}
                name="totalCost"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                required
              />
            </label>
            <label className="text-sm font-semibold">
              Valor total (R$)
              <input
                className={input}
                name="totalAmount"
                type="number"
                min="0.01"
                step="0.01"
                onChange={(event) => setManualTotal(Number(event.target.value))}
              />
            </label>
            <label className="text-sm font-semibold">
              Quantidade de peças
              <input
                className={input}
                name="piecesCount"
                type="number"
                min="0"
                defaultValue="0"
              />
            </label>
          </div>
        )}
        {selectedItems.length > 0 && (
          <>
            <input type="hidden" name="totalCost" value="0" />
            <input type="hidden" name="totalAmount" value="0" />
            <input type="hidden" name="piecesCount" value="0" />
          </>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="font-bold">Pagamento</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Forma de pagamento
            <select
              className={input}
              name="paymentMethod"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
            >
              <option value="pix">PIX</option>
              <option value="card">Cartão</option>
              <option value="cash">Dinheiro</option>
              <option value="credit">Fiado</option>
            </select>
          </label>
          {paymentMethod === "credit" && (
            <>
              <label className="text-sm font-semibold">
                Entrada recebida (R$)
                <input
                  className={input}
                  name="entryAmount"
                  type="number"
                  min="0"
                  max={total || undefined}
                  step="0.01"
                  defaultValue="0"
                />
              </label>
              <label className="text-sm font-semibold">
                Forma da entrada
                <select
                  className={input}
                  name="entryMethod"
                  defaultValue="cash"
                >
                  <option value="pix">PIX</option>
                  <option value="card">Cartão</option>
                  <option value="cash">Dinheiro</option>
                </select>
              </label>
              <label className="text-sm font-semibold">
                Número de parcelas
                <input
                  className={input}
                  name="installments"
                  type="number"
                  min="1"
                  max="12"
                  value={installments}
                  onChange={(event) =>
                    setInstallments(Number(event.target.value))
                  }
                />
              </label>
              <label className="text-sm font-semibold">
                Primeiro vencimento
                <input
                  className={input}
                  name="firstDueDate"
                  type="date"
                  value={firstDueDate}
                  onChange={(event) => setFirstDueDate(event.target.value)}
                  required
                />
              </label>
            </>
          )}
        </div>
        {paymentMethod !== "credit" && (
          <>
            <input type="hidden" name="entryAmount" value="0" />
            <input type="hidden" name="entryMethod" value="cash" />
            <input type="hidden" name="installments" value="1" />
            <input type="hidden" name="firstDueDate" value="" />
          </>
        )}
        {preview.length > 0 && (
          <div className="border-border mt-5 rounded-xl border p-4">
            <p className="mb-2 text-sm font-semibold">Prévia das parcelas</p>
            {preview.map((item) => (
              <div
                key={item.number}
                className="text-muted flex justify-between py-1 text-sm"
              >
                <span>
                  {item.number}/{preview.length} · {formatDate(item.dueDate)}
                </span>
                <span>{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Finalizando..." : "Finalizar venda"}
        </Button>
      </div>
    </form>
  );
}
