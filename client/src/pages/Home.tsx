import { FormEvent, type KeyboardEvent as ReactKeyboardEvent, type TouchEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, Menu, MessageCircle, Star, X } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { withAppBase } from "@/lib/devPath";
import { normalizeAffiliateSlug } from "@shared/affiliateAttribution";
import { normalizeEmail, normalizePhone } from "@shared/contactValidation";
import { PUBLIC_SALES_SECTIONS } from "@shared/publicSalesSections";
import { PUBLIC_SALES_DECISION_OBJECTIONS } from "@shared/publicSalesObjections";
import { savePaymentAccessToken } from "@/lib/applicationPaymentAccess";
import VioletaNeonActivationCard from "@/components/VioletaNeonActivationCard";
import PublicSocialProofToast from "@/components/PublicSocialProofToast";
import { usePublicSalesCopy } from "@/components/PublicSalesCopyRuntime";

const promoBannerImage = withAppBase("/codigo-lucrativo-banner.png");
const heroSection = PUBLIC_SALES_SECTIONS[0];
const coreSalesSectionIds = new Set([
  "problem_start",
  "activation_journey",
  "comparison",
  "not_just_course",
  "ease_real",
]);
const contentBlocks = PUBLIC_SALES_SECTIONS.filter(section => coreSalesSectionIds.has(section.id));



const packageItems = [
  ["Método Código Lucrativo", "Base pronta e consolidada para receber, conhecer, personalizar, operar e evoluir sua execução."],
  ["Escritório Virtual", "Ambiente operacional para organizar perfil, pedidos, campanhas, recebimentos e acompanhamento."],
  ["Link principal de indicação", "Endereço próprio para divulgar sua estrutura com mais clareza."],
  ["Campanhas de divulgação", "Links organizados por canal para acompanhar a origem das visitas."],
  ["Pedidos e comprovantes", "Área para acompanhar solicitações, pagamentos, envio de comprovantes e andamento da análise."],
  ["Dados de recebimento", "Cadastro dos meios que você usa para receber diretamente dos compradores."],
  ["Biblioteca de Recursos", "Ferramentas e materiais que sustentam o método e apoiam sua divulgação."],
  ["Academia", "Conteúdos de aprendizado para orientar a utilização do método."],
];

const fitItems = [
  "Pessoas dispostas a aprender a operar uma estrutura digital.",
  "Quem quer divulgar com consistência e acompanhar os próprios resultados.",
  "Quem entende que pedidos, vendas e ganhos dependem de execução real.",
  "Quem precisa de uma base organizada para começar com estrutura pronta.",
];

const notFitItems = [
  "Quem busca uma solução de renda automática ou resultados garantidos.",
  "Quem não pretende utilizar e divulgar a própria estrutura.",
  "Quem espera que a plataforma venda sozinha sem ação comercial.",
  "Quem busca uma promessa de resultado fixo em vez de uma ferramenta de trabalho.",
];

const objectionItems = PUBLIC_SALES_DECISION_OBJECTIONS.map(({ question, answer }) => [question, answer] as const);



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
  ["Entrar", "/acesso"],
] as const;

function publicCopy(overrides: Record<string, Record<string, string>>, sectionId: string, key: string, fallback: string) {
  return overrides[sectionId]?.[key] ?? fallback;
}

function resolveNavigationHref(path: string) {
  return path.startsWith("#") ? path : withAppBase(path);
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={`brand ${compact ? "brand-compact" : ""}`}><span className="brand-mark" aria-hidden="true">CL</span><span>Código Lucrativo</span></span>;
}

function Eyebrow({ children }: { children: string }) {
  return <div className="eyebrow"><span aria-hidden="true" />{children}</div>;
}

function JoinButton({ className = "" }: { className?: string }) {
  return <a href="#f" className={`btn btn-primary ${className}`.trim()}>Quero ativar minha estrutura <ArrowUpRight size={16} /></a>;
}

