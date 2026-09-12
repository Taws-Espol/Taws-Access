import { Router } from "express";
import {
  getPresencia,
  getUltimoCierre,
  postEvento,
  postVerificarPermanencia,
} from "../controllers/accesoController";

// Rutas del módulo de Control de Acceso (RF-ACC).
// TODO(#6): proteger con middleware de auth/roles cuando exista el módulo de
// autenticación. Los endpoints de consulta/cierre son para Directivos.
const router = Router();

router.post("/eventos", postEvento);
router.get("/presencia", getPresencia);
router.get("/cierre/ultimo", getUltimoCierre);
router.post("/permanencia/verificar", postVerificarPermanencia);

export default router;
