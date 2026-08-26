import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUpRight, Menu, MessageCircle, Star, X } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { withAppBase } from "@/lib/devPath";
import { normalizeAffiliateSlug } from "@shared/affiliateAttribution";
import { normalizeEmail, normalizePhone } from "@shared/contactValidation";
import { PhoneInput } from "@/components/PhoneInput";
import { PUBLIC_SALES_SECTIONS } from "@shared/publicSalesSections";
import { savePaymentAccessToken } from "@/lib/applicationPaymentAccess";

const promoBannerImage = withAppBase("/codigo-lucrativo-banner.png");
const heroSection = PUBLIC_SALES_SECTIONS[0];
const contentBlocks = PUBLIC_SALES_SECTIONS.filter(section => section.id !== "hero_operation");

const faqItems = [
  ["O que exatamente estou comprando?", "Você está solicitando acesso à estrutura digital da Página Lucrativa: página pública, perfil, Escritório Virtual e recursos disponíveis para personalização, divulgação, acompanhamento e aprendizado. A disponibilidade de alguns conteúdos depende de publicação e da configuração da sua conta."],
  ["É somente uma página?", "Não. A página é a porta de entrada. O ecossistema inclui painel de operação, perfil público, link pessoal, campanhas, pedidos, contatos, cursos, e-books, materiais, suporte e histórico de adesões, conforme os módulos disponíveis."],
  ["Preciso criar um produto ou saber programação?", "Você não precisa desenvolver a infraestrutura tecnológica do zero. A criação de uma oferta, a divulgação e a operação comercial continuam sendo responsabilidades do membro."],
  ["Como funciona a indicação e o pedido?", "Seu perfil pode ter um link próprio. Quando uma pessoa envia uma solicitação por esse endereço, o sistema pode atribuir o pedido à sua conta e exibi-lo em Meus pedidos. Pedido atribuído não é sinônimo de venda, pagamento ou ganho confirmado."],
  ["Como funciona o recebimento?", "O Escritório Virtual permite organizar preferências como PIX, PayPal, PagSeguro e dados bancários, além de acompanhar pedidos, pagamentos confirmados e histórico de adesões. Essas áreas armazenam informações e registros; não processam pagamentos automaticamente."],
  ["Vou ganhar dinheiro automaticamente?", "Não. A estrutura fornece ferramentas e uma base de operação. Qualquer resultado depende da sua execução, divulgação, pedidos, vendas reais, conferência e outros fatores do negócio. Não existe garantia de ganhos."],
  ["O que acontece depois que eu faço o pedido?", "O formulário registra seus dados e gera um código de acompanhamento. Depois, você acompanha o status e recebe as orientações reais sobre pagamento, liberação de acesso e personalização, conforme o fluxo administrativo vigente."],
  ["Existe mensalidade ou garantia?", "A página deve seguir a condição comercial vigente informada no processo de ativação. O formulário não deve esconder custos, etapas ou condições. Garantia de ganhos não existe; qualquer política comercial ou de cancelamento deve ser consultada nas regras oficiais da oferta."],
  ["Posso acessar pelo celular?", "A interface foi construída para uso responsivo em telas menores, e os módulos principais podem ser acessados por navegador. A experiência pode variar conforme a tela, o navegador e os dados disponíveis na conta."],
  ["Existe suporte?", "Sim. O Escritório Virtual possui um canal para abrir solicitações e acompanhar respostas administrativas. O suporte não representa garantia de aprovação, venda ou resultado financeiro."],
];

const packageItems = [
  ["Página Lucrativa personalizada", "Uma página pública para apresentar sua estrutura e receber solicitações."],
  ["Escritório Virtual", "Um painel para organizar perfil, pedidos, campanhas, recebimentos e acompanhamento."],
  ["Link principal de indicação", "Um endereço próprio para divulgar sua Página Lucrativa."],
  ["Campanhas de divulgação", "Links organizados por canal para acompanhar a origem das visitas."],
  ["Meus pedidos", "Área para acompanhar solicitações atribuídas e confirmações de pagamento."],
  ["Dados de recebimento", "Cadastro dos meios que você usa para receber diretamente dos compradores."],
  ["Biblioteca de Recursos", "Ferramentas e materiais publicados pela administração para apoiar sua divulgação."],
  ["Academia", "Conteúdos de aprendizado para orientar a execução."],
];

