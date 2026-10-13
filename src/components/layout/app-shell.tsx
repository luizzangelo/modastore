"use client";

import {
  Boxes,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Settings,
  ShoppingBag,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Estoque", icon: Boxes, href: "/estoque" },
  { label: "Clientes", icon: Users, href: "/clientes" },
  { label: "Vendas", icon: ShoppingBag, href: "/vendas" },
  { label: "Contas a receber", icon: WalletCards, href: "/contas-a-receber" },
  { label: "Relatórios", icon: TrendingUp, href: "/relatorios" },
  { label: "Configurações", icon: Settings, href: "/configuracoes" },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 font-bold tracking-tight">
      <span className="bg-primary grid size-10 place-items-center rounded-xl text-white shadow-md shadow-violet-200">
        <ReceiptText aria-hidden="true" size={21} />
      </span>
      <span className="text-xl">ModaStore</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <header className="border-border sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 lg:hidden">
        <Brand />
        <Button
          variant="ghost"
          className="size-10 px-0"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </header>
      {open && (
        <button
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={cn(
          "border-border fixed inset-y-0 left-0 z-40 flex w-[260px] -translate-x-full flex-col border-r bg-white p-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open && "translate-x-0",
        )}
      >
        <div className="mb-9 hidden px-2 lg:block">
          <Brand />
        </div>
        <nav aria-label="Menu principal" className="flex flex-1 flex-col gap-1">
          {navigation.map(({ label, icon: Icon, href }, index) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "text-muted hover:text-primary flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-violet-50",
                index === 0 && "text-primary bg-violet-50",
              )}
            >
              <Icon aria-hidden="true" size={19} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-border border-t pt-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-zinc-50">
            <span className="text-primary grid size-9 place-items-center rounded-full bg-violet-100 text-sm font-bold">
              MS
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">
                Minha loja
              </span>
              <span className="text-muted block truncate text-xs">
                Administrador
              </span>
            </span>
            <ChevronDown aria-hidden="true" size={16} className="text-muted" />
          </button>
          <button className="text-muted mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-red-50 hover:text-red-600">
            <LogOut aria-hidden="true" size={18} /> Sair
          </button>
        </div>
      </aside>
      <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
