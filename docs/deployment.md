# Publicação

## Aplicação na VPS

O container de produção escuta na porta `3000` e executa o build standalone do Next.js como usuário sem privilégios. Configure no provedor:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_ALLOW_SIGNUP=false`
- `NEXT_PUBLIC_APP_URL=https://modastore.luizangelo.com.br`

Não configure a senha do Postgres no container: o aplicativo acessa o banco com a chave publicável e RLS.

O ambiente oficial usa Docker Swarm na VPS `5.161.111.81`, conectado à rede externa `network_public` e publicado pelo Traefik. O manifesto está em [`deploy/stack.yml`](../deploy/stack.yml). Para preservar recursos da VPS compartilhada, faça o build `linux/amd64` fora do servidor e envie somente a imagem pronta.

As variáveis `NEXT_PUBLIC_*`, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` e `DEPLOYMENT_VERSION` precisam existir durante o build. A chave das Server Actions deve ser um valor base64 de 32 bytes, estável entre réplicas e builds compatíveis. Ela não deve ser commitada.

## Cloudflare

No DNS da zona `luizangelo.com.br`, crie:

| Tipo | Nome        | Conteúdo       | Proxy             | TTL        |
| ---- | ----------- | -------------- | ----------------- | ---------- |
| `A`  | `modastore` | `5.161.111.81` | Ativado (laranja) | Automático |

Em **SSL/TLS**, use `Full (strict)`. Não crie registro `AAAA`, pois a VPS não publica IPv6 para o serviço. O Traefik solicitará e renovará o certificado Let's Encrypt após o DNS apontar para a VPS.

Rotas autenticadas não devem ser armazenadas em cache. Crie uma regra de cache bypass para `modastore.luizangelo.com.br/*`; assets imutáveis de `/_next/static/*` podem ser armazenados normalmente.
