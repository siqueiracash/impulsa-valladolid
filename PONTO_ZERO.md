# CHECKPOINT: PONTO ZERO (Atualizado 22/04/2026)

Este documento registra o estado consolidado e estável do projeto "Impulsa Valladolid" após a conclusão da fase de auditoria IA, dashboard administrativo e integração completa com WhatsApp.

## 🛡️ Mudanças Críticas Consolidadas:
1. **Segurança Avançada**: 
   - **Helmet**: Adição de headers de segurança para mitigar ataques comuns.
   - **Rate Limiting**: Proteção contra spam e brute-force nas rotas de auditoria e login.
   - **API Protection**: Acesso aos leads protegido no servidor por `Authorization: Bearer <password>`.
   - **Admin Dinâmico**: Senha de administrador movida para variável de ambiente (`ADMIN_PASSWORD`).
2. **WhatsApp Estratégico**: Todos os pontos de contato direcionam para `+351 929 051 990` com mensagens personalizadas em espanhol para conversão imediata.
3. **Dashboard de Resiliência**: Sistema de leads com "Tripla Sincronização" (Backend API -> Supabase Fallback -> Memory). Inclui ferramentas de debug e diagnóstico de conexão em tempo real.
4. **Endereço Físico Ativo**: Atualizado para a nova sede em Valladolid: *Spazio Rio - P.º Isabel la Católica, 5, 47001*.
5. **UX Responsiva**: Seções do site (principalmente a área de planos e garantias) otimizadas para celulares, evitando cortes de texto e sobreposição de elementos.
6. **Auditoria Gemini**: Prompt de IA ultra-refinado para soar como um consultor humano local de Valladolid, con integração via Google Search Grounding para dados reais.

## 🏗️ Arquitetura Atual (Vercel Ready)
- **Frontend**: React 19 + Vite 6 + Tailwind CSS.
- **Backend/API**: Express 4 rodando em lambdas Vercel (diretório `/api`).
- **Banco de Dados**: Supabase (PostgreSQL) com lógica de fallback direto no client-side para evitar timeouts de API.
- **Storage**: PDF generation via jsPDF totalmente integrado.

## 🔑 Configurações Críticas (Secrets)
As seguintes chaves devem estar presentes para o funcionamento total:
- `VITE_SUPABASE_URL`: Endpoint do Supabase.
- `VITE_SUPABASE_ANON_KEY`: Anon Key do Supabase.
- `GEMINI_API_KEY`: Para o consultor de auditoria IA.

## 📂 Arquivos Essenciais para Restauração
- `/server.ts`: Motor da API e servir estático.
- `/api/index.ts`: Adaptador Vercel.
- `/src/App.tsx`: Interface principal (Audit + Dashboard).
- `/src/lib/supabase.ts`: Gerenciador de conexão persistente.
- `/src/services/geminiService.ts`: Core da inteligência da consultoria.

**Estado Atual: PRODUÇÃO/STABLE**
