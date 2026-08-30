import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([".git", "node_modules", "dist", "build", "coverage", ".turbo", ".next"]);
const ignoredFiles = new Set(["server/legacyBranding.guard.test.ts"]);
const textExtensions = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".yml", ".yaml", ".css", ".html", ".sh", ".sql", ".txt", ".toml", ".env",
]);

const legacyPatterns = [
  /Página Lucrativa/gi,
  /Pagina Lucrativa/gi,
  /página lucrativa/gi,
  /pagina lucrativa/gi,
  /pagina-lucrativa/gi,
  /pagina_lucrativa/gi,
  /paginaLucrativa/g,
  /PaginaLucrativa/g,
];

function isTextFile(path: string) {
  const extension = extname(path).toLowerCase();
  return textExtensions.has(extension) || path.endsWith(".env.example") || path.endsWith(".env.local.example");
}

function collectFiles(directory: string, output: string[] = []) {
  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) continue;
    const absolute = join(directory, entry);
    try {
      const info = statSync(absolute);
      if (info.isDirectory()) collectFiles(absolute, output);
      else if (info.isFile() && isTextFile(absolute) && !ignoredFiles.has(relative(root, absolute))) output.push(absolute);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "ENOENT") throw error;
    }
  }
  return output;
}

describe("legacy branding guard", () => {
  it("does not leave Página Lucrativa branding in project text files", () => {
    const findings: string[] = [];
    for (const file of collectFiles(root)) {
      const source = readFileSync(file, "utf8");
      const lines = source.split(/\r?\n/);
      lines.forEach((line, index) => {
        for (const pattern of legacyPatterns) {
          pattern.lastIndex = 0;
          if (pattern.test(line)) findings.push(`${relative(root, file)}:${index + 1}: ${line.trim()}`);
        }
      });
    }
    if (findings.length) console.error(`\nLEGACY BRANDING FINDINGS (${findings.length})\n${findings.join("\n")}\n`);
    expect(findings).toEqual([]);
  });
});
