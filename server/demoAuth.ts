import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const DEMO_SESSION_COOKIE_NAME = "pl_demo_session";

export const demoLoginInputSchema = z.object({
  username: z.string().trim().min(1, "Informe o usuário.").max(64),
  password: z.string().min(1, "Informe a senha.").max(128),
});

export type DemoAccount = {
  openId: string;
  name: string;
  email: string;
  role: "admin" | "user";
};

type StoredDemoAccount = DemoAccount & { credentialHash: string };

const demoAccounts: StoredDemoAccount[] = [
  {
    openId: "local_demo_admin",
    name: "Administrador de demonstração",
    email: "admin.demo@pagina-lucrativa.local",
    role: "admin",
    credentialHash: "f6bd2d1a9a2798aa5b2a000d477587b65aaac9a417064d91ed2bcd8714bbba89",
  },
  {
    openId: "local_demo_member",
    name: "Membro de demonstração",
    email: "membro.demo@pagina-lucrativa.local",
    role: "user",
    credentialHash: "61b7de306ccf11d6c81f85e56e86571766d10c01e72449b0171a4966d97e1793",
  },
];

function hashCredential(username: string, password: string) {
  return createHash("sha256")
    .update(`${username.trim().toLowerCase()}:${password}`)
    .digest("hex");
}

function hashesMatch(left: string, right: string) {
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

export function resolveDemoAccount(username: string, password: string): DemoAccount | null {
  const candidateHash = hashCredential(username, password);
  const matched = demoAccounts.find(account => hashesMatch(account.credentialHash, candidateHash));

  if (!matched) return null;

  const { credentialHash: _credentialHash, ...account } = matched;
  return account;
}
