import { useState } from 'react';
import { Star, ShieldAlert, CheckCircle2, TrendingUp, AlertCircle, Sparkles, Utensils, Scissors, Flower2, ShoppingBag } from 'lucide-react';

const BUSINESS_DATA = {
  restaurante: {
    name: "Restaurante La Parrilla",
    typeLabel: "Restaurante",
    beforeImg: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=50",
    afterImg: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    beforeRating: 3.6,
    beforeReviews: 24,
    afterRating: 4.8,
    afterReviews: 248,
    searchQuery: "restaurante Valladolid",
    address: "Calle de Santiago, 14, Valladolid",
    scheduleBefore: "No indica horario festivo",
    scheduleAfter: "Abierto • Horario de cocina verificado",
    phoneBefore: "Sin enlace de reservas",
    phoneAfter: "Reserva de mesa por WhatsApp y web",
    badTitle: "El Estado de la Invisibilidad Digital",
    badDescription: "Sin una ficha de Google Maps optimizada adecuadamente, su restaurante se vuelve invisible para el 82% de las búsquedas móviles de comida en Valladolid.",
    badPoints: [
      {
        title: "Abandono de Clientes Potenciales",
        desc: "La gente busca fotos de los platos y el menú. Las fotos oscuras o de baja calidad ahuyentan el apetito de inmediato."
      },
      {
        title: "Sin Reservas ni Tracción",
        desc: "Nadie tiene paciencia para hacer scroll hasta la página 3 de Google Maps. Tu competencia directa se queda con el 75% de las reservas."
      },
      {
        title: "Reseñas Negativas Desatendidas",
        desc: "La falta de una estrategia de respuestas y nuevas opiniones genera desconfianza y reduce las visitas los fines de semana."
      }
    ],
    goodTitle: "La Transformación de la Mesa",
    goodDescription: "Al posicionarse en el Top 3 de Google Maps y contar con fotografía gastronómica profesional, se detiene el scroll de los clientes y se llenan las mesas.",
    goodPoints: [
      {
        title: "Impacto Gastronómico Visual",
        desc: "Fotografías deliciosas que disparan el deseo de comer al instante, haciendo que el cliente decida antes de cruzar la puerta."
      },
      {
        title: "Dominio Absoluto en Google",
        desc: "Estar en el Top 3 le garantiza un flujo masivo de llamadas y clics hacia su enlace de reservas de WhatsApp."
      },
      {
        title: "Fidelización y Reseñas Positivas",
        desc: "Códigos QR en mesa que incentivan a los clientes satisfechos a dejar opiniones de 5 estrellas de forma sencilla."
      }
    ],
    metricValue: "+45 reservas adicionales semanales",
    seoSubtext: "Puesto #1 en el Google Local Pack"
  },
  barberia: {
    name: "Barbería Castilla",
    typeLabel: "Barbería / Peluquería",
    beforeImg: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=50",
    afterImg: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80",
    beforeRating: 3.4,
    beforeReviews: 18,
    afterRating: 4.9,
    afterReviews: 142,
    searchQuery: "barbería Valladolid",
    address: "Calle de Santiago, 15, Valladolid",
    scheduleBefore: "Horario festivo desactualizado",
    scheduleAfter: "Abierto • Horario de citas verificado",
    phoneBefore: "Llamadas perdidas sin respuesta",
    phoneAfter: "Botón directo de citas por WhatsApp",
    badTitle: "Pérdida de Clientes frente a Competidores",
    badDescription: "En el sector de barberías en Valladolid, los clientes deciden 100% por el estilo visual de los cortes de cabello y barba y las opiniones locales.",
    badPoints: [
      {
        title: "Falta de Atractivo Visual",
        desc: "Un perfil sin fotos de trabajos recientes (degradados, arreglos de barba) genera desconfianza y hace que busquen otra opción."
      },
      {
        title: "Agenda Vacía en Horas Valle",
        desc: "Estar oculto en Google Maps obliga a depender únicamente del paso de peatones, perdiendo toda la captación digital."
      },
      {
        title: "Reseñas Antiguas y Escasas",
        desc: "Pocas opiniones dan la sensación de que el local está inactivo, descuidado o de que sus barberos no están de moda."
      }
    ],
    goodTitle: "Agenda Llena y Flujo Continuo",
    goodDescription: "La optimización local de la ficha sitúa a la barbería en el Top 3 de Valladolid, llenando la agenda con antelación y captando nuevos clientes.",
    goodPoints: [
      {
        title: "Impacto Estético Superior",
        desc: "Galería de imágenes con transformaciones y cortes impecables que demuestran maestría y nivel premium."
      },
      {
        title: "Llamadas a la Acción Directas",
        desc: "Botón de reserva en un clic que dirige al usuario a WhatsApp o al calendario, facilitando agendar al instante."
      },
      {
        title: "Reputación que Atrae",
        desc: "Las opiniones constantes y excelentes convencen a nuevos residentes o estudiantes de Valladolid de elegir tu barbería."
      }
    ],
    metricValue: "+85% de incremento en llamadas y visitas",
    seoSubtext: "Puesto #1 en el Google Local Pack"
  },
  estetica: {
    name: "Clínica de Estética Valladolid",
    typeLabel: "Clínica de Estética / Belleza",
    beforeImg: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=50",
    afterImg: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80",
    beforeRating: 3.8,
    beforeReviews: 11,
    afterRating: 4.9,
    afterReviews: 96,
    searchQuery: "clínica estética Valladolid",
    address: "Plaza Mayor, 8, Valladolid",
    scheduleBefore: "Ficha sin tratamientos detallados",
    scheduleAfter: "Tratamientos estéticos con precios y reserva",
    phoneBefore: "Teléfono sin respuesta directa",
    phoneAfter: "Contacto instantáneo para diagnóstico gratuito",
    badTitle: "Desconfianza y Fuga de Pacientes",
    badDescription: "En el área de medicina estética, la reputación, limpieza e higiene visual lo son todo. Un perfil abandonado o mal calificado destruye las citas.",
    badPoints: [
      {
        title: "Invisibilidad del Catálogo",
        desc: "Si los pacientes no pueden ver fotos de las salas, aparatología o resultados antes/después, elegirán otra clínica con mayor transparencia."
      },
      {
        title: "Regalo de Clientes a Grandes Cadenas",
        desc: "Estar fuera del Top 3 hace que todos los pacientes locales terminen reservando en las franquicias que dominan la publicidad local."
      },
      {
        title: "Incertidumbre sobre los Tratamientos",
        desc: "Falta de información clara sobre depilación, rejuvenecimiento o rellenos faciales que provoca que la gente descarte contactar."
      }
    ],
    goodTitle: "Confianza y Autoridad Médica",
    goodDescription: "Posicionamos tu clínica como el referente de estética en Valladolid. Mostramos higiene, profesionalismo e infundimos seguridad absoluta.",
    goodPoints: [
      {
        title: "Imágenes de Alta Confianza",
        desc: "Fotos impecables de las salas de tratamiento, aparatología moderna y equipo médico especializado."
      },
      {
        title: "Captación de Pacientes Cualificados",
        desc: "Fácil acceso para solicitar una consulta de valoración gratuita, convirtiendo búsquedas en citas de alto valor."
      },
      {
        title: "Efecto Recomendación",
        desc: "Opiniones de pacientes felices que relatan su experiencia con tratamientos exitosos, validando la clínica."
      }
    ],
    metricValue: "+60 citas de tratamientos al mes",
    seoSubtext: "Puesto #2 en el Google Local Pack"
  },
  comercio: {
    name: "Productos Típicos La Casa",
    typeLabel: "Comercio Local / Alimentación",
    beforeImg: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=600&q=50",
    afterImg: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=600&q=80",
    beforeRating: 3.7,
    beforeReviews: 32,
    afterRating: 4.8,
    afterReviews: 184,
    searchQuery: "productos típicos Valladolid",
    address: "Calle de la Platería, 4, Valladolid",
    scheduleBefore: "Horario de apertura inconsistente",
    scheduleAfter: "Horario 100% real y catálogo web activo",
    phoneBefore: "Sin catálogo de productos",
    phoneAfter: "Enlace directo a tienda online y WhatsApp",
    badTitle: "Clientes y Turistas Pasando de Largo",
    badDescription: "Las tiendas locales pierden miles de euros al mes porque los turistas o vallisoletanos buscan tiendas especializadas en el móvil pero no las encuentran.",
    badPoints: [
      {
        title: "Sin Fotos de Producto",
        desc: "Sin imágenes atractivas de la tienda o artículos característicos (vinos, embutidos, artesanía), la gente prefiere ir a un supermercado."
      },
      {
        title: "Invisibilidad para los Visitantes",
        desc: "Los turistas buscan dónde comprar recuerdos o producto local en Google Maps. Si no estás en el Top 3, simplemente no existes para ellos."
      },
      {
        title: "Falta de Horarios Confiables",
        desc: "No indicar el horario de festivos o fines de semana hace que el cliente descarte ir por miedo a encontrarse la persiana bajada."
      }
    ],
    goodTitle: "El Escaparate de Valladolid",
    goodDescription: "Convertimos tu tienda o comercio en la parada obligatoria de Valladolid, visible para miles de personas interesadas en tus productos específicos.",
    goodPoints: [
      {
        title: "Fotografía de Producto Deseable",
        desc: "Imágenes en primer plano de productos artesanales, embutidos y quesos premium que despiertan el interés inmediato."
      },
      {
        title: "Geolocalización Turística Clave",
        desc: "Ficha perfectamente visible para cualquier visitante que camine por el centro histórico o busque en Google Maps."
      },
      {
        title: "Conversión de Tráfico a Ventas",
        desc: "Facilitamos indicaciones exactas de ruta, horarios verídicos y un enlace directo al catálogo online o consulta de stock."
      }
    ],
    metricValue: "+120 visitas físicas semanales a tienda",
    seoSubtext: "Puesto #1 en el Google Local Pack"
  }
};

