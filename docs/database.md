# Banco de dados

As migrations versionadas ficam em `supabase/migrations`. A Fase 2 implementará tabelas, índices, views, RPCs, políticas RLS, seed e testes pgTAP.

O schema `public` será exposto pela Data API somente com RLS habilitada e forçada. Funções auxiliares privilegiadas ficarão no schema não exposto `private`, com `search_path` fixo e permissões explícitas.
