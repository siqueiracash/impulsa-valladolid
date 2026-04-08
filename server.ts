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
  app.use(cors());

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
  app.post("/api/send-audit", async (req, res) => {
    console.log(`[SERVER] >>> RECEBIDA CHAMADA EM /api/send-audit <<<`);
    const { email, businessName, pdfBase64, formData } = req.body;
    
    // Log de segurança para não perder dados caso o e-mail falhe
    console.log(`[DATA RECOVERY] Dados recebidos para ${businessName}:`, JSON.stringify(formData));
    
    if (!pdfBase64) {
      console.error("[SERVER] Erro: PDF não recebido");
      return res.status(400).json({ error: "PDF não recebido" });
    }

    try {
      const resendClient = getResend();
      console.log(`[SERVER] Enviando e-mail para siqueiracash@gmail.com...`);
      
      const { data, error } = await resendClient.emails.send({
        from: 'Auditoria IA <onboarding@resend.dev>',
        to: ['siqueiracash@gmail.com'],
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
      });

      if (error) {
        console.error('[SERVER] Erro Resend:', JSON.stringify(error));
        let errorMessage = (error as any).message || 'Erro desconhecido no Resend';
        
        // Dica amigável para erros comuns
        if (errorMessage.includes('domain') || (error as any).name === 'validation_error') {
          errorMessage = "Erro de Domínio/Permissão: Verifique se está enviando para o e-mail da conta ou se o domínio está verificado.";
        }

        return res.status(400).json({ 
          error: String(errorMessage),
          details: error
        });
      }
      
      console.log("[SERVER] E-mail enviado com sucesso!");
      res.json({ success: true, data });
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
