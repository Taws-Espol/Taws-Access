// Marcador de deduplicación para las alertas de permanencia excedida
// (RF-ACC-05). Guarda cuándo se alertó por última vez sobre un miembro dentro
// del local; se reinicia en cada nuevo evento de acceso (nueva estadía), de
// modo que verificar la permanencia de forma periódica (cron/polling) no
// reenvía la misma alerta una y otra vez.

exports.up = (pgm) => {
  pgm.addColumn("miembro", {
    alerta_permanencia_at: { type: "timestamptz" },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("miembro", "alerta_permanencia_at");
};
