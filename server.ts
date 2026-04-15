import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from 'cors';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const PORT = 3000;

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANOI;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const leads: any[] = [];

export async function createServer() {
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

  // ---------------------------------------------------------
  // 2. API ROUTES
  // ---------------------------------------------------------
  
  app.get("/api/config", (req, res) => {
    res.json({
      supabaseUrl: supabaseUrl || null,
      supabaseKey: supabaseKey || null,
      mode: process.env.NODE_ENV || "development"
    });
  });

  app.get("/api/ping", async (req, res) => {
    let supabaseStatus = "Não configurado";
    if (supabase) {
      try {
        const { count, error } = await supabase.from('leads').select('*', { count: 'exact', head: true });
        supabaseStatus = error ? `Erro: ${error.message}` : `Conectado (Total: ${count})`;
      } catch (err: any) {
        supabaseStatus = `Erro Crítico: ${err.message}`;
      }
    }
    res.json({ status: "ok", supabase: supabaseStatus });
  });

  app.post("/api/save-audit", async (req, res) => {
    const { email, businessName, formData, report } = req.body;
    if (!businessName) return res.status(400).json({ error: "Nome do negócio é obrigatório" });

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
        await supabase.from('leads').insert([{
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
      } catch (err: any) {
        console.error("[SUPABASE ERROR]", err.message);
      }
    }
    res.json({ success: true });
  });

  app.get("/api/admin/leads-data", async (req, res) => {
    console.log("[DEBUG] /api/admin/leads-data solicitado");
    try {
      if (supabase) {
        console.log("[DEBUG] Supabase presente, buscando leads...");
        const { data, error } = await supabase.from('leads').select('*').order('timestamp', { ascending: false });
        if (error) {
          console.error("[DEBUG] Erro ao buscar no Supabase:", error.message);
        } else if (data) {
          console.log(`[DEBUG] Sucesso! Encontrados ${data.length} leads.`);
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
      } else {
        console.warn("[DEBUG] Supabase NÃO inicializado no servidor.");
      }
      console.log(`[DEBUG] Retornando ${leads.length} leads da memória local.`);
      res.json(leads);
    } catch (err: any) {
      console.error("[DEBUG] Erro crítico na API leads-data:", err.message);
      res.status(500).json({ error: "Erro ao buscar leads", details: err.message });
    }
  });

  // 3. VITE / STATIC FILES
  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res, next) => {
        if (req.url.startsWith('/api/')) return next();
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  return app;
}

// Iniciar o servidor se for executado diretamente
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  createServer().then(app => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[SERVER] Rodando em http://0.0.0.0:${PORT}`);
    });
  });
}
