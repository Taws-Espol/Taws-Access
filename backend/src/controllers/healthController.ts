import { Request, Response } from "express";
import { getHealthStatus } from "../services/healthService";

export async function getHealth(_req: Request, res: Response): Promise<void> {
  try {
    const health = await getHealthStatus();
    res.status(200).json(health);
  } catch {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
}
