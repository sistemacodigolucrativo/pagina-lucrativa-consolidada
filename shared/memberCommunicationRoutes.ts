export type CommunicationChannel = "link" | "email" | "whatsapp";

export type MemberCommunicationContext = {
  eyebrow: string;
  title: string;
  description: string;
  formTitle: string;
  messageLabel: string;
  messagePlaceholder: string;
  defaultChannel: CommunicationChannel;
};

const generalContext: MemberCommunicationContext = {
  eyebrow: "Divulgação responsável",
  title: "Central de comunicação",
  description: "Prepare comunicações para contatos que consentiram em receber conteúdo, com registro do canal e da mensagem. Esta central organiza preparos: ela não envia e-mails, WhatsApp ou mensagens externas automaticamente.",
  formTitle: "Preparar comunicação",
  messageLabel: "Mensagem preparada",
  messagePlaceholder: "Escreva a mensagem que será copiada e enviada manualmente pelo canal escolhido.",
  defaultChannel: "email",
};

export function getMemberCommunicationContext(pathname: string): MemberCommunicationContext {
  if (pathname.includes("/membros/automacoes")) {
    return {
      eyebrow: "Sequência assistida",
      title: "Preparar sequência de divulgação",
      description: "Registre cada etapa da sua sequência para manter o histórico de abordagem organizado. O registro é um preparo interno: nenhum envio externo é automatizado por esta área.",
      formTitle: "Preparar uma etapa da sequência",
      messageLabel: "Mensagem da etapa",
      messagePlaceholder: "Descreva a etapa que será copiada e enviada manualmente ao contato consentido.",
      defaultChannel: "email",
    };
  }

  if (pathname.includes("/membros/emails-whatsapp")) {
    return { ...generalContext, defaultChannel: "whatsapp" };
  }

  if (pathname.includes("/membros/emails-site")) {
    return { ...generalContext, defaultChannel: "link" };
  }

  return generalContext;
}
