import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ user: null as any, update: vi.fn(), affected: 1 }));
vi.mock("./_core/env", () => ({ ENV: { databaseUrl: "mysql://test.invalid/test", isProduction: false } }));
vi.mock("drizzle-orm/mysql2", () => ({ drizzle: () => ({
  select: () => ({ from: () => ({ where: () => ({ limit: async () => state.user ? [state.user] : [] }) }) }),
  update: () => ({ set: state.update }),
}) }));
import { hashPassword, needsPasswordRehash, verifyPassword } from "./credentialHash";
import { authenticateLocalUser } from "./db";

describe("HIGH-01: hashing e migração gradual", () => {
  beforeEach(() => {
    state.affected = 1;
    state.update.mockReset().mockImplementation(values => ({ where: async () => {
      if (state.affected) state.user = { ...state.user, ...values };
      return [{ affectedRows: state.affected }];
    } }));
  });
  it("usa salt individual, preserva Unicode/espaços e cabe na coluna existente", async () => {
    const password = " senha de teste ç 🦉 ";
    const a = await hashPassword(password), b = await hashPassword(password);
    expect(a).not.toBe(b);
    expect(a.length).toBeLessThanOrEqual(255);
    expect(await verifyPassword(password, a)).toBe(true);
    expect(await verifyPassword(password.trim(), a)).toBe(false);
    expect(needsPasswordRehash(a)).toBe(false);
  });
  it("rejeita hashes malformados e custos arbitrários sem derivar", async () => {
    expect(await verifyPassword("test", "scrypt$v1$999999999$8$5$invalid")).toBe(false);
    expect(await verifyPassword("test", "a".repeat(63))).toBe(false);
    expect(await verifyPassword("test", "")).toBe(false);
  });
  it("atualiza SHA-256 somente depois de login correto, sem alterar schema", async () => {
    const password = "test credential";
    state.user = { id: 20, passwordHash: createHash("sha256").update(password).digest("hex") };
    expect(await authenticateLocalUser("user@example.test", "incorrect")).toBeNull();
    expect(state.update).not.toHaveBeenCalled();
    const authenticated = await authenticateLocalUser("user@example.test", password);
    expect(authenticated?.passwordHash.startsWith("scrypt$v1$")).toBe(true);
    expect(await verifyPassword(password, state.user.passwordHash)).toBe(true);
    expect(state.update).toHaveBeenCalledTimes(1);
  });
  it("não autentica nem sobrescreve senha alterada concorrentemente", async () => {
    state.user = { id: 20, passwordHash: createHash("sha256").update("test").digest("hex") };
    state.affected = 0;
    expect(await authenticateLocalUser("user@example.test", "test")).toBeNull();
    expect(needsPasswordRehash(state.user.passwordHash)).toBe(true);
  });
});
