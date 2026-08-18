import { useEffect, useState, type FormEvent } from "react";
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
    eyebrow: "",
    title: "A Página Lucrativa é sucesso absoluto!",
    body: [
      "A internet abriu portas para novas formas de ganhar dinheiro e desenvolver atividades profissionais sem sair de casa.",
      "Cada vez mais pessoas estão descobrindo que o ambiente digital oferece inúmeras oportunidades para quem deseja conquistar independência financeira.",
      "Criamos um sistema perfeito para qualquer pessoa trabalhar na internet diretamente de casa. Ele foi ajustado para jovens, estudantes, donas de casa, aposentados, gestantes ou qualquer pessoa que deseja uma renda extra trabalhando na internet.",
    ],
  },
  {
    eyebrow: "",
    title: "Imagine acordar pela manhã, preparar um café com tranquilidade.",
    body: [
      "Imagine acordar pela manhã, preparar um café com tranquilidade e, ao ligar o computador ou pegar o celular, encontrar sua caixa de e-mails cheia de notificações com a mensagem: “Você acaba de receber um pagamento!”.",
      "Para muitas pessoas, essa cena ainda parece distante ou até mesmo um sonho difícil de alcançar.",
    ],
  },
  {
    eyebrow: "",
    title: "A Pagina Lucrativa se destaca no mercado digital por oferecer uma oportunidade única no Brasil.",
    body: [
      "A Pagina Lucrativa se destaca no mercado digital por oferecer uma oportunidade única no Brasil, permitindo que o participante receba 100% do valor da inscrição de cada convidado diretamente em sua conta, sem a presença de intermediários ou atravessadores que reduzam os ganhos.",
      "Diferente de muitos modelos existentes na internet, onde as comissões são divididas entre diversas plataformas, aqui o processo é simples, rápido e transparente, garantindo que o esforço de divulgação seja recompensado de forma direta.",
    ],
  },
  {
    eyebrow: "",
    title: "Escritório Virtual Completo e Moderno:",
    body: [
      "Você não precisa criar nada, nem entender de tecnologia. A Página já está pronta, é sua, e o lucro também.",
      "Nosso sistema entrega tudo mastigado, com suporte completo. Agora, só falta você dar o primeiro passo.",
    ],
  },
  {
    eyebrow: "",
    title: "Um dos fatores que mais chamam a atenção na Pagina Lucrativa é que você recebe ganhos de forma direta.",
    body: [
      "Um dos fatores que mais chamam a atenção na Pagina Lucrativa é que você recebe ganhos de forma direta. Em muitos sistemas tradicionais, os pagamentos passam por diversos intermediários antes de chegar ao divulgador. Isso pode gerar atrasos e até mesmo reduzir os valores recebidos.",
      "Na Página Lucrativa, os pagamentos dos seus indicados são realizados diretamente na sua conta. Essa transferência direta proporciona mais segurança e transparência no processo financeiro dos usuários.",
      "Uma das grandes vantagens de possuir uma página própria é a autonomia que ela proporciona ao seu proprietário. Quando a página pertence ao próprio usuário, ele tem total liberdade para administrar seu funcionamento e acompanhar os resultados gerados.",
    ],
  },
  {
    eyebrow: "",
    title: "A internet revolucionou a forma de fazer negócios.",
    body: [
      "A internet revolucionou a forma como as pessoas realizam negócios e constroem novas fontes de renda. Hoje é possível desenvolver atividades completamente online, utilizando apenas um computador ou celular conectado à rede.",
      "Esse cenário tem despertado o interesse de milhares de pessoas que buscam novas oportunidades financeiras. Entre as estratégias que mais têm crescido no ambiente digital está a criação da Página Lucrativa.",
      "No entanto, com o crescimento das oportunidades oferecidas pela internet, essa realidade tem se tornado cada vez mais comum para quem decide explorar o potencial do mundo digital.",
      "Hoje, milhares de pessoas já descobriram que é possível gerar renda online de forma prática, utilizando apenas um computador ou um smartphone conectado à internet.",
      "Com pagamentos rápidos e um sistema fácil de entender, essa estrutura tem chamado a atenção de muitas pessoas que buscam uma forma prática e eficiente de gerar renda pela internet.",
    ],
  },
  {
    eyebrow: "",
    title: "Receber pagamentos online é, sem dúvida, uma das melhores sensações que alguém pode experimentar.",
    body: [
      "Receber pagamentos online é, sem dúvida, uma das melhores sensações que alguém pode experimentar, e posso afirmar que essa tem sido a frase que mais tenho lido nos últimos tempos.",
      "Em um mundo cada vez mais conectado, muitas pessoas estão descobrindo que a internet não serve apenas para entretenimento ou comunicação, mas também pode se transformar em uma poderosa ferramenta para gerar renda.",
      "A sensação de abrir o e-mail ou o aplicativo de pagamentos e encontrar uma notificação informando que um valor acabou de ser creditado na sua conta é algo extremamente gratificante. Esse tipo de experiência mostra que o esforço investido no ambiente digital pode realmente trazer resultados concretos.",
      "Para quem nunca viveu isso, pode parecer algo distante, mas a realidade é que milhares de pessoas já estão experimentando essa transformação em suas vidas financeiras.",
      "Além disso, um dos grandes atrativos é a possibilidade de recuperar o investimento já na primeira venda, o que torna a oportunidade ainda mais acessível e motivadora para quem deseja começar a ganhar dinheiro online.",
    ],
  },
  {
    eyebrow: "",
    title: "Recupere seu investimento já na primeira venda!",
    body: [
      "Um sistema simples, exclusivo e pronto para uso que permite a qualquer pessoa começar a ganhar dinheiro na internet com apenas uma compra.",
      "Diferente de muitos modelos digitais que exigem investimentos constantes ou processos complicados, aqui toda a base já está preparada para funcionar, facilitando o início mesmo para quem não possui experiência no mercado online.",
      "A partir dessa estrutura, o usuário pode focar apenas na divulgação e no crescimento do projeto, aproveitando um sistema pensado para gerar oportunidades de lucro de forma contínua ao longo do tempo.",
      "Essa praticidade e acessibilidade tornam o modelo extremamente atrativo para quem busca uma forma mais simples e direta de começar a ganhar dinheiro pela internet.",
    ],
  },
  {
    eyebrow: "",
    title: "Ao possuir uma Página Lucrativa funcionando no ambiente digital, o usuário passa a contar com uma estrutura que permanece ativa 24 horas por dia.",
    body: [
      "Ao possuir uma Página Lucrativa funcionando no ambiente digital, o usuário passa a contar com uma estrutura que permanece ativa 24 horas por dia, permitindo que oportunidades de ganhos possam surgir a qualquer momento.",
      "Isso significa que, mesmo enquanto a pessoa está descansando, se divertindo ou realizando outras atividades, sua página continua disponível na internet, pronta para receber visitantes e gerar resultados.",
      "Essa possibilidade de ter um sistema trabalhando continuamente amplia as chances de crescimento e torna o trabalho online uma alternativa cada vez mais atrativa para quem busca independência financeira e novas oportunidades de renda.",
    ],
  },
  {
    eyebrow: "",
    title: "Desde 2011 Ajudando Pessoas Reais a Ganharem Dinheiro de Verdade:",
    body: [
      "A Página Lucrativa está ativa desde 2011 e já reuniu mais de 60 mil usuários em todo o Brasil e até mesmo em outros países, demonstrando sua presença consolidada no ambiente digital.",
      "Ao longo de mais de 14 anos, o sistema vem mostrando que é possível explorar oportunidades de renda pela internet de forma simples, direta e acessível.",
      "Essa combinação de tempo de mercado, grande número de participantes e facilidade de acesso reforça a proposta de um sistema pensado para quem deseja iniciar atividades online e aproveitar as oportunidades que o mundo digital oferece.",
    ],
  },
  {
    eyebrow: "",
    title: "Não perca mais tempo! Imagine quanto você está deixando de ganhar ao não participar da Página Lucrativa.",
    body: [
      "Neste momento, milhares de pessoas estão navegando na internet em busca de oportunidades para iniciar um negócio online e ganhar dinheiro sem precisar sair de casa. Esse cenário mostra como a demanda por renda digital tem crescido cada vez mais.",
      "Muitas dessas pessoas procuram justamente um sistema simples e acessível para começar, e é aí que surge a oportunidade de apresentar a Página Lucrativa.",
      "Ao indicar ou vender uma Página Lucrativa para quem está buscando esse tipo de oportunidade, você não apenas ajuda outras pessoas a iniciarem no mundo do trabalho online, como também pode gerar ganhos para si mesmo.",
      "Dessa forma, além de contribuir para que outros descubram novas possibilidades na internet, você ainda pode transformar essa atividade em uma excelente fonte de renda extra.",
    ],
  },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={`brand ${compact ? "brand-compact" : ""}`}><span className="brand-mark" aria-hidden="true">PL</span><span>Página Lucrativa</span></span>;
}

