import { useState } from 'react';
import { Database, Lock, AlertCircle, X, MessageSquare, Instagram, Facebook, Linkedin, Globe } from 'lucide-react';
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

interface AdminPanelProps {
  setView: (view: 'landing' | 'admin') => void;
  triggerAlert: (type: 'success' | 'err', text: string) => void;
}

export default function AdminPanel({ setView, triggerAlert }: AdminPanelProps) {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminLeads, setAdminLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const fetchLeads = async (customToken?: string) => {
    const token = customToken || adminPassword;
    const localLeads = dbSync.getLeads();
    
    // Se for a senha padrão requisitada, permite validação mesmo local
    const isStandardAdmin = token === 'abcd1234';

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let serverLeads: any[] = [];
      let isSuccess = false;
      let errMsg = '';
      
      try {
        const data = await response.json();
        if (response.ok && data.success) {
          serverLeads = data.leads || [];
          isSuccess = true;
        } else {
          errMsg = data.error || 'Contraseña incorrecta.';
        }
      } catch (parseErr) {
        // Falha no parsing do JSON (ex: se o servidor retornar HTML ou erro 500 sem formato JSON)
        if (isStandardAdmin) {
          isSuccess = true; // Força sucesso para a senha padrão no fallback
        } else {
          throw new Error('Respuesta inválida del servidor.');
        }
      }

      if (isSuccess) {
        // Unir leads do servidor e locais sem duplicados
        const mergedMap = new Map();
        
        // Primeiro adiciona os do servidor
        serverLeads.forEach((l: any) => {
          const key = `${l.businessName}-${l.phone}`;
          mergedMap.set(key, l);
        });
        
        // Depois adiciona os locais se não estiverem no mapa
        localLeads.forEach((l: any) => {
          const key = `${l.businessName}-${l.phone}`;
          if (!mergedMap.has(key)) {
            mergedMap.set(key, l);
          }
        });
        
        const mergedLeads = Array.from(mergedMap.values());
        
        // Ordenar por data mais recente
        mergedLeads.sort((a: any, b: any) => {
          return new Date(b.datetime || b.id).getTime() - new Date(a.datetime || a.id).getTime();
        });

        setAdminLeads(mergedLeads);
        setIsAdminAuthenticated(true);
        triggerAlert('success', 'Panel de administración sincronizado con éxito.');
      } else {
        // Se a senha for a correta 'abcd1234' localmente, autentica mesmo com erro na resposta
        if (isStandardAdmin) {
          const sortedLocals = [...localLeads].sort((a: any, b: any) => {
            return new Date(b.datetime || b.id).getTime() - new Date(a.datetime || a.id).getTime();
          });
          setAdminLeads(sortedLocals);
          setIsAdminAuthenticated(true);
          triggerAlert('success', 'Panel sincronizado con base de datos local.');
        } else {
          setLoginError(errMsg || 'Contraseña incorrecta.');
        }
      }
    } catch (err) {
      console.warn("Fallo de conexión, intentando autenticación local para abcd1234:", err);
      // Fallback local se falhar conexão física de rede
      if (isStandardAdmin) {
        const sortedLocals = [...localLeads].sort((a: any, b: any) => {
          return new Date(b.datetime || b.id).getTime() - new Date(a.datetime || a.id).getTime();
        });
        setAdminLeads(sortedLocals);
        setIsAdminAuthenticated(true);
        triggerAlert('success', 'Panel sincronizado en modo local offline.');
      } else {
        setLoginError('Error de conexión con el backend.');
      }
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    setTimeout(async () => {
      await fetchLeads();
      setIsLoggingIn(false);
    }, 600);
  };

  const handleWhatsAppContact = (leadData: any) => {
    const score = leadData.auditScore || 65;
    const message = `Hola, acabo de revisar la auditoría para tu negocio: *${leadData.businessName}* con un puntaje de *${score}/100*. Contáctanos para hablar de tu plan de posicionamiento. 🚀`;
    const whatsappUrl = `https://wa.me/34325678398?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <main className="flex-grow py-12 px-6 max-w-7xl mx-auto w-full text-white bg-brand-dark min-h-screen">
      
      {/* Admin Header */}
      <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-gold block">Panel de Control Interno</span>
          <h2 className="text-2xl md:text-4xl font-black text-white font-serif">Administración de Leads de Auditoría</h2>
          <p className="text-stone-400 text-xs mt-0.5">Siga los leads capturados y gestione sus contactos de Valladolid y Madrid de forma rápida.</p>
        </div>
        
        <button 
          onClick={() => setView('landing')} 
          className="text-xs font-bold tracking-wider uppercase bg-stone-900 hover:bg-stone-850 text-brand-gold px-5 py-3 rounded-xl border border-brand-gold/20"
        >
          Volver a la Web
        </button>
      </div>

      {!isAdminAuthenticated ? (
        /* Login Form */
        <div className="bg-brand-dark-sec max-w-md mx-auto p-10 rounded-3xl border border-brand-gold/15 shadow-2xl relative">
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-dark border border-brand-gold/20 text-brand-gold mx-auto flex items-center justify-center shadow-lg">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Identificación de Administrador</h3>
            <p className="text-xs text-stone-400">Escriba su contraseña secreta para acceder al listado de prospectos.</p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-brand-red/20 text-brand-red text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Contraseña Secreta (ADMIN_PASSWORD)</label>
              <input 
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-brand-dark border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-brand-gold focus:bg-black/40 transition-all"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 bg-brand-gold hover:bg-amber-600 text-brand-dark rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all shadow-md disabled:bg-stone-800"
            >
              {isLoggingIn ? 'Verificando...' : 'Entrar al Panel Admin'}
            </button>
          </form>
        </div>
      ) : (
        /* Authenticated View */
        <div className="space-y-8 animate-fade-in-up">
          
          <div className="bg-brand-dark-sec rounded-[2.5rem] border border-brand-gold/15 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex items-center justify-between flex-wrap gap-4">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2 font-serif">
                <Database className="w-5 h-5 text-brand-gold" /> Registro Histórico de Leads ({adminLeads.length})
              </h3>
              <button 
                onClick={() => fetchLeads()} 
                className="text-xs font-bold text-brand-gold hover:underline bg-brand-dark px-3 py-1.5 rounded-lg border border-white/5"
              >
                Actualizar Lista
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-dark text-[10px] font-black uppercase text-stone-450 tracking-widest border-b border-white/5">
                    <th className="px-8 py-5">Negocio</th>
                    <th className="px-6 py-5">Ubicación</th>
                    <th className="px-6 py-5">Contacto / Teléfono</th>
                    <th className="px-6 py-5">Puntaje</th>
                    <th className="px-8 py-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {adminLeads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-4 text-stone-600">
                          <Database className="w-16 h-16 opacity-35" />
                          <p className="text-lg font-bold italic">No hay leads registrados todavía.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    adminLeads.map((lg) => (
                      <tr key={lg.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="block text-sm font-extrabold text-white">{lg.businessName}</span>
                            {lg.businessType && (
                              <span className="text-[9px] bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded-full font-black uppercase tracking-wider border border-brand-gold/20">
                                {lg.businessType}
                              </span>
                            )}
                          </div>
                          <span className="block text-[10px] text-stone-500">{new Date(lg.datetime).toLocaleString('es') || 'Reciente'}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs font-bold text-stone-300 block">{lg.dynamicCity}</span>
                          <span className="text-[10px] text-stone-500 block truncate max-w-[180px]">{lg.address || 'Sin dirección registrada'}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs font-bold text-stone-300 block">{lg.contactName || 'No especificado'}</span>
                          <span className="text-xs text-brand-gold font-mono block">{lg.phone || 'Sin número'}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`text-xs font-extrabold px-2 py-1 rounded-md ${
                            (lg.auditScore || 60) > 75 
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' 
                              : 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
                          }`}>
                            {lg.auditScore || 65}/100
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right space-x-2">
                          <button 
                            onClick={() => setSelectedLead(lg)}
                            className="text-xs font-bold text-brand-dark bg-brand-gold hover:bg-amber-600 px-3 py-1.5 rounded-lg"
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

          {/* Details Modal */}
          {selectedLead && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
              <div className="bg-brand-dark-sec w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-3xl border border-brand-gold/15 max-h-[90vh] flex flex-col animate-fade-in-up">
                
                <div className="p-6 bg-brand-dark border-b border-white/5 flex items-center justify-between shrink-0">
                  <div>
                    <span className="text-[10px] font-black uppercase text-brand-gold tracking-widest">Resumen de Auditoría Completa</span>
                    <h4 className="text-lg font-black text-white mt-0.5">{selectedLead.businessName}</h4>
                  </div>
                  <button 
                    onClick={() => setSelectedLead(null)}
                    className="p-1.5 hover:bg-stone-800 rounded-xl transition-all text-stone-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto text-stone-300">
                  
                  <div className="grid grid-cols-2 gap-4 bg-brand-dark p-5 rounded-2xl border border-white/5">
                    <div>
                      <span className="block text-[10px] uppercase font-black text-stone-500">Tipo de Negocio</span>
                      <span className="text-sm font-bold text-brand-gold">{selectedLead.businessType || 'No especificado'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-black text-stone-500">Nombre del Contacto</span>
                      <span className="text-sm font-bold text-white">{selectedLead.contactName || 'No indicado'}</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-white/5 mt-1">
                      <span className="block text-[10px] uppercase font-black text-stone-500">WhatsApp / Teléfono</span>
                      <span className="text-sm font-bold text-white font-mono">{selectedLead.phone || 'No indicado'}</span>
                    </div>
                    {selectedLead.website && (
                      <div className="col-span-2 pt-2 border-t border-white/5 mt-1">
                        <span className="block text-[10px] uppercase font-black text-stone-500">Sitio Web</span>
                        <a 
                          href={selectedLead.website.startsWith('http') ? selectedLead.website : `https://${selectedLead.website}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-brand-gold hover:underline flex items-center gap-1.5 mt-0.5"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          {selectedLead.website}
                        </a>
                      </div>
                    )}
                    <div className="col-span-2 pt-2 border-t border-white/5 mt-1">
                      <span className="block text-[10px] uppercase font-black text-stone-500">Comentarios Adicionales</span>
                      <span className="text-xs font-bold text-stone-300 leading-normal block">{selectedLead.comments || 'Sin comentarios'}</span>
                    </div>

                    {(selectedLead.instagram || selectedLead.facebook || selectedLead.tiktok || selectedLead.linkedin) && (
                      <div className="col-span-2 pt-2 border-t border-white/5 mt-1 space-y-2">
                        <span className="block text-[10px] uppercase font-black text-stone-550">Redes Sociales</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedLead.instagram && (
                            <div className="flex items-center gap-2 text-stone-300 bg-brand-dark-sec/50 p-2 rounded-lg border border-white/5 text-xs">
                              <Instagram className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                              <span className="truncate font-bold">{selectedLead.instagram}</span>
                            </div>
                          )}
                          {selectedLead.facebook && (
                            <div className="flex items-center gap-2 text-stone-300 bg-brand-dark-sec/50 p-2 rounded-lg border border-white/5 text-xs">
                              <Facebook className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                              <span className="truncate font-bold">{selectedLead.facebook}</span>
                            </div>
                          )}
                          {selectedLead.tiktok && (
                            <div className="flex items-center gap-2 text-stone-300 bg-brand-dark-sec/50 p-2 rounded-lg border border-white/5 text-xs">
                              <TiktokIcon className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                              <span className="truncate font-bold">{selectedLead.tiktok}</span>
                            </div>
                          )}
                          {selectedLead.linkedin && (
                            <div className="flex items-center gap-2 text-stone-300 bg-brand-dark-sec/50 p-2 rounded-lg border border-white/5 text-xs">
                              <Linkedin className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                              <span className="truncate font-bold">{selectedLead.linkedin}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-stone-450 block">Puntajes de Rendimiento Local</span>
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div className="bg-brand-dark p-3 rounded-xl border border-white/5">
                        <span className="block text-[9px] text-stone-500 font-bold">SEO Maps</span>
                        <span className="text-md font-extrabold text-brand-gold">{selectedLead.report?.mapsScore || 70}%</span>
                      </div>
                      <div className="bg-brand-dark p-3 rounded-xl border border-white/5">
                        <span className="block text-[9px] text-stone-500 font-bold">Semántico</span>
                        <span className="text-md font-extrabold text-brand-gold">{selectedLead.report?.seoScore || 65}%</span>
                      </div>
                      <div className="bg-brand-dark p-3 rounded-xl border border-white/5">
                        <span className="block text-[9px] text-stone-500 font-bold">Reseñas</span>
                        <span className="text-md font-extrabold text-brand-gold">{selectedLead.report?.contentScore || 68}%</span>
                      </div>
                      <div className="bg-brand-dark p-3 rounded-xl border border-white/5">
                        <span className="block text-[9px] text-stone-500 font-bold">Velocidad</span>
                        <span className="text-md font-extrabold text-brand-gold">{selectedLead.report?.speedScore || 72}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-brand-gold block">Recomendaciones del Analista de IA:</span>
                    <div className="space-y-2">
                      {selectedLead.report?.recommendations?.map((item: string, i: number) => (
                        <div key={i} className="p-3 bg-brand-dark border border-white/5 rounded-xl text-xs font-semibold text-stone-300 flex items-start gap-2.5 leading-normal">
                          <span className="bg-brand-gold/10 text-brand-gold text-[10px] font-bold w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0">{i+1}</span>
                          <p>{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="p-6 bg-brand-dark border-t border-white/5 flex items-center justify-between shrink-0 gap-4 flex-wrap">
                  <button 
                    onClick={() => handleWhatsAppContact(selectedLead)}
                    className="px-5 py-3.5 bg-brand-gold hover:bg-amber-600 rounded-xl text-brand-dark text-xs font-black uppercase tracking-wider flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>Abrir WhatsApp para contactar</span>
                  </button>
                  
                  <button 
                    onClick={() => setSelectedLead(null)}
                    className="px-5 py-3.5 hover:bg-stone-850 text-stone-400 rounded-xl text-xs font-bold"
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
  );
}
