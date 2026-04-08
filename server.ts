import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from 'cors';
import { Resend } from 'resend';

const PORT = 3000;

async function startServer() {
  console.log("[SERVER] Iniciando servidor robusto...");
  
  const app = express();
  
  // Middlewares básicos
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false
  }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Responder a requisições OPTIONS (Preflight) explicitamente
  app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.sendStatus(200);
  });

  // Log de todas as requisições
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // ---------------------------------------------------------
  // API ROUTES (DEFINIDAS ANTES DE QUALQUER OUTRA COISA)
  // ---------------------------------------------------------
  
  app.get("/api/ping", (req, res) => {
    console.log("[API] Ping recebido");
    res.json({ 
      status: "ok", 
      message: "Servidor está online e respondendo", 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      hasResendKey: !!process.env.RESEND_API_KEY
    });
  });

  app.post("/api/send-audit", async (req, res) => {
    console.log("[API] /api/send-audit POST recebido");
    const { email, businessName, pdfBase64, formData } = req.body;

    if (!pdfBase64) {
      console.error("[API] Erro: PDF ausente");
      return res.status(400).json({ error: "Dados do PDF não recebidos" });
    }

    try {
      const resendKey = process.env.RESEND_API_KEY;
      console.log(`[API] Resend Key presente: ${!!resendKey}, Prefixo: ${resendKey ? resendKey.substring(0, 5) : 'N/A'}`);
      if (!resendKey || resendKey === "" || resendKey.includes("MY_RESEND_API_KEY")) {
        console.error("[API] Erro: RESEND_API_KEY não configurada");
        return res.status(500).json({ error: "A chave RESEND_API_KEY não foi configurada nos segredos do projeto." });
      }

      const resend = new Resend(resendKey);
      
      console.log(`[API] Enviando e-mail para siqueiracash@gmail.com (Negócio: ${businessName})`);
      
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'siqueiracash@gmail.com',
        subject: `Nueva Auditoría: ${businessName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Nueva Auditoría Generada</h2>
            <p><strong>Negocio:</strong> ${businessName}</p>
            <p><strong>WhatsApp:</strong> ${formData?.whatsapp || 'N/A'}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p>O relatório técnico está em anexo.</p>
          </div>
        `,
        attachments: [{
          filename: `Auditoria_${businessName.replace(/\s+/g, '_')}.pdf`,
          content: pdfBase64,
        }],
      });

      if (error) {
        console.error("[RESEND ERROR]", error);
        return res.status(400).json({ error: error.message, details: error });
      }

      console.log("[API] E-mail enviado com sucesso!", data?.id);
      res.json({ success: true, id: data?.id });
    } catch (err: any) {
      console.error("[SERVER ERROR]", err);
      res.status(500).json({ error: err.message || "Erro interno no servidor" });
    }
  });

  // ---------------------------------------------------------
  // STATIC FILES / VITE (DEFINIDOS DEPOIS DAS APIS)
  // ---------------------------------------------------------

  if (process.env.NODE_ENV !== "production") {
    console.log("[SERVER] Modo Desenvolvimento (Vite)");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[SERVER] Modo Produção (Static)");
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Catch-all para SPA, mas ignorando /api
    app.get('*', (req, res) => {
      if (req.url.startsWith('/api/')) {
        console.warn(`[SERVER] Rota API não encontrada: ${req.url}`);
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
