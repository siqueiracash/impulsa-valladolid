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
    Eres un consultor experto de la agencia "Impulsa Valladolid". No eres una IA, eres un profesional local que conoce perfectamente el mercado de Valladolid y Madrid.
    
    Tu misión es crear una auditoría detallada, persuasiva y, sobre todo, HUMANA para el negocio "${data.businessName}".
    
    CONTEXTO:
    - Negocio: ${data.businessName} (${data.businessType})
    - Ubicación: ${data.location}
    - Presencia actual: ${data.website ? 'Web: ' + data.website : 'Sin web'}, ${data.instagram ? 'IG: ' + data.instagram : 'Sin Instagram'}, ${data.googleBusiness ? 'Google: ' + data.googleBusiness : 'Sin Google Business'}.
    
    REGLAS DE ORO PARA EL TONO (CRÍTICO):
    1. NO PAREZCAS UNA IA. Evita frases como "Como experto en marketing", "En conclusión", "Es importante destacar".
    2. ESCRIBE COMO UN SER HUMANO. Usa un tono cercano, profesional pero empático, como si estuvieras tomando un café con el dueño del negocio en la Plaza Mayor de Valladolid.
    3. STORYTELLING: En el campo "storytelling", no hagas una lista. Cuenta una historia real. Empieza describiendo la situación actual (el silencio en el local, la invisibilidad digital) y narra la transformación hacia un local lleno de vida, risas y notificaciones de reservas. Haz que el dueño se visualice en ese éxito.
    4. PERSONALIZACIÓN: Usa el nombre del negocio y referencias a su sector de forma natural.
    
    ESTRUCTURA DEL JSON (RESPONDE SOLO EL JSON):
    - strengths: 3-4 puntos fuertes reales que el negocio puede potenciar.
    - problems: 3-4 obstáculos críticos que le están haciendo perder dinero hoy mismo.
    - socialMediaAnalysis: Un análisis honesto y directo de su situación digital actual.
    - technicalAnalysis: Un análisis técnico del sitio web (si existe) basado en datos de Google PageSpeed/Lighthouse.
    - priorityActions: Pasos prácticos y sencillos para empezar a cambiar hoy.
    - serviceProposal: Cómo Impulsa Valladolid va a tomar las riendas para que el dueño se dedique a lo que sabe hacer.
    - storytelling: La "historia del éxito" (mínimo 3 párrafos narrativos).
  `;

  const maxRetries = 3;
  let lastError: any = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              problems: { type: Type.ARRAY, items: { type: Type.STRING } },
              socialMediaAnalysis: { type: Type.STRING },
              technicalAnalysis: { type: Type.STRING },
              priorityActions: { type: Type.ARRAY, items: { type: Type.STRING } },
              serviceProposal: { type: Type.STRING },
              storytelling: { type: Type.STRING },
            },
            required: ["strengths", "problems", "socialMediaAnalysis", "technicalAnalysis", "priorityActions", "serviceProposal", "storytelling"],
          },
        },
      });

      const report = JSON.parse(response.text || "{}") as AuditReport;
      
      // Extraer fuentes de la búsqueda de Google
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        const sources: { title: string; uri: string }[] = [];
        for (const chunk of groundingChunks) {
          if (chunk.web) {
            sources.push({
              title: chunk.web.title || "Fuente de Google",
              uri: chunk.web.uri || ""
            });
          }
        }
        report.sources = sources;
      }

      return report;
    } catch (error: any) {
      lastError = error;
      const isRetryable = error.message?.includes('503') || error.message?.includes('high demand') || error.message?.includes('429');
      
      if (isRetryable && i < maxRetries - 1) {
        // Wait before retrying (exponential backoff: 1s, 2s, 4s...)
        const waitTime = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
