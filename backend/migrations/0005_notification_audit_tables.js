// Notificaciones (RF-NOT) y bitácora de auditoría (RF-AUD).
const { auditColumns } = require("../migrations-utils/audit");

exports.up = (pgm) => {
  // Notificaciones enviadas a los miembros (Miembro → Notificacion 1:N).
  pgm.createTable("notificacion", {
    id: "id",
    destinatario_id: {
      type: "integer",
      notNull: true,
      references: "miembro",
      onDelete: "CASCADE",
    },
    tipo: { type: "tipo_notificacion", notNull: true },
    mensaje: { type: "text", notNull: true },
    canal: { type: "canal_notificacion", notNull: true, default: "whatsapp" },
    timestamp_envio: { type: "timestamptz" },
    intentos: { type: "integer", notNull: true, default: 0 },
    ...auditColumns(pgm),
  });

  // Registro histórico de acciones de usuarios para auditoría/trazabilidad.
  // `usuario_id` es SET NULL para no perder el registro si se borra el usuario.
  pgm.createTable("bitacora_auditoria", {
    id: "id",
    usuario_id: {
      type: "integer",
      references: "miembro",
      onDelete: "SET NULL",
    },
    accion: { type: "text", notNull: true },
    tabla_afectada: { type: "text" },
    registro_id: { type: "integer" },
    descripcion: { type: "text" },
    ...auditColumns(pgm),
  });
};

exports.down = (pgm) => {
  pgm.dropTable("bitacora_auditoria");
  pgm.dropTable("notificacion");
};
