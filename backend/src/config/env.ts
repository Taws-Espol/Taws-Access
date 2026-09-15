import "dotenv/config";

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(requireEnv("PORT", "3000") || "3000"),
  databaseUrl: requireEnv("DATABASE_URL"),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  // Clave de cifrado (32 bytes en hex o base64) para los embeddings faciales
  // (RF-BIO-07 / RNF-SEG-04). Requerida al arrancar el backend.
  embeddingEncKey: requireEnv("EMBEDDING_ENC_KEY"),
  whatsappApiToken: requireEnv("WHATSAPP_API_TOKEN", ""),
  whatsappPhoneNumberId: requireEnv("WHATSAPP_PHONE_NUMBER_ID", ""),
  whatsappApiVersion: requireEnv("WHATSAPP_API_VERSION", "v22.0"),
  whatsappWebhookVerifyToken: requireEnv("WHATSAPP_WEBHOOK_VERIFY_TOKEN", ""),
};
