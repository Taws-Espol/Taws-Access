import crypto from "crypto";
import { env } from "./env";

// Cifrado a nivel de aplicación para el embedding facial (RF-BIO-07 /
// RNF-SEG-04). Se usa AES-256-GCM (confidencialidad + integridad). El
// resultado almacenado en `miembro.embedding_encriptado` (BYTEA) es:
//
//     iv (12 bytes) || authTag (16 bytes) || ciphertext
//
// El cifrado es REVERSIBLE a propósito: el backend descifra el embedding justo
// antes de enviarlo (como floats en claro) al facial-service `/match`. No se
// guardan imágenes; solo el embedding cifrado.

const IV_LENGTH = 12; // recomendado para GCM
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32; // AES-256

// La clave puede venir en hex (64 chars) o base64. Se valida a 32 bytes.
function loadKey(): Buffer {
  const raw = env.embeddingEncKey.trim();
  let key: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    key = Buffer.from(raw, "hex");
  } else {
    key = Buffer.from(raw, "base64");
  }
  if (key.length !== KEY_LENGTH) {
    throw new Error(
      `EMBEDDING_ENC_KEY debe ser de 32 bytes (64 hex o 44 base64); se obtuvieron ${key.length} bytes.`,
    );
  }
  return key;
}

const key = loadKey();

// Serializa el embedding (array de floats) y lo cifra. Devuelve un Buffer listo
// para guardar como BYTEA.
export function encryptEmbedding(embedding: number[]): Buffer {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(embedding), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]);
}

// Descifra un Buffer producido por encryptEmbedding y devuelve el array de
// floats original.
export function decryptEmbedding(payload: Buffer): number[] {
  if (payload.length <= IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error("Payload de embedding cifrado inválido o demasiado corto.");
  }
  const iv = payload.subarray(0, IV_LENGTH);
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return JSON.parse(plaintext.toString("utf8")) as number[];
}
