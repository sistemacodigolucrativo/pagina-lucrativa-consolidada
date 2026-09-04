import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  LogOut,
  PanelLeft,
  Shield,
  Sparkles,
  User,
  type LucideIcon,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useMemberGettingStartedProgress } from "@/hooks/useMemberGettingStartedProgress";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import {
  isMemberOfficeNavigation,
  memberDashboardMenuItems,
} from "@/lib/memberDashboardNavigation";
import { adminMenu, isAdminNavigation } from "@/lib/adminNavigation";

const defaultMenuItems: DashboardMenuItem[] = [];

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
      defaultOpen={true}
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
  const { state, setOpen, isMobile, openMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isCompact = !isMobile && isCollapsed;
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const activePath = location || "/";
  const memberOfficeNavigation = isMemberOfficeNavigation(menuItems);
  const gettingStartedProgress = useMemberGettingStartedProgress({
    enabled: memberOfficeNavigation && user?.role === "user",
  });
  const visibleMenuItems = memberOfficeNavigation && user?.role === "user" && gettingStartedProgress.isComplete
    ? menuItems.filter(item => item.path !== "/membros/como-divulgar")
    : menuItems;
  const adminNavigation = isAdminNavigation(menuItems);
  const menuScrollStorageKey = `pagina-lucrativa.dashboard-menu-scroll.${memberOfficeNavigation ? "member" : adminNavigation ? "admin" : "custom"}`;

  const storeSidebarScroll = (scrollTop: number) => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(menuScrollStorageKey, String(scrollTop));
    } catch {
      // sessionStorage can be unavailable in restrictive browser modes.
    }
  };

  const rememberSidebarScroll = () => {
    if (typeof document === "undefined") return;
    const content = document.querySelector<HTMLElement>('[data-dashboard-sidebar-content="true"]');
    storeSidebarScroll(content?.scrollTop ?? 0);
  };

  const groupedMenuItems = visibleMenuItems.reduce<Record<string, DashboardMenuItem[]>>((groups, item) => {
    const group = item.group ?? "Navegação";
    groups[group] = [...(groups[group] ?? []), item];
    return groups;
  }, {});
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

  useEffect(() => {
    if (isCompact) {
      setIsResizing(false);
    }
  }, [isCompact]);

  useEffect(() => {
    if (!isMobile || !openMobile) return;

    let secondFrame = 0;
    const restore = () => {
      const content = document.querySelector<HTMLElement>('[data-dashboard-sidebar-content="true"]');
      if (!content) return;

      let storedValue: string | null = null;
      try {
        storedValue = sessionStorage.getItem(menuScrollStorageKey);
      } catch {
        storedValue = null;
      }

      const storedScrollTop = storedValue === null ? Number.NaN : Number(storedValue);
      if (Number.isFinite(storedScrollTop)) {
        content.scrollTop = storedScrollTop;
        return;
      }

      const activeItem = content.querySelector<HTMLElement>('[data-sidebar="menu-button"][data-active="true"]');
      activeItem?.scrollIntoView({ block: "center" });
    };

    const firstFrame = window.requestAnimationFrame(() => {
      restore();
      secondFrame = window.requestAnimationFrame(restore);
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [activePath, isMobile, menuScrollStorageKey, openMobile]);

  useEffect(() => {
    if (!notificationsOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (notificationsRef.current?.contains(target)) return;
      setNotificationsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [notificationsOpen]);

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
                    {subtitle ? <span className="dashboard-brand-subtitle">{subtitle}</span> : <span className="dashboard-brand-subtitle">{memberOfficeNavigation ? "Modo Membro" : "Modo Administrativo"}</span>}
                  </div>
                </div>
              ) : <span className="dashboard-brand-mark" aria-hidden="true"><Sparkles /></span>}
            </div>
          </SidebarHeader>

          <SidebarContent
            data-dashboard-sidebar-content="true"
            className="dashboard-sidebar-content gap-0 overflow-y-auto overscroll-contain pb-4"
            onScroll={event => {
              if (isMobile) storeSidebarScroll(event.currentTarget.scrollTop);
            }}
          >
            {Object.entries(groupedMenuItems).map(([group, items]) => (
              <SidebarGroup key={group} className="dashboard-menu-category px-4 py-2">
                <SidebarGroupLabel className="dashboard-category-label px-3 text-xs font-bold uppercase tracking-wider text-zinc-500 group-data-[collapsible=icon]:sr-only">
                  {group}
                </SidebarGroupLabel>
                <SidebarMenu>
                  {items.map(item => {
                    const isActive = isNavigationItemActive(item.path, activePath);
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => {
                            rememberSidebarScroll();
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
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="dashboard-sidebar-footer border-t border-border/60 bg-sidebar p-3">
            <div className="dashboard-mode-switch group-data-[collapsible=icon]:hidden">
              <button
                type="button"
                onClick={() => {
                  rememberSidebarScroll();
                  if (user?.role === "admin") setLocation("/admin");
                }}
                disabled={user?.role !== "admin"}
                className={`dashboard-mode-button${location.startsWith("/admin") ? " is-active" : ""}`}
              >
                <Shield className="size-4" />
                Modo Administrativo
              </button>
              <button
                type="button"
                onClick={() => {
                  rememberSidebarScroll();
                  setLocation("/membros");
                }}
                className={`dashboard-mode-button${!location.startsWith("/admin") ? " is-active" : ""}`}
              >
                <User className="size-4" />
                Modo Membro
              </button>
            </div>
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
            <span className="dashboard-mode-pill">{memberOfficeNavigation ? "Modo Membro" : "Modo Administrativo"}</span>
            <span className="dashboard-live-indicator"><i aria-hidden="true" /> Operação protegida</span>
            <span className="dashboard-shortcut">CTRL B</span>
          </div>
        </header>
        {memberOfficeNavigation && user?.role === "user" ? (
          <div className="dashboard-notifications" ref={notificationsRef}>
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
