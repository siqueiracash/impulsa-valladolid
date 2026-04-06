import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from 'resend';
import cors from 'cors';

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(cors());

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

    try {
      const resendClient = getResend();
      
      const { data, error } = await resendClient.emails.send({
        from: 'Auditoria IA <onboarding@resend.dev>',
        to: ['siqueiracash@gmail.com'], // Destinatário fixo para o teste
        subject: `Nova Auditoria Gerada: ${businessName}`,
        html: `
          <h1>Nova Auditoria de Marketing Digital</h1>
          <p><strong>Estabelecimento:</strong> ${businessName}</p>
          <p><strong>E-mail do Cliente:</strong> ${email}</p>
          <p>Uma nova auditoria foi gerada pelo sistema. O relatório detalhado em PDF está em anexo.</p>
        `,
        attachments: [
          {
            filename: `Auditoria_${businessName.replace(/\s+/g, '_')}.pdf`,
            content: pdfBase64,
          },
        ],
      });

      if (error) {
        console.error('Erro no Resend:', error);
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true, data });
    } catch (err: any) {
      console.error('Erro ao enviar e-mail:', err);
      res.status(500).json({ error: err.message || 'Erro interno ao enviar e-mail' });
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
