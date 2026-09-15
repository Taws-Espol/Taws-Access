import { env } from "../config/env";
import { CanalNotificacion, TipoNotificacion } from "../models/enums";
import * as notificacionRepo from "../repositories/notificacionRepository";

const MAX_INTENTOS = 3;
const INTERVALO_REINTENTO_MS = 5 * 60_000;
const mensajesPorProveedor = new Map<
  string,
  {
    id: number;
    mensaje: string;
    intentos: number;
    plantilla?: ConfiguracionPlantilla;
  }
>();

export interface DatosNotificacion {
  destinatario_id: number;
  tipo: TipoNotificacion;
  mensaje: string;
  canal?: CanalNotificacion;
  plantilla?: {
    nombre: string;
    idioma?: string;
    parametros?: string[];
  };
}

type ConfiguracionPlantilla = DatosNotificacion["plantilla"];

export async function enviarNotificacion(
  data: DatosNotificacion,
): Promise<{ id: number; estado: "enviado" | "fallido" }> {
  const notificacion = await notificacionRepo.insertNotificacion(data);
  return enviarRegistro(notificacion.id, data.mensaje, 0, data.plantilla);
}

async function enviarRegistro(
  id: number,
  mensaje: string,
  intentosPrevios: number,
  plantilla?: ConfiguracionPlantilla,
): Promise<{ id: number; estado: "enviado" | "fallido" }> {
  const intento = intentosPrevios + 1;
  const telefono = await notificacionRepo.getTelefonoDestinatario(id);

  if (!telefono) {
    await marcarFallido(id, mensaje, intento, plantilla);
    return { id, estado: "fallido" };
  }

  try {
    const proveedorId = await enviarPorWhatsApp(telefono, mensaje, plantilla);
    mensajesPorProveedor.set(proveedorId, {
      id,
      mensaje,
      intentos: intento,
      plantilla,
    });
    await notificacionRepo.actualizarEstado(id, "enviado", intento);
    return { id, estado: "enviado" };
  } catch (error) {
    console.error(`Error enviando la notificación ${id} por WhatsApp:`, error);
    await marcarFallido(id, mensaje, intento, plantilla);
    return { id, estado: "fallido" };
  }
}

async function enviarPorWhatsApp(
  telefono: string,
  mensaje: string,
  plantilla?: ConfiguracionPlantilla,
): Promise<string> {
  if (!env.whatsappApiToken || !env.whatsappPhoneNumberId) {
    throw new Error("Faltan WHATSAPP_API_TOKEN o WHATSAPP_PHONE_NUMBER_ID.");
  }

  const response = await fetch(
    `https://graph.facebook.com/${env.whatsappApiVersion}/${env.whatsappPhoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.whatsappApiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(crearPayload(telefono, mensaje, plantilla)),
    },
  );

  if (!response.ok) {
    const detalle = await response.text();
    throw new Error(
      `WhatsApp Business API respondió ${response.status}: ${detalle}`,
    );
  }

  const payload = (await response.json()) as {
    messages?: Array<{ id?: string }>;
  };
  const proveedorId = payload.messages?.[0]?.id;
  if (!proveedorId) {
    throw new Error("WhatsApp Business API no devolvió el identificador del mensaje.");
  }
  return proveedorId;
}

function crearPayload(
  telefono: string,
  mensaje: string,
  plantilla?: ConfiguracionPlantilla,
): Record<string, unknown> {
  if (!plantilla) {
    return {
      messaging_product: "whatsapp",
      to: telefono,
      type: "text",
      text: { body: mensaje },
    };
  }

  const parametros = plantilla.parametros ?? [];
  return {
    messaging_product: "whatsapp",
    to: telefono,
    type: "template",
    template: {
      name: plantilla.nombre,
      language: { code: plantilla.idioma ?? "en_US" },
      ...(parametros.length > 0
        ? {
            components: [
              {
                type: "body",
                parameters: parametros.map((text) => ({ type: "text", text })),
              },
            ],
          }
        : {}),
    },
  };
}

async function marcarFallido(
  id: number,
  mensaje: string,
  intentos: number,
  plantilla?: ConfiguracionPlantilla,
): Promise<void> {
  await notificacionRepo.actualizarEstado(id, "fallido", intentos);
  if (intentos < MAX_INTENTOS) {
    setTimeout(() => {
      enviarRegistro(id, mensaje, intentos, plantilla).catch((error) => {
        console.error("Error en reintento de notificación:", error);
      });
    }, INTERVALO_REINTENTO_MS);
  }
}

export async function actualizarEstadoDesdeWebhook(
  proveedorId: string,
  estado: "enviado" | "entregado" | "fallido",
): Promise<void> {
  const notificacion = mensajesPorProveedor.get(proveedorId);
  if (!notificacion) return;

  await notificacionRepo.actualizarEstado(
    notificacion.id,
    estado,
    notificacion.intentos,
  );
  if (estado === "fallido" && notificacion.intentos < MAX_INTENTOS) {
    setTimeout(() => {
      enviarRegistro(
        notificacion.id,
        notificacion.mensaje,
        notificacion.intentos,
        notificacion.plantilla,
      ).catch((error) => {
        console.error("Error en reintento de notificación:", error);
      });
    }, INTERVALO_REINTENTO_MS);
  }
}