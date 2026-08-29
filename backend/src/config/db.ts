import { Pool } from "pg";
import { env } from "./env";

// Conexión mínima con `pg`. La herramienta de migraciones/ORM definitiva se
// decide en la issue #5 (diseño del esquema de base de datos) — este pool
// solo cubre la verificación de conectividad para el setup inicial.
export const pool = new Pool({
  connectionString: env.databaseUrl,
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
