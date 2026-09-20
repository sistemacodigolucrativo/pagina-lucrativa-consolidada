import { describe, expect, it, vi } from "vitest";
import { checkRelationalIntegrity } from "../scripts/check-relational-integrity.mjs";

describe("MED-03: diagnóstico sem escrita", () => {
  it("usa transação read-only, conta referências e separa IDs sintéticos", async () => {
    const queries: string[] = [];
    const rollback = vi.fn(); const end = vi.fn();
    const result = await checkRelationalIntegrity({ env: { DATABASE_URL: "mysql://test.invalid/db" }, connect: async () => ({
      execute: async (query: string) => {
        queries.push(query);
        expect(query).toMatch(/^(SELECT|SET TRANSACTION|START TRANSACTION READ ONLY)/);
        return [[{ missing: query.includes("`applicationPaymentReceipts`") ? 2 : 0 }]];
      }, rollback, end,
    }) });
    expect(result.hasMissingParents).toBe(true);
    expect(result.findings).toHaveLength(19);
    expect(queries[1]).toBe("START TRANSACTION READ ONLY");
    expect(queries.some(query => query.includes("c.courseId < 900000000"))).toBe(true);
    expect(queries.some(query => query.includes("c.courseId - 1500000000"))).toBe(true);
    expect(result.coverageLimitations.length).toBeGreaterThan(0);
    expect(rollback).toHaveBeenCalledOnce(); expect(end).toHaveBeenCalledOnce();
  });
  it("falha incompleta encerra transação/conexão e não fabrica resultado zero", async () => {
    const rollback = vi.fn(); const end = vi.fn();
    await expect(checkRelationalIntegrity({ env: { DATABASE_URL: "mysql://test.invalid/db" }, connect: async () => ({
      execute: async (query: string) => { if (query.startsWith("SELECT")) throw new Error("permission denied"); return [[]]; }, rollback, end,
    }) })).rejects.toThrow("permission denied");
    expect(rollback).toHaveBeenCalledOnce(); expect(end).toHaveBeenCalledOnce();
  });
});
