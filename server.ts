import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const PORT = 3000;

// Configuração opcional do Supabase para persistência real
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

async function startServer() {
  console.log("[SERVER] Iniciando servidor...");
  if (supabase) {
    console.log("[SERVER] Supabase detectado e configurado para persistência.");
  } else {
    console.log("[SERVER] Supabase não configurado. Usando apenas memória (volátil).");
  }
  
  const app = express();
  
  // ---------------------------------------------------------
  // 1. CORS CONFIGURATION (MUST BE FIRST)
  // ---------------------------------------------------------
  
  // Configuração manual de headers para garantir que NADA bloqueie
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Responder imediatamente a requisições de preflight (OPTIONS)
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // Middleware do pacote cors como backup
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false
  }));

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Armazenamento temporário em memória (limpa ao reiniciar o servidor)
  const leads: any[] = [];

  // ---------------------------------------------------------
  // 2. API ROUTES
  // ---------------------------------------------------------
  
  app.get("/api/ping", (req, res) => {
    console.log("[API] Ping recebido");
    res.json({ 
      status: "ok", 
      message: "Servidor online e acessível", 
      timestamp: new Date().toISOString(),
      hasResendKey: !!process.env.RESEND_API_KEY
    });
  });

  // Rota secreta para ver os leads (JSON)
  app.get("/api/admin/leads-data", async (req, res) => {
    console.log("[API] Buscando leads...");
    
    try {
      let allLeads = [...leads]; 

      if (supabase) {
        console.log("[SUPABASE] Buscando leads no banco...");
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('timestamp', { ascending: false });
        
        if (error) {
          console.error("[SUPABASE FETCH ERROR]", error);
          // Fallback para memória se o Supabase falhar
        } else if (data) {
          console.log(`[SUPABASE] ${data.length} leads encontrados.`);
          const supabaseLeads = data.map(l => ({
            timestamp: l.timestamp,
            businessName: l.business_name || l.businessName || 'N/A',
            businessType: l.business_type || l.businessType || 'N/A',
            location: l.location || 'N/A',
            email: l.email || 'N/A',
            whatsapp: l.whatsapp || 'N/A',
            website: l.website || '',
            instagram: l.instagram || '',
            facebook: l.facebook || '',
            linkedin: l.linkedin || '',
            tiktok: l.tiktok || '',
            otherPlatforms: l.other_platforms || l.otherPlatforms || '',
            emailSent: l.email_sent !== undefined ? l.email_sent : (l.emailSent || false),
            reportData: l.report_data || l.reportData || null
          }));
          
          allLeads = supabaseLeads;
        }
      }
      
      console.log(`[API] Retornando ${allLeads.length} leads.`);
      res.json(allLeads);
    } catch (err) {
      console.error("[SERVER FETCH ERROR]", err);
      res.status(500).json({ error: "Erro interno ao buscar leads" });
    }
  });

  // Rota secreta para ver os leads (HTML)
  app.get("/api/admin/leads", (req, res) => {
    res.send(`
      <html>
        <head>
          <title>Painel de Leads - Impulsa Valladolid</title>
          <style>
            body { font-family: sans-serif; padding: 20px; background: #f5f5f5; }
            .lead { background: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #ef4444; }
          </style>
        </head>
        <body>
          <h1>Painel de Leads (Temporário)</h1>
          <p>Estes leads estão salvos apenas na memória do servidor. Se o servidor reiniciar, eles serão apagados.</p>
          <div id="leads">
            ${leads.length === 0 ? '<p>Nenhum lead capturado ainda.</p>' : leads.reverse().map(l => `
              <div class="lead">
                <strong>Data:</strong> ${l.timestamp}<br>
                <strong>Negócio:</strong> ${l.businessName}<br>
                <strong>Email:</strong> ${l.email}<br>
                <strong>WhatsApp:</strong> ${l.whatsapp}<br>
                <strong>Status E-mail:</strong> ${l.emailSent ? '✅ Enviado' : '❌ Falhou'}
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `);
  });

  app.get("/api/ping", (req, res) => {
    res.json({ 
      status: "ok", 
      message: "Servidor Impulsa Valladolid está online",
      supabase: supabase ? "Configurado" : "Não configurado",
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/save-audit", async (req, res) => {
    const contentLength = req.headers['content-length'];
    console.log(`[API] /api/save-audit recebido. Content-Length: ${contentLength} bytes`);
    
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
      console.error("[API] Erro: Body vazio ou não parseado.");
      return res.status(400).json({ error: "Dados não recebidos no servidor." });
    }

    const { email, businessName, pdfBase64, formData, report } = data;

    // Salvar no banco em memória imediatamente
    const leadEntry = {
      timestamp: new Date().toISOString(),
      email: email || 'N/A',
      businessName: businessName || 'N/A',
      whatsapp: formData?.whatsapp || 'N/A',
      reportData: report || null
    };
    leads.push(leadEntry);
    console.log(`[API] Lead [${leadEntry.businessName}] adicionado à memória.`);

    // Salvar no Supabase se disponível
    if (supabase) {
      console.log("[SUPABASE] Tentando persistir lead...");
      const supabaseData: any = {
        business_name: leadEntry.businessName,
        business_type: formData?.businessType || 'otro',
        location: formData?.location || 'N/A',
        email: leadEntry.email,
        whatsapp: leadEntry.whatsapp,
        website: formData?.website || '',
        instagram: formData?.instagram || '',
        facebook: formData?.facebook || '',
        linkedin: formData?.linkedin || '',
        tiktok: formData?.tiktok || '',
        other_platforms: formData?.otherPlatforms || '',
        report_data: leadEntry.reportData,
        timestamp: leadEntry.timestamp
      };

      try {
        const { error } = await supabase.from('leads').insert([supabaseData]);
        if (error) {
          console.error("[SUPABASE ERROR] Falha ao inserir lead:", error.message);
          return res.status(500).json({ 
            error: "Erro ao salvar no banco de dados Supabase", 
            details: error.message 
          });
        }
        console.log("[SUPABASE] Lead persistido com sucesso.");
      } catch (err: any) {
        console.error("[SUPABASE CRITICAL ERROR]", err);
        return res.status(500).json({ 
          error: "Erro crítico ao acessar Supabase", 
          details: err.message 
        });
      }
    } else {
      console.warn("[SERVER] Supabase não configurado. Lead salvo apenas em memória.");
    }

    res.json({ success: true, message: "Dados salvos com sucesso" });
  });

  // ---------------------------------------------------------
  // 3. STATIC FILES / VITE
  // ---------------------------------------------------------

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      if (req.url.startsWith('/api/')) {
        return res.status(404).json({ error: "Rota API não encontrada" });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Rodando na porta ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("[FATAL ERROR] Falha ao iniciar o servidor:", err);
});
