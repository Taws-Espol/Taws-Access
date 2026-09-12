import { Pool, PoolClient } from "pg";
import { pool } from "../config/db";
import { EstadoPresencia, TipoEventoAcceso } from "../models/enums";
import { MiembroPresente } from "../models/miembro";

type Executor = Pool | PoolClient;

// Deriva la presencia a partir del tipo de evento.
export function presenciaDesdeEvento(tipo: TipoEventoAcceso): EstadoPresencia {
  return tipo === "ingreso" ? "dentro" : "fuera";
}

// Presencia actual del miembro, o `null` si no existe. Sirve para validar en un
// solo query tanto la existencia como el estado previo antes de aceptar un
// evento de acceso (evita salidas/ingresos fuera de orden; ver RF-ACC-03).
export async function getPresencia(
  miembroId: number,
  executor: Executor = pool,
): Promise<EstadoPresencia | null> {
  const { rows } = await executor.query<{ presencia_actual: EstadoPresencia }>(
    `SELECT presencia_actual FROM miembro WHERE id = $1`,
    [miembroId],
  );
  return rows.length > 0 ? rows[0].presencia_actual : null;
}

// Actualiza el cache de presencia y la marca de tiempo del último evento
// (RF-ACC-02). Se llama dentro de la misma transacción del evento.
export async function setPresencia(
  miembroId: number,
  presencia: EstadoPresencia,
  ultimoEventoAt: string,
  executor: Executor = pool,
): Promise<void> {
  await executor.query(
    `UPDATE miembro
       SET presencia_actual = $2, ultimo_evento_at = $3, updated_at = now()
     WHERE id = $1`,
    [miembroId, presencia, ultimoEventoAt],
  );
}

// Lista los miembros actualmente dentro del local (RF-ACC-04).
export async function getMiembrosDentro(
  executor: Executor = pool,
): Promise<MiembroPresente[]> {
  const { rows } = await executor.query<MiembroPresente>(
    `SELECT id, nombre, apellido, ultimo_evento_at
       FROM miembro
      WHERE presencia_actual = 'dentro'
      ORDER BY ultimo_evento_at ASC`,
  );
  return rows;
}

// Miembros que llevan dentro más tiempo del umbral (RF-ACC-05): su último
// evento fue antes de `limite`.
export async function getMiembrosDentroDesdeAntesDe(
  limite: string,
  executor: Executor = pool,
): Promise<MiembroPresente[]> {
  const { rows } = await executor.query<MiembroPresente>(
    `SELECT id, nombre, apellido, ultimo_evento_at
       FROM miembro
      WHERE presencia_actual = 'dentro'
        AND ultimo_evento_at IS NOT NULL
        AND ultimo_evento_at < $1
      ORDER BY ultimo_evento_at ASC`,
    [limite],
  );
  return rows;
}
