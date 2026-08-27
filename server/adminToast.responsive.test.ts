import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/AdminToast.tsx"), "utf8");

describe("admin Toast responsive UX", () => {
  it("keeps the editor hidden until edit or duplicate is selected", () => {
    expect(source).toContain('const editorOpen = editingId !== null || duplicateSourceId !== null;');
    expect(source).toContain('{editorOpen ? <form');
    expect(source).not.toContain('onClick={startNewModel}');
    expect(source).not.toContain('Novo modelo');
  });

  it("uses slim expandable cards with contextual actions", () => {
    expect(source).toContain('aria-expanded={expanded}');
    expect(source).toContain('setExpandedId(current => current === item.id ? null : item.id)');
    expect(source).toContain('Visualizar');
    expect(source).toContain('Editar');
    expect(source).toContain('Duplicar');
    expect(source).toContain('Desativar');
    expect(source).toContain('Excluir');
  });

  it("previews the selected model in the real Toast and keeps editing contextual", () => {
    expect(source).toContain('onClick={() => previewItem(item)}');
    expect(source).toContain('window.dispatchEvent(new CustomEvent(PUBLIC_TOAST_PREVIEW_EVENT');
    expect(source).toContain('editorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })');
    expect(source).not.toContain('window.scrollTo({ top: 0');
  });

  it("duplicates from an existing model into an independent draft", () => {
    expect(source).toContain('function duplicate(item:');
    expect(source).toContain('title: `${item.title} — cópia`');
    expect(source).toContain('status: "draft"');
    expect(source).toContain('Criar cópia');
  });
});
