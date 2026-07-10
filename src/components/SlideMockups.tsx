import { Star, Heart, MessageCircle, Play, Send, Flame, ShieldCheck } from 'lucide-react';

/* 1. GOOGLE MAPS MOBILE MOCKUP (Slide 2) */
export function GoogleMapsMobileMockup() {
  return (
    <div className="bg-[#120D0C] border border-brand-gold/20 rounded-[2.5rem] p-4 w-full max-w-sm shadow-2xl relative select-none">
      {/* Phone notches */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20 flex items-center justify-center">
        <span className="w-1.5 h-1.5 bg-zinc-800 rounded-full mr-2" />
        <span className="w-12 h-1 bg-zinc-800 rounded-full" />
      </div>

      <div className="bg-stone-900 rounded-[2rem] overflow-hidden border border-stone-800 pt-6">
        {/* Mock Search Bar */}
        <div className="p-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-crimson" />
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Valladolid Local Search</span>
          </div>
          <div className="bg-stone-900 text-stone-500 rounded-lg px-2 py-1 text-[9px] font-bold">Barbería Premium</div>
        </div>

        {/* Listing Result block */}
        <div className="p-4 space-y-4">
          <div className="relative h-44 rounded-xl overflow-hidden bg-stone-950">
            <img 
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80" 
              alt="Barbería Castilla Valladolid"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/10 to-transparent" />
            
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase text-emerald-400">Muy Concurrido • Abierto</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-white">Barbería Castilla Valladolid</h4>
              <span className="text-[10px] font-black text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/20">TOP #1</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-brand-gold">4.9</span>
              <div className="flex text-brand-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current text-current" />
                ))}
              </div>
              <span className="text-[10px] text-stone-500 font-bold">(314 reseñas de vallisoletanos)</span>
            </div>

            <p className="text-[11px] text-stone-400 leading-normal">
              📍 Calle de Santiago 15, Valladolid • Barbería tradicional y de vanguardia, afeitados clásicos, cortes de pelo a navaja y arreglo de barba.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-black pt-3 border-t border-stone-800">
            <div className="p-2 bg-stone-950 rounded-lg hover:bg-stone-800 cursor-pointer">
              <span className="block text-brand-gold mb-0.5">📞 Ligar</span>
              <span className="text-[8px] text-stone-500 block">Conversión</span>
            </div>
            <div className="p-2 bg-stone-950 rounded-lg hover:bg-stone-800 cursor-pointer">
              <span className="block text-brand-gold mb-0.5">🗺️ Ruta</span>
              <span className="text-[8px] text-stone-500 block">Físico</span>
            </div>
            <div className="p-2 bg-stone-950 rounded-lg hover:bg-stone-800 cursor-pointer">
              <span className="block text-brand-gold mb-0.5">💬 Reservar</span>
              <span className="text-[8px] text-stone-500 block">WhatsApp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 2. STOREFRONT MOCKUP "PRODUCTOS TÍPICOS LA CASA" (Slide 5) */
