import DashboardLayout from "@/components/DashboardLayout";
import { IntegerInput } from "@/components/NumericInput";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { getAcademyLevelLabel, getAcademyStatusLabel, slugifyAcademyCourseTitle, type AcademyLevel, type AcademyStatus } from "@shared/academy";
import { parseIntegerInput } from "@shared/structuredValidation";
import { AlertTriangle, Archive, BookOpenText, FileText, PlusCircle, Save, X } from "lucide-react";
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type AcademyForm = {
  title: string;
  summary: string;
  status: AcademyStatus;
  courseTitle: string;
  courseSlug: string;
  category: string;
  level: AcademyLevel;
  lessonOrder: string;
  pdfDataUrl: string;
  originalName: string;
};

const blank = (): AcademyForm => ({
  title: "",
  summary: "",
  status: "draft",
  courseTitle: "",
  courseSlug: "",
  category: "Academia",
  level: "fundamentos",
  lessonOrder: "0",
  pdfDataUrl: "",
  originalName: "",
});

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Não foi possível ler o PDF."));
    reader.readAsDataURL(file);
  });
}

export default function AdminAcademy() {
  const utils = trpc.useUtils();
  const materials = trpc.admin.academy.list.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const detail = trpc.admin.academy.detail.useQuery({ id: selectedId ?? 0 }, { enabled: selectedId !== null });
  const [form, setForm] = useState<AcademyForm>(blank);

  const refresh = async () => {
    await utils.admin.academy.list.invalidate();
    await utils.admin.ebooks.invalidate();
    await utils.member.academy.listCourses.invalidate();
    await utils.member.courses.invalidate();
    if (selectedId) await utils.admin.academy.detail.invalidate({ id: selectedId });
  };

  const create = trpc.admin.academy.createMaterial.useMutation({ onSuccess: async () => { await refresh(); setEditorOpen(false); setForm(blank()); toast.success("Material salvo."); }, onError: error => toast.error(error.message) });
  const update = trpc.admin.academy.updateMaterial.useMutation({ onSuccess: async () => { await refresh(); toast.success("Material atualizado."); }, onError: error => toast.error(error.message) });
  const setStatus = trpc.admin.academy.setMaterialStatus.useMutation({ onSuccess: refresh, onError: error => toast.error(error.message) });

  useEffect(() => {
    const material = detail.data;
    if (!material) return;
    setForm({
      title: material.title,
      summary: material.summary || "",
      status: material.status,
      courseTitle: material.metadata.courseTitle,
      courseSlug: material.metadata.courseSlug,
      category: material.metadata.category,
      level: material.metadata.level,
      lessonOrder: String(material.metadata.lessonOrder || 0),
      pdfDataUrl: "",
      originalName: material.sourceFile,
    });
  }, [detail.data]);

  const grouped = useMemo(() => {
    const groups = new Map<string, NonNullable<typeof materials.data>>();
    for (const material of materials.data ?? []) {
      const key = material.metadata.courseSlug || "pendentes";
      groups.set(key, [...(groups.get(key) ?? []), material]);
    }
    return Array.from(groups.entries());
  }, [materials.data]);
  const pendingPublished = (materials.data ?? []).filter(material => material.needsCourse);

  async function handlePdf(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") return toast.error("Envie somente PDF.");
    if (file.size > 25 * 1024 * 1024) return toast.error("O PDF deve ter no máximo 25 MB.");
    setForm(current => ({ ...current, pdfDataUrl: "", originalName: file.name }));
    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (!dataUrl.startsWith("data:application/pdf;base64,JVBER")) return toast.error("O arquivo enviado não possui assinatura PDF válida.");
      setForm(current => ({ ...current, pdfDataUrl: dataUrl, originalName: file.name, title: current.title || file.name.replace(/\.pdf$/i, "") }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível ler o PDF.");
    }
  }

  function reset() {
    setSelectedId(null);
    setEditorOpen(false);
    setForm(blank());
  }

  function openNewMaterial() {
    setSelectedId(null);
    setForm(blank());
    setEditorOpen(true);
  }

  function openMaterial(id: number) {
    setSelectedId(id);
    setEditorOpen(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const lessonOrder = form.lessonOrder ? parseIntegerInput(form.lessonOrder) : 0;
    if (lessonOrder === null) return toast.error("Informe uma ordem válida.");
    if (form.status === "published" && !form.courseTitle.trim()) return toast.error("Informe o curso antes de publicar.");
    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim() || null,
      status: form.status,
      courseTitle: form.courseTitle.trim() || null,
      courseSlug: form.courseSlug.trim() || slugifyAcademyCourseTitle(form.courseTitle),
      category: form.category.trim() || null,
      level: form.level,
      lessonOrder,
      pdfDataUrl: form.pdfDataUrl || null,
      originalName: form.originalName || null,
    };
    if (!payload.title) return toast.error("Informe o título do material.");
    if (!selectedId && !payload.pdfDataUrl) return toast.error("Envie um PDF para criar o material.");
    if (selectedId) update.mutate({ id: selectedId, ...payload });
    else create.mutate(payload);
  }

  const pending = create.isPending || update.isPending;

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Academia</span>
          <h1 className="text-3xl font-semibold text-white">Cursos e materiais</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">Curso é o agrupador. Material/PDF é o item editável. Publicado aparece para membros; rascunho e arquivado não aparecem.</p>
        </header>

        {pendingPublished.length ? (
          <section className="rounded-2xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-50">
            <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="size-4" />Publicados sem curso</div>
            <p className="mt-1 text-amber-100/80">{pendingPublished.length} material(is) publicado(s) precisam de curso para aparecer na Academia do membro.</p>
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-white/10 bg-zinc-950/60 p-3">
            <section className="mb-3 rounded-xl border border-white/10 bg-black/25 p-4">
              <div className="mb-3 flex items-center gap-2 text-white"><FileText className="size-5 text-emerald-300" /><h2 className="font-medium">Aviso de visibilidade</h2></div>
              <p className="text-sm leading-6 text-zinc-400">Curso aparece para membro somente quando possui pelo menos um material publicado com curso definido. Materiais sem curso ficam como pendência administrativa.</p>
              <p className="mt-2 text-xs text-zinc-500">Status disponíveis: {getAcademyStatusLabel("draft")}, {getAcademyStatusLabel("published")}, {getAcademyStatusLabel("archived")}. Níveis: {getAcademyLevelLabel("fundamentos")}, {getAcademyLevelLabel("pratica")}, {getAcademyLevelLabel("avancado")}.</p>
            </section>
            <button type="button" onClick={openNewMaterial} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-black"><PlusCircle className="size-4" />Novo material</button>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto">
              {materials.isLoading ? <p className="p-3 text-sm text-zinc-400">Carregando Academia...</p> : grouped.length ? grouped.map(([slug, items]) => (
                <section key={slug} className="space-y-2">
                  <h2 className="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">{slug === "pendentes" ? "Sem curso" : items[0]?.metadata.courseTitle}</h2>
                  {items.map(material => (
                    <button type="button" key={material.id} onClick={() => openMaterial(material.id)} className={`w-full rounded-xl border p-3 text-left transition hover:border-emerald-300/50 ${selectedId === material.id ? "border-emerald-300/70 bg-emerald-300/10" : "border-white/10 bg-black/25"}`}>
                      <div className="flex items-start gap-2">
                        <BookOpenText className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">{material.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">{getAcademyStatusLabel(material.status)} · Aula {material.metadata.lessonOrder || 0}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </section>
              )) : <p className="p-3 text-sm text-zinc-400">Nenhum material cadastrado.</p>}
            </div>
          </aside>

          {editorOpen ? (
            <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="font-medium text-white">{selectedId ? "Editar material" : "Novo material PDF"}</h2><p className="mt-1 text-sm text-zinc-400">Defina o curso, metadados e status do PDF.</p></div>
                {selectedId ? <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"><X className="size-4" />Fechar edição</button> : null}
              </div>

              <label className="block text-sm text-zinc-200">PDF<input type="file" accept="application/pdf" onChange={handlePdf} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" />{form.originalName ? <span className="mt-1 block text-xs text-zinc-500">{form.originalName}</span> : null}</label>
              <div className="grid gap-4 md:grid-cols-[1fr_160px]">
                <label className="text-sm text-zinc-200">Material<input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" /></label>
                <label className="text-sm text-zinc-200">Status<select value={form.status} onChange={event => setForm({ ...form, status: event.target.value as AcademyStatus })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></select></label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-zinc-200">Curso<input value={form.courseTitle} onChange={event => setForm({ ...form, courseTitle: event.target.value, courseSlug: slugifyAcademyCourseTitle(event.target.value) })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" /></label>
                <label className="text-sm text-zinc-200">Slug do curso<input value={form.courseSlug} onChange={event => setForm({ ...form, courseSlug: slugifyAcademyCourseTitle(event.target.value) })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" /></label>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="text-sm text-zinc-200">Categoria<input value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" /></label>
                <label className="text-sm text-zinc-200">Nível<select value={form.level} onChange={event => setForm({ ...form, level: event.target.value as AcademyLevel })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"><option value="fundamentos">Fundamentos</option><option value="pratica">Prática</option><option value="avancado">Avançado</option></select></label>
                <label className="text-sm text-zinc-200">Ordem<IntegerInput value={form.lessonOrder} onValueChange={lessonOrder => setForm({ ...form, lessonOrder })} min={0} max={100000} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" /></label>
              </div>
              <label className="block text-sm text-zinc-200">Resumo<textarea value={form.summary} onChange={event => setForm({ ...form, summary: event.target.value })} className="mt-1 min-h-24 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" /></label>
              <div className="flex flex-wrap gap-3">
                <button disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"><Save className="size-4" />{pending ? "Salvando..." : form.status === "published" ? "Publicar material" : "Salvar material"}</button>
                {selectedId ? <button type="button" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: selectedId, status: "archived" })} className="inline-flex items-center gap-2 rounded-lg border border-amber-300/30 px-4 py-2 text-sm text-amber-100 disabled:opacity-50"><Archive className="size-4" />Arquivar</button> : null}
              </div>
            </form>
          ) : null}
        </section>
      </main>
    </DashboardLayout>
  );
}
