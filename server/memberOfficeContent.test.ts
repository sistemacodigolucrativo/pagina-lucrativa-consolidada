import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { memberOfficeModuleCount, memberOfficeNavigation } from "../shared/memberOfficeContent";

describe("memberOfficeNavigation", () => {
  const labelsFromNavigation = () => memberOfficeNavigation.map(group => group.label);
  const itemsFor = (groupLabel: string) => memberOfficeNavigation.find(group => group.label === groupLabel)?.items.map(item => item.path) ?? [];

  it("organiza o Escritório pela jornada real do membro", () => {
    expect(labelsFromNavigation()).toEqual([
      "Início",
      "Minha página",
      "Vendas",
      "Rede",
      "Conteúdo",
      "Capacitação",
      "Desempenho",
      "Ajuda",
    ]);
    expect(memberOfficeModuleCount).toBe(16);
    const paths = memberOfficeNavigation.flatMap(group => group.items.map(item => item.path));
    expect(new Set(paths).size).toBe(paths.length);
    expect(itemsFor("Início")).toEqual(["/membros", "/membros/como-divulgar", "/membros/operacao"]);
    expect(itemsFor("Minha página")).toEqual(["/membros/configuracoes", "/membros/meus-dados", "/membros/recebimentos"]);
    expect(memberOfficeNavigation.flatMap(group => group.items)).toContainEqual({
      icon: "operation",
      label: "Central de Divulgação",
      path: "/membros/operacao",
    });
    expect(memberOfficeNavigation.flatMap(group => group.items)).toContainEqual({
      icon: "materials",
      label: "Biblioteca de Recursos",
      path: "/membros/materiais",
    });
    expect(itemsFor("Rede")).toEqual(["/membros/rede"]);
    expect(itemsFor("Desempenho")).toEqual(["/membros/pontos"]);
  });

  it("não expõe no menu atalhos redundantes mantidos apenas por compatibilidade", () => {
    const paths = memberOfficeNavigation.flatMap(group => group.items.map(item => item.path));
    expect(paths).not.toContain("/membros/convites");
    expect(paths).not.toContain("/membros/automacoes");
    expect(paths).not.toContain("/membros/patrocinador");
    expect(paths).not.toContain("/membros/ranking");
    expect(paths).not.toContain("/membros/blog");
    expect(paths).not.toContain("/membros/bonus");
    expect(paths).not.toContain("/membros/produtos");
    expect(paths).not.toContain("/membros/mensagem-especial");
  });

  it("não semeia dados privados ou depoimentos na navegação", () => {
    const serializedLabels = JSON.stringify(memberOfficeNavigation.flatMap(group => [group.label, ...group.items.map(item => item.label)])).toLowerCase();
    expect(serializedLabels).not.toContain("artigos");
    expect(serializedLabels).not.toContain("materiais e downloads");
    const serializedNavigation = JSON.stringify(memberOfficeNavigation).toLowerCase();
    expect(serializedNavigation).not.toContain("@live.com");
    expect(serializedNavigation).not.toContain("depoimento de cliente");
    expect(serializedNavigation).not.toContain("r$ 100,00");
  });

  it("não exibe placeholders crus de curso no painel de membros", () => {
    const source = readFileSync(path.join(process.cwd(), "client/src/pages/MemberOffice.tsx"), "utf8");
    expect(source).not.toMatch(/\{\{COURSE\./i);
    expect(source).not.toMatch(/\{\{course\./i);
    expect(source).toContain("Curso em preparação");
    expect(source).toContain("Módulos e progresso aparecerão quando houver conteúdo publicado.");
  });
});
