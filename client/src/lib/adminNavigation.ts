import type { DashboardMenuItem } from "@/components/DashboardLayout";
import { BookOpenCheck, ChartNoAxesCombined, ClipboardList, FileText, ImagePlus, LifeBuoy, Mail, Settings, UsersRound } from "lucide-react";

export const adminMenu: DashboardMenuItem[] = [
  { icon: ChartNoAxesCombined, label: "Dashboard", path: "/admin", group: "Visão geral" },
  { icon: UsersRound, label: "Membros e rede", path: "/admin/membros", group: "Gestão de membros" },
  { icon: FileText, label: "Publicações", path: "/admin/publicacoes", group: "Conteúdo" },
  { icon: BookOpenCheck, label: "Academia", path: "/admin/academia", group: "Conteúdo" },
  { icon: BookOpenCheck, label: "E-books", path: "/admin/ebooks", group: "Conteúdo" },
  { icon: ImagePlus, label: "Página de vendas", path: "/admin/imagens", group: "Conteúdo" },
  { icon: LifeBuoy, label: "Suporte", path: "/admin/suporte", group: "Relacionamento" },
  { icon: FileText, label: "Depoimentos", path: "/admin/relatos", group: "Relacionamento" },
  { icon: Mail, label: "Comunicações", path: "/admin/comunicacoes", group: "Relacionamento" },
  { icon: Settings, label: "Configurações", path: "/admin/configuracoes", group: "Sistema" },
  { icon: ClipboardList, label: "Auditoria", path: "/admin/auditoria", group: "Sistema" },
];

export function isAdminNavigation(items: Array<{ path: string }>) {
  return items.length > 0 && items.every(item => (
    item.path === "/admin" || item.path.startsWith("/admin/")
  ));
}
