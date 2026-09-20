import { randomBytes } from "node:crypto";

const developmentSecret = randomBytes(32).toString("hex");

export function localAuthEnabled() {
  return process.env.ENABLE_LOCAL_AUTH === "true";
}

export function demoAuthEnabled() {
  return process.env.NODE_ENV !== "production" && localAuthEnabled();
}

export function assertProductionAuthConfig() {
  if (process.env.NODE_ENV !== "production") return;
  const secret = process.env.JWT_SECRET ?? "";
  if (Buffer.byteLength(secret) < 32 || new Set(secret).size < 12
    || /troque|gere-um|change.?me|local-demo|example|seu-segredo/i.test(secret)) {
    throw new Error("JWT_SECRET deve ser um segredo aleatório de pelo menos 32 bytes em produção.");
  }
}

export function sessionSecret() {
  assertProductionAuthConfig();
  return process.env.JWT_SECRET || developmentSecret;
}