export default function AntesDespues() {
  const [activeTab, setActiveTab] = useState<'antes' | 'despues'>('despues');
  const [activeBusiness, setActiveBusiness] = useState<'restaurante' | 'barberia' | 'estetica' | 'comercio'>('restaurante');

  const data = BUSINESS_DATA[activeBusiness];

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
            Haga clic en los diferentes tipos de negocio de abajo para ver la diferencia radical que experimentan al transformar su presencia digital en Google Maps de nuestra mano.
          </p>
        </div>

        {/* Business Category Tab Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
          {[
            { id: 'restaurante', label: 'Restaurante', icon: Utensils },
            { id: 'barberia', label: 'Barbería', icon: Scissors },
            { id: 'estetica', label: 'Estética', icon: Flower2 },
            { id: 'comercio', label: 'Comercio', icon: ShoppingBag }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeBusiness === item.id;
            return (
              <button
                key={item.id}
                id={`btn-biz-${item.id}`}
                onClick={() => setActiveBusiness(item.id as any)}
                className={`py-3.5 px-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  isActive
                    ? 'border-brand-gold bg-brand-gold/10 text-brand-gold shadow-lg shadow-brand-gold/5 font-black'
                    : 'border-white/5 bg-brand-dark/40 text-stone-400 hover:text-stone-200 hover:border-white/10'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-gold' : 'text-stone-500'}`} />
                <span className="text-[11px] font-black uppercase tracking-wider">{item.label}</span>
              </button>
            );
          })}
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
