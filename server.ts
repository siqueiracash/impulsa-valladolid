import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from 'cors';
import { Resend } from 'resend';

const PORT = 3000;

async function startServer() {
  console.log("[SERVER] Iniciando servidor com CORS ULTRA-PERMISSIVO...");
  
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
  app.get("/api/admin/leads-data", (req, res) => {
    res.json(leads);
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
      emailSent: false
    };
    leads.push(leadEntry);

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
