import { Pool, PoolClient } from "pg";
import { pool } from "../config/db";
import { EventoAcceso, NuevoEventoAcceso } from "../models/eventoAcceso";

type Executor = Pool | PoolClient;

// Inserta un evento de acceso (RF-ACC-01).
export async function insertEvento(
  data: NuevoEventoAcceso,
  executor: Executor = pool,
): Promise<EventoAcceso> {
  const { rows } = await executor.query<EventoAcceso>(
    `INSERT INTO evento_acceso (miembro_id, tipo, modalidad, confianza_facial)
     VALUES ($1, $2, $3, $4)
     RETURNING id, miembro_id, tipo, modalidad, hora_ingreso, confianza_facial`,
    [data.miembro_id, data.tipo, data.modalidad, data.confianza_facial ?? null],
  );
  return rows[0];
}

// Cuenta cuántos miembros están actualmente dentro del local (RF-ACC-02/03).
export async function countMiembrosDentro(
  executor: Executor = pool,
): Promise<number> {
  const { rows } = await executor.query<{ total: string }>(
    `SELECT COUNT(*)::int AS total FROM miembro WHERE presencia_actual = 'dentro'`,
  );
  return Number(rows[0].total);
}
