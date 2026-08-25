import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const cssSource = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
const operationsSource = readFileSync(resolve(process.cwd(), "client/src/pages/MemberOperations.tsx"), "utf8");
const internalLinkSources = [
  "client/src/pages/ApplicationConfirmation.tsx",
  "client/src/pages/Home.tsx",
  "client/src/pages/MemberAccount.tsx",
  "client/src/pages/MemberAffiliateOrders.tsx",
  "client/src/pages/MemberOffice.tsx",
  "client/src/pages/MemberTraffic.tsx",
  "client/src/pages/PersonalizeAccess.tsx",
].map(file => readFileSync(resolve(process.cwd(), file), "utf8"));

describe("public responsive header and hero layout", () => {
  it("renders one header before the hero profile presentation", () => {
    expect((homeSource.match(/className=\"site-header\"/g) ?? []).length).toBe(1);
    expect(homeSource.indexOf('className="site-header"')).toBeLessThan(homeSource.indexOf("affiliate-sponsor-strip"));
    expect(homeSource.indexOf("affiliate-sponsor-strip")).toBeLessThan(homeSource.indexOf('className="sales-hero"'));
    expect(homeSource).not.toContain("affiliate-banner");
  });

  it("places the promo banner immediately after the hero headline", () => {
    const headline = 'sem construir toda a estrutura sozinho.</h1>';
    const banner = '<TopPromoBanner />';
    expect(homeSource.indexOf(headline)).toBeGreaterThan(-1);
    expect(homeSource.indexOf(banner)).toBeGreaterThan(homeSource.indexOf(headline));
    expect(homeSource.indexOf(banner)).toBeLessThan(homeSource.indexOf('Receba acesso a uma Página Lucrativa'));
    expect(cssSource).toContain('.sales-hero-copy > .top-promo-banner {');
  });

  it("keeps the navbar sticky and the hero presentation responsive", () => {
    expect(cssSource).toContain('.site-header { position: sticky; top: 0; z-index: 50;');
    expect(cssSource).toContain('.affiliate-sponsor-strip { position: relative;');
    expect(cssSource).toContain('.affiliate-sponsor-inner { display: grid;');
    expect(cssSource).toContain('.sales-hero { position: relative;');
  });

  it("removes only the navbar CTA and keeps other section CTAs", () => {
    expect(homeSource).not.toContain('<div className="nav-actions"><JoinButton /></div>');
    expect(homeSource).toContain('<div className="sales-actions"><JoinButton />');
    expect((homeSource.match(/<JoinButton/g) ?? []).length).toBe(2);
    expect(homeSource).toContain('className="mobile-menu-button"');
    expect(homeSource.indexOf('className="mobile-menu-button"')).toBeGreaterThan(homeSource.indexOf('aria-label="Navegação principal"'));
  });

  it("uses header-relative mobile menu positioning and keeps the hamburger at the right edge", () => {
    expect(cssSource).toContain('.nav-links { position: absolute; top: calc(100% + 8px);');
    expect(cssSource).toContain('.mobile-menu-button { display: none; flex: 0 0 auto;');
    expect(cssSource).toContain('margin-left: auto;');
    expect(cssSource).toContain('  .mobile-menu-button { display: inline-flex; }');
    expect(cssSource).toContain('  .sales-hero { min-height: auto; padding: 38px 0 70px; }');
  });

  it("loads the edited promo banner through the environment-aware app base", () => {
    expect(homeSource).toContain('import { withAppBase } from "@/lib/devPath";');
    expect(homeSource).toContain('const promoBannerImage = withAppBase("/codigo-lucrativo-banner.png");');
    expect(homeSource).toContain('<img src={promoBannerImage}');
  });

  it("breaks and centers the hero trust statement responsively", () => {
    expect(homeSource).toContain('className="sales-trust-copy"');
    expect(homeSource).toContain('className="sales-trust-break"');
    expect(homeSource).toContain('className="sales-trust sales-trust-featured"');
    expect(cssSource).toContain('justify-content: center;');
    expect(cssSource).toContain('text-align: center;');
    expect(cssSource).toContain('.sales-trust-break { display: block; }');
    expect(cssSource).toContain('.sales-trust-featured {');
    expect(cssSource).toContain('@keyframes sales-trust-glow');
  });

  it("keeps the requested development-only mechanism demonstration text", () => {
    expect(homeSource).toContain("A estrutura já existe. Você personaliza");
    const mechanismSource = readFileSync(resolve(process.cwd(), "shared/publicSalesSections.ts"), "utf8");
    expect(mechanismSource).toContain("centenas de pessoas já estão ganhando e faturando através desse sistema único e exclusivo");
    expect(mechanismSource).toContain("Receber dinheiro de forma automaticamente a partir de suas primeiras divulgações");
    expect(mechanismSource).toContain("E ter vendas garantidas.");
  });
  it("resolves public section images by stable IDs and keeps automatic placement", () => {
    expect(homeSource).toContain('const sectionImages = trpc.public.salesSectionImages.useQuery();');
    expect(homeSource).toContain('const resolveSectionImage = (sectionId: string, fallback: string | null) => {');
    expect(homeSource).toContain('key={block.id}');
    expect(homeSource).toContain('comparison-image-fill');
    expect(cssSource).toContain('.reference-copy-content > .comparison-image-fill { width: 100%; }');
    expect(cssSource).toContain('.comparison-image-fill img { object-fit: cover; }');
    expect(homeSource).toContain('section.id !== "hero_operation"');
  });

  it("keeps the promo banner permanent and removes its close control", () => {
    expect(homeSource).toContain('<TopPromoBanner />');
    expect(homeSource).not.toContain('showTopPromoBanner');
    expect(homeSource).not.toContain('top-promo-close');
    expect(cssSource).not.toContain('.top-promo-close');
  });

  it("renders a structural member chat FAB without chat behavior", () => {
    expect(homeSource).toContain('className="member-chat-fab"');
    expect(homeSource).toContain('aria-label="Chat de membros"');
    expect(homeSource).toContain('aria-disabled="true"');
    expect(homeSource).toContain('className="member-chat-fab-wrap"');
    expect(cssSource).toContain('.member-chat-fab-wrap { position: fixed;');
  });

  it("links Preview to a separate experimental page", () => {
    expect(homeSource).toContain('href={withAppBase("/preview")}');
    expect(homeSource).not.toContain('previewOpen');
    expect(homeSource).not.toContain('preview-area');
  });

  it("keeps native internal links inside the configured app base", () => {
    for (const source of internalLinkSources) expect(source).toContain("withAppBase");
    expect(homeSource).toContain('href={withAppBase("/acesso")}');
  });

  it("shows a complete environment-aware tracking URL for each campaign", () => {
    expect(operationsSource).toContain('const referralUrl =');
    expect(operationsSource).toContain('const appHomeUrl =');
    expect(operationsSource).toContain('const campaignUrl =');
    expect(operationsSource).toContain('const path = memberSlug ? `/r/${encodeURIComponent(memberSlug)}/${encodeURIComponent(slug)}`');
    expect(operationsSource).toContain('href={campaignUrl(item.slug)}');
    expect(operationsSource).toContain('Use este link para rastrear acessos vindos de');
    expect(operationsSource).toContain('onClick={() => copyCampaignLink(item.id, item.slug)}');
    expect(operationsSource).toContain("Copiar link");
    expect(operationsSource).toContain("O link rastreável será gerado após o cadastro.");
    expect(operationsSource).toContain('readOnly type="url"');
  });
});
