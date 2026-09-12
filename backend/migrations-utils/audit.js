// Utilidades compartidas por las migraciones (ERS §6.1).
//
// Este archivo vive FUERA de `migrations/` a propósito: node-pg-migrate trata
// cualquier archivo dentro de `migrations/` como una migración ejecutable, así
// que los helpers deben quedar aparte.

// Columnas de auditoría comunes a todas las entidades del sistema
// (status, created_at, created_by, updated_at, updated_by). Se reutiliza en
// cada `createTable` para no repetir el bloque. Las FKs created_by/updated_by
// se agregan por separado (ver AUDITED_TABLES) una vez que `miembro` existe,
// para evitar dependencias circulares en el orden de creación.
const auditColumns = (pgm) => ({
  status: { type: "estado_general", notNull: true, default: "activo" },
  created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  created_by: { type: "integer" },
  updated_at: { type: "timestamptz" },
  updated_by: { type: "integer" },
});

// Todas las tablas que llevan campos de auditoría. Se usa para agregar en bloque
// las FKs created_by/updated_by → miembro cuando la tabla `miembro` ya existe.
const AUDITED_TABLES = [
  "configuracion",
  "rol",
  "miembro",
  "evento_acceso",
  "cierre_local",
  "cierre_responsable",
  "jornada_limpieza",
  "incidencia",
  "incidencia_responsable",
  "multa",
  "apelacion",
  "notificacion",
  "bitacora_auditoria",
];

module.exports = { auditColumns, AUDITED_TABLES };
