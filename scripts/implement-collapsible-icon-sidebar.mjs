import { readFileSync, writeFileSync } from "node:fs";

const path = "client/src/components/DashboardLayout.tsx";
let source = readFileSync(path, "utf8");

source = source.replace(
  '    <SidebarProvider\n      style={',
  '    <SidebarProvider\n      defaultOpen={false}\n      style={'
);

source = source.replace(
  '  const { state, toggleSidebar } = useSidebar();',
  '  const { state, toggleSidebar, setOpenMobile } = useSidebar();'
);

source = source.replace(
  '  const isMobile = useIsMobile();\n  const memberOfficeNavigation',
  `  const isMobile = useIsMobile();\n  const lastTouchRef = useRef(0);\n  const memberOfficeNavigation`
);

source = source.replace(
  '  const toggleGroup = (group: string, items: DashboardMenuItem[]) => {',
  `  const handleSidebarDoubleInteraction = () => {\n    if (isMobile) {\n      setOpenMobile(current => !current);\n      return;\n    }\n    toggleSidebar();\n  };\n\n  const handleSidebarTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {\n    const target = event.target as HTMLElement;\n    if (target.closest(\"button, a, [role='menuitem'], [data-sidebar='menu-button']\")) return;\n    const now = Date.now();\n    if (now - lastTouchRef.current <= 350) {\n      event.preventDefault();\n      handleSidebarDoubleInteraction();\n      lastTouchRef.current = 0;\n      return;\n    }\n    lastTouchRef.current = now;\n  };\n\n  const toggleGroup = (group: string, items: DashboardMenuItem[]) => {`
);

source = source.replace(
  '      <div className="relative" ref={sidebarRef}>',
  `      <div\n        className=\"relative\"\n        ref={sidebarRef}\n        onDoubleClick={event => {\n          const target = event.target as HTMLElement;\n          if (target.closest(\"button, a, [role='menuitem'], [data-sidebar='menu-button']\")) return;\n          handleSidebarDoubleInteraction();\n        }}\n        onTouchEnd={handleSidebarTouchEnd}\n        aria-label=\"Navegação lateral: toque duas vezes em uma área livre para expandir ou recolher\"\n      >`
);

source = source.replace(
  `              <button\n                onClick={toggleSidebar}\n                className=\"h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0\"\n                aria-label=\"Alternar navegação\"\n              >`,
  `              <button\n                onDoubleClick={event => {\n                  event.stopPropagation();\n                  handleSidebarDoubleInteraction();\n                }}\n                onClick={event => event.stopPropagation()}\n                className=\"h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0\"\n                aria-label=\"Expandir ou recolher navegação com duplo clique\"\n                title=\"Duplo clique para expandir ou recolher\"\n              >`
);

source = source.replace(
  '                          tooltip={item.label}\n                          className="h-10 transition-all font-normal"',
  '                          tooltip={item.label}\n                          aria-label={item.label}\n                          title={isCollapsed ? item.label : undefined}\n                          className="h-10 transition-all duration-200 font-normal"'
);

source = source.replace(
  'className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}',
  'className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-primary" : ""}`}'
);

source = source.replace(
  '          className="border-r-0"',
  '          className="border-r-0 transition-[width] duration-200 ease-out"'
);

writeFileSync(path, source);
console.log("Collapsible icon sidebar implementation applied.");