export function StorefrontLaCasa() {
  return (
    <div className="bg-[#120D0C] rounded-[2.5rem] p-6 border border-brand-gold/20 shadow-2xl relative w-full max-w-md select-none overflow-hidden">
      {/* Gold atmospheric overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl" />

      {/* Gourmet Storefront Frame */}
      <div className="relative bg-amber-950/20 border border-brand-gold/10 rounded-2xl p-5 space-y-4">
        {/* Traditional Wood Board Style */}
        <div className="bg-gradient-to-r from-amber-900 to-amber-950 text-center py-4 px-3 rounded-xl border-2 border-brand-gold/40 shadow-inner relative">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-brand-gold rounded-full" />
          <span className="block text-[9px] uppercase tracking-[0.25em] text-brand-gold font-black">Valladolid</span>
          <h4 className="text-md sm:text-lg font-black text-[#F8F4EC] font-serif uppercase tracking-wider mt-0.5">
            Productos Típicos "LA CASA"
          </h4>
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-brand-crimson text-[7px] text-white rounded uppercase font-black tracking-widest">
            -20% Oferta Especial
          </span>
        </div>

        {/* Store display food photo */}
        <div className="relative h-44 rounded-xl overflow-hidden bg-stone-900 border border-amber-950/40">
          <img 
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80" 
            alt="Restaurante y Tapas Tradicionales"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/10 to-transparent" />
          
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm p-2 rounded-lg border border-white/5">
            <span className="text-[8px] font-black uppercase text-brand-gold tracking-widest block">Crecimiento Ficha</span>
            <span className="text-xs font-black text-white block flex items-center gap-1">
              📈 +75% Incremento
            </span>
          </div>
        </div>

        {/* Info & action buttons */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-stone-300">
            <span>🧀 Quesos y Embutidos Típicos</span>
            <span className="text-brand-gold">★ 4.8 (118 reseñas)</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-brand-dark/40 border border-brand-gold/10 p-3 rounded-xl text-center">
              <span className="block text-[8px] font-black uppercase text-stone-500">Reservas Directas</span>
              <span className="block text-xs font-black text-white mt-0.5">Reserva Ahora</span>
            </div>
            <div className="bg-brand-dark/40 border border-brand-gold/10 p-3 rounded-xl text-center">
              <span className="block text-[8px] font-black uppercase text-stone-500">Compra Online</span>
              <span className="block text-xs font-black text-brand-gold mt-0.5">Ventas Valladolid</span>
            </div>
          </div>
        </div>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-brand-gold/5 text-[9px] font-black text-stone-400 uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
          <span>Ficha Verificada en el Top 3 de Valladolid</span>
        </div>
      </div>
    </div>
  );
}

/* 3. INSTAGRAM REELS MOCKUP (Slide 6) */
export function InstagramReelsMockup() {
  return (
    <div className="bg-[#120D0C] border border-brand-gold/20 rounded-[2.5rem] p-4 w-full max-w-sm shadow-2xl relative select-none">
      {/* Top phone bar */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-20" />

      <div className="bg-black rounded-[2rem] overflow-hidden relative h-[480px]">
        {/* Full background aesthetic/skincare video representation */}
        <img 
          src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80" 
          alt="Tratamiento de cuidado facial en el reel"
          className="w-full h-full object-cover opacity-85"
          referrerPolicy="no-referrer"
        />

        {/* Overlay Dark Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

        {/* Floating Reels Header */}
        <div className="absolute top-8 left-4 right-4 flex items-center justify-between text-white z-10">
          <span className="text-xs font-black tracking-widest uppercase">Reels</span>
          <div className="flex items-center gap-1.5 text-[9px] font-bold bg-black/40 px-2 py-1 rounded-full">
            <Flame className="w-3 h-3 text-brand-gold" />
            <span>Estética & Glow Vibes</span>
          </div>
        </div>

        {/* Centered Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 animate-pulse">
            <Play className="w-7 h-7 text-white fill-current translate-x-0.5" />
          </div>
        </div>

        {/* Bottom Left Content Metadata */}
        <div className="absolute bottom-6 left-4 right-16 space-y-3 text-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-7.5 h-7.5 rounded-full bg-brand-gold flex items-center justify-center text-[10px] font-black border border-white/15 text-brand-dark">
              VE
            </div>
            <div>
              <h5 className="text-[11px] font-extrabold">ValladolidEstetica</h5>
              <p className="text-[8px] text-stone-400">Bienestar y belleza en Valladolid</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-black leading-tight">
              Contenido que detiene el scroll y llena la agenda de citas ✨💆‍♀️
            </p>
            <p className="text-[9px] text-stone-300">
              Vídeos cortos de tratamientos premium y transformaciones reales diseñados para captar miradas locales.
            </p>
          </div>
        </div>

        {/* Right Sidebar Interaction panel */}
        <div className="absolute bottom-6 right-3 flex flex-col items-center gap-5 text-white z-10">
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-all border border-white/5">
              <Heart className="w-5 h-5 text-brand-crimson fill-current" />
            </div>
            <span className="text-[9px] font-extrabold mt-1">12.4K</span>
          </div>

          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-all border border-white/5">
              <MessageCircle className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-[9px] font-extrabold mt-1">346</span>
          </div>

          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-all border border-white/5">
              <Send className="w-4 h-4 text-brand-gold" />
            </div>
            <span className="text-[9px] font-extrabold mt-1">Compartir</span>
          </div>
        </div>

      </div>
    </div>
  );
}
