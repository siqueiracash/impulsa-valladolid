import { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Phone, 
  CheckCircle, 
  MessageSquare, 
  ArrowRight, 
  Lock, 
  AlertCircle, 
  Star, 
  Check, 
  Menu,
  X,
  Camera,
  Ghost,
  MousePointer,
  Handshake,
  Target,
  Gem,
  Mail,
  Globe,
  ChevronDown,
  Shield
} from 'lucide-react';

// Modular component imports
import AntesDespues from './components/AntesDespues';
import { GoogleMapsMobileMockup, StorefrontLaCasa, InstagramReelsMockup } from './components/SlideMockups';
import AuditForm from './components/AuditForm';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [view, setView] = useState<'landing' | 'admin'>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'err'; text: string } | null>(null);

  // Quick feedback alert helper
  const triggerAlert = (type: 'success' | 'err', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => {
      setAlertMsg(null);
    }, 4000);
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
    <div className="min-h-screen flex flex-col bg-brand-dark text-stone-100 transition-colors selection:bg-brand-gold/30 selection:text-white relative">
      
      {/* Background ambient atmospheric glow */}
      <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-brand-gold/10 via-brand-dark-sec/5 to-transparent pointer-events-none -z-10" />

      {/* Floating Alert Banner */}
      {alertMsg && (
        <div className={`fixed top-6 right-6 z-[120] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl transition-all duration-350 animate-fade-in-up ${
          alertMsg.type === 'success' 
            ? 'bg-emerald-600 text-white border border-emerald-500/20' 
            : 'bg-brand-crimson text-white border border-brand-crimson/20'
        }`}>
          {alertMsg.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0 text-white" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 text-white" />}
          <p className="text-sm font-semibold">{alertMsg.text}</p>
        </div>
      )}

      {/* Premium Header Nav */}
      <header className="sticky top-0 z-50 bg-brand-dark/90 backdrop-blur-md border-b border-brand-gold/10 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Custom SVG Brand Logo & Name */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => { setView('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="flex items-center justify-center p-1.5 bg-brand-dark-sec rounded-2xl border border-brand-gold/20 shadow-lg hover:scale-105 transition-all">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Custom vector Map Pin */}
                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" fill="#CE2D30" stroke="#CE2D30" strokeWidth="1.5" />
                <circle cx="12" cy="10" r="5" fill="#0E0908" />
                {/* Ascending bar chart inside */}
                <rect x="9" y="10" width="1.5" height="3" rx="0.5" fill="#E29B30" />
                <rect x="11.25" y="8.5" width="1.5" height="4.5" rx="0.5" fill="#E29B30" />
                <rect x="13.5" y="7" width="1.5" height="6" rx="0.5" fill="#E29B30" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block">Impulsa</span>
              <span className="text-[10px] uppercase tracking-[0.25em] -mt-1 block text-brand-gold font-bold">Valladolid</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          {view === 'landing' ? (
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToId('ventajas')} className="text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-white transition-all">¿Por Qué Nosotros?</button>
              <button onClick={() => scrollToId('casos-reales')} className="text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-white transition-all">Casos de Éxito</button>
              <button onClick={() => scrollToId('planes-precios')} className="text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-white transition-all">Tarifas</button>
              <button onClick={() => setView('admin')} className="text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-brand-gold flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all">
                <Lock className="w-3.5 h-3.5" /> Admin
              </button>
              <button 
                onClick={() => scrollToId('auditoria')} 
                className="bg-brand-gold text-brand-dark text-xs font-black tracking-wider uppercase px-5 py-3 rounded-xl shadow-lg hover:bg-amber-600 transition-all cursor-pointer"
              >
                Auditoría Gratuita
              </button>
            </nav>
          ) : (
            <nav className="flex items-center gap-4">
              <button 
                onClick={() => setView('landing')} 
                className="text-xs font-bold uppercase tracking-wider text-brand-gold hover:underline"
              >
                Volver a la Web
              </button>
            </nav>
          )}

          {/* Mobile menu trigger */}
          {view === 'landing' && (
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden p-2 rounded-xl text-stone-200 hover:bg-white/5 transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}

        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-brand-dark border-b border-brand-gold/10 py-6 px-6 space-y-4 animate-fade-in-up">
            <button onClick={() => scrollToId('ventajas')} className="block w-full text-left font-bold text-stone-300 hover:text-white py-2">¿Por Qué Nosotros?</button>
            <button onClick={() => scrollToId('casos-reales')} className="block w-full text-left font-bold text-stone-300 hover:text-white py-2">Casos de Éxito</button>
            <button onClick={() => scrollToId('planes-precios')} className="block w-full text-left font-bold text-stone-300 hover:text-white py-2">Tarifas</button>
            <button onClick={() => { setView('admin'); setMobileMenuOpen(false); }} className="block w-full text-left font-bold text-stone-400 hover:text-brand-gold py-2 flex items-center gap-1.5">
              <Lock className="w-4 h-4" /> Panel Administrativo
            </button>
            <button 
              onClick={() => scrollToId('auditoria')} 
              className="w-full bg-brand-gold text-brand-dark text-center text-xs font-extrabold tracking-wider uppercase py-3.5 rounded-xl block cursor-pointer"
            >
              Auditoría Gratuita
            </button>
          </div>
        )}
      </header>

      {/* LANDING VIEW TEMPLATE */}
      {view === 'landing' && (
        <main className="flex-grow">
          
          {/* SLIDE 1: HERO SECTION - "El Secreto de la Cola" */}
          <section className="relative min-h-[85vh] flex items-center justify-center py-20 px-6 text-center overflow-hidden border-b border-brand-gold/10">
            {/* Background Tavern Image with beautiful dark overlay */}
            <div className="absolute inset-0 bg-cover bg-center pointer-events-none -z-25" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80')" }}>
              <div className="absolute inset-0 bg-brand-dark/95 via-brand-dark/80 to-brand-dark" />
            </div>

            <div className="max-w-4xl space-y-10 relative z-20 animate-fade-in">
              <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-black uppercase tracking-widest border border-brand-gold/25">
                <Sparkles className="w-4 h-4 text-brand-gold animate-pulse" />
                <span>Impulsa Tu Negocio Local</span>
              </div>

              {/* Serif elegant title from slide 1 */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-[#F8F4EC] leading-[1.15] tracking-tight max-w-3xl mx-auto">
                ¿Sabes por qué algunos locales en Valladolid <br />
                <span className="text-brand-gold italic block mt-2">siempre tienen cola?</span>
              </h1>

              {/* Subheading in clean tracking-widest sans */}
              <p className="text-stone-400 text-xs sm:text-sm font-black tracking-[0.22em] uppercase max-w-2xl mx-auto leading-normal">
                NO ES SOLO LA COMIDA. ES EL SECRETO QUE TUS CLIENTES YA CONOCEN.
              </p>

              {/* Action down controls */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4.5 pt-4">
                <button 
                  onClick={() => scrollToId('auditoria')}
                  className="w-full sm:w-auto px-9 py-4 bg-brand-gold hover:bg-amber-600 text-brand-dark font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-0.5 text-xs uppercase tracking-wider cursor-pointer"
                >
                  <span>Auditar Mi Ficha Gratis</span>
                  <ArrowRight className="w-4 h-4 text-brand-dark" />
                </button>
                <button 
                  onClick={() => scrollToId('ventajas')}
                  className="w-full sm:w-auto px-9 py-4 bg-white/5 hover:bg-white/10 text-stone-200 hover:text-white rounded-2xl border border-white/10 font-bold transition-all text-xs uppercase tracking-wider"
                >
                  Descúbrelo <ChevronDown className="w-4 h-4 inline ml-1 animate-bounce" />
                </button>
              </div>

              {/* Quick stats ribbon */}
              <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/5 max-w-lg mx-auto">
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-white">+350%</span>
                  <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest">Llamadas directas</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-white">Top 3</span>
                  <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest">Garantizado</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-white">60 Días</span>
                  <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest">Ejecución</span>
                </div>
              </div>
            </div>
          </section>

          {/* SLIDE 2: THE 82% SECTION - "Escaparate Digital" */}
          <section id="ventajas" className="py-24 px-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Text side */}
              <div className="lg:col-span-7 space-y-8">
                {/* Big stat badge */}
                <div className="text-8xl md:text-9xl font-black text-brand-gold font-serif leading-none tracking-tight">
                  82%
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white font-medium leading-tight">
                  Ya te han visitado... <br />
                  <span className="text-brand-crimson italic">sin que lo sigan sabiendo.</span>
                </h2>

                <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-2xl font-sans font-medium">
                  Antes de cruzar tu puerta física, tus clientes ya han explorado tu <strong className="text-brand-gold">escaparate digital</strong>. La primera impresión decide la compra antes de su visita.
                </p>

                <div className="pt-4">
                  <button 
                    onClick={() => scrollToId('auditoria')}
                    className="px-8 py-3.5 bg-brand-gold/10 hover:bg-brand-gold/15 text-brand-gold rounded-xl border border-brand-gold/25 font-bold transition-all text-xs uppercase tracking-widest"
                  >
                    Diferenciarse en Google Maps
                  </button>
                </div>
              </div>

              {/* iPhone Maps Mockup side */}
              <div className="lg:col-span-5 flex justify-center">
                <GoogleMapsMobileMockup />
              </div>

            </div>
          </section>

          {/* SLIDE 3: TU NEGOCIO ENTRA POR LOS OJOS */}
          <section className="py-24 bg-brand-dark-sec border-y border-brand-gold/10 relative overflow-hidden">
            {/* Background Barber Board blurred */}
            <div className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-[0.07]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80')" }} />

            <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
              
              <div className="max-w-3xl mx-auto text-center space-y-4">
                <span className="text-brand-crimson text-xs font-black uppercase tracking-[0.25em] block">Presencia Crítica</span>
                <h2 className="text-3xl md:text-5xl font-serif font-medium text-white leading-tight">
                  Tu negocio entra por los ojos, <br />
                  pero la decisión se toma en la <span className="text-brand-gold italic">pantalla.</span>
                </h2>
                <div className="w-16 h-1 bg-brand-crimson mx-auto rounded-full mt-4" />
              </div>

              {/* Three Columns of slide 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Point 1 */}
                <div className="bg-brand-dark p-8 rounded-3xl border border-white/5 space-y-4 hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-brand-crimson/10 flex items-center justify-center text-brand-crimson">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Impacto Visual</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">
                    Una foto de baja calidad aleja al cliente de tu negocio al instante. Ya sea para saborear un plato, comprar un producto o agendar un servicio, el cliente digital decide visualmente.
                  </p>
                </div>

                {/* Point 2 */}
                <div className="bg-brand-dark p-8 rounded-3xl border border-white/5 space-y-4 hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-brand-crimson/10 flex items-center justify-center text-brand-crimson">
                    <Ghost className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Invisibilidad</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">
                    Un perfil vacío en Google es un negocio cerrado a ojos del cliente digital. Si no te encuentran rápido, sencillamente no existes.
                  </p>
                </div>

                {/* Point 3 */}
                <div className="bg-brand-dark p-8 rounded-3xl border border-white/5 space-y-4 hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-brand-crimson/10 flex items-center justify-center text-brand-crimson">
                    <MousePointer className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Un solo clic</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">
                    Tu competencia local está a un solo toque de distancia en Valladolid. ¿Por qué deberían elegirte a ti si no destacas en las valoraciones?
                  </p>
                </div>

              </div>

            </div>
          </section>

          {/* INTERACTIVE COMPARISON SLIDE: BEFORE & AFTER (O que o usuário pediu para restaurar) */}
          <section className="py-24 px-6 max-w-7xl mx-auto">
            <AntesDespues />
          </section>

          {/* SLIDE 4: IMPULSAMOS LO QUE YA HACES BIEN */}
          <section className="py-24 bg-brand-dark-sec border-t border-brand-gold/10 relative overflow-hidden">
            {/* Cathedral background image blurred */}
            <div className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-[0.04]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1600&q=80')" }} />

            <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
              
              <div className="max-w-3xl mx-auto text-center space-y-4">
                <span className="text-brand-gold text-xs font-black uppercase tracking-[0.25em] block">Nuestra Filosofía</span>
                <h2 className="text-3xl md:text-5xl font-serif text-white leading-tight">
                  Impulsamos lo que <br />
                  <span className="text-brand-gold italic">ya haces bien.</span>
                </h2>
                <p className="text-stone-400 text-sm max-w-xl mx-auto">
                  No inventamos historias. Capturamos la esencia de tu servicio o comercio y la ponemos donde todos la vean en Google Valladolid.
                </p>
                <div className="w-16 h-1 bg-brand-gold mx-auto rounded-full mt-4" />
              </div>

              {/* Three gold icon columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Card 1 */}
                <div className="bg-brand-dark p-8 rounded-3xl border border-brand-gold/10 space-y-4 hover:border-brand-gold/25 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                    <Handshake className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Tu Socio Local</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">
                    No somos una agencia externa y fría. Somos tus vecinos reales aquí en Valladolid, enfocados en levantar los negocios de nuestra comarca.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="bg-brand-dark p-8 rounded-3xl border border-brand-gold/10 space-y-4 hover:border-brand-gold/25 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Foco en Clientes Reales</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">
                    No buscamos "likes" vacíos o métricas de vanidad. Buscamos llamadas reales, citas confirmadas, clientes físicos y visitas en tu establecimiento.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="bg-brand-dark p-8 rounded-3xl border border-brand-gold/10 space-y-4 hover:border-brand-gold/25 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                    <Gem className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Calidad Real</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">
                    Amplificamos tu esfuerzo y sudor diario en tu negocio para que el mundo digital lo descubra y agende con anticipación.
                  </p>
                </div>

              </div>

            </div>
          </section>

          {/* SLIDE 5: TU ESCAPARATE EN EL TOP 3 */}
          <section className="py-24 px-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Storefront graphic */}
              <div className="lg:col-span-5 flex justify-center">
                <StorefrontLaCasa />
              </div>

              {/* Right column list elements */}
              <div className="lg:col-span-7 space-y-8">
                <span className="text-brand-gold text-xs font-black uppercase tracking-[0.25em] block">Algoritmo de Google</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white font-medium leading-tight">
                  Tu escaparate en el <br />
                  <span className="text-brand-gold italic">Top 3 de Valladolid.</span>
                </h2>

                <div className="space-y-6 pt-4">
                  
                  <div className="flex gap-4">
                    <span className="text-2xl font-black text-brand-gold">01</span>
                    <div>
                      <h4 className="text-base font-bold text-white uppercase tracking-wider">Perfil Pro</h4>
                      <p className="text-sm text-stone-450 mt-1 leading-relaxed">
                        Optimización real y técnica de tu perfil de Google Business para dominar de forma total las búsquedas locales del mapa.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <span className="text-2xl font-black text-brand-gold">02</span>
                    <div>
                      <h4 className="text-base font-bold text-white uppercase tracking-wider">Confianza</h4>
                      <p className="text-sm text-stone-450 mt-1 leading-relaxed">
                        Gestión estratégica de reseñas e interacciones directas que generan confianza inmediata e impulsan visitas de nuevos turistas.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <span className="text-2xl font-black text-brand-gold">03</span>
                    <div>
                      <h4 className="text-base font-bold text-white uppercase tracking-wider">Impacto Visual Profesional</h4>
                      <p className="text-sm text-stone-450 mt-1 leading-relaxed">
                        Fotos profesionales con ángulo cinematográfico que resaltan lo mejor de tu negocio e impiden que pasen de largo.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </section>

          {/* SLIDE 6: CONTENIDO QUE DETIENE EL SCROLL */}
          <section className="py-24 bg-brand-dark-sec border-t border-brand-gold/10">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Left description */}
              <div className="lg:col-span-7 space-y-8">
                <span className="text-brand-crimson text-xs font-black uppercase tracking-[0.25em] block">Seducción en Redes</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white leading-tight">
                  Contenido que detiene el scroll <br />
                  <span className="text-brand-gold italic">y llena la agenda de clientes.</span>
                </h2>

                <div className="space-y-6 pt-2">
                  <div className="flex gap-4">
                    <span className="w-1.5 h-10 bg-brand-crimson rounded-full block flex-shrink-0" />
                    <div>
                      <h4 className="text-md font-bold text-white">Reels Virales de Alto Impacto</h4>
                      <p className="text-xs text-stone-400 leading-relaxed mt-1">
                        Vídeos cortos que muestran la magia del detrás de escena de tu trabajo e invitan a los clientes locales a visitarte en Valladolid.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <span className="w-1.5 h-10 bg-brand-gold rounded-full block flex-shrink-0" />
                    <div>
                      <h4 className="text-md font-bold text-white">Deseo Visual en Pantalla</h4>
                      <p className="text-xs text-stone-400 leading-relaxed mt-1">
                        Fotografía profesional de alto impacto diseñada para resaltar tus mejores cortes, productos o servicios de forma inmediata.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <span className="w-1.5 h-10 bg-brand-crimson rounded-full block flex-shrink-0" />
                    <div>
                      <h4 className="text-md font-bold text-white">Invitación Directa (Llamadas a la Acción)</h4>
                      <p className="text-xs text-stone-400 leading-relaxed mt-1">
                        No son simples publicaciones estéticas en el feed. Son llamadas a la acción estratégicas y optimizadas para llamar o agendar una cita o reserva real.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instagram Reel Mockup */}
              <div className="lg:col-span-5 flex justify-center">
                <InstagramReelsMockup />
              </div>

            </div>
          </section>

          {/* SLIDE 7: DE LA INVISIBILIDAD AL LLENO TOTAL */}
          <section id="casos-reales" className="py-24 px-6 max-w-7xl mx-auto text-center space-y-16">
            
            <div className="space-y-4">
              <span className="text-brand-crimson text-xs font-black tracking-[0.3em] uppercase block">Resultados Históricos</span>
              <h2 className="text-3xl md:text-5xl font-serif text-white">
                DE LA INVISIBILIDAD AL <span className="text-brand-crimson italic">LLENO TOTAL</span>
              </h2>
            </div>

            {/* Glowing huge number */}
            <div className="max-w-xl mx-auto py-10 bg-brand-gold/5 rounded-[3rem] border border-brand-gold/15 shadow-xl shadow-brand-gold/2 relative">
              <span className="block text-8xl md:text-9xl font-serif font-black text-brand-gold animate-pulse">45</span>
              <span className="block text-sm font-black uppercase tracking-[0.25em] text-brand-crimson mt-2">Clientes y Citas Diarias</span>
            </div>

            {/* Sub metric tags */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="p-6 bg-brand-dark-sec rounded-2xl border border-white/5">
                <span className="block text-3xl font-black text-white">+350%</span>
                <span className="block text-xs font-semibold text-stone-400 mt-1 uppercase tracking-wider">Llamadas directas</span>
              </div>
              <div className="p-6 bg-brand-dark-sec rounded-2xl border border-white/5">
                <span className="block text-3xl font-black text-brand-gold">TOP 3</span>
                <span className="block text-xs font-semibold text-stone-400 mt-1 uppercase tracking-wider">En Google Maps Valladolid</span>
              </div>
              <div className="p-6 bg-brand-dark-sec rounded-2xl border border-white/5">
                <span className="block text-3xl font-black text-white">60 DÍAS</span>
                <span className="block text-xs font-semibold text-stone-400 mt-1 uppercase tracking-wider">Tiempo de ejecución promedio</span>
              </div>
            </div>

            {/* Vallisoletanos success stories */}
            <div className="pt-10">
              <h3 className="text-xl font-bold font-serif text-white mb-10">Vallisoletanos que ya encabezan el mapa</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                
                {/* Story 1 */}
                <div className="bg-brand-dark-sec p-8 rounded-3xl border border-white/5 flex flex-col justify-between gap-6 hover:shadow-xl transition-all">
                  <div className="space-y-4">
                    <div className="flex text-brand-gold">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current text-brand-gold" />)}
                    </div>
                    <h4 className="text-lg font-bold text-white font-serif">Taverna Platerías</h4>
                    <p className="text-stone-400 text-sm leading-relaxed">
                      "Increíble ver los resultados antes del primer mes. Nuestra taberna tradicional pasó al Puesto #1 en la búsqueda 'tapas centro' de Valladolid, logrando hasta 3 mesas ocupadas extras al día."
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-500">Restauración • Plaza Mayor</span>
                    <span className="font-black text-emerald-400 uppercase">+150% Reservas</span>
                  </div>
                </div>

                {/* Story 2 */}
                <div className="bg-brand-dark-sec p-8 rounded-3xl border border-white/5 flex flex-col justify-between gap-6 hover:shadow-xl transition-all">
                  <div className="space-y-4">
                    <div className="flex text-brand-gold">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current text-brand-gold" />)}
                    </div>
                    <h4 className="text-lg font-bold text-white font-serif">Fisioterapia Recoletas</h4>
                    <p className="text-stone-400 text-sm leading-relaxed">
                      "Tener una web no nos servía si la gente de la zona buscaba 'fisioterapeuta urgente' y no nos encontraba en el móvil. Con el optimizador de Google Maps de Impulsa hemos duplicado llamadas."
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-500">Salud • Paseo Zorrilla</span>
                    <span className="font-black text-emerald-400 uppercase">+88% Contactos</span>
                  </div>
                </div>

                {/* Story 3 */}
                <div className="bg-brand-dark-sec p-8 rounded-3xl border border-white/5 flex flex-col justify-between gap-6 hover:shadow-xl transition-all">
                  <div className="space-y-4">
                    <div className="flex text-brand-gold">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current text-brand-gold" />)}
                    </div>
                    <h4 className="text-lg font-bold text-white font-serif">Peluquería Delicias</h4>
                    <p className="text-stone-400 text-sm leading-relaxed">
                      "Nuestros clientes fieles nos querían mucho pero no atraíamos clientes nuevos de otras zonas de Valladolid. Ocupando las primeras posiciones de los mapas, nuestra agenda está al completo."
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-500">Estética • Barrio Delicias</span>
                    <span className="font-black text-emerald-400 uppercase">+120% Agenda</span>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* SLIDE 8: DOS CAMINOS PARA DOMINAR VALLADOLID (PRICING) */}
          <section id="planes-precios" className="py-24 px-6 bg-brand-dark-sec border-y border-brand-gold/10">
            <div className="max-w-7xl mx-auto space-y-16">
              <div className="text-center space-y-3 max-w-xl mx-auto">
                <span className="text-brand-gold text-xs font-black uppercase tracking-widest block">Transparencia Total</span>
                <h2 className="text-3xl md:text-5xl font-serif text-white">
                  Dos caminos para <span className="text-brand-gold italic">dominar Valladolid.</span>
                </h2>
                <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
                  Planes de optimización adaptados a la madurez digital y el sector de su local tradicional.
                </p>
              </div>

              {/* Plans pricing layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                
                {/* Card 1: Plan Básico */}
                <div className="bg-brand-dark rounded-3xl p-8 border border-white/5 flex flex-col justify-between gap-8 hover:border-brand-gold/20 transition-all">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">Visibilidad & Confianza</h4>
                      <h3 className="text-2xl font-bold text-white font-serif mt-1">Plan Básico</h3>
                      <div className="mt-4 flex items-baseline gap-1.5">
                        <span className="text-4xl font-black text-brand-gold font-serif">89€</span>
                        <span className="text-xs text-stone-500">/ MES</span>
                      </div>
                    </div>

                    <ul className="space-y-3.5 text-xs font-semibold text-stone-300">
                      <li className="flex items-center gap-2.5"><Check className="text-brand-gold w-4 h-4 flex-shrink-0" /> Google Business Profile Pro</li>
                      <li className="flex items-center gap-2.5"><Check className="text-brand-gold w-4 h-4 flex-shrink-0" /> Gestión de Reseñas Estratégica</li>
                      <li className="flex items-center gap-2.5"><Check className="text-brand-gold w-4 h-4 flex-shrink-0" /> 8 Publicaciones Mensuales de Fidelización</li>
                      <li className="flex items-center gap-2.5"><Check className="text-brand-gold w-4 h-4 flex-shrink-0" /> Informe de Visibilidad Local de tu sector</li>
                    </ul>
                  </div>

                  <button onClick={() => scrollToId('auditoria')} className="w-full py-4.5 bg-brand-gold hover:bg-amber-600 text-brand-dark rounded-xl text-xs font-black tracking-wider uppercase transition-all cursor-pointer">
                    Empezar Ahora
                  </button>
                </div>

                {/* Card 2: Plan Premium */}
                <div className="bg-brand-dark rounded-3xl p-8 border-2 border-brand-gold flex flex-col justify-between gap-8 shadow-2xl relative scale-105 shadow-brand-gold/2">
                  <div className="absolute top-0 right-10 -translate-y-1/2 bg-brand-gold text-brand-dark text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md">
                    Más Popular • Dominio Completo
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold">Dominio & Crecimiento</h4>
                      <h3 className="text-2xl font-bold text-white font-serif mt-1">Plan Premium</h3>
                      <div className="mt-4 flex items-baseline gap-1.5">
                        <span className="text-4xl font-black text-brand-gold font-serif">147€</span>
                        <span className="text-xs text-stone-400">/ MES</span>
                      </div>
                    </div>

                    <ul className="space-y-3.5 text-xs font-semibold text-stone-200">
                      <li className="flex items-center gap-2.5"><Check className="text-brand-gold w-4 h-4 flex-shrink-0" /> Todo lo incluido en el Plan Básico</li>
                      <li className="flex items-center gap-2.5"><Check className="text-brand-gold w-4 h-4 flex-shrink-0" /> SEO Local Avanzado (Top 3 Garantizado)</li>
                      <li className="flex items-center gap-2.5"><Check className="text-brand-gold w-4 h-4 flex-shrink-0" /> 16 Publicaciones + Creación de Reels Virales</li>
                      <li className="flex items-center gap-2.5"><Check className="text-brand-gold w-4 h-4 flex-shrink-0" /> Sistema de Captación Activa de clientes</li>
                    </ul>
                  </div>

                  <button onClick={() => scrollToId('auditoria')} className="w-full py-4.5 bg-brand-gold hover:bg-amber-600 text-brand-dark rounded-xl text-xs font-black tracking-wider uppercase transition-all cursor-pointer">
                    Reclamar Mi Impulso
                  </button>
                </div>

              </div>
            </div>
          </section>

          {/* SLIDE 9: SIN PERMANENCIA. SOLO RESULTADOS */}
          <section className="py-24 px-6 max-w-7xl mx-auto text-center space-y-16">
            
            <div className="max-w-2xl mx-auto space-y-4">
              <span className="text-brand-gold text-xs font-black uppercase tracking-widest block">Nuestra Garantía</span>
              <h2 className="text-3xl md:text-5xl font-serif text-white">
                Sin permanencia. <span className="text-brand-crimson italic">Solo resultados.</span>
              </h2>
              <p className="text-stone-400 text-sm max-w-xl mx-auto leading-relaxed">
                Nuestra mejor garantía es que tus mesas estén llenas cada fin de semana. No te atamos con contratos abusivos de larga duración, te convencemos con hechos.
              </p>
            </div>

            {/* Grid of Slide 9 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-brand-dark-sec p-8 rounded-3xl border border-white/5 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold mx-auto">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Sin Letra Pequeña</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Transparencia absoluta. Sin costes ocultos a final de mes ni sorpresas desagradables e inesperadas.
                </p>
              </div>

              <div className="bg-brand-dark-sec p-8 rounded-3xl border border-white/5 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold mx-auto">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Foco en Retorno</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Cada euro que invierte genera nuevos clientes reales para comer o cenar en su establecimiento local.
                </p>
              </div>

              <div className="bg-brand-dark-sec p-8 rounded-3xl border border-white/5 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Libertad Total</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Usted decide el camino. Nos ganamos su confianza mes a mes, ofreciendo el mejor servicio local sin ataduras.
                </p>
              </div>

            </div>
          </section>

          {/* SLIDE 10 / AUDIT FORM CARD */}
          <AuditForm triggerAlert={triggerAlert} />

          {/* SLIDE 10: CONTACT DETAILS OPTIONS - "¿Hacemos que te descubran?" */}
          <section className="py-24 bg-brand-dark-sec border-t border-brand-gold/10 text-center">
            <div className="max-w-4xl mx-auto px-6 space-y-12">
              
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-serif text-white font-medium">
                  ¿Hacemos que <span className="text-brand-gold italic">te descubran?</span>
                </h2>
                <p className="text-brand-crimson text-xs sm:text-sm font-black tracking-widest uppercase">
                  AUDITORÍA DE VISIBILIDAD GRATUITA PARA LOCALES SELECCIONADOS.
                </p>
              </div>

              {/* Grid of contact links from slide 10 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
                
                {/* Whatsapp */}
                <a 
                  href="https://wa.me/34325678398" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-brand-dark p-8 rounded-3xl border border-white/5 hover:border-brand-gold/20 transition-all block group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-all">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black uppercase text-stone-400 tracking-wider">WhatsApp</h4>
                  <p className="text-md font-bold text-white mt-1.5">+34 325 678 398</p>
                </a>

                {/* Email */}
                <a 
                  href="mailto:hola@impulsavalladolid.com" 
                  className="bg-brand-dark p-8 rounded-3xl border border-white/5 hover:border-brand-gold/20 transition-all block group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-crimson/10 text-brand-crimson flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-all">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black uppercase text-stone-400 tracking-wider">Email</h4>
                  <p className="text-md font-bold text-white mt-1.5 truncate">hola@impulsavalladolid.com</p>
                </a>

                {/* Web */}
                <div className="bg-brand-dark p-8 rounded-3xl border border-white/5 hover:border-brand-gold/20 transition-all block group">
                  <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 text-brand-gold flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-all">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black uppercase text-stone-400 tracking-wider">Web</h4>
                  <p className="text-md font-bold text-white mt-1.5">impulsavalladolid.com</p>
                </div>

              </div>

              <div className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-black pt-10">
                IMPULSA VALLADOLID
              </div>

            </div>
          </section>

        </main>
      )}

      {/* ADMIN DATA MANAGEMENT VIEW */}
      {view === 'admin' && (
        <AdminPanel setView={setView} triggerAlert={triggerAlert} />
      )}

      {/* FOOTER SECTION */}
      <footer className="bg-brand-dark border-t border-white/5 py-16 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-stone-400">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" fill="#CE2D30" stroke="#CE2D30" strokeWidth="1.5" />
                <circle cx="12" cy="10" r="5" fill="#0E0908" />
              </svg>
              <span className="text-md font-extrabold text-white">Impulsa Valladolid</span>
            </div>
            <p className="text-xs leading-relaxed text-stone-550">
              Socios de posicionamiento de Google Maps local para restauración, turismo, ocio y profesionales locales en Valladolid & Madrid Capital.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Localizaciones de Operación</h4>
            <div className="space-y-2 text-xs">
              <span className="block hover:underline cursor-pointer">📍 Valladolid Capital</span>
              <span className="block hover:underline cursor-pointer">📍 Madrid & Castilla León</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Contacto Directo</h4>
            <div className="space-y-2 text-xs">
              <a href="https://wa.me/34325678398" className="block text-brand-gold hover:underline font-bold">📲 +34 325 678 398</a>
              <span className="block">✉️ hola@impulsavalladolid.com</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Acceso Interno</h4>
            <button 
              onClick={() => { setView('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="text-xs bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2.5 rounded-xl text-stone-300 inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" /> Ficha de Control Admin
            </button>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600">
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
        href={`https://wa.me/34325678398?text=${encodeURIComponent("Hola Impulsa Valladolid, me gustaría impulsar mi negocio local. ¿Podemos hablar?")}`}
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
