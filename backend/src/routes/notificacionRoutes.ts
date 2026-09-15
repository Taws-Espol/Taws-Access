import { Router } from "express";
import {
  recibirWebhookWhatsApp,
  verificarWebhookWhatsApp,
} from "../controllers/notificacionController";

const router = Router();

router.get("/whatsapp/webhook", verificarWebhookWhatsApp);
router.post("/whatsapp/webhook", recibirWebhookWhatsApp);

export default router;