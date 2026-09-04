import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");
const home = read("client/src/pages/Home.tsx");
const css = read("client/src/index.css");
const activationCard = read("client/src/components/VioletaNeonActivationCard.tsx");

describe("melhorias da página pública", () => {
  it("mantém as novas seções comerciais na Home sem criar preview interno do produto", () => {
    expect(home).toContain("salesSocialProof.useQuery");
    expect(home).toContain("Total de membros");
    expect(home).toContain("Avaliação média");
    expect(home).toContain("Tudo o que você recebe");
    expect(home).toContain("Para quem é");
    expect(home).toContain("Para quem não é");
    expect(home).toContain("DÚVIDAS COMUNS");
    expect(home).toContain("PUBLIC_SALES_DECISION_OBJECTIONS");
    expect(home).toContain("coreSalesSectionIds");
    expect(home).toContain('"activation_journey"');
    expect(activationCard).toContain("pagamento único");
    expect(home).not.toContain("const objectionItems = [");
    expect(home).not.toContain('"state_desired"');
    expect(home.indexOf('className="sales-section sales-package"')).toBeLessThan(home.indexOf('className="sales-section sales-social-proof"'));
    expect(home).not.toContain('className="sales-section sales-faq"');
    expect(home).not.toContain('id="faq"');
    expect(home).not.toContain("plataforma por dentro");
  });

  it("registra páginas institucionais separadas e links de rodapé", () => {
    const app = read("client/src/App.tsx");
    const publicInfo = read("client/src/pages/PublicInfoPage.tsx");
    expect(app).toContain('path="/institucional" component={InstitutionalPage}');
    expect(app).toContain('path="/termos-de-uso" component={TermsPage}');
    expect(app).toContain('path="/politica-de-privacidade" component={PrivacyPage}');
    expect(app).toContain('path="/regras-comerciais" component={CommercialRulesPage}');
    expect(app).toContain('path="/perguntas-frequentes" component={FaqPage}');
    expect(app).toContain('path="/contato" component={ContactPage}');
    expect(home).toContain('["Dúvidas", "/perguntas-frequentes"]');
    expect(home).toContain('["Perguntas frequentes", "/perguntas-frequentes"]');
    expect(home).toContain("footerLinks");
    expect(publicInfo).toContain("Quem está por trás do Método Código Lucrativo");
    expect(publicInfo).toContain("Respostas para decidir com segurança");
    expect(publicInfo).toContain("PUBLIC_SALES_FAQ");
    expect(publicInfo).toContain("public-info-faq-list");
    expect(publicInfo).toContain("public-info-faq-item");
    expect(publicInfo).toContain("<summary><span>{title}</span></summary>");
    const publicFaq = read("shared/publicSalesFaq.ts");
    expect(publicFaq).toContain("O que exatamente estou comprando?");
    expect(publicFaq).toContain("Existe suporte?");
    expect((publicFaq.match(/question: "/g) ?? []).length).toBe(10);
    const objections = read("shared/publicSalesObjections.ts");
    expect((objections.match(/question: "/g) ?? []).length).toBe(16);
    expect(objections).toContain("Não existe mensalidade.");
    expect(publicInfo).toContain("História do método");
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
    expect(home).not.toContain('className="footer-panel footer-support-card"');
    expect(home).not.toContain("Falar pelo WhatsApp");
    expect(home).not.toContain(">Atendimento<");
    expect(home).toContain('className="shell footer-bottom"');
    expect(css).toContain("grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr));");
    expect(css).toContain("env(safe-area-inset-bottom, 0px)");
  });
});
