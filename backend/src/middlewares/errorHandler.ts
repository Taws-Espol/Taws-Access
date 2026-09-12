import { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(err);
  // Misma forma `{ error }` que el resto de la API para un contrato uniforme.
  res.status(500).json({ error: "Error interno del servidor" });
}
