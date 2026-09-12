import { EstadoMiembro, EstadoPresencia } from "./enums";

export interface Miembro {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
  rol_id: number;
  estado: EstadoMiembro;
  presencia_actual: EstadoPresencia;
  ultimo_evento_at: string | null;
  // Marca de la última alerta de permanencia excedida (RF-ACC-05); se reinicia
  // en cada nuevo evento de acceso para deduplicar notificaciones por estadía.
  alerta_permanencia_at: string | null;
  fecha_registro: string;
}

// Vista reducida de un miembro presente dentro del local (RF-ACC-04).
export interface MiembroPresente {
  id: number;
  nombre: string;
  apellido: string;
  ultimo_evento_at: string | null;
}
