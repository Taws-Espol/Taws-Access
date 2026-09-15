// Uniones de literales espejo de los tipos ENUM nativos de PostgreSQL
// (ver backend/migrations/0001_enums.js).

export type EstadoGeneral = "activo" | "inactivo";
export type EstadoMiembro = "activo" | "inactivo" | "suspendido";
export type EstadoPresencia = "dentro" | "fuera";
export type TipoEventoAcceso = "ingreso" | "salida";
export type ModalidadAcceso = "facial" | "manual";
export type TipoIncidencia =
  | "local_sucio"
  | "equipo_encendido"
  | "dano_material"
  | "acceso_no_autorizado";
export type EstadoMulta = "pendiente" | "pagada" | "anulada" | "vencida";
export type CanalNotificacion = "whatsapp" | "email" | "sistema";
export type EstadoNotificacion =
  | "pendiente"
  | "enviado"
  | "entregado"
  | "fallido";
export type TipoNotificacion =
  | "incidencia"
  | "multa"
  | "limpieza"
  | "acceso"
  | "apelacion"
  | "general";
