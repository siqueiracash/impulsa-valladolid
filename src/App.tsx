import React from 'react';
import { motion } from 'motion/react';
import { Rocket, MapPin, Phone, Mail, Instagram, Facebook, Globe, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Loader2, Sparkles, Building2, Utensils, Scissors, Coffee, Store, Dumbbell } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from './lib/utils';
import { AuditFormData, AuditReport, BusinessType } from './types';
import { generateAuditReport } from './services/geminiService';

const formSchema = z.object({
  businessName: z.string().min(2, 'El nombre del negocio es obligatorio'),
  businessType: z.enum(['restaurante', 'bar', 'padaria', 'barbeiro', 'cabeleireiro', 'cafeteria', 'gimnasio', 'outro']),
  location: z.string().min(5, 'La ubicación es obligatoria'),
  whatsapp: z.string().min(8, 'El WhatsApp é obligatorio'),
  email: z.string().email('E-mail inválido'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  googleBusiness: z.string().optional(),
  tiktok: z.string().optional(),
  otherPlatforms: z.string().optional(),
});

export default function App() {
  const [view, setView] = React.useState<'hero' | 'form' | 'loading' | 'report'>('hero');
  const [report, setReport] = React.useState<AuditReport | null>(null);
  const [step, setStep] = React.useState(1);
  const totalSteps = 3;

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<AuditFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessType: 'restaurante',
    }
  });

  const onSubmit = async (data: AuditFormData) => {
    console.log('Iniciando submissão do formulário...', data);
    setView('loading');
    try {
      const result = await generateAuditReport(data);
      setReport(result);
      setView('report');
    } catch (error: any) {
      console.error('Erro detalhado na geração do relatório:', error);
      let errorMessage = 'Houve um erro ao gerar seu relatório. Por favor, verifique sua conexão ou tente novamente em instantes.';
      
      if (error.message === 'API_KEY_MISSING') {
        errorMessage = 'ERRO: A chave GEMINI_API_KEY não foi encontrada. Certifique-se de adicioná-la nas "Environment Variables" da Vercel e fazer um novo Deploy.';
      } else if (error.message?.includes('403') || error.message?.includes('API key not valid')) {
        errorMessage = 'ERRO: A chave de API fornecida é inválida. Verifique se copiou a chave correta do Google AI Studio.';
      } else if (error.message) {
        errorMessage = `Erro técnico: ${error.message}`;
      }

      alert(errorMessage);
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
      console.log('Validação do passo falhou:', errors);
    }
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const businessTypes: { value: BusinessType; label: string; icon: any }[] = [
    { value: 'restaurante', label: 'Restaurante', icon: Utensils },
    { value: 'bar', label: 'Bar', icon: Coffee },
    { value: 'cafeteria', label: 'Cafetería', icon: Coffee },
    { value: 'padaria', label: 'Panadería', icon: Store },
    { value: 'barbeiro', label: 'Barbería', icon: Scissors },
    { value: 'cabeleireiro', label: 'Peluquería', icon: Sparkles },
    { value: 'gimnasio', label: 'Gimnasio', icon: Dumbbell },
    { value: 'outro', label: 'Otro', icon: Building2 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-brand-cream">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('hero')}>
            <div className="w-12 h-12 bg-brand-red rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-red/20 rotate-3">
              <Rocket className="w-7 h-7 -rotate-3" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-2xl tracking-tighter text-brand-red leading-none">
                Impulsa <span className="text-brand-orange">Valladolid</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-teal opacity-70">
                Impulsa tu negocio local
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
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
              className="text-sm font-bold text-brand-teal hover:text-brand-red transition-colors"
            >
              Nuestros Servicios
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
              className="text-sm font-bold text-brand-teal hover:text-brand-red transition-colors"
            >
              Casos de Éxito
            </a>
            <button 
              onClick={() => setView('form')}
              className="bg-brand-red text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-orange transition-all shadow-lg shadow-brand-red/20"
            >
              Auditoría Gratuita
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {view === 'hero' && (
          <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-40">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-orange/10 rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-red/10 rounded-full blur-[120px]" />
            </div>
            
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-left"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-cream text-brand-red text-xs font-black uppercase tracking-widest mb-8 border border-brand-orange/20">
                    <Sparkles className="w-4 h-4" />
                    Valladolid & Madrid Digital
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black text-brand-teal mb-8 leading-[0.95] tracking-tighter">
                    Multiplique sus <br />
                    <span className="text-brand-red">Clientes Locales</span>
                  </h1>
                  <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-xl font-medium">
                    Transformamos su restaurante, bar o comercio en una máquina de ventas en Google y Redes Sociales. Auditoría gratuita para emprendedores de Valladolid.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    <button 
                      onClick={() => setView('form')}
                      className="w-full sm:w-auto bg-brand-red text-white px-10 py-5 rounded-2xl text-lg font-extrabold hover:bg-brand-orange transition-all shadow-2xl shadow-brand-red/30 flex items-center justify-center gap-3 group"
                    >
                      Quiero mi Auditoría
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-brand-cream flex items-center justify-center overflow-hidden">
                            <img src={`https://picsum.photos/seed/person${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>
                      +50 negocios impulsados
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
                    <p className="text-slate-400 font-black text-2xl">Bajo Engajamento</p>
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
                      Altíssimo Engajamento
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
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {businessTypes.map((t) => {
                          const Icon = t.icon;
                          const isSelected = watch('businessType') === t.value;
                          return (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => setValue('businessType', t.value)}
                              className={cn(
                                "flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all gap-3 group",
                                isSelected 
                                  ? "border-brand-red bg-brand-red text-white shadow-xl shadow-brand-red/20" 
                                  : "border-slate-100 bg-slate-50 text-slate-400 hover:border-brand-orange/30 hover:bg-white"
                              )}
                            >
                              <Icon className={cn("w-8 h-8 transition-transform group-hover:scale-110", isSelected ? "text-white" : "text-brand-teal/40")} />
                              <span className="text-[10px] font-black uppercase tracking-tighter">{t.label}</span>
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
                          placeholder="https://suweb.com"
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
                          <Globe className="w-4 h-4 text-brand-red" /> Google Business
                        </label>
                        <input {...register('googleBusiness')} placeholder="Link do perfil" className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-red outline-none font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-teal uppercase tracking-widest flex items-center gap-2">
                           TikTok
                        </label>
                        <input {...register('tiktok')} placeholder="@usuario" className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-red outline-none font-medium" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-brand-teal uppercase tracking-widest">Outras Notas</label>
                      <textarea 
                        {...register('otherPlatforms')}
                        placeholder="Algum detalhe extra sobre sua presença digital?"
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
                <div className="inline-flex items-center gap-8 px-10 py-6 bg-white rounded-3xl border border-brand-cream shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="font-black text-brand-teal uppercase tracking-widest text-xs">Sin Permanencia</span>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="font-black text-brand-teal uppercase tracking-widest text-xs">Solo Resultados</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'loading' && (
          <section className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-8"
            >
              <Loader2 className="w-16 h-16 text-brand-red" />
            </motion.div>
            <h2 className="text-4xl font-black text-brand-teal mb-4 uppercase tracking-widest">Analisando seu negócio...</h2>
            <p className="text-slate-600 max-w-md font-medium">
              Nossa inteligência artificial está auditando sua presença digital e preparando um relatório personalizado para a <span className="font-black text-brand-red">Impulsa Valladolid</span>.
            </p>
            <div className="mt-12 space-y-3 w-full max-w-xs">
              <div className="h-2 bg-brand-cream rounded-full overflow-hidden p-0.5">
                <motion.div 
                  className="h-full bg-brand-red rounded-full"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <p className="text-[10px] text-brand-teal font-black uppercase tracking-widest opacity-40">Processando dados estratégicos</p>
            </div>
          </section>
        )}

        {view === 'report' && report && (
          <section className="py-16 px-4 bg-[#FDFBF7]">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-red text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                    Auditoria Exclusiva
                  </div>
                  <h2 className="text-5xl font-black text-brand-teal leading-none">Diagnóstico <br /><span className="text-brand-red">Estratégico</span></h2>
                </div>
                <button 
                  onClick={() => window.print()}
                  className="bg-white text-brand-teal border-2 border-brand-cream px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:border-brand-red transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-teal/5"
                >
                  Baixar Relatório PDF
                </button>
              </div>

              <div className="grid grid-cols-1 gap-10">
                {/* Storytelling Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-brand-red text-white p-10 md:p-16 rounded-[3rem] shadow-2xl shadow-brand-red/20 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-widest">La Visión del Futuro</h3>
                    </div>
                    <p className="text-2xl md:text-4xl font-medium leading-[1.3] italic text-brand-cream">
                      "{report.storytelling}"
                    </p>
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
                      {report.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-4 text-slate-600 font-medium">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
                          {s}
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
                      {report.problems.map((p, i) => (
                        <li key={i} className="flex items-start gap-4 text-slate-600 font-medium">
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-2.5 shrink-0" />
                          {p}
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
                    {report.socialMediaAnalysis}
                  </p>
                </motion.div>

                {/* Priority Actions */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white p-10 md:p-14 rounded-[3rem] border-4 border-brand-cream shadow-2xl"
                >
                  <h3 className="text-2xl font-black text-brand-teal mb-12 uppercase tracking-widest text-center">Plan de Acción Inmediato</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {report.priorityActions.map((a, i) => (
                      <div key={i} className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-brand-red transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-brand-red text-white flex items-center justify-center text-xl font-black shrink-0 shadow-lg shadow-brand-red/20 group-hover:rotate-6 transition-transform">
                          {i + 1}
                        </div>
                        <span className="text-slate-700 font-bold leading-tight">{a}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Service Proposal */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-brand-cream p-10 md:p-16 rounded-[4rem] text-center relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-brand-orange/5 -z-10" />
                  <h3 className="text-3xl md:text-5xl font-black text-brand-red mb-8 leading-tight">¿Impulsamos su <br />negocio juntos?</h3>
                  <p className="text-brand-teal text-xl mb-12 max-w-2xl mx-auto font-bold leading-relaxed opacity-80">
                    {report.serviceProposal}
                  </p>
                  <button className="bg-brand-red text-white px-12 py-6 rounded-3xl text-2xl font-black uppercase tracking-widest hover:bg-brand-teal transition-all shadow-2xl shadow-brand-red/30 flex items-center justify-center gap-4 mx-auto group">
                    Contactar por WhatsApp
                    <Phone className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  </button>
                </motion.div>
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
                +34 325 678 398
              </li>
              <li className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-brand-red shrink-0" />
                hola@impulsavalladolid.com
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-white/5 text-center text-brand-cream/30 text-[10px] font-black uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} Impulsa Valladolid. Hecho con pasión en España.
        </div>
      </footer>
      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/34325678398" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all group"
      >
        <Phone className="w-8 h-8" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-black shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          ¿Hablamos por WhatsApp?
        </span>
      </a>
    </div>
  );
}
