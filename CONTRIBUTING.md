# Como contribuir

1. Crie uma branch curta a partir de `main`.
2. Instale dependências com `pnpm install`.
3. Faça mudanças pequenas e inclua testes.
4. Rode `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
5. Use Conventional Commits, por exemplo `feat(products): add size variants`.

Mudanças no banco precisam de migration versionada, RLS e testes pgTAP que comprovem o isolamento entre lojas.
