import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");
const home = read("client/src/pages/Home.tsx");
const css = read("client/src/index.css");

describe("melhorias da página pública", () => {
  it("mantém as novas seções comerciais na Home sem criar preview interno do produto", () => {
    expect(home).toContain("salesSocialProof.useQuery");
    expect(home).toContain("Total de membros");
    expect(home).toContain("Avaliação média");
    expect(home).toContain("Tudo o que você recebe");
    expect(home).toContain("Para quem é");
    expect(home).toContain("Para quem não é");
    expect(home).toContain("O que costuma travar a decisão");
    expect(home).not.toContain("plataforma por dentro");
  });

  it("registra páginas institucionais separadas e links de rodapé", () => {
    const app = read("client/src/App.tsx");
    const publicInfo = read("client/src/pages/PublicInfoPage.tsx");
    expect(app).toContain('path="/institucional" component={InstitutionalPage}');
    expect(app).toContain('path="/termos-de-uso" component={TermsPage}');
    expect(app).toContain('path="/politica-de-privacidade" component={PrivacyPage}');
    expect(app).toContain('path="/regras-comerciais" component={CommercialRulesPage}');
    expect(app).toContain('path="/contato" component={ContactPage}');
    expect(home).toContain("footerLinks");
    expect(publicInfo).toContain("Quem está por trás do Código Lucrativo");
    expect(publicInfo).toContain("História do projeto");
    expect(publicInfo).toContain("Origem da ideia");
    expect(publicInfo).toContain("Tempo de atuação");
  });

  it("mantém as estrelas horizontais e o rodapé premium responsivo", () => {
    expect(css).toContain(".social-proof-stats article > span");
    expect(css).toContain("flex-wrap: nowrap");
    expect(css).toContain(".rating-star-wrap { position: relative; display: inline-grid; flex: 0 0 18px;");
    expect(home).toContain('className="shell footer-shell"');
    expect(home).toContain('className="footer-panel footer-brand-block"');
    expect(home).toContain('className="footer-panel footer-navigation"');
    expect(home).toContain('className="footer-panel footer-support-card"');
    expect(home).toContain('className="shell footer-bottom"');
    expect(css).toContain("grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr));");
    expect(css).toContain("env(safe-area-inset-bottom, 0px)");
  });
});
