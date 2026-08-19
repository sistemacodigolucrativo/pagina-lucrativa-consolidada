import { FormEvent, useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { normalizeAffiliateSlug } from "@shared/affiliateAttribution";
import { normalizeEmail, normalizePhone } from "@shared/contactValidation";
import { PhoneInput } from "@/components/PhoneInput";

const heroImage = "/manus-storage/imported-sprint-hero_2aa66410.jpg";
const methodImage = "/manus-storage/imported-sprint-method_0b5ae91c.jpg";
const deliveryImage = "/manus-storage/imported-sprint-delivery_c100fe4d.jpg";

const contentBlocks = [
  {
    eyebrow: "O problema de começar sozinho",
    title: "Começar no digital não deveria exigir construir tudo sozinho.",
    body: [
      "Quem quer colocar um projeto na internet costuma descobrir que a primeira etapa não é divulgar: é construir toda a base.",
      "É preciso decidir o que apresentar, preparar uma página, organizar uma área de acesso, configurar links, reunir materiais, aprender divulgação e encontrar uma forma de acompanhar pedidos e contatos.",
      "Essa complexidade invisível faz muita gente adiar o projeto antes mesmo de dar o primeiro passo.",
    ],
  },
  {
    eyebrow: "O estado desejado",
    title: "E se a estrutura principal já estivesse pronta?",
    body: [
      "Em vez de começar diante de uma tela em branco, imagine receber uma base digital que já reúne os primeiros caminhos da operação.",
      "Você entra, entende o que está disponível, personaliza seus dados, aprende a utilizar os recursos e começa a movimentar o seu projeto com mais clareza.",
    ],
  },
  {
    eyebrow: "O mecanismo",
    title: "Conheça a Estrutura Digital Replicável.",
    body: [
      "A Página Lucrativa organiza uma infraestrutura que já existe e pode ser disponibilizada para novos membros sem que cada pessoa precise desenvolver tudo novamente.",
      "A jornada é simples de entender: entre, receba a estrutura, personalize, aprenda, divulgue e acompanhe sua operação.",
      "Replicável aqui significa repetir uma base de operação; não significa copiar resultados, receber dinheiro automaticamente ou ter vendas garantidas.",
    ],
  },
  {
    eyebrow: "O produto real",
    title: "Página Lucrativa não é apenas uma página.",
    body: [
      "A página pública é a porta de entrada. Por trás dela existe um Escritório Virtual para organizar dados, perfil, campanhas, pedidos, produtos, conteúdos, cursos, contatos e registros da sua própria operação.",
      "Você recebe acesso a uma estrutura digital desenvolvida para ser entendida, personalizada e colocada em movimento — sem precisar começar pela construção da tecnologia.",
    ],
  },
  {
    eyebrow: "A jornada",
    title: "Da ativação aos primeiros passos da sua operação.",
    body: [
      "Depois do pedido, a jornada continua: acompanhe a solicitação, receba as orientações reais de acesso, complete seu perfil, configure seus dados, personalize sua presença e conheça a oferta.",
      "Em seguida, aprenda a divulgar, crie seu primeiro link ou campanha e acompanhe visitas, contatos e pedidos conforme sua operação gerar esses registros.",
    ],
  },
  {
    eyebrow: "O que existe por trás",
    title: "Um Escritório Virtual para organizar o que você precisa acompanhar.",
    body: [
      "Dentro da estrutura, você encontra página pública, perfil personalizado, link pessoal, campanhas, pedidos atribuídos, contatos consentidos, produtos, cursos, e-books, materiais, suporte e acompanhamento financeiro.",
      "Os módulos aparecem de acordo com o que está publicado e disponível para sua conta. A proposta é centralizar a execução, não prometer que tudo acontece sozinho.",
    ],
  },
  {
    eyebrow: "A comparação",
    title: "O que você teria de montar se começasse sozinho?",
    body: [
      "Produto ou oferta, site, landing page, área do usuário, autenticação, banco de dados, sistema de pedidos, links, campanhas, materiais, treinamento, painel e acompanhamento.",
      "É justamente essa etapa de construção que a Página Lucrativa reduz: você começa com uma estrutura existente e dedica sua energia a entender, personalizar, divulgar e desenvolver sua operação.",
    ],
  },
  {
    eyebrow: "A facilidade real",
    title: "Você não precisa saber programar para começar.",
    body: [
      "A infraestrutura tecnológica já foi desenvolvida. O Escritório Virtual apresenta os caminhos disponíveis e concentra as configurações que pertencem à sua conta.",
      "Isso não elimina o aprendizado nem a execução comercial. Significa que você não precisa criar sistemas do zero antes de aprender a operar um projeto digital.",
    ],
  },
  {
    eyebrow: "Seu ativo digital",
    title: "Sua estrutura pode permanecer disponível online.",
    body: [
      "Uma página pública pode continuar disponível na internet enquanto sua operação estiver ativa, permitindo que as pessoas encontrem a apresentação e os caminhos que você configurou.",
      "Disponibilidade online não é promessa de renda 24 horas. Visitas, contatos, pedidos e resultados dependem da divulgação, da oferta, do público e da execução real.",
    ],
  },
  {
    eyebrow: "A prova que importa",
    title: "A estrutura precisa fazer sentido antes de qualquer promessa de resultado.",
    body: [
      "O que você pode avaliar é concreto: existe uma página, um perfil, um Escritório Virtual, recursos de campanha, pedidos rastreáveis, biblioteca de execução e módulos para acompanhar a operação.",
      "A Página Lucrativa não promete que a compra, sozinha, produz ganhos. Ela oferece uma base para quem quer começar um projeto digital e buscar resultados através de utilização, divulgação e vendas reais.",
    ],
  },
];

const faqItems = [
  ["O que exatamente estou comprando?", "Você está solicitando acesso à estrutura digital da Página Lucrativa: página pública, perfil, Escritório Virtual e recursos disponíveis para personalização, divulgação, acompanhamento e aprendizado. A disponibilidade de alguns conteúdos depende de publicação e da configuração da sua conta."],
  ["É somente uma página?", "Não. A página é a porta de entrada. O ecossistema inclui painel de operação, perfil público, link pessoal, campanhas, pedidos, produtos, contatos, cursos, e-books, materiais, suporte e registros financeiros, conforme os módulos disponíveis."],
  ["Preciso criar um produto ou saber programação?", "Você não precisa desenvolver a infraestrutura tecnológica do zero. A plataforma também permite cadastrar produtos próprios para revisão, mas a criação de uma oferta, a divulgação e a operação comercial continuam sendo responsabilidades do membro."],
  ["Como funciona a indicação e o pedido?", "Seu perfil pode ter um link próprio. Quando uma pessoa envia uma solicitação por esse endereço, o sistema pode atribuir o pedido à sua conta e exibi-lo em Meus pedidos. Pedido atribuído não é sinônimo de venda, pagamento ou ganho confirmado."],
  ["Como funciona o recebimento?", "O Escritório Virtual permite organizar preferências como PIX, PayPal, PagSeguro e dados bancários, além de acompanhar lançamentos no extrato. Essas áreas armazenam informações e registros; não processam pagamentos automaticamente."],
  ["Vou ganhar dinheiro automaticamente?", "Não. A estrutura fornece ferramentas e uma base de operação. Qualquer resultado depende da sua execução, divulgação, pedidos, vendas reais, conferência e outros fatores do negócio. Não existe garantia de ganhos."],
  ["O que acontece depois que eu faço o pedido?", "O formulário registra seus dados e gera um código de acompanhamento. Depois, você acompanha o status e recebe as orientações reais sobre pagamento, liberação de acesso e personalização, conforme o fluxo administrativo vigente."],
  ["Existe mensalidade ou garantia?", "A página deve seguir a condição comercial vigente informada no processo de ativação. O formulário não deve esconder custos, etapas ou condições. Garantia de ganhos não existe; qualquer política comercial ou de cancelamento deve ser consultada nas regras oficiais da oferta."],
  ["Posso acessar pelo celular?", "A interface foi construída para uso responsivo em telas menores, e os módulos principais podem ser acessados por navegador. A experiência pode variar conforme a tela, o navegador e os dados disponíveis na conta."],
  ["Existe suporte?", "Sim. O Escritório Virtual possui um canal para abrir solicitações e acompanhar respostas administrativas. O suporte não representa garantia de aprovação, venda ou resultado financeiro."],
];

function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={`brand ${compact ? "brand-compact" : ""}`}><span className="brand-mark" aria-hidden="true">PL</span><span>Página Lucrativa</span></span>;
}

