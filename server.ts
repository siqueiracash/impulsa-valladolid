import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const PORT = 3000;

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

async function startServer() {
  console.log("[SERVER] Iniciando servidor...");
  
  const app = express();
  
  // 1. Logging & CORS
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Armazenamento temporário
  const leads: any[] = [];

  // 2. API ROUTES (Registradas ANTES do Vite)
  
  app.get("/api/ping", async (req, res) => {
    console.log("[API] Ping recebido");
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
        supabaseDebug = err;
      }
    }

    res.json({ 
      status: "ok", 
      message: "Servidor Impulsa Valladolid está online e operante",
      supabase: supabaseStatus,
      supabaseDebug: supabaseDebug,
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
          return res.status(500).json({ error: "Erro no Supabase", details: error.message });
        }
      } catch (err: any) {
        console.error("[SUPABASE CRITICAL]", err.message);
        return res.status(500).json({ error: "Erro crítico no Supabase", details: err.message });
      }
    }

    res.json({ success: true, message: "Dados salvos com sucesso" });
  });

  app.get("/api/admin/leads-data", async (req, res) => {
    try {
      if (supabase) {
        const { data, error } = await supabase.from('leads').select('*').order('timestamp', { ascending: false });
        if (!error && data) {
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
      }
      res.json(leads);
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar leads" });
    }
  });

  // 3. VITE / STATIC FILES
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
        return res.status(404).json({ error: "API Route not found" });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
