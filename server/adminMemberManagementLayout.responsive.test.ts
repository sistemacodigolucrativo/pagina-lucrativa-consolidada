import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("Membros e Rede — organização e exclusão temporária", () => {
  it("posiciona Rede de indicações antes de Contas de membros sem duplicar a consulta", () => {
    const source = read("client/src/pages/AdminReferrals.tsx");
    const networkTitle = source.indexOf(">Rede de indicações<");
    const membersTitle = source.indexOf(">Contas de membros<");
    expect(networkTitle).toBeGreaterThan(-1);
    expect(membersTitle).toBeGreaterThan(-1);
    expect(networkTitle).toBeLessThan(membersTitle);
    expect(source.match(/trpc\.admin\.referralLinks\.useQuery\(\)/g)?.length).toBe(1);
  });

  it("remove o card redundante e usa a mesma deletionQueue na área temporária", () => {
    const source = read("client/src/pages/AdminReferrals.tsx");
    expect(source).not.toContain(">Exclusão em 7 dias<");
    expect(source).toContain(">Área temporária de exclusão<");
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
    expect(source).toContain("flex flex-col gap-4 sm:flex-row");
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
