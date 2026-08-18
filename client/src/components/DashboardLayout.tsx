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
  ChevronDown,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  type LucideIcon,
  Users,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
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

export default function DashboardLayout({
  children,
  menuItems = defaultMenuItems,
  title = "Escritório",
}: {
  children: React.ReactNode;
  menuItems?: DashboardMenuItem[];
  title?: string;
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
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth} menuItems={navigationMenuItems} title={title}>
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
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
  menuItems,
  title,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const [groupOverrides, setGroupOverrides] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activePath = location || "/";
  const activeMenuItem = menuItems.find(item => item.path === activePath);
  const groupedMenuItems = menuItems.reduce<Record<string, DashboardMenuItem[]>>((groups, item) => {
    const group = item.group ?? "Navegação";
    groups[group] = [...(groups[group] ?? []), item];
    return groups;
  }, {});
  const isMobile = useIsMobile();
  const memberOfficeNavigation = isMemberOfficeNavigation(menuItems);

  const isGroupOpen = (group: string, items: DashboardMenuItem[]) => {
    if (groupOverrides[group] !== undefined) return groupOverrides[group];
    return !isMobile || !memberOfficeNavigation || items.length === 1 || items.some(item => item.path === activePath);
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
    if (!isMobile || !memberOfficeNavigation) return;
    const activeGroup = Object.entries(groupedMenuItems).find(([, items]) =>
      items.some(item => item.path === activePath),
    )?.[0];
    if (!activeGroup) return;
    setGroupOverrides(current => (
      current[activeGroup] === true ? current : { ...current, [activeGroup]: true }
    ));
  }, [activePath, groupedMenuItems, isMobile, memberOfficeNavigation]);

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
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Alternar navegação"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold tracking-tight truncate">
                    {title}
                  </span>
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
                    const isActive = activePath === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => {
                            setGroupOverrides(current => ({ ...current, [group]: true }));
                            setLocation(item.path);
                          }}
                          tooltip={item.label}
                          className="h-10 transition-all font-normal"
                        >
                          <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
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