function Eyebrow({ children }: { children: string }) {
  return <div className="eyebrow"><span aria-hidden="true" />{children}</div>;
}

function JoinButton({ className = "" }: { className?: string }) {
  return <a href="#f" className={`btn btn-primary ${className}`.trim()}>Quero conhecer a estrutura <ArrowUpRight size={16} /></a>;
}

function TopPromoBanner({ onClose }: { onClose: () => void }) {
  return <section className="top-promo-banner" aria-label="Apresentação do Código Lucrativo">
    <img src="/codigo-lucrativo-banner.png" alt="Seu negócio digital pronto para começar, com Página Lucrativa, Escritório Virtual, ferramentas e treinamentos." />
    <button type="button" className="top-promo-close" aria-label="Fechar imagem de apresentação" onClick={onClose}>
      <X size={22} strokeWidth={3} aria-hidden="true" />
    </button>
  </section>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTopPromoBanner, setShowTopPromoBanner] = useState(true);
  const [profileDetailsOpen, setProfileDetailsOpen] = useState(false);
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [applicationContact, setApplicationContact] = useState({ email: "", whatsapp: "" });
  useEffect(() => {
    const updateFloatingCta = () => setShowFloatingCta(window.scrollY > window.innerHeight * .72);
    updateFloatingCta();
    window.addEventListener("scroll", updateFloatingCta, { passive: true });
    return () => window.removeEventListener("scroll", updateFloatingCta);
  }, []);
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
  const publicProfileName = affiliate.data?.name || affiliate.data?.slug || "Perfil público";
  const publicSocialLinks = affiliate.data ? [
    ["Website", affiliate.data.websiteUrl],
    ["Facebook", affiliate.data.facebookUrl],
    ["Twitter", affiliate.data.twitterUrl],
    ["Linkedin", affiliate.data.linkedinUrl],
    ["Youtube", affiliate.data.youtubeUrl],
  ].filter((entry): entry is [string, string] => Boolean(entry[1])) : [];
  const application = trpc.applications.submit.useMutation({
    onSuccess: data => setLocation(`/pedido/confirmacao?codigo=${encodeURIComponent(data.trackingCode)}`),
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
    {showTopPromoBanner ? <TopPromoBanner onClose={() => setShowTopPromoBanner(false)} /> : null}
    <header className="site-header">
      <div className="shell nav">
        <a href="#inicio" aria-label="Página Lucrativa — início" onClick={closeMenu}><Brand /></a>
        <button className="mobile-menu-button" type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <nav className={`nav-links ${menuOpen ? "is-open" : ""}`} aria-label="Navegação principal">
          <a href="#inicio" onClick={closeMenu}>Início</a>
          <a href="#como-funciona" onClick={closeMenu}>Como funciona</a>
          <a href="#estrutura" onClick={closeMenu}>O que inclui</a>
          <a href="#faq" onClick={closeMenu}>Perguntas frequentes</a>
        </nav>
        <div className="nav-actions"><JoinButton /></div>
      </div>
    </header>
    {affiliate.data && profileDetailsOpen ? <div className="affiliate-profile-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setProfileDetailsOpen(false); }}>
      <section className="affiliate-profile-modal" role="dialog" aria-modal="true" aria-labelledby="affiliate-profile-modal-title">
        <button type="button" className="affiliate-profile-modal-close" aria-label="Fechar perfil público" onClick={() => setProfileDetailsOpen(false)}>×</button>
        <div className="affiliate-profile-modal-heading">
          {affiliate.data.photoUrl ? <img src={affiliate.data.photoUrl} alt={`Foto de ${publicProfileName}`} className="affiliate-profile-modal-avatar" /> : <div className="affiliate-profile-modal-avatar affiliate-profile-avatar-fallback" aria-hidden="true">{publicProfileName.slice(0, 1).toUpperCase()}</div>}
          <div><span className="affiliate-profile-modal-eyebrow">Perfil público</span><h2 id="affiliate-profile-modal-title">{publicProfileName}</h2></div>
        </div>
        {affiliate.data.bio ? <p className="affiliate-profile-modal-bio">{affiliate.data.bio}</p> : null}
        <div className="affiliate-profile-modal-details">
          {publicSocialLinks.map(([label, url]) => <a key={label} href={url.startsWith("http") ? url : undefined} target={url.startsWith("http") ? "_blank" : undefined} rel={url.startsWith("http") ? "noreferrer" : undefined}><span>{label}</span><strong>{url}</strong></a>)}
          {affiliate.data.skype ? <div><span>Skype</span><strong>{affiliate.data.skype}</strong></div> : null}
          {affiliate.data.whatsapp ? <a href={`https://wa.me/${affiliate.data.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><span>WhatsApp</span><strong>{affiliate.data.whatsapp}</strong></a> : null}
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
                  {affiliate.data.photoUrl ? <img src={affiliate.data.photoUrl} alt={`Foto de ${publicProfileName}`} className="affiliate-profile-avatar" /> : <div className="affiliate-profile-avatar affiliate-profile-avatar-fallback" aria-hidden="true">{publicProfileName.slice(0, 1).toUpperCase()}</div>}
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
            <div className="sales-kicker">Para quem quer começar no digital sem começar do zero</div>
            <h1><span>Negócio digital pronto</span> para começar — sem construir toda a estrutura sozinho.</h1>
            <p>Receba acesso a uma Página Lucrativa personalizada, a um Escritório Virtual, ferramentas de divulgação, materiais e uma jornada para aprender, operar e acompanhar o seu projeto.</p>
            <div className="sales-actions"><JoinButton /><a href="#como-funciona" className="btn btn-ghost">Ver como funciona <ArrowDown size={16} /></a></div>
            <div className="sales-trust"><span className="sales-pulse" />A estrutura já existe. Você personaliza e coloca sua operação em movimento.</div>
          </div>
          <div className="sales-hero-side reveal-item reveal-delay">
            <div className="hero-photo-wrap"><img src={heroImage} alt="Pessoa planejando sua operação digital" /><div className="photo-overlay" aria-hidden="true" /></div>
            <div className="sales-author-badge"><strong>Estrutura digital</strong><span>·</span> pronta para operar</div>
            <div className="sprint-stamp"><span>estrutura</span><strong>pronta<br />para operar</strong><small>personalize e comece</small></div>
            <div className="sprint-paper-card"><span className="mono">escritório virtual</span><strong>personalize<br />e acompanhe</strong><div className="paper-lines"><i /><i /><i /></div><span className="paper-sign">página · campanhas · pedidos</span></div>
          </div>
        </div>
      </section>

      <section className="sales-proof" aria-label="O que a estrutura reúne">
        <div className="shell sales-proof-grid"><div><strong>Estrutura digital</strong><span>página · perfil · escritório</span></div><div><strong>Operação organizada</strong><span>campanhas · pedidos · conteúdos</span></div></div>
      </section>

      {contentBlocks.map((block, index) => <section id={index === 0 ? "como-funciona" : index === 3 ? "estrutura" : undefined} className={`sales-section reference-copy ${index % 2 ? "reference-copy-alt" : ""}`} key={block.title}>
        <div className="shell reference-copy-grid">
          <div className="reference-copy-index"><span>{String(index + 1).padStart(2, "0")}</span><i /></div>
          <div><Eyebrow>{block.eyebrow}</Eyebrow><h2>{block.title}</h2><div className="copy-stack">{block.body.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div><JoinButton className="reference-copy-cta" /></div>
          {index === 2 && <div className="reference-image-frame"><img src={methodImage} alt="Organização de uma estrutura de operação digital" /></div>}
          {index === 5 && <div className="reference-image-frame"><img src={deliveryImage} alt="Materiais organizados para apoiar uma operação digital" /></div>}
        </div>
      </section>)}

      <section className="sales-section reference-videos" id="videos">
        <div className="shell"><div className="sales-section-heading"><div><Eyebrow>Contexto e apresentação</Eyebrow><h2>Veja a ideia por trás da <span>estrutura.</span></h2></div><p>Os vídeos abaixo são materiais históricos de apresentação. Eles ajudam a entender a origem da proposta, mas estão em revisão para refletir o Escritório Virtual e os recursos atuais com a mesma clareza desta nova página.</p></div><div className="reference-video-grid"><iframe title="Apresentação histórica da Página Lucrativa" src="https://www.youtube-nocookie.com/embed/xbi-ZYQYJAE" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /><iframe title="Depoimentos históricos da Página Lucrativa" src="https://www.youtube-nocookie.com/embed/p2gEqGmKHkw" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div></div>
      </section>

      <section className="sales-section sales-faq" id="faq">
        <div className="shell reference-copy-grid"><div className="reference-copy-index"><span>FAQ</span><i /></div><div><Eyebrow>Antes de começar</Eyebrow><h2>Clareza para decidir com segurança.</h2><div className="copy-stack"><p>Uma estrutura pronta só faz sentido quando você entende o que recebe, como utiliza e o que depende da sua execução. Consulte as respostas mais importantes antes de solicitar a ativação.</p>{faqItems.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></div></div>
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

    <footer className="footer"><div className="shell footer-row"><Brand compact /><span>Copyright © 2026 Página Lucrativa. Todos os direitos reservados.</span>{affiliate.data?.whatsapp ? <a className="footer-whatsapp" href={`https://wa.me/${affiliate.data.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">Ficou alguma dúvida? Solicite contato pelo WhatsApp.</a> : null}</div></footer>
    <div className={`floating ${showFloatingCta ? "is-visible" : ""}`}><JoinButton /></div>
  </div>;
}
