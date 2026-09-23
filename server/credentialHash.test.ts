import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { hashPassword, hashesMatch } from "./credentialHash";

describe("credentialHash", () => {
  it("gera hash de senha com scrypt, salt e formato versionado", () => {
    const first = hashPassword("senha-segura");
    const second = hashPassword("senha-segura");

    expect(first).toMatch(/^scrypt\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/);
    expect(second).toMatch(/^scrypt\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/);
    expect(first).not.toBe(second);
    expect(first.length).toBeLessThanOrEqual(255);
    expect(hashesMatch(first, "senha-segura")).toBe(true);
    expect(hashesMatch(first, "senha-errada")).toBe(false);
  });

  it("mantém compatibilidade de leitura com hashes SHA-256 legados", () => {
    const legacy = createHash("sha256").update("senha-antiga").digest("hex");

    expect(hashesMatch(legacy, "senha-antiga")).toBe(true);
    expect(hashesMatch(legacy, "senha-errada")).toBe(false);
    expect(hashesMatch(legacy, legacy)).toBe(true);
  });
});
