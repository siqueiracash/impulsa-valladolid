# CHECKPOINT: PONTO ZERO (Atualizado 22/04/2026)

Este documento registra o estado consolidado e estável do projeto "Impulsa Valladolid" após a conclusão da fase de auditoria IA, dashboard administrativo e integração completa com WhatsApp.

## 🛠️ Mudanças Críticas Consolidadas:
1. **WhatsApp Estratégico**: Todos os pontos de contato direcionam para `+55 11 98342-4080` com mensagens personalizadas em espanhol para conversão imediata.
2. **Dashboard de Resiliência**: Sistema de leads com "Tripla Sincronização" (Backend API -> Supabase Fallback -> Memory). Inclui ferramentas de debug e diagnóstico de conexão em tempo real.
3. **UX Responsiva**: Seções do site (principalmente a área de planos e garantias) otimizadas para celulares, evitando cortes de texto e sobreposição de elementos.
4. **Auditoria Gemini**: Prompt de IA ultra-refinado para soar como um consultor humano local de Valladolid, com integração via Google Search Grounding para dados reais.

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
