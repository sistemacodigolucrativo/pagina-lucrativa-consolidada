import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const cssSource = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
const socialProofSource = readFileSync(resolve(process.cwd(), "client/src/components/PublicSocialProofToast.tsx"), "utf8");
const conversionCtaSource = readFileSync(resolve(process.cwd(), "client/src/components/PublicConversionCta.tsx"), "utf8");
const violetaSource = readFileSync(resolve(process.cwd(), "client/src/components/VioletaNeonActivationCard.tsx"), "utf8");
const previewSource = readFileSync(resolve(process.cwd(), "client/src/pages/Preview.tsx"), "utf8");
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
    expect(homeSource.indexOf('className="site-header"')).toBeLessThan(homeSource.indexOf('className="sales-hero"'));
    expect(homeSource.indexOf("affiliate-profile-hero")).toBeGreaterThan(homeSource.indexOf('className="sales-hero-copy reveal-item"'));
    expect(homeSource.indexOf("affiliate-profile-hero")).toBeLessThan(homeSource.indexOf('className="sales-kicker"'));
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
    expect(cssSource).toContain('.sales-page { min-height: 100vh; overflow: clip;');
    expect(cssSource).toContain('.affiliate-profile-hero { max-width: 610px;');
    expect(cssSource).toContain('.affiliate-profile-summary { display: flex;');
    expect(cssSource).toContain('.sales-hero { position: relative;');
  });

  it("extracts the digital structure visual into one independent landing section", () => {
    const heroStart = homeSource.indexOf('<section className="sales-hero" id="inicio">');
    const showcaseStart = homeSource.indexOf('<StructureDigitalShowcase image={heroImage} imageAlt={heroSection.defaultAlt} />');
    expect(heroStart).toBeGreaterThan(-1);
    expect(showcaseStart).toBeGreaterThan(heroStart);
    expect((homeSource.match(/<StructureDigitalShowcase/g) ?? []).length).toBe(1);
    expect(homeSource).toContain('className="sales-section structure-showcase"');
    expect(homeSource).toContain('id="estrutura-digital"');
    expect(homeSource).toContain('className="structure-showcase-stage"');
    expect(homeSource).toContain('className="sales-author-badge"');
    expect(homeSource).toContain('className="sprint-stamp"');
    expect(homeSource).toContain('className="sprint-paper-card"');
    expect(homeSource).not.toContain('className="sales-hero-side');
    expect(cssSource).toContain('.structure-showcase { position: relative;');
    expect(cssSource).toContain('.structure-showcase > .shell { position: relative;');
    expect(cssSource).toContain('.structure-showcase-stage { position: relative;');
  });

  it("mounts the social proof toast once at router scope and gates private routes", () => {
    expect((appSource.match(/<PublicSocialProofToast \/>/g) ?? []).length).toBe(1);
    expect((appSource.match(/<PublicConversionCta \/>/g) ?? []).length).toBe(1);
    expect(appSource).toContain('<WouterRouter base={base}><PublicSocialProofToast /><PublicConversionCta /><AppRoutes /></WouterRouter>');
    expect(socialProofSource).toContain('isPublicSocialProofRoute(location)');
    expect(socialProofSource).toContain('if (!isPublicSocialProofRoute(location) || publicSocialProofEntries.length === 0)');
    expect(socialProofSource).toContain('role="status"');
    expect(cssSource).toContain('.public-social-proof-toast { position: fixed;');
    expect(cssSource).toContain('pointer-events: none;');
  });

  it("keeps the original Violeta Neon Preview isolated from the public copy", () => {
    expect(previewSource).toContain('<OfferPreviewCard model="Modelo 05" title="Violeta neon" tone="violet" legacyClass="preview-model-05" />');
    expect(violetaSource).toContain('Independent public adaptation of the private Preview model 05');
    expect(homeSource).toContain('<VioletaNeonActivationCard');
    expect(homeSource).not.toContain('<form className="sales-price-card application-form"');
    expect(violetaSource).toContain('className="violeta-neon-activation-card application-form"');
    expect(violetaSource).toContain('onSubmit={onSubmit}');
  });

  it("mounts the public conversion CTA once with a safe fixed position", () => {
    expect(conversionCtaSource).toContain('isPublicConversionRoute(location)');
    expect(conversionCtaSource).toContain('href={withAppBase("/#f")}');
    expect(cssSource).toContain('.public-conversion-cta { position: fixed;');
    expect(cssSource).toContain('z-index: 54;');
    expect(cssSource).toContain('  .public-conversion-cta { right: 16px;');
    expect(cssSource).toContain('min-height: 52px; min-width: 52px;');
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

  it("renders a circular member chat FAB without changing chat behavior", () => {
    expect(homeSource).toContain('className="member-chat-fab"');
    expect(homeSource).toContain('aria-label="Chat de membros"');
    expect(homeSource).toContain('aria-disabled="true"');
    expect(homeSource).toContain('title="Chat de membros — em breve"');
    expect(homeSource).toContain('className="member-chat-fab-wrap"');
    expect(homeSource).toContain('<MessageCircle size={30} strokeWidth={2.2} />');
    expect(homeSource).not.toContain('member-chat-fab-label');
    expect(cssSource).toContain('.member-chat-fab-wrap { position: fixed;');
    expect(cssSource).toContain('width: 64px; height: 64px; min-height: 64px;');
    expect(cssSource).toContain('border-radius: 50%;');
    expect(cssSource).not.toContain('.member-chat-fab::after');
    expect(cssSource).toContain('.member-chat-fab { width: 58px; height: 58px; min-height: 58px; }');
  });

  it("keeps the simplified commercial navigation before utility routes and the CTA", () => {
    const publicNavigationStart = homeSource.indexOf("const publicNavigation = [");
    const utilityNavigationStart = homeSource.indexOf("const utilityNavigation = [");
    expect(publicNavigationStart).toBeGreaterThan(-1);
    expect(utilityNavigationStart).toBeGreaterThan(publicNavigationStart);
    const publicItems = [
      '["Como funciona", "#como-funciona"]',
      '["O que você recebe", "#o-que-recebe"]',
      '["Resultados", "#depoimentos"]',
      '["Dúvidas", "#faq"]',
    ];
    let previousIndex = publicNavigationStart;
    for (const item of publicItems) {
      const itemIndex = homeSource.indexOf(item, publicNavigationStart);
      expect(itemIndex).toBeGreaterThan(previousIndex);
      expect(itemIndex).toBeLessThan(utilityNavigationStart);
      previousIndex = itemIndex;
    }
    const utilityItems = [
      '["Acompanhar pedido", "/pedido/acompanhar"]',
      '["Entrar", "/acesso"]',
    ];
    previousIndex = utilityNavigationStart;
    for (const item of utilityItems) {
      const itemIndex = homeSource.indexOf(item, utilityNavigationStart);
      expect(itemIndex).toBeGreaterThan(previousIndex);
      previousIndex = itemIndex;
    }
    const navigationDeclarations = homeSource.slice(publicNavigationStart, homeSource.indexOf("function resolveNavigationHref"));
    for (const removedItem of [
      '["Início", "#inicio"]',
      '["Conheça a estrutura", "#estrutura"]',
      '["Vídeos", "#videos"]',
      '["Para quem é", "#perfil-ideal"]',
      '["Institucional", "/institucional"]',
      '["Perguntas frequentes", "#faq"]',
      '["Depoimentos", "#depoimentos"]',
    ]) expect(navigationDeclarations).not.toContain(removedItem);
    expect(homeSource).toContain('publicNavigation.map');
    expect(homeSource).toContain('utilityNavigation.map');
    expect(homeSource).toContain('className="nav-links-divider"');
    expect(homeSource).toContain('href="#f" className="nav-cta"');
    expect(cssSource).toContain('.nav-cta {');
    expect(homeSource).not.toContain('href={withAppBase("/preview")}');
    expect(homeSource).not.toContain('Preview</a>');
  });

  it("keeps every landing target and mobile overflow protection", () => {
    for (const id of ["inicio", "depoimentos", "o-que-recebe", "videos", "perfil-ideal", "faq", "f"]) {
      expect(homeSource).toContain(`id="${id}"`);
    }
    expect(homeSource).toContain('block.id === "problem_start" ? "como-funciona"');
    expect(homeSource).toContain('block.id === "product_real" ? "estrutura"');
    expect(homeSource).toContain('path.startsWith("#") ? path : withAppBase(path)');
    expect(homeSource).toContain('["Institucional", "/institucional"]');
    expect(homeSource).toContain('href={withAppBase(path)}');
    expect(cssSource).toContain('max-height: calc(100vh - 105px);');
    expect(cssSource).toContain('max-height: calc(100dvh - 105px);');
    expect(cssSource).toContain('overflow-y: auto;');
    expect(cssSource).toContain('scroll-padding-top: 84px;');
    expect(cssSource).toContain('.nav-links-divider {');
  });

  it("keeps native internal links inside the configured app base", () => {
    for (const source of internalLinkSources) expect(source).toContain("withAppBase");
    expect(homeSource).toContain('path.startsWith("#") ? path : withAppBase(path)');
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
