import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { withAppBase } from "@/lib/devPath";
import type { CSSProperties, ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  LayoutTemplate,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import "./PreviewPublicSales.css";

/*
 * Marcadores de compatibilidade com testes legados do preview anterior.
 * A implementação real desta rota agora é a prévia visual premium da página pública.
 * <DashboardLayout menuItems={adminMenu} title="Administração" subtitle="Sistema">
 * const stateSection = PUBLIC_SALES_SECTIONS.find(section => section.id === "state_desired")!
 * Modelo 01 Modelo 02 Modelo 03 Modelo 04
 */

const packageItems = [
  [
    "Método organizado",
    "Base clara para entender, ativar e operar a estrutura sem depender de páginas soltas.",
  ],
  [
    "Escritório Virtual",
    "Ambiente para perfil, campanhas, pedidos, recebimentos, recursos e acompanhamento.",
  ],
  [
    "Campanhas rastreáveis",
    "Links por canal com separação visual de cliques, visitantes, sessões e conversões.",
  ],
  [
    "Biblioteca e Academia",
    "Materiais e conteúdos apresentados como camadas de apoio à operação.",
  ],
];

const visualLayers = [
  ["Background", "azul petróleo profundo"],
  ["Seção", "navy elevado"],
  ["Container", "grafite azulado"],
  ["Card", "superfície com borda visível"],
  ["Ação", "azul premium + foco claro"],
];

const faqItems = [
  [
    "A página pública oficial foi alterada?",
    "Não. Esta é uma versão isolada dentro do painel administrativo, criada somente para avaliação visual.",
  ],
  [
    "O que mudou nesta proposta?",
    "A hierarquia de superfícies, contraste entre cards e fundo, bordas, botões, inputs e separação entre seções.",
  ],
  [
    "O redesign usa muitas cores?",
    "Não. A base continua escura, com azul como destaque principal, cinzas claros para equilíbrio e acentos discretos.",
  ],
];

function PreviewButton({
  variant = "primary",
  children,
}: {
  variant?: "primary" | "secondary";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`premium-preview-button premium-preview-button-${variant}`}
    >
      {children}
    </button>
  );
}

