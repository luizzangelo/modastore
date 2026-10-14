# ModaStore

Sistema open source de gestão multi-loja para o varejo de moda. Cada lojista acessa somente os dados da própria loja por meio das políticas RLS do Supabase.

O MVP inclui autenticação, estoque por tamanho, clientes, vendas itemizadas e manuais, fiado, contas a receber, dashboard, relatórios e configurações.

## Stack

- Next.js 16, React 19 e TypeScript estrito
- Tailwind CSS 4 e componentes no padrão shadcn/ui
- Supabase Auth/Postgres/RLS com `@supabase/ssr`
- Vitest, Testing Library, Playwright e pgTAP
- Docker e GitHub Actions

## Pré-requisitos

- Node.js 24+
- pnpm 12.11.2 (via Corepack)
- Docker Desktop

## Desenvolvimento local

```bash
corepack enable
cp .env.example .env.local
pnpm install
pnpm dev
```

Abra `http://localhost:3000`.

### Supabase local

```bash
pnpm exec supabase start
pnpm exec supabase db reset
pnpm dev
```

Depois de iniciar o Supabase local, copie a URL e a chave publicável exibidas pelo CLI para `.env.local`.

### Docker

```bash
cp .env.example .env
docker compose up --build
```

Para desenvolvimento com volume montado:

```bash
docker compose --profile dev up dev
```

## Qualidade

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## Variáveis de ambiente

Consulte [`.env.example`](.env.example). Somente a URL e a chave **publicável** do Supabase são usadas pelo app. Nunca adicione a senha do banco nem uma chave secreta/service role ao repositório.

## Documentação

- [Arquitetura](docs/architecture.md)
- [Decisões](docs/decisions.md)
- [Banco de dados](docs/database.md)
- [Publicação e domínio](docs/deployment.md)
- [Como contribuir](CONTRIBUTING.md)
- [Segurança](SECURITY.md)

## Licença

[MIT](LICENSE)
