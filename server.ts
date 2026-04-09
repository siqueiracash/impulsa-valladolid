import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from 'cors';
import { Resend } from 'resend';
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
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
    let allLeads = [...leads]; 

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('timestamp', { ascending: false });
        
        if (error) {
          console.error("[SUPABASE FETCH ERROR]", error);
          // Em vez de dar erro 500, vamos retornar o que temos na memória mas avisar o console
          return res.json(allLeads);
        } 
        
        if (data) {
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
          console.log(`[API] ${allLeads.length} leads recuperados com sucesso.`);
        }
      } catch (err) {
        console.error("[SERVER FETCH ERROR]", err);
        return res.json(allLeads);
      }
    }
    
    res.json(allLeads);
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

  app.post("/api/send-audit", async (req, res) => {
    console.log("[API] /api/send-audit recebido");
    
    // Suporte para JSON ou Form-Encoded (fallback para evitar CORS)
    const data = req.body;
    const { email, businessName, pdfBase64, formData } = data;

    if (!pdfBase64) {
      console.error("[API] Erro: PDF ausente");
      return res.status(400).json({ error: "Dados do PDF não recebidos" });
    }

    // Salvar no banco em memória imediatamente
    const leadEntry = {
      timestamp: new Date().toISOString(),
      email,
      businessName,
      whatsapp: formData?.whatsapp || 'N/A',
      emailSent: false,
      reportData: data.report || null // Salvar o JSON do relatório se disponível
    };
    leads.push(leadEntry);

    // Salvar no Supabase se disponível
    if (supabase) {
      console.log("[SUPABASE] Tentando salvar lead completo...");
      const supabaseData: any = {
        business_name: businessName,
        business_type: formData?.businessType || 'otro',
        location: formData?.location || 'N/A',
        email: email,
        whatsapp: leadEntry.whatsapp,
        website: formData?.website || '',
        instagram: formData?.instagram || '',
        facebook: formData?.facebook || '',
        linkedin: formData?.linkedin || '',
        tiktok: formData?.tiktok || '',
        other_platforms: formData?.otherPlatforms || '',
        email_sent: leadEntry.emailSent,
        report_data: leadEntry.reportData
      };

      supabase.from('leads').insert([supabaseData]).then(({ error }) => {
        if (error) {
          console.error("[SUPABASE INSERT ERROR] DETALHES:", JSON.stringify(error, null, 2));
        } else {
          console.log("[SUPABASE] Lead completo salvo com sucesso.");
        }
      });
    }

    try {
      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey || resendKey === "" || resendKey.includes("MY_RESEND_API_KEY")) {
        console.error("[API] Erro: RESEND_API_KEY não configurada");
        return res.status(500).json({ error: "RESEND_API_KEY não configurada" });
      }

      const resend = new Resend(resendKey);
      
      const { data: resendData, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'siqueiracash@gmail.com',
        subject: `Nueva Auditoría: ${businessName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Nueva Auditoría Generada</h2>
            <p><strong>Negocio:</strong> ${businessName}</p>
            <p><strong>WhatsApp:</strong> ${formData?.whatsapp || 'N/A'}</p>
            <p><strong>Email:</strong> ${email}</p>
            <hr>
            <p>Este lead também foi salvo no painel temporário: /api/admin/leads</p>
          </div>
        `,
        attachments: [{
          filename: `Auditoria_${businessName.replace(/\s+/g, '_')}.pdf`,
          content: pdfBase64,
        }],
      });

      if (error) {
        console.error("[RESEND ERROR]", error);
        return res.status(400).json({ error: error.message });
      }

      leadEntry.emailSent = true;
      console.log("[API] E-mail enviado com sucesso!");
      
      // Se for um POST de formulário (não fetch), redirecionar ou enviar HTML simples
      if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
        return res.send("<h1>Sucesso! Seu relatório foi enviado.</h1><script>setTimeout(() => window.close(), 2000)</script>");
      }
      
      res.json({ success: true });
    } catch (err: any) {
      console.error("[SERVER ERROR]", err);
      res.status(500).json({ error: err.message });
    }
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
