import { GoogleGenAI, Type } from "@google/genai";
import { AuditFormData, AuditReport } from "../types";

export async function generateAuditReport(data: AuditFormData): Promise<AuditReport> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const prompt = `
    Você é um especialista em marketing digital da agência "Impulsa Valladolid".
    Sua missão é criar uma auditoria gratuita e personalizada para um pequeno negócio em Valladolid ou Madrid.
    
    Dados do Negócio:
    - Nome: ${data.businessName}
    - Tipo: ${data.businessType}
    - Localização: ${data.location}
    - Redes Sociais: 
      Instagram: ${data.instagram || 'Não informado'}
      Facebook: ${data.facebook || 'Não informado'}
      Google Business: ${data.googleBusiness || 'Não informado'}
      TikTok: ${data.tiktok || 'Não informado'}
    
    Gere um relatório detalhado e didático com os seguintes campos:
    1. Pontos Fortes (Lista de 3-4 itens)
    2. Principais Problemas Detectados (Lista de 3-4 itens)
    3. Análise de Presença nas Redes Sociais (Texto explicativo)
    4. Ações Prioritárias (Lista de 3-5 itens)
    5. Proposta de Serviço (Uma conclusão persuasiva da Impulsa Valladolid)
    6. Storytelling (Um texto curto que conta a história do negócio do cliente sob uma perspectiva de crescimento digital, de forma inspiradora).
    
    O tom deve ser profissional, mas próximo e encorajador. Use Português do Brasil.
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
