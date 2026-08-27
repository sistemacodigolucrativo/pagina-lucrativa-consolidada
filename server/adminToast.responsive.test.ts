import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/AdminToast.tsx"), "utf8");

describe("admin Toast responsive UX", () => {
  it("edits and duplicates directly inside the selected Toast card", () => {
    expect(source).toContain('data-inline-toast-editor="true"');
    expect(source).toContain('editingId === item.id || duplicateSourceId === item.id');
    expect(source).toContain('Editando este modelo');
    expect(source).toContain('Duplicando este modelo');
    expect(source).not.toContain('editorRef');
    expect(source).not.toContain('editorOpen');
  });

  it("uses slim expandable cards with independent per-card state", () => {
    expect(source).toContain('aria-expanded={expanded}');
    expect(source).toContain('const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set())');
    expect(source).toContain('function toggleExpanded(id: number)');
    expect(source).toContain('const expanded = expandedIds.has(item.id)');
    expect(source).toContain('toggleExpanded(item.id)');
    expect(source).toContain('Visualizar');
    expect(source).toContain('Editar');
    expect(source).toContain('Duplicar');
    expect(source).toContain('Desativar');
    expect(source).toContain('Excluir');
  });

  it("keeps preview and save actions inside the inline editor", () => {
    expect(source).toContain('dispatchPreview(form.message, form.disclaimer)');
    expect(source).toContain('void saveInline()');
    expect(source).toContain('Salvar alterações');
    expect(source).toContain('Criar cópia');
  });

  it("duplicates from an existing model into an independent draft", () => {
    expect(source).toContain('function duplicate(item:');
    expect(source).toContain('title: `${item.title} — cópia`');
    expect(source).toContain('status: "draft"');
    expect(source).toContain('await create.mutateAsync(payload)');
  });
});
