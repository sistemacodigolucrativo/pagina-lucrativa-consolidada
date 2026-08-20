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
 * Mapa global de navegação do membro. Os paths são contratos de rota e não devem
 * ser alterados quando apenas a arquitetura de informação ou o label mudarem.
 */
export const memberOfficeNavigation: MemberOfficeNavigationGroup[] = [
  {
    label: "Início",
    items: [
      { icon: "overview", label: "Visão geral", path: "/membros" },
      { icon: "how", label: "Primeiros passos", path: "/membros/como-divulgar" },
      { icon: "operation", label: "Minha operação", path: "/membros/operacao" },
    ],
  },
  {
    label: "Minha página",
    items: [
      { icon: "page", label: "Minha página e perfil", path: "/membros/configuracoes" },
      { icon: "data", label: "Dados da conta", path: "/membros/meus-dados" },
      { icon: "receiving", label: "Dados de recebimento", path: "/membros/recebimentos" },
      { icon: "message", label: "Mensagem de acesso", path: "/membros/mensagem-especial" },
    ],
  },
  {
    label: "Vendas & Rede",
    items: [
      { icon: "orders", label: "Meus pedidos", path: "/membros/meus-pedidos" },
      { icon: "earnings", label: "Ganhos e extrato", path: "/membros/ganhos" },
      { icon: "network", label: "Meus indicados", path: "/membros/rede" },
      { icon: "invite", label: "Convidar pessoas", path: "/membros/convites" },
      { icon: "sponsor", label: "Meu patrocinador", path: "/membros/patrocinador" },
      { icon: "products", label: "Meus produtos", path: "/membros/produtos" },
    ],
  },
  {
    label: "Divulgação & Contatos",
    items: [
      { icon: "automation", label: "Automações", path: "/membros/automacoes" },
    ],
  },
  {
    label: "Conteúdos & Materiais",
    items: [
      { icon: "blog", label: "Blog", path: "/membros/blog" },
      { icon: "articles", label: "Artigos", path: "/membros/artigos" },
      { icon: "materials", label: "Materiais e downloads", path: "/membros/materiais" },
      { icon: "bonus", label: "Bônus e materiais extras", path: "/membros/bonus" },
      { icon: "classified", label: "Classificados", path: "/membros/classificados" },
    ],
  },
  {
    label: "Academia",
    items: [
      { icon: "academy", label: "Academia", path: "/membros/academia" },
      { icon: "ebooks", label: "Biblioteca de e-books", path: "/membros/ebooks" },
    ],
  },
  {
    label: "Desempenho",
    items: [
      { icon: "performance", label: "Meu desempenho", path: "/membros/pontos" },
      { icon: "levels", label: "Pontos e níveis", path: "/membros/pontos-niveis" },
      { icon: "ranking", label: "Ranking de pontos", path: "/membros/ranking" },
      { icon: "results", label: "Ranking de resultados", path: "/membros/mais-lucrativos" },
      { icon: "certificate", label: "Certificados", path: "/membros/cartao-certificado" },
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
