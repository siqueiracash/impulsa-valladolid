# CHECKPOINT: PONTO ZERO (15/04/2026)

Este documento registra o estado estável do projeto "Impulsa Valladolid" após a correção da integração Vercel + Supabase.

## 🏗️ Arquitetura Atual
- **Frontend**: React + Vite + Tailwind CSS.
- **Backend**: Express (Serverless via Vercel Functions).
- **Banco de Dados**: Supabase.
- **Hospedagem**: Vercel.

## 🔑 Configurações Críticas
As seguintes variáveis de ambiente **DEVEM** estar configuradas tanto no AI Studio (Secrets) quanto no Dashboard do Vercel:
- `VITE_SUPABASE_URL`: URL do projeto Supabase.
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase.

## 🛠️ Lógica de Resiliência (Ponto Zero)
1. **Inicialização Híbrida (`src/lib/supabase.ts`)**: O cliente Supabase tenta carregar via variáveis de ambiente do Vite primeiro, e oferece uma função `initSupabase` para carregamento dinâmico.
2. **Vercel Entry Point (`api/index.ts` & `vercel.json`)**: Configuração que permite ao Express rodar como uma Vercel Function, resolvendo erros 404 em domínios próprios.
3. **Fallback Direto (`src/App.tsx`)**: A função `fetchLeads` tenta buscar via API (`/api/admin/leads-data`). Se falhar (Timeout ou Erro 500 do Vercel), ela faz o bypass automático e busca os dados diretamente do Supabase no lado do cliente.
4. **Configuração Dinâmica**: O frontend busca `/api/config` no carregamento para garantir que as chaves estejam sincronizadas entre backend e frontend.

## 📂 Arquivos Essenciais
- `/server.ts`: Servidor Express refatorado para exportar `createServer`.
- `/api/index.ts`: Adaptador para Vercel.
- `/vercel.json`: Regras de rewrite para SPA e API.
- `/src/lib/supabase.ts`: Gerenciador de instância única do Supabase.
- `/src/App.tsx`: Lógica de UI e sincronização com fallback.
