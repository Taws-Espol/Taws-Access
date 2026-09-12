import { Router } from "express";
import { getConfig, putConfig } from "../controllers/configuracionController";

// TODO(#6): PUT debe restringirse al rol Administrador cuando exista auth.
const router = Router();

router.get("/:clave", getConfig);
router.put("/:clave", putConfig);

export default router;
