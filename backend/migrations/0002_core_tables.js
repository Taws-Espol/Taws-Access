// Tablas núcleo: configuracion (KV editable en runtime), rol y miembro.
const { auditColumns } = require("../migrations-utils/audit");

exports.up = (pgm) => {
  // Configuración editable por el administrador en tiempo de ejecución
  // (p. ej. N horas de RF-ACC-05). Tabla clave-valor normalizada.
  pgm.createTable("configuracion", {
    clave: { type: "text", primaryKey: true },
    valor: { type: "text", notNull: true },
    descripcion: { type: "text" },
    tipo_dato: { type: "text", notNull: true, default: "string" },
    ...auditColumns(pgm),
  });

  // Roles y niveles de acceso (Rol → Miembro 1:N).
  pgm.createTable("rol", {
    id: "id",
    nombre: { type: "text", notNull: true, unique: true },
    descripcion: { type: "text" },
    ...auditColumns(pgm),
  });

  // Miembros del club. Incluye el embedding facial CIFRADO (RF-BIO-07:
  // reversible a nivel de aplicación, nunca se guardan imágenes) y las
  // columnas de presencia en tiempo real (RF-ACC-02).
  pgm.createTable("miembro", {
    id: "id",
    nombre: { type: "text", notNull: true },
    apellido: { type: "text", notNull: true },
    correo: { type: "text", notNull: true, unique: true },
    telefono: { type: "text" },
    rol_id: {
      type: "integer",
      notNull: true,
      references: "rol",
      onDelete: "RESTRICT",
    },
    estado: { type: "estado_miembro", notNull: true, default: "activo" },
    embedding_encriptado: { type: "bytea" },
    fecha_registro: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
    presencia_actual: {
      type: "estado_presencia",
      notNull: true,
      default: "fuera",
    },
    ultimo_evento_at: { type: "timestamptz" },
    ...auditColumns(pgm),
  });
};

exports.down = (pgm) => {
  pgm.dropTable("miembro");
  pgm.dropTable("rol");
  pgm.dropTable("configuracion");
};
