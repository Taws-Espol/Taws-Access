import { Configuracion } from "../models/configuracion";
import * as configRepo from "../repositories/configuracionRepository";

export class ConfiguracionInvalidaError extends Error {}
export class ConfiguracionNoEncontradaError extends Error {}

export async function obtenerConfiguracion(
  clave: string,
): Promise<Configuracion | null> {
  return configRepo.getConfig(clave);
}

// Actualiza una clave de configuración EXISTENTE (las claves se crean por
// seed/migración, no desde la API). Valida el valor según el `tipo_dato`
// declarado de la clave, en lugar de adivinar por el nombre.
export async function actualizarConfiguracion(
  clave: string,
  valor: unknown,
): Promise<Configuracion> {
  if (typeof valor !== "string" && typeof valor !== "number") {
    throw new ConfiguracionInvalidaError("El valor debe ser texto o número.");
  }
  const valorStr = String(valor).trim();
  if (valorStr.length === 0) {
    throw new ConfiguracionInvalidaError("El valor no puede estar vacío.");
  }

  const actual = await configRepo.getConfig(clave);
  if (!actual) {
    throw new ConfiguracionNoEncontradaError(
      `No existe la clave de configuración '${clave}'.`,
    );
  }

  if (actual.tipo_dato === "integer") {
    const n = Number(valorStr);
    if (!Number.isInteger(n) || n < 0) {
      throw new ConfiguracionInvalidaError(
        `El valor de '${clave}' debe ser un entero no negativo.`,
      );
    }
  }

  const actualizado = await configRepo.setConfig(clave, valorStr);
  // La clave existía arriba; si el UPDATE no tocó filas, fue borrada en el
  // ínterin (carrera): se trata como no encontrada.
  if (!actualizado) {
    throw new ConfiguracionNoEncontradaError(
      `No existe la clave de configuración '${clave}'.`,
    );
  }
  return actualizado;
}