function Eyebrow({ children }: { children: string }) {
  return <div className="eyebrow"><span aria-hidden="true" />{children}</div>;
}

function JoinButton({ className = "" }: { className?: string }) {
  return <a href="#f" className={`btn btn-primary ${className}`.trim()}>Faça parte <ArrowUpRight size={16} /></a>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [applicationContact, setApplicationContact] = useState({ email: "", whatsapp: "" });
  useEffect(() => {
    const updateFloatingCta = () => setShowFloatingCta(window.scrollY > window.innerHeight * .72);
    updateFloatingCta();
    window.addEventListener("scroll", updateFloatingCta, { passive: true });
    return () => window.removeEventListener("scroll", updateFloatingCta);
  }, []);
  const [, setLocation] = useLocation();
  const affiliateSlug = normalizeAffiliateSlug(typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("afiliado"));
  const affiliate = trpc.public.affiliateProfile.useQuery({ slug: affiliateSlug ?? "pagina-lucrativa" }, { enabled: Boolean(affiliateSlug) });
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
    {affiliate.data ? <div className="border-b border-amber-300/20 bg-black/70 px-4 py-2 text-center text-xs text-amber-100">Página apresentada por <strong>{affiliate.data.name || affiliate.data.slug}</strong>.</div> : null}
    <header className="site-header">
      <div className="shell nav">
        <a href="#inicio" aria-label="Página Lucrativa — início" onClick={closeMenu}><Brand /></a>
        <button className="mobile-menu-button" type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <nav className={`nav-links ${menuOpen ? "is-open" : ""}`} aria-label="Navegação principal">
          <a href="#inicio" onClick={closeMenu}>Início</a>
          <a href="#videos" onClick={closeMenu}>Depoimentos</a>
          <a href="/personalizar" onClick={closeMenu}>Personalizar</a>
          <a href="/membros" onClick={closeMenu}>Escritório Virtual</a>
        </nav>
        <div className="nav-actions"><JoinButton /></div>
      </div>
    </header>

    <main>
      <section className="sales-hero" id="inicio">
        <div className="sales-grid-glow" aria-hidden="true" />
        <div className="shell sales-hero-grid">
          <div className="sales-hero-copy reveal-item">
            <div className="reference-presenter">
              <span>Oportunidade apresentada pelo Empreendedor Digital:</span>
              <strong>Apresentador(a) da Página Lucrativa</strong>
              <a href="#f">Ficou alguma dúvida? Solicite contato pelo WhatsApp.</a>
            </div>
            <div className="sales-kicker">A Página Lucrativa é sucesso absoluto!</div>
            <h1>Tenha sua <span>Página Lucrativa</span> Online e Receba <span>PAGAMENTOS</span> de <span className="hero-price">R$50,00</span> em Sua Conta PagSeguro ou PIX.</h1>
            <p>Sem Intermediários e Sem Atravessadores, Aqui a Página é Sua e <strong>Lucra 100%!</strong></p>
            <div className="sales-actions"><JoinButton /><a href="#f" className="btn btn-ghost">Faça parte <ArrowDown size={16} /></a></div>
            <div className="sales-trust"><span className="sales-pulse" />A Página já está pronta, é sua, e o lucro também.</div>
          </div>
          <div className="sales-hero-side reveal-item reveal-delay">
            <div className="hero-photo-wrap"><img src={heroImage} alt="Pessoa planejando sua operação digital" /><div className="photo-overlay" aria-hidden="true" /></div>
            <div className="sales-author-badge"><strong>Página Lucrativa</strong><span>·</span> desde 2011</div>
            <div className="sprint-stamp"><span>página</span><strong>sua<br />e pronta</strong><small>para divulgar</small></div>
            <div className="sprint-paper-card"><span className="mono">escritório virtual</span><strong>personalize<br />e comece</strong><div className="paper-lines"><i /><i /><i /></div><span className="paper-sign">página · indicação · ganhos</span></div>
          </div>
        </div>
      </section>

      <section className="sales-proof" aria-label="Informações institucionais">
        <div className="shell sales-proof-grid"><div><strong>14 Anos</strong><span>de Sucesso Na Internet!</span></div><div><strong>SUCESSO ABSOLUTO!</strong><span>+ DE 63231 Usuários Ativos!</span></div></div>
      </section>

      {contentBlocks.map((block, index) => <section className={`sales-section reference-copy ${index % 2 ? "reference-copy-alt" : ""}`} key={block.title}>
        <div className="shell reference-copy-grid">
          <div className="reference-copy-index"><span>{String(index + 1).padStart(2, "0")}</span><i /></div>
          <div>{block.eyebrow && <Eyebrow>{block.eyebrow}</Eyebrow>}<h2>{block.title}</h2><div className="copy-stack">{block.body.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div><JoinButton className="reference-copy-cta" /></div>
          {index === 2 && <div className="reference-image-frame"><img src={methodImage} alt="Organização de um sistema de trabalho online" /></div>}
          {index === 5 && <div className="reference-image-frame"><img src={deliveryImage} alt="Materiais de trabalho organizados" /></div>}
        </div>
      </section>)}

      <section className="sales-section reference-videos" id="videos">
        <div className="shell"><div className="sales-section-heading"><div><Eyebrow>Depoimentos e apresentações</Eyebrow><h2>Conheça a <span>Página Lucrativa.</span></h2></div><p>Vídeos públicos incorporados da referência para explicar o sistema e a jornada de empreendedor digital.</p></div><div className="reference-video-grid"><iframe title="Seja um Empreendedor Digital da Página Lucrativa" src="https://www.youtube-nocookie.com/embed/xbi-ZYQYJAE" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /><iframe title="Página Lucrativa Uma Ideia Um Sonho" src="https://www.youtube-nocookie.com/embed/p2gEqGmKHkw" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div></div>
      </section>

      <section className="sales-section sales-offer" id="f">
        <div className="shell sales-offer-grid">
          <div className="offer-copy"><h2>Faça parte da <span>Página Lucrativa.</span></h2><p>Para colocar a Página Lucrativa para funcionar para você e lhe render LUCROS reais, você precisa efetuar um único pagamento de R$ 50,00 para a pessoa que está lhe convidando.</p><div className="sales-notes"><span>À VISTA R$ 50,00</span><span>ou até 12x de R$ 5,17</span></div><p className="offer-closing">Esse modelo de negócio digital tem chamado a atenção justamente pela sua simplicidade e potencial de crescimento. Assim, cada vez mais pessoas estão descobrindo que é possível ganhar dinheiro através de uma página na internet.</p></div>
          <form className="sales-price-card application-form" onSubmit={submitApplication}>
            <div className="application-seal" aria-hidden="true"><span>PL</span><small>página</small><b>pedido</b></div><div className="sales-price">À VISTA R$ 50,00 <small>ou até 12x de R$ 5,17</small></div><h3>(Preencha Agora Formulário Acima)</h3><p>A pessoa que receber o pagamento, vai lhe enviar uma senha especial para você personalizar sua Página Lucrativa.</p>
            <label className="application-field"><span>Nome</span><input name="fullName" autoComplete="name" required minLength={3} placeholder="Seu nome completo" /></label>
            <label className="application-field"><span>Email</span><input name="email" type="email" autoComplete="email" required maxLength={320} value={applicationContact.email} onChange={event => setApplicationContact(current => ({ ...current, email: normalizeEmail(event.target.value) }))} placeholder="voce@email.com" /></label>
            <label className="application-field"><span>WhatsApp</span><PhoneInput name="whatsapp" required value={applicationContact.whatsapp} onChange={whatsapp => setApplicationContact(current => ({ ...current, whatsapp }))} placeholder="(00) 0 0000-0000" /></label>
            {application.error && <p className="application-error" role="alert">{application.error.message}</p>}
            <button className="btn btn-primary" type="submit" disabled={application.isPending}>{application.isPending ? "Registrando pedido..." : "Realizar pedido"}<ArrowUpRight size={16} /></button><small>Seus dados serão usados apenas para acompanhar este pedido.</small>
          </form>
        </div>
      </section>

    </main>

    <footer className="footer"><div className="shell footer-row"><Brand compact /><span>Copyright © 2026 Página Lucrativa. Todos os direitos reservados.</span></div></footer>
    <div className={`floating ${showFloatingCta ? "is-visible" : ""}`}><JoinButton /></div>
  </div>;
}
