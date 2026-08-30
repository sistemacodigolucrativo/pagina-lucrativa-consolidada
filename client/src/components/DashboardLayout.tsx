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
import { useIsMobile } from "@/hooks/useMobile";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  PanelLeft,
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
  const { state, toggleSidebar, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const [groupOverrides, setGroupOverrides] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeGroupRef = useRef<string | null>(null);
  const activePath = location || "/";
  const activeMenuItem = menuItems.find(item => isNavigationItemActive(item.path, activePath));
  const groupedMenuItems = menuItems.reduce<Record<string, DashboardMenuItem[]>>((groups, item) => {
    const group = item.group ?? "Navegação";
    groups[group] = [...(groups[group] ?? []), item];
    return groups;
  }, {});
  const isMobile = useIsMobile();
  const lastTouchRef = useRef(0);
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
    if (!memberOfficeNavigation || isCollapsed) return true;
    return items.some(item => isNavigationItemActive(item.path, activePath));
  };

  const handleSidebarDoubleInteraction = () => {
    if (isMobile) {
      setOpenMobile(current => !current);
      return;
    }
    toggleSidebar();
  };

  const handleSidebarTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, a, [role='menuitem'], [data-sidebar='menu-button']")) return;
    const now = Date.now();
    if (now - lastTouchRef.current <= 350) {
      event.preventDefault();
      handleSidebarDoubleInteraction();
      lastTouchRef.current = 0;
      return;
    }
    lastTouchRef.current = now;
  };

  const toggleGroup = (group: string, items: DashboardMenuItem[]) => {
    setGroupOverrides(current => ({
      ...current,
      [group]: !(current[group] ?? isGroupOpen(group, items)),
    }));
  };

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

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
      <div
        className="relative"
        ref={sidebarRef}
        onDoubleClick={event => {
          const target = event.target as HTMLElement;
          if (target.closest("button, a, [role='menuitem'], [data-sidebar='menu-button']")) return;
          handleSidebarDoubleInteraction();
        }}
        onTouchEnd={handleSidebarTouchEnd}
        aria-label="Navegação lateral: toque duas vezes em uma área livre para expandir ou recolher"
      >
        <Sidebar
          collapsible="icon"
          className="border-r-0 transition-[width] duration-200 ease-out"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onDoubleClick={event => {
                  event.stopPropagation();
                  handleSidebarDoubleInteraction();
                }}
                onClick={event => event.stopPropagation()}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Expandir ou recolher navegação com duplo clique"
                title="Duplo clique para expandir ou recolher"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold tracking-tight truncate">
                    {title}
                  </span>{subtitle ? <span className="hidden text-xs text-muted-foreground lg:inline">{subtitle}</span> : null}
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 overflow-y-auto overscroll-contain pb-4">
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
                          }}
                          tooltip={item.label}
                          aria-label={item.label}
                          title={isCollapsed ? item.label : undefined}
                          className="h-10 transition-all duration-200 font-normal"
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

          <SidebarFooter className="border-t border-border/60 bg-sidebar p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
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
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {memberOfficeNavigation && user?.role === "user" ? (
          <div className="fixed right-4 top-4 z-50">
            <button type="button" aria-label={`Notificações${notifications.data?.unreadCount ? `: ${notifications.data.unreadCount} não lidas` : ""}`} onClick={() => setNotificationsOpen(current => !current)} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-950/95 text-zinc-100 shadow-xl backdrop-blur transition hover:border-emerald-300/40 hover:text-emerald-200">
              <Bell className="size-4" />
              {notifications.data?.unreadCount ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-emerald-300 px-1.5 py-0.5 text-center text-[10px] font-bold text-black">{notifications.data.unreadCount}</span> : null}
            </button>
            {notificationsOpen ? <section className="absolute right-0 mt-2 max-h-[70vh] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-3 shadow-2xl">
              <h2 className="px-2 pb-2 text-sm font-medium text-white">Notificações</h2>
              {notifications.isLoading ? <p className="px-2 py-3 text-sm text-zinc-400">Carregando...</p> : notifications.data?.items.length ? <div className="space-y-2">{notifications.data.items.map(item => <button key={item.id} type="button" onClick={() => markNotificationRead.mutate({ id: item.id })} className="block w-full rounded-xl border border-white/10 bg-black/25 p-3 text-left text-sm transition hover:bg-white/[0.04]"><div className="flex items-start justify-between gap-3"><strong className="text-white">{item.title}</strong>{!item.readAt ? <span className="mt-1 size-2 shrink-0 rounded-full bg-emerald-300" aria-label="Não lida" /> : null}</div><p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs leading-5 text-zinc-400">{item.message}</p><time className="mt-2 block text-[11px] text-zinc-500">{new Date(item.createdAt).toLocaleString("pt-BR")}</time></button>)}</div> : <p className="px-2 py-3 text-sm text-zinc-400">Nenhuma notificação.</p>}
            </section> : null}
          </div>
        ) : null}
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}
