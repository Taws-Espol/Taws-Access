import { Pool, PoolClient } from "pg";
import { pool } from "../config/db";
import { CanalNotificacion, TipoNotificacion } from "../models/enums";

type Executor = Pool | PoolClient;

export interface NuevaNotificacion {
  destinatario_id: number;
  tipo: TipoNotificacion;
  mensaje: string;
  canal?: CanalNotificacion;
}

// Crea una notificación pendiente de envío (el envío real por WhatsApp es del
// módulo RF-NOT). Aquí solo se registra la fila.
export async function insertNotificacion(
  data: NuevaNotificacion,
  executor: Executor = pool,
): Promise<{ id: number }> {
  const { rows } = await executor.query<{ id: number }>(
    `INSERT INTO notificacion (destinatario_id, tipo, mensaje, canal)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [data.destinatario_id, data.tipo, data.mensaje, data.canal ?? "whatsapp"],
  );
  return rows[0];
}

// IDs de los miembros con rol "Directivo" (destinatarios de las alertas).
export async function getDirectivoIds(
  executor: Executor = pool,
): Promise<number[]> {
  const { rows } = await executor.query<{ id: number }>(
    `SELECT m.id
       FROM miembro m
       JOIN rol r ON r.id = m.rol_id
      WHERE r.nombre = 'Directivo' AND m.estado = 'activo'`,
  );
  return rows.map((r) => r.id);
}
