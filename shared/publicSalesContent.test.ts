import { describe, expect, it } from "vitest";
import { PUBLIC_SALES_DECISION_OBJECTIONS } from "./publicSalesObjections";
import { resolvePublicSalesContent } from "./publicSalesContent";

describe("resolvePublicSalesContent", () => {
  it("builds ordered page data from the shared copy definitions", () => {
    const content = resolvePublicSalesContent();

    expect(content.packageItems).toHaveLength(8);
    expect(content.packageItems[0]).toEqual({
      id: "item1",
      title: "Método Código Lucrativo",
      description:
        "Base pronta e consolidada para receber, conhecer, personalizar, operar e evoluir sua execução.",
    });
    expect(content.fitItems).toHaveLength(4);
    expect(content.notFitItems).toHaveLength(4);
    expect(content.objectionItems).toEqual(
      PUBLIC_SALES_DECISION_OBJECTIONS.map((item, index) => ({
        id: `objection${index + 1}`,
        question: item.question,
        answer: item.answer,
      }))
    );
  });

  it("applies only known string overrides and records which fields were edited", () => {
    const content = resolvePublicSalesContent({
      hero: {
        title: "Copy atualizada",
        unknownField: "Não deve entrar no snapshot",
      },
      package: {
        item1Title: "Pacote atualizado",
      },
    });

    expect(content.sections.hero?.title).toBe("Copy atualizada");
    expect(content.sections.hero?.unknownField).toBeUndefined();
    expect(content.overriddenFields.hero).toEqual(["title"]);
    expect(content.packageItems[0]?.title).toBe("Pacote atualizado");
    expect(content.packageItems[0]?.description).toContain("Base pronta");
  });
});