function TopPromoBanner() {
  return <section className="top-promo-banner" aria-label="Apresentação do Código Lucrativo">
    <img src={promoBannerImage} alt="Método Código Lucrativo pronto para começar, com estrutura consolidada, Escritório Virtual, ferramentas e treinamentos." />
  </section>;
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

const virtualOfficeSlides = [
  { title: "Método e estrutura", caption: "Base de apresentação e dados essenciais preparados para iniciar sua operação." },
  { title: "Escritório Virtual", caption: "Painel para centralizar perfil, pedidos, campanhas e acompanhamento." },
  { title: "Campanhas de divulgação", caption: "Links e canais organizados para divulgar com mais clareza." },
  { title: "Pedidos e acompanhamento", caption: "Solicitações, pagamento, comprovante e status reunidos no fluxo existente." },
  { title: "Biblioteca e Academia", caption: "Materiais e conteúdos de apoio para aprender e executar." },
  { title: "Dados de recebimento", caption: "Área para organizar os meios de recebimento usados na operação." },
];

function StructureDigitalShowcase({ image, imageAlt }: { image: string | null; imageAlt: string }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const { overrides } = usePublicSalesCopy();
  const currentSlide = virtualOfficeSlides[activeSlide] ?? virtualOfficeSlides[0];
  const sectionCopy = (key: string, fallback: string) => publicCopy(overrides, "structure_showcase", key, fallback);
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
          {image ? <img src={image} alt={imageAlt} aria-hidden="true" /> : null}
          <div className="photo-overlay" aria-hidden="true" />
          <div className="virtual-office-carousel-controls" aria-label="Controles do carrossel">
            <button type="button" onClick={previousSlide} aria-label="Ver tela anterior do Escritório Virtual"><ChevronLeft size={16} /></button>
            <div className="virtual-office-carousel-dots" role="tablist" aria-label="Telas do Escritório Virtual">
              {virtualOfficeSlides.map((slide, index) => <button key={slide.title} type="button" role="tab" aria-selected={index === activeSlide} aria-label={`Ver ${slide.title}`} onClick={() => setActiveSlide(index)} />)}
            </div>
            <button type="button" onClick={nextSlide} aria-label="Ver próxima tela do Escritório Virtual"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="sales-author-badge"><strong>Estrutura digital</strong><span>·</span> pronta para operar</div>
        <div className="sprint-stamp" aria-live="polite"><span>tela</span><strong>{currentSlide.title}</strong><small>escritório virtual</small></div>
        <div className="sprint-paper-card"><span className="mono">escritório virtual</span><strong>{currentSlide.caption}</strong><div className="paper-lines"><i /><i /><i /></div><span className="paper-sign">página · campanhas · pedidos</span></div>
      </div>
    </div>
  </section>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDetailsOpen, setProfileDetailsOpen] = useState(false);
  const [applicationContact, setApplicationContact] = useState({ email: "", whatsapp: "" });
  const sectionImages = trpc.public.salesSectionImages.useQuery();
  const socialProof = trpc.public.salesSocialProof.useQuery();
  const { overrides } = usePublicSalesCopy();
  const imageBySection = useMemo(() => new Map((sectionImages.data ?? []).map(image => [image.sectionId, image])), [sectionImages.data]);
  const resolveSectionImage = (sectionId: string, fallback: string | null) => {
    const saved = imageBySection.get(sectionId);
    if (saved?.status === "removed") return null;
    return saved?.imageUrl ? withAppBase(saved.imageUrl) : fallback ? withAppBase(fallback) : null;
  };
  const heroImage = resolveSectionImage(heroSection.id, heroSection.defaultImage);
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
  const [, setLocation] = useLocation();
  const affiliateParams = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  const hasExplicitAffiliate = affiliateParams?.has("afiliado") ?? false;
  const explicitAffiliateSlug = normalizeAffiliateSlug(affiliateParams?.get("afiliado"));
  const affiliate = trpc.public.affiliateProfile.useQuery({ slug: explicitAffiliateSlug ?? "codigo-lucrativo" }, { enabled: Boolean(explicitAffiliateSlug) });
  const defaultAffiliate = trpc.public.defaultAffiliateProfile.useQuery(undefined, { enabled: !hasExplicitAffiliate });
  const effectiveAffiliate = hasExplicitAffiliate ? affiliate.data : affiliate.data ?? defaultAffiliate.data;
  const effectiveAffiliateSlug = explicitAffiliateSlug ?? (!hasExplicitAffiliate ? defaultAffiliate.data?.slug ?? null : null);
  const publicProfileName = effectiveAffiliate?.name || effectiveAffiliate?.slug || explicitAffiliateSlug || "Perfil público";
  const publicSocialLinks = effectiveAffiliate ? [
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
    const form = new FormData(event.currentTarget);
    application.mutate({
      fullName: String(form.get("fullName") ?? ""),
      email: normalizeEmail(applicationContact.email),
      whatsapp: normalizePhone(applicationContact.whatsapp),
      affiliateSlug: effectiveAffiliateSlug,
      affiliateSlugProvided: hasExplicitAffiliate,
    });
  }

  const closeMenu = () => setMenuOpen(false);
  const reviewCount = socialProof.data?.reviewCount ?? 0;
  const averageRating = socialProof.data?.averageRating ?? null;
  const formattedAverageRating = averageRating !== null ? averageRating.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : null;

  return <div className="sales-page reference-page">
    <header className="site-header">
      <div className="shell nav">
        <a href="#inicio" aria-label="Código Lucrativo — início" onClick={closeMenu}><Brand /></a>
        <nav className={`nav-links ${menuOpen ? "is-open" : ""}`} aria-label="Navegação principal">
          <div className="nav-links-group nav-links-public" aria-label="Navegação da página">
            {publicNavigation.map(([label, path]) => <a key={path} href={resolveNavigationHref(path)} onClick={closeMenu}>{label}</a>)}
          </div>
          <span className="nav-links-divider" aria-hidden="true" />
          <div className="nav-links-group nav-links-utility" aria-label="Ações e rotas utilitárias">
            {utilityNavigation.map(([label, path]) => <a key={path} href={resolveNavigationHref(path)} className={path === "/acesso" ? "nav-login" : undefined} onClick={closeMenu}>{label}</a>)}
          </div>
          <a href="#f" className="nav-cta" onClick={closeMenu}>Quero ativar minha estrutura <ArrowUpRight size={15} /></a>
        </nav>
        <button className="mobile-menu-button" type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </header>
    {effectiveAffiliate ? (
      <section className="affiliate-banner" aria-label="Perfil público do apresentador">
        <div className="shell affiliate-banner-inner">
          <div className="affiliate-profile-hero">
            <div className="affiliate-profile-summary">
              {effectiveAffiliate.photoUrl ? <img src={withAppBase(effectiveAffiliate.photoUrl)} alt={`Foto de ${publicProfileName}`} className="affiliate-profile-avatar" /> : <div className="affiliate-profile-avatar affiliate-profile-avatar-fallback" aria-hidden="true">{publicProfileName.slice(0, 1).toUpperCase()}</div>}
              <div className="affiliate-profile-summary-main">
                <strong className="affiliate-profile-presenter">Apresentador(a) do Código Lucrativo</strong>
                <strong className="affiliate-profile-name">{publicProfileName}</strong>
                {publicSocialLinks.length ? <nav className="affiliate-profile-socials" aria-label={`Redes sociais de ${publicProfileName}`}>{publicSocialLinks.map(([label, url]) => <a key={label} href={url.startsWith("http") ? url : undefined} target={url.startsWith("http") ? "_blank" : undefined} rel={url.startsWith("http") ? "noreferrer" : undefined}>{label}</a>)}</nav> : <span className="affiliate-profile-no-socials">Perfil público identificável</span>}
              </div>
              <button type="button" className="affiliate-profile-more" aria-haspopup="dialog" aria-expanded={profileDetailsOpen} onClick={() => setProfileDetailsOpen(true)}>Ver perfil</button>
            </div>
          </div>
        </div>
      </section>
    ) : null}
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
            <div id="public-social-proof-toast-slot" className="public-social-proof-toast-slot" aria-live="polite"><PublicSocialProofToast /></div>
             {overrides.hero?.kicker ? <div className="sales-kicker">{overrides.hero.kicker}</div> : <div className="sales-kicker">Para quem quer começar no digital sem <span className="sales-kicker-tail">começar do zero</span></div>}
             {overrides.hero?.title ? <h1>{overrides.hero.title}</h1> : <h1><span>Receba o Método Código Lucrativo pronto</span> para começar — com estrutura consolidada para ativar e operar.</h1>}
            <TopPromoBanner />
             <p>{publicCopy(overrides, "hero", "description", "Tenha acesso ao Método Código Lucrativo com Escritório Virtual, ferramentas de divulgação, materiais e recursos organizados para aprender, ativar e acompanhar sua operação em um único ambiente.")}</p>
            <div className="sales-actions"><JoinButton /><a href="#como-funciona" className="btn btn-ghost">Ver como funciona <ArrowDown size={16} /></a></div>
             <div className="sales-trust sales-trust-featured"><span className="sales-pulse" />{overrides.hero?.trust ? <span className="sales-trust-copy">{overrides.hero.trust}</span> : <span className="sales-trust-copy">Você recebe uma estrutura pronta, entende o método,<br className="sales-trust-break" />ativa sua operação e acompanha tudo em um só lugar.</span>}</div>
          </div>
        </div>
      </section>

       <StructureDigitalShowcase image={heroImage} imageAlt={heroSection.defaultAlt} />

      <section className="sales-proof" aria-label="O que a estrutura reúne">
        <div className="shell sales-proof-grid">
          <div className="sales-proof-group"><strong>{publicCopy(overrides, "structure_summary", "group1", "Método e estrutura")}</strong><div className="sales-proof-items">{publicCopy(overrides, "structure_summary", "group1items", "Método · Perfil · Escritório").split("·").map(item => <span key={item.trim()}>{item.trim()}</span>)}</div></div>
          <div className="sales-proof-group"><strong>{publicCopy(overrides, "structure_summary", "group2", "Operação organizada")}</strong><div className="sales-proof-items">{publicCopy(overrides, "structure_summary", "group2items", "Campanhas · Pedidos · Conteúdos").split("·").map(item => <span key={item.trim()}>{item.trim()}</span>)}</div></div>
        </div>
      </section>

      <section className="sales-section sales-package" id="o-que-recebe">
        <div className="shell">
          <div className="sales-section-heading">
            <div><Eyebrow>{publicCopy(overrides, "package", "eyebrow", "Tudo o que você recebe")}</Eyebrow><h2>{publicCopy(overrides, "package", "title", "Você recebe o método com uma estrutura de operação, não uma explicação solta.")}</h2></div>
            <p>{publicCopy(overrides, "package", "description", "Método Código Lucrativo, Escritório Virtual, campanhas, recebimentos, pedidos, histórico, biblioteca, academia e suporte reunidos no mesmo fluxo.")}</p>
          </div>
          <div className="package-grid">{packageItems.map(([title, description], index) => <article key={title}><strong>{publicCopy(overrides, "package", `item${index + 1}Title`, title)}</strong><p>{publicCopy(overrides, "package", `item${index + 1}Text`, description)}</p></article>)}</div>
        </div>
      </section>

      <section className="sales-section sales-social-proof" id="depoimentos">
        <div className="shell">
          <div className="sales-section-heading">
            <div>{overrides.social_proof?.eyebrow ? <Eyebrow>{overrides.social_proof.eyebrow}</Eyebrow> : <Eyebrow>Quem já faz parte</Eyebrow>}{overrides.social_proof?.title ? <h2>{overrides.social_proof.title}</h2> : <h2>Veja experiências de quem já utiliza a estrutura.</h2>}</div>
            <p>{publicCopy(overrides, "social_proof", "description", "Conheça experiências de quem utiliza o Método Código Lucrativo para organizar, divulgar e acompanhar sua presença digital.")}</p>
          </div>
          <div className="social-proof-stats">
            <article><span>Total de membros</span><strong>{socialProof.isLoading ? "..." : socialProof.isError ? "Indisponível" : socialProof.data?.memberCount ?? 0}</strong></article>
            <article className="social-proof-rating-card"><span>Avaliação média</span>{socialProof.isLoading ? <strong>...</strong> : socialProof.isError ? <strong>Indisponível" : averageRating !== null && formattedAverageRating ? <div className="social-proof-rating-summary" aria-label={`Avaliação média ${formattedAverageRating} de 5 em ${reviewCount} avaliações`}><RatingStars rating={averageRating} /><strong>{formattedAverageRating} / 5</strong><small>{reviewCount} {reviewCount === 1 ? "avaliação" : "avaliações"}</small></div> : <div className="social-proof-rating-empty"><strong>Aguardando avaliações</strong><small>Assim que houver avaliações disponíveis, a média aparecerá aqui.</small></div>}</article>
          </div>
          {socialProof.isError ? <p className="social-proof-empty">Não foi possível carregar os indicadores agora.</p> : socialProof.data?.testimonials.length ? <div className="testimonial-grid">{socialProof.data.testimonials.map(item => <article key={item.id} className="testimonial-card">
            {item.photoUrl ? <img src={withAppBase(item.photoUrl)} alt={`Foto de ${item.memberName}`} /> : <div className="testimonial-avatar" aria-hidden="true">{item.memberName.slice(0, 1).toUpperCase()}</div>}
            <div className="testimonial-rating" aria-label={`Avaliação ${item.rating} de 5`}>{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={14} fill={index < item.rating ? "currentColor" : "none"} />)}</div>
            <p>{item.content}</p>
            <footer><strong>{item.memberName}</strong><span>{item.location}</span></footer>
          </article>)}</div> : null}
        </div>
      </section>

      {contentBlocks.map((block, index) => {
        const sectionImage = resolveSectionImage(block.id, block.defaultImage);
         const sectionCopy = (key: string, fallback: string) => publicCopy(overrides, block.id, key, fallback);
        return <section id={block.id === "problem_start" ? "como-funciona" : block.id === "comparison" ? "comparacao" : undefined} className={`sales-section reference-copy ${index % 2 ? "reference-copy-alt" : ""}`} key={block.id}>
          <div className="shell reference-copy-grid">
            <div className="reference-copy-index"><span>{String(index + 1).padStart(2, "0")}</span><i /></div>
             <div className="reference-copy-content"><Eyebrow>{sectionCopy("eyebrow", block.eyebrow)}</Eyebrow><h2>{sectionCopy("title", block.title)}</h2>
              {sectionImage ? <div className={`reference-image-frame inline-reference-image ${block.id === "comparison" ? "comparison-image-fill" : ""}`}><img src={sectionImage} alt={block.defaultAlt} loading="lazy" /></div> : null}
               <div className="copy-stack">{block.body.map((paragraph, paragraphIndex) => <p key={paragraph}>{sectionCopy(`paragraph${paragraphIndex + 1}`, paragraph)}</p>)}</div><JoinButton className="reference-copy-cta" /></div>
          </div>
        </section>;
      })}

      <section className="sales-section reference-videos" id="videos">
         <div className="shell"><div className="sales-section-heading"><div><Eyebrow>{publicCopy(overrides, "videos", "eyebrow", "Contexto e apresentação")}</Eyebrow><h2>{overrides.videos?.title ?? <>Veja a ideia por trás da <span>estrutura.</span></>}</h2></div><p>{publicCopy(overrides, "videos", "description", "Os vídeos abaixo são materiais históricos de apresentação. Eles ajudam a entender a origem da proposta, mas estão em revisão para refletir o Escritório Virtual e os recursos atuais com a mesma clareza desta nova página.")}</p></div><div className="reference-video-grid"><iframe title="Apresentação histórica do Código Lucrativo" src="https://www.youtube-nocookie.com/embed/xbi-ZYQYJAE" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /><iframe title="Depoimentos históricos do Código Lucrativo" src="https://www.youtube-nocookie.com/embed/p2gEqGmKHkw" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div></div>
      </section>

      <section className="sales-section sprint-fit" id="perfil-ideal">
        <div className="shell sprint-fit-grid">
           <div><Eyebrow>{publicCopy(overrides, "fit", "fitEyebrow", "Para quem é")}</Eyebrow><h2>{publicCopy(overrides, "fit", "fitTitle", "Para quem quer operar com execução.")}</h2><ul>{fitItems.map((item, index) => <li key={item}>{publicCopy(overrides, "fit", `fit${index + 1}`, item)}</li>)}</ul></div>
           <div className="sprint-not-fit"><Eyebrow>{publicCopy(overrides, "fit", "notEyebrow", "Para quem não é")}</Eyebrow><h2>{overrides.fit?.notTitle ?? <>Não é promessa de <span>resultado automático.</span></>}</h2><ul>{notFitItems.map((item, index) => <li key={item}>{publicCopy(overrides, "fit", `not${index + 1}`, item)}</li>)}</ul></div>
        </div>
      </section>



      <section className="sales-section sales-objections" id="duvidas-decisao">
        <div className="shell">
          <div className="sales-section-heading">
             <div><Eyebrow>{publicCopy(overrides, "objections", "eyebrow", "Antes da oferta")}</Eyebrow><h2>{publicCopy(overrides, "objections", "title", "O que costuma travar a decisão.")}</h2></div>
             <p>{publicCopy(overrides, "objections", "description", "Respostas curtas para dúvidas comuns antes de solicitar a ativação.")}</p>
          </div>
           <div className="objection-grid">{objectionItems.map(([question, answer], index) => <article key={question}><strong>{publicCopy(overrides, "objections", `q${index + 1}`, question)}</strong><p>{publicCopy(overrides, "objections", `a${index + 1}`, answer)}</p></article>)}</div>
          <p className="offer-closing">Ainda quer consultar tudo com calma? <a href={withAppBase("/perguntas-frequentes")}>Ver perguntas frequentes completas</a>.</p>
        </div>
      </section>

      <section className="sales-section sales-offer" id="f">
        <div className="shell sales-offer-grid">
           <div className="offer-copy"><Eyebrow>{publicCopy(overrides, "offer", "eyebrow", "Próximo passo")}</Eyebrow><h2>{overrides.offer?.title ?? <>Comece com sua <span>estrutura digital pronta para operar.</span></>}</h2><p>{publicCopy(overrides, "offer", "description", "Sua solicitação de ativação cria o registro necessário para cadastro, pagamento, envio do comprovante e análise da estrutura inicial.")}</p><div className="sales-notes"><span>{publicCopy(overrides, "offer", "price", "Valor da solicitação de ativação: R$ 50,00")}</span><span>{publicCopy(overrides, "offer", "condition", "Sem mensalidade. Solicitação → pagamento → comprovante → análise → acesso liberado")}</span></div><p className="offer-closing">{publicCopy(overrides, "offer", "closing", "O formulário registra o cadastro; o pagamento acontece na etapa seguinte e o comprovante dá continuidade ao fluxo já existente. Resultados dependem da sua execução e divulgação.")}</p><p className="offer-closing">Antes de seguir, você também pode consultar as <a href={withAppBase("/perguntas-frequentes")}>perguntas frequentes completas</a>.</p></div>
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
        <section className="footer-panel footer-brand-block" aria-label="Código Lucrativo">
          <div className="footer-brand-lockup">
            <span className="footer-brand-mark" aria-hidden="true">CL</span>
            <div><strong>Código Lucrativo®</strong><span>Desde 2020</span></div>
          </div>
          <p>Designed &amp; Developed by Marcelo R. Souza</p>
        </section>

        <section className="footer-panel footer-navigation">
          <span className="footer-section-label">Informações</span>
          <nav className="footer-links" aria-label="Links institucionais">{footerLinks.map(([label, path]) => <a key={path} href={withAppBase(path)}>{label}<ArrowUpRight size={13} aria-hidden="true" /></a>)}</nav>
        </section>

        {effectiveAffiliate?.whatsapp ? <section className="footer-panel footer-support-card">
          <span className="footer-section-label">Atendimento</span>
          <strong>Ficou alguma dúvida?</strong>
          <p>Solicite contato direto pelo WhatsApp.</p>
          <a className="footer-whatsapp" href={`https://wa.me/${effectiveAffiliate.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle size={18} aria-hidden="true" /><span>Falar pelo WhatsApp</span><ArrowUpRight size={15} aria-hidden="true" /></a>
        </section> : null}
      </div>
      <div className="shell footer-bottom"><span>© 2026 · Todos os direitos reservados.</span><span className="footer-version">⭐ v2.0</span></div>
    </footer>
    <div className="member-chat-fab-wrap"><button type="button" className="member-chat-fab" aria-label="Chat de membros" aria-disabled="true" title="Chat de membros — em breve"><MessageCircle size={30} strokeWidth={2.2} /></button></div>
  </div>;
}
