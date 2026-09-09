import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("Membros e Rede — organização e exclusão temporária", () => {
  it("posiciona Rede de indicações logo após a introdução e antes dos cards de membros sem duplicar consulta", () => {
    const source = read("client/src/pages/AdminReferrals.tsx");
    const intro = source.indexOf("Gerencie contas, bloqueios e exclusões com retenção de 7 dias sem apagar a rede de indicados.");
    const networkTitle = source.indexOf(">Rede de indicações<");
    const membersMetric = source.indexOf(">Membros<");
    const membersTitle = source.indexOf(">Contas de membros<");
    expect(intro).toBeGreaterThan(-1);
    expect(networkTitle).toBeGreaterThan(intro);
    expect(membersMetric).toBeGreaterThan(networkTitle);
    expect(membersTitle).toBeGreaterThan(membersMetric);
    expect(source.match(/trpc\.admin\.referralLinks\.useQuery\(\)/g)?.length).toBe(1);
  });

  it("mantém uma única contagem dinâmica, abaixo do título, com o rótulo Exclusões aguardando", () => {
    const source = read("client/src/pages/AdminReferrals.tsx");
    const queueTitle = source.indexOf(">Área temporária de exclusão<");
    const queueLabel = source.indexOf(">Exclusões aguardando<");
    const retentionCopy = source.indexOf("Contas permanecem aqui por 7 dias antes da remoção definitiva.");
    expect(source).not.toContain(">Exclusão em 7 dias<");
    expect(queueTitle).toBeGreaterThan(-1);
    expect(queueLabel).toBeGreaterThan(queueTitle);
    expect(retentionCopy).toBeGreaterThan(queueLabel);
    expect(source).toContain("management.deletionQueue.length");
    expect(source.match(/management\.deletionQueue\.length/g)?.length).toBe(1);
    expect(source).toContain('href={withAppBase("/admin/membros/exclusoes")}');
    expect(source).not.toContain("management.deletionQueue.map");
  });

  it("mantém card e tela de exclusão responsivos em mobile, tablet e desktop", () => {
    const source = read("client/src/pages/AdminReferrals.tsx");
    const queue = read("client/src/pages/AdminMemberDeletionQueue.tsx");
    expect(source).toContain("p-4 transition");
    expect(source).toContain("sm:p-5");
    expect(source).toContain("grid gap-4 sm:grid-cols-2 lg:grid-cols-3");
    expect(source).toContain("flex w-full items-center justify-between gap-4");
    expect(source).toContain("text-2xl text-white sm:text-3xl");
    expect(source).toContain("w-full");
    expect(source).toContain("sm:w-auto");
    expect(queue).toContain("p-5 sm:p-8");
    expect(queue).toContain("sm:grid-cols-2");
    expect(queue).toContain("lg:flex-row");
    expect(queue).toContain("xl:flex-row");
    expect(queue).toContain("Restaurar");
    expect(queue).toContain("Excluir definitivamente");
  });
});
