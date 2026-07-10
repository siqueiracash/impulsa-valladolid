import { useState } from 'react';
import { Star, ShieldAlert, CheckCircle2, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

const BUSINESS_DATA = {
  restaurante: {
    name: "Gimnasio Castilla",
    typeLabel: "Gimnasio / Academia de Fitness",
    beforeImg: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=40",
    afterImg: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
    beforeRating: 3.5,
    beforeReviews: 14,
    afterRating: 4.9,
    afterReviews: 196,
    searchQuery: "gimnasio Valladolid",
    address: "Calle de Santiago, 12, Valladolid",
    scheduleBefore: "Ficha sin horario de clases",
    scheduleAfter: "Abierto • Horarios de musculación y clases guiadas",
    phoneBefore: "Llamadas perdidas sin responder",
    phoneAfter: "Reserva directa de clase de prueba por WhatsApp",
    badTitle: "El Fracaso en Temporada Alta",
    badDescription: "En Valladolid, la competencia entre gimnasios y academias de fitness es feroz. Cuando un usuario busca un lugar para entrenar, compara fotos de las instalaciones, limpieza de las salas y opiniones reales de Google Maps. Una ficha abandonada ahuyenta a decenas de clientes potenciales al mes.",
    badPoints: [
      {
        title: "Instalaciones Deslucidas o Sin Fotos",
        desc: "No mostrar fotos limpias y profesionales de la sala de musculación, vestuarios o zonas de cardio genera desconfianza y hace que el cliente elija la competencia."
      },
      {
        title: "Invisibilidad Local",
        desc: "No aparecer en el Top 3 de búsquedas clave como 'gimnasio Valladolid' o 'centro fitness' regala todos los nuevos socios directos a las grandes franquicias."
      },
      {
        title: "Quejas de Socios Sin Resolver",
        desc: "Las opiniones negativas desatendidas sobre mantenimiento o masificaciones espantan a los clientes con intenciones serias de matricularse."
      }
    ],
    goodTitle: "El Gimnasio de Referencia",
    goodDescription: "Llevamos a su centro de fitness al Top 3 de Valladolid, mostrando la excelencia de sus instalaciones y optimizando la conversión directa de nuevos socios.",
    goodPoints: [
      {
        title: "Imágenes de Alta Motivación",
        desc: "Fotografías profesionales y con excelente iluminación que transmiten limpieza, orden y energía, despertando las ganas de inscribirse de inmediato."
      },
      {
        title: "Captación Automatizada de Socios",
        desc: "Acceso rápido a un pase de clase de prueba gratuita o contacto instantáneo vía WhatsApp, convirtiendo las búsquedas online en visitas físicas."
      },
      {
        title: "Efecto Comunidad Imbatible",
        desc: "Incentivamos opiniones reales de sus socios más activos, logrando una reputación intachable que atrae de forma continua a nuevos residentes."
      }
    ],
    metricValue: "+78% de nuevos socios mensuales",
    seoSubtext: "Puesto #1 en el Google Local Pack"
  }
};

export default function AntesDespues() {
  const [activeTab, setActiveTab] = useState<'antes' | 'despues'>('despues');

  const data = BUSINESS_DATA.restaurante;

  return (
    <div id="antes-despues-section" className="bg-brand-dark-sec rounded-[2.5rem] p-8 md:p-12 border border-brand-gold/15 relative overflow-hidden shadow-2xl">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <span className="text-brand-gold text-xs font-black uppercase tracking-[0.25em] bg-brand-gold/10 px-3.5 py-1.5 rounded-full inline-block">
            Transformación Real
          </span>
          <h3 className="text-2xl md:text-4xl font-black text-white font-serif">
            El Impacto: Antes y Después de Impulsa
          </h3>
          <p className="text-stone-400 text-sm max-w-xl mx-auto">
            Vea la diferencia radical que experimenta un gimnasio al transformar su presencia digital en Google Maps de nuestra mano.
          </p>
        </div>

        {/* Before / After Selector */}
        <div className="flex justify-center p-1 bg-brand-dark max-w-sm mx-auto rounded-2xl border border-white/5">
          <button
            id="btn-tab-antes"
            onClick={() => setActiveTab('antes')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'antes'
                ? 'bg-brand-crimson text-white shadow-lg font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Antes (Invisible)</span>
          </button>
          <button
            id="btn-tab-despues"
            onClick={() => setActiveTab('despues')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'despues'
                ? 'bg-brand-gold text-brand-dark font-black shadow-lg shadow-brand-gold/10'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Después (Lleno Total)</span>
          </button>
        </div>

        {/* Dynamic Display Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-4">
          
          {/* Card Mockup Side (Col 5) */}
          <div className="lg:col-span-5 flex justify-center">
            {activeTab === 'antes' ? (
              /* BEFORE CARD MOCKUP */
              <div id="before-card-mockup" className="bg-stone-900 border border-red-950/40 rounded-3xl p-6 w-full max-w-sm shadow-inner relative opacity-90 transition-all duration-500">
                {/* Red warning overlay badge */}
                <div className="absolute top-4 right-4 bg-red-950/80 text-brand-red border border-brand-red/20 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Invisible #21</span>
                </div>

                <div className="space-y-4">
                  {/* Grayed blurred image */}
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-stone-950 border border-stone-800">
                    <img 
                      src={data.beforeImg}
                      alt={`${data.name} Antes`}
                      className="w-full h-full object-cover grayscale opacity-30 contrast-125 blur-[1px]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] text-stone-500 font-bold uppercase">
                      Sin Fotos Recientes
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-stone-300">{data.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-bold text-stone-500">{data.beforeRating}</span>
                      <div className="flex text-stone-600">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < Math.floor(data.beforeRating) ? 'fill-stone-600' : ''}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-500 font-medium">({data.beforeReviews} reseñas)</span>
                    </div>
                  </div>

                  {/* NAP Inconsistencies */}
                  <div className="space-y-2 text-xs text-stone-500 border-t border-stone-800/60 pt-3">
                    <p className="flex items-start gap-1.5">
                      <span className="text-stone-600">📍</span> 
                      <span>{data.address}</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="text-stone-600">🕒</span>
                      <span className="text-red-500 font-semibold">{data.scheduleBefore}</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="text-stone-600">📞</span>
                      <span>{data.phoneBefore}</span>
                    </p>
                  </div>

                  {/* SEO placement status */}
                  <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-3 text-center text-xs">
                    <p className="text-stone-400 font-medium">Búsqueda: <strong className="text-stone-300">"{data.searchQuery}"</strong></p>
                    <p className="text-brand-crimson font-black uppercase tracking-wider text-[11px] mt-0.5">Oculto en página 3 de Google Maps</p>
                  </div>
                </div>
              </div>
            ) : (
              /* AFTER CARD MOCKUP */
              <div id="after-card-mockup" className="bg-brand-dark border-2 border-brand-gold/60 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative transition-all duration-500 shadow-brand-gold/5 scale-105">
                {/* Gold success badge */}
                <div className="absolute top-4 right-4 bg-brand-gold text-brand-dark text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
                  <TrendingUp className="w-3 h-3" />
                  <span>Top #3 Maps</span>
                </div>

                <div className="space-y-4">
                  {/* Gorgeous high-end business image */}
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-brand-dark-sec border border-brand-gold/10">
                    <img 
                      src={data.afterImg}
                      alt={`${data.name} Después`}
                      className="w-full h-full object-cover hover:scale-105 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 bg-brand-gold text-brand-dark font-black px-2.5 py-1 rounded text-[10px] uppercase tracking-wider">
                      Fotos de Alta Conversión
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-white font-serif">{data.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-black text-brand-gold">{data.afterRating}</span>
                      <div className="flex text-brand-gold">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current text-current" />
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-400 font-bold">({data.afterReviews} reseñas verificadas)</span>
                    </div>
                  </div>

                  {/* NAP fully optimized */}
                  <div className="space-y-2 text-xs text-stone-300 border-t border-white/5 pt-3">
                    <p className="flex items-start gap-1.5">
                      <span className="text-brand-gold font-bold">✓</span> 
                      <span>{data.address}</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="text-brand-gold font-bold">✓</span>
                      <span className="text-emerald-400 font-semibold">{data.scheduleAfter}</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="text-brand-gold font-bold">✓</span>
                      <span className="font-mono text-stone-300">{data.phoneAfter}</span>
                    </p>
                  </div>

                  {/* SEO placement status */}
                  <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-xl p-3 text-center text-xs">
                    <p className="text-stone-300 font-medium">Búsqueda: <strong className="text-white">"{data.searchQuery}"</strong></p>
                    <p className="text-brand-gold font-black uppercase tracking-widest text-[11px] mt-0.5">{data.seoSubtext}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detailed analysis side (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            {activeTab === 'antes' ? (
              <div className="space-y-6 text-stone-400 animate-fade-in">
                <h4 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-crimson block animate-pulse" />
                  {data.badTitle}
                </h4>
                <p className="text-sm leading-relaxed text-stone-300">
                  {data.badDescription}
                </p>

                <div className="space-y-4 pt-2">
                  {data.badPoints.map((pt, idx) => (
                    <div key={idx} className="flex gap-3">
                      <span className="text-brand-crimson font-bold text-lg flex-shrink-0">✗</span>
                      <div>
                        <h5 className="text-xs uppercase font-black tracking-wider text-stone-300">{pt.title}</h5>
                        <p className="text-xs leading-relaxed mt-0.5 text-stone-400">
                          {pt.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-stone-300 animate-fade-in">
                <h4 className="text-xl font-bold text-brand-gold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-gold animate-pulse" />
                  {data.goodTitle}
                </h4>
                <p className="text-sm leading-relaxed text-stone-300">
                  {data.goodDescription}
                </p>

                <div className="space-y-4 pt-2">
                  {data.goodPoints.map((pt, idx) => (
                    <div key={idx} className="flex gap-3">
                      <span className="text-brand-gold font-bold text-lg flex-shrink-0">✓</span>
                      <div>
                        <h5 className="text-xs uppercase font-black tracking-wider text-white">{pt.title}</h5>
                        <p className="text-xs leading-relaxed mt-0.5 text-stone-400">
                          {pt.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="block text-[10px] font-black uppercase text-brand-gold tracking-widest">Resultado Promedio</span>
                      <span className="block text-sm font-bold text-white">{data.metricValue}</span>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-brand-gold" />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
