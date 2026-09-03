export type PublicSalesObjection = {
  question: string;
  answer: string;
  featured?: boolean;
};

export const PUBLIC_SALES_OBJECTIONS: PublicSalesObjection[] = [
  {
    question: "Não sei exatamente o que vou receber.",
    answer: "A ativação reúne o método Código Lucrativo, uma estrutura digital própria e personalizável, Escritório Virtual, perfil, ferramentas de divulgação, campanhas, acompanhamento de pedidos, materiais, conteúdos de aprendizado e suporte, conforme os recursos disponíveis para sua conta.",
    featured: true,
  },
  {
    question: "Tenho medo de ser apenas uma página.",
    answer: "Não é apenas uma página. O Código Lucrativo reúne método, estrutura digital, Escritório Virtual e recursos para você configurar, divulgar e acompanhar sua operação em um único ambiente.",
    featured: true,
  },
  {
    question: "Nunca trabalhei com internet.",
    answer: "A jornada começa pelo básico: fazer a ativação, personalizar seus dados, conhecer as ferramentas, aprender, divulgar e acompanhar. Você não precisa começar como especialista.",
    featured: true,
  },
  {
    question: "Não sei divulgar.",
    answer: "Você encontra links, campanhas, materiais e conteúdos que ajudam a organizar a divulgação. A estrutura reduz a parte técnica, mas a constância e a execução continuam dependendo de você.",
    featured: true,
  },
  {
    question: "Ainda não tenho público.",
    answer: "Você pode começar organizando sua presença, criando campanhas e testando canais de divulgação. Ter uma base pronta ajuda a começar com clareza, sem prometer vendas automáticas.",
    featured: true,
  },
  {
    question: "Tenho receio de assumir uma mensalidade.",
    answer: "Não existe mensalidade. O valor informado no fluxo corresponde à ativação da estrutura, sem cobrança mensal pelo acesso.",
    featured: true,
  },
  {
    question: "Tenho medo de pagar e não saber o que acontece depois.",
    answer: "Após o cadastro, você conclui o pagamento, envia o comprovante pelo fluxo de acompanhamento e dá continuidade à liberação do acesso. O código do pedido permite acompanhar cada etapa.",
  },
  {
    question: "Não tenho um produto próprio.",
    answer: "O Código Lucrativo oferece uma base pronta para configuração, divulgação e acompanhamento. Seu trabalho é conhecer a estrutura, utilizar os recursos e conduzir sua divulgação e seu relacionamento com os interessados.",
  },
  {
    question: "Não entendo como funcionam indicação e pedido.",
    answer: "Seu link identifica a origem da solicitação. Quando alguém faz um pedido por esse endereço, o sistema pode atribuí-lo à sua conta para acompanhamento. Pedido atribuído não significa automaticamente venda, pagamento ou ganho confirmado.",
  },
  {
    question: "Tenho dúvida sobre como vou receber.",
    answer: "O Escritório Virtual permite cadastrar PIX, PayPal, PagSeguro e dados bancários, além de acompanhar pedidos e pagamentos confirmados. A plataforma organiza os registros; ela não processa o pagamento automaticamente.",
  },
  {
    question: "Tenho medo de criar uma expectativa de ganho automático.",
    answer: "A estrutura oferece método, ferramentas e um ponto de partida. Resultados dependem da utilização, divulgação, vendas reais e outros fatores da operação. Não existe garantia de vendas ou ganhos.",
  },
  {
    question: "Tenho pouco tempo.",
    answer: "Você pode avançar no seu ritmo. A estrutura reduz o trabalho de montar a tecnologia do zero, mas aprender, divulgar e acompanhar ainda exige constância.",
  },
  {
    question: "Não entendo de marketing digital nem programação.",
    answer: "Você não precisa saber programar nem começar como especialista em marketing. A parte técnica já está estruturada e os conteúdos ajudam a orientar a utilização.",
  },
  {
    question: "Tenho medo de começar errado.",
    answer: "A jornada indica os próximos passos: ativar, personalizar, aprender, divulgar e acompanhar. Isso reduz a sensação de tela em branco e ajuda a organizar a execução.",
  },
  {
    question: "Tenho receio de não conseguir usar pelo celular.",
    answer: "Os módulos principais podem ser acessados pelo navegador em telas menores. A experiência é responsiva e pode variar conforme o aparelho, o navegador e os dados disponíveis na conta.",
  },
  {
    question: "E se eu precisar de suporte?",
    answer: "O Escritório Virtual possui um canal para abrir solicitações e acompanhar as respostas do suporte.",
  },
];

export const PUBLIC_SALES_DECISION_OBJECTION_QUESTIONS = [
  "Não sei exatamente o que vou receber.",
  "Tenho medo de ser apenas uma página.",
  "Não entendo de marketing digital nem programação.",
  "Não sei divulgar.",
  "Tenho pouco tempo.",
  "Tenho receio de assumir uma mensalidade.",
  "Tenho medo de criar uma expectativa de ganho automático.",
  "Tenho medo de pagar e não saber o que acontece depois.",
] as const;

export const PUBLIC_SALES_DECISION_OBJECTIONS = PUBLIC_SALES_DECISION_OBJECTION_QUESTIONS
  .map(question => PUBLIC_SALES_OBJECTIONS.find(item => item.question === question))
  .filter((item): item is PublicSalesObjection => Boolean(item));
