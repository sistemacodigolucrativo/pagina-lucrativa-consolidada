/*
 * Direção visual: Editorial Operacional.
 * Esta página é uma prévia fiel da landing page enviada: carvão profundo,
 * dourado método, composição assimétrica e microinterações discretas.
 */

import { useState } from "react";
import { ArrowDown, ArrowUpRight, Check, ChevronDown, Menu, X } from "lucide-react";

const heroImage = "/assets/imported-sprint-hero.jpg";
const methodImage = "/assets/imported-sprint-method.jpg";
const deliveryImage = "/assets/imported-sprint-delivery.jpg";

const proofItems = [["01", "uma operação em um só lugar"], ["02", "método antes de volume"], ["03", "próximos passos visíveis"]];

const methodItems = [
  ["Página", "Apresente a sua proposta com uma mensagem direta."],
  ["Campanhas", "Organize de onde cada conversa começou."],
  ["Produtos", "Concentre o que você oferece em uma vitrine clara."],
  ["Ganhos", "Acompanhe movimentações sem perder o contexto."],
  ["Academia", "Transforme conteúdo em rotina de execução."],
  ["Próximo passo", "Decida o que fazer sem abrir dez abas."],
];

const deliveryItems = [
  "Uma página para apresentar sua proposta",
  "Um escritório virtual para sua operação",
  "Links e campanhas organizados por origem",
  "Catálogo de produtos em uma visão única",
  "Ganhos e próximos passos em leitura simples",
  "Uma academia para sustentar a sua execução",
];

