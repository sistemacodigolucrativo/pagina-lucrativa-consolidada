import { beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ rows: [] as any[], where: vi.fn() }));
vi.mock("./_core/env", () => ({ ENV: { databaseUrl: "mysql://test.invalid/test", isProduction: false } }));
vi.mock("drizzle-orm/mysql2", () => ({ drizzle: () => ({ select: () => ({ from: () => ({ where: state.where }) }) }) }));
import { getPublishedContent } from "./db";

describe("CRIT-02: conteúdo de membros", () => {
  beforeEach(() => {
    state.where.mockReturnValue({ orderBy: async () => state.rows });
    state.rows = [
      { id: 1, kind: "notice", status: "published", resourceCategory: "member-admin-control", body: "internal", createdBy: 90 },
      { id: 2, kind: "notice", status: "published", resourceCategory: "public-sales-copy" },
      { id: 3, kind: "notice", status: "published", resourceCategory: "public-sales-layout" },
      { id: 4, kind: "notice", status: "published", resourceCategory: "public-toast-config" },
      { id: 5, kind: "faq", status: "published", resourceCategory: null, title: "Ajuda", createdBy: 90 },
      { id: 6, kind: "material", status: "published", resourceCategory: "Produtividade", createdBy: 90 },
      { id: 7, kind: "article", status: "draft", resourceCategory: null },
    ];
  });
  it("exclui controles e configurações internas, preservando conteúdo comum publicado", async () => {
    const rows = await getPublishedContent();
    expect(rows.map(row => row.id)).toEqual([5, 6]);
    expect(rows.every(row => !("createdBy" in row))).toBe(true);
    expect(JSON.stringify(rows)).not.toContain("internal");
    expect(state.where).toHaveBeenCalled();
  });
});
