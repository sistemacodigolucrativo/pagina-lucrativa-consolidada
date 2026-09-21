import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { memberOfficeNavigation } from "../shared/memberOfficeContent";

const root = process.env.PROJECT_ROOT || process.cwd();

describe("Primeiros passos no menu do membro", () => {
  it("mantém a rota na configuração oficial do escritório", () => {
    const paths = memberOfficeNavigation.flatMap(group => group.items.map(item => item.path));
    expect(paths).toContain("/membros/como-divulgar");
  });

  it("oculta o item no layout somente apos conclusao e finalizacao explicita", async () => {
    const layoutSource = await readFile(path.join(root, "client/src/components/DashboardLayout.tsx"), "utf8");
    const progressHookSource = await readFile(path.join(root, "client/src/hooks/useMemberGettingStartedProgress.ts"), "utf8");
    const gettingStartedSource = await readFile(path.join(root, "client/src/pages/MemberGettingStarted.tsx"), "utf8");

    expect(layoutSource).toContain('useMemberGettingStartedProgress({');
    expect(layoutSource).toContain("GETTING_STARTED_FINALIZED_STORAGE_BASE");
    expect(layoutSource).toContain('gettingStartedProgress.isComplete');
    expect(layoutSource).toContain("gettingStartedFinalized");
    expect(layoutSource).toContain('menuItems.filter(item => item.path !== "/membros/como-divulgar")');
    expect(progressHookSource).toContain('isComplete: percentage === 100');
    expect(gettingStartedSource).toContain("Finalizar Primeiros Passos");
    expect(gettingStartedSource).toContain('window.dispatchEvent(new Event("pagina-lucrativa:getting-started-finalized"))');
    expect(gettingStartedSource).toContain('setLocation("/membros")');
  });

  it("mantém a rota direta acessível no roteador", async () => {
    const appSource = await readFile(path.join(root, "client/src/App.tsx"), "utf8");
    expect(appSource).toContain('path="/membros/como-divulgar" component={MemberGettingStarted}');
  });
});

describe("Sino de notificações", () => {
  it("fecha o painel somente em clique externo", async () => {
    const layoutSource = await readFile(path.join(root, "client/src/components/DashboardLayout.tsx"), "utf8");

    expect(layoutSource).toContain("const notificationsRef = useRef<HTMLDivElement>(null);");
    expect(layoutSource).toContain('const isMemberArea = Boolean(user) && activePath.startsWith("/membros");');
    expect(layoutSource).toContain("enabled: isMemberArea");
    expect(layoutSource).toContain("{isMemberArea ? (");
    expect(layoutSource).toContain('className="dashboard-notifications" ref={notificationsRef}');
    expect(layoutSource).toContain('document.addEventListener("pointerdown", handlePointerDown)');
    expect(layoutSource).toContain('notificationsRef.current?.contains(target)');
    expect(layoutSource).toContain("setNotificationsOpen(false);");
    expect(layoutSource).toContain('document.removeEventListener("pointerdown", handlePointerDown)');
  });
});
