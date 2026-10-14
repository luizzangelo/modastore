"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createProduct } from "./actions";

const input =
  "mt-2 h-11 w-full rounded-xl border border-border bg-white px-3 outline-none focus:border-primary";

export function ProductForm() {
  const [gridType, setGridType] = useState<"single" | "sizes">("single");

  return (
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
              checked={gridType === "single"}
              onChange={() => setGridType("single")}
            />{" "}
            Tamanho único
          </label>
          <label>
            <input
              type="radio"
              name="gridType"
              value="sizes"
              checked={gridType === "sizes"}
              onChange={() => setGridType("sizes")}
            />{" "}
            P, M, G e GG
          </label>
        </div>
      </fieldset>
      {gridType === "single" ? (
        <label className="block max-w-52 text-sm font-semibold">
          Único
          <input
            className={input}
            name="unico"
            type="number"
            min="0"
            defaultValue="0"
          />
        </label>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
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
      )}
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
  );
}
