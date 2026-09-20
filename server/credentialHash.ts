import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// OWASP's 16 MiB profile: keeps memory bounded on a small VPS.
const PREFIX = "scrypt$v1$16384$8$5";
const OPTIONS = { N: 16384, r: 8, p: 5, maxmem: 32 * 1024 * 1024 };
let running = 0;
const waiting: Array<() => void> = [];

async function derive(password: string, salt: Buffer) {
  if (Buffer.byteLength(password) > 1024) throw new Error("Credencial excede o limite permitido.");
  if (running >= 2) {
    if (waiting.length >= 16) throw new Error("Autenticação ocupada. Tente novamente.");
    await new Promise<void>(resolve => waiting.push(resolve));
  } else {
    running++;
  }
  try {
    return await new Promise<Buffer>((resolve, reject) => {
      scrypt(password, salt, 32, OPTIONS, (error, key) => error ? reject(error) : resolve(key));
    });
  } finally {
    const next = waiting.shift();
    if (next) next();
    else running--;
  }
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  return `${PREFIX}$${salt.toString("hex")}$${(await derive(password, salt)).toString("hex")}`;
}

export function needsPasswordRehash(stored: string) {
  return /^[0-9a-f]{64}$/i.test(stored);
}

export async function verifyPassword(password: string, stored: string) {
  if (needsPasswordRehash(stored)) {
    return hashesMatch(stored.toLowerCase(), createHash("sha256").update(password).digest("hex"));
  }
  const match = stored.match(/^scrypt\$v1\$16384\$8\$5\$([0-9a-f]{32})\$([0-9a-f]{64})$/);
  if (!match) return false;
  return hashesMatch((await derive(password, Buffer.from(match[1], "hex"))).toString("hex"), match[2]);
}

export function hashDemoCredential(username: string, password: string) {
  return createHash("sha256")
    .update(`${username.trim().toLowerCase()}:${password}`)
    .digest("hex");
}

export function hashesMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return leftBuffer.length === rightBuffer.length && leftBuffer.length > 0 && timingSafeEqual(leftBuffer, rightBuffer);
}
