export type MemberOfficeNavigationItem = {
  icon: string;
  label: string;
  path: string;
};

export type MemberOfficeNavigationGroup = {
  label: string;
  items: MemberOfficeNavigationItem[];
};

export const memberOfficeNavigation: MemberOfficeNavigationGroup[] = [
  {
    label: "Minha conta",
    items: [
      { icon: "overview", label: "Visão geral", path: "/membros" },
      { icon: "message", label: "Personalização", path: "/membros/mensagem-especial" },
      { icon: "testimonial", label: "Meu relato", path: "/membros/fazer-depoimento" },
      { icon: "profile", label: "Meu perfil", path: "/membros/configuracoes" },
      { icon: "data", label: "Dados da conta", path: "/membros/meus-dados" },
      { icon: "receiving", label: "Preferências de recebimento", path: "/membros/recebimentos" },
      { icon: "orders", label: "Pedidos da operação", path: "/membros/meus-pedidos" },
      { icon: "automation", label: "Ferramentas da operação", path: "/membros/operacao", },
      { icon: "support", label: "Suporte", path: "/membros/fale-conosco" },
    ],
  },
  {
    label: "Comece por aqui",
    items: [{ icon: "how", label: "Saiba como divulgar", path: "/membros/como-divulgar" }],
  },
  {
    label: "Comunicação",
    items: [
      { icon: "email", label: "Conteúdos do site", path: "/membros/emails-site" },
      { icon: "email", label: "Interessados", path: "/membros/emails-interessados" },
      { icon: "email", label: "WhatsApp", path: "/membros/emails-whatsapp" },
    ],
  },
  {
    label: "Minha operação",
    items: [
      { icon: "earnings", label: "Meus resultados", path: "/membros/ganhos" },
      { icon: "sponsor", label: "Meu apresentador", path: "/membros/patrocinador" },
      { icon: "network", label: "Minha rede direta", path: "/membros/rede" },
      { icon: "products", label: "Meus produtos", path: "/membros/produtos" },
      { icon: "blog", label: "Artigos e blog", path: "/membros/blog" },
      { icon: "classified", label: "Vitrine", path: "/membros/classificados" },
      { icon: "history", label: "Visitas e histórico", path: "/membros/historico" },
      { icon: "academy", label: "Academia", path: "/membros/academia" },
      { icon: "faq", label: "Ajuda e dúvidas", path: "/membros/perguntas-frequentes" },
      { icon: "invite", label: "Convites", path: "/membros/convites" },
    ],
  },
  {
    label: "Conteúdos e materiais",
    items: [
      { icon: "downloads", label: "Biblioteca de recursos", path: "/membros/materiais" },
      { icon: "academy", label: "E-books", path: "/membros/ebooks" },
      { icon: "certificate", label: "Certificados e cartão", path: "/membros/cartao-certificado" },
      { icon: "ranking", label: "Pontos e níveis", path: "/membros/ranking" },
      { icon: "articles", label: "Artigos e marketing", path: "/membros/artigos" },
      { icon: "automation", label: "Preparar comunicações", path: "/membros/automacoes" },
      { icon: "visits", label: "Visitas em destaque", path: "/membros/top-visitas" },
      { icon: "link", label: "Links & campanhas", path: "/membros/campanhas" },
      { icon: "bonus", label: "Bônus", path: "/membros/bonus" },
    ],
  },
  {
    label: "Academia",
    items: [
      { icon: "study", label: "Critérios de pontos", path: "/membros/pontos-niveis" },
      { icon: "ranking", label: "Desempenho comparativo (em revisão)", path: "/membros/mais-lucrativos" },
      { icon: "academy", label: "Curso Google Ads", path: "/membros/curso-google-ads" },
      { icon: "academy", label: "Curso Facebook Ads", path: "/membros/curso-facebook-ads" },
      { icon: "academy", label: "Curso posts para Facebook", path: "/membros/curso-posts-facebook" },
      { icon: "academy", label: "Curso crie designs Canva", path: "/membros/curso-canva" },
      { icon: "academy", label: "Curso como criar um negócio", path: "/membros/curso-negocio" },
      { icon: "academy", label: "Curso autônomo digital", path: "/membros/curso-autonomo" },
      { icon: "academy", label: "Curso de recepcionista", path: "/membros/curso-recepcionista" },
      { icon: "academy", label: "Curso crie um e-book", path: "/membros/curso-ebook" },
      { icon: "academy", label: "Curso de importação", path: "/membros/curso-importacao" },
      { icon: "academy", label: "Curso mestre do Excel", path: "/membros/curso-excel" },
      { icon: "academy", label: "Curso TikTok Ads", path: "/membros/curso-tiktok-ads" },
      { icon: "academy", label: "Curso página de captura", path: "/membros/curso-captura" },
      { icon: "academy", label: "Curso criação de logotipo", path: "/membros/curso-logotipo" },
      { icon: "academy", label: "Curso capas para vídeos", path: "/membros/curso-capas-videos" },
      { icon: "academy", label: "Curso como fazer capas 3D", path: "/membros/curso-capas-3d" },
      { icon: "academy", label: "Curso domínio estratégico", path: "/membros/curso-dominio-estrategico" },
      { icon: "academy", label: "Conteúdos complementares", path: "/membros/filmes" },
    ],
  },
];

export const memberOfficeModuleCount = memberOfficeNavigation.reduce((count, group) => count + group.items.length, 0);
