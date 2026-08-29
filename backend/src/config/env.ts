import "dotenv/config";

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(requireEnv("PORT", "3000")),
  databaseUrl: requireEnv("DATABASE_URL"),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
};
