import { ArrowLeft, Check, LayoutTemplate } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { withAppBase } from "@/lib/devPath";
import { PUBLIC_SALES_SECTIONS } from "@shared/publicSalesSections";

const stateSection = PUBLIC_SALES_SECTIONS.find(section => section.id === "state_desired")!;

function PreviewCopy({ compact = false }: { compact?: boolean }) {
  return <div className={compact ? "preview-copy preview-copy-compact" : "preview-copy"}><span className="preview-model-eyebrow">{stateSection.eyebrow}</span><h2>{stateSection.title}</h2>{stateSection.body.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>;
}

function PreviewImage({ src, className = "" }: { src: string; className?: string }) {
  return <img src={src} alt={stateSection.defaultAlt} className={`preview-model-image ${className}`} loading="lazy" />;
}

export default function Preview() {
  const images = trpc.public.salesSectionImages.useQuery();
  const saved = images.data?.find(image => image.sectionId === stateSection.id && image.status === "active");
  const imageSrc = saved?.imageUrl ? withAppBase(saved.imageUrl) : withAppBase(stateSection.defaultImage!);
  return <main className="preview-portfolio-page"><div className="preview-portfolio-shell">
    <header className="preview-portfolio-header"><a href={withAppBase("/")} className="preview-back-link"><ArrowLeft size={16} /> Voltar para a página pública</a><span className="preview-portfolio-kicker"><LayoutTemplate size={15} /> Preview privado de interface</span><h1>Cinco modelos para o bloco 02</h1><p>Área experimental para comparar alternativas da seção <strong>“O estado desejado”</strong>. Esta página não altera a Home pública e não faz parte da oferta aos compradores.</p></header>
    <section className="preview-model-list" aria-label="Cinco modelos da seção O estado desejado">
      <article className="preview-model preview-model-01"><header><span>Modelo 01</span><h2>Base central</h2><p>Composição direta: título, imagem e texto em uma sequência única.</p></header><div className="preview-model-01-stage"><PreviewCopy /><PreviewImage src={imageSrc} /></div></article>
      <article className="preview-model preview-model-02"><header><span>Modelo 02</span><h2>Texto lateral</h2><p>O conteúdo fica em uma coluna e a imagem ocupa o espaço de destaque ao lado.</p></header><div className="preview-model-02-stage"><PreviewCopy compact /><PreviewImage src={imageSrc} /></div></article>
      <article className="preview-model preview-model-03"><header><span>Modelo 03</span><h2>Imagem dominante</h2><p>A imagem assume o protagonismo com o título aplicado em uma camada de leitura.</p></header><div className="preview-model-03-stage"><PreviewImage src={imageSrc} /><div className="preview-model-overlay"><PreviewCopy compact /></div></div></article>
      <article className="preview-model preview-model-04"><header><span>Modelo 04</span><h2>Editorial alternado</h2><p>Uma faixa de identificação cria ritmo antes da imagem e do texto explicativo.</p></header><div className="preview-model-04-stage"><div className="preview-model-ribbon"><Check size={16} /> Estrutura principal pronta</div><PreviewImage src={imageSrc} /><PreviewCopy compact /></div></article>
      <article className="preview-model preview-model-05"><header><span>Modelo 05</span><h2>Mobile primeiro</h2><p>Bloco compacto para leitura vertical, com imagem, mensagem e pontos de clareza.</p></header><div className="preview-model-05-stage"><div className="preview-model-mobile-frame"><PreviewImage src={imageSrc} /><PreviewCopy compact /><ul><li><Check size={15} /> Base digital disponível</li><li><Check size={15} /> Personalização guiada</li><li><Check size={15} /> Operação com mais clareza</li></ul></div></div></article>
    </section>
    <footer className="preview-portfolio-footer"><span>Preview isolado · seção `state_desired`</span><a href={withAppBase("/")}>Voltar sem alterar a versão oficial</a></footer>
  </div></main>;
}
