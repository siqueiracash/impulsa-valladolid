import React from 'react';
import { motion } from 'motion/react';
import { Rocket, MapPin, Phone, Mail, Instagram, Facebook, Globe, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Loader2, Sparkles, Building2, Utensils, Scissors, Coffee, Store } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from './lib/utils';
import { AuditFormData, AuditReport, BusinessType } from './types';
import { generateAuditReport } from './services/geminiService';

const formSchema = z.object({
  businessName: z.string().min(2, 'O nome do negócio é obrigatório'),
  businessType: z.enum(['restaurante', 'bar', 'padaria', 'barbeiro', 'cabeleireiro', 'cafeteria', 'outro']),
  location: z.string().min(5, 'A localização é obrigatória'),
  whatsapp: z.string().min(8, 'WhatsApp é obrigatório'),
  email: z.string().email('E-mail inválido'),
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
    } catch (error) {
      console.error('Erro detalhado na geração do relatório:', error);
      alert('Houve um erro ao gerar seu relatório. Por favor, verifique sua conexão ou tente novamente em instantes.');
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
    { value: 'cafeteria', label: 'Cafeteria', icon: Coffee },
    { value: 'padaria', label: 'Padaria', icon: Store },
    { value: 'barbeiro', label: 'Barbeiro', icon: Scissors },
    { value: 'cabeleireiro', label: 'Cabeleireiro', icon: Scissors },
    { value: 'outro', label: 'Outro', icon: Building2 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('hero')}>
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white">
              <Rocket className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-slate-900">
              Impulsa <span className="text-brand-600">Valladolid</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Como Funciona</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Serviços</a>
            <button 
              onClick={() => setView('form')}
              className="bg-brand-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
            >
              Auditoria Gratuita
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {view === 'hero' && (
          <section className="relative overflow-hidden pt-20 pb-32">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-400 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-600 rounded-full blur-3xl" />
            </div>
            
            <div className="max-w-7xl mx-auto px-4 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-bold mb-6">
                  Marketing Digital para Negócios Locais
                </span>
                <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 leading-[1.1] tracking-tight">
                  Digitalize seu negócio em <br />
                  <span className="text-brand-600">Valladolid & Madrid</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
                  Ajudamos restaurantes, bares e pequenos empreendedores a dominarem o Google e as redes sociais para atrair mais clientes todos os dias.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={() => setView('form')}
                    className="w-full sm:w-auto bg-brand-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-200 flex items-center justify-center gap-2 group"
                  >
                    Começar Auditoria Gratuita
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all">
                    Ver Nossos Planos
                  </button>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {view === 'form' && (
          <section className="py-12 px-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-slate-900">Auditoria Digital</h2>
                  <span className="text-sm font-medium text-slate-500">Passo {step} de {totalSteps}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-brand-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Qual o tipo do seu negócio?</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {businessTypes.map((t) => {
                          const Icon = t.icon;
                          const isSelected = watch('businessType') === t.value;
                          return (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => setValue('businessType', t.value)}
                              className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                                isSelected 
                                  ? "border-brand-600 bg-brand-50 text-brand-700" 
                                  : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                              )}
                            >
                              <Icon className="w-6 h-6" />
                              <span className="text-xs font-bold">{t.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Nome do Estabelecimento</label>
                      <input 
                        {...register('businessName')}
                        placeholder="Ex: Restaurante do João"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                      />
                      {errors.businessName && <p className="text-red-500 text-xs font-medium">{errors.businessName.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Localização (Cidade/Bairro)</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          {...register('location')}
                          placeholder="Ex: Valladolid, Centro"
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      {errors.location && <p className="text-red-500 text-xs font-medium">{errors.location.message}</p>}
                    </div>

                    <button 
                      type="button" 
                      onClick={handleNextStep}
                      className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
                    >
                      Próximo Passo
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">WhatsApp para contato</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          {...register('whatsapp')}
                          placeholder="+34 000 000 000"
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      {errors.whatsapp && <p className="text-red-500 text-xs font-medium">{errors.whatsapp.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">E-mail</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          {...register('email')}
                          placeholder="contato@empresa.com"
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email.message}</p>}
                    </div>

                    <div className="flex gap-4">
                      <button 
                        type="button" 
                        onClick={prevStep}
                        className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Voltar
                      </button>
                      <button 
                        type="button" 
                        onClick={handleNextStep}
                        className="flex-[2] bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
                      >
                        Próximo Passo
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <p className="text-sm text-slate-500 mb-4">Insira os links das suas redes sociais para uma análise completa.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                          <Instagram className="w-3 h-3" /> Instagram
                        </label>
                        <input {...register('instagram')} placeholder="@usuario" className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                          <Facebook className="w-3 h-3" /> Facebook
                        </label>
                        <input {...register('facebook')} placeholder="facebook.com/pagina" className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Google Business
                        </label>
                        <input {...register('googleBusiness')} placeholder="Link do perfil" className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                           TikTok
                        </label>
                        <input {...register('tiktok')} placeholder="@usuario" className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Outras Plataformas</label>
                      <textarea 
                        {...register('otherPlatforms')}
                        placeholder="TripAdvisor, Yelp, etc."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all h-24"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button 
                        type="button" 
                        onClick={prevStep}
                        className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Voltar
                      </button>
                      <button 
                        type="submit"
                        className="flex-[2] bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-200"
                      >
                        Gerar Auditoria Gratuita
                        <Sparkles className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
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
              <Loader2 className="w-16 h-16 text-brand-600" />
            </motion.div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Analisando seu negócio...</h2>
            <p className="text-slate-600 max-w-md">
              Nossa inteligência artificial está auditando sua presença digital e preparando um relatório personalizado para a <span className="font-bold text-brand-600">Impulsa Valladolid</span>.
            </p>
            <div className="mt-8 space-y-2 w-full max-w-xs">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-brand-600"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <p className="text-xs text-slate-400 font-medium italic">Isso pode levar alguns segundos</p>
            </div>
          </section>
        )}

        {view === 'report' && report && (
          <section className="py-12 px-4 bg-slate-50">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                <div>
                  <span className="text-brand-600 font-bold text-sm tracking-widest uppercase mb-2 block">Relatório de Auditoria</span>
                  <h2 className="text-4xl font-bold text-slate-900">Diagnóstico Digital</h2>
                </div>
                <button 
                  onClick={() => window.print()}
                  className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  Baixar PDF
                </button>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Storytelling Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-brand-600 text-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-brand-200 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Sparkles className="w-6 h-6" /> O Futuro do seu Negócio
                    </h3>
                    <p className="text-xl md:text-2xl font-medium leading-relaxed italic opacity-90">
                      "{report.storytelling}"
                    </p>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Strengths */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200"
                  >
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" /> Pontos Fortes
                    </h3>
                    <ul className="space-y-4">
                      {report.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Problems */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200"
                  >
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <AlertCircle className="w-6 h-6 text-amber-500" /> Oportunidades de Melhoria
                    </h3>
                    <ul className="space-y-4">
                      {report.problems.map((p, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                {/* Social Media Analysis */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Instagram className="w-6 h-6 text-brand-600" /> Análise de Presença Social
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    {report.socialMediaAnalysis}
                  </p>
                </motion.div>

                {/* Priority Actions */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-slate-900 text-white p-8 md:p-10 rounded-3xl shadow-2xl"
                >
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                    <Rocket className="w-6 h-6 text-brand-400" /> Plano de Ação Prioritário
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {report.priorityActions.map((a, i) => (
                      <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold shrink-0">
                          {i + 1}
                        </div>
                        <span className="text-slate-300 font-medium">{a}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Service Proposal */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-brand-50 p-8 md:p-12 rounded-[2.5rem] border-2 border-brand-200 text-center"
                >
                  <h3 className="text-2xl font-bold text-brand-900 mb-6">Como a Impulsa Valladolid pode ajudar?</h3>
                  <p className="text-brand-800 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                    {report.serviceProposal}
                  </p>
                  <button className="bg-brand-600 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-200 flex items-center justify-center gap-2 mx-auto">
                    Falar com um Especialista no WhatsApp
                    <Phone className="w-6 h-6" />
                  </button>
                </motion.div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white">
                <Rocket className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight">
                Impulsa <span className="text-brand-600">Valladolid</span>
              </span>
            </div>
            <p className="text-slate-400 max-w-sm mb-8">
              Sua parceira estratégica para digitalização e crescimento de negócios locais em Valladolid e Madrid.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-600 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-600 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-600 transition-all">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Links Rápidos</h4>
            <ul className="space-y-4 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Início</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Auditoria Gratuita</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Serviços</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Contato</h4>
            <ul className="space-y-4 text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                Valladolid, Espanha
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-600" />
                +34 000 000 000
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-600" />
                hola@impulsavalladolid.com
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} Impulsa Valladolid. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
