import { useState } from 'react';
import { Star, ShieldAlert, CheckCircle2, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

export default function AntesDespues() {
  const [activeTab, setActiveTab] = useState<'antes' | 'despues'>('despues');

  return (
    <div className="bg-brand-dark-sec rounded-[2.5rem] p-8 md:p-12 border border-brand-gold/15 relative overflow-hidden shadow-2xl">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <span className="text-brand-gold text-xs font-black uppercase tracking-[0.25em] bg-brand-gold/10 px-3.5 py-1.5 rounded-full inline-block">
            Transformación Real
          </span>          <h3 className="text-2xl md:text-4xl font-black text-white font-serif">
            El Impacto: Antes y Después de Impulsa
          </h3>
          <p className="text-stone-400 text-sm max-w-xl mx-auto">
            Vea la diferencia radical que experimenta un negocio tradicional (como una barbería, clínica o tienda local) en Valladolid al transformar su presencia digital en Google Maps de nuestra mano.
          </p>
        </div>

        {/* Tab Switched Selector */}
        <div className="flex justify-center p-1 bg-brand-dark max-w-sm mx-auto rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveTab('antes')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'antes'
                ? 'bg-brand-crimson text-white shadow-lg'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Antes (Invisible)</span>
          </button>
          <button
            onClick={() => setActiveTab('despues')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Card Mockup Side (Col 5) */}
          <div className="lg:col-span-5 flex justify-center">
            {activeTab === 'antes' ? (
              /* BEFORE CARD MOCKUP */
              <div className="bg-stone-900 border border-red-950/40 rounded-3xl p-6 w-full max-w-sm shadow-inner relative opacity-90 transition-all duration-500">
                {/* Red warning overlay badge */}
                <div className="absolute top-4 right-4 bg-red-950/80 text-brand-red border border-brand-red/20 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Invisible #21</span>
                </div>

                <div className="space-y-4">
                  {/* Grayed blurred image */}
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-stone-950 border border-stone-800">
                    <img 
                      src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=50"
                      alt="Local Vacío"
                      className="w-full h-full object-cover grayscale opacity-30 contrast-125 blur-[1px]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] text-stone-500 font-bold uppercase">
                      Sin Fotos Recientes
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-stone-300">Barbería Castilla</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-bold text-stone-500">3.4</span>
                      <div className="flex text-stone-600">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < 3 ? 'fill-stone-600' : ''}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-500 font-medium">(18 reseñas)</span>
                    </div>
                  </div>

                  {/* NAP Inconsistencies */}
                  <div className="space-y-2 text-xs text-stone-500 border-t border-stone-800/60 pt-3">
                    <p className="flex items-start gap-1.5">
                      <span className="text-stone-600">📍</span> 
                      <span>Dirección incompleta o duplicada</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="text-stone-600">🕒</span>
                      <span className="text-red-500 font-semibold">"No indica horario festivo"</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="text-stone-600">📞</span>
                      <span>Teléfono desactualizado</span>
                    </p>
                  </div>

                  {/* SEO placement status */}
                  <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-3 text-center text-xs">
                    <p className="text-stone-400 font-medium">Búsqueda: <strong className="text-stone-300">"barbería Valladolid"</strong></p>
                    <p className="text-brand-crimson font-black uppercase tracking-wider text-[11px] mt-0.5">Oculto en página 3 de Google Maps</p>
                  </div>
                </div>
              </div>
            ) : (
              /* AFTER CARD MOCKUP */
              <div className="bg-brand-dark border-2 border-brand-gold/60 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative transition-all duration-500 shadow-brand-gold/5 scale-105">
                {/* Gold success badge */}
                <div className="absolute top-4 right-4 bg-brand-gold text-brand-dark text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
                  <TrendingUp className="w-3 h-3" />
                  <span>Top #3 Maps</span>
                </div>

                <div className="space-y-4">
                  {/* Gorgeous high-end business image */}
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-brand-dark-sec border border-brand-gold/10">
                    <img 
                      src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80"
                      alt="Barbería Castilla Valladolid"
                      className="w-full h-full object-cover hover:scale-105 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 bg-brand-gold text-brand-dark font-black px-2.5 py-1 rounded text-[10px] uppercase tracking-wider">
                      Fotos de Alta Conversión
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-white font-serif">Barbería Castilla</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-black text-brand-gold">4.9</span>
                      <div className="flex text-brand-gold">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current text-current" />
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-400 font-bold">(142 reseñas verificadas)</span>
                    </div>
                  </div>

                  {/* NAP fully optimized */}
                  <div className="space-y-2 text-xs text-stone-300 border-t border-white/5 pt-3">
                    <p className="flex items-start gap-1.5">
                      <span className="text-brand-gold font-bold">✓</span> 
                      <span>Calle Santiago, 15, Valladolid</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="text-brand-gold font-bold">✓</span>
                      <span className="text-emerald-400 font-semibold">Abierto • Horario 100% verificado</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="text-brand-gold font-bold">✓</span>
                      <span className="font-mono text-stone-300">Teléfono directo & reserva por WhatsApp</span>
                    </p>
                  </div>

                  {/* SEO placement status */}
                  <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-xl p-3 text-center text-xs">
                    <p className="text-stone-300 font-medium">Búsqueda: <strong className="text-white">"barbería Valladolid"</strong></p>
                    <p className="text-brand-gold font-black uppercase tracking-widest text-[11px] mt-0.5">Puesto #1 en el Google Local Pack</p>
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
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-crimson block" />
                  El Estado de la Invisibilidad Digital
                </h4>
                <p className="text-sm leading-relaxed text-stone-300">
                  Sin una ficha de Google Maps optimizada adecuadamente, su negocio se vuelve invisible para el <strong>82% de las búsquedas móviles</strong> en la región.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex gap-3">
                    <span className="text-brand-crimson font-bold text-lg flex-shrink-0">✗</span>
                    <div>
                      <h5 className="text-xs uppercase font-black tracking-wider text-stone-300">Abandono de Clientes Potenciales</h5>
                      <p className="text-xs leading-relaxed mt-0.5 text-stone-400">
                        La gente busca fotos de los trabajos o servicios (como cortes, instalaciones o platos) en alta calidad. Las fotos deficientes o un perfil vacío ahuyentan el interés de inmediato.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-brand-crimson font-bold text-lg flex-shrink-0">✗</span>
                    <div>
                      <h5 className="text-xs uppercase font-black tracking-wider text-stone-300">Sin Citas ni Clientes Nuevos</h5>
                      <p className="text-xs leading-relaxed mt-0.5 text-stone-400">
                        Nadie tiene paciencia para hacer scroll hasta la página 3 de Google Maps. Si no estás entre los 3 primeros de Valladolid, tu competencia directa se queda con el 75% de los clientes diarios.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-brand-crimson font-bold text-lg flex-shrink-0">✗</span>
                    <div>
                      <h5 className="text-xs uppercase font-black tracking-wider text-stone-300">Reseñas Desatendidas</h5>
                      <p className="text-xs leading-relaxed mt-0.5 text-stone-400">
                        La falta de una estrategia activa para responder y conseguir nuevas valoraciones genera desconfianza y penaliza tu posicionamiento en Valladolid.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-stone-300 animate-fade-in">
                <h4 className="text-xl font-bold text-brand-gold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-gold animate-pulse" />
                  La Transformación Completa del Negocio
                </h4>
                <p className="text-sm leading-relaxed text-stone-300">
                  Al posicionarse en el <strong className="text-brand-gold">Top 3 de Google Maps</strong> y contar con fotografía profesional del establecimiento, se capta la atención de los usuarios y se llena la agenda de clientes todas las semanas.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex gap-3">
                    <span className="text-brand-gold font-bold text-lg flex-shrink-0">✓</span>
                    <div>
                      <h5 className="text-xs uppercase font-black tracking-wider text-white">Impacto Visual Profesional</h5>
                      <p className="text-xs leading-relaxed mt-0.5 text-stone-400">
                        Fotografías deslumbrantes que disparan el deseo de reservar o comprar al instante, mostrando la calidad de tus servicios de forma premium.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-brand-gold font-bold text-lg flex-shrink-0">✓</span>
                    <div>
                      <h5 className="text-xs uppercase font-black tracking-wider text-white">Dominio Absoluto en Google Valladolid</h5>
                      <p className="text-xs leading-relaxed mt-0.5 text-stone-400">
                        Estar en el Top 3 le garantiza flujo continuo de llamadas telefónicas, clics a la web, solicitudes de ruta física y reservas directas por WhatsApp.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-brand-gold font-bold text-lg flex-shrink-0">✓</span>
                    <div>
                      <h5 className="text-xs uppercase font-black tracking-wider text-white">Fidelización y Reseñas Positivas</h5>
                      <p className="text-xs leading-relaxed mt-0.5 text-stone-400">
                        Código QR personalizado y tácticas guiadas que incentivan las reseñas de 5 estrellas, disparando su puntuación y reputación local de forma orgánica.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="block text-[10px] font-black uppercase text-brand-gold tracking-widest">Resultado Promedio</span>
                      <span className="block text-sm font-bold text-white">+85% de incremento en llamadas y visitas</span>
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