const fitItems = [
  "Pessoas dispostas a aprender a operar uma estrutura digital.",
  "Quem quer divulgar com consistência e acompanhar os próprios resultados.",
  "Quem entende que pedidos, vendas e ganhos dependem de execução real.",
  "Quem precisa de uma base organizada para começar sem construir tudo do zero.",
];

const notFitItems = [
  "Quem procura dinheiro fácil, automático ou garantido.",
  "Quem não pretende divulgar, aprender ou operar a própria estrutura.",
  "Quem espera que a plataforma venda sozinha sem ação comercial.",
  "Quem busca uma promessa de resultado fixo em vez de uma ferramenta de trabalho.",
];

const objectionItems = [
  ["Não sei programação.", "Você não precisa programar. A estrutura já existe e você personaliza os dados principais."],
  ["Nunca trabalhei com internet.", "A jornada foi organizada para começar pelo básico: configurar, divulgar e acompanhar."],
  ["Não sei divulgar.", "Você recebe links, campanhas, materiais e conteúdos para orientar a divulgação."],
  ["Tenho pouco tempo.", "Você pode operar em ritmo próprio, mas os resultados exigem constância."],
  ["Consigo utilizar pelo celular?", "Sim. As principais áreas foram pensadas para funcionar em navegador mobile."],
  ["Preciso entender de marketing digital?", "Não precisa começar especialista. Você aprende e aplica conforme avança."],
];

const footerLinks = [
  ["Termos de Uso", "/termos-de-uso"],
  ["Política de Privacidade", "/politica-de-privacidade"],
  ["Regras comerciais", "/regras-comerciais"],
  ["Contato / suporte", "/contato"],
  ["Institucional", "/institucional"],
];

const publicNavigation = [
  ["Início", "#inicio"],
  ["Depoimentos", "#depoimentos"],
  ["O que você recebe", "#o-que-recebe"],
  ["Como funciona", "#como-funciona"],
  ["Conheça a estrutura", "#estrutura"],
  ["Vídeos", "#videos"],
  ["Para quem é", "#perfil-ideal"],
  ["Perguntas frequentes", "#faq"],
  ["Quero começar", "#f"],
] as const;

const utilityNavigation = [
  ["Institucional", "/institucional"],
  ["Acompanhar pedido", "/pedido/acompanhar"],
  ["Entrar", "/acesso"],
] as const;

function resolveNavigationHref(path: string) {
  return path.startsWith("#") ? path : withAppBase(path);
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={`brand ${compact ? "brand-compact" : ""}`}><span className="brand-mark" aria-hidden="true">PL</span><span>Página Lucrativa</span></span>;
}

function Eyebrow({ children }: { children: string }) {
  return <div className="eyebrow"><span aria-hidden="true" />{children}</div>;
}

function JoinButton({ className = "" }: { className?: string }) {
  return <a href="#f" className={`btn btn-primary ${className}`.trim()}>Quero conhecer a estrutura <ArrowUpRight size={16} /></a>;
}

