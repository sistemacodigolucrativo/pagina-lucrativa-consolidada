import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), "utf8");

describe("navegação administrativa contextual", () => {
  it("mantém a navegação administrativa com módulos comerciais reais e sem módulos removidos", () => {
    const navigation = read("client/src/lib/adminNavigation.ts");
    expect(navigation).toContain('label: "Dashboard", path: "/admin"');
    expect(navigation).not.toContain('label: "Comunicações"');
    expect(navigation).not.toContain('path: "/admin/comunicacoes"');
    expect(navigation).not.toContain('label: "Divulgação"');
    expect(navigation).not.toContain('path: "/admin/divulgacao"');
    expect(navigation).not.toContain('label: "Publicações"');
    expect(navigation).not.toContain('path: "/admin/publicacoes"');
    expect(navigation).toContain('label: "Biblioteca de Recursos", path: "/admin/biblioteca-recursos", group: "Conteúdo"');
    expect(navigation).toContain('label: "Campanhas", path: "/admin/operacao", group: "Campanhas comerciais"');
    expect(navigation).toContain('label: "Pedidos", path: "/admin/pedidos", group: "Campanhas comerciais"');
    expect(navigation).toContain('label: "Financeiro", path: "/admin/financeiro", group: "Campanhas comerciais"');
    expect(navigation).toContain('label: "Pontos/Performance", path: "/admin/pontos", group: "Campanhas comerciais"');
    expect(navigation).toContain('label: "Suporte", path: "/admin/suporte"');
    expect(navigation).toContain('label: "Preview", path: "/preview", group: "Sistema"');
    expect(navigation).not.toContain('label: "Auditoria", path: "/admin/auditoria"');
    expect(navigation).not.toContain('label: "Configurações"');
    expect(navigation).not.toContain('label: "Central de manutenção"');
    expect(navigation).not.toContain('label: "Relatos"');
    expect(navigation).not.toContain('label: "Pontuação"');
    expect(navigation).not.toContain('path: "/admin/produtos"');
    expect(navigation).not.toContain('label: "Catálogo"');
  });

  it("usa a rota canônica da Academia no fluxo de PDFs da Capacitação", () => {
    const navigation = read("client/src/lib/adminNavigation.ts");
    expect(navigation).toContain('label: "Academia", path: "/admin/academia", group: "Capacitação"');
    expect(navigation).not.toContain('label: "Academia", path: "/admin/ebooks", group: "Capacitação"');
    expect(navigation).toContain('label: "Biblioteca de e-books", path: "/admin/ebooks", group: "Capacitação"');
    expect(navigation).not.toContain('label: "Academia", path: "/admin/academia", group: "Conteúdo"');
    expect(navigation).not.toContain('label: "Biblioteca de e-books", path: "/admin/ebooks", group: "Conteúdo"');
  });

  it("mantém Preview no contexto administrativo do sistema", () => {
    const navigation = read("client/src/lib/adminNavigation.ts");
    const preview = read("client/src/pages/Preview.tsx");
    expect(navigation).toContain('label: "Preview", path: "/preview", group: "Sistema"');
    expect(preview).toContain('import DashboardLayout from "@/components/DashboardLayout"');
    expect(preview).toContain('import { adminMenu } from "@/lib/adminNavigation"');
    expect(preview).toContain('<DashboardLayout menuItems={adminMenu} title="Administração" subtitle="Sistema">');
    expect(preview).toContain('href={withAppBase("/")}');
  });

  it("mantém Publicações como rota legada redirecionada e separa suporte, divulgação e módulos comerciais", () => {
    const app = read("client/src/App.tsx");
    const adminOffice = read("client/src/pages/AdminOffice.tsx");
    const adminCommercial = read("server/_core/adminCommercialOperations.ts");
    expect(app).toContain('path="/admin/publicacoes"');
    expect(app).toContain('<RedirectRoute to="/admin/biblioteca-recursos" />');
    expect(app).not.toContain('path="/admin/publicacoes" component={AdminPublications}');
    expect(app).toContain('path="/admin/biblioteca-recursos" component={AdminPublications}');
    expect(app).toContain('path="/admin/divulgacao" component={AdminOperation}');
    expect(app).toContain('path="/admin/operacao" component={AdminOperation}');
    expect(app).toContain('path="/admin/pedidos" component={AdminOrders}');
    expect(app).toContain('path="/admin/financeiro" component={AdminFinance}');
    expect(app).toContain('path="/admin/pontos" component={AdminPerformance}');
    expect(app).not.toContain('component={AdminOutreach}');
    expect(app).not.toContain('AdminCommunications');
    expect(app).not.toContain('/admin/comunicacoes');
    expect(app).toContain('path="/admin/suporte" component={AdminSupport}');
    expect(app).toContain('path="/admin/auditoria" component={AdminAudit}');
    expect(app).not.toContain("AdminSettings");
    expect(app).not.toContain('/admin/configuracoes');
    expect(app).not.toContain('component={AdminTransactions}');
    expect(app).not.toContain('component={AdminApplications}');
    expect(adminCommercial).toContain("registerAdminCommercialOperations");
    expect(adminCommercial).toContain('app.get(prefix + "/orders"');
    expect(adminCommercial).toContain('app.get(prefix + "/finance"');
    expect(adminCommercial).toContain('app.get(prefix + "/operation"');
    expect(adminCommercial).toContain('app.get(prefix + "/performance"');
    expect(adminOffice).not.toContain("trpc.admin.contacts");
    expect(adminOffice).not.toContain("capturedContacts");
    expect(adminOffice).not.toContain("/admin/divulgacao");
  });

  it("registra a anotação do menu de manutenção pós-instalação em Futuras Implementações", () => {
    const futureImplementations = read("client/src/pages/AdminFutureImplementations.tsx");
    expect(futureImplementations).toContain("Menu de manutenção pós-instalação via SSH");
    expect(futureImplementations).toContain("CÓDIGO LUCRATIVO — MENU MANUTENÇÃO");
    expect(futureImplementations).toContain("Gerenciar administrador");
    expect(futureImplementations).toContain("Segurança e credenciais");
    expect(futureImplementations).toContain("Verificação de produção");
    expect(futureImplementations).toContain("codigo-menu");
  });

  it("registra a especificação de produto digital personalizado em Futuras Implementações", () => {
    const futureImplementations = read("client/src/pages/AdminFutureImplementations.tsx");
    expect(futureImplementations).toContain("Produto digital personalizado a partir do conhecimento do membro");
    expect(futureImplementations).toContain("TRANSFORMAÇÃO DO CONHECIMENTO DO MEMBRO EM PRODUTO DIGITAL");
    expect(futureImplementations).toContain("CONHECIMENTO → PRODUTO DIGITAL");
    expect(futureImplementations).toContain("diagnóstico guiado");
    expect(futureImplementations).toContain("auditar a branch real do projeto");
    expect(futureImplementations).toContain("Não recriar autenticação");
  });
});
