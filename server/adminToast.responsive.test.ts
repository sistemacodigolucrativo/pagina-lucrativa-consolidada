import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/AdminToast.tsx"), "utf8");
const sonnerSource = readFileSync(resolve(process.cwd(), "client/src/components/ui/sonner.tsx"), "utf8");
const cssSource = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
const publicToastSystemSource = readFileSync(resolve(process.cwd(), "shared/publicToastSystem.ts"), "utf8");

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

  it("mounts the public toast listener so Visualizar shows an in-page preview", () => {
    expect(source).toContain('PublicSocialProofToast');
    expect(source).toContain('PUBLIC_TOAST_PREVIEW_EVENT');
    expect(source).toContain('id="admin-public-toast-preview-slot"');
    expect(source).toContain('new CustomEvent(PUBLIC_TOAST_PREVIEW_EVENT');
    expect(source).not.toContain('dispatchPreview(item.summary ?? "", parseDisclaimer(item.body)); await');
  });

  it("duplicates from an existing model into an independent draft", () => {
    expect(source).toContain('function duplicate(item:');
    expect(source).toContain('title: `${item.title} — cópia`');
    expect(source).toContain('status: "draft"');
    expect(source).toContain('await create.mutateAsync(payload)');
  });

  it("positions operational Sonner toasts below the navigation and allows click dismissal", () => {
    expect(sonnerSource).toContain('position="top-right"');
    expect(sonnerSource).toContain('offset={offset ?? { top: 88, right: 24 }}');
    expect(sonnerSource).toContain('mobileOffset={mobileOffset ?? { top: 76, right: 12, left: 12 }}');
    expect(sonnerSource).toContain('target.closest("[data-sonner-toast]")');
    expect(sonnerSource).toContain("toast.dismiss();");
    expect(cssSource).toContain(".codigo-operational-toast");
    expect(cssSource).toContain("cursor: pointer;");
  });


  it("não recria os seeds antigos removidos da Central de Toasts", () => {
    expect(publicToastSystemSource).not.toContain("Orientação");
    expect(publicToastSystemSource).not.toContain("Fluxo oficial");
    expect(publicToastSystemSource).not.toContain("Sem mensalidade");
    expect(publicToastSystemSource).not.toContain("Decisão consciente");
  });

  it("usa os textos comerciais atuais como padrão do Toast público", () => {
    expect(publicToastSystemSource).toContain("Acontecendo agora 🕒");
    expect(publicToastSystemSource).toContain("Esta atividade representa um evento registrado nos últimos minutos.");
    expect(publicToastSystemSource).not.toContain("Atividade ilustrativa");
    expect(publicToastSystemSource).not.toContain("Demonstração ilustrativa — não representa uma atividade real.");
  });

});
