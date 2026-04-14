import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const PORT = 3000;

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANOI;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

async function startServer() {
  console.log("[SERVER] >>> INICIANDO SERVIDOR IMPULSA VALLADOLID V4 <<<");
  console.log(`[SERVER] Horário: ${new Date().toISOString()}`);
  console.log(`[SERVER] Supabase URL: ${supabaseUrl ? "Detectada" : "AUSENTE"}`);
  console.log(`[SERVER] Supabase Key: ${supabaseKey ? "Detectada" : "AUSENTE"}`);
  
  if (!process.env.VITE_SUPABASE_ANON_KEY && process.env.VITE_SUPABASE_ANOI) {
    console.log("[SERVER] AVISO: Detectada chave VITE_SUPABASE_ANOI (possível erro de digitação no Secret)");
  }
  
  const app = express();
  
  // 1. Middlewares básicos
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Logging de todas as requisições para debug
  app.use((req, res, next) => {
    console.log(`[DEBUG] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // Armazenamento temporário
  const leads: any[] = [];

  // ---------------------------------------------------------
  // 2. API ROUTES (Registradas ANTES de qualquer outra coisa)
  // ---------------------------------------------------------
  
  // Endpoint para fornecer configuração ao cliente
  app.get("/api/config", (req, res) => {
    console.log("[DEBUG] /api/config solicitado. URL presente:", !!supabaseUrl);
    res.json({
      supabaseUrl: supabaseUrl || null,
      supabaseKey: supabaseKey || null,
      mode: process.env.NODE_ENV || "development"
    });
  });

  // Endpoint de debug para variáveis de ambiente (apenas chaves)
  app.get("/api/debug-env", (req, res) => {
    const keys = Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('VITE'));
    res.json({
      envKeys: keys,
      nodeEnv: process.env.NODE_ENV,
      cwd: process.cwd(),
      timestamp: new Date().toISOString()
    });
  });

  // Rota de teste simples
  app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from Express!" });
  });

  app.get("/api/ping", async (req, res) => {
    console.log("[API] Ping solicitado");
    let supabaseStatus = "Não configurado";
    let supabaseDebug = null;

    if (supabase) {
      try {
        const { count, error } = await supabase.from('leads').select('*', { count: 'exact', head: true });
        if (error) {
          supabaseStatus = `Erro: ${error.message}`;
          supabaseDebug = error;
        } else {
          supabaseStatus = `Conectado (Total: ${count})`;
        }
      } catch (err: any) {
        supabaseStatus = `Erro Crítico: ${err.message}`;
        supabaseDebug = { message: err.message, stack: err.stack };
      }
    }

    res.json({ 
      status: "ok", 
      message: "Servidor Impulsa Valladolid está online e operante",
      supabase: supabaseStatus,
      supabaseDebug: supabaseDebug,
      env: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        nodeEnv: process.env.NODE_ENV
      },
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/save-audit", async (req, res) => {
    console.log("[API] /api/save-audit recebido");
    const { email, businessName, formData, report } = req.body;

    if (!businessName) {
      return res.status(400).json({ error: "Nome do negócio é obrigatório" });
    }

    const leadEntry = {
      timestamp: new Date().toISOString(),
      email: email || 'N/A',
      businessName: businessName,
      whatsapp: formData?.whatsapp || 'N/A',
      reportData: report || null
    };
    leads.push(leadEntry);

    if (supabase) {
      try {
        const { error } = await supabase.from('leads').insert([{
          business_name: businessName,
          business_type: formData?.businessType || 'otro',
          location: formData?.location || 'N/A',
          email: email,
          whatsapp: formData?.whatsapp || 'N/A',
          website: formData?.website || '',
          instagram: formData?.instagram || '',
          facebook: formData?.facebook || '',
          linkedin: formData?.linkedin || '',
          tiktok: formData?.tiktok || '',
          other_platforms: formData?.otherPlatforms || '',
          report_data: report,
          timestamp: leadEntry.timestamp
        }]);

        if (error) {
          console.error("[SUPABASE ERROR]", error.message);
          // Não retornamos erro 500 aqui para não travar o usuário, 
          // já que salvamos em memória como fallback
        }
      } catch (err: any) {
        console.error("[SUPABASE CRITICAL]", err.message);
      }
    }

    res.json({ success: true, message: "Dados salvos com sucesso" });
  });

  app.get("/api/admin/leads-data", async (req, res) => {
    console.log("[API] Buscando leads...");
    try {
      if (supabase) {
        const { data, error } = await supabase.from('leads').select('*').order('timestamp', { ascending: false });
        if (!error && data) {
          console.log(`[API] Retornando ${data.length} leads do Supabase`);
          return res.json(data.map(l => ({
            timestamp: l.timestamp,
            businessName: l.business_name || l.businessName,
            businessType: l.business_type || l.businessType,
            location: l.location,
            email: l.email,
            whatsapp: l.whatsapp,
            website: l.website,
            instagram: l.instagram,
            facebook: l.facebook,
            linkedin: l.linkedin,
            tiktok: l.tiktok,
            otherPlatforms: l.other_platforms || l.otherPlatforms,
            reportData: l.report_data || l.reportData
          })));
        }
        if (error) console.error("[SUPABASE FETCH ERROR]", error.message);
      }
      console.log(`[API] Retornando ${leads.length} leads da memória`);
      res.json(leads);
    } catch (err) {
      console.error("[API ERROR]", err);
      res.status(500).json({ error: "Erro ao buscar leads" });
    }
  });

  // ---------------------------------------------------------
  // 3. VITE / STATIC FILES (Registrados DEPOIS das APIs)
  // ---------------------------------------------------------
  
  if (process.env.NODE_ENV !== "production") {
    console.log("[SERVER] Configurando Vite em modo desenvolvimento...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[SERVER] Configurando arquivos estáticos em modo produção...");
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Fallback para SPA em produção
    app.get('*', (req, res, next) => {
      // Se for uma rota de API que chegou aqui, é porque não existe
      if (req.url.startsWith('/api/')) {
        return res.status(404).json({ error: "API Route not found" });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 4. Iniciar o servidor
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] >>> SUCESSO <<< Rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("[FATAL ERROR] Falha ao iniciar o servidor:", err);
});
