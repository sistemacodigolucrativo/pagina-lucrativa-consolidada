import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const profileSource = readFileSync(resolve(process.cwd(), "client/src/pages/MemberProfile.tsx"), "utf8");
const cssSource = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

describe("public profile summary and modal", () => {
  it("keeps Editar perfil as the single profile configuration entry", () => {
    expect(profileSource).toContain('label: "Editar perfil"');
    expect(profileSource).not.toContain('label: "Perfil público"');
    expect(homeSource).toContain("affiliate-banner");
    expect(homeSource).toContain("affiliate-profile-hero");
    expect(homeSource).toContain("affiliate-profile-summary");
  });

  it("shows only essential summary information and exposes Ver mais dialog", () => {
    expect(homeSource).toContain("affiliate-profile-avatar");
    expect(homeSource).toContain("withAppBase(effectiveAffiliate.photoUrl)");
    expect(homeSource).not.toContain("affiliate-profile-kicker");
    expect(homeSource).not.toContain("Esta estrutura está sendo apresentada por");
    expect(homeSource).toContain("publicProfileName");
    expect(homeSource).toContain("publicSocialLinks");
    expect(homeSource).toContain(">Ver perfil</button>");
    expect(homeSource).not.toContain("reference-presenter");
    expect(homeSource).toContain("footer-whatsapp");
    expect(homeSource).toContain("affiliate-profile-modal-backdrop");
    expect(homeSource).toContain('role="dialog"');
    expect(homeSource).toContain('aria-modal="true"');
    expect(homeSource).toContain('event.key === "Escape"');
    expect(homeSource).toContain('document.body.style.overflow = "hidden"');
  });

  it("provides scroll-safe responsive modal styles", () => {
    expect(cssSource).toContain(".affiliate-banner { position: relative;");
    expect(cssSource).toContain(".affiliate-profile-hero { max-width: none;");
    expect(cssSource).toContain(".affiliate-profile-summary { display: flex;");
    expect(cssSource).toContain(".affiliate-profile-avatar { flex: 0 0 auto; width: 48px; height: 48px;");
    expect(cssSource).toContain(".affiliate-profile-presenter { display: block; overflow: hidden; color: #D98A28;");
    expect(cssSource).toContain(".affiliate-profile-name { display: block;");
    expect(cssSource).toContain("font: 650 clamp(12px, 4cqw, 15px)/1.16");
    expect(cssSource).toContain("overflow-wrap: anywhere;");
    const nameRule = cssSource.match(/\\.affiliate-profile-name \\{[^}]+\\}/)?.[0] ?? "";
    expect(nameRule).not.toContain("text-overflow");
    expect(nameRule).not.toContain("white-space: nowrap");
    expect(cssSource).toContain("text-align: center;");
    expect(cssSource).toContain("min-height: 30px; padding: 6px 10px;");
    expect(cssSource).toContain(".footer-whatsapp");
    expect(cssSource).toContain(".affiliate-profile-modal-backdrop { position: fixed;");
    expect(cssSource).toContain("max-height: min(720px, calc(100vh - 32px)); overflow-y: auto;");
    expect(cssSource).toContain(".affiliate-profile-modal-backdrop { align-items: end; padding: 10px; }");
    expect(cssSource).toContain("max-height: calc(100vh - 20px);");
    expect(cssSource).toContain(".affiliate-profile-hero { padding: 11px 0; }");
    expect(cssSource).toContain(".affiliate-profile-avatar { width: 42px; height: 42px; border-radius: 9px; }");
  });
});
