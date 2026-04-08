import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from 'cors';
import { Resend } from 'resend';

const PORT = 3000;

async function startServer() {
  console.log("[SERVER] Iniciando servidor Express + Vite...");
  
  if (!process.env.RESEND_API_KEY) {
    console.warn("[SERVER] AVISO: RESEND_API_KEY não encontrada. O envio de e-mail falhará.");
  } else {
    console.log("[SERVER] RESEND_API_KEY configurada.");
  }

  const app = express();
  
  // Middleware de log para depuración
  app.use((req, res, next) => {
    console.log(`[SERVER] ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
  // Configuração de CORS robusta
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false
  }));

  // Responder a requisições OPTIONS (Preflight)
  app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.sendStatus(200);
  });

  // Initialize Resend (Lazy)
  let resend: Resend | null = null;
  const getResend = () => {
    const key = process.env.RESEND_API_KEY;
    if (!key || key === "" || key.includes("MY_RESEND_API_KEY")) {
      console.error("[SERVER] Error: RESEND_API_KEY no configurada correctamente.");
      throw new Error('La clave RESEND_API_KEY no está configurada en los Secretos del proyecto.');
    }
    if (!resend) {
      resend = new Resend(key);
    }
    return resend;
  };

  // API Routes
  app.get("/api/send-audit", (req, res) => {
    console.log("[SERVER] GET /api/send-audit hit");
    res.json({ message: "O endpoint existe, mas use POST para enviar dados." });
  });

  app.post("/api/send-audit", async (req, res) => {
    console.log(`[SERVER] >>> RECEBIDA CHAMADA POST EM /api/send-audit <<<`);
    const { email, businessName, pdfBase64, formData } = req.body;
    
    // Log de segurança para não perder dados caso o e-mail falhe
    console.log(`[DATA RECOVERY] Dados recebidos para ${businessName}:`, JSON.stringify(formData));
    
    if (!pdfBase64) {
      console.error("[SERVER] Erro: PDF não recebido");
      return res.status(400).json({ error: "PDF não recebido" });
    }

    try {
      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey || resendKey === "" || resendKey.includes("MY_RESEND_API_KEY")) {
        throw new Error('La clave RESEND_API_KEY no está configurada.');
      }

      console.log(`[SERVER] Enviando e-mail via Fetch para siqueiracash@gmail.com...`);
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: 'siqueiracash@gmail.com',
          subject: `Nueva Auditoría: ${businessName}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Nueva Auditoría Generada</h2>
              <p><strong>Negocio:</strong> ${businessName}</p>
              <p><strong>WhatsApp:</strong> ${formData?.whatsapp || 'N/A'}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p>El informe técnico detallado se encuentra adjunto.</p>
            </div>
          `,
          attachments: [{
            filename: `Auditoria_${businessName.replace(/\s+/g, '_')}.pdf`,
            content: pdfBase64,
          }],
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[SERVER] Erro Resend API:', JSON.stringify(result, null, 2));
        return res.status(response.status).json({ 
          error: result.message || result.error || 'Erro na API do Resend',
          details: result
        });
      }
      
      console.log("[SERVER] E-mail enviado com sucesso!", result.id);
      res.json({ success: true, id: result.id });
    } catch (err: any) {
      console.error('[SERVER] Erro Interno:', err);
      res.status(500).json({ error: err.message || 'Erro interno do servidor' });
    }
  });

  app.get("/api/debug-env", (req, res) => {
    const key = process.env.RESEND_API_KEY;
    res.json({ 
      hasKey: !!key,
      keyLength: key ? key.length : 0,
      keyPrefix: key ? key.substring(0, 5) + "..." : "none",
      nodeEnv: process.env.NODE_ENV
    });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Manejador para cualquier otra ruta /api/* que no exista
  app.all("/api/*", (req, res) => {
    console.warn(`[API] Ruta no encontrada: ${req.method} ${req.url}`);
    res.status(404).json({ error: `Ruta API no encontrada: ${req.url}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
