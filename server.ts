import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
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
