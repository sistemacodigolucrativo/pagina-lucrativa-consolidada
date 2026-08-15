/*
 * Direção visual: Editorial Operacional.
 * Esta página é uma prévia fiel da landing page enviada: carvão profundo,
 * dourado método, composição assimétrica e microinterações discretas.
 */

import { useState } from "react";
import { ArrowDown, ArrowUpRight, Check, ChevronDown, Menu, X } from "lucide-react";

const heroImage = "/assets/sprint-hero.jpg";
const methodImage = "/assets/sprint-method.jpg";
const deliveryImage = "/assets/sprint-delivery.jpg";

const proofItems = [
  ["01", "sessão individual"],
  ["02", "sistema sob medida"],
  ["03", "execução sem achismo"],
];

const methodItems = [
  ["Diagnóstico", "O que está travando a sua venda hoje."],
  ["Posicionamento", "A promessa que faz sentido para o seu cliente."],
  ["Oferta", "O caminho para apresentar valor com clareza."],
  ["Scripts", "As palavras certas para cada conversa."],
  ["Rotina", "Um jeito simples de repetir o que funciona."],
  ["Plano de ação", "A ordem certa para colocar tudo em prática."],
];

const deliveryItems = [
  "Uma sessão individual de implementação com a Kau",
  "Diagnóstico do seu momento comercial",
  "Scripts de conversa para o seu negócio",
  "Roteiro de oferta e follow-up",
  "Rotina comercial para a semana",
  "Plano de ação com decisões na ordem certa",
];

