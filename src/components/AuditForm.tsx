import { useState } from 'react';
import { Sparkles, MapPin, Phone, User, Map, MessageSquare, TrendingUp, Award, ArrowLeft, ArrowRight, Instagram, Facebook, Linkedin, Globe } from 'lucide-react';
import { dbSync } from '../lib/supabase';

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

interface AuditFormProps {
  triggerAlert: (type: 'success' | 'err', text: string) => void;
}

export default function AuditForm({ triggerAlert }: AuditFormProps) {
  const [dynamicCity, setDynamicCity] = useState('Valladolid');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Restaurante');
  const [phone, setPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [address, setAddress] = useState('');
  const [comments, setComments] = useState('');
  const [website, setWebsite] = useState('');

  // Novas redes sociais solicitadas pelo usuário para a segunda etapa
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [linkedin, setLinkedin] = useState('');

  // Controle de etapas do formulário
  const [step, setStep] = useState(1);

  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState('');
  const [currentScore, setCurrentScore] = useState<any>(null);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      triggerAlert('err', 'Por favor, introduce el nombre del negocio.');
      return;
    }
    if (!phone.trim()) {
      triggerAlert('err', 'Por favor, introduce tu número de WhatsApp o Teléfono.');
      return;
    }
    setStep(2);
  };

  const runAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName) {
      triggerAlert('err', 'El nombre del negocio es obligatorio para la auditoría.');
      return;
    }

    setIsAuditing(true);
    setCurrentScore(null);

    const progressSteps = [
      "🔍 Localizando negocio local en Google Maps...",
      "⚡ Analizando posicionamiento semántico local...",
      "📊 Evaluando velocidad móvil y experiencia web...",
      "✨ Redactando recomendaciones SEO accionables con Inteligencia Artificial..."
    ];

    for (let i = 0; i < progressSteps.length; i++) {
      setAuditProgress(progressSteps[i]);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          businessType,
          dynamicCity,
          phone,
          contactName,
          address,
          comments,
          instagram,
          facebook,
          tiktok,
          linkedin,
          website
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setCurrentScore(data.lead);
        dbSync.saveLead(data.lead);
        triggerAlert('success', '¡Auditoría generada con éxito!');
      } else {
        throw new Error(data.error || 'Ocurrió un error en el servidor.');
      }
    } catch (err: any) {
      console.error(err);
      triggerAlert('err', 'Usando simulador local de posicionamiento en Valladolid.');
      
      const mockResult = {
        id: Date.now().toString(),
        businessName,
        businessType,
        dynamicCity,
        phone,
        contactName,
        address,
        comments,
        instagram,
        facebook,
        tiktok,
        linkedin,
        website,
        auditScore: 71,
        report: {
          seoScore: 68,
          mapsScore: 75,
          contentScore: 70,
          speedScore: 72,
          analysis: `El negocio ${businessName} muestra un excelente potencial pero adolece de inconsistencia en sus datos NAP (Name, Address, Phone) en ${dynamicCity}. Corrigiendo esto ganará ventaja frente a la competencia de forma inmediata.`,
          recommendations: [
            "Actualizar el horario comercial especial festivo para evitar frustrar visitas de clientes locales.",
            "Estimular a clientes recientes de vuestro restaurante para que aporten reseñas de 5 estrellas mencionando la palabra clave 'Valladolid'.",
            "Optimizar la compresión de imágenes pesadas de la web principal para subir la velocidad en dispositivos móviles."
          ]
        },
        datetime: new Date().toISOString()
      };
      setCurrentScore(mockResult);
      dbSync.saveLead(mockResult);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleWhatsAppContact = (leadData: any) => {
    const score = leadData.auditScore || 65;
    const message = `Hola, acabo de realizar la auditoría gratuita para mi negocio: *${leadData.businessName}* con un puntaje de *${score}/100*. Me gustaría recibir el informe completo y hablar sobre cómo podéis ayudarme a crecer. 🚀`;
    const whatsappUrl = `https://wa.me/34325678398?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div id="auditoria" className="py-24 px-6 bg-brand-dark relative overflow-hidden border-t border-brand-gold/10">
      {/* Visual background atmospheric elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-crimson/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-12">
        {/* Header inside container */}
        <div className="text-center space-y-3">
          <span className="text-brand-gold text-xs font-black uppercase tracking-[0.2em] bg-brand-gold/10 px-3.5 py-1.5 rounded-full inline-block">
            Informe de Posicionamiento Gratis
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white font-serif tracking-tight">
            Consiga su auditoría gratuita inmediata
          </h2>
          <p className="text-stone-400 text-sm max-w-md mx-auto leading-relaxed">
            Analizamos la salud de su ficha de Google Business Profile, SEO web local, reseñas locales y competencia en tiempo real para Valladolid y alrededores.
          </p>
        </div>

        {/* Main Panel Box container */}
        <div className="bg-brand-dark-sec rounded-[2.5rem] p-8 md:p-12 border border-brand-gold/15 relative shadow-2xl">
          {isAuditing && (
            <div className="absolute inset-0 bg-brand-dark-sec/98 rounded-[2.5rem] z-30 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="relative w-24 h-24">
                <span className="absolute inset-0 rounded-full border-4 border-stone-800" />
                <span className="absolute inset-0 rounded-full border-4 border-t-brand-gold animate-spin" />
                <div className="absolute inset-4 rounded-full bg-brand-dark flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-brand-gold" />
                </div>
              </div>
              
              <div className="space-y-2 max-w-sm">
                <h4 className="text-lg font-black text-white">Generando informe de auditoría</h4>
                <p className="text-sm font-bold text-brand-gold animate-pulse">{auditProgress}</p>
              </div>

              <div className="text-[10px] uppercase font-black text-stone-500 tracking-widest bg-brand-dark border border-white/5 px-3 py-1.5 rounded-full">
                Esto tomará unos segundos
              </div>
            </div>
          )}

          {!currentScore ? (
            <form onSubmit={step === 1 ? handleNextStep : runAudit} className="space-y-8">
              {step === 1 ? (
                <>
                  {/* Select dynamic city indicator */}
                  <div className="bg-brand-dark p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-white/5">
                    <div>
                      <span className="block text-xs font-black uppercase text-brand-gold tracking-wider">Provincia Principal de Operaciones</span>
                      <span className="block text-sm font-bold text-stone-300">Analizando competencia localizada en:</span>
                    </div>
                    <div className="flex gap-2">
                      {['Valladolid', 'Madrid'].map((city) => (
                        <button
                          type="button"
                          key={city}
                          onClick={() => setDynamicCity(city)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            dynamicCity === city 
                              ? 'bg-brand-gold text-brand-dark font-black shadow-lg shadow-brand-gold/5' 
                              : 'bg-brand-dark-sec hover:bg-stone-800 text-stone-300 border border-white/5'
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inputs fields grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-brand-gold" /> Nombre del Negocio <span className="text-brand-crimson">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Ej. Restaurante San Pablo o Clínica Serna"
                        className="w-full bg-brand-dark border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-brand-gold focus:bg-black/40 transition-all placeholder:text-stone-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-brand-gold" /> Tipo de Negocio <span className="text-brand-crimson">*</span>
                      </label>
                      <select 
                        required
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full bg-brand-dark border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-brand-gold focus:bg-black/40 transition-all cursor-pointer"
                      >
                        <option value="Restaurante" className="bg-brand-dark text-white">Restaurante</option>
                        <option value="Gimnasio" className="bg-brand-dark text-white">Gimnasio (Academia)</option>
                        <option value="Barbería / Peluquería" className="bg-brand-dark text-white">Barbería / Peluquería</option>
                        <option value="Tienda / Comercio" className="bg-brand-dark text-white">Tienda / Comercio</option>
                        <option value="Clínica / Salud" className="bg-brand-dark text-white">Clínica / Salud</option>
                        <option value="Estética / Belleza" className="bg-brand-dark text-white">Estética / Belleza</option>
                        <option value="Servicios Profesionales" className="bg-brand-dark text-white">Servicios Profesionales</option>
                        <option value="Otros" className="bg-brand-dark text-white">Otros</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-brand-gold" /> WhatsApp / Teléfono <span className="text-brand-crimson">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ej. +34 600 112 233"
                        className="w-full bg-brand-dark border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-brand-gold focus:bg-black/40 transition-all placeholder:text-stone-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                        <User className="w-4 h-4 text-brand-gold" /> Su Nombre (Contacto)
                      </label>
                      <input 
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Ej. Carlos Martínez"
                        className="w-full bg-brand-dark border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-brand-gold focus:bg-black/40 transition-all placeholder:text-stone-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                        <Map className="w-4 h-4 text-brand-gold" /> Dirección / Link de Maps
                      </label>
                      <input 
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ej. Plaza España 4 o pegue link de Maps"
                        className="w-full bg-brand-dark border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-brand-gold focus:bg-black/40 transition-all placeholder:text-stone-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-brand-gold" /> Sitio Web (Opcional)
                      </label>
                      <input 
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="Ej. www.minegocio.com"
                        className="w-full bg-brand-dark border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-brand-gold focus:bg-black/40 transition-all placeholder:text-stone-600"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-brand-gold hover:bg-amber-500 text-brand-dark text-sm font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2.5 mt-8 cursor-pointer border border-white/10"
                  >
                    <span>AVANÇAR AL PASO 2</span>
                    <ArrowRight className="w-5 h-5 text-brand-dark transition-transform group-hover:translate-x-1" />
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-2">
                      <div>
                        <span className="text-xs font-black uppercase text-brand-gold tracking-wider block">Paso 2 de 2</span>
                        <h3 className="text-lg font-black text-white mt-1">Redes Sociales y Detalles (Opcional)</h3>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setStep(1)} 
                        className="text-stone-400 hover:text-brand-gold text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" /> Volver atrás
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                          <Instagram className="w-4 h-4 text-brand-gold" /> Instagram
                        </label>
                        <input 
                          type="text"
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          placeholder="Ej. @mi_restaurante"
                          className="w-full bg-brand-dark border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-brand-gold focus:bg-black/40 transition-all placeholder:text-stone-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                          <Facebook className="w-4 h-4 text-brand-gold" /> Facebook
                        </label>
                        <input 
                          type="text"
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          placeholder="Ej. facebook.com/mi_negocio"
                          className="w-full bg-brand-dark border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-brand-gold focus:bg-black/40 transition-all placeholder:text-stone-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                          <TiktokIcon className="w-4 h-4 text-brand-gold" /> TikTok
                        </label>
                        <input 
                          type="text"
                          value={tiktok}
                          onChange={(e) => setTiktok(e.target.value)}
                          placeholder="Ej. @mi_negocio_tiktok"
                          className="w-full bg-brand-dark border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-brand-gold focus:bg-black/40 transition-all placeholder:text-stone-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                          <Linkedin className="w-4 h-4 text-brand-gold" /> LinkedIn
                        </label>
                        <input 
                          type="text"
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          placeholder="Ej. linkedin.com/company/mi_negocio"
                          className="w-full bg-brand-dark border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-brand-gold focus:bg-black/40 transition-all placeholder:text-stone-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-white/5 mt-4">
                      <label className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-brand-gold" /> ¿Algún comentario extra sobre sus competidores directos? (Opcional)
                      </label>
                      <textarea 
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Ej. Me cuesta superar a Restaurante X en los mapas..."
                        rows={3}
                        className="w-full bg-brand-dark border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-brand-gold focus:bg-black/40 transition-all resize-none placeholder:text-stone-600"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-brand-gold hover:bg-amber-500 text-brand-dark text-sm font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2.5 mt-8 cursor-pointer border border-white/10"
                  >
                    <Sparkles className="w-5 h-5 text-brand-dark fill-current animate-pulse" />
                    <span>INICIAR AUDITORIA</span>
                  </button>
                </>
              )}
            </form>
          ) : (
            <div className="space-y-8 animate-fade-in-up text-white">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/5">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded-md">
                    Auditoría Finalizada
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-1.5">{currentScore.businessName}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">Analizado el {new Date(currentScore.datetime).toLocaleString('es-ES')}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="block text-xs font-bold text-stone-500 uppercase tracking-widest">Puntaje General</span>
                    <span className="block text-xs text-stone-400">Salud de presencia en {dynamicCity}</span>
                  </div>
                  <div className="w-20 h-20 rounded-2xl bg-brand-dark text-white flex flex-col items-center justify-center border border-brand-gold/20 shadow-xl">
                    <span className="text-3xl font-black text-brand-gold">{currentScore.auditScore}</span>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider -mt-1">/100</span>
                  </div>
                </div>
              </div>

              {currentScore.report?.analysis && (
                <div className="p-5 bg-brand-dark rounded-2xl border border-white/5 text-sm leading-relaxed text-stone-300 block italic">
                  &ldquo; {currentScore.report.analysis} &rdquo;
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-brand-dark p-4.5 rounded-2xl border border-white/5 text-center">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1">SEO Google Maps</span>
                  <span className="text-2xl font-black text-brand-gold">{currentScore.report?.mapsScore || 65}%</span>
                </div>

                <div className="bg-brand-dark p-4.5 rounded-2xl border border-white/5 text-center">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1">Densidad Semántica</span>
                  <span className="text-2xl font-black text-brand-gold">{currentScore.report?.seoScore || 68}%</span>
                </div>

                <div className="bg-brand-dark p-4.5 rounded-2xl border border-white/5 text-center">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1">Reputación Reseñas</span>
                  <span className="text-2xl font-black text-brand-gold">{currentScore.report?.contentScore || 70}%</span>
                </div>

                <div className="bg-brand-dark p-4.5 rounded-2xl border border-white/5 text-center">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1">Velocidad Móvil</span>
                  <span className="text-2xl font-black text-brand-gold">{currentScore.report?.speedScore || 72}%</span>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-widest text-brand-gold flex items-center gap-2">
                  <Award className="w-5 h-5 text-brand-gold" /> 3 Medidas Correctivas Inmediatas Recomendadas:
                </span>

                <div className="space-y-3">
                  {currentScore.report?.recommendations?.map((rec: string, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-white/5 bg-brand-dark flex items-start gap-3.5">
                      <span className="w-6 h-6 rounded-lg bg-brand-gold/10 text-brand-gold font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-semibold text-stone-300 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-brand-gold text-brand-dark p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl leading-normal">
                <div className="text-center sm:text-left">
                  <h4 className="font-extrabold text-base text-brand-dark">¿Quiere el plan de ejecución guiado?</h4>
                  <p className="text-xs text-stone-850 mt-1">Hablemos por WhatsApp para ayudarle a implementar este informe paso a paso.</p>
                </div>
                <button 
                  onClick={() => handleWhatsAppContact(currentScore)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-brand-dark text-white hover:bg-stone-900 rounded-xl font-extrabold text-xs uppercase tracking-wide transition-all shadow-md shrink-0 cursor-pointer text-center"
                >
                  Recibir Informe Completo por WhatsApp 🚀
                </button>
              </div>

              <button 
                onClick={() => {
                  setBusinessName('');
                  setPhone('');
                  setContactName('');
                  setAddress('');
                  setComments('');
                  setInstagram('');
                  setFacebook('');
                  setTiktok('');
                  setLinkedin('');
                  setWebsite('');
                  setStep(1);
                  setCurrentScore(null);
                }}
                className="text-xs font-bold text-brand-gold hover:underline mx-auto block mt-4"
              >
                Realizar auditoría para otro negocio local
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
