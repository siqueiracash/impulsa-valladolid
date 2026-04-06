import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from 'resend';
import cors from 'cors';

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(cors());

  // API Route to check server health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Servidor activo" });
  });

  // Initialize Resend (Lazy)
  let resend: Resend | null = null;
  const getResend = () => {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    if (!resend) {
      resend = new Resend(key);
    }
    return resend;
  };

  // API Route to send audit email
  app.post("/api/send-audit", async (req, res) => {
    const { email, businessName, pdfBase64 } = req.body;
    console.log(`[API] Recibida solicitud de correo electrónico para: ${businessName} (${email})`);

    try {
      const resendClient = getResend();
      console.log(`[API] Enviando correo electrónico vía Resend a siqueiracash@gmail.com...`);
      
      const { data, error } = await resendClient.emails.send({
        from: 'Auditoria IA <onboarding@resend.dev>',
        to: ['siqueiracash@gmail.com'], // Destinatário fixo para o teste
        subject: `Nueva Auditoría Generada: ${businessName}`,
        html: `
          <h1>Nueva Auditoría de Marketing Digital</h1>
          <p><strong>Establecimiento:</strong> ${businessName}</p>
          <p><strong>Correo del Cliente:</strong> ${email}</p>
          <p>Una nueva auditoría ha sido generada por el sistema. El informe detallado en PDF está adjunto.</p>
        `,
        attachments: [
          {
            filename: `Auditoría_${businessName.replace(/\s+/g, '_')}.pdf`,
            content: pdfBase64,
          },
        ],
      });

      if (error) {
        console.error('Error en Resend:', error);
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true, data });
    } catch (err: any) {
      console.error('Error al enviar correo electrónico:', err);
      res.status(500).json({ error: err.message || 'Error interno al enviar correo electrónico' });
    }
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
