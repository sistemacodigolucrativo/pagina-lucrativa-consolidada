import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_PREFIX = "scrypt";
const SCRYPT_KEY_LENGTH = 64;

function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function timingSafeBufferEqual(left: Buffer, right: Buffer) {
  return left.length === right.length && left.length > 0 && timingSafeEqual(left, right);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const key = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("base64url");
  return `${SCRYPT_PREFIX}$${salt}$${key}`;
}

export function hashDemoCredential(username: string, password: string) {
  return sha256Hex(`${username.trim().toLowerCase()}:${password}`);
}

export function hashesMatch(storedHash: string, candidateHashOrPlain: string) {
  if (storedHash.startsWith(`${SCRYPT_PREFIX}$`)) {
    const [, salt, storedKey] = storedHash.split("$");
    if (!salt || !storedKey) return false;
    const candidateKey = scryptSync(candidateHashOrPlain, salt, SCRYPT_KEY_LENGTH).toString("base64url");
    return timingSafeBufferEqual(Buffer.from(storedKey), Buffer.from(candidateKey));
  }

  const candidateHash = /^[a-f0-9]{64}$/i.test(candidateHashOrPlain)
    ? candidateHashOrPlain
    : sha256Hex(candidateHashOrPlain);
  const leftBuffer = Buffer.from(storedHash, "hex");
  const rightBuffer = Buffer.from(candidateHash, "hex");
  return timingSafeBufferEqual(leftBuffer, rightBuffer);
}