const faqs = [
  ["É uma aula gravada?", "Não. É uma sessão individual e prática para transformar o seu contexto em um plano comercial aplicável."],
  ["Preciso ter uma equipe de vendas?", "Não. O Sprint foi pensado para donos de negócio que vendem no WhatsApp, em reuniões ou pessoalmente."],
  ["O plano serve para qualquer segmento?", "O método organiza decisões universais, mas os scripts e exemplos são construídos para o seu negócio."],
  ["Quando recebo o material?", "Depois da aplicação, você sai com o sistema comercial organizado para começar a usar na próxima conversa."],
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand ${compact ? "brand-compact" : ""}`}>
      <span className="brand-mark" aria-hidden="true">S</span>
      <span>startlab</span>
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
            <a href="#sprint" onClick={closeMenu}>O Sprint</a>
            <a href="#entregas" onClick={closeMenu}>O que inclui</a>
            <a href="#perfil" onClick={closeMenu}>É para você?</a>
            <a href="#duvidas" onClick={closeMenu}>Dúvidas</a>
          </nav>
          <div className="nav-actions">
            <a className="nav-login" href="#oferta">Já sou membro</a>
            <a className="btn btn-primary" href="#oferta">Aplicar agora <ArrowUpRight size={15} /></a>
          </div>
        </div>
      </header>

      <main>
        <section className="sales-hero" id="inicio">
          <div className="sales-grid-glow" aria-hidden="true" />
          <div className="shell sales-hero-grid">
            <div className="sales-hero-copy reveal-item">
              <div className="sales-kicker">Para donos de negócio que vendem no WhatsApp, em reunião ou pessoalmente</div>
              <h1>Tenha a <span>implementação comercial</span> do seu negócio pronta e personalizada.</h1>
              <p>Uma sessão <strong>individual</strong> de plano de ação com a Kau + o seu sistema comercial completo: scripts, rotina e roteiros de venda escritos pro seu negócio.</p>
              <div className="sales-actions">
                <a href="#oferta" className="btn btn-primary">Quero destravar as vendas <ArrowUpRight size={16} /></a>
                <a href="#sprint" className="btn btn-ghost">Entender como funciona <ArrowDown size={16} /></a>
              </div>
              <div className="sales-trust"><span className="sales-pulse" />Uma decisão clara para a próxima conversa, a próxima semana e o próximo nível do seu negócio.</div>
            </div>

            <div className="sales-hero-side reveal-item reveal-delay">
              <div className="hero-photo-wrap">
                <img src={heroImage} alt="Estratégia comercial sendo organizada sobre uma mesa de trabalho" />
                <div className="photo-overlay" aria-hidden="true" />
              </div>
              <div className="sales-author-badge"><strong>Sprint de Vendas</strong><span>·</span> Método StartLab</div>
              <div className="sprint-stamp"><span>um plano</span><strong>sob<br />medida</strong><small>para vender melhor</small></div>
              <div className="sprint-paper-card">
                <span className="mono">sistema comercial</span>
                <strong>pronto para<br />implementar</strong>
                <div className="paper-lines"><i /><i /><i /></div>
                <span className="paper-sign">diagnóstico · scripts · rotina</span>
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
            <h2>Você já tentou vender mais.<br /><span>Só faltou um sistema.</span></h2>
            <div className="sprint-problem-grid">
              <article><span className="sprint-quote-mark">“</span><h3>Cada conversa começa do zero</h3><p>Você explica, improvisa, responde e torce para o cliente entender.</p><strong>Isso cansa — e não escala.</strong></article>
              <article><span className="sprint-quote-mark">“</span><h3>O cliente some no meio</h3><p>Sem um roteiro de follow-up, cada silêncio parece um sinal para desistir.</p><strong>Não precisa ser assim.</strong></article>
              <article><span className="sprint-quote-mark">“</span><h3>A rotina depende do seu humor</h3><p>Quando a operação fica só na sua cabeça, vender vira uma tarefa pesada.</p><strong>Clareza dá leveza.</strong></article>
            </div>
          </div>
        </section>

        <section className="sales-section sales-method" id="sprint">
          <div className="shell">
            <div className="sales-section-heading">
              <div><Eyebrow>O Sprint de Vendas</Eyebrow><h2>Um plano feito para o seu momento, <span>não para um cenário ideal.</span></h2></div>
              <p>Você não precisa de mais conteúdo para consumir. Precisa de decisões claras, escritas na ordem certa e prontas para entrar na sua rotina.</p>
            </div>
            <div className="sprint-method-layout">
              <div className="sprint-method-copy">
                <div className="section-image-wrap"><img src={methodImage} alt="Caderno com rotina comercial organizada" /></div>
                <p>E agora com um diferencial que ninguém mais entrega: um plano de ação montado para o seu momento, com decisões claras e na ordem certa.</p>
                <a href="#oferta" className="btn btn-primary">Quero começar <ArrowUpRight size={16} /></a>
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
              <div><Eyebrow>O que você leva</Eyebrow><h2>Menos teoria.<br /><span>Mais implementação.</span></h2></div>
              <p>O material não fica perdido em uma pasta. Ele nasce conectado às conversas, ofertas e decisões que já fazem parte do seu negócio.</p>
            </div>
            <div className="sales-delivery-grid">
              <div className="sales-delivery-list">
                {deliveryItems.map((item, index) => <div key={item}><b>{String(index + 1).padStart(2, "0")}</b><span>{item}</span></div>)}
              </div>
              <div className="sales-quote delivery-card">
                <img src={deliveryImage} alt="Kit de implementação comercial com cartões e caderno" />
                <div className="delivery-card-content"><Eyebrow>A virada de chave</Eyebrow><strong>Você pode continuar improvisando.<br />Ou pode sair daqui com um sistema.</strong><p>O plano deixa de depender da memória, da energia do dia ou da próxima resposta do cliente.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="sales-section sprint-fit" id="perfil">
          <div className="shell">
            <Eyebrow>Para quem é</Eyebrow>
            <div className="sprint-fit-grid">
              <div><h2>É para você se quer parar de <span>vender no improviso.</span></h2><ul><li>Você já tem um negócio rodando e quer organizar a próxima fase.</li><li>Você vende, mas sente que cada conversa depende demais de você.</li><li>Você quer clareza para aplicar, não mais uma aula para assistir.</li></ul></div>
              <div className="sprint-not-fit"><h2>Não é pra você,<br /><span>se...</span></h2><ul><li>Você procura fórmula mágica sem executar nada.</li><li>Quer só assistir aulas, sem aplicar no negócio.</li><li>Não tem — nem quer ter — um negócio rodando.</li></ul></div>
            </div>
          </div>
        </section>

        <section className="sales-section sales-offer" id="oferta">
          <div className="shell sales-offer-grid">
            <div className="offer-copy"><Eyebrow>A aplicação</Eyebrow><h2>Seu próximo passo não precisa ser <span>mais complicado.</span></h2><p>Em uma sessão, você organiza o que precisa ser dito, feito e repetido para vender melhor — com um sistema que respeita o tamanho e o momento do seu negócio.</p><div className="sales-notes"><span>sessão individual</span><span>material personalizado</span><span>plano aplicável</span></div></div>
            <div className="sales-price-card">
              <div className="application-seal" aria-hidden="true"><span>S</span><small>startlab</small><b>aplicação</b></div>
              <Eyebrow>Sprint de Vendas</Eyebrow><div className="sales-price">R$ 97 <small>à vista</small></div><h3>Sessão individual + sistema comercial completo</h3><p>Preencha seus dados para receber as instruções de aplicação. O pagamento demonstrativo via PIX acontece na próxima etapa.</p><div className="offer-rule" aria-hidden="true"><i /><i /><i /></div><a href="#inicio" className="btn btn-primary">Aplicar agora <ArrowUpRight size={16} /></a><small>O resultado depende da aplicação do plano no seu negócio.</small>
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
          <div className="shell"><Eyebrow>O próximo nível começa com uma decisão</Eyebrow><h2>Chega de deixar uma venda importante<br /><span>depender do improviso.</span></h2><p>Você já sabe que precisa organizar. Agora pode sair com o primeiro plano pronto.</p><a href="#oferta" className="btn btn-primary">Quero começar <ArrowUpRight size={16} /></a></div>
        </section>
      </main>

      <footer className="footer"><div className="shell footer-row"><span><Brand compact /> · Sprint de Vendas · Método StartLab © 2026</span><span>Todos os direitos reservados</span></div></footer>
      <div className="floating"><a className="btn btn-primary" href="#oferta">Aplicar para o Sprint <ArrowUpRight size={15} /></a></div>
    </div>
  );
}
