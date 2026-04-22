import React from 'react';
import { motion } from 'motion/react';
import { Rocket, MapPin, Phone, Mail, Instagram, Facebook, Globe, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Loader2, Sparkles, Building2, Utensils, Scissors, Coffee, Store, Dumbbell, Linkedin, Lock, LogOut, Users, Calendar, Download, Database, RefreshCcw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from './lib/utils';
import { AuditFormData, AuditReport, BusinessType } from './types';
import { generateAuditReport } from './services/geminiService';
import { jsPDF } from 'jspdf';
import { getSupabase, initSupabase, saveLeadDirectly } from './lib/supabase';

const formSchema = z.object({
  businessName: z.string().min(2, 'El nombre del negocio es obligatorio'),
  businessType: z.enum(['restaurante', 'bar', 'panaderia', 'barberia', 'peluqueria', 'cafeteria', 'gimnasio', 'otro']),
  location: z.string().min(5, 'La ubicación es obligatoria'),
  whatsapp: z.string().min(8, 'El WhatsApp es obligatorio'),
  email: z.string().email('Correo electrónico inválido'),
  website: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  tiktok: z.string().optional(),
  otherPlatforms: z.string().optional(),
}).refine((data) => {
  return data.instagram || data.facebook || data.linkedin || data.tiktok || data.website;
}, {
  message: "Debe proporcionar al menos una red social o sitio web para el análisis",
  path: ["instagram"], // Mostramos el error en instagram por defecto
});

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      let errorMessage = 'Error desconocido';
      let errorDetail = '';

      try {
        if (error instanceof Error) {
          errorMessage = error.message;
          errorDetail = error.stack || '';
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object') {
          errorMessage = (error as any).message || JSON.stringify(error);
          errorDetail = JSON.stringify(error, null, 2);
        }
      } catch (e) {
        errorMessage = 'Error al procesar el error';
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-lg w-full border-4 border-brand-red/20 text-center">
            <div className="w-20 h-20 bg-brand-red/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="w-12 h-12 text-brand-red" />
            </div>
            <h2 className="text-3xl font-black text-brand-teal mb-4 uppercase tracking-tight">Algo salió mal</h2>
            <p className="text-slate-600 font-medium mb-8 leading-relaxed">
              Lo sentimos, ha ocurrido un error inesperado en la aplicación. 
              <br />
              <span className="text-xs font-mono text-brand-red mt-4 block p-4 bg-slate-50 rounded-xl border border-slate-100 overflow-auto text-left whitespace-pre-wrap max-h-60">
                {String(errorMessage)}
                {errorDetail && (
                  <div className="mt-4 pt-4 border-t border-brand-red/10 opacity-50 text-[10px]">
                    {String(errorDetail)}
                  </div>
                )}
              </span>
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-brand-teal text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-red transition-all shadow-xl"
            >
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [view, setView] = React.useState<'hero' | 'form' | 'loading' | 'report' | 'login' | 'admin'>('hero');
  const [report, setReport] = React.useState<AuditReport | null>(null);
  const [errorModal, setErrorModal] = React.useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [step, setStep] = React.useState(1);
  const [adminLeads, setAdminLeads] = React.useState<any[]>([]);
  const [isAdminLoading, setIsAdminLoading] = React.useState(false);
  const [adminError, setAdminError] = React.useState<string | null>(null);
  const [loginData, setLoginData] = React.useState({ user: '', pass: '' });
  const [selectedLead, setSelectedLead] = React.useState<any>(null);
  const [config, setConfig] = React.useState<{ 
    supabaseUrl: string | null; 
    supabaseKey: string | null; 
    mode: string;
    isServiceRole?: boolean;
  } | null>(null);
  const totalSteps = 3;

  // Cargar configuración del servidor (evita problemas de variables de entorno en el build)
  React.useEffect(() => {
    const fetchConfig = async () => {
      try {
        console.log("[DEBUG] Buscando configuración dinámica...");
        const response = await fetch(`/api/config?t=${Date.now()}`);
        
        // Si recibe 404 o HTML, el backend no está respondiendo correctamente
        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
          console.error("[DEBUG] Backend no encontrado o respuesta inválida. Usando fallback de entorno.");
          // Fallback para variables de entorno si están disponibles
          if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
            initSupabase(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
          }
          return;
        }

        const data = await response.json();
        console.log("[DEBUG] Config recibida:", { 
          url: data.supabaseUrl ? "Presente" : "AUSENTE", 
          key: data.supabaseKey ? "Presente" : "AUSENTE" 
        });
        setConfig(data);
        if (data.supabaseUrl && data.supabaseKey) {
          initSupabase(data.supabaseUrl, data.supabaseKey);
        }
      } catch (err) {
        console.error("[DEBUG] Error al cargar configuración:", err);
      }
    };
    fetchConfig();
  }, []);

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<AuditFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessType: 'restaurante',
    }
  });

  const generatePDF = (data: AuditFormData, report: AuditReport) => {
    try {
      console.log("[DEBUG] Iniciando generatePDF Moderno");
      const doc = new jsPDF();
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      const colors = {
        red: [239, 68, 68] as [number, number, number],
        teal: [30, 41, 59] as [number, number, number],
        cream: [253, 251, 247] as [number, number, number],
        text: [51, 65, 85] as [number, number, number],
        muted: [148, 163, 184] as [number, number, number]
      };

      const addHeader = (title: string) => {
        // Fondo crema para el header
        doc.setFillColor(colors.teal[0], colors.teal[1], colors.teal[2]);
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        // Logo: Cuadrado redondeado rojo (como el sitio)
        doc.setFillColor(colors.red[0], colors.red[1], colors.red[2]);
        doc.roundedRect(margin, 10, 20, 20, 4, 4, 'F');
        
        // Icono de Cohete (Rocket) en blanco simplificado
        doc.setFillColor(255, 255, 255);
        // Cuerpo principal (triángulo alargado)
        doc.triangle(
          margin + 10, 15, // Punda
          margin + 6, 23,   // Base izquierda
          margin + 14, 23,  // Base derecha
          'F'
        );
        // Base/Motor
        doc.rect(margin + 8, 23, 4, 3, 'F');
        // Aletas
        doc.triangle(margin + 6, 21, margin + 4, 25, margin + 6, 25, 'F');
        doc.triangle(margin + 14, 21, margin + 16, 25, margin + 14, 25, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('IMPULSA', 40, 18);
        doc.setFontSize(10);
        doc.text('VALLADOLID', 40, 24);
        
        doc.setFontSize(12);
        doc.text(title, pageWidth - margin, 21, { align: 'right' });
      };

      const addFooter = (pageNum: number) => {
        doc.setFontSize(8);
        doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
        doc.text(`Impulsa Valladolid - Auditoría Estratégica Digital - Página ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      };

      let currentPage = 1;
      
      // --- PÁGINA 1: PORTADA ---
      addHeader('INFORME ESTRATÉGICO');
      
      let y = 70;
      doc.setTextColor(colors.teal[0], colors.teal[1], colors.teal[2]);
      doc.setFontSize(36);
      doc.text('Marketing', margin, y);
      y += 12;
      doc.setTextColor(colors.red[0], colors.red[1], colors.red[2]);
      doc.text('Estratégico', margin, y);
      
      y += 30;
      doc.setDrawColor(colors.red[0], colors.red[1], colors.red[2]);
      doc.setLineWidth(1);
      doc.line(margin, y, 60, y);
      
      y += 20;
      doc.setTextColor(colors.teal[0], colors.teal[1], colors.teal[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PREPARADO PARA:', margin, y);
      y += 10;
      doc.setFontSize(24);
      doc.text(data.businessName.toUpperCase(), margin, y);
      
      y += 25;
      doc.setFontSize(12);
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.text(`TIPO DE NEGOCIO: ${data.businessType.toUpperCase()}`, margin, y);
      y += 8;
      doc.text(`LOCALIZACIÓN: ${data.location}`, margin, y);
      if (data.website) {
        y += 8;
        doc.text(`WEB: ${data.website}`, margin, y);
      }
      
      y = pageHeight - 60;
      doc.setFillColor(colors.cream[0], colors.cream[1], colors.cream[2]);
      doc.rect(margin, y, pageWidth - (margin * 2), 40, 'F');
      doc.setDrawColor(colors.teal[0], colors.teal[1], colors.teal[2], 0.1);
      doc.rect(margin, y, pageWidth - (margin * 2), 40, 'S');
      
      doc.setTextColor(colors.teal[0], colors.teal[1], colors.teal[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const introText = "Este informe contiene un análisis detallado de su presencia digital actual y una hoja de ruta personalizada para dominar su mercado local.";
      const splitIntro = doc.splitTextToSize(introText, pageWidth - (margin * 4));
      doc.text(splitIntro, margin + 10, y + 15);
      
      addFooter(currentPage);

      // --- PÁGINA 2: EL FUTURO ---
      doc.addPage();
      currentPage++;
      addHeader('VISIÓN DE ÉXITO');
      
      y = 60;
      doc.setTextColor(colors.red[0], colors.red[1], colors.red[2]);
      doc.setFontSize(24);
      doc.text('El Futuro', margin, y);
      y += 15;
      
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'italic');
      const storyText = report.storytelling || 'Analizando visión...';
      const splitStory = doc.splitTextToSize(storyText, pageWidth - (margin * 2));
      doc.text(splitStory, margin, y);
      
      addFooter(currentPage);

      // --- PÁGINA 3: ANÁLISIS ---
      doc.addPage();
      currentPage++;
      addHeader('DIAGNÓSTICO TÉCNICO');
      
      y = 60;
      doc.setTextColor(colors.teal[0], colors.teal[1], colors.teal[2]);
      doc.setFontSize(18);
      doc.text('Puntos Fuertes', margin, y);
      y += 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      (report.strengths || []).forEach(s => {
        doc.setTextColor(colors.red[0], colors.red[1], colors.red[2]);
        doc.text('+', margin, y);
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        const lines = doc.splitTextToSize(s, pageWidth - margin - 30);
        doc.text(lines, margin + 5, y);
        y += (lines.length * 6) + 2;
      });
      
      y += 15;
      doc.setTextColor(colors.teal[0], colors.teal[1], colors.teal[2]);
      doc.setFontSize(18);
      doc.text('Áreas de Mejora', margin, y);
      y += 10;
      doc.setFontSize(11);
      (report.problems || []).forEach(p => {
        doc.setTextColor(colors.red[0], colors.red[1], colors.red[2]);
        doc.text('-', margin, y);
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        const lines = doc.splitTextToSize(p, pageWidth - margin - 30);
        doc.text(lines, margin + 5, y);
        y += (lines.length * 6) + 2;
      });

      if (report.socialMediaAnalysis) {
        y += 15;
        doc.setTextColor(colors.teal[0], colors.teal[1], colors.teal[2]);
        doc.setFontSize(18);
        doc.text('Presencia Digital', margin, y);
        y += 10;
        doc.setFontSize(11);
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        const smLines = doc.splitTextToSize(report.socialMediaAnalysis, pageWidth - (margin * 2));
        doc.text(smLines, margin, y);
        y += (smLines.length * 6) + 10;
      }
      
      addFooter(currentPage);

      // --- PÁGINA 4: PLAN DE ACCIÓN ---
      doc.addPage();
      currentPage++;
      addHeader('PLAN DE IMPULSO');
      
      y = 60;
      doc.setTextColor(colors.red[0], colors.red[1], colors.red[2]);
      doc.setFontSize(22);
      doc.text('Plan de Acción Inmediato', margin, y);
      y += 15;
      
      doc.setFontSize(11);
      (report.priorityActions || []).forEach((a, index) => {
        doc.setFillColor(colors.teal[0], colors.teal[1], colors.teal[2]);
        doc.rect(margin, y - 5, 8, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(`${index + 1}`, margin + 3, y + 1);
        
        doc.setTextColor(colors.teal[0], colors.teal[1], colors.teal[2]);
        doc.setFont('helvetica', 'bold');
        const lines = doc.splitTextToSize(a, pageWidth - margin - 40);
        doc.text(lines, margin + 15, y + 1);
        y += (lines.length * 6) + 10;
      });

      y += 10;
      doc.setFillColor(colors.red[0], colors.red[1], colors.red[2]);
      doc.rect(margin, y, pageWidth - (margin * 2), 50, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text('Próximo Paso:', margin + 10, y + 15);
      doc.setFontSize(11);
      const propText = report.serviceProposal || "Hablemos de cómo Impulsa Valladolid puede llevar su negocio al siguiente nivel.";
      const splitProp = doc.splitTextToSize(propText, pageWidth - (margin * 4));
      doc.text(splitProp, margin + 10, y + 25);
      
      y += 65;
      doc.setTextColor(colors.teal[0], colors.teal[1], colors.teal[2]);
      doc.setFontSize(12);
      doc.text('¿Listo para empezar?', pageWidth / 2, y, { align: 'center' });
      y += 8;
      doc.setTextColor(colors.red[0], colors.red[1], colors.red[2]);
      doc.text('www.impulsavalladolid.com', pageWidth / 2, y, { align: 'center' });

      addFooter(currentPage);

      return doc;
    } catch (pdfErr: any) {
      console.error("[DEBUG] Erro no generatePDF:", pdfErr);
      throw pdfErr;
    }
  };

  const sendToWhatsApp = () => {
    const data = watch();
    const message = `Hola, vengo de la web. Acabo de realizar la auditoría gratuita para mi negocio: *${data.businessName}* y me gustaría recibir el informe completo y hablar sobre cómo podéis ayudarme a crecer. 🚀`;
    
    const whatsappUrl = `https://wa.me/5511983424080?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const saveAuditData = async (data: AuditFormData, report: AuditReport) => {
    try {
      setSaveStatus('sending');
      setSaveError(null);
      
      // 1. Intentar vía API (Backend)
      const apiUrl = `/api/save-audit?t=${Date.now()}`;
      let apiSuccess = false;
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            businessName: data.businessName,
            formData: data,
            report: report
          })
        });

        if (response.ok) {
          apiSuccess = true;
        }
      } catch (apiErr) {
        console.warn('[DEBUG] Error en la API, intentando directo en Supabase...', apiErr);
      }

      // 2. Fallback: Intentar directo en Supabase (Cliente)
      if (!apiSuccess) {
        await saveLeadDirectly({
          business_name: data.businessName,
          business_type: data.businessType || 'otro',
          location: data.location || 'N/A',
          email: data.email,
          whatsapp: data.whatsapp || 'N/A',
          website: data.website || '',
          instagram: data.instagram || '',
          facebook: data.facebook || '',
          linkedin: data.linkedin || '',
          tiktok: data.tiktok || '',
          other_platforms: data.otherPlatforms || '',
          report_data: report,
          timestamp: new Date().toISOString()
        });
      }

      setSaveStatus('success');
      setSaveError(null);
    } catch (err: any) {
      console.error("[DEBUG] Error fatal al guardar:", err);
      const msg = err.message || "Error de sincronización";
      setSaveError(msg);
      setSaveStatus('error');
      setErrorModal({ 
        show: true, 
        message: `No se pudo sincronizar: ${msg}. Por favor, descargue el PDF.` 
      });
    }
  };

  const testConnection = async () => {
    try {
      setSaveStatus('sending');
      setSaveError("Probando conexión...");
      
      // Verificar si está en el link compartido (que no tiene backend)
      const isShared = window.location.hostname.includes('-pre-');
      if (isShared) {
        alert("AVISO: Estás usando el 'Shared App URL'.\n\nEste enlace es solo para visualización estática y NO soporta la base de datos.\n\nPor favor, usa o botón 'RUN' o el enlace de 'Preview' de AI Studio para probar la sincronización.");
        setSaveStatus('idle');
        setSaveError(null);
        return;
      }

      // Prueba 1: API
      const apiUrl = `/api/ping?t=${Date.now()}`;
      let apiMsg = "API: Fallo";
      try {
        const resp = await fetch(apiUrl);
        const contentType = resp.headers.get("content-type");
        if (resp.ok && contentType && contentType.includes("application/json")) {
          const data = await resp.json();
          apiMsg = `API: OK (${data.supabase || '?'})`;
        } else {
          const text = await resp.text();
          apiMsg = `API: Error ${resp.status} (Respuesta no es JSON)`;
          console.error("[DEBUG] Error API:", text);
        }
      } catch (e: any) {
        apiMsg = `API: Error (${e.message})`;
      }

      // Prueba 2: Supabase Directo
      let supabaseMsg = "Supabase: No configurado";
      const client = getSupabase();
      if (client) {
        try {
          const { error } = await client.from('leads').select('id').limit(1);
          supabaseMsg = error ? `Supabase: Error (${error.message})` : "Supabase: ¡Conectado!";
        } catch (e: any) {
          supabaseMsg = `Supabase: Error (${e.message})`;
        }
      }

      alert(`Estado de la Conexión:\n\n${apiMsg}\n${supabaseMsg}\n\nEntorno: ${import.meta.env.MODE}\nConfig: ${config ? 'Cargada' : 'Pendiente'}\n\nNOTA PARA VERCEL:\nSi estás en un dominio propio y la API devuelve 404, asegúrate de haber añadido VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY en el Dashboard de Vercel.`);
      setSaveStatus('idle');
      setSaveError(null);
    } catch (err: any) {
      setSaveError(err.message);
      setSaveStatus('error');
    }
  };

  const downloadPDF = () => {
    try {
      const data = watch();
      if (report) {
        const doc = generatePDF(data, report);
        doc.save(`Auditoria_${data.businessName.replace(/\s+/g, '_')}.pdf`);
      }
    } catch (err: any) {
      alert(`Error al descargar PDF: ${err.message}`);
    }
  };

  const fetchLeads = async (customToken?: string) => {
    setIsAdminLoading(true);
    setAdminError(null);
    const token = customToken || loginData.pass;
    
    try {
      console.log("[DEBUG] Iniciando fetchLeads...");
      // 1. Intentar vía API (Backend)
      let data: any[] = [];
      let success = false;
      let apiErrorDetail = "";

      try {
        const apiUrl = `/api/admin/leads-data?t=${Date.now()}`;
        console.log(`[DEBUG] Llamando a API: ${apiUrl}`);
        const response = await fetch(apiUrl, { 
          signal: AbortSignal.timeout(10000), // 10s timeout
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const responseText = await response.text();
          try {
            data = JSON.parse(responseText);
            success = true;
            console.log(`[DEBUG] API retornó ${data.length} leads.`);
          } catch (e) {
            apiErrorDetail = "La respuesta de la API no es un JSON válido.";
            console.warn("[DEBUG] API no devolvió JSON, intentando Supabase directo...");
          }
        } else if (response.status === 401) {
          throw new Error("Contraseña de administrador incorrecta.");
        } else {
          apiErrorDetail = `La API respondió con error ${response.status}: ${response.statusText}`;
        }
      } catch (apiErr: any) {
        if (apiErr.message === "Contraseña de administrador incorrecta.") throw apiErr;
        apiErrorDetail = `Error de red en la API: ${apiErr.message}`;
        console.warn("[DEBUG] Error en la API de leads, intentando directo en Supabase...", apiErr);
      }

      // 2. Fallback: Buscar directo del Supabase (Cliente)
      if (!success) {
        console.log("[DEBUG] Fallback: Intentando Supabase directo...");
        const supabase = getSupabase();
        if (supabase) {
          const { data: sbData, error } = await supabase
            .from('leads')
            .select('*')
            .order('timestamp', { ascending: false });
          
          if (error) {
            console.error("[DEBUG] Error en Supabase fallback:", error.message);
            throw new Error(`Error en el fallback de base de datos: ${error.message} (API original: ${apiErrorDetail})`);
          }

          if (sbData) {
            data = sbData.map(l => ({
              timestamp: l.timestamp,
              businessName: l.business_name || l.businessName,
              businessType: l.business_type || l.businessType,
              location: l.location,
              email: l.email,
              whatsapp: l.whatsapp,
              website: l.website,
              instagram: l.instagram,
              facebook: l.facebook,
              linkedin: l.linkedin,
              tiktok: l.tiktok,
              otherPlatforms: l.other_platforms || l.otherPlatforms,
              reportData: l.report_data || l.reportData
            }));
            success = true;
            console.log(`[DEBUG] Supabase directo retornó ${data.length} leads.`);
          }
        } else {
          throw new Error(`No fue posible conectar con la base de datos. API: ${apiErrorDetail}`);
        }
      }
      
      if (data.length === 0 && !config?.isServiceRole) {
        console.warn("[DEBUG] Se recibieron 0 leads y el Service Role está ausente. Posible bloqueo de RLS.");
        setAdminError("No se encontraron leads. Si activó RLS en Supabase, asegúrese de configurar la 'service_role' key en los Secrets del AI Studio.");
      }
      
      setAdminLeads(data);
    } catch (err: any) {
      console.error("Error al buscar leads:", err);
      setAdminError(`Fallo en la sincronización: ${err.message}`);
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.user === 'admin') {
      try {
        // Intentamos autenticar llamando a la API
        await fetchLeads(loginData.pass);
        setView('admin');
      } catch (err: any) {
        setErrorModal({ show: true, message: err.message || 'Error al iniciar sesión' });
      }
    } else {
      setErrorModal({ show: true, message: 'Usuario incorrecto.' });
    }
  };

  const onSubmit = async (data: AuditFormData) => {
    await processAudit(data, false);
  };

  const processAudit = async (data: AuditFormData, isMock: boolean = false) => {
    console.log('Iniciando envío del formulario...', data, isMock ? '(MOCK)' : '');
    setView('loading');
    try {
      const result = await generateAuditReport(data, isMock);
      if (!result) throw new Error("No se pudo generar el informe");
      
      setReport(result);
      setView('report');
      
      // Guardar datos en la base de datos automáticamente
      await saveAuditData(data, result);
    } catch (error: any) {
      console.error('Error detallado en la generación del informe:', error);
      let errorMessage = '¡Ups! Algo no salió como se esperaba. Por favor, verifique su conexão o inténtelo de nuevo en unos instantes.';
      
      if (error.message === 'API_KEY_MISSING') {
        errorMessage = 'La clave de acesso no fue encontrada. Por favor, póngase en contacto con el soporte técnico.';
      } else if (error.message?.includes('403') || error.message?.includes('API key not valid')) {
        errorMessage = 'La clave de acesso es inválida. Por favor, póngase en contacto con el soporte técnico.';
      } else if (error.message?.includes('503') || error.message?.includes('high demand')) {
        errorMessage = '¡Tenemos mucha demanda en este momento! Nuestro equipo está trabajando al máximo. Por favor, espere unos segundos e inténtelo de nuevo.';
      } else if (error.message?.includes('429')) {
        errorMessage = '¡Demasiadas solicitudes seguidas! Por favor, espere un minuto antes de intentar una nueva auditoría.';
      } else if (error.message?.includes('Safety') || error.message?.includes('blocked')) {
        errorMessage = 'No pudimos generar el informe debido a las políticas de seguridad. Asegúrese de que el nombre del negocio y la información sean apropiados.';
      } else if (error.message) {
        errorMessage = `No pudimos procesar su auditoría ahora. Detalle: ${error.message}`;
      }

      setErrorModal({ show: true, message: errorMessage });
      setView('form');
    }
  };

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof AuditFormData)[] = [];
    if (step === 1) fieldsToValidate = ['businessName', 'businessType', 'location'];
    if (step === 2) fieldsToValidate = ['whatsapp', 'email'];

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep(s => Math.min(s + 1, totalSteps));
    } else {
      console.log('La validación del paso falló:', errors);
    }
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const businessTypes: { value: BusinessType; label: string; icon: any }[] = [
    { value: 'restaurante', label: 'Restaurante', icon: Utensils },
    { value: 'bar', label: 'Bar', icon: Coffee },
    { value: 'cafeteria', label: 'Cafetería', icon: Coffee },
    { value: 'panaderia', label: 'Panadería', icon: Store },
    { value: 'barberia', label: 'Barbería', icon: Scissors },
    { value: 'peluqueria', label: 'Peluquería', icon: Sparkles },
    { value: 'gimnasio', label: 'Gimnasio', icon: Dumbbell },
    { value: 'otro', label: 'Otro', icon: Building2 },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <iframe name="hidden_iframe" id="hidden_iframe" style={{ display: 'none' }}></iframe>
        {/* Header */}
      <header className="sticky top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-brand-cream/30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 md:h-24 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView('hero')}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-red rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-brand-red/20 group-hover:rotate-6 transition-transform">
              <Rocket className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <span className="text-lg md:text-2xl font-black text-brand-teal tracking-tighter leading-none block">Impulsa</span>
              <span className="text-[10px] md:text-xs font-black text-brand-red uppercase tracking-widest block opacity-80">Valladolid</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-10">
            <a 
              href="#como-funciona" 
              onClick={(e) => {
                if (view !== 'hero') {
                  e.preventDefault();
                  setView('hero');
                  setTimeout(() => {
                    document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="text-sm font-bold text-brand-teal hover:text-brand-red transition-colors relative group"
            >
              Nuestros Servicios
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-red transition-all group-hover:w-full" />
            </a>
            <a 
              href="#casos-de-exito" 
              onClick={(e) => {
                if (view !== 'hero') {
                  e.preventDefault();
                  setView('hero');
                  setTimeout(() => {
                    document.getElementById('casos-de-exito')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="text-sm font-bold text-brand-teal hover:text-brand-red transition-colors relative group"
            >
              Casos de Éxito
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-red transition-all group-hover:w-full" />
            </a>
            <button 
              onClick={() => setView('login')}
              className="text-sm font-bold text-brand-teal hover:text-brand-red transition-colors flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50"
            >
              <Lock className="w-4 h-4" />
              Login
            </button>
            <button 
              onClick={() => setView('form')}
              className="bg-brand-red text-white px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-brand-orange transition-all shadow-xl shadow-brand-red/20 active:scale-95"
            >
              Auditoría Gratuita
            </button>
          </nav>

          <button 
            onClick={() => setView('form')}
            className="md:hidden bg-brand-red text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 shadow-lg shadow-brand-red/20"
          >
            Auditoría
          </button>
        </div>
      </header>

      <main className="flex-grow">
        {view === 'hero' && (
          <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-48">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
              <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-orange/10 rounded-full blur-[120px] animate-pulse" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-red/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-center lg:text-left"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-cream/50 text-brand-red text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-8 border border-brand-orange/10">
                    <Sparkles className="w-4 h-4" />
                    Valladolid & Madrid Digital
                  </div>
                  <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-brand-teal mb-8 leading-[1] md:leading-[0.9] tracking-tighter text-balance">
                    Multiplique sus <br />
                    <span className="text-brand-red">Clientes Locales</span>
                  </h1>
                  <p className="text-lg md:text-2xl text-slate-600 mb-12 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                    Transformamos su restaurante, bar o comercio en una máquina de ventas en Google y Redes Sociales. 
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 md:gap-6">
                    <button 
                      onClick={() => setView('form')}
                      className="w-full sm:w-auto bg-brand-red text-white px-10 md:px-12 py-5 md:py-6 rounded-[2rem] text-lg md:text-xl font-black hover:bg-brand-orange transition-all shadow-2xl shadow-brand-red/30 flex items-center justify-center gap-3 group active:scale-95"
                    >
                      Quiero mi Auditoría
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </button>
                    
                    <div className="flex flex-col items-center lg:items-start gap-2">
                      <div className="flex -space-x-3">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white bg-brand-cream flex items-center justify-center overflow-hidden shadow-sm">
                            <img src={`https://picsum.photos/seed/person${i}/120/120`} alt="User" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">+50 negocios impulsados</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative hidden lg:block"
                >
                  <div className="relative z-10 bg-white p-4 rounded-[3rem] shadow-2xl border border-brand-cream rotate-2">
                    <img 
                      src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000&auto=format&fit=crop" 
                      alt="Restaurante en Valladolid" 
                      className="rounded-[2.5rem] w-full h-[500px] object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-10 -left-10 bg-brand-teal text-white p-8 rounded-3xl shadow-xl max-w-xs -rotate-6">
                      <p className="text-lg font-bold mb-2">"Duplicamos las reservas en apenas 3 meses"</p>
                      <p className="text-xs opacity-70 font-bold uppercase tracking-widest">— Restaurante Local</p>
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-orange/5 rounded-full -z-10 blur-3xl" />
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {view === 'hero' && (
          <section id="como-funciona" className="py-24 px-4 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-center mb-20">
                <h2 className="text-5xl font-black text-brand-teal mb-6">¿Cómo transformamos su negocio?</h2>
                <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
                  No solo hacemos marketing, creamos una presencia digital que obliga a los clientes a elegirte.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                {/* Antes */}
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl relative"
                >
                  <div className="absolute -top-6 left-10 bg-slate-400 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest">
                    Antes: Invisibilidad
                  </div>
                  <div className="space-y-8 opacity-40 grayscale blur-[1px]">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center">
                        <span className="text-xl font-black text-slate-400">3.2</span>
                      </div>
                      <div className="space-y-1 flex-grow">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="flex gap-1">
                          {[1,2,3].map(i => <div key={i} className="w-3 h-3 bg-slate-300 rounded-full" />)}
                          <div className="w-3 h-3 bg-slate-100 rounded-full" />
                          <div className="w-3 h-3 bg-slate-100 rounded-full" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                        <p className="text-xs font-black text-slate-400 uppercase">Instagram</p>
                        <p className="text-xl font-black text-slate-500">120</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                        <p className="text-xs font-black text-slate-400 uppercase">Facebook</p>
                        <p className="text-xl font-black text-slate-500">45</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <img 
                        src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=500&auto=format&fit=crop" 
                        className="aspect-square rounded-2xl object-cover border border-slate-200" 
                        alt="Local Vacío"
                        referrerPolicy="no-referrer" 
                      />
                      <img 
                        src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=500&auto=format&fit=crop" 
                        className="aspect-square rounded-2xl object-cover border border-slate-200" 
                        alt="Dueño Desanimado"
                        referrerPolicy="no-referrer" 
                      />
                      <img 
                        src="https://images.unsplash.com/photo-1516939162983-c57ad5331f7d?q=80&w=500&auto=format&fit=crop" 
                        className="aspect-square rounded-2xl object-cover border border-slate-200" 
                        alt="Local Abandonado"
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm font-bold text-slate-400">● Sin fotos profesionales</p>
                      <p className="text-sm font-bold text-slate-400">● Reseñas negativas sin respuesta</p>
                      <p className="text-sm font-bold text-slate-400">● Horarios desactualizados</p>
                      <p className="text-sm font-bold text-slate-400">● Local vacío la mayor parte del día</p>
                    </div>
                  </div>
                  <div className="mt-10 pt-10 border-t border-slate-100 text-center">
                    <p className="text-slate-400 font-black text-2xl">Bajo Compromiso</p>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">El cliente pasa de largo</p>
                  </div>
                </motion.div>

                {/* Después */}
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-brand-teal p-10 rounded-[3rem] shadow-2xl relative border-4 border-brand-orange/30"
                >
                  <div className="absolute -top-6 left-10 bg-brand-red text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg">
                    Después: Dominio Total
                  </div>
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
                      <div className="w-12 h-12 bg-brand-orange rounded-xl flex items-center justify-center shadow-lg shadow-brand-orange/40">
                        <span className="text-xl font-black text-white">4.9</span>
                      </div>
                      <div className="space-y-1 flex-grow">
                        <div className="h-4 bg-white rounded w-3/4" />
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(i => <Sparkles key={i} className="w-3 h-3 text-brand-orange fill-brand-orange" />)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-white/60 uppercase">Google Maps</p>
                        <p className="text-xs font-black text-white">Top 3 Valladolid</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/10 rounded-2xl border border-white/20 text-center backdrop-blur-sm">
                        <p className="text-xs font-black text-white/60 uppercase">Instagram</p>
                        <p className="text-xl font-black text-white">12.5k</p>
                      </div>
                      <div className="p-4 bg-white/10 rounded-2xl border border-white/20 text-center backdrop-blur-sm">
                        <p className="text-xs font-black text-white/60 uppercase">Facebook</p>
                        <p className="text-xl font-black text-white">8.2k</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <img 
                        src="https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=500&auto=format&fit=crop" 
                        className="aspect-square rounded-2xl object-cover border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-110 transition-all duration-500 cursor-pointer saturate-150 contrast-110" 
                        alt="Gimnasio Lleno de Clientes"
                        referrerPolicy="no-referrer" 
                      />
                      <img 
                        src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=500&auto=format&fit=crop" 
                        className="aspect-square rounded-2xl object-cover border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-110 transition-all duration-500 cursor-pointer saturate-150 contrast-110" 
                        alt="Clientes Felices"
                        referrerPolicy="no-referrer" 
                      />
                      <img 
                        src="https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=500&auto=format&fit=crop" 
                        className="aspect-square rounded-2xl object-cover border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-110 transition-all duration-500 cursor-pointer saturate-150 contrast-110" 
                        alt="Mercado de Frutas Lleno"
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm font-bold text-white flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-brand-orange" /> Fotografía Profesional de Impacto
                      </p>
                      <p className="text-sm font-bold text-white flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-brand-orange" /> Gestión Estratégica de Reseñas
                      </p>
                      <p className="text-sm font-bold text-white flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-brand-orange" /> SEO Local: Top 3 en Google Maps
                      </p>
                      <p className="text-sm font-bold text-white flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-brand-orange" /> Establecimiento lleno con lista de espera
                      </p>
                    </div>
                  </div>
                  <div className="mt-10 pt-10 border-t border-white/10 text-center">
                    <motion.p 
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-brand-orange font-black text-3xl drop-shadow-[0_0_10px_rgba(255,165,0,0.5)]"
                    >
                      Altísimo Compromiso
                    </motion.p>
                    <p className="text-xs text-white/70 font-bold uppercase mt-1">El cliente reserva al instante</p>
                  </div>
                </motion.div>
              </div>

              <div className="mt-20 flex flex-col items-center gap-8">
                <div className="flex items-center gap-4 text-brand-teal font-black uppercase tracking-widest text-sm">
                  <ArrowRight className="w-6 h-6 rotate-90 text-brand-red" />
                  Nuestro Proceso
                  <ArrowRight className="w-6 h-6 rotate-90 text-brand-red" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                  {[
                    { step: "01", title: "Auditoría", desc: "Analizamos su presencia actual y detectamos fugas de clientes." },
                    { step: "02", title: "Optimización", desc: "Pulimos su imagen y configuramos sus canales de venta." },
                    { step: "03", title: "Impulso", desc: "Lanzamos contenido estratégico para atraer público real." }
                  ].map((s, i) => (
                    <div key={i} className="bg-white p-8 rounded-3xl border border-brand-cream shadow-lg text-center group hover:border-brand-red transition-all">
                      <span className="text-4xl font-black text-brand-red/20 group-hover:text-brand-red transition-colors">{s.step}</span>
                      <h4 className="text-xl font-black text-brand-teal mt-4 mb-2">{s.title}</h4>
                      <p className="text-sm text-slate-500 font-medium">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'hero' && (
          <section id="casos-de-exito" className="py-20 bg-white border-y border-brand-cream">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                <div className="space-y-2">
                  <p className="text-5xl font-black text-brand-red">82%</p>
                  <p className="text-xs font-black uppercase tracking-widest text-brand-teal opacity-60">Visitas Digitales</p>
                  <p className="text-[10px] text-slate-400 font-medium">Clientes que te ven online antes de entrar</p>
                </div>
                <div className="space-y-2">
                  <p className="text-5xl font-black text-brand-red">+350%</p>
                  <p className="text-xs font-black uppercase tracking-widest text-brand-teal opacity-60">Llamadas Directas</p>
                  <p className="text-[10px] text-slate-400 font-medium">Aumento promedio en contacto directo</p>
                </div>
                <div className="space-y-2">
                  <p className="text-5xl font-black text-brand-red">Top 3</p>
                  <p className="text-xs font-black uppercase tracking-widest text-brand-teal opacity-60">Google Maps</p>
                  <p className="text-[10px] text-slate-400 font-medium">Posicionamiento local garantizado</p>
                </div>
                <div className="space-y-2">
                  <p className="text-5xl font-black text-brand-red">45</p>
                  <p className="text-xs font-black uppercase tracking-widest text-brand-teal opacity-60">Reservas Diarias</p>
                  <p className="text-[10px] text-slate-400 font-medium">Caso de éxito: De la invisibilidad al lleno total</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'form' && (
          <section className="py-16 px-4 bg-brand-cream/30">
            <div className="max-w-3xl mx-auto">
              <div className="mb-12 text-center">
                <h2 className="text-4xl font-black text-brand-teal mb-4">Su Jornada Digital</h2>
                <p className="text-slate-600 font-medium">Complete los datos y reciba un análisis completo en segundos.</p>
              </div>
              
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all",
                          step === i ? "bg-brand-red text-white scale-110 shadow-lg shadow-brand-red/20" : 
                          step > i ? "bg-brand-teal text-white" : "bg-white text-slate-300 border border-slate-200"
                        )}
                      >
                        {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-brand-teal opacity-50">Etapa {step} de {totalSteps}</span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-100 p-0.5">
                  <motion.div 
                    className="h-full bg-brand-red rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-brand-teal/5 border border-brand-cream">
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="space-y-4">
                      <label className="text-sm font-black text-brand-teal uppercase tracking-widest">¿Cuál es su nicho?</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                        {businessTypes.map((t) => {
                          const Icon = t.icon;
                          const isSelected = watch('businessType') === t.value;
                          return (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => setValue('businessType', t.value)}
                              className={cn(
                                "flex flex-col items-center justify-center p-6 md:p-8 rounded-[2rem] border-2 transition-all gap-4 group active:scale-95",
                                isSelected 
                                  ? "border-brand-red bg-white text-brand-red shadow-2xl shadow-brand-red/10 animate-in zoom-in-95" 
                                  : "border-slate-50 bg-slate-50/50 text-slate-400 hover:border-brand-orange/20 hover:bg-white hover:text-brand-orange"
                              )}
                            >
                              <div className={cn(
                                "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all",
                                isSelected ? "bg-brand-red text-white" : "bg-white text-slate-400 group-hover:bg-brand-orange group-hover:text-white"
                              )}>
                                <Icon className="w-8 h-8 md:w-10 md:h-10" />
                              </div>
                              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{t.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-brand-teal uppercase tracking-widest">Nombre del Negocio</label>
                      <input 
                        {...register('businessName')}
                        placeholder="Ex: La Parrilla de San Lorenzo"
                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-red outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                      />
                      {errors.businessName && <p className="text-brand-red text-xs font-bold mt-1">{errors.businessName.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-brand-teal uppercase tracking-widest">Ubicación</label>
                      <div className="relative">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-red" />
                        <input 
                          {...register('location')}
                          placeholder="Ex: Valladolid, Centro"
                          className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-red outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                        />
                      </div>
                      {errors.location && <p className="text-brand-red text-xs font-bold mt-1">{errors.location.message}</p>}
                    </div>

                    <button 
                      type="button" 
                      onClick={handleNextStep}
                      className="w-full bg-brand-teal text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-red transition-all flex items-center justify-center gap-3 shadow-xl"
                    >
                      Continuar
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-black text-brand-teal uppercase tracking-widest">WhatsApp de Contacto</label>
                      <div className="relative">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-red" />
                        <input 
                          {...register('whatsapp')}
                          placeholder="+34 000 000 000"
                          className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-red outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                        />
                      </div>
                      {errors.whatsapp && <p className="text-brand-red text-xs font-bold mt-1">{errors.whatsapp.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-brand-teal uppercase tracking-widest">E-mail Profesional</label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-red" />
                        <input 
                          {...register('email')}
                          placeholder="contacto@restaurante.es"
                          className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-red outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                        />
                      </div>
                      {errors.email && <p className="text-brand-red text-xs font-bold mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-brand-teal uppercase tracking-widest">Sitio Web (Opcional)</label>
                      <div className="relative">
                        <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-red" />
                        <input 
                          {...register('website')}
                          placeholder="suweb.com"
                          className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-red outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                        />
                      </div>
                      {errors.website && <p className="text-brand-red text-xs font-bold mt-1">{errors.website.message}</p>}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        type="button" 
                        onClick={prevStep}
                        className="flex-1 bg-slate-100 text-brand-teal py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Volver
                      </button>
                      <button 
                        type="button" 
                        onClick={handleNextStep}
                        className="flex-[2] bg-brand-teal text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-red transition-all flex items-center justify-center gap-3 shadow-xl"
                      >
                        Próximo Paso
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {errors.instagram && (
                        <div className="col-span-full bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2 text-red-600 text-xs font-bold">
                          <AlertCircle className="w-4 h-4" />
                          {errors.instagram.message}
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-teal uppercase tracking-widest flex items-center gap-2">
                          <Instagram className="w-4 h-4 text-brand-red" /> Instagram
                        </label>
                        <input {...register('instagram')} placeholder="@usuario" className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-red outline-none font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-teal uppercase tracking-widest flex items-center gap-2">
                          <Facebook className="w-4 h-4 text-brand-red" /> Facebook
                        </label>
                        <input {...register('facebook')} placeholder="facebook.com/pagina" className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-red outline-none font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-teal uppercase tracking-widest flex items-center gap-2">
                          <Linkedin className="w-4 h-4 text-brand-red" /> LinkedIn
                        </label>
                        <input {...register('linkedin')} placeholder="linkedin.com/in/usuario" className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-red outline-none font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-teal uppercase tracking-widest flex items-center gap-2">
                           TikTok
                        </label>
                        <input {...register('tiktok')} placeholder="@usuario" className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-red outline-none font-medium" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-brand-teal uppercase tracking-widest">Otras Notas</label>
                      <textarea 
                        {...register('otherPlatforms')}
                        placeholder="¿Algún detalle extra sobre su presencia digital?"
                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-red outline-none transition-all font-medium text-slate-700 h-32 resize-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        type="button" 
                        onClick={prevStep}
                        className="flex-1 bg-slate-100 text-brand-teal py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Volver
                      </button>
                      <button 
                        type="submit"
                        className="flex-[2] bg-brand-red text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-orange transition-all flex items-center justify-center gap-3 shadow-2xl shadow-brand-red/30"
                      >
                        Generar Auditoría
                        <Sparkles className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>
          </section>
        )}

        {view === 'hero' && (
          <section id="planes" className="py-24 px-4 bg-brand-cream/20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black text-brand-teal mb-4">Dos caminos para dominar Valladolid</h2>
                <p className="text-slate-600 font-bold text-xl">Elija el plan que mejor se adapte a su crecimiento</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                {/* Plan Básico */}
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="bg-white p-12 rounded-[3rem] border-2 border-brand-cream shadow-xl flex flex-col"
                >
                  <div className="mb-8">
                    <h3 className="text-3xl font-black text-brand-teal mb-2">Plan Básico</h3>
                    <p className="text-brand-red font-black text-4xl">89€ <span className="text-sm text-slate-400 font-bold">/ MES</span></p>
                    <p className="text-xs font-black uppercase tracking-widest text-brand-teal opacity-50 mt-2">Visibilidad y Confianza</p>
                  </div>
                  <ul className="space-y-4 mb-12 flex-grow">
                    {[
                      'Google Business Profile Pro',
                      'Gestión de Reseñas Estratégica',
                      '8 Publicaciones Mensuales',
                      'Informe de Visibilidad Local'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-600 font-bold">
                        <CheckCircle2 className="w-5 h-5 text-brand-red" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => setView('form')}
                    className="w-full py-5 rounded-2xl border-2 border-brand-teal text-brand-teal font-black uppercase tracking-widest hover:bg-brand-teal hover:text-white transition-all"
                  >
                    Empezar Ahora
                  </button>
                </motion.div>

                {/* Plan Premium */}
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="bg-brand-teal p-12 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-0 right-0 bg-brand-red text-white px-6 py-2 font-black text-[10px] uppercase tracking-widest rounded-bl-2xl">
                    Más Popular
                  </div>
                  <div className="mb-8">
                    <h3 className="text-3xl font-black text-white mb-2">Plan Premium</h3>
                    <p className="text-brand-orange font-black text-4xl">147€ <span className="text-sm text-white/50 font-bold">/ MES</span></p>
                    <p className="text-xs font-black uppercase tracking-widest text-white opacity-50 mt-2">Dominio y Crecimiento</p>
                  </div>
                  <ul className="space-y-4 mb-12 flex-grow">
                    {[
                      'Todo lo del Plan Básico',
                      'SEO Local Avanzado (Top 3)',
                      '16 Publicaciones + Reels Virales',
                      'Sistema de Captación Activa'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-white font-bold">
                        <CheckCircle2 className="w-5 h-5 text-brand-orange" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => setView('form')}
                    className="w-full py-5 rounded-2xl bg-brand-red text-white font-black uppercase tracking-widest hover:bg-brand-orange transition-all shadow-xl shadow-brand-red/20"
                  >
                    Dominar el Mercado
                  </button>
                </motion.div>
              </div>

              <div className="mt-20 text-center">
                <div className="inline-flex flex-col sm:flex-row items-center gap-6 sm:gap-8 px-8 sm:px-10 py-6 bg-white rounded-3xl border border-brand-cream shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="font-black text-brand-teal uppercase tracking-widest text-[10px] sm:text-xs">Sin Permanencia</span>
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-slate-100" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="font-black text-brand-teal uppercase tracking-widest text-[10px] sm:text-xs">Solo Resultados</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'loading' && (
          <section className="min-h-screen flex flex-col items-center justify-center p-8 bg-brand-cream/10 relative overflow-hidden">
             {/* Abstract Background for Loading */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand-red/5 rounded-full blur-[120px]" 
              />
              <motion.div 
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  rotate: [0, -90, 0],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 10, repeat: Infinity, delay: 5 }}
                className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-brand-orange/5 rounded-full blur-[120px]" 
              />
            </div>

            <div className="relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: 360 
                }}
                transition={{ 
                  scale: { duration: 2, repeat: Infinity },
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" }
                }}
                className="w-32 h-32 md:w-48 md:h-48 border-[6px] border-brand-cream border-t-brand-red rounded-full flex items-center justify-center mb-16 shadow-2xl relative"
              >
                <div className="w-full h-full absolute top-0 left-0 animate-pulse bg-brand-red/5 rounded-full" />
                <Rocket className="w-12 h-12 md:w-16 md:h-16 text-brand-red -rotate-45" />
              </motion.div>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-brand-teal mb-6 uppercase tracking-tighter text-balance text-center">Equipo <br /><span className="text-brand-red">Auditando...</span></h2>
            <p className="text-slate-400 max-w-md font-bold text-lg md:text-xl text-center leading-relaxed">
              Analizando visibilidad de <span className="text-brand-red">{(watch('businessName') || 'su negocio')}</span> en Google y Redes Sociales...
            </p>
            
            <div className="mt-20 w-full max-w-md space-y-6">
              <div className="h-4 bg-white rounded-full overflow-hidden p-1 border border-brand-cream/50 shadow-inner">
                <motion.div 
                  className="h-full bg-brand-red rounded-full shadow-lg shadow-brand-red/20"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 15, ease: "linear" }}
                />
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-teal animate-pulse">Sincronizando con Google</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red">Análisis Estratégico Activo</span>
              </div>
            </div>
          </section>
        )}

        {view === 'report' && report && (
          <section className="py-16 px-4 bg-[#FDFBF7]">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-red/10 text-brand-red text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-6 border border-brand-red/10">
                    <Rocket className="w-4 h-4" />
                    Auditoría Estratégica Exclusiva
                  </div>
                  <h2 className="text-6xl md:text-8xl font-black text-brand-teal leading-none tracking-tighter">Diagnóstico <br /><span className="text-brand-red">Impulsa</span></h2>
                  <p className="mt-4 text-slate-400 font-black uppercase tracking-[0.1em] text-xs md:text-sm">Negocio: <span className="text-brand-teal">{watch('businessName')}</span></p>
                  
                  {saveStatus === 'sending' && (
                    <div className="mt-6 flex items-center gap-3 text-brand-orange animate-pulse px-4 py-2 bg-brand-orange/5 rounded-full w-fit">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-[0.1em]">Sincronizando...</span>
                    </div>
                  )}
                  
                  {saveStatus === 'success' && (
                    <div className="mt-6 flex items-center gap-3 text-emerald-500 px-4 py-2 bg-emerald-50 rounded-full w-fit">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.1em]">Analizado & Guardado</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => {
                      const data = watch();
                      if (report) {
                        const doc = generatePDF(data, report);
                        doc.save(`Auditoría_${data.businessName.replace(/\s+/g, '_')}.pdf`);
                      }
                    }}
                    className="group bg-white text-brand-teal border-2 border-brand-cream px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:border-brand-red transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                  >
                    <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                    PDF Completo
                  </button>
                  <button 
                    onClick={sendToWhatsApp}
                    className="bg-emerald-500 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95"
                  >
                    <Phone className="w-5 h-5" />
                    Agendar Consultoria
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-10">
                {/* Storytelling Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-brand-red text-white p-12 md:p-24 rounded-[3rem] shadow-2xl shadow-brand-red/20 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand-orange/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]" />
                  
                  <div className="relative z-10 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
                      <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-2xl border border-white/20 shadow-2xl">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black uppercase tracking-[0.2em] mb-1">El Futuro</h3>
                        <p className="text-white/60 font-bold uppercase tracking-widest text-sm">Visión Estratégica</p>
                      </div>
                    </div>
                    <blockquote className="text-[1.35rem] md:text-5xl lg:text-6xl font-medium leading-[1.2] tracking-tight text-white/95 text-balance">
                      <span className="text-white font-black italic block mb-4 opacity-30 text-8xl md:text-9xl leading-none font-serif">“</span>
                      <span className="relative -top-12 md:-top-16 block">
                        {String(report.storytelling)}
                      </span>
                    </blockquote>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Strengths */}
                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-10 rounded-[2.5rem] border border-brand-cream shadow-xl shadow-brand-teal/5"
                  >
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-black text-brand-teal mb-8 uppercase tracking-widest">Puntos Fuertes</h3>
                    <ul className="space-y-6">
                      {(report.strengths || []).map((s, i) => (
                        <li key={i} className="flex items-start gap-4 text-slate-600 font-medium">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
                          {String(s)}
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Problems */}
                  <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-10 rounded-[2.5rem] border border-brand-cream shadow-xl shadow-brand-teal/5"
                  >
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-8">
                      <AlertCircle className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="text-2xl font-black text-brand-teal mb-8 uppercase tracking-widest">Qué mejorar</h3>
                    <ul className="space-y-6">
                      {(report.problems || []).map((p, i) => (
                        <li key={i} className="flex items-start gap-4 text-slate-600 font-medium">
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-2.5 shrink-0" />
                          {String(p)}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                {/* Social Media Analysis */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-brand-teal text-white p-10 md:p-14 rounded-[3rem] shadow-2xl"
                >
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                      <Instagram className="w-8 h-8 text-brand-orange" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-widest">Presencia Digital</h3>
                  </div>
                  <p className="text-xl text-slate-200 leading-relaxed font-medium">
                    {String(report.socialMediaAnalysis)}
                  </p>
                </motion.div>

                {/* Technical Analysis */}
                {report.technicalAnalysis && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="bg-slate-900 text-white p-10 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                        <Globe className="w-8 h-8 text-brand-red" />
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-widest">Análisis Técnico (Google)</h3>
                    </div>
                    <p className="text-xl text-slate-300 leading-relaxed font-medium">
                      {String(report.technicalAnalysis)}
                    </p>
                  </motion.div>
                )}

                {/* Priority Actions */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white p-10 md:p-14 rounded-[3rem] border-4 border-brand-cream shadow-2xl"
                >
                  <h3 className="text-2xl font-black text-brand-teal mb-12 uppercase tracking-widest text-center">Plan de Acción Inmediato</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(report.priorityActions || []).map((a, i) => (
                      <div key={i} className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-brand-red transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-brand-red text-white flex items-center justify-center text-xl font-black shrink-0 shadow-lg shadow-brand-red/20 group-hover:rotate-6 transition-transform">
                          {String(i + 1)}
                        </div>
                        <span className="text-slate-700 font-bold leading-tight">{String(a)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Service Proposal */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="bg-brand-cream p-12 md:p-24 rounded-[4rem] text-center relative overflow-hidden group border-4 border-white shadow-2xl"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-brand-red/5 -z-10 group-hover:scale-110 transition-transform duration-[3s]" />
                  <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-brand-red/10 rounded-full blur-[80px]" />
                  
                  <h3 className="text-4xl md:text-7xl font-black text-brand-red mb-10 leading-tight tracking-tighter text-balance">¿Impulsamos su <br />negocio juntos?</h3>
                  <p className="text-brand-teal text-xl md:text-3xl mb-16 max-w-2xl mx-auto font-medium leading-relaxed italic opacity-90">
                    "{String(report.serviceProposal)}"
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button 
                      onClick={sendToWhatsApp}
                      className="w-full sm:w-auto bg-brand-red text-white px-12 md:px-16 py-6 md:py-8 rounded-[2.5rem] text-xl md:text-2xl font-black uppercase tracking-[0.2em] hover:bg-brand-teal transition-all shadow-2xl shadow-brand-red/30 flex items-center justify-center gap-4 group active:scale-95"
                    >
                      Agendar Consultoría
                      <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" />
                    </button>
                    
                    <button 
                      onClick={downloadPDF}
                      className="w-full sm:w-auto bg-white text-brand-teal px-10 py-6 rounded-[2.5rem] text-sm font-black uppercase tracking-widest hover:bg-brand-cream transition-all border-2 border-brand-cream flex items-center justify-center gap-3 active:scale-95"
                    >
                      <Download className="w-5 h-5" />
                      Descargar Audit
                    </button>
                  </div>
                </motion.div>

                {/* Sources Section */}
                {report.sources && report.sources.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-10 p-8 bg-white/50 rounded-3xl border border-brand-cream"
                  >
                    <h4 className="text-sm font-black text-brand-teal uppercase tracking-widest mb-4 opacity-60">Fuentes de Información (Google Search)</h4>
                    <div className="flex flex-wrap gap-4">
                      {report.sources.map((source, i) => (
                        <a 
                          key={i} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-brand-red hover:underline flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-brand-cream shadow-sm"
                        >
                          <Globe className="w-3 h-3" />
                          {String(source.title)}
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        )}
        {view === 'login' && (
          <section className="min-h-[80vh] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full border-4 border-brand-red/10"
            >
              <div className="w-16 h-16 bg-brand-teal/10 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                <Lock className="w-8 h-8 text-brand-teal" />
              </div>
              <h2 className="text-3xl font-black text-brand-teal mb-8 text-center uppercase tracking-tight">Acceso Admin</h2>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-teal uppercase tracking-widest">Usuario</label>
                  <input 
                    type="text" 
                    value={loginData.user}
                    onChange={(e) => setLoginData({...loginData, user: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-red outline-none font-medium"
                    placeholder="admin"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-teal uppercase tracking-widest">Contraseña</label>
                  <input 
                    type="password" 
                    value={loginData.pass}
                    onChange={(e) => setLoginData({...loginData, pass: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-red outline-none font-medium"
                    placeholder="••••••••"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-brand-teal text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-red transition-all shadow-xl"
                >
                  Entrar al Dashboard
                </button>
              </form>
            </motion.div>
          </section>
        )}

        {view === 'admin' && (
          <section className="py-16 px-4 min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                <div>
                  <h2 className="text-4xl font-black text-brand-teal uppercase tracking-tight">Dashboard de <span className="text-brand-red">Leads</span></h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Gestión de auditorías generadas</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={testConnection}
                    className="bg-white text-brand-teal px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] border border-brand-cream hover:bg-brand-cream transition-all flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" /> Probar Conexión
                  </button>
                  <button 
                    onClick={() => fetchLeads()}
                    disabled={isAdminLoading}
                    className="bg-white text-brand-teal px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] border border-brand-cream hover:bg-brand-cream transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isAdminLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                    {isAdminLoading ? 'Actualizando...' : 'Reintentar'}
                  </button>
                  <button 
                    onClick={() => setView('hero')}
                    className="bg-brand-red text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-orange transition-all flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Salir
                  </button>
                </div>
              </div>

              {/* System Status */}
              <div className="mb-8 p-4 bg-white rounded-2xl border border-slate-200 flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", (config?.supabaseUrl || import.meta.env.VITE_SUPABASE_URL) ? "bg-emerald-500" : "bg-amber-500")} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Supabase URL: {(config?.supabaseUrl || import.meta.env.VITE_SUPABASE_URL) ? "Configurado" : "Ausente"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", (config?.supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY) ? "bg-emerald-500" : "bg-amber-500")} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Supabase Key: {(config?.supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY) ? "Configurado" : "Ausente"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", config?.isServiceRole ? "bg-emerald-500" : "bg-red-500")} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Service Role: {config?.isServiceRole ? "Ativado (Seguro)" : "Ausente (RLS pode bloquear)"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Modo: {import.meta.env.MODE}</span>
                </div>
                {window.location.hostname.includes('-pre-') && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-red-100 rounded-lg border border-red-200">
                    <AlertCircle className="w-3 h-3 text-red-600" />
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest animate-pulse">Enlace Compartido (Sin Backend)</span>
                  </div>
                )}
                {config && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Config: Dinâmica</span>
                  </div>
                )}
                <button 
                  onClick={async () => {
                    try {
                      const resp = await fetch('/api/debug-env');
                      const data = await resp.json();
                      alert(`Debug Env:\n\nKeys: ${data.envKeys.join(', ') || 'Ninguna'}\nNode: ${data.nodeEnv}\nCWD: ${data.cwd}`);
                    } catch (e: any) {
                      alert(`Error en el debug: ${e.message}`);
                    }
                  }}
                  className="ml-auto text-[10px] font-black text-brand-teal uppercase tracking-widest hover:underline"
                >
                  Ver Debug Env
                </button>
              </div>

              {adminError && (
                <div className="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-3xl flex items-center gap-4 text-red-700">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <div>
                    <p className="font-black uppercase tracking-widest text-xs">Error de Sincronización</p>
                    <p className="text-sm font-medium">{adminError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-brand-cream">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-brand-teal/10 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-brand-teal" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Leads</span>
                  </div>
                  <p className="text-4xl font-black text-brand-teal">{adminLeads.length}</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-brand-cream">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Database className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leads en Base de Datos</span>
                  </div>
                  <p className="text-4xl font-black text-brand-teal">{adminLeads.length}</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-brand-cream">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-brand-orange" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Últimas 24h</span>
                  </div>
                  <p className="text-4xl font-black text-brand-teal">
                    {adminLeads.filter(l => new Date(l.timestamp) > new Date(Date.now() - 86400000)).length}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-brand-cream">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-brand-cream">
                        <th className="px-8 py-6 text-[10px] font-black text-brand-teal uppercase tracking-widest">Fecha</th>
                        <th className="px-8 py-6 text-[10px] font-black text-brand-teal uppercase tracking-widest">Negocio</th>
                        <th className="px-8 py-6 text-[10px] font-black text-brand-teal uppercase tracking-widest">Contacto</th>
                        <th className="px-8 py-6 text-[10px] font-black text-brand-teal uppercase tracking-widest">Status</th>
                        <th className="px-8 py-6 text-[10px] font-black text-brand-teal uppercase tracking-widest text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-cream/30">
                      {adminLeads.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic">
                            No hay leads registrados todavía.
                          </td>
                        </tr>
                      ) : adminLeads.slice().reverse().map((lead, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <span className="text-xs font-bold text-slate-500">
                              {new Date(lead.timestamp).toLocaleDateString('es-ES')}
                            </span>
                            <br />
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(lead.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm font-black text-brand-teal uppercase tracking-tight">{lead.businessName}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                <Mail className="w-3 h-3 text-brand-red" /> {lead.email}
                              </span>
                              <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                <Phone className="w-3 h-3 text-emerald-500" /> {lead.whatsapp}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">
                              Sincronizado
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2">
                              {lead.reportData && (
                                <button 
                                  onClick={() => setSelectedLead(lead)}
                                  className="inline-flex items-center gap-2 bg-brand-teal text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-red transition-all shadow-md"
                                >
                                  Ver Informe
                                </button>
                              )}
                              <a 
                                href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md"
                              >
                                WhatsApp
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-brand-teal text-white py-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-[100px]" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-brand-red rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-red/20 rotate-3">
                <Rocket className="w-7 h-7 -rotate-3" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-3xl tracking-tighter text-white leading-none">
                  Impulsa <span className="text-brand-orange">Valladolid</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cream opacity-50">
                  Impulsa tu negocio local
                </span>
              </div>
            </div>
            <p className="text-brand-cream/60 max-w-sm mb-10 font-medium leading-relaxed">
              Especialistas en transformar pequeños negocios en referencias digitales en Valladolid y Madrid. Tradición española con tecnología global.
            </p>
            <div className="flex gap-5">
              {[Instagram, Facebook, Globe].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-brand-red hover:scale-110 transition-all border border-white/10">
                  <Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-black uppercase tracking-widest text-brand-orange mb-8 text-sm">Navegación</h4>
            <ul className="space-y-5 text-brand-cream/70 font-bold">
              <li>
                <button 
                  onClick={() => {
                    setView('hero');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-white transition-colors"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setView('form')} 
                  className="hover:text-white transition-colors"
                >
                  Auditoría Gratuita
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    if (view !== 'hero') setView('hero');
                    setTimeout(() => {
                      document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} 
                  className="hover:text-white transition-colors"
                >
                  Nuestros Servicios
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    if (view !== 'hero') setView('hero');
                    setTimeout(() => {
                      document.getElementById('casos-de-exito')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} 
                  className="hover:text-white transition-colors"
                >
                  Casos de Éxito
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-widest text-brand-orange mb-8 text-sm">Contáctanos</h4>
            <ul className="space-y-6 text-brand-cream/70 font-bold">
              <li className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-brand-red shrink-0" />
                <span>Valladolid, España <br /><span className="text-[10px] opacity-50">Calle Mayor, 12</span></span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-brand-red shrink-0" />
                +55 11 98342-4080
              </li>
              <li className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-brand-red shrink-0" />
                hola@impulsavalladolid.com
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-white/5 text-center flex flex-col items-center gap-4">
          <p className="text-brand-cream/30 text-[10px] font-black uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} Impulsa Valladolid. Hecho con pasión en España.
          </p>
          <div className="flex gap-6">
            <a 
              href="/api/admin/leads" 
              target="_blank" 
              className="text-brand-cream/10 hover:text-brand-cream/30 transition-colors text-[8px] uppercase tracking-widest"
            >
              Acceso Admin
            </a>
            <button 
              onClick={testConnection}
              className="text-brand-cream/10 hover:text-brand-cream/30 transition-colors text-[8px] uppercase tracking-widest"
            >
              Probar Conexión
            </button>
          </div>
        </div>
      </footer>
      {/* Floating WhatsApp Button */}
      <a 
        href={`https://wa.me/5511983424080?text=${encodeURIComponent("Hola équipe de Impulsa Valladolid, me gustaría impulsar mi negocio. ¿Podemos hablar?")}`}
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all group"
      >
        <Phone className="w-8 h-8" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-black shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          ¿Hablamos por WhatsApp?
        </span>
      </a>
        {/* Lead Detail Modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-brand-teal/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-brand-red/10"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-brand-teal uppercase tracking-tight">Informe: {selectedLead.businessName}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(selectedLead.timestamp).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <LogOut className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Lead Information Section */}
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                  <h4 className="text-[10px] font-black text-brand-teal uppercase tracking-widest mb-6">Información del Lead</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ubicación</p>
                      <p className="text-sm font-bold text-slate-700">{selectedLead.location || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">WhatsApp</p>
                      <p className="text-sm font-bold text-slate-700">{selectedLead.whatsapp}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">E-mail</p>
                      <p className="text-sm font-bold text-slate-700">{selectedLead.email}</p>
                    </div>
                    {selectedLead.website && (
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sitio Web</p>
                        <a href={selectedLead.website} target="_blank" className="text-sm font-bold text-brand-teal hover:underline">{selectedLead.website}</a>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Redes Sociales</p>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {selectedLead.instagram && <span className="bg-white px-3 py-1 rounded-lg text-[10px] font-bold border border-slate-200">IG: {selectedLead.instagram}</span>}
                        {selectedLead.facebook && <span className="bg-white px-3 py-1 rounded-lg text-[10px] font-bold border border-slate-200">FB: {selectedLead.facebook}</span>}
                        {selectedLead.linkedin && <span className="bg-white px-3 py-1 rounded-lg text-[10px] font-bold border border-slate-200">LI: {selectedLead.linkedin}</span>}
                        {selectedLead.tiktok && <span className="bg-white px-3 py-1 rounded-lg text-[10px] font-bold border border-slate-200">TK: {selectedLead.tiktok}</span>}
                      </div>
                    </div>
                    {selectedLead.otherPlatforms && (
                      <div className="md:col-span-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Otras Notas</p>
                        <p className="text-sm font-medium text-slate-600 bg-white p-4 rounded-xl border border-slate-200">{selectedLead.otherPlatforms}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-[10px] font-black text-brand-teal uppercase tracking-widest mb-4">Puntos Fuertes</h4>
                    <ul className="space-y-2">
                      {selectedLead.reportData?.strengths?.map((s: string, i: number) => (
                        <li key={i} className="text-xs font-medium text-slate-600 flex gap-2">
                          <span className="text-emerald-500">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-[10px] font-black text-brand-teal uppercase tracking-widest mb-4">Qué mejorar</h4>
                    <ul className="space-y-2">
                      {selectedLead.reportData?.problems?.map((p: string, i: number) => (
                        <li key={i} className="text-xs font-medium text-slate-600 flex gap-2">
                          <span className="text-amber-500">•</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-brand-teal/5 p-8 rounded-3xl border border-brand-teal/10">
                  <h4 className="text-[10px] font-black text-brand-teal uppercase tracking-widest mb-4">Análisis Técnico</h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                    {selectedLead.reportData?.technicalAnalysis}
                  </p>
                </div>

                <div className="bg-brand-red/5 p-8 rounded-3xl border border-brand-red/10">
                  <h4 className="text-[10px] font-black text-brand-red uppercase tracking-widest mb-4">Plan de Acción</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedLead.reportData?.priorityActions?.map((a: string, i: number) => (
                      <div key={i} className="flex gap-3 items-center">
                        <span className="w-6 h-6 bg-brand-red text-white text-[10px] font-black rounded-lg flex items-center justify-center shrink-0">{i+1}</span>
                        <span className="text-xs font-bold text-slate-600">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => {
                    const doc = generatePDF({
                      businessName: selectedLead.businessName,
                      businessType: selectedLead.businessType || 'otro',
                      location: selectedLead.location || 'N/A',
                      whatsapp: selectedLead.whatsapp,
                      email: selectedLead.email,
                      website: selectedLead.website,
                      instagram: selectedLead.instagram,
                      facebook: selectedLead.facebook,
                      linkedin: selectedLead.linkedin,
                      tiktok: selectedLead.tiktok,
                      otherPlatforms: selectedLead.otherPlatforms
                    } as any, selectedLead.reportData);
                    doc.save(`Auditoria_${selectedLead.businessName.replace(/\s+/g, '_')}.pdf`);
                  }}
                  className="flex-1 bg-brand-teal text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-red transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Descargar PDF
                </button>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}

      {/* Error Modal */}
      {errorModal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-brand-teal/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border-4 border-brand-red/20"
          >
            <div className="w-16 h-16 bg-brand-red/10 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-brand-red" />
            </div>
            <h3 className="text-2xl font-black text-brand-teal mb-4 uppercase tracking-tight">Aviso Importante</h3>
            <p className="text-slate-600 font-medium leading-relaxed mb-8">
              {String(errorModal.message)}
            </p>
            <button 
              onClick={() => setErrorModal({ show: false, message: '' })}
              className="w-full bg-brand-teal text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-red transition-all shadow-lg"
            >
              Entendido
            </button>
          </motion.div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}
