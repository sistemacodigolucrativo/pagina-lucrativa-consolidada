import { describe, expect, it } from "vitest";
import { calculateResponsiveEbookScale } from "./ebookReader";

describe("calculateResponsiveEbookScale", () => {
  it("reduz uma página larga para caber em uma área compacta", () => {
    expect(calculateResponsiveEbookScale(360, 892)).toBeCloseTo(0.4035, 3);
  });

  it("preserva a escala natural quando há largura suficiente", () => {
    expect(calculateResponsiveEbookScale(1200, 892)).toBe(1);
  });

  it("limita documentos extraordinariamente largos a uma escala utilizável", () => {
    expect(calculateResponsiveEbookScale(320, 4000)).toBe(0.15);
  });

  it("não altera a escala diante de medidas inválidas", () => {
    expect(calculateResponsiveEbookScale(0, 892)).toBe(1);
  });
});
