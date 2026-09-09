import type { DashboardMenuItem } from "@/components/DashboardLayout";
import { Bell, BookOpenCheck, CalendarClock, ChartNoAxesCombined, FileText, ImagePlus, LayoutTemplate, LifeBuoy, Library, Megaphone, Rocket, UsersRound } from "lucide-react";

export const adminMenu: DashboardMenuItem[] = [
  { icon: ChartNoAxesCombined, label: "Dashboard", path: "/admin", group: "Visão geral" },
  { icon: UsersRound, label: "Membros e rede", path: "/admin/membros", group: "Gestão de membros" },
  { icon: Megaphone, label: "Material de Divulgação", path: "/admin/material-divulgacao", group: "Conteúdo" },
  { icon: Library, label: "Biblioteca de Recursos", path: "/admin/biblioteca-recursos", group: "Conteúdo" },
  { icon: FileText, label: "Publicações", path: "/admin/publicacoes", group: "Conteúdo" },
  { icon: Library, label: "Biblioteca de e-books", path: "/admin/ebooks", group: "Capacitação" },
  { icon: BookOpenCheck, label: "Academia", path: "/admin/academia", group: "Capacitação" },
  { icon: LifeBuoy, label: "Suporte", path: "/admin/suporte", group: "Relacionamento" },
  { icon: FileText, label: "Agradecimentos", path: "/admin/relatos", group: "Relacionamento" },
  { icon: ImagePlus, label: "Configurar Seções", path: "/admin/imagens", group: "Sistema" },
  { icon: LayoutTemplate, label: "Preview", path: "/preview", group: "Sistema" },
  { icon: Bell, label: "Toast", path: "/admin/toast", group: "Sistema" },
  { icon: Rocket, label: "Deploy manual", path: "/admin/deploy", group: "Sistema" },
  { icon: CalendarClock, label: "FUTURAS IMPLEMENTAÇÕES", path: "/admin/futuras-implementacoes", group: "Anotações" },
];

export function isAdminNavigation(items: Array<{ path: string }>) {
  return items.length > 0 && items.every(item => (
    item.path === "/admin" || item.path === "/preview" || item.path.startsWith("/admin/")
  ));
}
