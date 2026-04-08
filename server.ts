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
    if (!key) {
      console.error("[SERVER] Error: RESEND_API_KEY no encontrada en process.env");
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    if (!resend) {
      resend = new Resend(key);
    }
    return resend;
  };

  // API Routes
  app.post("/submit-report-now", async (req, res) => {
    console.log(`[SERVER] >>> PETIÇÃO POST RECEBIDA EM /submit-report-now <<<`);
    const { email, businessName, pdfBase64, formData } = req.body;
    
    if (!pdfBase64) {
      console.error("[API] Error: No se recibió el PDF");
      return res.status(400).json({ error: "No se recibió el archivo PDF" });
    }

    console.log(`[API] Procesando auditoría para: ${businessName}`);
    
    try {
      const resendClient = getResend();
      
      // Enviar correo al administrador (tú)
      console.log(`[API] Enviando e-mail para siqueiracash@gmail.com via auditoria@impulsavalladolid.es...`);
      const { data, error } = await resendClient.emails.send({
        from: 'Auditoria IA <auditoria@impulsavalladolid.es>',
        to: ['siqueiracash@gmail.com'],
        subject: `Nueva Auditoría: ${businessName}`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background: #ef4444; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Impulsa Valladolid</h1>
            </div>
            <div style="padding: 30px;">
              <h2 style="color: #111; margin-top: 0;">Nueva Auditoría Generada</h2>
              <p>Se ha generado un nuevo informe estratégico para un cliente potencial.</p>
              
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Establecimiento:</strong> ${businessName}</p>
                <p style="margin: 5px 0;"><strong>Tipo de Negocio:</strong> ${formData?.businessType || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Ubicación:</strong> ${formData?.location || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>WhatsApp:</strong> <a href="https://wa.me/${formData?.whatsapp?.replace(/\D/g, '')}" style="color: #ef4444; font-weight: bold;">${formData?.whatsapp || 'N/A'}</a></p>
                <p style="margin: 5px 0;"><strong>Email del Cliente:</strong> ${email}</p>
              </div>
              
              <p>El informe técnico detallado se encuentra adjunto en formato PDF para su revisión.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                <p>Este es un mensaje automático generado por el sistema de Auditoría IA de Impulsa Valladolid.</p>
              </div>
            </div>
          </div>
        `,
        attachments: [{
          filename: `Auditoria_${businessName.replace(/\s+/g, '_')}.pdf`,
          content: pdfBase64,
        }],
      });

      if (error) {
        console.error('[API] Erro retornado pelo Resend:', error);
        return res.status(400).json({ error: error.message });
      }
      
      console.log("[API] E-mail enviado com sucesso! Verifique a caixa de entrada de siqueiracash@gmail.com");
      res.json({ success: true, data });
    } catch (err: any) {
      console.error('[API] Error interno capturado:', err);
      res.status(500).json({ error: err.message || 'Error interno del servidor' });
    }
  });

  app.get("/api/test", (req, res) => {
    res.json({ message: "API funcionando correctamente" });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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
