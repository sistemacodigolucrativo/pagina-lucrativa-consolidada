import { ArrowLeft, ArrowUpRight, Check, LayoutTemplate, ShieldCheck, Sparkles } from "lucide-react";
import { withAppBase } from "@/lib/devPath";
import { PUBLIC_SALES_SECTIONS } from "@shared/publicSalesSections";

const stateSection = PUBLIC_SALES_SECTIONS.find(section => section.id === "state_desired")!;
const benefits = ["Página personalizada", "Escritório Virtual", "Campanhas e pedidos"];

function OfferPreviewCard({ model, title, tone, legacyClass }: { model: string; title: string; tone: string; legacyClass: string }) {
  return <article className={`offer-preview-card offer-preview-${tone} ${legacyClass}`}>
    <div className="offer-preview-topline"><span>{model}</span><i /></div>
    <div className="offer-preview-seal" aria-hidden="true"><span>PL</span><small>ativação</small></div>
    <div className="offer-preview-price">R$ 50,00 <small>acesso inicial</small></div>
    <h2>{title}</h2>
    <p>Solicite a ativação da sua estrutura digital e siga para os meios de pagamento disponíveis.</p>
    <ul>{benefits.map(item => <li key={item}><Check size={15} /> {item}</li>)}</ul>
    <button type="button" className="offer-preview-button">Solicitar ativação <ArrowUpRight size={16} /></button>
    <small className="offer-preview-note">Preview visual isolado. Não envia pedido.</small>
  </article>;
}

export default function Preview() {
  return <main className="preview-portfolio-page offer-preview-page"><div className="preview-portfolio-shell">
    <header className="preview-portfolio-header"><a href={withAppBase("/")} className="preview-back-link"><ArrowLeft size={16} /> Voltar para a página pública</a><span className="preview-portfolio-kicker"><LayoutTemplate size={15} /> Preview privado de interface</span><h1>Cinco versões do card de ativação</h1><p>Variações visuais do card da oferta com valor <strong>R$ 50,00</strong>, usando cores fortes, brilho e acabamento de ouro metálico polido no valor e no botão. Esta página não altera a Home pública.</p></header>
    <section className="offer-preview-grid" aria-label="Cinco versões do card de ativação">
      <OfferPreviewCard model="Modelo 01" title="Ouro polido clássico" tone="gold" legacyClass="preview-model-01" />
      <OfferPreviewCard model="Modelo 02" title="Esmeralda premium" tone="emerald" legacyClass="preview-model-02" />
      <OfferPreviewCard model="Modelo 03" title="Rubi intenso" tone="ruby" legacyClass="preview-model-03" />
      <OfferPreviewCard model="Modelo 04" title="Azul elétrico" tone="electric" legacyClass="preview-model-04" />
      <OfferPreviewCard model="Modelo 05" title="Violeta neon" tone="violet" legacyClass="preview-model-05" />
    </section>
    <section className="offer-preview-guidance"><ShieldCheck size={18} /><p>Use esta área apenas para escolher direção visual. Depois da aprovação, a versão escolhida pode ser aplicada no card real da página pública.</p><Sparkles size={18} /></section>
    <footer className="preview-portfolio-footer"><span>Preview isolado · card da oferta R$ 50</span><a href={withAppBase("/")}>Voltar sem alterar a versão oficial</a></footer>
  </div></main>;
}
