import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("melhorias da página pública", () => {
  it("mantém as novas seções comerciais na Home sem criar preview interno do produto", () => {
    const home = read("client/src/pages/Home.tsx");
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
    const home = read("client/src/pages/Home.tsx");
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
});