const faqs = [
  ["O que é a Página Lucrativa?", "É uma estrutura para transformar sua proposta, sua divulgação e sua operação em um sistema que você consegue acompanhar."],
  ["Preciso ter uma equipe?", "Não. A estrutura foi pensada para quem já empreende e quer organizar a própria rotina comercial antes de escalar."],
  ["Consigo usar só a página?", "Sim. Você pode começar pela apresentação pública e evoluir para os recursos do escritório conforme a sua operação amadurece."],
  ["O que encontro no escritório?", "Campanhas, ganhos, produtos, formação, rede, materiais e configurações organizados em hubs objetivos."],
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand ${compact ? "brand-compact" : ""}`}>
      <span className="brand-mark" aria-hidden="true">S</span>
      <span>página lucrativa</span>
    </span>
  );
}

function Eyebrow({ children }: { children: string }) {
  return <div className="eyebrow"><span aria-hidden="true" />{children}</div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="sales-page">
      <header className="site-header">
        <div className="shell nav">
          <a href="#inicio" aria-label="Startlab — início" onClick={closeMenu}><Brand /></a>
          <button className="mobile-menu-button" type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <nav className={`nav-links ${menuOpen ? "is-open" : ""}`} aria-label="Navegação principal">
            <a href="#sprint" onClick={closeMenu}>A plataforma</a>
            <a href="#entregas" onClick={closeMenu}>O que reúne</a>
            <a href="#perfil" onClick={closeMenu}>É para você?</a>
            <a href="#duvidas" onClick={closeMenu}>Dúvidas</a>
          </nav>
          <div className="nav-actions">
            <a className="nav-login" href="/membros">Já sou membro</a>
            <a className="btn btn-primary" href="/membros">Acessar escritório <ArrowUpRight size={15} /></a>
          </div>
        </div>
      </header>

      <main>
        <section className="sales-hero" id="inicio">
          <div className="sales-grid-glow" aria-hidden="true" />
          <div className="shell sales-hero-grid">
            <div className="sales-hero-copy reveal-item">
              <div className="sales-kicker">PÁGINA LUCRATIVA 2026 · PARA QUEM QUER OPERAR COM MAIS CLAREZA</div>
              <h1>Construa uma <span>operação comercial</span> que sabe o que fazer agora.</h1>
              <p>Uma base para apresentar sua proposta, organizar campanhas, acompanhar produtos e ganhar <strong>clareza para executar</strong> sem depender de improviso.</p>
              <div className="sales-actions">
                <a href="/membros" className="btn btn-primary">Conhecer o escritório <ArrowUpRight size={16} /></a>
                <a href="#sprint" className="btn btn-ghost">Entender como funciona <ArrowDown size={16} /></a>
              </div>
              <div className="sales-trust"><span className="sales-pulse" />Uma decisão clara para a próxima conversa, a próxima semana e o próximo avanço do seu negócio.</div>
            </div>

            <div className="sales-hero-side reveal-item reveal-delay">
              <div className="hero-photo-wrap">
                <img src={heroImage} alt="Estratégia comercial sendo organizada sobre uma mesa de trabalho" />
                <div className="photo-overlay" aria-hidden="true" />
              </div>
              <div className="sales-author-badge"><strong>Página Lucrativa</strong><span>·</span> escritório virtual</div>
              <div className="sprint-stamp"><span>o próximo</span><strong>passo<br />visível</strong><small>para operar melhor</small></div>
              <div className="sprint-paper-card">
                <span className="mono">operação comercial</span>
                <strong>pronta para<br />acompanhar</strong>
                <div className="paper-lines"><i /><i /><i /></div>
                <span className="paper-sign">página · campanhas · execução</span>
              </div>
            </div>
          </div>
        </section>

        <section className="sales-proof" aria-label="O que você recebe">
          <div className="shell sales-proof-grid">
            {proofItems.map(([number, text]) => <div key={number}><strong>{number}</strong><span>{text}</span></div>)}
          </div>
        </section>

        <section className="sales-section sprint-problem" id="problema">
          <div className="shell sales-narrow">
            <Eyebrow>O problema não é falta de esforço</Eyebrow>
            <h2>Você já faz muita coisa.<br /><span>Só precisa ver o sistema.</span></h2>
            <div className="sprint-problem-grid">
              <article><span className="sprint-quote-mark">“</span><h3>Cada divulgação perde o contexto</h3><p>Você publica, responde e depois não sabe de onde veio cada oportunidade.</p><strong>Contexto também é estratégia.</strong></article>
              <article><span className="sprint-quote-mark">“</span><h3>O produto fica escondido</h3><p>Quando a proposta está espalhada, explicar valor exige energia demais.</p><strong>Uma vitrine organiza a conversa.</strong></article>
              <article><span className="sprint-quote-mark">“</span><h3>A rotina vira uma coleção de abas</h3><p>Sem um escritório, acompanhar o que importa parece sempre mais difícil.</p><strong>Clareza devolve ritmo.</strong></article>
            </div>
          </div>
        </section>

        <section className="sales-section sales-method" id="sprint">
          <div className="shell">
            <div className="sales-section-heading">
              <div><Eyebrow>A plataforma</Eyebrow><h2>Uma estrutura feita para o seu momento, <span>não para um cenário ideal.</span></h2></div>
              <p>Você não precisa de mais uma ferramenta solta. Precisa de escolhas visíveis, organizadas na ordem em que sua operação realmente acontece.</p>
            </div>
            <div className="sprint-method-layout">
              <div className="sprint-method-copy">
                <div className="section-image-wrap"><img src={methodImage} alt="Caderno com rotina comercial organizada" /></div>
                <p>Da página pública ao escritório virtual, a estrutura conecta o que você oferece, o que divulga e o que precisa acompanhar.</p>
                <a href="/membros" className="btn btn-primary">Abrir escritório <ArrowUpRight size={16} /></a>
              </div>
              <div className="sprint-method-items">
                {methodItems.map(([title, body], index) => <div key={title}><b>{String(index + 1).padStart(2, "0")}</b><span><strong>{title}</strong>{body}</span></div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="sales-section sales-delivery" id="entregas">
          <div className="shell">
            <div className="sales-section-heading">
              <div><Eyebrow>O que você reúne</Eyebrow><h2>Menos dispersão.<br /><span>Mais direção.</span></h2></div>
              <p>O trabalho não fica perdido entre links, arquivos e conversas. Ele ganha um lugar para ser retomado, ajustado e colocado em prática.</p>
            </div>
            <div className="sales-delivery-grid">
              <div className="sales-delivery-list">
                {deliveryItems.map((item, index) => <div key={item}><b>{String(index + 1).padStart(2, "0")}</b><span>{item}</span></div>)}
              </div>
              <div className="sales-quote delivery-card">
                <img src={deliveryImage} alt="Kit de implementação comercial com cartões e caderno" />
                <div className="delivery-card-content"><Eyebrow>A virada de chave</Eyebrow><strong>Você pode continuar acumulando abas.<br />Ou pode operar com um sistema.</strong><p>A rotina deixa de depender da memória, da energia do dia ou da próxima mensagem inesperada.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="sales-section sprint-fit" id="perfil">
          <div className="shell">
            <Eyebrow>Para quem é</Eyebrow>
            <div className="sprint-fit-grid">
              <div><h2>É para você se quer parar de <span>operar no improviso.</span></h2><ul><li>Você já tem um negócio rodando e quer organizar a próxima fase.</li><li>Você divulga e vende, mas sente que tudo depende demais da sua memória.</li><li>Você quer clareza para aplicar, não mais uma ferramenta para alimentar.</li></ul></div>
              <div className="sprint-not-fit"><h2>Não é pra você,<br /><span>se...</span></h2><ul><li>Você procura fórmula mágica sem executar nada.</li><li>Quer só assistir aulas, sem aplicar no negócio.</li><li>Não tem — nem quer ter — um negócio rodando.</li></ul></div>
            </div>
          </div>
        </section>

        <section className="sales-section sales-offer" id="oferta">
          <div className="shell sales-offer-grid">
              <div className="offer-copy"><Eyebrow>O escritório virtual</Eyebrow><h2>Seu próximo passo não precisa ser <span>mais complicado.</span></h2><p>Abra um espaço para sua proposta, seus links, seus produtos e sua formação. Tudo com uma leitura que respeita o tamanho e o momento do seu negócio.</p><div className="sales-notes"><span>página pública</span><span>operação organizada</span><span>próximo passo aplicável</span></div></div>
            <div className="sales-price-card">
              <div className="application-seal" aria-hidden="true"><span>S</span><small>startlab</small><b>aplicação</b></div>
              <Eyebrow>Página Lucrativa 2026</Eyebrow><div className="sales-price">PL <small>escritório virtual</small></div><h3>Uma base para apresentar, organizar e acompanhar sua operação.</h3><p>A prévia atual apresenta os hubs principais da plataforma. O acesso aos recursos de membro acontece pelo escritório virtual.</p><div className="offer-rule" aria-hidden="true"><i /><i /><i /></div><a href="/membros" className="btn btn-primary">Acessar escritório <ArrowUpRight size={16} /></a><small>Os recursos evoluem conforme a sua operação é configurada.</small>
            </div>
          </div>
        </section>

        <section className="sales-section sales-faq" id="duvidas">
          <div className="shell sales-narrow">
            <Eyebrow>Antes de aplicar</Eyebrow><h2>As dúvidas que aparecem<br /><span>antes da decisão.</span></h2>
            <div className="faq-grid">
              {faqs.map(([question, answer], index) => {
                const isOpen = openFaq === index;
                return <div className={`faq ${isOpen ? "is-open" : ""}`} key={question}><button type="button" aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? -1 : index)}><span>{question}</span><ChevronDown size={18} /></button>{isOpen && <p>{answer}</p>}</div>;
              })}
            </div>
          </div>
        </section>

        <section className="sales-section sprint-final-cta">
          <div className="shell"><Eyebrow>O próximo nível começa com uma decisão</Eyebrow><h2>Chega de deixar sua rotina comercial<br /><span>depender do improviso.</span></h2><p>Você já sabe que precisa organizar. Agora pode abrir um espaço para operar com mais direção.</p><a href="/membros" className="btn btn-primary">Abrir escritório <ArrowUpRight size={16} /></a></div>
        </section>
      </main>

      <footer className="footer"><div className="shell footer-row"><span><Brand compact /> · Escritório virtual · 2026</span><span>Todos os direitos reservados</span></div></footer>
      <div className="floating"><a className="btn btn-primary" href="/membros">Acessar escritório <ArrowUpRight size={15} /></a></div>
    </div>
  );
}
