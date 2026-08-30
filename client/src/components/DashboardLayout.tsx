import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Sparkles,
  type LucideIcon,
  Users,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import {
  isMemberOfficeNavigation,
  memberDashboardMenuItems,
} from "@/lib/memberDashboardNavigation";
import { adminMenu, isAdminNavigation } from "@/lib/adminNavigation";

const defaultMenuItems = [
  { icon: LayoutDashboard, label: "Page 1", path: "/" },
  { icon: Users, label: "Page 2", path: "/some-path" },
];

export type DashboardMenuItem = {
  icon: LucideIcon;
  label: string;
  path: string;
  group?: string;
};

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

function isAcademyCourseRoute(path: string) {
  return path.startsWith("/membros/curso");
}

function isNavigationItemActive(itemPath: string, activePath: string) {
  return itemPath === activePath
    || (itemPath === "/membros/academia" && isAcademyCourseRoute(activePath))
    || (itemPath === "/membros/operacao" && activePath.startsWith("/membros/operacao/"));
}

export default function DashboardLayout({
  children,
  menuItems = defaultMenuItems,
  title = "Escritório",
  subtitle,
}: {
  children: React.ReactNode;
  menuItems?: DashboardMenuItem[];
  title?: string;
  subtitle?: string;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();
  const [, setLocation] = useLocation();
  const navigationMenuItems = isMemberOfficeNavigation(menuItems)
    ? memberDashboardMenuItems
    : isAdminNavigation(menuItems)
      ? adminMenu
      : menuItems;
  const requiresAdmin = navigationMenuItems.some(item => item.path === "/admin" || item.path.startsWith("/admin/"));
  const redirectPath = !loading && !user
    ? "/acesso"
    : !loading && requiresAdmin && user?.role !== "admin"
      ? "/membros"
      : null;

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    if (redirectPath) setLocation(redirectPath);
  }, [redirectPath, setLocation]);
  if (loading || redirectPath) {
    return <DashboardLayoutSkeleton />
  }
  return (
    <SidebarProvider
      defaultOpen={false}
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth} menuItems={navigationMenuItems} title={title} subtitle={subtitle}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
  menuItems: DashboardMenuItem[];
  title: string;
  subtitle?: string;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
  menuItems,
  title,
  subtitle,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };
  const { state, setOpen, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isCompact = !isMobile && isCollapsed;
  const [isResizing, setIsResizing] = useState(false);
  const [groupOverrides, setGroupOverrides] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeGroupRef = useRef<string | null>(null);
  const activePath = location || "/";
  const groupedMenuItems = menuItems.reduce<Record<string, DashboardMenuItem[]>>((groups, item) => {
    const group = item.group ?? "Navegação";
    groups[group] = [...(groups[group] ?? []), item];
    return groups;
  }, {});
  const memberOfficeNavigation = isMemberOfficeNavigation(menuItems);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifications = trpc.member.notifications.useQuery(undefined, {
    enabled: memberOfficeNavigation && user?.role === "user",
    refetchInterval: 30000,
  });
  const markNotificationRead = trpc.member.markNotificationRead.useMutation({
    onSuccess: async notification => {
      await notifications.refetch();
      if (notification.entityType === "application") setLocation(`/membros/meus-pedidos`);
    },
  });

  const isGroupOpen = (group: string, items: DashboardMenuItem[]) => {
    if (groupOverrides[group] !== undefined) return groupOverrides[group];
    if (!memberOfficeNavigation || isCompact) return true;
    return items.some(item => isNavigationItemActive(item.path, activePath));
  };

  const toggleGroup = (group: string, items: DashboardMenuItem[]) => {
    setGroupOverrides(current => ({
      ...current,
      [group]: !(current[group] ?? isGroupOpen(group, items)),
    }));
  };

  useEffect(() => {
    if (isCompact) {
      setIsResizing(false);
    }
  }, [isCompact]);

  useEffect(() => {
    if (!memberOfficeNavigation) return;
    const activeGroup = Object.entries(groupedMenuItems).find(([, items]) =>
      items.some(item => isNavigationItemActive(item.path, activePath)),
    )?.[0] ?? null;
    if (activeGroupRef.current === activeGroup) return;
    activeGroupRef.current = activeGroup;
    setGroupOverrides(activeGroup ? { [activeGroup]: true } : {});
  }, [activePath, groupedMenuItems, memberOfficeNavigation]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative dashboard-sidebar-shell" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="dashboard-sidebar border-r-0 transition-[width] duration-200 ease-out"
          disableTransition={isResizing}
        >
          <SidebarHeader className="dashboard-sidebar-header h-20 justify-center">
            <div className="flex w-full items-center gap-3 px-2 transition-all">
              <button
                type="button"
                onClick={() => (isMobile ? setOpenMobile(false) : setOpen(isCollapsed))}
                className="h-9 w-9 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label={isMobile ? "Fechar navegação" : isCompact ? "Expandir menu" : "Recolher menu"}
                title={isMobile ? "Fechar navegação" : isCompact ? "Expandir menu" : "Recolher menu"}
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCompact ? (
                <div className="dashboard-brand min-w-0">
                  <span className="dashboard-brand-mark" aria-hidden="true"><Sparkles /></span>
                  <div className="min-w-0">
                    <span className="dashboard-brand-name">C. Lucrativo</span>
                    {subtitle ? <span className="dashboard-brand-subtitle">{subtitle}</span> : <span className="dashboard-brand-subtitle">{memberOfficeNavigation ? "Member Mode" : "Admin Mode"}</span>}
                  </div>
                </div>
              ) : <span className="dashboard-brand-mark" aria-hidden="true"><Sparkles /></span>}
            </div>
          </SidebarHeader>

          <SidebarContent className="dashboard-sidebar-content gap-0 overflow-y-auto overscroll-contain pb-4">
            {Object.entries(groupedMenuItems).map(([group, items]) => {
              const hasSubmenu = items.length > 1;
              const groupOpen = isGroupOpen(group, items);
              const menuContent = (
                <SidebarMenu>
                  {items.map(item => {
                    const isActive = isNavigationItemActive(item.path, activePath);
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => {
                            setGroupOverrides(current => ({ ...current, [group]: true }));
                            setLocation(item.path);
                            if (isMobile) setOpenMobile(false);
                          }}
                          tooltip={item.label}
                          aria-label={item.label}
                          title={isCompact ? item.label : undefined}
                          className="dashboard-nav-item h-11 transition-all duration-200 font-normal"
                        >
                          <item.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-primary" : ""}`} />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              );

              if (!hasSubmenu) {
                return (
                  <SidebarGroup key={group} className="px-2 py-1">
                    <SidebarGroupLabel className="px-2 text-[9px] uppercase tracking-[.12em] text-muted-foreground group-data-[collapsible=icon]:sr-only">
                      {group}
                    </SidebarGroupLabel>
                    {menuContent}
                  </SidebarGroup>
                );
              }

              return (
                <SidebarGroup key={group} className="px-2 py-1">
                  <Collapsible open={groupOpen} onOpenChange={() => toggleGroup(group, items)}>
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="flex h-8 w-full items-center justify-between rounded-md px-2 text-left text-[9px] uppercase tracking-[.12em] text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring group-data-[collapsible=icon]:sr-only"
                        aria-label={`${group}: ${groupOpen ? "recolher" : "expandir"} submenu`}
                      >
                        <span>{group}</span>
                        <ChevronDown className={`size-3 transition-transform duration-200 ${groupOpen ? "rotate-180" : ""}`} />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-none">
                      {menuContent}
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarGroup>
              );
            })}
          </SidebarContent>

          <SidebarFooter className="dashboard-sidebar-footer border-t border-border/60 bg-sidebar p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Abrir menu da conta" className="dashboard-account flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="dashboard-avatar h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user?.role === "admin" && !location.startsWith("/admin") ? <DropdownMenuItem onClick={() => setLocation("/admin")} className="cursor-pointer"><span>Voltar para Administração</span></DropdownMenuItem> : null}
                {user?.role === "admin" && location.startsWith("/admin") ? <DropdownMenuItem onClick={() => setLocation("/membros")} className="cursor-pointer"><span>Abrir meu Escritório</span></DropdownMenuItem> : null}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 hidden w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors md:block ${isCollapsed ? "md:hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="dashboard-inset">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-leading">
            <SidebarTrigger className="dashboard-mobile-trigger h-10 w-10 md:hidden" aria-label="Abrir navegação" />
            <div className="dashboard-context">
              <span className="dashboard-context-kicker">{memberOfficeNavigation ? "Área do membro" : "Console administrativo"}</span>
              <strong>{title}</strong>
            </div>
          </div>
          <div className="dashboard-topbar-meta">
            <span className="dashboard-mode-pill">{memberOfficeNavigation ? "Member Mode" : "Admin Mode"}</span>
            <span className="dashboard-live-indicator"><i aria-hidden="true" /> Operação protegida</span>
            <span className="dashboard-shortcut">CTRL B</span>
          </div>
        </header>
        {memberOfficeNavigation && user?.role === "user" ? (
          <div className="dashboard-notifications">
            <button type="button" aria-label={`Notificações${notifications.data?.unreadCount ? `: ${notifications.data.unreadCount} não lidas` : ""}`} onClick={() => setNotificationsOpen(current => !current)} className="dashboard-notification-trigger">
              <Bell className="size-4" />
              {notifications.data?.unreadCount ? <span className="dashboard-notification-count">{notifications.data.unreadCount}</span> : null}
            </button>
            {notificationsOpen ? <section className="dashboard-notification-panel">
              <h2>Notificações</h2>
              {notifications.isLoading ? <p className="dashboard-notification-empty">Carregando...</p> : notifications.data?.items.length ? <div className="dashboard-notification-list">{notifications.data.items.map(item => <button key={item.id} type="button" onClick={() => markNotificationRead.mutate({ id: item.id })} className="dashboard-notification-item"><div className="flex items-start justify-between gap-3"><strong>{item.title}</strong>{!item.readAt ? <span className="dashboard-unread-dot" aria-label="Não lida" /> : null}</div><p>{item.message}</p><time>{new Date(item.createdAt).toLocaleString("pt-BR")}</time></button>)}</div> : <p className="dashboard-notification-empty">Nenhuma notificação.</p>}
            </section> : null}
          </div>
        ) : null}
        <main className="dashboard-main flex-1">{children}</main>
      </SidebarInset>
    </>
  );
}
