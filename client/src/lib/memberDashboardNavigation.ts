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
  message: Mail,
  testimonial: MessageCircleMore,
  profile: Settings,
  data: ClipboardList,
  receiving: WalletCards,
  orders: ClipboardList,
  how: Sparkles,
  email: Mail,
  earnings: WalletCards,
  sponsor: UserCog,
  network: UsersRound,
  products: Boxes,
  blog: FileText,
  classified: PanelTop,
  history: History,
  academy: BookOpen,
  faq: CircleHelp,
  invite: Send,
  downloads: Boxes,
  certificate: Award,
  ranking: Medal,
  articles: FileText,
  automation: Bot,
  visits: ChartNoAxesCombined,
  link: Link2,
  bonus: Gift,
  study: GraduationCap,
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
