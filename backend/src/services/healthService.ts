import { checkDatabaseConnection } from "../config/db";

export async function getHealthStatus() {
  const databaseConnected = await checkDatabaseConnection();
  return {
    status: "ok" as const,
    database: databaseConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  };
}
