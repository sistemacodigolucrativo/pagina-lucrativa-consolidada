// Storage helpers compatible with both Manus WebDev and the standalone VPS deployment.
// When Forge credentials are available, uploads use the managed S3-compatible backend.
// On the VPS, uploads fall back to a persistent local directory and are served through
// the same /manus-storage/{key} URL contract.

import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { ENV } from "./_core/env";

const LOCAL_STORAGE_DIR = process.env.LOCAL_STORAGE_DIR || "/home/ubuntu/servicos/pagina-lucrativa/storage";

function hasForgeConfig() {
  return Boolean(ENV.forgeApiUrl && ENV.forgeApiKey);
}

function getForgeConfig() {
  if (!hasForgeConfig()) {
    throw new Error(
      "Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY",
    );
  }

  return {
    forgeUrl: ENV.forgeApiUrl.replace(/\/+$/, ""),
    forgeKey: ENV.forgeApiKey,
  };
}

function normalizeKey(relKey: string): string {
  const key = relKey.replace(/^\/+/, "").replace(/\\/g, "/");
  if (!key || key.split("/").some(part => part === ".." || part === "." || part === "")) {
    throw new Error("Invalid storage key");
  }
  return key;
}

function appendHashSuffix(relKey: string): string {
  const hash = randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

function toBuffer(data: Buffer | Uint8Array | string): Buffer {
  return typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
}

async function putLocal(key: string, data: Buffer | Uint8Array | string): Promise<void> {
  const target = path.resolve(LOCAL_STORAGE_DIR, key);
  const root = path.resolve(LOCAL_STORAGE_DIR);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new Error("Invalid storage destination");
  }
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, toBuffer(data));
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));

  if (!hasForgeConfig()) {
    await putLocal(key, data);
    return { key, url: `/manus-storage/${key}` };
  }

  const { forgeUrl, forgeKey } = getForgeConfig();
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);

  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` },
  });
  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
  }

  const { url: s3Url } = (await presignResp.json()) as { url: string };
  if (!s3Url) throw new Error("Forge returned empty presign URL");

  const blob = new Blob([toBuffer(data) as any], { type: contentType });
  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });
  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }

  return { key, url: `/manus-storage/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/manus-storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  if (!hasForgeConfig()) return `/manus-storage/${key}`;

  const { forgeUrl, forgeKey } = getForgeConfig();
  const getUrl = new URL("v1/storage/presign/get", forgeUrl + "/");
  getUrl.searchParams.set("path", key);
  const resp = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` },
  });
  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText);
    throw new Error(`Storage signed URL failed (${resp.status}): ${msg}`);
  }
  const { url } = (await resp.json()) as { url: string };
  return url;
}

export { LOCAL_STORAGE_DIR, normalizeKey };
