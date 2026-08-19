export type MemberOperationContext = {
  eyebrow: string;
  title: string;
  description: string;
  actionNote: string;
  anchorId: "profile" | "convites" | "support" | null;
};

const defaultContext: MemberOperationContext = {
  eyebrow: "Minha operação",
  title: "Minha operação",
  description: "Gerencie seu perfil, organize campanhas, acompanhe contatos consentidos e fale com o suporte dentro do seu Escritório Virtual.",
  actionNote: "Escolha uma etapa para executar. As alterações realizadas são registradas na sua conta.",
  anchorId: null,
};

const routeContexts: Record<string, MemberOperationContext> = {
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
