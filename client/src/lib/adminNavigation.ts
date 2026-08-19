import type { DashboardMenuItem } from "@/components/DashboardLayout";
import { BookOpenCheck, BriefcaseBusiness, ChartNoAxesCombined, CircleDollarSign, FileText, ImagePlus, KeyRound, Layers3, Mail, UsersRound } from "lucide-react";

export const adminMenu: DashboardMenuItem[] = [
  { icon: BriefcaseBusiness, label: "Meu Escritório", path: "/membros", group: "Atuação pessoal" },
  { icon: ChartNoAxesCombined, label: "Operação", path: "/admin", group: "Gestão" },
  { icon: Layers3, label: "Central de manutenção", path: "/admin/operacao", group: "Gestão" },
  { icon: UsersRound, label: "Membros", path: "/admin/membros", group: "Gestão" },
  { icon: ChartNoAxesCombined, label: "Pontuação", path: "/admin/pontos", group: "Gestão" },
  { icon: FileText, label: "Relatos", path: "/admin/relatos", group: "Gestão" },
  { icon: FileText, label: "Pedidos", path: "/admin/pedidos", group: "Gestão" },
  { icon: CircleDollarSign, label: "Financeiro", path: "/admin/financeiro", group: "Gestão" },
  { icon: Mail, label: "Comunicações", path: "/admin/comunicacoes", group: "Gestão" },
  { icon: KeyRound, label: "Mensagem senha especial", path: "/admin/mensagem-especial", group: "Gestão" },
  { icon: Layers3, label: "Catálogo", path: "/admin/produtos", group: "Conteúdo" },
  { icon: BookOpenCheck, label: "Academia", path: "/admin/academia", group: "Conteúdo" },
  { icon: BookOpenCheck, label: "E-books", path: "/admin/ebooks", group: "Conteúdo" },
  { icon: BookOpenCheck, label: "Publicações", path: "/admin/publicacoes", group: "Conteúdo" },
  { icon: ImagePlus, label: "Imagens da página", path: "/admin/imagens", group: "Conteúdo" },
];

export function isAdminNavigation(items: Array<{ path: string }>) {
  return items.length > 0 && items.every(item => (
    item.path === "/admin" || item.path.startsWith("/admin/")
  ));
}
