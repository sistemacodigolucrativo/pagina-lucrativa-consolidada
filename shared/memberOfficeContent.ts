export type MemberOfficeNavigationItem = {
  icon: string;
  label: string;
  path: string;
};

export type MemberOfficeNavigationGroup = {
  label: string;
  items: MemberOfficeNavigationItem[];
};

/**
 * Navegação principal do membro organizada pela jornada real de uso.
 * Rotas legadas permanecem compatíveis em App.tsx, mas não devem reaparecer
 * como ferramentas duplicadas no menu.
 */
export const memberOfficeNavigation: MemberOfficeNavigationGroup[] = [
  {
    label: "Início",
    items: [
      { icon: "overview", label: "Visão geral", path: "/membros" },
      { icon: "how", label: "Primeiros passos", path: "/membros/como-divulgar" },
      { icon: "operation", label: "Central de Divulgação", path: "/membros/operacao" },
    ],
  },
  {
    label: "Minha página",
    items: [
      { icon: "page", label: "Minha página e perfil", path: "/membros/configuracoes" },
      { icon: "data", label: "Dados da conta", path: "/membros/meus-dados" },
      { icon: "receiving", label: "Dados de recebimento", path: "/membros/recebimentos" },
    ],
  },
  {
    label: "Vendas",
    items: [
      { icon: "orders", label: "Meus pedidos", path: "/membros/meus-pedidos" },
      { icon: "earnings", label: "Ganhos e extrato", path: "/membros/ganhos" },
    ],
  },
  {
    label: "Rede",
    items: [
      { icon: "network", label: "Minha rede", path: "/membros/rede" },
    ],
  },
  {
    label: "Conteúdo",
    items: [
      { icon: "articles", label: "Artigos", path: "/membros/artigos" },
      { icon: "materials", label: "Materiais e downloads", path: "/membros/materiais" },
    ],
  },
  {
    label: "Capacitação",
    items: [
      { icon: "academy", label: "Academia", path: "/membros/academia" },
      { icon: "ebooks", label: "Biblioteca de e-books", path: "/membros/ebooks" },
      { icon: "certificate", label: "Certificados", path: "/membros/cartao-certificado" },
    ],
  },
  {
    label: "Desempenho",
    items: [
      { icon: "performance", label: "Meu desempenho", path: "/membros/pontos" },
    ],
  },
  {
    label: "Ajuda",
    items: [
      { icon: "support", label: "Fale conosco", path: "/membros/fale-conosco" },
      { icon: "testimonial", label: "Enviar depoimento", path: "/membros/fazer-depoimento" },
    ],
  },
];

export const memberOfficeModuleCount = memberOfficeNavigation.reduce((count, group) => count + group.items.length, 0);
