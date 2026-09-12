import { Configuracion } from "../models/configuracion";
import * as configRepo from "../repositories/configuracionRepository";

export class ConfiguracionInvalidaError extends Error {}

export async function obtenerConfiguracion(
  clave: string,
): Promise<Configuracion | null> {
  return configRepo.getConfig(clave);
}

// Actualiza una clave de configuración. Valida que las claves numéricas
// conocidas reciban un entero no negativo (p. ej. las horas de RF-ACC-05).
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

  if (clave.startsWith("acceso.horas")) {
    const n = Number(valorStr);
    if (!Number.isInteger(n) || n < 0) {
      throw new ConfiguracionInvalidaError(
        "Las horas deben ser un entero no negativo.",
      );
    }
  }

  return configRepo.setConfig(clave, valorStr);
}
