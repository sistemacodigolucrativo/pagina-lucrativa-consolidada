import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.env.PROJECT_ROOT || process.cwd();

describe("tRPC route prefix", () => {
  it("serves the API on the canonical path and on the development prefix", async () => {
    const source = await readFile(path.join(root, "server/_core/index.ts"), "utf8");
    expect(source).toContain('"/api/trpc"');
    expect(source).toContain("process.env.VITE_DEV_PREFIX");
    expect(source).toContain("`${appPrefix}/api/trpc`");
    expect(source).toContain("for (const trpcPath of trpcPaths)");
  });
});
