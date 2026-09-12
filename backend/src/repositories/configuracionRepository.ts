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

// Upsert de un valor de configuración (RF-ACC-05: N editable por el admin).
export async function setConfig(
  clave: string,
  valor: string,
  executor: Executor = pool,
): Promise<Configuracion> {
  const { rows } = await executor.query<Configuracion>(
    `INSERT INTO configuracion (clave, valor)
     VALUES ($1, $2)
     ON CONFLICT (clave)
       DO UPDATE SET valor = EXCLUDED.valor, updated_at = now()
     RETURNING clave, valor, descripcion, tipo_dato`,
    [clave, valor],
  );
  return rows[0];
}
