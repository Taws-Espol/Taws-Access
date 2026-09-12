import { Request, Response } from "express";
import * as configService from "../services/configuracionService";

// GET /api/configuracion/:clave
export async function getConfig(req: Request, res: Response): Promise<void> {
  const config = await configService.obtenerConfiguracion(
    String(req.params.clave),
  );
  if (!config) {
    res.status(404).json({ error: "Clave de configuración no encontrada." });
    return;
  }
  res.status(200).json(config);
}

// PUT /api/configuracion/:clave  { "valor": "..." }
export async function putConfig(req: Request, res: Response): Promise<void> {
  try {
    const config = await configService.actualizarConfiguracion(
      String(req.params.clave),
      req.body?.valor,
    );
    res.status(200).json(config);
  } catch (err) {
    if (err instanceof configService.ConfiguracionNoEncontradaError) {
      res.status(404).json({ error: err.message });
      return;
    }
    if (err instanceof configService.ConfiguracionInvalidaError) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error("Error actualizando configuración:", err);
    res.status(500).json({ error: "Error actualizando la configuración." });
  }
}
