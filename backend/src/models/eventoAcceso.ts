import { ModalidadAcceso, TipoEventoAcceso } from "./enums";

export interface EventoAcceso {
  id: number;
  miembro_id: number;
  tipo: TipoEventoAcceso;
  modalidad: ModalidadAcceso;
  hora_ingreso: string;
  confianza_facial: number | null;
}

// Datos de entrada para registrar un evento de acceso (RF-ACC-01).
export interface NuevoEventoAcceso {
  miembro_id: number;
  tipo: TipoEventoAcceso;
  modalidad: ModalidadAcceso;
  confianza_facial?: number | null;
  // URL de la foto de cierre, solo relevante si este evento resulta ser el
  // último en salir (RF-ACC-03).
  evidencia_cierre_url?: string | null;
}
