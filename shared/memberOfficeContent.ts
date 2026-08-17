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
    label: "Escritório",
    items: [
      { icon: "overview", label: "Página inicial", path: "/membros" },
      { icon: "message", label: "Mensagem senha especial", path: "/membros/mensagem-especial" },
      { icon: "testimonial", label: "Fazer depoimento", path: "/membros/fazer-depoimento" },
      { icon: "profile", label: "Editar perfil", path: "/membros/configuracoes" },
      { icon: "data", label: "Meus dados", path: "/membros/meus-dados" },
    ],
  },
  {
    label: "Comece por aqui",
    items: [{ icon: "how", label: "Saiba como divulgar", path: "/membros/como-divulgar" }],
  },
  {
    label: "Seus e-mails no sistema",
    items: [
      { icon: "email", label: "E-mails site & artigos", path: "/membros/emails-site" },
      { icon: "email", label: "E-mails de interessados", path: "/membros/emails-interessados" },
      { icon: "email", label: "E-mails capturados WhatsApp", path: "/membros/emails-whatsapp" },
    ],
  },
  {
    label: "Ferramentas administrativas",
    items: [
      { icon: "earnings", label: "Extrato e total de ganhos", path: "/membros/ganhos" },
      { icon: "sponsor", label: "Meu patrocinador", path: "/membros/patrocinador" },
      { icon: "network", label: "Meus indicados", path: "/membros/rede" },
      { icon: "products", label: "Venda seus produtos", path: "/membros/produtos" },
      { icon: "blog", label: "Blog Página Lucrativa", path: "/membros/blog" },
      { icon: "classified", label: "Classificados", path: "/membros/classificados" },
      { icon: "history", label: "Histórico de visitas", path: "/membros/historico" },
      { icon: "academy", label: "Cursos Página Lucrativa", path: "/membros/academia" },
      { icon: "faq", label: "Perguntas frequentes", path: "/membros/perguntas-frequentes" },
      { icon: "invite", label: "Convidar amigos", path: "/membros/convites" },
    ],
  },
  {
    label: "Complemento",
    items: [
      { icon: "downloads", label: "Baixar produtos", path: "/membros/materiais" },
      { icon: "certificate", label: "Cartão e certificado", path: "/membros/cartao-certificado" },
      { icon: "ranking", label: "Usuários com mais pontos", path: "/membros/ranking" },
      { icon: "articles", label: "Artigos marketing", path: "/membros/artigos" },
      { icon: "automation", label: "Robô WhatsApp e Facebook", path: "/membros/automacoes" },
      { icon: "visits", label: "Top 10 visitas", path: "/membros/top-visitas" },
      { icon: "link", label: "Encurtador de URL", path: "/membros/campanhas" },
      { icon: "bonus", label: "Bônus e materiais", path: "/membros/bonus" },
    ],
  },
  {
    label: "Área de estudo",
    items: [
      { icon: "study", label: "Tabela de pontos e níveis", path: "/membros/pontos-niveis" },
      { icon: "ranking", label: "Usuários mais lucrativos", path: "/membros/mais-lucrativos" },
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
      { icon: "academy", label: "Filmes motivacionais", path: "/membros/filmes" },
    ],
  },
];

export const memberOfficeModuleCount = memberOfficeNavigation.reduce((count, group) => count + group.items.length, 0);
