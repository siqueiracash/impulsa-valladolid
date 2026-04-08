import { GoogleGenAI, Type } from "@google/genai";
import { AuditFormData, AuditReport } from "../types";

export async function generateAuditReport(data: AuditFormData, isMock: boolean = false): Promise<AuditReport> {
  if (isMock) {
    console.log("[Gemini] MOCK MODE: Generando reporte ficticio...");
    return {
      strengths: ["Excelente ubicación central", "Marca reconocida localmente", "Producto de alta calidad"],
      problems: ["Baja presencia en Instagram", "Sitio web lento y no optimizado", "Falta de sistema de reservas online"],
      socialMediaAnalysis: "Su presencia en redes sociales es intermitente. Aunque tiene seguidores, la falta de interacción sugiere que el contenido no está conectando con su audiencia de Valladolid.",
      technicalAnalysis: "El sitio web tiene un rendimiento de 45/100 en móviles. El tiempo de carga es superior a 4 segundos, lo que provoca una pérdida del 30% de visitantes potenciales.",
      priorityActions: ["Optimizar la biografía de Instagram", "Implementar Google My Business correctamente", "Crear una landing page de conversión"],
      serviceProposal: "En Impulsa Valladolid podemos gestionar sus redes y optimizar su web para duplicar sus reservas en 90 días.",
      storytelling: "Imagine su local un viernes por la tarde. Antes, el silencio era la norma. Ahora, gracias a una estrategia digital sólida, el teléfono no deja de sonar y cada mesa está reservada. Su negocio ha pasado de ser un secreto local a ser el punto de referencia en la ciudad."
    };
  }

  // Ajustado para buscar VITE_API_KEY conforme sua configuração na Vercel
  // En AI Studio, process.env.GEMINI_API_KEY es la forma estándar
  const apiKey = (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) || 
                 import.meta.env.VITE_GEMINI_API_KEY || 
                 import.meta.env.VITE_API_KEY;
  
  if (!apiKey || apiKey === "" || apiKey === "undefined") {
    console.error("[Gemini] No se encontró la clave de API");
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Eres un consultor experto de la agencia "Impulsa Valladolid". No eres una IA, eres un profesional local que conoce perfectamente el mercado de Valladolid y Madrid.
    
    Tu misión es crear una auditoría detallada, persuasiva y, sobre todo, HUMANA para el negocio "${data.businessName}".
    
    CONTEXTO:
    - Negocio: ${data.businessName} (${data.businessType})
    - Ubicación: ${data.location}
    - Presencia actual: ${data.website ? 'Web: ' + data.website : 'Sin web'}, ${data.instagram ? 'IG: ' + data.instagram : 'Sin Instagram'}, ${data.facebook ? 'FB: ' + data.facebook : 'Sin Facebook'}, ${data.linkedin ? 'LinkedIn: ' + data.linkedin : 'Sin LinkedIn'}, ${data.tiktok ? 'TikTok: ' + data.tiktok : 'Sin TikTok'}.
    
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

  const maxRetries = 5;
  let lastError: any = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[Gemini] Iniciando generación (Intento ${i+1}/${maxRetries})...`);
      
      // En el último intento, probamos sin herramientas por si el límite es del buscador
      const tools = i === maxRetries - 1 ? [] : [{ googleSearch: {} }];
      
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools,
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

      console.log("[Gemini] Respuesta recibida con éxito.");
      const text = result.text;
      const report = JSON.parse(text as string) as AuditReport;
      
      // Extraer fuentes de la búsqueda de Google
      const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
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
      console.error(`[Gemini] Error en intento ${i+1}:`, error.message || error);
      
      const isRetryable = error.message?.includes('503') || error.message?.includes('high demand') || error.message?.includes('429');
      
      if (isRetryable && i < maxRetries - 1) {
        // Wait before retrying (exponential backoff: 3s, 6s, 12s, 24s...)
        const waitTime = Math.pow(2, i + 1) * 1500;
        console.warn(`[Gemini] Error reintentable. Reintentando en ${waitTime/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
