export type MemberOperationContext = {
  eyebrow: string;
  title: string;
  description: string;
  actionNote: string;
  anchorId: "profile" | "convites" | null;
};

const defaultContext: MemberOperationContext = {
  eyebrow: "Área do membro",
  title: "Escritório Virtual",
  description: "Gerencie seu perfil, divulgue suas campanhas, acompanhe seus contatos autorizados e fale com o suporte. Suas informações ficam organizadas no seu Escritório Virtual.",
  actionNote: "Escolha abaixo a operação que deseja realizar. Todas as alterações são registradas na sua conta.",
  anchorId: null,
};

const routeContexts: Record<string, MemberOperationContext> = {
  "/membros/configuracoes": {
    eyebrow: "Perfil do membro",
    title: "Editar perfil",
    description: "Atualize o identificador público, a apresentação e os canais de contato que compõem o seu perfil no Escritório Virtual.",
    actionNote: "Revise os dados no formulário de perfil e salve as alterações para atualizar sua conta.",
    anchorId: "profile",
  },
  "/membros/meus-dados": {
    eyebrow: "Dados da conta",
    title: "Meus dados",
    description: "Consulte e mantenha os dados de apresentação e contato vinculados à sua conta de membro.",
    actionNote: "Use o formulário de perfil para manter as informações que você autoriza exibir atualizadas.",
    anchorId: "profile",
  },
  "/membros/como-divulgar": {
    eyebrow: "Comece por aqui",
    title: "Saiba como divulgar",
    description: "Crie um link de divulgação com destino definido e acompanhe os contatos consentidos associados à sua operação.",
    actionNote: "O formulário de campanha está logo abaixo. Depois, registre somente contatos que tenham autorizado o relacionamento.",
    anchorId: "profile",
  },
  "/membros/campanhas": {
    eyebrow: "Ferramenta de divulgação",
    title: "Encurtador de URL e campanhas",
    description: "Crie e organize links de campanha para os destinos que você administra, acompanhando cliques e contatos registrados.",
    actionNote: "Cadastre um identificador simples para o link e um destino válido. Você pode remover campanhas que não usa mais.",
    anchorId: "profile",
  },
  "/membros/convites": {
    eyebrow: "Relacionamento responsável",
    title: "Convidar amigos",
    description: "Prepare convites para pessoas que autorizaram o contato e mantenha um histórico da ação no seu Escritório Virtual.",
    actionNote: "Registre um contato consentido e, em seguida, prepare o convite. O sistema não envia mensagens automaticamente.",
    anchorId: "convites",
  },
};

export function getMemberOperationContext(pathname: string): MemberOperationContext {
  const normalizedPath = pathname.startsWith("/paginalucrativa/") ? pathname.slice("/paginalucrativa".length) : pathname;
  return routeContexts[normalizedPath] ?? defaultContext;
}
