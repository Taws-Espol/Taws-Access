// FKs de auditoría (created_by/updated_by → miembro) para todas las tablas,
// más los índices de rendimiento. Las FKs se agregan aquí (y no inline) porque
// `miembro` debe existir antes de referenciarla desde tablas creadas primero
// (configuracion, rol) — así se evita una dependencia circular.
const { AUDITED_TABLES } = require("../migrations-utils/audit");

exports.up = (pgm) => {
  for (const table of AUDITED_TABLES) {
    pgm.addConstraint(table, `${table}_created_by_fk`, {
      foreignKeys: {
        columns: "created_by",
        references: "miembro(id)",
        onDelete: "SET NULL",
      },
    });
    pgm.addConstraint(table, `${table}_updated_by_fk`, {
      foreignKeys: {
        columns: "updated_by",
        references: "miembro(id)",
        onDelete: "SET NULL",
      },
    });
  }

  // Último evento por miembro y timeline (RF-ACC-01/02, auditoría).
  pgm.createIndex("evento_acceso", ["miembro_id", { name: "hora_ingreso", sort: "DESC" }]);
  pgm.createIndex("evento_acceso", [{ name: "hora_ingreso", sort: "DESC" }]);

  // Presencia en tiempo real: índices parciales sobre quienes están "dentro"
  // (RF-ACC-04 y candidatos de RF-ACC-05).
  pgm.createIndex("miembro", "presencia_actual", {
    name: "miembro_dentro_idx",
    where: "presencia_actual = 'dentro'",
  });
  pgm.createIndex("miembro", "ultimo_evento_at", {
    name: "miembro_dentro_tiempo_idx",
    where: "presencia_actual = 'dentro'",
  });

  // Último cierre (handoff a RF-INC-02) y sus responsables.
  pgm.createIndex("cierre_local", [{ name: "fecha_cierre", sort: "DESC" }]);
  pgm.createIndex("cierre_responsable", "cierre_id");
  pgm.createIndex("cierre_responsable", "miembro_id");

  // Índices de apoyo a claves foráneas frecuentes.
  pgm.createIndex("notificacion", "destinatario_id");
  pgm.createIndex("multa", "incidencia_id");
  pgm.createIndex("multa", "miembro_id");
  pgm.createIndex("incidencia_responsable", "incidencia_id");
  pgm.createIndex("incidencia_responsable", "miembro_id");
  pgm.createIndex("jornada_limpieza", "encargado_id");
  pgm.createIndex("bitacora_auditoria", "usuario_id");
};

exports.down = (pgm) => {
  pgm.dropIndex("bitacora_auditoria", "usuario_id");
  pgm.dropIndex("jornada_limpieza", "encargado_id");
  pgm.dropIndex("incidencia_responsable", "miembro_id");
  pgm.dropIndex("incidencia_responsable", "incidencia_id");
  pgm.dropIndex("multa", "miembro_id");
  pgm.dropIndex("multa", "incidencia_id");
  pgm.dropIndex("notificacion", "destinatario_id");
  pgm.dropIndex("cierre_responsable", "miembro_id");
  pgm.dropIndex("cierre_responsable", "cierre_id");
  pgm.dropIndex("cierre_local", [{ name: "fecha_cierre", sort: "DESC" }]);
  pgm.dropIndex("miembro", "ultimo_evento_at", { name: "miembro_dentro_tiempo_idx" });
  pgm.dropIndex("miembro", "presencia_actual", { name: "miembro_dentro_idx" });
  pgm.dropIndex("evento_acceso", [{ name: "hora_ingreso", sort: "DESC" }]);
  pgm.dropIndex("evento_acceso", ["miembro_id", { name: "hora_ingreso", sort: "DESC" }]);

  for (const table of AUDITED_TABLES) {
    pgm.dropConstraint(table, `${table}_updated_by_fk`);
    pgm.dropConstraint(table, `${table}_created_by_fk`);
  }
};
