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
      f("title", "Título", "Negócio digital pronto para começar — sem construir toda a estrutura sozinho.", "textarea", "h1"),
      f("description", "Texto", "Receba acesso a uma Página Lucrativa personalizada, a um Escritório Virtual, ferramentas de divulgação, materiais e uma jornada para aprender, operar e acompanhar o seu projeto.", "textarea", ".sales-hero-copy > p"),
      f("trust", "Mensagem de apoio", "A estrutura já existe. Você personaliza e coloca sua operação em movimento.", "textarea", ".sales-trust-copy"),
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
      f("description", "Texto", "Uma composição visual da base que você personaliza, divulga e acompanha no Escritório Virtual.", "textarea", ".structure-showcase-heading > p"),
    ],
  },
  {
    id: "structure_summary",
    adminLabel: "Resumo da estrutura",
    publicOrder: 3,
    sectionSelector: ".sales-proof",
    fields: [
      f("group1", "Grupo 1", "Estrutura digital", "text", ".sales-proof-group:nth-child(1) strong"),
      f("group1items", "Itens do grupo 1", "Página · Perfil · Escritório", "text"),
      f("group2", "Grupo 2", "Operação organizada", "text", ".sales-proof-group:nth-child(2) strong"),
      f("group2items", "Itens do grupo 2", "Campanhas · Pedidos · Conteúdos", "text"),
    ],
  },
  {
    id: "social_proof",
    adminLabel: "Prova social",
    publicOrder: 4,
    sectionSelector: ".sales-social-proof",
    fields: [
      f("eyebrow", "Identificação", "Prova social", "text", ".eyebrow"),
      f("title", "Título", "Membros reais, dados reais da plataforma.", "textarea", "h2"),
      f("description", "Texto", "Os indicadores abaixo são carregados dos registros existentes. Depoimentos aparecem somente depois de enviados pelo membro e aprovados pela administração.", "textarea", ".sales-section-heading > p"),
    ],
  },
  {
    id: "package",
    adminLabel: "Tudo o que você recebe",
    publicOrder: 5,
    sectionSelector: ".sales-package",
    fields: [
      f("eyebrow", "Identificação", "Tudo o que você recebe", "text", ".eyebrow"),
      f("title", "Título", "Uma base completa para começar com organização.", "textarea", "h2"),
      f("description", "Texto", "A oferta reúne os elementos necessários para configurar sua presença, divulgar e acompanhar sua própria operação.", "textarea", ".sales-section-heading > p"),
      ...[
        ["Página Lucrativa personalizada", "Uma página pública para apresentar sua estrutura e receber solicitações."],
        ["Escritório Virtual", "Um painel para organizar perfil, pedidos, campanhas, recebimentos e acompanhamento."],
        ["Link principal de indicação", "Um endereço próprio para divulgar sua Página Lucrativa."],
        ["Campanhas de divulgação", "Links organizados por canal para acompanhar a origem das visitas."],
        ["Meus pedidos", "Área para acompanhar solicitações atribuídas e confirmações de pagamento."],
        ["Dados de recebimento", "Cadastro dos meios que você usa para receber diretamente dos compradores."],
        ["Biblioteca de Recursos", "Ferramentas e materiais publicados pela administração para apoiar sua divulgação."],
        ["Academia", "Conteúdos de aprendizado para orientar a execução."],
      ].flatMap((item, index) => [
        f(`item${index + 1}Title`, `Item ${index + 1} — título`, item[0], "text", `.package-grid article:nth-child(${index + 1}) strong`),
        f(`item${index + 1}Text`, `Item ${index + 1} — texto`, item[1], "textarea", `.package-grid article:nth-child(${index + 1}) p`),
      ]),
    ],
  },
  ...[
    ["problem_start", "Como funciona na prática", "Como funciona na prática", "Você entra, personaliza, aprende, divulga e acompanha.", [
      "A proposta foi organizada para reduzir a complexidade de começar do zero. Você recebe acesso à estrutura, configura seus dados e entende os recursos disponíveis antes de começar a divulgar.",
      "Depois, utiliza sua página, seu perfil, seus links e campanhas para apresentar a oferta e acompanhar visitas, contatos e pedidos gerados pela sua própria operação.",
      "O sistema organiza a base e o acompanhamento. A execução comercial continua dependendo das suas ações, da sua divulgação e das vendas que realmente acontecerem.",
    ]],
    ["activation_journey", "A jornada", "A jornada", "Da ativação aos primeiros passos da sua operação.", [
      "Depois do pedido, acompanhe a solicitação, receba as orientações de acesso, complete seu perfil, configure seus dados e personalize sua presença digital.",
      "Em seguida, conheça os materiais disponíveis, aprenda a utilizar a estrutura, crie seu primeiro link ou campanha e acompanhe os registros gerados pela sua divulgação.",
    ]],
    ["opportunity_indication", "A oportunidade", "A oportunidade", "Sua estrutura também pode ser usada para apresentar o Código Lucrativo a outras pessoas.", [
      "O membro pode utilizar seu perfil, seu link pessoal e suas campanhas para divulgar a proposta e direcionar interessados para a própria estrutura de apresentação.",
      "Quando uma solicitação chega por um link atribuído ao membro, o sistema pode registrar essa origem e disponibilizar o pedido para acompanhamento dentro do Escritório Virtual.",
      "Quando uma indicação resulta em uma venda válida, a atividade pode gerar receita ao membro conforme as regras comerciais vigentes. A existência da estrutura não representa venda automática, comissão garantida ou promessa de resultado financeiro.",
    ]],
    ["behind_structure", "O Escritório Virtual", "O Escritório Virtual", "Uma área de operação para organizar o que acontece depois da divulgação.", [
      "Dentro da estrutura, você encontra perfil personalizado, link pessoal, campanhas, pedidos atribuídos, contatos consentidos, cursos, e-books, materiais, suporte e acompanhamento financeiro conforme os módulos disponíveis para sua conta.",
      "A função do Escritório Virtual é concentrar ferramentas e informações da operação em um único ambiente, facilitando configuração, divulgação, aprendizado e acompanhamento.",
    ]],
    ["not_just_course", "O diferencial", "O diferencial", "Não é apenas um curso: conhecimento, estrutura, ferramentas e aplicação trabalham juntos.", [
      "Um treinamento pode ensinar conceitos. Aqui, o aprendizado está conectado a uma estrutura digital que você pode configurar e utilizar durante a execução.",
      "A proposta combina conhecimento, Página Lucrativa, Escritório Virtual, materiais e recursos de divulgação para que você consiga aprender e colocar o processo em prática dentro do mesmo ecossistema.",
      "Isso não elimina a necessidade de aprender, divulgar e vender. O diferencial é não precisar construir toda a infraestrutura tecnológica antes de começar.",
    ]],
    ["product_real", "O produto real", "O produto real", "Página Lucrativa não é apenas uma página.", [
      "A página pública é a porta de entrada. Por trás dela existe um Escritório Virtual para organizar dados, perfil, campanhas, pedidos, conteúdos, cursos, contatos e registros da sua própria operação.",
      "Você recebe acesso a uma estrutura digital desenvolvida para ser entendida, personalizada e colocada em movimento — sem precisar começar pela construção da tecnologia.",
    ]],
    ["state_desired", "O estado desejado", "O estado desejado", "Começar com uma base pronta muda o ponto de partida.", [
      "Em vez de começar diante de uma tela em branco, você recebe uma base digital que reúne os primeiros caminhos da operação.",
      "Você entra, entende o que está disponível, personaliza seus dados, aprende a utilizar os recursos e começa a movimentar o projeto com mais clareza.",
    ]],
    ["mechanism", "O mecanismo", "O mecanismo", "Conheça a Estrutura Digital Replicável.", [
      "A Página Lucrativa organiza uma infraestrutura que já existe e pode ser disponibilizada para novos membros sem que cada pessoa precise desenvolver tudo novamente.",
      "A jornada é simples de entender: entre, receba a estrutura, personalize, aprenda, divulgue e acompanhe sua operação.",
      "Replicável significa reutilizar uma base de operação já estruturada. Não significa copiar resultados, receber dinheiro automaticamente, obter vendas garantidas ou eliminar a necessidade de execução comercial.",
    ]],
    ["comparison", "A comparação", "A comparação", "O que você teria de montar se começasse sozinho?", [
      "Produto ou oferta, site, landing page, área do usuário, autenticação, banco de dados, sistema de pedidos, links, campanhas, materiais, treinamento, painel e acompanhamento.",
      "É justamente essa etapa de construção que a Página Lucrativa reduz: você começa com uma estrutura existente e dedica sua energia a entender, personalizar, divulgar e desenvolver sua operação.",
    ]],
    ["ease_real", "A facilidade real", "A facilidade real", "Você não precisa saber programar para começar.", [
      "A infraestrutura tecnológica já foi desenvolvida. O Escritório Virtual apresenta os caminhos disponíveis e concentra as configurações que pertencem à sua conta.",
      "Isso não elimina o aprendizado nem a execução comercial. Significa que você não precisa criar sistemas do zero antes de aprender a operar um projeto digital.",
    ]],
    ["digital_asset", "Seu ativo digital", "Seu ativo digital", "Sua estrutura pode permanecer disponível online.", [
      "Uma página pública pode continuar disponível na internet enquanto sua operação estiver ativa, permitindo que as pessoas encontrem a apresentação e os caminhos que você configurou.",
      "A disponibilidade da estrutura permite continuidade de divulgação e acompanhamento. Os resultados dependem da oferta, do público, da divulgação e da execução real.",
    ]],
    ["proof_matters", "O que você pode avaliar", "O que você pode avaliar", "A proposta é baseada em uma estrutura que pode ser vista, configurada e utilizada.", [
      "Existe uma página, um perfil, um Escritório Virtual, recursos de campanha, pedidos rastreáveis, biblioteca de execução e módulos para acompanhar a operação.",
      "O valor da proposta está em reunir conhecimento e ferramentas para quem quer começar um projeto digital com uma base já desenvolvida e buscar resultados por meio de utilização, divulgação e vendas reais.",
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
      f("fitTitle", "Título — Para quem é", "Para quem quer construir com execução.", "textarea", "> .shell > div:first-child h2"),
      ...[
        "Pessoas dispostas a aprender a operar uma estrutura digital.",
        "Quem quer divulgar com consistência e acompanhar os próprios resultados.",
        "Quem entende que pedidos, vendas e ganhos dependem de execução real.",
        "Quem precisa de uma base organizada para começar sem construir tudo do zero.",
      ].map((value, index) => f(`fit${index + 1}`, `Para quem é — item ${index + 1}`, value, "textarea", `> .shell > div:first-child li:nth-child(${index + 1})`)),
      f("notEyebrow", "Identificação — Para quem não é", "Para quem não é", "text", ".sprint-not-fit .eyebrow"),
      f("notTitle", "Título — Para quem não é", "Não é promessa de resultado automático.", "textarea", ".sprint-not-fit h2"),
      ...[
        "Quem procura dinheiro fácil, automático ou garantido.",
        "Quem não pretende divulgar, aprender ou operar a própria estrutura.",
        "Quem espera que a plataforma venda sozinha sem ação comercial.",
        "Quem busca uma promessa de resultado fixo em vez de uma ferramenta de trabalho.",
      ].map((value, index) => f(`not${index + 1}`, `Para quem não é — item ${index + 1}`, value, "textarea", `.sprint-not-fit li:nth-child(${index + 1})`)),
    ],
  },
  {
    id: "faq",
    adminLabel: "FAQ",
    publicOrder: 20,
    sectionSelector: "#faq",
    fields: [
      f("eyebrow", "Identificação", "Antes de começar", "text", ".eyebrow"),
      f("title", "Título", "Clareza para decidir com segurança.", "textarea", "h2"),
      f("intro", "Texto de abertura", "Uma estrutura pronta só faz sentido quando você entende o que recebe, como utiliza e o que depende da sua execução. Consulte as respostas mais importantes antes de solicitar a ativação.", "textarea", ".copy-stack > p:first-child"),
      ...[
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
        ["Não sei programação.", "Você não precisa programar. A estrutura já existe e você personaliza os dados principais."],
        ["Nunca trabalhei com internet.", "A jornada foi organizada para começar pelo básico: configurar, divulgar e acompanhar."],
        ["Não sei divulgar.", "Você recebe links, campanhas, materiais e conteúdos para orientar a divulgação."],
        ["Tenho pouco tempo.", "Você pode operar em ritmo próprio, mas os resultados exigem constância."],
        ["Consigo utilizar pelo celular?", "Sim. As principais áreas foram pensadas para funcionar em navegador mobile."],
        ["Preciso entender de marketing digital?", "Não precisa começar especialista. Você aprende e aplica conforme avança."],
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
      f("title", "Título", "Comece com uma estrutura digital pronta.", "textarea", ".offer-copy h2"),
      f("description", "Texto", "Você não está solicitando apenas uma página. Está solicitando acesso a uma base de operação para personalizar, aprender, divulgar e acompanhar seu projeto digital.", "textarea", ".offer-copy > p:not(.offer-closing)"),
      f("price", "Informação comercial", "Acesso inicial: R$ 50,00", "text", ".sales-notes span:nth-child(1)"),
      f("condition", "Condição", "Condição informada no processo de ativação", "textarea", ".sales-notes span:nth-child(2)"),
      f("closing", "Fechamento", "O resultado não é automático nem garantido. A estrutura organiza o ponto de partida; pedidos, vendas e ganhos dependem da sua execução e das regras reais da operação.", "textarea", ".offer-closing"),
    ],
  },
];

export type PublicSalesCopyOverrides = Record<string, Record<string, string>>;

export function defaultValuesForSection(section: PublicSalesCopySection) {
  return Object.fromEntries(section.fields.map(field => [field.key, field.value]));
}
