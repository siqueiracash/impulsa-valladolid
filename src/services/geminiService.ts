import { GoogleGenAI, Type } from "@google/genai";
import { AuditFormData, AuditReport } from "../types";

export async function generateAuditReport(data: AuditFormData): Promise<AuditReport> {
  // process.env.GEMINI_API_KEY será substituído pelo valor real durante o build do Vite
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "" || apiKey === "undefined" || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
    const prompt = `
    Você é um especialista sênior em marketing digital da agência "Impulsa Valladolid".
    Sua missão é criar uma auditoria detalhada, persuasiva e visualmente rica para um negócio local.
    
    Contexto Regional: O negócio está em ${data.location} (Espanha). Use referências locais se apropriado.
    
    Dados do Negócio:
    - Nome: ${data.businessName}
    - Tipo: ${data.businessType}
    - Localização: ${data.location}
    - Redes Sociais: 
      Instagram: ${data.instagram || 'Não informado'}
      Facebook: ${data.facebook || 'Não informado'}
      Google Business: ${data.googleBusiness || 'Não informado'}
      TikTok: ${data.tiktok || 'Não informado'}
    
    Instruções de Estilo:
    - O relatório deve ser "didático" e "não maçante".
    - Use uma linguagem simples, mas profissional.
    - No campo "Storytelling", conte uma história de sucesso futuro: como o negócio será visto daqui a 6 meses após a digitalização.
    
    Gere o relatório em JSON com:
    1. Pontos Fortes (3-4 itens)
    2. Principais Problemas (3-4 itens)
    3. Análise de Redes Sociais (Texto focado em engajamento e visual)
    4. Ações Prioritárias (Passo a passo prático)
    5. Proposta de Serviço (Como a Impulsa Valladolid resolve isso)
    6. Storytelling (Narrativa inspiradora)
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          problems: { type: Type.ARRAY, items: { type: Type.STRING } },
          socialMediaAnalysis: { type: Type.STRING },
          priorityActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          serviceProposal: { type: Type.STRING },
          storytelling: { type: Type.STRING },
        },
        required: ["strengths", "problems", "socialMediaAnalysis", "priorityActions", "serviceProposal", "storytelling"],
      },
    },
  });

  return JSON.parse(response.text || "{}") as AuditReport;
}
