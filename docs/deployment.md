# Publicação

## Aplicação

O container de produção escuta na porta `3000` e executa o build standalone do Next.js como usuário sem privilégios. Configure no provedor:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_ALLOW_SIGNUP=false`
- `NEXT_PUBLIC_APP_URL=https://modastore.luizangelo.com.br`

Não configure a senha do Postgres no container: o aplicativo acessa o banco com a chave publicável e RLS.

## Cloudflare

Os apontamentos exatos dependem do provedor onde o container será publicado. Depois do deploy, crie um registro `CNAME` para `modastore` apontando ao hostname fornecido pelo provedor; se houver um IP fixo, use registro `A`. Mantenha o proxy laranja habilitado somente se o provedor aceitar tráfego via Cloudflare e configure SSL/TLS como `Full (strict)`.

Rotas autenticadas não devem ser armazenadas em cache. Crie uma regra de cache bypass para `modastore.luizangelo.com.br/*`; assets imutáveis de `/_next/static/*` podem ser armazenados normalmente.
