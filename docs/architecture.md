# Arquitetura

## Visão geral

O ModaStore usa Next.js App Router como aplicação fullstack e Supabase para autenticação, banco PostgreSQL e API. Server Components e Server Actions são o padrão; componentes client são usados somente quando há interação local.

## Limites de confiança

O navegador recebe apenas a URL e a chave publicável do Supabase. Autorização nunca depende de dados fornecidos pelo navegador: todas as tabelas de negócio terão RLS habilitada e forçada, associando cada linha à loja retornada por `private.current_store_id()`.

O `proxy.ts` renova cookies e valida o JWT com `getClaims()` antes de liberar rotas privadas. Respostas que atualizam sessão recebem os cabeçalhos privados fornecidos por `@supabase/ssr`, evitando cache compartilhado em CDNs.

## Organização

- `src/app`: rotas e layouts
- `src/components`: componentes visuais reutilizáveis
- `src/features`: regras e UI agrupadas por domínio
- `src/lib`: integrações e utilitários
- `supabase`: configuração, migrations, seed e testes pgTAP
- `tests/e2e`: fluxos críticos no navegador

## Fases

1. Fundação
2. Banco e segurança
3. Autenticação
4. Estoque
5. Clientes
6. Vendas
7. Contas a receber
8. Relatórios e dashboard
9. Acabamento e release
