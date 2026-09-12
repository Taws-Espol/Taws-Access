import { Request, Response } from "express";
import { ModalidadAcceso, TipoEventoAcceso } from "../models/enums";
import * as accesoService from "../services/accesoService";

const TIPOS_VALIDOS: TipoEventoAcceso[] = ["ingreso", "salida"];
const MODALIDADES_VALIDAS: ModalidadAcceso[] = ["facial", "manual"];

// POST /api/acceso/eventos — RF-ACC-01/02/03
export async function postEvento(req: Request, res: Response): Promise<void> {
  const { miembro_id, tipo, modalidad, confianza_facial, evidencia_cierre_url } =
    req.body ?? {};

  if (!Number.isInteger(miembro_id)) {
    res.status(400).json({ error: "miembro_id (entero) es requerido." });
    return;
  }
  if (!TIPOS_VALIDOS.includes(tipo)) {
    res.status(400).json({ error: "tipo debe ser 'ingreso' o 'salida'." });
    return;
  }
  if (!MODALIDADES_VALIDAS.includes(modalidad)) {
    res.status(400).json({ error: "modalidad debe ser 'facial' o 'manual'." });
    return;
  }

  try {
    const resultado = await accesoService.registrarEvento({
      miembro_id,
      tipo,
      modalidad,
      confianza_facial: confianza_facial ?? null,
      evidencia_cierre_url: evidencia_cierre_url ?? null,
    });
    res.status(201).json(resultado);
  } catch (err) {
    if (err instanceof accesoService.MiembroNoEncontradoError) {
      res.status(404).json({ error: err.message });
      return;
    }
    if (err instanceof accesoService.EventoInconsistenteError) {
      res.status(409).json({ error: err.message });
      return;
    }
    console.error("Error registrando evento de acceso:", err);
    res.status(500).json({ error: "Error registrando el evento de acceso." });
  }
}

// GET /api/acceso/presencia — RF-ACC-04
export async function getPresencia(_req: Request, res: Response): Promise<void> {
  const dentro = await accesoService.getPresenciaActual();
  res.status(200).json({ total: dentro.length, miembros: dentro });
}

// GET /api/acceso/cierre/ultimo — handoff a RF-INC-02
export async function getUltimoCierre(
  _req: Request,
  res: Response,
): Promise<void> {
  const cierre = await accesoService.getUltimoCierre();
  if (!cierre) {
    res.status(404).json({ error: "Aún no hay cierres registrados." });
    return;
  }
  res.status(200).json(cierre);
}

// POST /api/acceso/permanencia/verificar — RF-ACC-05
export async function postVerificarPermanencia(
  _req: Request,
  res: Response,
): Promise<void> {
  const resultado = await accesoService.verificarPermanenciaExcedida();
  res.status(200).json(resultado);
}
