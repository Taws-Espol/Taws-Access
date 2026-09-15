import { Pool, PoolClient } from "pg";
import { pool } from "../config/db";
import {
  CanalNotificacion,
  EstadoNotificacion,
  TipoNotificacion,
} from "../models/enums";

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
    `INSERT INTO notificacion (destinatario_id, tipo, mensaje, canal, status)
     VALUES ($1, $2, $3, $4, 'pendiente')
     RETURNING id`,
    [data.destinatario_id, data.tipo, data.mensaje, data.canal ?? "whatsapp"],
  );
  return rows[0];
}

export async function getTelefonoDestinatario(
  notificacionId: number,
  executor: Executor = pool,
): Promise<string | null> {
  const { rows } = await executor.query<{ telefono: string | null }>(
    `SELECT m.telefono
       FROM notificacion n
       JOIN miembro m ON m.id = n.destinatario_id
      WHERE n.id = $1`,
    [notificacionId],
  );
  return rows[0]?.telefono ?? null;
}

export async function actualizarEstado(
  id: number,
  estado: EstadoNotificacion,
  intentos: number,
  executor: Executor = pool,
): Promise<void> {
  await executor.query(
    `UPDATE notificacion
        SET status = $2::estado_general,
            intentos = $3,
            timestamp_envio = CASE
              WHEN $2::estado_general = 'enviado' THEN COALESCE(timestamp_envio, now())
              ELSE timestamp_envio
            END,
            updated_at = now()
      WHERE id = $1`,
    [id, estado, intentos],
  );
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
