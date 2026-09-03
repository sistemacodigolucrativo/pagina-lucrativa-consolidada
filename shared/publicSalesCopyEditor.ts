export type PublicSalesCopyField = {
  key: string;
  label: string;
  value: string;
  input: "text" | "textarea";
  selector?: string;
  referenceCopyIndex?: number;
};

export type PublicSalesCopySection = {
  id: string;
  adminLabel: string;
  publicOrder: number;
  sectionSelector?: string;
  referenceCopyIndex?: number;
  imageSectionId?: string;
  imageAfterField?: number;
  staticImage?: string;
  fields: PublicSalesCopyField[];
};

const f = (key: string, label: string, value: string, input: "text" | "textarea" = "text", selector?: string): PublicSalesCopyField => ({ key, label, value, input, selector });

export const PUBLIC_SALES_COPY_CATEGORY = "public-sales-copy";

export const PUBLIC_SALES_COPY_SECTIONS: PublicSalesCopySection[] = [
  {
    id: "hero",
    adminLabel: "Hero",
    publicOrder: 1,
    sectionSelector: ".sales-hero",
    staticImage: "/codigo-lucrativo-banner.png",
    imageAfterField: 1,
    fields: [
      f("kicker", "Chamada superior", "Para quem quer começar no digital sem começar do zero", "text", ".sales-kicker"),
      f("title", "Título", "Receba o Método Código Lucrativo pronto para começar — com estrutura consolidada para ativar e operar.", "textarea", "h1"),
      f("description", "Texto", "Tenha acesso ao Método Código Lucrativo com Escritório Virtual, ferramentas de divulgação, materiais e recursos organizados para aprender, ativar e acompanhar sua operação em um único ambiente.", "textarea", ".sales-hero-copy > p"),
      f("trust", "Mensagem de apoio", "Você recebe uma estrutura pronta, entende o método, ativa sua operação e acompanha tudo em um só lugar.", "textarea", ".sales-trust-copy"),
    ],
  },
  {
    id: "structure_showcase",
    adminLabel: "Estrutura digital",
    publicOrder: 2,
    sectionSelector: ".structure-showcase",
    imageSectionId: "hero_operation",
    imageAfterField: 1,
    fields: [
      f("eyebrow", "Identificação", "Estrutura digital", "text", ".eyebrow"),
      f("title", "Título", "Pronta para operar.", "text", "#structure-showcase-title"),
      f("description", "Texto", "Uma composição visual da base pronta que você entende, ativa, divulga e acompanha no Escritório Virtual.", "textarea", ".structure-showcase-heading > p"),
    ],
  },
  {
    id: "structure_summary",
    adminLabel: "Resumo da estrutura",
    publicOrder: 3,
    sectionSelector: ".sales-proof",
    fields: [
      f("group1", "Grupo 1", "Método e estrutura", "text", ".sales-proof-group:nth-child(1) strong"),
      f("group1items", "Itens do grupo 1", "Método · Perfil · Escritório", "text"),
      f("group2", "Grupo 2", "Operação organizada", "text", ".sales-proof-group:nth-child(2) strong"),
      f("group2items", "Itens do grupo 2", "Campanhas · Pedidos · Conteúdos", "text"),
    ],
  },
  {
    id: "package",
    adminLabel: "Tudo o que você recebe",
    publicOrder: 4,
    sectionSelector: ".sales-package",
    fields: [
      f("eyebrow", "Identificação", "Tudo o que você recebe", "text", ".eyebrow"),
      f("title", "Título", "Você recebe o método com uma estrutura de operação, não uma explicação solta.", "textarea", "h2"),
      f("description", "Texto", "Método Código Lucrativo, Escritório Virtual, campanhas, recebimentos, pedidos, histórico, biblioteca, academia e suporte reunidos no mesmo fluxo.", "textarea", ".sales-section-heading > p"),
      ...[
        ["Método Código Lucrativo", "Base pronta e consolidada para receber, conhecer, personalizar, operar e evoluir sua execução."],
        ["Escritório Virtual", "Ambiente operacional para organizar perfil, pedidos, campanhas, recebimentos e acompanhamento."],
        ["Link principal de indicação", "Endereço próprio para divulgar sua estrutura com mais clareza."],
        ["Campanhas de divulgação", "Links organizados por canal para acompanhar a origem das visitas."],
        ["Pedidos e comprovantes", "Área para acompanhar solicitações, pagamentos, envio de comprovantes e andamento da análise."],
        ["Dados de recebimento", "Cadastro dos meios que você usa para receber diretamente dos compradores."],
        ["Biblioteca de Recursos", "Ferramentas e materiais que sustentam o método e apoiam sua divulgação."],
        ["Academia", "Conteúdos de aprendizado para orientar a utilização do método."],
      ].flatMap((item, index) => [
        f(`item${index + 1}Title`, `Item ${index + 1} — título`, item[0], "text", `.package-grid article:nth-child(${index + 1}) strong`),
        f(`item${index + 1}Text`, `Item ${index + 1} — texto`, item[1], "textarea", `.package-grid article:nth-child(${index + 1}) p`),
      ]),
    ],
  },
  {
    id: "social_proof",
    adminLabel: "Prova social",
    publicOrder: 5,
    sectionSelector: ".sales-social-proof",
    fields: [
      f("eyebrow", "Identificação", "Quem já faz parte", "text", ".eyebrow"),
      f("title", "Título", "Veja experiências de quem já utiliza a estrutura.", "textarea", "h2"),
      f("description", "Texto", "Conheça experiências de quem utiliza o Método Código Lucrativo para organizar, divulgar e acompanhar sua presença digital.", "textarea", ".sales-section-heading > p"),
    ],
  },
  ...[
    ["problem_start", "Como tudo começou", "Como tudo começou", "O fundador começou procurando uma forma séria de entrar no digital — assim como muita gente.", [
      "Antes do Código Lucrativo, a busca era a mesma de quem chega até esta página: encontrar um caminho confiável para começar no digital sem cair em promessa vazia.",
      "Depois de investir tempo e dinheiro em cursos, métodos e materiais que ensinavam muita teoria, ficou claro que o problema não era falta de informação. O que faltava era uma estrutura pronta para colocar em prática.",
      "Foi dessa necessidade que nasceu o Método Código Lucrativo: uma base consolidada para receber, conhecer, personalizar, operar e evoluir uma operação digital com mais clareza.",
    ]],
    ["state_desired", "O estado desejado", "O estado desejado", "Começar com um método pronto muda completamente o ponto de partida.", [
      "Em vez de começar diante de uma tela em branco, você recebe uma estrutura digital que já reúne método, página pública, Escritório Virtual, recursos de divulgação e caminhos de acompanhamento.",
      "Você entra, entende o que já foi organizado, personaliza seus dados essenciais, aprende a utilizar os recursos e começa a movimentar o projeto com mais clareza.",
    ]],
    ["mechanism", "O mecanismo", "O mecanismo", "Um método proprietário que mantém a base pronta para cada novo membro.", [
      "O Método Código Lucrativo organiza uma estrutura que já existe, já foi refinada e pode ser disponibilizada para novos membros sem que cada pessoa precise refazer toda a base operacional.",
      "A jornada é simples de entender: receber acesso, conhecer a estrutura, personalizar os dados essenciais, operar os recursos e evoluir a execução com acompanhamento.",
      "A estrutura reduz a parte técnica do início. Resultados comerciais dependem da sua utilização, divulgação e das vendas efetivamente realizadas.",
    ]],
    ["product_real", "O produto real", "O produto real", "Código Lucrativo não é apenas uma página. É um método com estrutura pronta por trás.", [
      "A página pública é a porta de entrada. Por trás dela existe um Escritório Virtual para organizar dados, perfil, campanhas, pedidos, conteúdos, cursos, contatos e registros da sua própria conta.",
      "Você recebe acesso a uma estrutura digital preparada para ser entendida, personalizada e colocada em operação — sem precisar começar pela parte técnica inicial.",
    ]],
    ["behind_structure", "O Escritório Virtual", "O Escritório Virtual", "O ambiente onde o Método Código Lucrativo é entregue organizado.", [
      "Dentro da estrutura, você encontra perfil personalizado, link pessoal, campanhas, pedidos atribuídos, contatos recebidos com autorização, cursos, e-books, materiais, suporte e acompanhamento financeiro conforme as áreas disponíveis para sua conta.",
      "A função do Escritório Virtual é concentrar os recursos que sustentam o método em um único ambiente, facilitando implantação, divulgação, aprendizado e acompanhamento.",
    ]],
    ["activation_journey", "A jornada", "A jornada", "Receber, conhecer, personalizar, operar e evoluir com o Método Código Lucrativo.", [
      "Depois do pedido, você acompanha a solicitação, recebe as orientações de acesso, completa seu perfil, informa seus dados essenciais e entende como sua estrutura foi organizada.",
      "Em seguida, conhece os materiais disponíveis, personaliza os pontos essenciais, opera os recursos do método e evolui sua execução acompanhando os registros gerados pela própria operação.",
    ]],
    ["opportunity_indication", "A oportunidade", "A oportunidade", "Sua divulgação também pode gerar oportunidades de venda atribuídas à sua estrutura.", [
      "Seu link pessoal permite divulgar a proposta e direcionar interessados para sua própria estrutura de apresentação.",
      "Quando uma solicitação chega pelo seu link, o sistema pode identificar essa origem e disponibilizar o pedido para acompanhamento no Escritório Virtual.",
      "Quando uma indicação resulta em uma venda válida, ela pode gerar receita conforme as regras comerciais vigentes. Receita só existe quando há uma venda válida e confirmada segundo essas regras.",
    ]],
    ["not_just_course", "O diferencial", "O diferencial", "Não é mais um curso prometendo teoria. É um método pronto com estrutura para usar.", [
      "Um curso comum pode ensinar conceitos e deixar o aluno sozinho para resolver a parte técnica depois. Aqui, o aprendizado está conectado a uma estrutura digital que você recebe pronta para conhecer, personalizar e operar.",
      "A proposta combina Método Código Lucrativo, Escritório Virtual, materiais, conteúdos de aprendizado e recursos de divulgação para que o processo seja compreendido dentro do próprio ambiente de execução.",
      "O diferencial é começar com a parte técnica já estruturada, para concentrar seu esforço em aprender, divulgar e operar com consistência.",
    ]],
    ["comparison", "A comparação", "A comparação", "O que você teria de organizar se continuasse tentando sozinho?", [
      "Produto ou oferta, site, página de apresentação, área do usuário, acesso seguro, sistema de pedidos, links, campanhas, materiais, treinamento, painel e acompanhamento.",
      "Foi justamente para reduzir essa etapa pesada de preparação técnica que o Método Código Lucrativo foi consolidado: você começa a partir de uma estrutura existente e dedica sua energia a entender, personalizar, divulgar, operar e evoluir.",
    ]],
    ["ease_real", "A facilidade real", "A facilidade real", "Você não precisa saber programar para utilizar o método.", [
      "A parte técnica já foi preparada e organizada. O Escritório Virtual apresenta os caminhos disponíveis e concentra as áreas que pertencem à sua conta.",
      "Isso não elimina o aprendizado nem a execução comercial. Significa que você não precisa resolver sistemas antes de aprender a operar um projeto digital.",
    ]],
    ["digital_asset", "Seu ativo digital", "Seu ativo digital", "Sua estrutura pode permanecer disponível online.", [
      "Uma página pública pode continuar disponível na internet enquanto sua conta estiver ativa, permitindo que as pessoas encontrem a apresentação e os caminhos que você ativou.",
      "A disponibilidade da estrutura permite continuidade de divulgação e acompanhamento enquanto sua conta estiver ativa.",
    ]],
    ["proof_matters", "O que você pode avaliar", "O que você pode avaliar", "A proposta é baseada em uma estrutura real, consolidada e em atualização constante.", [
      "Existe uma página, um perfil, um Escritório Virtual, recursos de campanha, pedidos que você consegue acompanhar, biblioteca de execução e áreas para acompanhar seus registros.",
      "O valor da proposta está em reunir método, conhecimento e ferramentas para quem quer começar um projeto digital com uma base já preparada e buscar resultados por meio de utilização, divulgação e vendas reais.",
    ]],
  ].map((entry, index) => {
    const [id, adminLabel, eyebrow, title, body] = entry as [string, string, string, string, string[]];
    return {
      id,
      adminLabel,
      publicOrder: 6 + index,
      referenceCopyIndex: index,
      imageSectionId: id,
      imageAfterField: 1,
      fields: [
        f("eyebrow", "Identificação", eyebrow, "text", ".eyebrow"),
        f("title", "Título", title, "textarea", "h2"),
        ...body.map((paragraph, paragraphIndex) => f(`paragraph${paragraphIndex + 1}`, `Texto ${paragraphIndex + 1}`, paragraph, "textarea", `.copy-stack p:nth-child(${paragraphIndex + 1})`)),
      ],
    } satisfies PublicSalesCopySection;
  }),
  {
    id: "videos",
    adminLabel: "Contexto e apresentação",
    publicOrder: 18,
    sectionSelector: "#videos",
    fields: [
      f("eyebrow", "Identificação", "Contexto e apresentação", "text", ".eyebrow"),
      f("title", "Título", "Veja a ideia por trás da estrutura.", "textarea", "h2"),
      f("description", "Texto", "Os vídeos abaixo são materiais históricos de apresentação. Eles ajudam a entender a origem da proposta, mas estão em revisão para refletir o Escritório Virtual e os recursos atuais com a mesma clareza desta nova página.", "textarea", ".sales-section-heading > p"),
    ],
  },
  {
    id: "fit",
    adminLabel: "Para quem é / Para quem não é",
    publicOrder: 19,
    sectionSelector: "#perfil-ideal",
    fields: [
      f("fitEyebrow", "Identificação — Para quem é", "Para quem é", "text", "> .shell > div:first-child .eyebrow"),
      f("fitTitle", "Título — Para quem é", "Para quem quer operar com execução.", "textarea", "> .shell > div:first-child h2"),
      ...[
        "Pessoas dispostas a aprender a operar uma estrutura digital.",
        "Quem quer divulgar com consistência e acompanhar os próprios resultados.",
        "Quem entende que pedidos, vendas e ganhos dependem de execução real.",
        "Quem precisa de uma base organizada para começar com estrutura pronta.",
      ].map((value, index) => f(`fit${index + 1}`, `Para quem é — item ${index + 1}`, value, "textarea", `li:nth-child(${index + 1})`)),
      f("notEyebrow", "Identificação — Para quem não é", "Para quem não é", "text", ".sprint-not-fit .eyebrow"),
      f("notTitle", "Título — Para quem não é", "Não é promessa de resultado automático.", "textarea", ".sprint-not-fit h2"),
      ...[
        "Quem busca uma solução de renda automática ou resultados garantidos.",
        "Quem não pretende utilizar e divulgar a própria estrutura.",
        "Quem espera que a plataforma venda sozinha sem ação comercial.",
        "Quem busca uma promessa de resultado fixo em vez de uma ferramenta de trabalho.",
      ].map((value, index) => f(`not${index + 1}`, `Para quem não é — item ${index + 1}`, value, "textarea", `.sprint-not-fit li:nth-child(${index + 1})`)),
    ],
  },
  {
    id: "faq",
    adminLabel: "FAQ completa (página separada)",
    publicOrder: 20,
    sectionSelector: ".public-info-faq-content",
    fields: [
      f("eyebrow", "Identificação", "Antes de começar", "text", ".eyebrow"),
      f("title", "Título", "Clareza para decidir com segurança.", "textarea", "h2"),
      f("intro", "Texto de abertura", "Uma estrutura pronta só faz sentido quando você entende o que recebe, como utiliza e o que depende da sua execução. Consulte as respostas mais importantes antes de solicitar a ativação.", "textarea", ".copy-stack > p:first-child"),
      ...[
        ["O que exatamente estou comprando?", "Você está solicitando acesso ao Método Código Lucrativo: estrutura digital pronta, perfil, Escritório Virtual e recursos disponíveis para personalização, divulgação, acompanhamento e aprendizado. A disponibilidade de alguns conteúdos depende de publicação e dos recursos liberados para sua conta."],
        ["É somente uma página?", "Não. A página é a porta de entrada. O ecossistema inclui painel de operação, perfil público, link pessoal, campanhas, pedidos, contatos, cursos, e-books, materiais, suporte e histórico de adesões, conforme os módulos disponíveis."],
        ["Preciso criar um produto ou saber programação?", "Você não precisa preparar a infraestrutura tecnológica. A criação de uma oferta, a divulgação e a operação comercial continuam sendo responsabilidades do membro."],
        ["Como funciona a indicação e o pedido?", "Seu perfil pode ter um link próprio. Quando uma pessoa envia uma solicitação por esse endereço, o sistema pode atribuir o pedido à sua conta e exibi-lo em Meus pedidos. Pedido atribuído não é sinônimo de venda, pagamento ou ganho confirmado."],
        ["Como funciona o recebimento?", "O Escritório Virtual permite organizar preferências como PIX, PayPal, PagSeguro e dados bancários, além de acompanhar pedidos, pagamentos confirmados e histórico de adesões. Essas áreas armazenam informações e registros; não processam pagamentos automaticamente."],
        ["Vou ganhar dinheiro automaticamente?", "Não. A estrutura fornece recursos e uma base de operação. Qualquer resultado depende da sua execução, divulgação, pedidos, vendas reais, conferência e outros fatores do negócio. Não existe garantia de ganhos."],
        ["O que acontece depois que eu faço o pedido?", "Depois do envio, você recebe um número para acompanhar sua solicitação. A partir daí, consegue acompanhar as etapas de pagamento, análise e liberação do acesso."],
        ["Existe mensalidade ou garantia?", "A página deve seguir a condição comercial vigente informada no processo de ativação. O formulário não deve esconder custos, etapas ou condições. Garantia de ganhos não existe; qualquer política comercial ou de cancelamento deve ser consultada nas regras oficiais da oferta."],
        ["Posso acessar pelo celular?", "A interface foi preparada para uso responsivo em telas menores, e os módulos principais podem ser acessados por navegador. A experiência pode variar conforme a tela, o navegador e os dados disponíveis na conta."],
        ["Existe suporte?", "Sim. O Escritório Virtual possui um canal para abrir solicitações e acompanhar as respostas do suporte."],
      ].flatMap((item, index) => [
        f(`q${index + 1}`, `Pergunta ${index + 1}`, item[0], "textarea", `details:nth-of-type(${index + 1}) summary`),
        f(`a${index + 1}`, `Resposta ${index + 1}`, item[1], "textarea", `details:nth-of-type(${index + 1}) p`),
      ]),
    ],
  },
  {
    id: "objections",
    adminLabel: "Antes da oferta",
    publicOrder: 21,
    sectionSelector: "#duvidas-decisao",
    fields: [
      f("eyebrow", "Identificação", "Antes da oferta", "text", ".eyebrow"),
      f("title", "Título", "O que costuma travar a decisão.", "textarea", "h2"),
      f("description", "Texto", "Respostas curtas para dúvidas comuns antes de solicitar a ativação.", "textarea", ".sales-section-heading > p"),
      ...[
        ["Não sei exatamente o que vou receber.", "Você recebe o Método Código Lucrativo, uma estrutura digital pronta, Escritório Virtual, campanhas, pedidos, histórico, biblioteca, academia e suporte em um fluxo organizado."],
        ["Tenho medo de ser apenas uma página.", "A página é a porta de entrada; o Método Código Lucrativo inclui também ambiente operacional, acompanhamento, recursos e organização da operação."],
        ["Não entendo de marketing digital nem programação.", "A proposta é entregar a base pronta para uso. Seu foco fica em entender o fluxo, divulgar com constância e acompanhar pedidos."],
        ["Não sei divulgar.", "A estrutura centraliza links, campanhas e materiais de apoio para facilitar a divulgação sem improviso."],
        ["Tenho pouco tempo.", "O fluxo foi pensado para uso direto, com cadastro, pagamento, comprovante e acompanhamento em etapas claras."],
        ["Tenho receio de assumir uma mensalidade.", "Não existe mensalidade neste modelo atual. O valor informado corresponde à solicitação de ativação."],
        ["Tenho medo de criar uma expectativa de ganho automático.", "Não existe promessa de ganho. Resultado depende da sua execução, divulgação, constância e contexto."],
        ["Tenho medo de pagar e não saber o que acontece depois.", "Após o cadastro, você segue para pagamento, envia o comprovante e acompanha a análise até a liberação pelo fluxo oficial."],
      ].flatMap((item, index) => [
        f(`q${index + 1}`, `Objeção ${index + 1}`, item[0], "textarea", `.objection-grid article:nth-child(${index + 1}) strong`),
        f(`a${index + 1}`, `Resposta ${index + 1}`, item[1], "textarea", `.objection-grid article:nth-child(${index + 1}) p`),
      ]),
    ],
  },
  {
    id: "offer",
    adminLabel: "Próximo passo",
    publicOrder: 22,
    sectionSelector: "#f",
    fields: [
      f("eyebrow", "Identificação", "Próximo passo", "text", ".offer-copy .eyebrow"),
      f("title", "Título", "Comece com sua estrutura digital pronta para operar.", "textarea", ".offer-copy h2"),
      f("description", "Texto", "Sua solicitação de ativação cria o registro necessário para cadastro, pagamento, envio do comprovante e análise da estrutura inicial.", "textarea", ".offer-copy > p:not(.offer-closing)"),
      f("price", "Informação comercial", "Valor da solicitação de ativação: R$ 50,00", "text", ".sales-notes span:nth-child(1)"),
      f("condition", "Condição", "Sem mensalidade. Solicitação → pagamento → comprovante → análise → acesso liberado", "textarea", ".sales-notes span:nth-child(2)"),
      f("closing", "Fechamento", "O formulário registra o cadastro; o pagamento acontece na etapa seguinte e o comprovante dá continuidade ao fluxo já existente. Resultados dependem da sua execução e divulgação.", "textarea", ".offer-closing"),
    ],
  },
];

export type PublicSalesCopyOverrides = Record<string, Record<string, string>>;

export function defaultValuesForSection(section: PublicSalesCopySection) {
  return Object.fromEntries(section.fields.map(field => [field.key, field.value]));
}
