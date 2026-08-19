import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("local storage fallback", () => {
  let tempDir: string;
  let storage: typeof import("./storage");
  const previousLocalDir = process.env.LOCAL_STORAGE_DIR;
  const previousForgeUrl = process.env.BUILT_IN_FORGE_API_URL;
  const previousForgeKey = process.env.BUILT_IN_FORGE_API_KEY;

  beforeAll(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "pagina-lucrativa-storage-"));
    process.env.LOCAL_STORAGE_DIR = tempDir;
    delete process.env.BUILT_IN_FORGE_API_URL;
    delete process.env.BUILT_IN_FORGE_API_KEY;
    storage = await import("./storage");
  });

  afterAll(async () => {
    if (previousLocalDir === undefined) delete process.env.LOCAL_STORAGE_DIR;
    else process.env.LOCAL_STORAGE_DIR = previousLocalDir;
    if (previousForgeUrl === undefined) delete process.env.BUILT_IN_FORGE_API_URL;
    else process.env.BUILT_IN_FORGE_API_URL = previousForgeUrl;
    if (previousForgeKey === undefined) delete process.env.BUILT_IN_FORGE_API_KEY;
    else process.env.BUILT_IN_FORGE_API_KEY = previousForgeKey;
    await rm(tempDir, { recursive: true, force: true });
  });

  it("writes bytes and returns the same manus-storage URL contract", async () => {
    const content = Buffer.from("profile-fixture");
    const stored = await storage.storagePut("member-profiles/2/profile.png", content, "image/png");
    const saved = await readFile(path.join(tempDir, stored.key));

    expect(stored.url).toBe(`/manus-storage/${stored.key}`);
    expect(saved.equals(content)).toBe(true);
    await expect(storage.storageGetSignedUrl(stored.key)).resolves.toBe(stored.url);
  });

  it("rejects traversal attempts before writing outside the storage root", async () => {
    await expect(storage.storagePut("../outside.txt", "unsafe")).rejects.toThrow("Invalid storage key");
  });
});
