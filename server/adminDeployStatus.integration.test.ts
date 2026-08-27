import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("status visual do deploy no painel administrativo", () => {
  it("expõe um endpoint sem cache e o registra no servidor", () => {
    const endpoint = read("server/_core/deployStatus.ts");
    const server = read("server/_core/index.ts");
    expect(endpoint).toContain('/api/deploy-status');
    expect(endpoint).toContain('Cache-Control');
    expect(endpoint).toContain('deploy-status.json');
    expect(server).toContain('registerDeployStatus(app, appPrefix)');
  });

  it("mostra loading slim apenas no admin e permite recarregar após conclusão", () => {
    const component = read("client/src/components/AdminDeployStatus.tsx");
    const app = read("client/src/App.tsx");
    expect(component).toContain('location.startsWith("/admin/")');
    expect(component).toContain('Atualizando sistema');
    expect(component).toContain('Deploy concluído');
    expect(component).toContain('window.location.reload()');
    expect(component).toContain('fixed inset-x-0 top-0');
    expect(component).toContain('setInterval(load, 1500)');
    expect(app).toContain('<AdminDeployStatus />');
  });

  it("publica percentuais reais conforme as etapas do deploy na VPS", () => {
    const deploy = read("scripts/deploy-vps.sh");
    expect(deploy).toContain('write_deploy_status "deploying" 5');
    expect(deploy).toContain('write_deploy_status "deploying" 55');
    expect(deploy).toContain('write_deploy_status "deploying" 92');
    expect(deploy).toContain('write_deploy_status "completed" 100');
    expect(deploy).toContain('write_deploy_status "failed" 100');
  });
});
