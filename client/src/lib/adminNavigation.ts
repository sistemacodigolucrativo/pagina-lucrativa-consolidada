import type { DashboardMenuItem } from "@/components/DashboardLayout";
import { Bell, BookOpenCheck, CalendarClock, ChartNoAxesCombined, FileText, ImagePlus, LayoutTemplate, LifeBuoy, Library, Megaphone, MessageCircleQuestion, UsersRound } from "lucide-react";

export const adminMenu: DashboardMenuItem[] = [
  { icon: ChartNoAxesCombined, label: "Dashboard", path: "/admin", group: "Visão geral" },
  { icon: UsersRound, label: "Membros e rede", path: "/admin/membros", group: "Gestão de membros" },
  { icon: Megaphone, label: "Material de Divulgação", path: "/admin/material-divulgacao", group: "Conteúdo" },
  { icon: Library, label: "Biblioteca de Recursos", path: "/admin/biblioteca-recursos", group: "Conteúdo" },
  { icon: FileText, label: "Publicações", path: "/admin/publicacoes", group: "Conteúdo" },
  { icon: BookOpenCheck, label: "Academia", path: "/admin/academia", group: "Conteúdo" },
  { icon: BookOpenCheck, label: "E-books", path: "/admin/ebooks", group: "Conteúdo" },
  { icon: LifeBuoy, label: "Suporte", path: "/admin/suporte", group: "Relacionamento" },
  { icon: FileText, label: "Depoimentos", path: "/admin/relatos", group: "Relacionamento" },
  { icon: ImagePlus, label: "Configurar Seções", path: "/admin/imagens", group: "Sistema · Landing Page" },
  { icon: MessageCircleQuestion, label: "Perguntas Frequentes", path: "/admin/perguntas-frequentes", group: "Sistema · Landing Page" },
  { icon: LayoutTemplate, label: "Preview", path: "/preview", group: "Sistema" },
  { icon: CalendarClock, label: "FUTURAS IMPLEMENTAÇÕES", path: "/admin/futuras-implementacoes", group: "Sistema" },
  { icon: Bell, label: "Toast", path: "/admin/toast", group: "Sistema" },
];

export function isAdminNavigation(items: Array<{ path: string }>) {
  return items.length > 0 && items.every(item => (
    item.path === "/admin" || item.path === "/preview" || item.path.startsWith("/admin/")
  ));
}
