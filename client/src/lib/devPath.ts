const rawPrefix = import.meta.env.VITE_DEV_PREFIX ?? "";

export const DEV_PREFIX = rawPrefix.replace(/\/+$/, "");

export function withAppBase(path: string) {
  if (!DEV_PREFIX || !path.startsWith("/")) return path;
  if (path === DEV_PREFIX || path.startsWith(`${DEV_PREFIX}/`)) return path;
  return `${DEV_PREFIX}${path}`;
}
