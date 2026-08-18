import { describe, expect, it } from "vitest";
import { getMemberOperationContext } from "./memberOperationRoutes";

describe("getMemberOperationContext", () => {
  it("reconhece a rota interna do Escritório Virtual", () => {
    expect(getMemberOperationContext("/membros/campanhas").title).toBe("Encurtador de URL e campanhas");
  });

  it("reconhece a rota publicada com o prefixo /paginalucrativa", () => {
    expect(getMemberOperationContext("/paginalucrativa/membros/campanhas").title).toBe("Encurtador de URL e campanhas");
  });
});
