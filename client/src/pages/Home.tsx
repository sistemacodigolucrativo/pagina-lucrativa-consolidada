import { FormEvent, type KeyboardEvent as ReactKeyboardEvent, type TouchEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, LogIn, Menu, MessageCircle, Star, X } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { withAppBase } from "@/lib/devPath";
import { normalizeAffiliateSlug } from "@shared/affiliateAttribution";
import { normalizeEmail, normalizePhone } from "@shared/contactValidation";
import { PUBLIC_SALES_SECTIONS } from "@shared/publicSalesSections";
import { savePaymentAccessToken } from "@/lib/applicationPaymentAccess";
import { toast } from "sonner";
import VioletaNeonActivationCard from "@/components/VioletaNeonActivationCard";
import PublicSocialProofToast from "@/components/PublicSocialProofToast";
import PublicConversionCta from "@/components/PublicConversionCta";
import { usePublicSalesCopy } from "@/components/PublicSalesCopyRuntime";
import {
  getPublicSalesContentOverride,
  getPublicSalesContentValue,
  type PublicSalesContentSnapshot,
} from "@shared/publicSalesContent";

const promoBannerImage = withAppBase("/codigo-lucrativo-banner.png");
const heroSection = PUBLIC_SALES_SECTIONS[0];
const coreSalesSectionIds = new Set([
  "problem_start",
  "behind_structure",
  "activation_journey",
  "comparison",
  "not_just_course",
  "ease_real",
]);
const contentBlocks = PUBLIC_SALES_SECTIONS.filter(section => coreSalesSectionIds.has(section.id));



const footerLinks = [
  ["Termos de Uso", "/termos-de-uso"],
  ["Política de Privacidade", "/politica-de-privacidade"],
  ["Regras comerciais", "/regras-comerciais"],
  ["Perguntas frequentes", "/perguntas-frequentes"],
  ["Contato / suporte", "/contato"],
  ["Institucional", "/institucional"],
];

const publicNavigation = [
  ["Como funciona", "#como-funciona"],
  ["O que você recebe", "#o-que-recebe"],
  ["Resultados", "#depoimentos"],
  ["Dúvidas", "/perguntas-frequentes"],
] as const;

const utilityNavigation = [
  ["Acompanhar pedido", "/pedido/acompanhar"],
] as const;

function publicCopy(content: PublicSalesContentSnapshot, sectionId: string, key: string, fallback: string) {
  return getPublicSalesContentValue(content, sectionId, key) ?? fallback;
}

function resolveNavigationHref(path: string) {
  return path.startsWith("#") ? path : withAppBase(path);
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={`brand ${compact ? "brand-compact" : ""}`}><span className="brand-mark" aria-hidden="true">CL</span><span>Método Código Lucrativo</span></span>;
}

function Eyebrow({ children }: { children: string }) {
  return <div className="eyebrow"><span aria-hidden="true" />{children}</div>;
}

function JoinButton({ className = "", visualKey }: { className?: string; visualKey?: string }) {
  return <a href="#f" data-public-visual-key={visualKey} className={`btn btn-primary ${className}`.trim()}>Quero ativar minha estrutura <ArrowUpRight size={16} /></a>;
}

function TopPromoBanner() {
  return <section className="top-promo-banner" aria-label="Apresentação do Método Código Lucrativo">
    <img data-public-visual-key="hero-banner" src={promoBannerImage} alt="Método Código Lucrativo pronto para começar, com estrutura consolidada, Escritório Virtual, ferramentas e treinamentos." />
  </section>;
}

function SalesTrustCard({ trust, placement }: { trust?: string; placement: "desktop" | "mobile" }) {
  return <div className={`sales-trust sales-trust-featured sales-trust-featured-${placement}`}>
    <span className="sales-pulse" />
    {trust
      ? <span className="sales-trust-copy">{trust}</span>
      : <span className="sales-trust-copy">Você recebe uma estrutura pronta, entende o método,<br className="sales-trust-break" />ativa sua operação e acompanha tudo em um só lugar.</span>}
  </div>;
}

