import { Pool, PoolClient } from "pg";
import { pool } from "../config/db";
import { Configuracion } from "../models/configuracion";

type Executor = Pool | PoolClient;

export async function getConfig(
  clave: string,
  executor: Executor = pool,
): Promise<Configuracion | null> {
  const { rows } = await executor.query<Configuracion>(
    `SELECT clave, valor, descripcion, tipo_dato
       FROM configuracion
      WHERE clave = $1`,
    [clave],
  );
  return rows[0] ?? null;
}

// Actualiza el valor de una clave EXISTENTE (RF-ACC-05: N editable por el
// admin). Es un UPDATE, no un upsert: las claves se crean por seed/migración,
// nunca desde la API. Devuelve `null` si la clave no existe (el UPDATE no toca
// filas), lo que permite responder 404 sin un SELECT previo (evita TOCTOU).
export async function setConfig(
  clave: string,
  valor: string,
  executor: Executor = pool,
): Promise<Configuracion | null> {
  const { rows } = await executor.query<Configuracion>(
    `UPDATE configuracion
        SET valor = $2, updated_at = now()
      WHERE clave = $1
      RETURNING clave, valor, descripcion, tipo_dato`,
    [clave, valor],
  );
  return rows[0] ?? null;
}
