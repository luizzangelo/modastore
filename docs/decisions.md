# Registro de decisões

## 2026-10-13 — Stack base

- Next.js App Router com TypeScript estrito.
- Chave publicável moderna do Supabase, sem `service_role` no aplicativo.
- Componentes de servidor por padrão.
- Interface em pt-BR; nomes técnicos em inglês.

## Regras financeiras já definidas

- Faturamento e lucro seguem regime de competência pela data da venda.
- Recebimentos seguem regime de caixa pela data do pagamento.
- Parcelas usam centavos inteiros; diferença de arredondamento vai para a última parcela.
- Vencimentos avançam por mês de calendário e ajustam para o último dia do mês.
- Venda com pagamento recebido não pode ser cancelada antes do estorno.
- Exportação do histórico usará CSV por ser a alternativa mais simples e interoperável.
