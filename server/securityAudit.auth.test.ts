import { createHmac, randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ authenticateLocalUser: vi.fn(), getUserByOpenId: vi.fn(), getStoredPasswordHashByOpenId: vi.fn(), upsertUser: vi.fn() }));
vi.mock("./db", () => db);
import { createDemoSession, resolveDemoAccount, resolveDemoSession } from "./demoAuth";
import { assertProductionAuthConfig } from "./_core/authConfig";

const user = { id: 37, openId: "real-member", name: "Membro", email: "member@example.test", role: "user" as const, loginMethod: "password", passwordHash: "a".repeat(64), createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };

function signed(payload: object) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${createHmac("sha256", process.env.JWT_SECRET!).update(encoded).digest("base64url")}`;
}

describe("CRIT-01: produção não aceita identidades demo ou permissões antigas", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("JWT_SECRET", randomBytes(32).toString("hex"));
    vi.stubEnv("ENABLE_LOCAL_AUTH", "true");
    db.authenticateLocalUser.mockResolvedValue(user);
    db.getUserByOpenId.mockResolvedValue(user);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("bloqueia contas demo mesmo com autenticação local habilitada", async () => {
    expect(await resolveDemoAccount("admin", "unused")).toBeNull();
    expect(await resolveDemoAccount("user", "unused")).toBeNull();
    expect(db.authenticateLocalUser).not.toHaveBeenCalled();
  });

  it("recusa sessão demo antiga, inclusive com id e email no payload", async () => {
    const token = signed({ ...user, id: 1, openId: "local_demo_admin", role: "admin", expiresAt: Date.now() + 60_000 });
    expect(await resolveDemoSession(token)).toBeNull();
    expect(db.getUserByOpenId).not.toHaveBeenCalled();
  });

  it("não permite contornar a restrição demo usando o email do banco", async () => {
    db.authenticateLocalUser.mockResolvedValue({ ...user, openId: "local_demo_admin", role: "admin" });
    expect(await resolveDemoAccount(user.email, "unused")).toBeNull();
  });

  it("exige opt-in para autenticação local de contas reais", async () => {
    vi.stubEnv("ENABLE_LOCAL_AUTH", "false");
    expect(await resolveDemoAccount(user.email, "unused")).toBeNull();
  });

  it("consulta a permissão atual, oculta hash e invalida sessão após troca de senha", async () => {
    const account = await resolveDemoAccount(user.email, "unused");
    const token = createDemoSession({ ...account!, role: "admin" });
    expect(await resolveDemoSession(token)).toMatchObject({ id: 37, role: "user", passwordHash: null });
    db.getUserByOpenId.mockResolvedValue({ ...user, passwordHash: "b".repeat(64) });
    expect(await resolveDemoSession(token)).toBeNull();
  });

  it("nega usuário excluído, banco indisponível, assinatura alterada e segmentos extras", async () => {
    const token = createDemoSession((await resolveDemoAccount(user.email, "unused"))!);
    expect(await resolveDemoSession(`${token}.extra`)).toBeNull();
    expect(await resolveDemoSession(`${token}invalid`)).toBeNull();
    db.getUserByOpenId.mockResolvedValue(undefined);
    expect(await resolveDemoSession(token)).toBeNull();
    db.getUserByOpenId.mockRejectedValue(new Error("offline"));
    expect(await resolveDemoSession(token)).toBeNull();
  });

  it.each(["", "short", "a".repeat(64), "gere-um-segredo-longo-e-aleatorio-para-producao"])("rejeita configuração insegura de sessão #%#", secret => {
    vi.stubEnv("JWT_SECRET", secret);
    expect(assertProductionAuthConfig).toThrow(/JWT_SECRET/);
  });
  it("aceita segredo aleatório configurado", () => expect(assertProductionAuthConfig).not.toThrow());
});
