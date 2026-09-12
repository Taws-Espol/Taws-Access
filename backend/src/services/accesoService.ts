import { withTransaction } from "../config/db";
import { EventoAcceso, NuevoEventoAcceso } from "../models/eventoAcceso";
import { CierreLocalConResponsables } from "../models/cierreLocal";
import { MiembroPresente } from "../models/miembro";
import * as eventoRepo from "../repositories/eventoAccesoRepository";
import * as miembroRepo from "../repositories/miembroRepository";
import * as cierreRepo from "../repositories/cierreLocalRepository";
import * as configRepo from "../repositories/configuracionRepository";
import * as notiRepo from "../repositories/notificacionRepository";

// Clave arbitraria pero estable para el advisory lock del "local" (un solo
// local). Serializa la sección crítica de salida/cierre entre transacciones
// concurrentes (RNF-REN-02) para no crear cierres duplicados.
const LOCK_LOCAL = 424242;

export const CLAVE_HORAS_MAX_DENTRO = "acceso.horas_max_dentro";
const HORAS_MAX_DEFAULT = 8;

export class MiembroNoEncontradoError extends Error {}

export interface ResultadoEvento {
  evento: EventoAcceso;
  cierreGenerado: boolean;
}

// RF-ACC-01/02/03: registra el evento, actualiza la presencia y, si es la
// última salida, crea el cierre del local. Todo en una sola transacción.
export async function registrarEvento(
  data: NuevoEventoAcceso,
): Promise<ResultadoEvento> {
  return withTransaction(async (client) => {
    // Serializa la decisión de "último en salir" frente a otras salidas.
    await client.query("SELECT pg_advisory_xact_lock($1)", [LOCK_LOCAL]);

    if (!(await miembroRepo.existeMiembro(data.miembro_id, client))) {
      throw new MiembroNoEncontradoError(
        `No existe el miembro con id ${data.miembro_id}.`,
      );
    }

    const evento = await eventoRepo.insertEvento(data, client);
    const presencia = miembroRepo.presenciaDesdeEvento(evento.tipo);
    await miembroRepo.setPresencia(
      evento.miembro_id,
      presencia,
      evento.hora_ingreso,
      client,
    );

    let cierreGenerado = false;
    // Si fue una salida y ya no queda nadie dentro, este miembro es el
    // responsable de cierre (RF-ACC-03).
    if (evento.tipo === "salida") {
      const dentro = await eventoRepo.countMiembrosDentro(client);
      if (dentro === 0) {
        const cierre = await cierreRepo.createCierre(
          evento.id,
          data.evidencia_cierre_url ?? null,
          client,
        );
        await cierreRepo.addResponsables(cierre.id, [evento.miembro_id], client);
        cierreGenerado = true;
      }
    }

    return { evento, cierreGenerado };
  });
}

// RF-ACC-04: quiénes están dentro del local ahora mismo.
export async function getPresenciaActual(): Promise<MiembroPresente[]> {
  return miembroRepo.getMiembrosDentro();
}

// Handoff a RF-INC-02: último cierre con responsables.
export async function getUltimoCierre(): Promise<CierreLocalConResponsables | null> {
  return cierreRepo.getUltimoCierre();
}

async function getHorasMax(): Promise<number> {
  const cfg = await configRepo.getConfig(CLAVE_HORAS_MAX_DENTRO);
  const n = cfg ? Number(cfg.valor) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : HORAS_MAX_DEFAULT;
}

export interface ResultadoPermanencia {
  horasMax: number;
  alertados: MiembroPresente[];
}

// RF-ACC-05: detecta miembros dentro por más de N horas y genera una
// notificación a cada directivo por cada miembro excedido.
export async function verificarPermanenciaExcedida(): Promise<ResultadoPermanencia> {
  const horasMax = await getHorasMax();
  const limite = new Date(Date.now() - horasMax * 3600_000).toISOString();
  const excedidos = await miembroRepo.getMiembrosDentroDesdeAntesDe(limite);

  if (excedidos.length > 0) {
    const directivos = await notiRepo.getDirectivoIds();
    for (const miembro of excedidos) {
      for (const directivoId of directivos) {
        await notiRepo.insertNotificacion({
          destinatario_id: directivoId,
          tipo: "acceso",
          mensaje: `El miembro ${miembro.nombre} ${miembro.apellido} lleva más de ${horasMax} h dentro del local sin registrar salida.`,
        });
      }
    }
  }

  return { horasMax, alertados: excedidos };
}
