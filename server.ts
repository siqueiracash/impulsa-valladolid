import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from 'resend';
import cors from 'cors';

const PORT = 3000;

async function startServer() {
  console.log("[SERVER] Iniciando servidor Express + Vite...");
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
    console.log(`[SERVER] RESEND_API_KEY encontrada (empieza por: ${key.substring(0, 4)}...)`);
    if (!resend) {
      resend = new Resend(key);
    }
    return resend;
  };

  // API Routes PRIMERO y con prioridad
  app.post("/api/send-audit", async (req, res) => {
    console.log(`[API] >>> PETICIÓN POST RECIBIDA EN /api/send-audit <<<`);
    const { email, businessName, pdfBase64 } = req.body;
    
    if (!pdfBase64) {
      console.error("[API] Error: No se recibió el PDF");
      return res.status(400).json({ error: "No se recibió el archivo PDF" });
    }

    console.log(`[API] Procesando auditoría para: ${businessName}`);
    
    try {
      const resendClient = getResend();
      console.log("[API] Enviando a Resend...");
      const { data, error } = await resendClient.emails.send({
        from: 'Auditoria IA <onboarding@resend.dev>',
        to: ['siqueiracash@gmail.com'],
        subject: `Nueva Auditoría Generada: ${businessName}`,
        html: `
          <h1>Nueva Auditoría de Marketing Digital</h1>
          <p><strong>Establecimiento:</strong> ${businessName}</p>
          <p><strong>Correo del Cliente:</strong> ${email}</p>
          <p>Informe adjunto.</p>
        `,
        attachments: [{
          filename: `Auditoria_${businessName.replace(/\s+/g, '_')}.pdf`,
          content: pdfBase64,
        }],
      });

      if (error) {
        console.error('[API] Error de Resend:', error);
        return res.status(400).json({ error: error.message });
      }
      
      console.log("[API] Correo enviado con éxito a Resend");
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
