import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  MapPin, 
  Map, 
  Phone, 
  User, 
  CheckCircle, 
  MessageSquare, 
  ArrowRight, 
  Lock, 
  Search, 
  Database, 
  AlertCircle, 
  Star, 
  Check, 
  ChevronRight,
  Menu,
  X,
  Award
} from 'lucide-react';
import { dbSync } from './lib/supabase';

export default function App() {
  // Navigation & View States
  const [view, setView] = useState<'landing' | 'admin'>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Dynamic City (defaults to Valladolid)
  const [dynamicCity, setDynamicCity] = useState('Valladolid');
  
  // Lead submission form
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [address, setAddress] = useState('');
  const [comments, setComments] = useState('');
  
  // Audit runner status
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState('');
  const [currentScore, setCurrentScore] = useState<any>(null);
  
  // Admin Login
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminLeads, setAdminLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Floating notifications or test logs
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'err'; text: string } | null>(null);

  // Sync client-side cached leads into component local state
  useEffect(() => {
    // If we have local cached leads for user display
    const cachedLeads = dbSync.getLeads();
    if (cachedLeads.length > 0 && adminLeads.length === 0) {
      // Just populate initial client state
    }
  }, []);

  // Quick feedback alert helper
  const triggerAlert = (type: 'success' | 'err', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => {
      setAlertMsg(null);
    }, 4000);
  };

  // Run the audit
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

    // Loop through progress steps for immersive visual experience
    for (let i = 0; i < progressSteps.length; i++) {
      setAuditProgress(progressSteps[i]);
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          dynamicCity,
          phone,
          contactName,
          address,
          comments
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setCurrentScore(data.lead);
        // Persist local duplicate so user can see their own leads even on refresh
        dbSync.saveLead(data.lead);
        triggerAlert('success', '¡Auditoría generada con éxito!');
      } else {
        throw new Error(data.error || 'Ocurrió un error en el servidor.');
      }
    } catch (err: any) {
      console.error(err);
      triggerAlert('err', err.message || 'Error de conexión con el servidor. Usando simulador local.');
      
      // Local fallback simulator if API is blocked or offline
      const mockResult = {
        id: Date.now().toString(),
        businessName,
        dynamicCity,
        phone,
        contactName,
        address,
        comments,
        auditScore: 71,
        report: {
          seoScore: 68,
          mapsScore: 75,
          contentScore: 70,
          speedScore: 72,
          analysis: `El negocio ${businessName} muestra un excelente potencial pero adolece de inconsistencia en sus datos NAP (Name, Address, Phone) en ${dynamicCity}. Corrigiendo esto ganará ventaja frente a la competencia.`,
          recommendations: [
            "Actualizar el horario comercial especial festivo para evitar frustrar visitas de clientes.",
            "Estimular a clientes recientes para que aporten reseñas de 5 estrellas mencionando Valladolid.",
            "Optimizar la compresión de imágenes pesadas de la web principal para subir la velocidad en móviles."
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

  // Fetch leads for Admin View
  const fetchLeads = async (customToken?: string) => {
    const token = customToken || adminPassword;
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminLeads(data.leads);
        setIsAdminAuthenticated(true);
        triggerAlert('success', 'Panel de administración sincronizado.');
      } else {
        setLoginError(data.error || 'Contraseña incorrecta.');
      }
    } catch (err) {
      setLoginError('Error de conexión con el backend.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    // Slight simulated network delay
    setTimeout(async () => {
      await fetchLeads();
      setIsLoggingIn(false);
    }, 800);
  };

  // Action to send whatsapp message
  const handleWhatsAppContact = (leadData: any) => {
    const score = leadData.auditScore || 65;
    const message = `Hola, acabo de realizar la auditoría gratuita para mi negocio: *${leadData.businessName}* con un puntaje de *${score}/100*. Me gustaría recibir el informe completo y hablar sobre cómo podéis ayudarme a crecer. 🚀`;
    const whatsappUrl = `https://wa.me/351929051990?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Smooth scroll to element id
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-slate-900 transition-colors selection:bg-brand-orange/30 selection:text-slate-900 relative">
      
      {/* Visual background atmospheric effects - NO simulated infrastructure tags/logs */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#FFF5E6]/60 to-transparent pointer-events-none -z-10" />

      {/* Floating Alert Alert Banner */}
      {alertMsg && (
        <div className={`fixed top-6 right-6 z-[120] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl transition-all duration-300 animate-fade-in-up ${
          alertMsg.type === 'success' 
            ? 'bg-emerald-600 text-white border border-emerald-500/20' 
            : 'bg-rose-600 text-white border border-rose-500/20'
        }`}>
          {alertMsg.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-semibold">{alertMsg.text}</p>
        </div>
      )}

      {/* Modern Header Header */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-brand-teal/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="w-11 h-11 rounded-2xl bg-[#1E3E3E] text-white flex items-center justify-center shadow-lg shadow-brand-teal/10 hover:scale-105 transition-all">
              <TrendingUp className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-[#1E3E3E] block">Impulsa</span>
              <span className="text-[10px] uppercase tracking-[0.2em] -mt-1 block text-brand-orange font-black">Valladolid</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          {view === 'landing' ? (
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToId('ventajas')} className="text-sm font-bold text-slate-600 hover:text-[#1E3E3E] transition-all">Nuestros Servicios</button>
              <button onClick={() => scrollToId('casos')} className="text-sm font-bold text-slate-600 hover:text-[#1E3E3E] transition-all">Casos de Éxito</button>
              <button onClick={() => scrollToId('planes')} className="text-sm font-bold text-slate-600 hover:text-[#1E3E3E] transition-all">Metas & Planes</button>
              <button onClick={() => setView('admin')} className="text-sm font-bold text-slate-500 hover:text-[#1E3E3E] flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all">
                <Lock className="w-4 h-4" /> Admin
              </button>
              <button 
                onClick={() => scrollToId('auditoria')} 
                className="bg-[#1E3E3E] text-white text-xs font-extrabold tracking-wider uppercase px-5 py-3 rounded-xl shadow-lg hover:bg-[#2e5757] hover:shadow-brand-teal/15 transition-all"
              >
                Auditoría Gratuita
              </button>
            </nav>
          ) : (
            <nav className="flex items-center gap-4">
              <button 
                onClick={() => setView('landing')} 
                className="text-sm font-bold text-[#1E3E3E] hover:underline"
              >
                Volver a la Web
              </button>
              {isAdminAuthenticated && (
                <button 
                  onClick={() => { setIsAdminAuthenticated(false); setAdminPassword(''); }} 
                  className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 hover:bg-rose-100 transition-all"
                >
                  Cerrar Sesión
                </button>
              )}
            </nav>
          )}

          {/* Mobile menu trigger */}
          {view === 'landing' && (
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden p-2 rounded-xl text-[#1E3E3E] hover:bg-brand-cream/60 transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}

        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FDFBF7] border-b border-brand-teal/5 py-6 px-6 space-y-4 animate-fade-in-up">
            <button onClick={() => scrollToId('ventajas')} className="block w-full text-left font-bold text-slate-600 hover:text-[#1E3E3E] py-2">Nuestros Servicios</button>
            <button onClick={() => scrollToId('casos')} className="block w-full text-left font-bold text-slate-600 hover:text-[#1E3E3E] py-2">Casos de Éxito</button>
            <button onClick={() => scrollToId('planes')} className="block w-full text-left font-bold text-slate-600 hover:text-[#1E3E3E] py-2">Metas & Planes</button>
            <button onClick={() => { setView('admin'); setMobileMenuOpen(false); }} className="block w-full text-left font-bold text-slate-500 hover:text-[#1E3E3E] py-2 flex items-center gap-1.5">
              <Lock className="w-4 h-4" /> Admin Panel
            </button>
            <button 
              onClick={() => scrollToId('auditoria')} 
              className="w-full bg-[#1E3E3E] text-white text-center text-xs font-extrabold tracking-wider uppercase py-3.5 rounded-xl block"
            >
              Auditoría Gratuita
            </button>
          </div>
        )}
      </header>

      {/* LANDING VIEW TEMPLATE */}
      {view === 'landing' && (
        <main className="flex-grow">
          
          {/* HERO SECTION - Elegant layout, correct text size to avoid overlapping standard image mockups */}
          <section className="relative pt-12 pb-24 px-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Text side (Col 7) */}
              <div className="lg:col-span-7 space-y-8 relative z-20">
                
                {/* Visual badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E3E3E]/5 text-[#1E3E3E] text-xs font-bold uppercase tracking-widest border border-brand-teal/10">
                  <Sparkles className="w-4 h-4 text-brand-orange animate-pulse" />
                  {dynamicCity === 'Madrid' ? 'Madrid & Valladolid Digital' : `${dynamicCity} Digital`}
                </div>

                {/* Main Heading heading. Adjusted size from 9xl to 8xl-max to prevent overlapping the visual image */}
                <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[#1E3E3E] leading-[1.05] tracking-tight">
                  No deje que su <br />
                  <span className="text-brand-orange block">concurrencia gane</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                  Mientras usted lee esto, sus clientes locales están buscando sus servicios en Google y eligiendo a su competencia. Nosotros nos encargamos de posicionar su negocio local en el codiciado <strong className="text-[#1E3E3E]">Top 3 de Google Maps</strong> para dominar las búsquedas locales.
                </p>

                {/* Multi-action control */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                  <button 
                    onClick={() => scrollToId('auditoria')}
                    className="w-full sm:w-auto px-8 py-4 bg-[#1E3E3E] hover:bg-[#2b5959] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-brand-teal/15 hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wider group"
                  >
                    <span>Auditar mi Ficha Gratis</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-all text-brand-orange" />
                  </button>
                  <button 
                    onClick={() => scrollToId('casos')}
                    className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-2xl border border-slate-200 font-bold transition-all text-sm"
                  >
                    Ver casos de éxito
                  </button>
                </div>

                {/* Sub features stats */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-brand-teal/10 max-w-md">
                  <div>
                    <span className="block text-2xl font-black text-[#1E3E3E]">+140%</span>
                    <span className="block text-xs font-semibold text-slate-500">Volumen llamadas</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-[#1E3E3E]">100%</span>
                    <span className="block text-xs font-semibold text-slate-500">Casos optimizados</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-[#1E3E3E]">&lt;24hrs</span>
                    <span className="block text-xs font-semibold text-slate-500">Tiempo de auditoría</span>
                  </div>
                </div>

              </div>

              {/* Graphic side (Col 5) - Beautiful Mockup representation of Restaurant/Local rankings on Google Maps */}
              <div className="lg:col-span-5 relative">
                
                {/* Accent design blobs */}
                <div className="absolute -top-12 -left-12 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none -z-10" />
                <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

                {/* Visual Storefront Mockup container */}
                <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-6 select-none relative z-10 hover:shadow-3xl transition-all duration-500">
                  
                  {/* Local Business card with simulated search bar in header */}
                  <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-200">
                    <div className="flex items-center gap-3.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-500">Google Local Search Valladolid</span>
                    </div>
                    <Search className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Top Rated search result item */}
                  <div className="p-5 rounded-2xl border-2 border-amber-400/60 bg-gradient-to-r from-amber-500/5 to-transparent relative">
                    <div className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>Anuncio Top #1</span>
                    </div>
                    
                    <h3 className="text-base font-extrabold text-[#1E3E3E] mb-1">Restaurante Sabor Castellano</h3>
                    
                    {/* Stars and rating count */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className="text-xs font-extrabold text-amber-600">4.9</span>
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-current text-current" />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400 font-bold">(142 reseñas de clientes locales)</span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed max-w-[280px]">
                      📍 Calle de Santiago, Valladolid • Restaurante especializado en gastronomía local tradicional castellana.
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-600">● Abierto • Muy concurrido</span>
                      <button className="text-xs font-bold text-[#1E3E3E] hover:underline flex items-center gap-1">
                        Ver Ficha <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Competitor list preview block */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Otros competidores locales en Google Maps:</span>
                    
                    {/* Competitor row */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between opacity-80">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700">Cafetería Plaza Mayor</h4>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                          <span>4.2</span>
                          <span>•</span>
                          <span>(45 reseñas)</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-400">Puesto #7</span>
                    </div>

                    {/* Competitor row 2 */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between opacity-60">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700">Bar Central tapeo</h4>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                          <span>3.9</span>
                          <span>•</span>
                          <span>(18 reseñas)</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-400">Puesto #12</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </section>

          {/* THE COST OF INVISIBILITY SECTION - styled in response to user updates!
              Used the exact requested 'brand-orange' elements for consistent aesthetics */}
          <section id="ventajas" className="py-24 bg-[#1E3E3E] text-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-orange block">Métricas que Importan</span>
                <h2 className="text-3xl md:text-5xl font-black leading-tight text-white tracking-tight">El costo insoportable de la invisibilidad digital</h2>
                <div className="w-16 h-1 bg-brand-orange mx-auto rounded-full mt-4" />
              </div>

              {/* 2 Big visual panels representing local reach */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                
                {/* Stat 1 - Modified color background in response to last feedback: bg-brand-orange/10 & text-brand-orange */}
                <div className="p-10 bg-brand-orange/10 rounded-[3rem] border border-brand-orange/20 flex flex-col justify-between gap-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                  <div className="space-y-4">
                    <span className="w-12 h-12 rounded-2xl bg-brand-orange/20 text-brand-orange flex items-center justify-center font-black">1</span>
                    <h3 className="text-2xl font-extrabold text-white">El Costo de la Invisiblidad</h3>
                    <p className="text-slate-300 leading-relaxed text-sm">
                      La inmensa mayoría de las intenciones de compra offline inician online. Si su negocio no destaca en este paso, está regalando clientes directamente.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-white/10 flex items-baseline gap-4">
                    <span className="text-6xl font-black text-brand-orange">94%</span>
                    <span className="text-sm font-semibold text-slate-300">De los clientes consultan Google antes de visitar un negocio local.</span>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 flex flex-col justify-between gap-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                  <div className="space-y-4">
                    <span className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">2</span>
                    <h3 className="text-2xl font-extrabold text-white">Dominancia del Top 3</h3>
                    <p className="text-slate-300 leading-relaxed text-sm">
                      Google Maps preselecciona los 3 mejores negocios en el buscador principal. No aparecer allí significa un abandono digital completo.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-white/10 flex items-baseline gap-4">
                    <span className="text-6xl font-black text-amber-400">Top 3</span>
                    <span className="text-sm font-semibold text-slate-300">Los 3 primeros resultados se quedan con el 75% de las llamadas totales.</span>
                  </div>
                </div>

              </div>

              {/* Action and warning tag as noted in previous edits */}
              <div className="text-center pt-16 space-y-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-extrabold font-['Space_Grotesk']">Si no es el primero, no existe.</p>
                <button 
                  onClick={() => scrollToId('auditoria')} 
                  className="px-10 py-5 bg-brand-orange hover:bg-amber-600 text-slate-900 rounded-2xl font-extrabold uppercase tracking-wide text-xs shadow-xl shadow-brand-orange/10 hover:shadow-brand-orange/20 transition-all hover:scale-105 inline-block"
                >
                  Diferenciarse Ahora
                </button>
              </div>

            </div>
          </section>

          {/* INTERACTIVE AUDIT SECTION */}
          <section id="auditoria" className="py-24 px-6 bg-[#FAF6EE] relative overflow-hidden">
            <div className="max-w-4xl mx-auto relative z-10">
              
              {/* Header inside container */}
              <div className="text-center space-y-3 mb-12">
                <span className="text-[#1E3E3E] text-xs font-black uppercase tracking-[0.2em] bg-[#1E3E3E]/5 px-3.5 py-1.5 rounded-full inline-block">Informe de Posicionamiento Gratis</span>
                <h2 className="text-3xl md:text-5xl font-black text-[#1E3E3E] tracking-tight">Consiga su auditoría gratuita inmediata</h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  Analizamos la salud de su ficha de Google Business Profile, SEO web local, reseñas locales y competencia en tiempo real.
                </p>
              </div>

              {/* Main Panel Box container */}
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-150 relative">
                
                {/* Auditor is auditing state overlay */}
                {isAuditing && (
                  <div className="absolute inset-0 bg-white/95 rounded-[2.5rem] z-30 flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <div className="relative w-24 h-24">
                      {/* Modern circular spin loader */}
                      <span className="absolute inset-0 rounded-full border-4 border-slate-100" />
                      <span className="absolute inset-0 rounded-full border-4 border-t-brand-orange animate-spin" />
                      <div className="absolute inset-4 rounded-full bg-slate-50 flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-[#1E3E3E]" />
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-w-sm">
                      <h4 className="text-lg font-black text-[#1E3E3E]">Generando informe de auditoría</h4>
                      <p className="text-sm font-bold text-slate-500 animate-pulse">{auditProgress}</p>
                    </div>

                    <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest bg-slate-100 px-3 py-1.5 rounded-full">
                      Esto tomará unos segundos
                    </div>
                  </div>
                )}

                {/* Audit Input Form */}
                {!currentScore ? (
                  <form onSubmit={runAudit} className="space-y-8">
                    
                    {/* Select dynamic city indicator */}
                    <div className="bg-slate-50 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-slate-200">
                      <div>
                        <span className="block text-xs font-black uppercase text-slate-400 tracking-wider">Provincia Principal de Operaciones</span>
                        <span className="block text-sm font-bold text-slate-700">Analizando competencia localizada en:</span>
                      </div>
                      <div className="flex gap-2">
                        {['Valladolid', 'Madrid'].map((city) => (
                          <button
                            type="button"
                            key={city}
                            onClick={() => setDynamicCity(city)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              dynamicCity === city 
                                ? 'bg-[#1E3E3E] text-white shadow-md' 
                                : 'bg-white hover:bg-slate-100 text-[#1E3E3E] border border-slate-200'
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
                        <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#1E3E3E]" /> Nombre del Negocio <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Ej. Restaurante San Pablo o Clínica Serna"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-orange focus:bg-white transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-[#1E3E3E]" /> WhatsApp / Teléfono <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Ej. +34 600 112 233"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-orange focus:bg-white transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                          <User className="w-4 h-4 text-[#1E3E3E]" /> Su Nombre (Contacto)
                        </label>
                        <input 
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Ej. Carlos Martínez"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-orange focus:bg-white transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                          <Map className="w-4 h-4 text-[#1E3E3E]" /> Dirección del Negocio / Link de Maps
                        </label>
                        <input 
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Ej. Plaza España 4 o pegue link de Maps"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-orange focus:bg-white transition-all"
                        />
                      </div>

                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-[#1E3E3E]" /> ¿Algún comentario extra sobre sus competidores directos?
                      </label>
                      <textarea 
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Ej. Me cuesta superar a Restaurante X en los mapas..."
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-orange focus:bg-white transition-all resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-4.5 bg-[#1E3E3E] hover:bg-[#285353] text-[#FAF6EE] text-sm font-extrabold uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-teal/10 hover:shadow-brand-teal/20 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      <Sparkles className="w-4 h-4 text-brand-orange" />
                      <span>Iniciar Auditoría Automatizada</span>
                    </button>

                  </form>
                ) : (
                  
                  // Score Results Display State
                  <div className="space-y-8 animate-fade-in-up">
                    
                    {/* Header back & score badge */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
                      <div className="text-center sm:text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1E3E3E] bg-[#1E3E3E]/5 px-2.5 py-1 rounded-md">Auditoría Finalizada</span>
                        <h3 className="text-xl font-extrabold text-[#1E3E3E] mt-1">{currentScore.businessName}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Analizado el {new Date(currentScore.datetime).toLocaleString('es-ES')}</p>
                      </div>
                      
                      {/* Overall Rating Score view */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Puntaje General</span>
                          <span className="block text-xs text-slate-500">Salud de presencia local en {dynamicCity}</span>
                        </div>
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1E3E3E] to-[#2d5c5c] text-white flex flex-col items-center justify-center shadow-lg">
                          <span className="text-3xl font-black text-amber-400">{currentScore.auditScore}</span>
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider -mt-1">/100</span>
                        </div>
                      </div>
                    </div>

                    {/* SEO analysis commentary text banner */}
                    {currentScore.report?.analysis && (
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-150 text-sm leading-relaxed text-slate-600 block italic">
                        &ldquo; {currentScore.report.analysis} &rdquo;
                      </div>
                    )}

                    {/* Breakdown sub scores */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      
                      <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 text-center">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">SEO Google Maps</span>
                        <span className="text-2xl font-black text-[#1E3E3E]">{currentScore.report?.mapsScore || 65}%</span>
                      </div>

                      <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 text-center">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Densidad Semántica</span>
                        <span className="text-2xl font-black text-[#1E3E3E]">{currentScore.report?.seoScore || 68}%</span>
                      </div>

                      <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 text-center">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Reputación Reseñas</span>
                        <span className="text-2xl font-black text-[#1E3E3E]">{currentScore.report?.contentScore || 70}%</span>
                      </div>

                      <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 text-center">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Velocidad Móvil</span>
                        <span className="text-2xl font-black text-[#1E3E3E]">{currentScore.report?.speedScore || 72}%</span>
                      </div>

                    </div>

                    {/* Recommendations checklist block */}
                    <div className="space-y-4">
                      <span className="text-xs font-black uppercase tracking-widest text-[#1E3E3E] flex items-center gap-2">
                        <Award className="w-5 h-5 text-brand-orange" /> 3 Medidas Correctivas Inmediatas Recomendadas:
                      </span>

                      <div className="space-y-3">
                        {currentScore.report?.recommendations?.map((rec: string, idx: number) => (
                          <div key={idx} className="p-4 rounded-xl border border-[#1E3E3E]/10 bg-[#1E3E3E]/2 flex items-start gap-3.5">
                            <span className="w-6 h-6 rounded-lg bg-brand-orange/20 text-[#1E3E3E] font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-sm font-semibold text-slate-700 leading-relaxed">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Call to action panel */}
                    <div className="bg-[#1E3E3E] text-white p-6.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl leading-normal">
                      <div className="text-center sm:text-left">
                        <h4 className="font-extrabold text-base text-white">¿Quiere el plan de ejecución guiado?</h4>
                        <p className="text-xs text-slate-300 mt-1">Hablemos por WhatsApp para ayudarle a implementar este informe paso a paso.</p>
                      </div>
                      <button 
                        onClick={() => handleWhatsAppContact(currentScore)}
                        className="w-full sm:w-auto px-6 py-3.5 bg-brand-orange hover:bg-amber-600 text-slate-900 rounded-xl font-extrabold text-xs uppercase tracking-wide transition-all shadow-md shrink-0 cursor-pointer text-center"
                      >
                        Recibir Informe Completo 🚀
                      </button>
                    </div>

                    {/* Reset audit form action */}
                    <button 
                      onClick={() => {
                        setBusinessName('');
                        setPhone('');
                        setContactName('');
                        setAddress('');
                        setComments('');
                        setCurrentScore(null);
                      }}
                      className="text-xs font-bold text-[#1E3E3E] hover:underline mx-auto block mt-4"
                    >
                      Realizar auditoría para otro negocio local
                    </button>

                  </div>
                )}

              </div>

            </div>
          </section>

          {/* DYNAMIC SUCCESS STORIES TESTIMONIALS */}
          <section id="casos" className="py-24 px-6 max-w-7xl mx-auto">
            <div className="text-center space-y-3 mb-20 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block">Liderazgo Verificado</span>
              <h2 className="text-3xl md:text-5xl font-black text-[#1E3E3E] tracking-tight">Vallisoletanos que ya encabezan el mapa</h2>
              <p className="text-slate-500 text-sm">
                Vea cómo de pasar desapercibidos en Google pasaron a colapsar sus teléfonos con reservas reales optimizando su SEO local de nuestra mano.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-white p-8 rounded-3xl border border-slate-150 hover:shadow-xl transition-all flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <h3 className="text-lg font-bold text-[#1E3E3E]">Taverna Platerías</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-sans">
                    "Increíble ver los resultados antes del primer mes. Nuestra taberna tradicional pasó al Puesto #1 en la búsqueda 'tapas centro' de nuestra ciudad, logrando hasta 3 mesas ocupadas extras al día."
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Restauración • Plaza Mayor</span>
                  <span className="text-xs font-black text-emerald-600 uppercase">+150% Reservas</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-150 hover:shadow-xl transition-all flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <h3 className="text-lg font-bold text-[#1E3E3E]">Fisioterapia Recoletas</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-sans">
                    "Tener una web no nos servía si la gente de la zona buscaba 'fisioterapeuta urgente' y no nos encontraba en el móvil. Con el optimizador de Google Maps hemos duplicado llamadas."
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Salud • Paseo Zorrilla</span>
                  <span className="text-xs font-black text-emerald-600 uppercase">+88% Contactos</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-150 hover:shadow-xl transition-all flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <h3 className="text-lg font-bold text-[#1E3E3E]">Peluquería Delicias</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-sans">
                    "Nuestros clientes fieles nos querían mucho pero no atraíamos clientes nuevos de otras zonas de Valladolid. Ocupando las primeras posiciones de los mapas, nuestra agenda está al completo."
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Estética • Barrio Delicias</span>
                  <span className="text-xs font-black text-emerald-600 uppercase">+120% Agenda</span>
                </div>
              </div>

            </div>
          </section>

          {/* PLANS AND PRICING pricing plans requested id */}
          <section id="planes" className="py-24 px-4 bg-[#1E3E3E]/5 relative">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center space-y-3 mb-16 max-w-xl mx-auto">
                <span className="text-xs font-bold uppercase tracking-widest text-[#1E3E3E] bg-[#1E3E3E]/5 px-3 py-1 rounded-md">Transparencia Total</span>
                <h2 className="text-2xl md:text-4xl font-black text-[#1E3E3E] tracking-tight">Planes de Optimización y Posicionamiento Local</h2>
                <p className="text-slate-500 text-sm">
                  Tarifas planas adaptadas al tamaño y sector de su negocio local. Sin letra pequeña.
                </p>
              </div>

              {/* Plans pricing grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                
                {/* Plan 1 */}
                <div className="bg-white rounded-3xl p-8 border border-slate-150 flex flex-col justify-between gap-8 hover:shadow-lg transition-all">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Pila Básica</h4>
                      <h3 className="text-xl font-bold text-[#1E3E3E] mt-1">Configuración Ficha</h3>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-[#1E3E3E]">149€</span>
                        <span className="text-xs font-bold text-slate-400">/pago único</span>
                      </div>
                    </div>
                    
                    <ul className="space-y-3 text-xs font-semibold text-slate-600">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-orange flex-shrink-0" /> Configuración NAP exacta (Nombre, Dirección, Teléfono)</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-orange flex-shrink-0" /> Selección de categorías primarias y secundarias</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-orange flex-shrink-0" /> Subida de primeras 15 fotos GEO-optimizadas</li>
                    </ul>
                  </div>

                  <button onClick={() => scrollToId('auditoria')} className="w-full py-3 bg-[#1E3E3E] hover:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all">
                    Empezar Ahora
                  </button>
                </div>

                {/* Plan 2 - REcommended */}
                <div className="bg-white rounded-3xl p-8 border-2 border-brand-orange flex flex-col justify-between gap-8 shadow-xl relative scale-105">
                  <div className="absolute top-0 right-8 -translate-y-1/2 bg-brand-orange text-slate-900 text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md">
                    Más Popular
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-extrabold uppercase tracking-wider text-brand-orange">Impulso Maps</h4>
                      <h3 className="text-xl font-bold text-[#1E3E3E] mt-1">Optimización & Reseñas</h3>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-[#1E3E3E]">299€</span>
                        <span className="text-xs font-bold text-slate-400">/único pago</span>
                      </div>
                    </div>
                    
                    <ul className="space-y-3 text-xs font-semibold text-slate-600">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-orange flex-shrink-0" /> Todo lo de la "Pila Básica" configurado</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-orange flex-shrink-0" /> Redacción optimizada de descripciones con IA</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-orange flex-shrink-0" /> Código QR físico personalizado para vuestro local</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-orange flex-shrink-0" /> Campaña inicial de incentivo de opiniones</li>
                    </ul>
                  </div>

                  <button onClick={() => scrollToId('auditoria')} className="w-full py-3.5 bg-brand-orange hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-black tracking-wider uppercase transition-all">
                    Reclamar mi Impulso
                  </button>
                </div>

                {/* Plan 3 */}
                <div className="bg-white rounded-3xl p-8 border border-slate-150 flex flex-col justify-between gap-8 hover:shadow-lg transition-all">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Crecimiento Total</h4>
                      <h3 className="text-xl font-bold text-[#1E3E3E] mt-1">Presencia Infinita</h3>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-[#1E3E3E]">99€</span>
                        <span className="text-xs font-bold text-slate-400">/al mes (Suscripción)</span>
                      </div>
                    </div>
                    
                    <ul className="space-y-3 text-xs font-semibold text-slate-600">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-orange flex-shrink-0" /> Gestión mensual completa de reviews locales</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-orange flex-shrink-0" /> Publicaciones quincenales en la ficha de Maps</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-orange flex-shrink-0" /> Dashboard mensual de llamadas y visitas locales</li>
                    </ul>
                  </div>

                  <button onClick={() => scrollToId('auditoria')} className="w-full py-3 bg-[#1E3E3E] hover:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all">
                    Saber Más
                  </button>
                </div>

              </div>
            </div>
          </section>

        </main>
      )}

      {/* ADMIN DATA MANAGEMENT VIEW */}
      {view === 'admin' && (
        <main className="flex-grow py-12 px-6 max-w-7xl mx-auto w-full">
          
          <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block">Panel de Control Interno</span>
              <h2 className="text-2xl md:text-4xl font-black text-[#1E3E3E]">Administración de Leads de Auditoría</h2>
              <p className="text-slate-500 text-xs mt-0.5">Siga los leads capturados y gestióne sus contactos fácilmente.</p>
            </div>
            
            <button 
              onClick={() => setView('landing')} 
              className="text-xs font-bold tracking-wider uppercase bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl border border-slate-200"
            >
              Volver a la Web
            </button>
          </div>

          {!isAdminAuthenticated ? (
            
            /* Login Box panel */
            <div className="bg-white max-w-md mx-auto p-10 rounded-3xl border border-slate-150 shadow-2xl relative">
              <div className="text-center space-y-2 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#1E3E3E] mx-auto flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Identificación de Administrador</h3>
                <p className="text-xs text-slate-400">Escriba su contraseña secreta asignada en el archivo de configuración.</p>
              </div>

              {loginError && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Contraseña Secreta (ADMIN_PASSWORD)</label>
                  <input 
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-orange focus:bg-white transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-4 bg-[#1E3E3E] hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all shadow-md disabled:bg-slate-300"
                >
                  {isLoggingIn ? 'Verificando con Servidor...' : 'Entrar al Panel Admin'}
                </button>
              </form>
            </div>

          ) : (
            
            /* Authenticated Admin View elements */
            <div className="space-y-8 animate-fade-in-up">
              
              {/* Table details list */}
              <div className="bg-white rounded-[2.5rem] border border-slate-150 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                  <h3 className="text-lg font-extrabold text-[#1E3E3E] flex items-center gap-2">
                    <Database className="w-5 h-5 text-brand-orange" /> Registro Histórico de Leads de Impulsa ({adminLeads.length})
                  </h3>
                  <button 
                    onClick={() => fetchLeads()} 
                    className="text-xs font-bold text-slate-500 hover:text-[#1E3E3E] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"
                  >
                    Actualizar Lista
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                        <th className="px-8 py-5">Negocio</th>
                        <th className="px-6 py-5">Ubicación</th>
                        <th className="px-6 py-5">Contacto / Teléfono</th>
                        <th className="px-6 py-5">Puntaje Auditoría</th>
                        <th className="px-8 py-5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminLeads.length === 0 ? (
                        <tr>
                          {/* Matches exact template placeholder style from the last edit session! */}
                          <td colSpan={5} className="px-8 py-24 text-center">
                            <div className="flex flex-col items-center justify-center gap-4 text-slate-300">
                              <Database className="w-16 h-16 opacity-20" />
                              <p className="text-lg font-bold italic">No hay leads registrados todavía.</p>
                              <p className="text-[10px] uppercase tracking-widest font-black opacity-50">Sincronización activa en tiempo real</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        adminLeads.map((lg) => (
                          <tr key={lg.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5">
                              <span className="block text-sm font-extrabold text-[#1E3E3E]">{lg.businessName}</span>
                              <span className="block text-[10px] text-slate-400">{new Date(lg.datetime).toLocaleString('es') || 'Reciente'}</span>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-xs font-bold text-slate-600 block">{lg.dynamicCity}</span>
                              <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">{lg.address || 'Sin dirección registrada'}</span>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-xs font-bold text-slate-700 block">{lg.contactName || 'No especificado'}</span>
                              <span className="text-xs text-slate-500 font-mono block">{lg.phone || 'Sin número'}</span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="inline-flex items-center gap-2">
                                <span className={`text-xs font-extrabold px-2 py-1 rounded-md ${
                                  (lg.auditScore || 60) > 75 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}>
                                  {lg.auditScore || 65}/100
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-right space-x-2">
                              <button 
                                onClick={() => setSelectedLead(lg)}
                                className="text-xs font-bold text-[#1E3E3E] bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg"
                              >
                                Ver Informe
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Lead Details Modal Popover Dialog */}
              {selectedLead && (
                <div className="fixed inset-0 bg-[#1E3E3E]/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                  <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-3xl border border-slate-100 max-h-[90vh] flex flex-col animate-fade-in-up">
                    
                    {/* Header modal */}
                    <div className="p-6.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                      <div>
                        <span className="text-[10px] font-black uppercase text-brand-orange tracking-widest">Resumen de Auditoría Completa</span>
                        <h4 className="text-lg font-black text-[#1E3E3E] mt-0.5">{selectedLead.businessName}</h4>
                      </div>
                      <button 
                        onClick={() => setSelectedLead(null)}
                        className="p-1.5 hover:bg-slate-200 rounded-xl transition-all"
                      >
                        <X className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>

                    {/* Scrollable Modal Content */}
                    <div className="p-8 space-y-6 overflow-y-auto">
                      
                      {/* Lead particulars */}
                      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-150">
                        <div>
                          <span className="block text-[10px] uppercase font-black text-slate-400">Nombre del Contacto</span>
                          <span className="text-sm font-bold text-slate-700">{selectedLead.contactName || 'No indicado'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-black text-slate-400">WhatsApp / Teléfono</span>
                          <span className="text-sm font-bold text-slate-700 font-mono">{selectedLead.phone || 'No indicado'}</span>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-slate-200/50 mt-1">
                          <span className="block text-[10px] uppercase font-black text-slate-400">Comentarios Adicionales</span>
                          <span className="text-xs font-bold text-slate-600 leading-normal block">{selectedLead.comments || 'Sin comentarios registrados por el cliente'}</span>
                        </div>
                      </div>

                      {/* Audit Metrics */}
                      <div className="space-y-3">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Puntajes de Rendimiento Local</span>
                        
                        <div className="grid grid-cols-4 gap-3 text-center">
                          <div className="bg-[#1E3E3E]/5 p-3 rounded-xl">
                            <span className="block text-[9px] text-slate-400 font-bold">SEO Maps</span>
                            <span className="text-md font-extrabold text-[#1E3E3E]">{selectedLead.report?.mapsScore || 70}%</span>
                          </div>
                          <div className="bg-[#1E3E3E]/5 p-3 rounded-xl">
                            <span className="block text-[9px] text-slate-400 font-bold">Semántico</span>
                            <span className="text-md font-extrabold text-[#1E3E3E]">{selectedLead.report?.seoScore || 65}%</span>
                          </div>
                          <div className="bg-[#1E3E3E]/5 p-3 rounded-xl">
                            <span className="block text-[9px] text-slate-400 font-bold">Reseñas</span>
                            <span className="text-md font-extrabold text-[#1E3E3E]">{selectedLead.report?.contentScore || 68}%</span>
                          </div>
                          <div className="bg-[#1E3E3E]/5 p-3 rounded-xl">
                            <span className="block text-[9px] text-slate-400 font-bold">Velocidad</span>
                            <span className="text-md font-extrabold text-[#1E3E3E]">{selectedLead.report?.speedScore || 72}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Generated Recommendations by AI */}
                      <div className="space-y-3">
                        <span className="text-xs font-black uppercase tracking-wider text-[#1E3E3E] block">Recomendaciones del Analista de IA:</span>
                        
                        <div className="space-y-2">
                          {selectedLead.report?.recommendations?.map((item: string, i: number) => (
                            <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 flex items-start gap-2.5 leading-normal">
                              <span className="bg-amber-100 text-[#1E3E3E] text-[10px] font-bold w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0">{i+1}</span>
                              <p>{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0 gap-4 flex-wrap">
                      <button 
                        onClick={() => handleWhatsAppContact(selectedLead)}
                        className="px-5 py-3.5 bg-brand-orange hover:bg-amber-600 rounded-xl text-slate-900 text-xs font-black uppercase tracking-wider flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4 fill-current" />
                        <span>Abrir WhatsApp para contactar</span>
                      </button>
                      
                      <button 
                        onClick={() => setSelectedLead(null)}
                        className="px-5 py-3.5 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-bold"
                      >
                        Cerrar Detalles
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      )}

      {/* FOOTER SECTION */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 border-t border-white/5 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 font-sans">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <TrendingUp className="w-6 h-6 text-brand-orange" />
              <span className="text-md font-extrabold">Impulsa Valladolid</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Expertos en posicionamiento de Google Maps local para restauración, turismo y profesionales en Valladolid & Madrid.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Localizaciones de Operación</h4>
            <div className="space-y-2 text-xs">
              <span className="block hover:underline cursor-pointer" onClick={() => { setDynamicCity('Valladolid'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>📍 Valladolid Capital IP</span>
              <span className="block hover:underline cursor-pointer" onClick={() => { setDynamicCity('Madrid'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>📍 Madrid & Castilla León</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Soporte Express</h4>
            <div className="space-y-2 text-xs">
              <a href="https://wa.me/351929051990" className="block text-brand-orange hover:underline font-bold">📲 +351 929 051 990 (Contacto Directo)</a>
              <span className="block">✉️ contacto@impulsavalladolid.es</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Acceso Interno</h4>
            <button 
              onClick={() => { setView('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="text-xs bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-xl text-slate-300 inline-flex items-center gap-1.5 transition-all"
            >
              <Lock className="w-3.5 h-3.5" /> Ficha de Control Admin
            </button>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <p>© {new Date().getFullYear()} Impulsa Valladolid. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Aviso Legal</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Política de Privacidad</span>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Action Button in bottom right corner */}
      <a 
        href={`https://wa.me/351929051990?text=${encodeURIComponent("Hola Impulsa Valladolid, me gustaría impulsar mi negocio local. ¿Podemos hablar?")}`}
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4.5 rounded-full shadow-2xl hover:scale-110 transition-all group"
        aria-label="Contactar por WhatsApp"
      >
        <MessageSquare className="w-6.5 h-6.5 fill-current" />
      </a>

    </div>
  );
}
