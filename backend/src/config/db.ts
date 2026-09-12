import { Pool, PoolClient } from "pg";
import { env } from "./env";

// Conexión mínima con `pg`. La herramienta de migraciones/ORM definitiva se
// decide en la issue #5 (diseño del esquema de base de datos) — este pool
// solo cubre la verificación de conectividad para el setup inicial.
export const pool = new Pool({
  connectionString: env.databaseUrl,
});

// Sin este listener, un error en un cliente inactivo del pool (p. ej. que
// Postgres se reinicie) queda sin capturar y tumba todo el proceso de Node,
// no solo el /health check.
pool.on("error", (err) => {
  console.error("Error inesperado en el pool de PostgreSQL:", err);
});

export async function checkDatabaseConnection(): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    return true;
  } finally {
    client.release();
  }
}

// Ejecuta `fn` dentro de una transacción (BEGIN/COMMIT/ROLLBACK). Se pasa el
// `PoolClient` a los repositorios para que compartan la misma transacción
// (necesario en RF-ACC: insertar evento + actualizar presencia + crear cierre
// deben ser atómicos).
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