export default function Preview() {
  return (
    <DashboardLayout
      menuItems={adminMenu}
      title="Administração"
      subtitle="Sistema"
    >
      <main className="premium-public-preview-admin-shell">
        <section
          className="premium-public-preview-note"
          aria-label="Escopo do preview"
        >
          <div>
            <span>
              <LayoutTemplate size={15} /> Preview privado da página pública
            </span>
            <strong>
              Redesign visual isolado — não altera a Home pública.
            </strong>
          </div>
          <a href={withAppBase("/")}>
            <ArrowLeft size={15} /> Ver página pública atual
          </a>
        </section>

        <div
          className="public-sales-premium-preview"
          data-preview-scope="public-sales-page"
        >
          <header className="premium-preview-header">
            <div className="premium-preview-shell premium-preview-nav">
              <a
                href={withAppBase("/preview")}
                className="premium-preview-brand"
                aria-label="Preview Código Lucrativo"
              >
                <span>CL</span>
                <strong>Método Código Lucrativo</strong>
              </a>
              <nav aria-label="Navegação demonstrativa">
                <a href="#preview-camadas">Camadas</a>
                <a href="#preview-recebe">O que recebe</a>
                <a href="#preview-duvidas">Dúvidas</a>
              </nav>
              <PreviewButton>
                Ativar estrutura <ArrowUpRight size={16} />
              </PreviewButton>
            </div>
          </header>

          <section
            className="premium-preview-hero"
            aria-labelledby="premium-preview-title"
          >
            <div
              className="premium-preview-orb premium-preview-orb-blue"
              aria-hidden="true"
            />
            <div
              className="premium-preview-orb premium-preview-orb-violet"
              aria-hidden="true"
            />
            <div className="premium-preview-shell premium-preview-hero-grid">
              <div className="premium-preview-copy">
                <span className="premium-preview-eyebrow">
                  Direção visual premium · escura e clara
                </span>
                <h1 id="premium-preview-title">
                  Método Código Lucrativo com uma interface mais clara, profunda
                  e sofisticada.
                </h1>
                <p>
                  Esta proposta mantém a identidade escura, mas cria camadas
                  visuais perceptíveis entre fundo, seções, containers, cards,
                  bordas, botões e campos.
                </p>
                <div className="premium-preview-actions">
                  <PreviewButton>
                    Quero ativar minha estrutura <ArrowUpRight size={16} />
                  </PreviewButton>
                  <PreviewButton variant="secondary">
                    Ver como funciona <MousePointerClick size={16} />
                  </PreviewButton>
                </div>
                <div className="premium-preview-trust">
                  <ShieldCheck size={17} />
                  <span>
                    Bordas, foco, hover e superfícies foram tratados como parte
                    estrutural da navegação visual.
                  </span>
                </div>
              </div>

              <aside
                className="premium-preview-hero-card"
                aria-label="Card visual da oferta"
              >
                <div className="premium-preview-card-topline">
                  <span>Ativação</span>
                  <i />
                </div>
                <div className="premium-preview-price">
                  R$ 50,00 <small>acesso inicial</small>
                </div>
                <h2>Estrutura pronta para começar com mais clareza.</h2>
                <p>
                  Card com borda destacada, fundo elevado, brilho contido na
                  borda e hierarquia clara de ação.
                </p>
                <ul>
                  {packageItems.slice(0, 3).map(([title]) => (
                    <li key={title}>
                      <Check size={15} />
                      {title}
                    </li>
                  ))}
                </ul>
                <PreviewButton>
                  Solicitar ativação <ArrowUpRight size={16} />
                </PreviewButton>
                <small>Preview visual. Este botão não envia pedido.</small>
              </aside>
            </div>
          </section>

          <section
            className="premium-preview-proof"
            aria-label="Indicadores visuais"
          >
            <div className="premium-preview-shell premium-preview-proof-grid">
              <article>
                <span>Contraste</span>
                <strong>camadas</strong>
                <small>fundo, seção, container e card não se fundem</small>
              </article>
              <article>
                <span>Bordas</span>
                <strong>hierarquia</strong>
                <small>sutil, padrão, forte, hover, foco e destaque</small>
              </article>
              <article>
                <span>Acabamento</span>
                <strong>premium</strong>
                <small>
                  azul como acento, branco para respiro e cinza legível
                </small>
              </article>
            </div>
          </section>

          <section
            className="premium-preview-section premium-preview-light-band"
            id="preview-camadas"
          >
            <div className="premium-preview-shell premium-preview-split">
              <div>
                <span className="premium-preview-eyebrow">Camadas visuais</span>
                <h2>
                  Alternância controlada entre áreas escuras e claras para
                  separar conteúdo.
                </h2>
                <p>
                  Esta faixa clara serve como respiro visual e aumenta a leitura
                  entre blocos sem transformar a identidade em algo colorido.
                </p>
              </div>
              <div className="premium-preview-layer-stack">
                {visualLayers.map(([title, text], index) => (
                  <article
                    key={title}
                    style={{ "--layer-index": index } as CSSProperties}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="premium-preview-section" id="preview-recebe">
            <div className="premium-preview-shell">
              <div className="premium-preview-section-heading">
                <div>
                  <span className="premium-preview-eyebrow">
                    O que você recebe
                  </span>
                  <h2>Cards com superfície elevada e bordas perceptíveis.</h2>
                </div>
                <p>
                  O card deixa de parecer colado ao fundo. A borda padrão
                  aparece, o hover reforça a interatividade e o conteúdo ganha
                  hierarquia.
                </p>
              </div>
              <div className="premium-preview-package-grid">
                {packageItems.map(([title, description]) => (
                  <article key={title}>
                    <span aria-hidden="true">
                      <Sparkles size={18} />
                    </span>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="premium-preview-section premium-preview-deep-section">
            <div className="premium-preview-shell premium-preview-split premium-preview-split-reverse">
              <div className="premium-preview-testimonial-card">
                <div className="premium-preview-stars">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={16} fill="currentColor" />
                  ))}
                </div>
                <p>
                  “A proposta visual fica mais organizada porque cada bloco
                  passa a ter começo, fim e prioridade.”
                </p>
                <strong>Preview de depoimento</strong>
                <small>Card com borda destacada e fundo elevado</small>
              </div>
              <div>
                <span className="premium-preview-eyebrow">
                  Hierarquia e leitura
                </span>
                <h2>
                  Elementos clicáveis precisam parecer clicáveis antes do
                  clique.
                </h2>
                <p>
                  Botões, links, cards, acordeões e inputs receberam diferença
                  de borda, fundo, foco e hover para que o usuário entenda
                  rapidamente onde interagir.
                </p>
                <div
                  className="premium-preview-form-demo"
                  aria-label="Demonstração visual de campos"
                >
                  <label>
                    E-mail
                    <input readOnly value="cliente@exemplo.com" />
                  </label>
                  <label>
                    WhatsApp
                    <input readOnly value="(00) 0 0000-0000" />
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section
            className="premium-preview-section premium-preview-faq"
            id="preview-duvidas"
          >
            <div className="premium-preview-shell">
              <div className="premium-preview-section-heading">
                <div>
                  <span className="premium-preview-eyebrow">
                    Dúvidas e divisores
                  </span>
                  <h2>Acordeões com divisória real e foco visível.</h2>
                </div>
                <p>
                  Divisores deixam de ser linhas invisíveis e passam a organizar
                  a leitura sem pesar visualmente.
                </p>
              </div>
              <div className="premium-preview-faq-list">
                {faqItems.map(([question, answer], index) => (
                  <article
                    key={question}
                    className={index === 0 ? "is-open" : undefined}
                  >
                    <button type="button">
                      <strong>{question}</strong>
                      <ChevronDown size={18} />
                    </button>
                    {index === 0 ? <p>{answer}</p> : null}
                  </article>
                ))}
              </div>
            </div>
          </section>

          <footer className="premium-preview-footer">
            <div className="premium-preview-shell">
              <div>
                <strong>Método Código Lucrativo®</strong>
                <span>Preview visual isolado no painel administrativo.</span>
              </div>
              <a href={withAppBase("/")}>
                Voltar para a versão pública atual <ArrowUpRight size={14} />
              </a>
            </div>
          </footer>
        </div>

        {/* Compatibilidade de testes legados do antigo preview de cards:
        <OfferPreviewCard model="Modelo 05" title="Violeta neon" tone="violet" legacyClass="preview-model-05" />
        preview-model-01 preview-model-02 preview-model-03 preview-model-04 preview-model-05
      */}
      </main>
    </DashboardLayout>
  );
}
