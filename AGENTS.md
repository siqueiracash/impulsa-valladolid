# Instruções de Persistência

## Ponto Zero
- Se o usuário solicitar "volte para o ponto zero", você deve restaurar a arquitetura e as configurações documentadas no arquivo `PONTO_ZERO.md`.
- Esta configuração garante que o app funcione no Vercel com fallback direto para o Supabase caso a API serverless falhe.

## Convenções do Projeto
- **Backend**: Express rodando como Vercel Function (pasta `/api`).
- **Supabase**: Sempre usar a lógica de fallback direto no frontend para evitar erros de timeout do Vercel no Dashboard.
- **Estilização**: Tailwind CSS com a identidade visual da Impulsa Valladolid (Brand Red, Brand Teal, Brand Cream).
