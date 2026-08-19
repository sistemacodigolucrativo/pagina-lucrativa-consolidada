import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { User } from "../drizzle/schema";
import { getStoredPasswordHashByOpenId } from "./db";
import { hashDemoCredential, hashPassword, hashesMatch } from "./credentialHash";

export const DEMO_SESSION_COOKIE_NAME = "pl_demo_session";

export const demoLoginInputSchema = z.object({
  username: z.string().trim().min(1, "Informe o usuário.").max(64),
  password: z.string().min(1, "Informe a senha.").max(128),
});

export type DemoAccount = {
  username: string;
  openId: string;
  name: string;
  email: string;
  role: "admin" | "user";
};

type DemoSession = {
  account: DemoAccount;
  expiresAt: number;
};

const DEMO_SESSION_DURATION_MS = 1000 * 60 * 60 * 12;
const activeDemoSessions = new Map<string, DemoSession>();

type StoredDemoAccount = DemoAccount & { credentialHash: string };

const demoAccounts: StoredDemoAccount[] = [
  {
    username: "admin",
    openId: "local_demo_admin",
    name: "Administrador Página Lucrativa",
    email: "administrador@pagina-lucrativa.local",
    role: "admin",
    credentialHash: "f6bd2d1a9a2798aa5b2a000d477587b65aaac9a417064d91ed2bcd8714bbba89",
  },
  {
    username: "user",
    openId: "local_demo_member",
    name: "Membro Página Lucrativa",
    email: "membro@pagina-lucrativa.local",
    role: "user",
    credentialHash: "61b7de306ccf11d6c81f85e56e86571766d10c01e72449b0171a4966d97e1793",
  },
];

export async function resolveDemoAccount(username: string, password: string): Promise<DemoAccount | null> {
  const normalizedUsername = username.trim().toLowerCase();
  const matched = demoAccounts.find(account => account.username === normalizedUsername);
  if (!matched) return null;
  const storedPasswordHash = await getStoredPasswordHashByOpenId(matched.openId);
  const valid = storedPasswordHash
    ? hashesMatch(storedPasswordHash, hashPassword(password))
    : hashesMatch(matched.credentialHash, hashDemoCredential(normalizedUsername, password));
  if (!valid) return null;
  const { credentialHash: _credentialHash, ...account } = matched;
  return account;
}

export function toDemoUser(account: DemoAccount): User {
  const now = new Date();
  return {
    id: account.role === "admin" ? 1 : 2,
    openId: account.openId,
    name: account.name,
    email: account.email,
    passwordHash: null,
    loginMethod: "local_demo",
    role: account.role,
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}

export function createDemoSession(account: DemoAccount) {
  const token = randomUUID();
  activeDemoSessions.set(token, {
    account,
    expiresAt: Date.now() + DEMO_SESSION_DURATION_MS,
  });
  return token;
}

export function resolveDemoSession(token: string | undefined) {
  if (!token) return null;
  const session = activeDemoSessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    activeDemoSessions.delete(token);
    return null;
  }
  return toDemoUser(session.account);
}
