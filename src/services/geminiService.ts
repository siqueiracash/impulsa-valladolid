import { GoogleGenAI, Type } from "@google/genai";
import { AuditFormData, AuditReport } from "../types";

export async function generateAuditReport(data: AuditFormData): Promise<AuditReport> {
  // Ajustado para buscar VITE_API_KEY conforme sua configuração na Vercel
  const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "" || apiKey === "undefined") {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
    const prompt = `
    Eres um experto sénior en marketing digital de la agencia "Impulsa Valladolid".
    Tu misión es crear una auditoría detallada, persuasiva y visualmente rica para un negocio local.
    
    Contexto Regional: El negocio está en ${data.location} (España). Usa referencias locales si es apropiado.
    
    Datos del Negocio:
    - Nombre: ${data.businessName}
    - Tipo: ${data.businessType}
    - Localización: ${data.location}
    - Sitio Web: ${data.website || 'No informado'}
    - Redes Sociales: 
      Instagram: ${data.instagram || 'No informado'}
      Facebook: ${data.facebook || 'No informado'}
      Google Business: ${data.googleBusiness || 'No informado'}
      TikTok: ${data.tiktok || 'No informado'}
    
    Instrucciones de Estilo:
    - El informe debe ser "didáctico" y "no aburrido".
    - Usa un lenguaje sencillo pero profesional, SIEMPRE EN ESPAÑOL.
    - En el campo "Storytelling", cuenta una historia de éxito futuro: cómo se verá el negocio en 6 meses tras la digitalización.
    
    Genera el informe en JSON con:
    1. Pontos Fortes (3-4 itens)
    2. Principales Problemas (3-4 itens)
    3. Análisis de Redes Sociales (Texto enfocado en engagement y visual)
    4. Acciones Prioritarias (Paso a paso práctico)
    5. Propuesta de Servicio (Cómo Impulsa Valladolid resuelve esto)
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
