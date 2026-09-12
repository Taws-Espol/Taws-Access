import { Pool, PoolClient } from "pg";
import { pool } from "../config/db";
import { CierreLocal, CierreLocalConResponsables } from "../models/cierreLocal";

type Executor = Pool | PoolClient;

// Crea el registro de cierre del local (RF-ACC-03).
export async function createCierre(
  eventoAccesoId: number,
  evidenciaUrl: string | null,
  executor: Executor = pool,
): Promise<CierreLocal> {
  const { rows } = await executor.query<CierreLocal>(
    `INSERT INTO cierre_local (evento_acceso_id, evidencia_url)
     VALUES ($1, $2)
     RETURNING id, fecha_cierre, evento_acceso_id, evidencia_url`,
    [eventoAccesoId, evidenciaUrl],
  );
  return rows[0];
}

// Marca a los responsables del cierre (soporta uno o varios: RF-INC-01).
export async function addResponsables(
  cierreId: number,
  miembroIds: number[],
  executor: Executor = pool,
): Promise<void> {
  if (miembroIds.length === 0) return;
  const values = miembroIds
    .map((_, i) => `($1, $${i + 2})`)
    .join(", ");
  await executor.query(
    `INSERT INTO cierre_responsable (cierre_id, miembro_id)
     VALUES ${values}
     ON CONFLICT (cierre_id, miembro_id) DO NOTHING`,
    [cierreId, ...miembroIds],
  );
}

// Devuelve el último cierre con sus responsables (handoff a RF-INC-02).
export async function getUltimoCierre(
  executor: Executor = pool,
): Promise<CierreLocalConResponsables | null> {
  const { rows } = await executor.query<CierreLocal>(
    `SELECT id, fecha_cierre, evento_acceso_id, evidencia_url
       FROM cierre_local
      ORDER BY fecha_cierre DESC
      LIMIT 1`,
  );
  if (rows.length === 0) return null;
  const cierre = rows[0];

  const { rows: responsables } = await executor.query(
    `SELECT cr.miembro_id, m.nombre, m.apellido
       FROM cierre_responsable cr
       JOIN miembro m ON m.id = cr.miembro_id
      WHERE cr.cierre_id = $1
      ORDER BY cr.miembro_id`,
    [cierre.id],
  );

  return { ...cierre, responsables };
}
