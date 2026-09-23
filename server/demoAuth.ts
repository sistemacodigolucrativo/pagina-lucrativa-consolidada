import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { User } from "../drizzle/schema";
import { authenticateLocalUser, getStoredPasswordHashByOpenId, upsertUser } from "./db";
import { hashDemoCredential, hashPassword, hashesMatch } from "./credentialHash";

export const DEMO_SESSION_COOKIE_NAME = process.env.VITE_DEV_PREFIX ? "pl_demo_session_dev" : "pl_demo_session";

export const demoLoginInputSchema = z.object({
  username: z.string().trim().min(1, "Informe o usuário.").max(64),
  password: z.string().min(1, "Informe a senha.").max(128),
});

export type DemoAccount = {
  id?: number;
  username: string;
  openId: string;
  name: string;
  email: string;
  loginMethod?: string | null;
  role: "admin" | "user";
};

type DemoSessionPayload = {
  openId: string;
  role: DemoAccount["role"];
  expiresAt: number;
  id?: number;
  name?: string;
  email?: string;
  loginMethod?: string | null;
};

const DEMO_SESSION_DURATION_MS = 1000 * 60 * 60 * 12;
const DEMO_ACCOUNTS_ENABLED = process.env.ENABLE_DEMO_ACCOUNTS === "true" || process.env.NODE_ENV !== "production";

function resolveSessionSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET é obrigatório em produção para assinar sessões.");
  }
  return "pagina-lucrativa-local-demo-session";
}

const DEMO_SESSION_SECRET = resolveSessionSecret();

type StoredDemoAccount = DemoAccount & { credentialHash: string };

const demoAccounts: StoredDemoAccount[] = [
  {
    username: "admin",
    openId: "local_demo_admin",
    name: "Administrador Código Lucrativo",
    email: "administrador@pagina-lucrativa.local",
    role: "admin",
    credentialHash: "f6bd2d1a9a2798aa5b2a000d477587b65aaac9a417064d91ed2bcd8714bbba89",
  },
  {
    username: "user",
    openId: "local_demo_member",
    name: "Membro Código Lucrativo",
    email: "membro@pagina-lucrativa.local",
    role: "user",
    credentialHash: "61b7de306ccf11d6c81f85e56e86571766d10c01e72449b0171a4966d97e1793",
  },
];

function signSessionPayload(payload: DemoSessionPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", DEMO_SESSION_SECRET).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function readSessionPayload(token: string): DemoSessionPayload | null {
  const [encodedPayload, encodedSignature] = token.split(".");
  if (!encodedPayload || !encodedSignature) return null;

  const expectedSignature = createHmac("sha256", DEMO_SESSION_SECRET).update(encodedPayload).digest();
  const receivedSignature = Buffer.from(encodedSignature, "base64url");
  if (receivedSignature.length !== expectedSignature.length || !timingSafeEqual(receivedSignature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as Partial<DemoSessionPayload>;
    if (typeof payload.openId !== "string" || (payload.role !== "admin" && payload.role !== "user") || typeof payload.expiresAt !== "number" || payload.expiresAt <= Date.now()) return null;
    return payload as DemoSessionPayload;
  } catch {
    return null;
  }
}

export async function resolveDemoAccount(username: string, password: string): Promise<DemoAccount | null> {
  const normalizedUsername = username.trim().toLowerCase();
  const matched = DEMO_ACCOUNTS_ENABLED ? demoAccounts.find(account => account.username === normalizedUsername) : null;
  if (matched) {
    const storedPasswordHash = await getStoredPasswordHashByOpenId(matched.openId);
    const valid = storedPasswordHash
      ? hashesMatch(storedPasswordHash, hashPassword(password))
      : hashesMatch(matched.credentialHash, hashDemoCredential(normalizedUsername, password));
    if (!valid) return null;
    const { credentialHash: _credentialHash, ...account } = matched;
    upsertUser({
      openId: account.openId,
      name: account.name,
      email: account.email,
      loginMethod: account.loginMethod ?? "local_demo",
      role: account.role,
      lastSignedIn: new Date(),
    }).catch(error => {
      console.warn("[DemoAuth] Failed to persist local demo account:", error);
    });
    return account;
  }
  const localUser = await authenticateLocalUser(normalizedUsername, password);
  if (!localUser) return null;
  return {
    id: localUser.id,
    username: localUser.email ?? normalizedUsername,
    openId: localUser.openId,
    name: localUser.name ?? localUser.email ?? "Membro Código Lucrativo",
    email: localUser.email ?? normalizedUsername,
    loginMethod: localUser.loginMethod,
    role: localUser.role,
  };
}

export function toDemoUser(account: DemoAccount): User {
  const now = new Date();
  return {
    id: account.id ?? (account.role === "admin" ? 1 : 2),
    openId: account.openId,
    name: account.name,
    email: account.email,
    passwordHash: null,
    loginMethod: account.loginMethod ?? "local_demo",
    role: account.role,
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}

export function createDemoSession(account: DemoAccount) {
  return signSessionPayload({
    id: account.id,
    openId: account.openId,
    role: account.role,
    name: account.name,
    email: account.email,
    loginMethod: account.loginMethod ?? "local_demo",
    expiresAt: Date.now() + DEMO_SESSION_DURATION_MS,
  });
}

export function resolveDemoSession(token: string | undefined) {
  if (!token) return null;
  const payload = readSessionPayload(token);
  if (!payload) return null;
  if (payload.id && payload.name && payload.email) {
    return toDemoUser({
      id: payload.id,
      username: payload.email,
      openId: payload.openId,
      name: payload.name,
      email: payload.email,
      loginMethod: payload.loginMethod,
      role: payload.role,
    });
  }
  if (!DEMO_ACCOUNTS_ENABLED) return null;
  const account = demoAccounts.find(candidate => candidate.openId === payload.openId && candidate.role === payload.role);
  return account ? toDemoUser(account) : null;
}
