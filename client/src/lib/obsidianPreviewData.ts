export const OBSIDIAN_PREVIEW_STORAGE_KEY = "pagina-lucrativa.obsidian-preview.enabled";

export function isObsidianPreviewEnabled(locationSearch?: string) {
  if (typeof window === "undefined") return false;

  const search = locationSearch ?? window.location.search;
  const params = new URLSearchParams(search);
  const explicitValue = params.get("obsidianPreview");

  if (explicitValue === "1") {
    window.sessionStorage.setItem(OBSIDIAN_PREVIEW_STORAGE_KEY, "1");
    return true;
  }

  if (explicitValue === "0") {
    window.sessionStorage.removeItem(OBSIDIAN_PREVIEW_STORAGE_KEY);
    return false;
  }

  return window.sessionStorage.getItem(OBSIDIAN_PREVIEW_STORAGE_KEY) === "1";
}

export const obsidianPreviewAdminMetrics = {
  totalMembers: "14.592",
  newMembers: "+124 hoje",
  activeTickets: "43",
  mrr: "R$ 842.500,00",
  conversion: "4,2%",
};

export const obsidianPreviewActivities = [
  { id: "1", user: "Carlos Silva", action: "Assinatura Ouro", time: "Há 5 min", status: "success" },
  { id: "2", user: "Sistema", action: "Backup Automático", time: "Há 12 min", status: "info" },
  { id: "3", user: "Maria Souza", action: "Abertura de Ticket", time: "Há 25 min", status: "warning" },
  { id: "4", user: "Admin", action: "Nova Publicação: Guia 2025", time: "Há 1 hora", status: "success" },
  { id: "5", user: "João Pedro", action: "Upgrade de Plano", time: "Há 2 horas", status: "success" },
];

export const obsidianPreviewMembers = [
  { id: "USR-892", name: "Marcos Silva", email: "marcos@email.com", plan: "Anual Premium", status: "Ativo", progress: 85, joinDate: "12 Ago 2024" },
  { id: "USR-891", name: "Julia Costa", email: "julia.c@email.com", plan: "Mensal", status: "Ativo", progress: 32, joinDate: "10 Ago 2024" },
  { id: "USR-890", name: "Roberto Almeida", email: "roberto@email.com", plan: "Anual Premium", status: "Pendente", progress: 0, joinDate: "Hoje, 14:30" },
  { id: "USR-889", name: "Ana Beatriz", email: "ana.b@email.com", plan: "Trimestral", status: "Inativo", progress: 12, joinDate: "01 Jul 2024" },
  { id: "USR-888", name: "Felipe Santos", email: "felipe@email.com", plan: "Mensal", status: "Cancelado", progress: 100, joinDate: "15 Mai 2024" },
];

export const obsidianPreviewTickets = [
  { id: "TKT-1042", user: "Marcos Silva", subject: "Dúvida sobre o módulo 2", status: "Aberto", priority: "Alta", time: "10 min" },
  { id: "TKT-1041", user: "Ana Beatriz", subject: "Problema na Renovação", status: "Em andamento", priority: "Urgente", time: "1 hora" },
  { id: "TKT-1040", user: "Julia Costa", subject: "Acesso bloqueado", status: "Fechado", priority: "Média", time: "2 dias" },
];

export const obsidianPreviewTestimonials = [
  { id: "DEP-301", user: "Lucas Gabriel", role: "Membro Premium", content: "A estrutura me ajudou a organizar melhor minha divulgação diária.", status: "Pendente", rating: 5, date: "Hoje" },
  { id: "DEP-300", user: "Mariana Souza", role: "Membro", content: "O escritório ficou mais claro para acompanhar materiais, cursos e resultados.", status: "Aprovado", rating: 5, date: "Ontem" },
  { id: "DEP-299", user: "Pedro Costa", role: "Membro", content: "Consegui encontrar rapidamente os próximos passos da operação.", status: "Aprovado", rating: 4, date: "12 Ago 2024" },
];

export const obsidianPreviewMemberMetrics = {
  balance: "R$ 4.250,00",
  monthlyRevenue: "R$ 1.120,00",
  activeCourses: 3,
  visits: "2.840",
  conversion: "8,7%",
};

export const obsidianPreviewEarnings = [
  { id: "TRX-991", date: "Hoje, 14:20", amount: "R$ 150,00", status: "Pago", method: "PIX" },
  { id: "TRX-990", date: "Hoje, 09:15", amount: "R$ 49,90", status: "Pago", method: "Cartão" },
  { id: "TRX-989", date: "Ontem", amount: "R$ 299,00", status: "Processando", method: "Boleto" },
  { id: "TRX-988", date: "12 Ago 2024", amount: "R$ 150,00", status: "Pago", method: "PIX" },
];

export const obsidianPreviewNetwork = [
  { id: "AFI-01", name: "Lucas Gabriel", level: 1, sales: 45, status: "Ativo" },
  { id: "AFI-02", name: "Mariana Silva", level: 1, sales: 12, status: "Ativo" },
  { id: "AFI-03", name: "Pedro Costa", level: 2, sales: 3, status: "Inativo" },
];

export const obsidianPreviewCourses = [
  { id: "C1", title: "Fundamentos do Código", modules: 12, students: 4520, status: "Publicado", thumbnail: "Academia", progress: 100 },
  { id: "C2", title: "Máquina de Aquisição", modules: 8, students: 3105, status: "Publicado", thumbnail: "Aquisição", progress: 45 },
  { id: "C3", title: "Escala 2.0", modules: 15, students: 0, status: "Em Breve", thumbnail: "Escala", progress: 0 },
];

export const obsidianPreviewEbooks = [
  { id: "E1", title: "Checklist de Divulgação", category: "Operação", status: "Publicado" },
  { id: "E2", title: "Scripts de Atendimento", category: "Relacionamento", status: "Publicado" },
  { id: "E3", title: "Guia de Conversão", category: "Vendas", status: "Em revisão" },
];