function RatingStars({ rating }: { rating: number }) {
  return <span className="rating-stars" aria-hidden="true">
    {Array.from({ length: 5 }).map((_, index) => {
      const fillPercent = Math.max(0, Math.min(1, rating - index)) * 100;
      return <span key={index} className="rating-star-wrap">
        <Star size={18} />
        <span className="rating-star-fill" style={{ width: `${fillPercent}%` }}><Star size={18} fill="currentColor" /></span>
      </span>;
    })}
  </span>;
}

function formatPublicCounter(value: number) {
  return Math.max(0, Math.round(value)).toLocaleString("pt-BR");
}

function AnimatedMemberCount({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
  const counterRef = useRef<HTMLElement | null>(null);
  const finalValue = Math.max(0, Math.round(value));

  useEffect(() => {
    setDisplayValue(hasEnteredViewport ? finalValue : 0);
  }, [finalValue, hasEnteredViewport]);

  useEffect(() => {
    if (hasEnteredViewport || typeof window === "undefined") return;
    const element = counterRef.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      setHasEnteredViewport(true);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setHasEnteredViewport(true);
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasEnteredViewport]);

  useEffect(() => {
    if (!hasEnteredViewport || typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || finalValue === 0) {
      setDisplayValue(finalValue);
      return;
    }
    let frame = 0;
    const duration = 1_600;
    const start = window.performance.now();
    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(finalValue * eased));
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [finalValue, hasEnteredViewport]);

  return <strong ref={counterRef}>{formatPublicCounter(displayValue)}</strong>;
}

const virtualOfficeSlides = [
  { id: "method", title: "Método e estrutura", caption: "Base de apresentação e dados essenciais preparados para iniciar sua operação." },
  { id: "office", title: "Escritório Virtual", caption: "Painel para centralizar perfil, pedidos, campanhas e acompanhamento." },
  { id: "campaigns", title: "Campanhas de divulgação", caption: "Links e canais organizados para divulgar com mais clareza." },
  { id: "orders", title: "Pedidos e acompanhamento", caption: "Solicitações, pagamento, comprovante e status reunidos no fluxo existente." },
  { id: "library", title: "Biblioteca e Academia", caption: "Materiais e conteúdos de apoio para aprender e executar." },
];

function StructureDigitalShowcase({ image, imageAlt, content }: { image: string | null; imageAlt: string; content: PublicSalesContentSnapshot }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const sectionCopy = (key: string, fallback: string) => publicCopy(content, "structure_showcase", key, fallback);
  const previousSlide = () => setActiveSlide(current => current === 0 ? virtualOfficeSlides.length - 1 : current - 1);
  const nextSlide = () => setActiveSlide(current => current === virtualOfficeSlides.length - 1 ? 0 : current + 1);
  const handleCarouselKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previousSlide();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextSlide();
    }
  };
  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0]?.clientX ? event.changedTouches[0].clientX - touchStartX.current : 0;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 36) return;
    if (deltaX > 0) previousSlide();
    else nextSlide();
  };

  return <section className="sales-section structure-showcase" id="estrutura-digital" aria-labelledby="structure-showcase-title">
    <div className="shell">
      <div className="structure-showcase-heading">
        <Eyebrow>{sectionCopy("eyebrow", "Estrutura digital")}</Eyebrow>
        <h2 id="structure-showcase-title">{sectionCopy("title", "Pronta para operar.")}</h2>
        <p>{sectionCopy("description", "Uma composição visual da base pronta que você entende, ativa, divulga e acompanha no Escritório Virtual.")}</p>
      </div>
      <div className="structure-showcase-stage">
        <div className="hero-photo-wrap virtual-office-carousel" role="region" aria-roledescription="carrossel" aria-label="Demonstração visual do Escritório Virtual" tabIndex={0} onKeyDown={handleCarouselKeyDown} onTouchStart={event => { touchStartX.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={handleTouchEnd}>
          {image ? <img data-public-visual-key="office-preview" src={image} alt={imageAlt} aria-hidden="true" /> : null}
          <div className="photo-overlay" aria-hidden="true" />
          <div className="virtual-office-carousel-controls" aria-label="Controles do carrossel">
            <button data-public-visual-key="previous-slide" type="button" onClick={previousSlide} aria-label="Ver tela anterior do Escritório Virtual"><ChevronLeft size={16} /></button>
            <div className="virtual-office-carousel-dots" role="tablist" aria-label="Telas do Escritório Virtual">
              {virtualOfficeSlides.map((slide, index) => <button key={slide.id} data-public-visual-key={`slide-${slide.id}`} type="button" role="tab" aria-selected={index === activeSlide} aria-label={`Ver ${slide.title}`} onClick={() => setActiveSlide(index)} />)}
            </div>
            <button data-public-visual-key="next-slide" type="button" onClick={nextSlide} aria-label="Ver próxima tela do Escritório Virtual"><ChevronRight size={16} /></button>
          </div>
        </div>
        <SalesTrustCard trust={getPublicSalesContentOverride(content, "hero", "trust")} placement="mobile" />
        <div className="sales-author-badge"><strong>Estrutura digital</strong><span>·</span> pronta para operar</div>
      </div>
    </div>
  </section>;
}

export default function Home({ content: providedContent }: { content?: PublicSalesContentSnapshot } = {}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDetailsOpen, setProfileDetailsOpen] = useState(false);
  const [openObjectionIndex, setOpenObjectionIndex] = useState<number | null>(null);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [applicationContact, setApplicationContact] = useState({ email: "", whatsapp: "" });
  const navMenuRef = useRef<HTMLElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const session = trpc.auth.me.useQuery();
  const sectionImages = trpc.public.salesSectionImages.useQuery();
  const socialProof = trpc.public.salesSocialProof.useQuery();
  const providerContent = usePublicSalesCopy().content;
  const content = providedContent ?? providerContent;
  const imageBySection = useMemo(() => new Map((sectionImages.data ?? []).map(image => [image.sectionId, image])), [sectionImages.data]);
  const resolveSectionImage = (sectionId: string, fallback: string | null) => {
    const saved = imageBySection.get(sectionId);
    if (saved?.status === "removed") return null;
    return saved?.imageUrl ? withAppBase(saved.imageUrl) : fallback ? withAppBase(fallback) : null;
  };
  const heroImage = resolveSectionImage(heroSection.id, heroSection.defaultImage);
  useEffect(() => {
    if (sectionImages.isLoading || socialProof.isLoading) return;
    const targetId = window.location.hash.slice(1);
    if (!targetId) return;
    let firstFrame = 0;
    let secondFrame = 0;
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({ block: "start" });
      });
    });
    return () => {
      if (firstFrame) window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [sectionImages.isLoading, socialProof.isLoading]);

  useEffect(() => {
    if (!profileDetailsOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileDetailsOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileDetailsOpen]);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (navMenuRef.current?.contains(target) || menuButtonRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    window.addEventListener("pointerdown", closeOnOutsideClick);
    return () => window.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [menuOpen]);
  const [, setLocation] = useLocation();
  const affiliateParams = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  const hasExplicitAffiliate = affiliateParams?.has("afiliado") ?? false;
  const explicitAffiliateSlug = normalizeAffiliateSlug(affiliateParams?.get("afiliado"));
  const affiliate = trpc.public.affiliateProfile.useQuery({ slug: explicitAffiliateSlug ?? "codigo-lucrativo" }, { enabled: Boolean(explicitAffiliateSlug) });
  const affiliateLookupPending = Boolean(explicitAffiliateSlug && affiliate.isLoading);
  const defaultAffiliate = trpc.public.defaultAffiliateProfile.useQuery(undefined, { enabled: !affiliate.data });
  const isResolvedExplicitAffiliate = hasExplicitAffiliate && Boolean(explicitAffiliateSlug && affiliate.data?.slug);
  const isInvalidExplicitAffiliate = hasExplicitAffiliate && !affiliateLookupPending && (!explicitAffiliateSlug || !affiliate.data);
  const effectiveAffiliate = affiliate.data ?? defaultAffiliate.data;
  const effectiveAffiliateSlug = effectiveAffiliate?.slug ?? null;
  const publicProfileName = effectiveAffiliate?.name || effectiveAffiliate?.slug || "Perfil público";
  const publicSocialLinks = effectiveAffiliate ? [
    ["WhatsApp", effectiveAffiliate.whatsapp ? `https://wa.me/${effectiveAffiliate.whatsapp.replace(/\D/g, "")}` : null],
    ["Website", effectiveAffiliate.websiteUrl],
    ["Facebook", effectiveAffiliate.facebookUrl],
    ["Instagram", effectiveAffiliate.instagramUrl],
    ["Twitter", effectiveAffiliate.twitterUrl],
    ["Linkedin", effectiveAffiliate.linkedinUrl],
    ["Youtube", effectiveAffiliate.youtubeUrl],
  ].filter((entry): entry is [string, string] => Boolean(entry[1])) : [];
  const application = trpc.applications.submit.useMutation({
    onSuccess: data => {
      savePaymentAccessToken(data.trackingCode, data.paymentAccessToken);
      setLocation(`/pedido/${encodeURIComponent(data.trackingCode)}/pagamento`);
    },
  });

  function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (affiliateLookupPending) {
      toast.info("Aguarde a validação do apresentador antes de enviar o pedido.");
      return;
    }
    const form = new FormData(event.currentTarget);
    application.mutate({
      fullName: String(form.get("fullName") ?? ""),
      email: normalizeEmail(applicationContact.email),
      whatsapp: normalizePhone(applicationContact.whatsapp),
      affiliateSlug: effectiveAffiliateSlug,
      affiliateSlugProvided: isResolvedExplicitAffiliate,
    });
  }

  const closeMenu = () => setMenuOpen(false);
  const isLoggedIn = Boolean(session.data);
  const officeHref = session.data?.role === "admin" ? "/admin" : "/membros";
  const testimonialItems = socialProof.data?.testimonials ?? [];
  const reviewCount = socialProof.data?.realReviewCount ?? 0;
  const averageRating = socialProof.data?.averageRating ?? null;
  const formattedAverageRating = averageRating !== null ? averageRating.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : null;
  const previousTestimonial = () => setActiveTestimonialIndex(current => testimonialItems.length ? current === 0 ? testimonialItems.length - 1 : current - 1 : 0);
  const nextTestimonial = () => setActiveTestimonialIndex(current => testimonialItems.length ? current === testimonialItems.length - 1 ? 0 : current + 1 : 0);
  const heroKickerOverride = getPublicSalesContentOverride(content, "hero", "kicker");
  const heroTitleOverride = getPublicSalesContentOverride(content, "hero", "title");
  const socialProofEyebrowOverride = getPublicSalesContentOverride(content, "social_proof", "eyebrow");
  const socialProofTitleOverride = getPublicSalesContentOverride(content, "social_proof", "title");
  const notFitTitleOverride = getPublicSalesContentOverride(content, "fit", "notTitle");
  const offerTitleOverride = getPublicSalesContentOverride(content, "offer", "title");
  useEffect(() => {
    if (activeTestimonialIndex >= testimonialItems.length) setActiveTestimonialIndex(0);
  }, [activeTestimonialIndex, testimonialItems.length]);

  return <div className="sales-page reference-page">
    <header className="site-header">
      <div className="shell nav">
        <a href="#inicio" aria-label="Método Código Lucrativo — início" onClick={closeMenu}><Brand /></a>
        <nav ref={navMenuRef} className={`nav-links ${menuOpen ? "is-open" : ""}`} aria-label="Navegação principal">
          <div className="nav-links-group nav-links-public" aria-label="Navegação da página">
            {publicNavigation.map(([label, path]) => <a key={path} href={resolveNavigationHref(path)} onClick={closeMenu}>{label}</a>)}
          </div>
          <span className="nav-links-divider" aria-hidden="true" />
          <div className="nav-links-group nav-links-utility" aria-label="Ações e rotas utilitárias">
            {utilityNavigation.map(([label, path]) => <a key={path} href={resolveNavigationHref(path)} onClick={closeMenu}>{label}</a>)}
          </div>
          <a href={withAppBase(isLoggedIn ? officeHref : "/acesso")} className="nav-cta nav-cta-login-mobile" onClick={closeMenu}>{isLoggedIn ? "Ir para o escritório virtual" : "Entrar"} <ArrowUpRight size={15} /></a>
          <a href={withAppBase("/acesso")} className="nav-cta nav-cta-login-desktop" onClick={closeMenu}>Entrar <LogIn size={15} /></a>
        </nav>
        <button ref={menuButtonRef} className="mobile-menu-button" type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </header>
    {effectiveAffiliate ? (
      <section className="affiliate-banner" aria-label="Perfil público do apresentador">
        <div className="shell affiliate-banner-inner">
          <div className="affiliate-profile-hero">
            <div className="affiliate-profile-summary">
              {effectiveAffiliate.photoUrl ? <img src={withAppBase(effectiveAffiliate.photoUrl)} alt={`Foto de ${publicProfileName}`} className="affiliate-profile-avatar" /> : <div className="affiliate-profile-avatar affiliate-profile-avatar-fallback" aria-hidden="true">{publicProfileName.slice(0, 1).toUpperCase()}</div>}
              <div className="affiliate-profile-summary-main">
                <div className="affiliate-profile-identity"><span className="affiliate-profile-presenter">Oportunidade apresentada por</span><strong className="affiliate-profile-name">{publicProfileName}</strong></div>
                {publicSocialLinks.length ? <nav className="affiliate-profile-socials" aria-label={`Canais de ${publicProfileName}`}>{publicSocialLinks.map(([label, url]) => <a key={label} href={url.startsWith("http") ? url : undefined} target={url.startsWith("http") ? "_blank" : undefined} rel={url.startsWith("http") ? "noreferrer" : undefined}>{label}</a>)}</nav> : null}
              </div>
              <button type="button" className="affiliate-profile-more" aria-haspopup="dialog" aria-expanded={profileDetailsOpen} onClick={() => setProfileDetailsOpen(true)}>Ver perfil</button>
            </div>
          </div>
        </div>
      </section>
    ) : null}
    {isInvalidExplicitAffiliate ? (
      <section className="affiliate-banner" aria-label="Aviso de apresentador não encontrado">
        <div className="shell affiliate-banner-inner">
          <div className="affiliate-profile-hero">
            <div className="affiliate-profile-summary">
              <div className="affiliate-profile-summary-main">
                <strong className="affiliate-profile-presenter">Apresentador informado não encontrado</strong>
                <span className="affiliate-profile-no-socials">O pedido seguirá com o apresentador padrão ativo para não ficar sem responsável.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    ) : null}
    <div id="public-social-proof-toast-slot" className="public-social-proof-toast-slot" aria-live="polite"><PublicSocialProofToast /></div>
    {effectiveAffiliate && profileDetailsOpen ? <div className="affiliate-profile-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setProfileDetailsOpen(false); }}>
      <section className="affiliate-profile-modal" role="dialog" aria-modal="true" aria-labelledby="affiliate-profile-modal-title">
        <button type="button" className="affiliate-profile-modal-close" aria-label="Fechar perfil público" onClick={() => setProfileDetailsOpen(false)}>×</button>
        <div className="affiliate-profile-modal-heading">
          {effectiveAffiliate.photoUrl ? <img src={withAppBase(effectiveAffiliate.photoUrl)} alt={`Foto de ${publicProfileName}`} className="affiliate-profile-modal-avatar" /> : <div className="affiliate-profile-modal-avatar affiliate-profile-avatar-fallback" aria-hidden="true">{publicProfileName.slice(0, 1).toUpperCase()}</div>}
          <div><span className="affiliate-profile-modal-eyebrow">Perfil público</span><h2 id="affiliate-profile-modal-title">{publicProfileName}</h2></div>
        </div>
        {effectiveAffiliate.bio ? <p className="affiliate-profile-modal-bio">{effectiveAffiliate.bio}</p> : null}
        <div className="affiliate-profile-modal-details">
          {publicSocialLinks.map(([label, url]) => <a key={label} href={url.startsWith("http") ? url : undefined} target={url.startsWith("http") ? "_blank" : undefined} rel={url.startsWith("http") ? "noreferrer" : undefined}><span>{label}</span><strong>{url}</strong></a>)}
          {effectiveAffiliate.skype ? <div><span>Skype</span><strong>{effectiveAffiliate.skype}</strong></div> : null}
          {effectiveAffiliate.whatsapp ? <a href={`https://wa.me/${effectiveAffiliate.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><span>Contato</span><strong>WhatsApp</strong></a> : null}
        </div>
        <button type="button" className="affiliate-profile-modal-action btn btn-ghost" onClick={() => setProfileDetailsOpen(false)}>Fechar</button>
      </section>
    </div> : null}

    <main>
      <section className="sales-hero" id="inicio">
        <div className="sales-grid-glow" aria-hidden="true" />
        <div className="shell sales-hero-grid">
          <div className="sales-hero-copy reveal-item">
            {heroKickerOverride ? <div className="sales-kicker">{heroKickerOverride}</div> : <div className="sales-kicker">Para quem quer entrar no digital com <span className="sales-kicker-tail">método pronto</span></div>}
            {heroTitleOverride ? <h1>{heroTitleOverride}</h1> : <h1><span>Receba o Método Código Lucrativo pronto</span> para começar — com estrutura consolidada para ativar e operar.</h1>}
            <TopPromoBanner />
            <SalesTrustCard trust={getPublicSalesContentOverride(content, "hero", "trust")} placement="desktop" />
             <p>{publicCopy(content, "hero", "description", "Tenha acesso ao Método Código Lucrativo com Escritório Virtual, ferramentas de divulgação, materiais e recursos organizados para aprender, ativar e acompanhar sua operação em um único ambiente.")}</p>
            <div className="sales-actions" data-public-visual-key="primary-actions"><JoinButton visualKey="primary-activation" className="sales-action-button" /><a data-public-visual-key="how-it-works" href="#como-funciona" className="btn btn-ghost sales-action-button">Ver como funciona <ArrowDown size={16} /></a></div>
          </div>
        </div>
      </section>

        <StructureDigitalShowcase image={heroImage} imageAlt={heroSection.defaultAlt} content={content} />

      <section className="sales-proof" aria-label="O que a estrutura reúne">
        <div className="shell sales-proof-grid">
          <div className="sales-proof-group"><strong>{publicCopy(content, "structure_summary", "group1", "Método e estrutura")}</strong><div className="sales-proof-items">{publicCopy(content, "structure_summary", "group1items", "Método · Perfil · Escritório").split("·").map(item => <span key={item.trim()}>{item.trim()}</span>)}</div></div>
          <div className="sales-proof-group"><strong>{publicCopy(content, "structure_summary", "group2", "Operação organizada")}</strong><div className="sales-proof-items">{publicCopy(content, "structure_summary", "group2items", "Campanhas · Pedidos · Conteúdos").split("·").map(item => <span key={item.trim()}>{item.trim()}</span>)}</div></div>
        </div>
      </section>

      <section className="sales-section sales-package" id="o-que-recebe">
        <div className="shell">
          <div className="sales-section-heading">
            <div><Eyebrow>{publicCopy(content, "package", "eyebrow", "Tudo o que você recebe")}</Eyebrow><h2>{publicCopy(content, "package", "title", "Você recebe o método com uma estrutura de operação, não uma explicação solta.")}</h2></div>
            <p>{publicCopy(content, "package", "description", "Método Código Lucrativo, Escritório Virtual, campanhas, recebimentos, pedidos, histórico, biblioteca, academia e suporte reunidos no mesmo fluxo.")}</p>
          </div>
          <div className="package-grid">{content.packageItems.map(item => <article key={item.id} data-public-visual-key={item.id}><strong>{item.title}</strong><p>{item.description}</p></article>)}</div>
        </div>
      </section>

      <section className="sales-section sales-social-proof" id="depoimentos">
        <div className="shell">
          <div className="sales-section-heading">
            <div>{socialProofEyebrowOverride ? <Eyebrow>{socialProofEyebrowOverride}</Eyebrow> : <Eyebrow>{publicCopy(content, "social_proof", "eyebrow", "Quem já faz parte")}</Eyebrow>}{socialProofTitleOverride ? <h2>{socialProofTitleOverride}</h2> : <h2>{publicCopy(content, "social_proof", "title", "Veja agradecimentos de quem já utiliza o método.")}</h2>}</div>
            <p>{publicCopy(content, "social_proof", "description", "Conheça agradecimentos de quem aplica o Método Código Lucrativo com estrutura pronta, suporte operacional e acompanhamento da própria execução.")}</p>
          </div>
          <div className="social-proof-stats">
            <article data-public-visual-key="member-total"><span>Total de membros</span>{socialProof.isLoading ? <strong>...</strong> : socialProof.isError ? <strong>Indisponível</strong> : <AnimatedMemberCount value={socialProof.data?.realMemberCount ?? 0} />}</article>
          </div>
          {socialProof.isError ? <p className="social-proof-empty">Não foi possível carregar os indicadores agora.</p> : testimonialItems.length ? <div className="testimonial-carousel" aria-label="Agradecimentos de membros">
            <div className="testimonial-carousel-track">
              {testimonialItems.map((item, index) => <article key={item.id} data-public-visual-key={`testimonial-${item.id}`} className={`testimonial-card testimonial-carousel-card ${index === activeTestimonialIndex ? "is-active" : ""}`} aria-hidden={index !== activeTestimonialIndex}>
                <div className="testimonial-card-top">
                  {item.photoUrl ? <img data-public-visual-key={`testimonial-${item.id}-photo`} src={withAppBase(item.photoUrl)} alt={`Foto de ${item.memberName}`} /> : <div className="testimonial-avatar" aria-hidden="true">{item.memberName.slice(0, 1).toUpperCase()}</div>}
                  <div className="testimonial-card-meta"><strong>{item.memberName}</strong><span>{item.location}</span></div>
                </div>
                <div className="testimonial-rating" aria-label={`Avaliação ${item.rating} de 5`}>{Array.from({ length: 5 }).map((_, starIndex) => <Star key={starIndex} size={16} fill={starIndex < item.rating ? "currentColor" : "none"} />)}</div>
                <p>{item.content}</p>
              </article>)}
            </div>
            <div className="testimonial-carousel-rating-bar" aria-label="Avaliação média e navegação dos agradecimentos">
              <button data-public-visual-key="previous-testimonial" type="button" onClick={previousTestimonial} aria-label="Ver agradecimento anterior"><ChevronLeft size={20} /></button>
              <div className="testimonial-carousel-rating-main">
                <span>Avaliação média</span>
                {averageRating !== null ? <RatingStars rating={averageRating} /> : null}
                <small>{activeTestimonialIndex + 1} / {testimonialItems.length}</small>
              </div>
              <div className="testimonial-carousel-rating-score">
                {socialProof.isLoading ? <strong>...</strong> : socialProof.isError ? <strong>Indisponível</strong> : averageRating !== null && formattedAverageRating ? <><strong>{formattedAverageRating} / 5</strong><small>{reviewCount} {reviewCount === 1 ? "avaliação" : "avaliações"}</small></> : <><strong>Aguardando</strong><small>Sem avaliações</small></>}
              </div>
              <button data-public-visual-key="next-testimonial" type="button" onClick={nextTestimonial} aria-label="Ver próximo agradecimento"><ChevronRight size={20} /></button>
            </div>
          </div> : <p className="social-proof-empty">Ainda não há agradecimentos publicados. Esta área será preenchida quando houver avaliações aprovadas.</p>}
        </div>
      </section>

      {contentBlocks.map((block, index) => {
        const sectionImage = resolveSectionImage(block.id, block.defaultImage);
          const sectionCopy = (key: string, fallback: string) => publicCopy(content, block.id, key, fallback);
        return <section id={block.id === "problem_start" ? "como-funciona" : block.id === "comparison" ? "comparacao" : undefined} className={`sales-section reference-copy ${index % 2 ? "reference-copy-alt" : ""}`} key={block.id}>
          <div className="shell reference-copy-grid">
            <div className="reference-copy-index"><span>{String(index + 1).padStart(2, "0")}</span><i /></div>
             <div className="reference-copy-content"><Eyebrow>{sectionCopy("eyebrow", block.eyebrow)}</Eyebrow><h2>{sectionCopy("title", block.title)}</h2>
               {sectionImage ? <div data-public-visual-key="reference-image" className={`reference-image-frame inline-reference-image ${block.id === "comparison" ? "comparison-image-fill" : ""}`}><img data-public-visual-key="reference-image-content" src={sectionImage} alt={block.defaultAlt} loading="lazy" /></div> : null}
                <div className="copy-stack">{block.body.map((paragraph, paragraphIndex) => <p key={paragraph}>{sectionCopy(`paragraph${paragraphIndex + 1}`, paragraph)}</p>)}</div><JoinButton visualKey="section-activation" className="reference-copy-cta" /></div>
          </div>
        </section>;
      })}

      <section className="sales-section sprint-fit" id="perfil-ideal">
        <div className="shell sprint-fit-grid">
           <div><Eyebrow>{publicCopy(content, "fit", "fitEyebrow", "Para quem é")}</Eyebrow><h2>{publicCopy(content, "fit", "fitTitle", "Para quem quer operar com execução.")}</h2><ul>{content.fitItems.map((item, index) => <li key={`fit-${index}`}>{item}</li>)}</ul></div>
           <div className="sprint-not-fit"><Eyebrow>{publicCopy(content, "fit", "notEyebrow", "Para quem não é")}</Eyebrow><h2>{notFitTitleOverride ?? <>Não é promessa de <span>resultado automático.</span></>}</h2><ul>{content.notFitItems.map((item, index) => <li key={`not-fit-${index}`}>{item}</li>)}</ul></div>
        </div>
      </section>



      <section className="sales-section sales-objections" id="duvidas-decisao">
        <div className="shell">
          <div className="sales-section-heading">
             <div><Eyebrow>{publicCopy(content, "objections", "eyebrow", "DÚVIDAS COMUNS")}</Eyebrow><h2>{publicCopy(content, "objections", "title", "Tudo o que você precisa saber antes de ativar sua estrutura.")}</h2></div>
             <p>{publicCopy(content, "objections", "description", "Confira as respostas para as principais dúvidas sobre o Método Código Lucrativo, a estrutura e o processo de ativação.")}</p>
          </div>
          <div className="objection-grid objection-accordion">{content.objectionItems.map(({ id, question, answer }, index) => {
            const isOpen = openObjectionIndex === index;
            const answerId = `objection-answer-${id}`;
             return <article key={id} data-public-visual-key={id} className={isOpen ? "is-open" : ""}>
              <button type="button" aria-expanded={isOpen} aria-controls={answerId} onClick={() => setOpenObjectionIndex(current => current === index ? null : index)}>
                <strong>{question}</strong>
                <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
              </button>
              <p id={answerId} hidden={!isOpen}>{answer}</p>
            </article>;
          })}</div>
          <section className="offer-closing faq-compact-cta" aria-label="Perguntas frequentes completas">
            <h3>Ainda quer ver tudo com calma?</h3>
            <a href={withAppBase("/perguntas-frequentes")}>Ver perguntas frequentes</a>
          </section>
        </div>
      </section>

      <section className="sales-section sales-offer" id="f">
        <div className="shell sales-offer-grid">
           <div className="offer-copy"><Eyebrow>{publicCopy(content, "offer", "eyebrow", "Próximo passo")}</Eyebrow><h2>{offerTitleOverride ?? <>Ative o <span>Método Código Lucrativo com estrutura pronta para operar.</span></>}</h2></div>
          <VioletaNeonActivationCard
            contact={applicationContact}
            isPending={application.isPending}
            errorMessage={application.error?.message}
            onSubmit={submitApplication}
            onEmailChange={value => setApplicationContact(current => ({ ...current, email: normalizeEmail(value) }))}
            onWhatsappChange={whatsapp => setApplicationContact(current => ({ ...current, whatsapp }))}
          />
        </div>
      </section>

    </main>

    <footer className="footer">
      <div className="shell footer-shell">
        <section className="footer-panel footer-brand-block" aria-label="Método Código Lucrativo">
          <div className="footer-brand-lockup">
            <span className="footer-brand-mark" aria-hidden="true">CL</span>
            <div><strong>Método Código Lucrativo®</strong><span>Desde 2020</span></div>
          </div>
          <p>Designed &amp; Developed by Marcelo R. Souza</p>
        </section>

        <section className="footer-panel footer-navigation">
          <span className="footer-section-label">Informações</span>
          <nav className="footer-links" aria-label="Links institucionais">{footerLinks.map(([label, path]) => <a key={path} href={withAppBase(path)}>{label}<ArrowUpRight size={13} aria-hidden="true" /></a>)}</nav>
        </section>
      </div>
      <div className="shell footer-bottom"><span>© 2026 · Todos os direitos reservados.</span><span className="footer-version">⭐ v2.0</span></div>
    </footer>
    <PublicConversionCta />
    <div className="member-chat-fab-wrap"><button type="button" className="member-chat-fab" aria-label="Chat de membros" aria-disabled="true" title="Chat de membros — em breve"><MessageCircle size={30} strokeWidth={2.2} /></button></div>
  </div>;
}
