export type MemberOperationContext = {
  eyebrow: string;
  title: string;
  description: string;
  actionNote: string;
  anchorId: "profile" | "convites" | "support" | null;
};

const defaultContext: MemberOperationContext = {
  eyebrow: "Central de Divulgação",
  title: "Central de Divulgação",
  description: "Crie campanhas de divulgação, acompanhe tráfego, conversões, contatos e histórico dentro do seu Escritório Virtual.",
  actionNote: "Escolha uma seção para executar. As alterações realizadas são registradas na sua conta.",
  anchorId: null,
};

const routeContexts: Record<string, MemberOperationContext> = {
  "/membros/operacao": {
    eyebrow: "Central de Divulgação",
    title: "Central de Divulgação",
    description: "Acompanhe em um só lugar o desempenho das suas campanhas de divulgação, tráfego, conversões, contatos e histórico.",
    actionNote: "Use as abas da central para alternar entre os dados da sua divulgação.",
    anchorId: null,
  },
  "/membros/operacao/campanhas": {
    eyebrow: "Central de Divulgação",
    title: "Campanhas",
    description: "Crie e gerencie campanhas de divulgação com links rastreáveis.",
    actionNote: "O destino é derivado automaticamente do seu perfil público.",
    anchorId: null,
  },
  "/membros/operacao/trafego": {
    eyebrow: "Central de Divulgação",
    title: "Tráfego",
    description: "Veja cliques, visitantes únicos e sessões gerados pelas suas campanhas.",
    actionNote: "Filtre os eventos para comparar os canais de divulgação.",
    anchorId: null,
  },
  "/membros/operacao/conversoes": {
    eyebrow: "Central de Divulgação",
    title: "Conversões",
    description: "Acompanhe conversões e resultados atribuídos às suas campanhas de divulgação.",
    actionNote: "Conversões automáticas e registros manuais permanecem identificados.",
    anchorId: null,
  },
  "/membros/operacao/contatos": {
    eyebrow: "Central de Divulgação",
    title: "Contatos",
    description: "Registre contatos consentidos associados às suas campanhas e prepare comunicações dentro da central.",
    actionNote: "Nenhuma mensagem externa é enviada automaticamente.",
    anchorId: null,
  },
  "/membros/operacao/historico": {
    eyebrow: "Central de Divulgação",
    title: "Histórico",
    description: "Consulte eventos e registros recentes da sua divulgação no período selecionado.",
    actionNote: "Os dados são apresentados por campanha e origem conhecida.",
    anchorId: null,
  },
  "/membros/configuracoes": {
    eyebrow: "Perfil do membro",
    title: "Minha página e perfil",
    description: "Atualize o identificador público, a apresentação e os canais de contato que compõem o seu perfil no Escritório Virtual.",
    actionNote: "Revise os dados no formulário de perfil e salve as alterações para atualizar sua conta.",
    anchorId: "profile",
  },
  "/membros/meus-dados": {
    eyebrow: "Dados da conta",
    title: "Dados da conta",
    description: "Consulte e mantenha os dados de apresentação e contato vinculados à sua conta de membro.",
    actionNote: "Use o formulário de perfil para manter as informações que você autoriza exibir atualizadas.",
    anchorId: "profile",
  },
  "/membros/como-divulgar": {
    eyebrow: "Primeiros passos",
    title: "Primeiros passos",
    description: "Crie um link de campanha com destino definido, registre contatos consentidos e acompanhe a origem da sua divulgação.",
    actionNote: "Comece pelo seu perfil e depois crie uma campanha. Registre somente contatos que tenham autorizado o relacionamento.",
    anchorId: "profile",
  },
  "/membros/campanhas": {
    eyebrow: "Divulgação & Contatos",
    title: "Campanhas e links",
    description: "Crie e organize links de campanha para os destinos que você administra, acompanhando cliques e contatos registrados.",
    actionNote: "Cadastre um identificador simples para o link e um destino válido. Você pode remover campanhas que não usa mais.",
    anchorId: "profile",
  },
  "/membros/convites": {
    eyebrow: "Relacionamento responsável",
    title: "Convidar pessoas",
    description: "Prepare convites para pessoas que autorizaram o contato e mantenha um histórico da ação no seu Escritório Virtual.",
    actionNote: "Registre um contato consentido e, em seguida, prepare o convite. O sistema não envia mensagens automaticamente.",
    anchorId: "convites",
  },
  "/membros/fale-conosco": {
    eyebrow: "Suporte funcional",
    title: "Fale conosco",
    description: "Abra uma solicitação para tratar de assuntos funcionais da estrutura e acompanhe a resposta da administração.",
    actionNote: "Dúvidas sobre divulgação continuam organizadas em Saiba como divulgar. Seu nome e e-mail são associados automaticamente à conta autenticada.",
    anchorId: "support",
  },
};

export function getMemberOperationContext(pathname: string): MemberOperationContext {
  const normalizedPath = pathname;
  return routeContexts[normalizedPath] ?? defaultContext;
}
