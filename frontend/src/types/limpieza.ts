// Tipos del módulo de Registro de Limpieza (RF-LIM, issue #9).
// Reflejan la entidad JornadaLimpieza de la sección 6.1 del ERS; los campos de
// auditoría (status, created_at, ...) se omiten porque el frontend no los usa.

export interface JornadaLimpieza {
  id: number;
  encargado_id: number;
  inicio_timestamp: string;
  fin_timestamp: string | null;
  observaciones: string | null;
  evidencia_url: string | null;
}

// Jornada tal como se muestra en el historial (RF-LIM-04): incluye el nombre
// del encargado, que el backend obtendrá con un JOIN a `miembro`.
export interface JornadaLimpiezaHistorial extends JornadaLimpieza {
  encargado_nombre: string;
}

export interface Encargado {
  id: number;
  nombre: string;
}

// Datos que envía un miembro asignado al registrar su jornada (RF-LIM-02).
export interface NuevaJornadaLimpieza {
  inicio_timestamp: string;
  fin_timestamp: string;
  observaciones: string | null;
  foto: File;
}

// Filtros del historial (RF-LIM-04). Las fechas van en formato YYYY-MM-DD.
export interface FiltrosHistorialLimpieza {
  desde?: string;
  hasta?: string;
  encargadoId?: number;
}
