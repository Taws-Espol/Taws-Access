// Seed mínimo: 4 roles base + configuración por defecto. Idempotente.

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO rol (nombre, descripcion) VALUES
      ('Miembro', 'Integrante del club con acceso básico al sistema.'),
      ('Directivo', 'Gestiona incidencias, multas y consultas de acceso.'),
      ('Encargado de limpieza', 'Responsable de registrar las jornadas de limpieza.'),
      ('Administrador', 'Administra el sistema, los miembros y la configuración.')
    ON CONFLICT (nombre) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO configuracion (clave, valor, descripcion, tipo_dato) VALUES
      ('acceso.horas_max_dentro', '8',
       'Horas máximas que un miembro puede permanecer dentro sin registrar salida antes de generar una alerta (RF-ACC-05).',
       'integer')
    ON CONFLICT (clave) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DELETE FROM configuracion WHERE clave = 'acceso.horas_max_dentro';`);
  pgm.sql(`
    DELETE FROM rol
    WHERE nombre IN ('Miembro', 'Directivo', 'Encargado de limpieza', 'Administrador');
  `);
};
