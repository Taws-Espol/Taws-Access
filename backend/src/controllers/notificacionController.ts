import { Request, Response } from "express";
import { env } from "../config/env";
import { actualizarEstadoDesdeWebhook } from "../services/notificacionService";

interface EstadoWebhook {
  id?: string;
  status?: string;
}

interface EntradaWebhook {
  changes?: Array<{ value?: { statuses?: EstadoWebhook[] } }>;
}

export function verificarWebhookWhatsApp(req: Request, res: Response): void {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === env.whatsappWebhookVerifyToken &&
    typeof challenge === "string"
  ) {
    res.status(200).send(challenge);
    return;
  }
  res.sendStatus(403);
}

export async function recibirWebhookWhatsApp(
  req: Request,
  res: Response,
): Promise<void> {
  const body = req.body as { entry?: EntradaWebhook[] };
  const statuses =
    body.entry?.flatMap(
      (entry) =>
        entry.changes?.flatMap((change) => change.value?.statuses ?? []) ?? [],
    ) ?? [];

  for (const status of statuses) {
    if (
      status.id &&
      status.status &&
      ["sent", "delivered", "failed"].includes(status.status)
    ) {
      const estado = status.status === "delivered" ? "entregado" :
        status.status === "failed" ? "fallido" : "enviado";
      await actualizarEstadoDesdeWebhook(status.id, estado);
    }
  }
  res.sendStatus(200);
}