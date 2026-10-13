# Banco de dados

As migrations versionadas ficam em `supabase/migrations`. O modelo inicial inclui lojas, produtos e variações, clientes, vendas e itens, contas a receber e pagamentos.

O schema `public` é exposto pela Data API com RLS habilitada e forçada. Funções auxiliares privilegiadas ficam no schema não exposto `private`, com `search_path` vazio e permissões explícitas. As tabelas financeiras bloqueiam escrita direta; pagamentos, estornos e cancelamentos passam por RPCs transacionais.

## Comandos

```bash
pnpm exec supabase db reset
pnpm db:test
pnpm db:lint
pnpm db:types
```

O seed local cria duas lojas fictícias e parcelas pagas, parciais, vencidas e em aberto. As credenciais de desenvolvimento estão comentadas em `supabase/seed.sql` e nunca devem ser usadas em produção.

## RPCs

- `create_sale(payload)`: venda manual ou itemizada, baixa de estoque e fiado em uma transação.
- `cancel_sale(sale_id)`: restaura estoque e cancela parcelas, bloqueando quando há pagamento ativo.
- `register_receivable_payment(...)`: pagamento parcial ou total com bloqueio da parcela.
- `reverse_receivable_payment(payment_id)`: estorno auditável.
- `create_manual_receivables(...)`: dívida avulsa sem gerar venda.