function TopPromoBanner() {
  return <section className="top-promo-banner" aria-label="Apresentação do Código Lucrativo">
    <img src={promoBannerImage} alt="Seu negócio digital pronto para começar, com Página Lucrativa, Escritório Virtual, ferramentas e treinamentos." />
  </section>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDetailsOpen, setProfileDetailsOpen] = useState(false);
  const [applicationContact, setApplicationContact] = useState({ email: "", whatsapp: "" });
  const sectionImages = trpc.public.salesSectionImages.useQuery();
  const socialProof = trpc.public.salesSocialProof.useQuery();
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
  const affiliateSlug = normalizeAffiliateSlug(typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("afiliado"));
  const affiliate = trpc.public.affiliateProfile.useQuery({ slug: affiliateSlug ?? "pagina-lucrativa" }, { enabled: Boolean(affiliateSlug) });
  const publicProfileName = affiliate.data?.name || affiliate.data?.slug || affiliateSlug || "Perfil público";
  const publicSocialLinks = affiliate.data ? [
    ["Website", affiliate.data.websiteUrl],
    ["Facebook", affiliate.data.facebookUrl],
    ["Instagram", affiliate.data.instagramUrl],
    ["Twitter", affiliate.data.twitterUrl],
    ["Linkedin", affiliate.data.linkedinUrl],
    ["Youtube", affiliate.data.youtubeUrl],
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
      affiliateSlug,
    });
  }

  const closeMenu = () => setMenuOpen(false);

  return <div className="sales-page reference-page">
    <header className="site-header">
      <div className="shell nav">
        <a href="#inicio" aria-label="Página Lucrativa — início" onClick={closeMenu}><Brand /></a>
        <nav className={`nav-links ${menuOpen ? "is-open" : ""}`} aria-label="Navegação principal">
          <div className="nav-links-group nav-links-public" aria-label="Navegação da página">
            {publicNavigation.map(([label, path]) => <a key={path} href={resolveNavigationHref(path)} onClick={closeMenu}>{label}</a>)}
          </div>
          <span className="nav-links-divider" aria-hidden="true" />
          <div className="nav-links-group nav-links-utility" aria-label="Ações e rotas utilitárias">
            {utilityNavigation.map(([label, path]) => <a key={path} href={resolveNavigationHref(path)} className={path === "/acesso" ? "nav-login" : undefined} onClick={closeMenu}>{label}</a>)}
          </div>
        </nav>
        <button className="mobile-menu-button" type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </header>
    {affiliate.data && profileDetailsOpen ? <div className="affiliate-profile-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setProfileDetailsOpen(false); }}>
      <section className="affiliate-profile-modal" role="dialog" aria-modal="true" aria-labelledby="affiliate-profile-modal-title">
        <button type="button" className="affiliate-profile-modal-close" aria-label="Fechar perfil público" onClick={() => setProfileDetailsOpen(false)}>×</button>
        <div className="affiliate-profile-modal-heading">
          {affiliate.data.photoUrl ? <img src={withAppBase(affiliate.data.photoUrl)} alt={`Foto de ${publicProfileName}`} className="affiliate-profile-modal-avatar" /> : <div className="affiliate-profile-modal-avatar affiliate-profile-avatar-fallback" aria-hidden="true">{publicProfileName.slice(0, 1).toUpperCase()}</div>}
          <div><span className="affiliate-profile-modal-eyebrow">Perfil público</span><h2 id="affiliate-profile-modal-title">{publicProfileName}</h2></div>
        </div>
        {affiliate.data.bio ? <p className="affiliate-profile-modal-bio">{affiliate.data.bio}</p> : null}
        <div className="affiliate-profile-modal-details">
          {publicSocialLinks.map(([label, url]) => <a key={label} href={url.startsWith("http") ? url : undefined} target={url.startsWith("http") ? "_blank" : undefined} rel={url.startsWith("http") ? "noreferrer" : undefined}><span>{label}</span><strong>{url}</strong></a>)}
          {affiliate.data.skype ? <div><span>Skype</span><strong>{affiliate.data.skype}</strong></div> : null}
          {affiliate.data.whatsapp ? <a href={`https://wa.me/${affiliate.data.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><span>Contato</span><strong>WhatsApp</strong></a> : null}
        </div>
        <button type="button" className="affiliate-profile-modal-action btn btn-ghost" onClick={() => setProfileDetailsOpen(false)}>Fechar</button>
      </section>
    </div> : null}

    <main>
      <section className="sales-hero" id="inicio">
        <div className="sales-grid-glow" aria-hidden="true" />
        <div className="shell sales-hero-grid">
          <div className="sales-hero-copy reveal-item">
            {affiliate.data ? (
              <section className="affiliate-profile-hero" aria-label="Perfil público do apresentador">
                <div className="affiliate-profile-summary">
                  {affiliate.data.photoUrl ? <img src={withAppBase(affiliate.data.photoUrl)} alt={`Foto de ${publicProfileName}`} className="affiliate-profile-avatar" /> : <div className="affiliate-profile-avatar affiliate-profile-avatar-fallback" aria-hidden="true">{publicProfileName.slice(0, 1).toUpperCase()}</div>}
                  <div className="affiliate-profile-summary-main">
                    <span className="affiliate-profile-kicker">Esta estrutura está sendo apresentada por:</span>
                    <strong className="affiliate-profile-presenter">Apresentador(a) da Página Lucrativa</strong>
                    <strong className="affiliate-profile-name">{publicProfileName}</strong>
                    {publicSocialLinks.length ? <nav className="affiliate-profile-socials" aria-label={`Redes sociais de ${publicProfileName}`}>{publicSocialLinks.map(([label, url]) => <a key={label} href={url.startsWith("http") ? url : undefined} target={url.startsWith("http") ? "_blank" : undefined} rel={url.startsWith("http") ? "noreferrer" : undefined}>{label}</a>)}</nav> : <span className="affiliate-profile-no-socials">Perfil público identificável</span>}
                  </div>
                  <button type="button" className="affiliate-profile-more" aria-haspopup="dialog" aria-expanded={profileDetailsOpen} onClick={() => setProfileDetailsOpen(true)}>Ver perfil</button>
                </div>
              </section>
            ) : null}
            <div className="sales-kicker">Para quem quer começar no digital sem <span className="sales-kicker-tail">começar do zero</span></div>
            <h1><span>Negócio digital pronto</span> para começar — sem construir toda a estrutura sozinho.</h1>
            <TopPromoBanner />
            <p>Receba acesso a uma Página Lucrativa personalizada, a um Escritório Virtual, ferramentas de divulgação, materiais e uma jornada para aprender, operar e acompanhar o seu projeto.</p>
            <div className="sales-actions"><JoinButton /><a href="#como-funciona" className="btn btn-ghost">Ver como funciona <ArrowDown size={16} /></a></div>
            <div className="sales-trust sales-trust-featured"><span className="sales-pulse" /><span className="sales-trust-copy">A estrutura já existe. Você personaliza<br className="sales-trust-break" />e coloca sua operação em movimento.</span></div>
          </div>
          <div className="sales-hero-side reveal-item reveal-delay">
            {heroImage ? <div className="hero-photo-wrap"><img src={heroImage} alt={heroSection.defaultAlt} /><div className="photo-overlay" aria-hidden="true" /></div> : <div className="hero-photo-wrap hero-photo-empty" aria-hidden="true" /> }
            <div className="sales-author-badge"><strong>Estrutura digital</strong><span>·</span> pronta para operar</div>
            <div className="sprint-stamp"><span>estrutura</span><strong>pronta<br />para operar</strong><small>personalize e comece</small></div>
            <div className="sprint-paper-card"><span className="mono">escritório virtual</span><strong>personalize<br />e acompanhe</strong><div className="paper-lines"><i /><i /><i /></div><span className="paper-sign">página · campanhas · pedidos</span></div>
          </div>
        </div>
      </section>

      <section className="sales-proof" aria-label="O que a estrutura reúne">
        <div className="shell sales-proof-grid">
          <div className="sales-proof-group"><strong>Estrutura digital</strong><div className="sales-proof-items"><span>Página</span><span>Perfil</span><span>Escritório</span></div></div>
          <div className="sales-proof-group"><strong>Operação organizada</strong><div className="sales-proof-items"><span>Campanhas</span><span>Pedidos</span><span>Conteúdos</span></div></div>
        </div>
      </section>

      <section className="sales-section sales-social-proof" id="depoimentos">
        <div className="shell">
          <div className="sales-section-heading">
            <div><Eyebrow>Prova social</Eyebrow><h2>Membros reais, dados reais da plataforma.</h2></div>
            <p>Os indicadores abaixo são carregados dos registros existentes. Depoimentos aparecem somente depois de enviados pelo membro e aprovados pela administração.</p>
          </div>
          <div className="social-proof-stats">
            <article><span>Total de membros</span><strong>{socialProof.isLoading ? "..." : socialProof.isError ? "Indisponível" : socialProof.data?.memberCount ?? 0}</strong></article>
            <article><span>Total de avaliações</span><strong>{socialProof.isLoading ? "..." : socialProof.isError ? "Indisponível" : socialProof.data?.reviewCount ?? 0}</strong></article>
          </div>
          {socialProof.isError ? <p className="social-proof-empty">Não foi possível carregar os indicadores agora.</p> : socialProof.data?.testimonials.length ? <div className="testimonial-grid">{socialProof.data.testimonials.map(item => <article key={item.id} className="testimonial-card">
            {item.photoUrl ? <img src={withAppBase(item.photoUrl)} alt={`Foto de ${item.memberName}`} /> : <div className="testimonial-avatar" aria-hidden="true">{item.memberName.slice(0, 1).toUpperCase()}</div>}
            <div className="testimonial-rating" aria-label={`Avaliação ${item.rating} de 5`}>{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={14} fill={index < item.rating ? "currentColor" : "none"} />)}</div>
            <p>{item.content}</p>
            <footer><strong>{item.memberName}</strong><span>{item.location}</span></footer>
          </article>)}</div> : <p className="social-proof-empty">Depoimentos aprovados com avaliação aparecerão aqui assim que estiverem disponíveis.</p>}
        </div>
      </section>

      <section className="sales-section sales-package" id="o-que-recebe">
        <div className="shell">
          <div className="sales-section-heading">
            <div><Eyebrow>Tudo o que você recebe</Eyebrow><h2>Uma base completa para começar com organização.</h2></div>
            <p>A oferta reúne os elementos necessários para configurar sua presença, divulgar e acompanhar sua própria operação.</p>
          </div>
          <div className="package-grid">{packageItems.map(([title, description]) => <article key={title}><strong>{title}</strong><p>{description}</p></article>)}</div>
        </div>
      </section>

      {contentBlocks.map((block, index) => {
        const sectionImage = resolveSectionImage(block.id, block.defaultImage);
        return <section id={block.id === "problem_start" ? "como-funciona" : block.id === "product_real" ? "estrutura" : undefined} className={`sales-section reference-copy ${index % 2 ? "reference-copy-alt" : ""}`} key={block.id}>
          <div className="shell reference-copy-grid">
            <div className="reference-copy-index"><span>{String(index + 1).padStart(2, "0")}</span><i /></div>
            <div className="reference-copy-content"><Eyebrow>{block.eyebrow}</Eyebrow><h2>{block.title}</h2>
              {sectionImage ? <div className={`reference-image-frame inline-reference-image ${block.id === "comparison" ? "comparison-image-fill" : ""}`}><img src={sectionImage} alt={block.defaultAlt} loading="lazy" /></div> : null}
              <div className="copy-stack">{block.body.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div><JoinButton className="reference-copy-cta" /></div>
          </div>
        </section>;
      })}

      <section className="sales-section reference-videos" id="videos">
        <div className="shell"><div className="sales-section-heading"><div><Eyebrow>Contexto e apresentação</Eyebrow><h2>Veja a ideia por trás da <span>estrutura.</span></h2></div><p>Os vídeos abaixo são materiais históricos de apresentação. Eles ajudam a entender a origem da proposta, mas estão em revisão para refletir o Escritório Virtual e os recursos atuais com a mesma clareza desta nova página.</p></div><div className="reference-video-grid"><iframe title="Apresentação histórica da Página Lucrativa" src="https://www.youtube-nocookie.com/embed/xbi-ZYQYJAE" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /><iframe title="Depoimentos históricos da Página Lucrativa" src="https://www.youtube-nocookie.com/embed/p2gEqGmKHkw" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div></div>
      </section>

      <section className="sales-section sprint-fit" id="perfil-ideal">
        <div className="shell sprint-fit-grid">
          <div><Eyebrow>Para quem é</Eyebrow><h2>Para quem quer construir com execução.</h2><ul>{fitItems.map(item => <li key={item}>{item}</li>)}</ul></div>
          <div className="sprint-not-fit"><Eyebrow>Para quem não é</Eyebrow><h2>Não é promessa de <span>resultado automático.</span></h2><ul>{notFitItems.map(item => <li key={item}>{item}</li>)}</ul></div>
        </div>
      </section>

      <section className="sales-section sales-faq" id="faq">
        <div className="shell reference-copy-grid"><div className="reference-copy-index"><span>FAQ</span><i /></div><div className="reference-copy-content"><Eyebrow>Antes de começar</Eyebrow><h2>Clareza para decidir com segurança.</h2><div className="copy-stack"><p>Uma estrutura pronta só faz sentido quando você entende o que recebe, como utiliza e o que depende da sua execução. Consulte as respostas mais importantes antes de solicitar a ativação.</p>{faqItems.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></div></div>
      </section>

      <section className="sales-section sales-objections" id="duvidas-decisao">
        <div className="shell">
          <div className="sales-section-heading">
            <div><Eyebrow>Antes da oferta</Eyebrow><h2>O que costuma travar a decisão.</h2></div>
            <p>Respostas curtas para dúvidas comuns antes de solicitar a ativação.</p>
          </div>
          <div className="objection-grid">{objectionItems.map(([question, answer]) => <article key={question}><strong>{question}</strong><p>{answer}</p></article>)}</div>
        </div>
      </section>

      <section className="sales-section sales-offer" id="f">
        <div className="shell sales-offer-grid">
          <div className="offer-copy"><Eyebrow>Próximo passo</Eyebrow><h2>Comece com uma <span>estrutura digital pronta.</span></h2><p>Você não está solicitando apenas uma página. Está solicitando acesso a uma base de operação para personalizar, aprender, divulgar e acompanhar seu projeto digital.</p><div className="sales-notes"><span>Acesso inicial: R$ 50,00</span><span>Condição informada no processo de ativação</span></div><p className="offer-closing">O resultado não é automático nem garantido. A estrutura organiza o ponto de partida; pedidos, vendas e ganhos dependem da sua execução e das regras reais da operação.</p></div>
          <form className="sales-price-card application-form" onSubmit={submitApplication}>
            <div className="application-seal" aria-hidden="true"><span>PL</span><small>estrutura</small><b>pedido</b></div><div className="sales-price">R$ 50,00 <small>valor de entrada informado nesta oferta</small></div><h3>Solicite a ativação da sua estrutura</h3><p>Preencha seus dados para registrar o pedido. Você receberá um código de acompanhamento e as orientações reais sobre pagamento, liberação e personalização.</p>
            <label className="application-field"><span>Nome completo</span><input name="fullName" autoComplete="name" required minLength={3} placeholder="Seu nome completo" /></label>
            <label className="application-field"><span>E-mail</span><input name="email" type="email" autoComplete="email" required maxLength={320} value={applicationContact.email} onChange={event => setApplicationContact(current => ({ ...current, email: normalizeEmail(event.target.value) }))} placeholder="voce@email.com" /></label>
            <label className="application-field"><span>WhatsApp</span><PhoneInput name="whatsapp" required value={applicationContact.whatsapp} onChange={whatsapp => setApplicationContact(current => ({ ...current, whatsapp }))} placeholder="(00) 0 0000-0000" /></label>
            {application.error && <p className="application-error" role="alert">{application.error.message}</p>}
            <button className="btn btn-primary" type="submit" disabled={application.isPending}>{application.isPending ? "Registrando solicitação..." : "Solicitar ativação"}<ArrowUpRight size={16} /></button><small>Seus dados serão usados para registrar e acompanhar esta solicitação. O formulário não processa o pagamento automaticamente.</small>
          </form>
        </div>
      </section>

    </main>

    <footer className="footer"><div className="shell footer-row footer-expanded"><div><Brand compact /><span>Copyright © 2026 Página Lucrativa. Todos os direitos reservados.</span></div><nav className="footer-links" aria-label="Links institucionais">{footerLinks.map(([label, path]) => <a key={path} href={withAppBase(path)}>{label}</a>)}</nav>{affiliate.data?.whatsapp ? <a className="footer-whatsapp" href={`https://wa.me/${affiliate.data.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">Ficou alguma dúvida? Solicite contato pelo WhatsApp.</a> : null}</div></footer>
    <div className="member-chat-fab-wrap"><button type="button" className="member-chat-fab" aria-label="Chat de membros" aria-disabled="true" title="Chat de membros — em breve"><MessageCircle size={30} strokeWidth={2.2} /></button></div>
  </div>;
}
