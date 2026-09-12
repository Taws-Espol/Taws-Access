// Tablas del módulo de control de acceso (RF-ACC).
const { auditColumns } = require("../migrations-utils/audit");

exports.up = (pgm) => {
  // Registro atómico de cada ingreso/salida (RF-ACC-01). `hora_ingreso` es el
  // timestamp del evento (nombre heredado del ERS §6.1). `confianza_facial`
  // solo aplica a la modalidad facial.
  pgm.createTable("evento_acceso", {
    id: "id",
    miembro_id: {
      type: "integer",
      notNull: true,
      references: "miembro",
      onDelete: "CASCADE",
    },
    tipo: { type: "tipo_evento_acceso", notNull: true },
    modalidad: { type: "modalidad_acceso", notNull: true },
    hora_ingreso: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
    confianza_facial: { type: "numeric(5,4)" },
    ...auditColumns(pgm),
  });

  // Cierre del local: se crea cuando sale el último miembro (RF-ACC-03).
  // La foto de cierre (excepción a RF-BIO-07) se guarda como URL, no en la BD.
  pgm.createTable("cierre_local", {
    id: "id",
    fecha_cierre: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
    evento_acceso_id: {
      type: "integer",
      references: "evento_acceso",
      onDelete: "SET NULL",
    },
    evidencia_url: { type: "text" },
    ...auditColumns(pgm),
  });

  // Responsable(s) de cierre. Junction para soportar "último" o "últimos 3"
  // (RF-INC-01) sin ensuciar la tabla caliente evento_acceso.
  pgm.createTable("cierre_responsable", {
    id: "id",
    cierre_id: {
      type: "integer",
      notNull: true,
      references: "cierre_local",
      onDelete: "CASCADE",
    },
    miembro_id: {
      type: "integer",
      notNull: true,
      references: "miembro",
      onDelete: "CASCADE",
    },
    ...auditColumns(pgm),
  });
  pgm.addConstraint("cierre_responsable", "cierre_responsable_unico", {
    unique: ["cierre_id", "miembro_id"],
  });
};

exports.down = (pgm) => {
  pgm.dropTable("cierre_responsable");
  pgm.dropTable("cierre_local");
  pgm.dropTable("evento_acceso");
};
