import express, { Express } from "express";
import cors from "cors";
import path from "path";
import { env } from "./config/env";
import { getHealth } from "./controllers/healthController";
import { errorHandler } from "./middlewares/errorHandler";

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.frontendUrl }));
  app.use(express.json());

  app.get("/health", getHealth);

  // 2-step build (ERS 7.2): en producción, Express sirve el build estático
  // del frontend (frontend/dist) para no requerir un servidor aparte.
  // No falla si la carpeta todavía no existe (frontend/ sigue en setup).
  const frontendDist = path.resolve(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/health")) {
      next();
      return;
    }
    res.sendFile(path.join(frontendDist, "index.html"), (err) => {
      if (err) next();
    });
  });

  app.use(errorHandler);

  return app;
}
