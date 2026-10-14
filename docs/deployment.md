# Publicação

## Aplicação na VPS

O container de produção escuta na porta `3000` e executa o build standalone do Next.js como usuário sem privilégios. Configure no provedor:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_ALLOW_SIGNUP=false`
- `NEXT_PUBLIC_APP_URL=https://modastore.example.com`
- `APP_HOST=modastore.example.com`

Não configure a senha do Postgres no container: o aplicativo acessa o banco com a chave publicável e RLS.

O manifesto de referência usa Docker Swarm, a rede externa `network_public` e Traefik. Ele está em [`deploy/stack.yml`](../deploy/stack.yml). Substitua o domínio de exemplo pelo hostname da sua instalação. Em servidores com poucos recursos, faça o build `linux/amd64` fora da VPS e envie somente a imagem pronta.

As variáveis `NEXT_PUBLIC_*`, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` e `DEPLOYMENT_VERSION` precisam existir durante o build. A chave das Server Actions deve ser um valor base64 de 32 bytes, estável entre réplicas e builds compatíveis. Ela não deve ser commitada.

## Cloudflare

No DNS da sua zona, crie:

| Tipo | Nome        | Conteúdo            | Proxy             | TTL        |
| ---- | ----------- | ------------------- | ----------------- | ---------- |
| `A`  | `modastore` | `IP_PÚBLICO_DA_VPS` | Ativado (laranja) | Automático |

Em **SSL/TLS**, use `Full (strict)`. Não crie registro `AAAA`, pois a VPS não publica IPv6 para o serviço. O Traefik solicitará e renovará o certificado Let's Encrypt após o DNS apontar para a VPS.

Rotas autenticadas não devem ser armazenadas em cache. Crie uma regra de cache bypass para o hostname da aplicação; assets imutáveis de `/_next/static/*` podem ser armazenados normalmente.
