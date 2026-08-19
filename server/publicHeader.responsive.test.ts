import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const cssSource = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

describe("public responsive header and hero layout", () => {
  it("renders one header before the hero profile presentation", () => {
    expect((homeSource.match(/className=\"site-header\"/g) ?? []).length).toBe(1);
    expect(homeSource.indexOf('className="site-header"')).toBeLessThan(homeSource.indexOf("affiliate-profile-hero"));
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
    expect(cssSource).toContain('.affiliate-profile-hero { max-width: 610px;');
    expect(cssSource).toContain('.affiliate-profile-hero .affiliate-profile-summary { margin-left: -3px; }');
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

  it("loads the state-desired image inside block 02 with the production path", () => {
    expect(homeSource).toContain('const stateDesiredImage = "/state-desired.png";');
    expect(homeSource).toContain('{index === 1 && <div className="reference-image-frame inline-reference-image">');
    expect(homeSource).toContain('alt="Estrutura digital pronta e validada');
  });

  it("keeps Preview temporary and isolated from the public flow", () => {
    expect(homeSource).toContain('<a href="#preview" onClick={openPreview}>Preview</a>');
    expect(homeSource).toContain('const [previewOpen, setPreviewOpen] = useState(false);');
    expect(homeSource).toContain('{previewOpen ? <section className="sales-section preview-area" id="preview"');
    expect(homeSource).toContain('onClick={() => setPreviewOpen(false)}>Ocultar Preview</button>');
    expect(homeSource).toContain('não fazem parte da oferta pública');
    expect(homeSource).toContain('className="preview-grid"');
    expect(homeSource).toContain('Modelo 01');
    expect(homeSource).toContain('Modelo 02');
    expect(cssSource).toContain('.preview-grid { display: grid;');
  });

});
