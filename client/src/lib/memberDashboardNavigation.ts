import { memberOfficeNavigation } from "@shared/memberOfficeContent";
import {
  Award,
  BookOpen,
  Bot,
  Boxes,
  ChartNoAxesCombined,
  CircleHelp,
  ClipboardList,
  FileText,
  Gift,
  GraduationCap,
  History,
  Link2,
  Mail,
  Medal,
  MessageCircleMore,
  PanelTop,
  Send,
  Settings,
  Sparkles,
  UserCog,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export type MemberNavigationItem = {
  icon: LucideIcon;
  label: string;
  path: string;
  group: string;
};

const iconByKey: Record<string, LucideIcon> = {
  overview: ChartNoAxesCombined,
  operation: PanelTop,
  how: Sparkles,
  page: PanelTop,
  data: ClipboardList,
  receiving: WalletCards,
  message: Mail,
  orders: ClipboardList,
  earnings: WalletCards,
  network: UsersRound,
  invite: Send,
  sponsor: UserCog,
  campaigns: Link2,
  traffic: History,
  topVisits: ChartNoAxesCombined,
  contacts: MessageCircleMore,
  communications: Mail,
  automation: Bot,
  blog: BookOpen,
  articles: FileText,
  materials: Boxes,
  bonus: Gift,
  classified: PanelTop,
  academy: GraduationCap,
  ebooks: BookOpen,
  performance: ChartNoAxesCombined,
  levels: GraduationCap,
  ranking: Medal,
  results: Medal,
  certificate: Award,
  faq: CircleHelp,
  support: CircleHelp,
  testimonial: MessageCircleMore,
};

export const memberDashboardMenuItems: MemberNavigationItem[] = memberOfficeNavigation.flatMap(group =>
  group.items.map(item => ({
    icon: iconByKey[item.icon] ?? PanelTop,
    label: item.label,
    path: item.path,
    group: group.label,
  })),
);

export function isMemberOfficeNavigation(items: Array<{ path: string }>) {
  return items.length > 0 && items.every(item => (
    item.path === "/membros" || item.path.startsWith("/membros/")
  ));
}
