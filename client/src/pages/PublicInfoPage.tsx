import { withAppBase } from "@/lib/devPath";
import { PUBLIC_SALES_OBJECTIONS } from "@shared/publicSalesObjections";
import { ArrowLeft } from "lucide-react";

type PublicPageKey = "institutional" | "terms" | "privacy" | "commercialRules" | "faq" | "contact";

const pages: Record<PublicPageKey, { eyebrow: string; title: string; intro: string; sections: Array<[string, string]> }> = {
  institutional: {
    eyebrow: "Institucional",
    title: "Quem está por trás do Código Lucrativo",
    intro: "O Código Lucrativo é uma estrutura digital criada para organizar apresentação, divulgação, pedidos e acompanhamento em uma operação comercial simples e transparente.",
    sections: [
      ["História do projeto", "O projeto nasceu da necessidade de entregar uma base pronta para quem deseja começar no digital sem montar página, painel e jornada operacional do zero."],
      ["Origem da ideia", "A ideia central é reunir página pública, Escritório Virtual, campanhas, pedidos, conteúdos e recursos de apoio em uma experiência única."],
      ["Tempo de atuação", "A operação está em evolução contínua, com registros, módulos e fluxos organizados dentro da própria plataforma."],
      ["Propósito", "O propósito é oferecer estrutura, clareza e ferramentas. Resultados dependem da execução do membro, da divulgação realizada e das regras comerciais vigentes."],
      ["Transparência", "A plataforma não promete ganhos automáticos, não processa pagamentos como intermediadora financeira e não substitui o trabalho comercial de quem divulga."],
    ],
  },
  terms: {
    eyebrow: "Termos",
    title: "Termos de Uso",
    intro: "Estes termos reúnem condições gerais de uso do Código Lucrativo e dos recursos disponibilizados aos visitantes, compradores e membros.",
    sections: [
      ["Uso da estrutura", "O acesso à plataforma deve respeitar as regras comerciais vigentes, os dados reais cadastrados e a finalidade de divulgação e acompanhamento."],
      ["Responsabilidade do membro", "O membro é responsável por seus dados públicos, seus meios de recebimento, sua divulgação e sua comunicação com compradores."],
      ["Resultados", "O Código Lucrativo não garante ganhos, vendas, pedidos ou aprovação automática. Qualquer resultado depende de execução, mercado e operação real."],
      ["Alterações", "Funcionalidades, conteúdos e regras podem ser ajustados para preservar segurança, clareza operacional e evolução do projeto."],
    ],
  },
  privacy: {
    eyebrow: "Privacidade",
    title: "Política de Privacidade",
    intro: "Esta página resume como os dados são tratados dentro da operação do Código Lucrativo.",
    sections: [
      ["Dados coletados", "Podem ser coletados dados de cadastro, contato, pedidos, acompanhamento, perfil público e registros necessários ao funcionamento da plataforma."],
      ["Finalidade", "Os dados são utilizados para identificação, liberação de acesso, personalização da página, atribuição de pedidos, suporte e operação dos módulos contratados."],
      ["Dados públicos", "Somente informações configuradas para exibição pública aparecem no Código Lucrativo do membro. Dados cadastrais internos permanecem separados."],
      ["Segurança", "Credenciais e informações sensíveis devem ser protegidas. O usuário deve manter seus dados de acesso em sigilo."],
    ],
  },
  commercialRules: {
    eyebrow: "Condições",
    title: "Regras comerciais aplicáveis",
    intro: "As regras comerciais abaixo organizam a compreensão da oferta e do fluxo de ativação.",
    sections: [
      ["Ativação", "A solicitação de ativação gera um pedido e um código de acompanhamento. A liberação depende das condições reais informadas no fluxo."],
      ["Pagamento direto", "Quando aplicável, o pagamento ocorre diretamente entre comprador e responsável pelo recebimento indicado no pedido."],
      ["Comprovação", "O comprovante pode ser solicitado para conferência manual antes da liberação de acesso."],
      ["Sem garantia de ganhos", "A aquisição da estrutura não representa garantia de venda, conversão, lucro ou qualquer resultado financeiro."],
    ],
  },
  faq: {
    eyebrow: "FAQ · Antes de começar",
    title: "Clareza para decidir com segurança.",
    intro: "Uma estrutura pronta só faz sentido quando você entende o que recebe, como utiliza e o que depende da sua execução. Consulte as respostas mais importantes antes de solicitar a ativação.",
    sections: PUBLIC_SALES_OBJECTIONS.map(({ question, answer }) => [question, answer] as [string, string]),
  },
  contact: {
    eyebrow: "Suporte",
    title: "Contato e suporte",
    intro: "Use esta página para localizar os caminhos de contato disponíveis conforme sua situação.",
    sections: [
      ["Já fez um pedido", "Utilize a página de acompanhamento do pedido com seu código para verificar status, pagamento e liberação."],
      ["Já é membro", "Acesse o Escritório Virtual e abra uma solicitação na área de suporte para manter o histórico organizado."],
      ["Ainda está avaliando", "Consulte a página pública, as perguntas frequentes, a página institucional e as regras comerciais antes de solicitar a ativação."],
    ],
  },
};

export function InstitutionalPage() {
  return <PublicInfoPage pageKey="institutional" />;
}

export function TermsPage() {
  return <PublicInfoPage pageKey="terms" />;
}

export function PrivacyPage() {
  return <PublicInfoPage pageKey="privacy" />;
}

export function CommercialRulesPage() {
  return <PublicInfoPage pageKey="commercialRules" />;
}

export function FaqPage() {
  return <PublicInfoPage pageKey="faq" />;
}

export function ContactPage() {
  return <PublicInfoPage pageKey="contact" />;
}

function PublicInfoPage({ pageKey }: { pageKey: PublicPageKey }) {
  const page = pages[pageKey];
  const isFaqPage = pageKey === "faq";
  return <main className={`sales-page public-info-page ${isFaqPage ? "public-faq-page" : ""}`.trim()}>
    <section className="public-info-hero">
      <div className="shell">
        <a className="preview-back-link" href={withAppBase("/")}><ArrowLeft size={16} /> Voltar para a página pública</a>
        <span className="preview-portfolio-kicker">{page.eyebrow}</span>
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
      </div>
    </section>
    <section className="public-info-content">
      <div className={isFaqPage ? "shell public-faq-list" : "shell public-info-grid"}>{page.sections.map(([title, description]) => isFaqPage
        ? <details key={title}><summary>{title}</summary><p>{description}</p></details>
        : <article key={title}><h2>{title}</h2><p>{description}</p></article>)}</div>
    </section>
  </main>;
}
