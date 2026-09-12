// Limpieza (RF-LIM), incidencias (RF-INC) y multas/apelaciones.
const { auditColumns } = require("../migrations-utils/audit");

exports.up = (pgm) => {
  // Jornadas de limpieza (Miembro → JornadaLimpieza 1:N como encargado).
  pgm.createTable("jornada_limpieza", {
    id: "id",
    encargado_id: {
      type: "integer",
      notNull: true,
      references: "miembro",
      onDelete: "RESTRICT",
    },
    inicio_timestamp: { type: "timestamptz", notNull: true },
    fin_timestamp: { type: "timestamptz" },
    observaciones: { type: "text" },
    evidencia_url: { type: "text" },
    ...auditColumns(pgm),
  });

  // Incidencias reportadas en el local.
  pgm.createTable("incidencia", {
    id: "id",
    tipo: { type: "tipo_incidencia", notNull: true },
    descripcion: { type: "text" },
    evidencia_url: { type: "text" },
    fecha_deteccion: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
    directivo_id: {
      type: "integer",
      references: "miembro",
      onDelete: "SET NULL",
    },
    ...auditColumns(pgm),
  });

  // Relación N:M Incidencia ↔ Miembro (responsables/involucrados).
  pgm.createTable("incidencia_responsable", {
    id: "id",
    incidencia_id: {
      type: "integer",
      notNull: true,
      references: "incidencia",
      onDelete: "CASCADE",
    },
    miembro_id: {
      type: "integer",
      notNull: true,
      references: "miembro",
      onDelete: "CASCADE",
    },
    tipo_responsabilidad: { type: "text" },
    ...auditColumns(pgm),
  });
  pgm.addConstraint("incidencia_responsable", "incidencia_responsable_unico", {
    unique: ["incidencia_id", "miembro_id"],
  });

  // Multas derivadas de una incidencia (Incidencia → Multa 1:N).
  pgm.createTable("multa", {
    id: "id",
    incidencia_id: {
      type: "integer",
      notNull: true,
      references: "incidencia",
      onDelete: "CASCADE",
    },
    miembro_id: {
      type: "integer",
      notNull: true,
      references: "miembro",
      onDelete: "RESTRICT",
    },
    monto: { type: "numeric(10,2)", notNull: true },
    descripcion: { type: "text" },
    fecha_aplicacion: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
    estado: { type: "estado_multa", notNull: true, default: "pendiente" },
    fecha_pago: { type: "timestamptz" },
    numero_comprobante: { type: "text" },
    fecha_vencimiento: { type: "timestamptz" },
    ...auditColumns(pgm),
  });

  // Apelación de una multa (Multa → Apelación 1:1 opcional).
  pgm.createTable("apelacion", {
    id: "id",
    multa_id: {
      type: "integer",
      notNull: true,
      references: "multa",
      onDelete: "CASCADE",
    },
    miembro_id: {
      type: "integer",
      notNull: true,
      references: "miembro",
      onDelete: "RESTRICT",
    },
    descripcion: { type: "text" },
    fecha: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    respuesta_directivo: { type: "text" },
    fecha_respuesta: { type: "timestamptz" },
    directivo_respuesta_id: {
      type: "integer",
      references: "miembro",
      onDelete: "SET NULL",
    },
    ...auditColumns(pgm),
  });
  // 1:1 opcional: una multa tiene como máximo una apelación.
  pgm.addConstraint("apelacion", "apelacion_multa_unica", {
    unique: ["multa_id"],
  });
};

exports.down = (pgm) => {
  pgm.dropTable("apelacion");
  pgm.dropTable("multa");
  pgm.dropTable("incidencia_responsable");
  pgm.dropTable("incidencia");
  pgm.dropTable("jornada_limpieza");
};
