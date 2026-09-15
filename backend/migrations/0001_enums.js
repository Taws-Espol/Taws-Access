// Tipos ENUM nativos de PostgreSQL para los conjuntos de valores fijos del
// sistema (evita repetir "strings mágicos" y tablas catálogo innecesarias).
// Añadir valores nuevos más adelante es un `ALTER TYPE ... ADD VALUE` barato.

exports.up = (pgm) => {
  // Campo de auditoría `status` común a todas las tablas.
  pgm.createType("estado_general", [
    "activo",
    "inactivo",
    "pendiente",
    "enviado",
    "entregado",
    "fallido",
  ]);
  // Estado funcional del miembro (distinto del `status` de auditoría).
  pgm.createType("estado_miembro", ["activo", "inactivo", "suspendido"]);
  // Presencia en tiempo real dentro del local (RF-ACC-02).
  pgm.createType("estado_presencia", ["dentro", "fuera"]);
  // Tipo y modalidad de cada evento de acceso (RF-ACC-01).
  pgm.createType("tipo_evento_acceso", ["ingreso", "salida"]);
  pgm.createType("modalidad_acceso", ["facial", "manual"]);
  // Tipos de incidencia predefinidos (RF-INC-04).
  pgm.createType("tipo_incidencia", [
    "local_sucio",
    "equipo_encendido",
    "dano_material",
    "acceso_no_autorizado",
  ]);
  // Estado de las multas.
  pgm.createType("estado_multa", ["pendiente", "pagada", "anulada", "vencida"]);
  // Canales y tipos de notificación.
  pgm.createType("canal_notificacion", ["whatsapp", "email", "sistema"]);
  pgm.createType("tipo_notificacion", [
    "incidencia",
    "multa",
    "limpieza",
    "acceso",
    "apelacion",
    "general",
  ]);
};

exports.down = (pgm) => {
  pgm.dropType("tipo_notificacion");
  pgm.dropType("canal_notificacion");
  pgm.dropType("estado_multa");
  pgm.dropType("tipo_incidencia");
  pgm.dropType("modalidad_acceso");
  pgm.dropType("tipo_evento_acceso");
  pgm.dropType("estado_presencia");
  pgm.dropType("estado_miembro");
  pgm.dropType("estado_general");
};
