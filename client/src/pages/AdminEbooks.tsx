import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { BookOpenText, ExternalLink, FileText, GraduationCap, PlusCircle, Save, UploadCloud, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type EbookStatus = "draft" | "published" | "archived";
type AcademyUsage = "library" | "course" | "both";
type AcademyLevel = "fundamentos" | "pratica" | "avancado";
type PdfUpload = { dataUrl: string; contentType: "application/pdf"; originalName: string; size: number };
type AcademyMetadata = {
  usage: AcademyUsage;
  courseTitle?: string;
  courseSlug?: string;
  courseCategory?: string;
  lessonOrder?: number;
  level?: AcademyLevel;
};
type EbookForm = {
  sourceId: string;
  sourceFile: string;
  sourcePath: string;
  title: string;
  summary: string;
  htmlContent: string;
  status: EbookStatus;
  pdfUpload: PdfUpload | null;
  usage: AcademyUsage;
  academyCourseTitle: string;
  academyCategory: string;
  academyOrder: string;
  academyLevel: AcademyLevel;
};

const MAX_PDF_BYTES = 25 * 1024 * 1024;
const ACADEMY_METADATA_NAME = "codigo-lucrativo-academy";
const usageLabels: Record<AcademyUsage, string> = {
  library: "E-book avulso",
  course: "E-book de curso",
  both: "Curso e biblioteca",
};
const levelLabels: Record<AcademyLevel, string> = {
  fundamentos: "Fundamentos",
  pratica: "Prática",
  avancado: "Avançado",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

function titleFromPdfName(filename: string) {
  return filename.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function slugifyCourseTitle(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "curso";
}

function normalizeAcademyMetadata(value: unknown): AcademyMetadata | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Partial<AcademyMetadata>;
  const usage: AcademyUsage = data.usage === "course" || data.usage === "both" ? data.usage : "library";
  const courseTitle = typeof data.courseTitle === "string" ? data.courseTitle.trim() : "";
  const courseCategory = typeof data.courseCategory === "string" ? data.courseCategory.trim() : "";
  const lessonOrder = Number.isFinite(Number(data.lessonOrder)) ? Math.max(0, Math.round(Number(data.lessonOrder))) : 0;
  const level: AcademyLevel = data.level === "pratica" || data.level === "avancado" ? data.level : "fundamentos";
  if (usage === "library") return { usage };
  return {
    usage,
    courseTitle,
    courseSlug: typeof data.courseSlug === "string" && data.courseSlug.trim() ? data.courseSlug.trim() : slugifyCourseTitle(courseTitle),
    courseCategory,
    lessonOrder,
    level,
  };
}

function extractAcademyMetadata(htmlContent: string | null | undefined): AcademyMetadata {
  const tag = htmlContent?.match(new RegExp(`<meta\\s+[^>]*name=["']${ACADEMY_METADATA_NAME}["'][^>]*>`, "i"))?.[0];
  const encoded = tag?.match(/\scontent=["']([^"']+)["']/i)?.[1];
  if (!encoded) return { usage: "library" };
  try {
    return normalizeAcademyMetadata(JSON.parse(decodeURIComponent(encoded))) ?? { usage: "library" };
  } catch {
    return { usage: "library" };
  }
}

function buildAcademyMetadata(form: EbookForm): AcademyMetadata {
  if (form.usage === "library") return { usage: "library" };
  const courseTitle = form.academyCourseTitle.trim();
  const lessonOrder = form.academyOrder ? Math.max(0, Math.round(Number(form.academyOrder))) : 0;
  return {
    usage: form.usage,
    courseTitle,
    courseSlug: slugifyCourseTitle(courseTitle),
    courseCategory: form.academyCategory.trim(),
    lessonOrder,
    level: form.academyLevel,
  };
}

function createPdfFallbackHtml(title: string, filename = "ebook.pdf", academy: AcademyMetadata = { usage: "library" }) {
  const safeTitle = escapeHtml(title.trim() || "E-book em PDF");
  const safeFilename = escapeHtml(filename.trim() || "ebook.pdf");
  const encodedAcademy = encodeURIComponent(JSON.stringify(academy));
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="${ACADEMY_METADATA_NAME}" content="${encodedAcademy}"><title>${safeTitle}</title></head><body><main><h1>${safeTitle}</h1><p>Este material foi publicado em PDF: ${safeFilename}.</p></main></body></html>`;
}

const newForm = (): EbookForm => ({
  sourceId: "",
  sourceFile: "",
  sourcePath: "",
  title: "",
  summary: "",
  htmlContent: createPdfFallbackHtml("Novo e-book"),
  status: "draft",
  pdfUpload: null,
  usage: "library",
  academyCourseTitle: "",
  academyCategory: "Fundamentos",
  academyOrder: "",
  academyLevel: "fundamentos",
});

function readPdfFile(file: File) {
  return new Promise<PdfUpload>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o PDF selecionado."));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Não foi possível ler o PDF selecionado."));
        return;
      }
      resolve({ dataUrl: reader.result, contentType: "application/pdf", originalName: file.name, size: file.size });
    };
    reader.readAsDataURL(file);
  });
}

export default function AdminEbooks() {
  const utils = trpc.useUtils();
  const ebooks = trpc.admin.ebooks.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const detail = trpc.admin.ebook.useQuery({ id: selectedId ?? 0 }, { enabled: selectedId !== null });
  const [form, setForm] = useState<EbookForm>(newForm);

  useEffect(() => {
    if (!detail.data) return;
    const academy = extractAcademyMetadata(detail.data.htmlContent);
    setForm({
      sourceId: detail.data.sourceId,
      sourceFile: detail.data.sourceFile,
      sourcePath: detail.data.sourcePath,
      title: detail.data.title,
      summary: detail.data.summary || "",
      htmlContent: detail.data.htmlContent || createPdfFallbackHtml(detail.data.title, detail.data.sourceFile, academy),
      status: detail.data.status as EbookStatus,
      pdfUpload: null,
      usage: academy.usage,
      academyCourseTitle: academy.courseTitle || "",
      academyCategory: academy.courseCategory || "Fundamentos",
      academyOrder: academy.lessonOrder ? String(academy.lessonOrder) : "",
      academyLevel: academy.level || "fundamentos",
    });
  }, [detail.data]);

  const courseOptions = useMemo(() => {
    const names = new Set<string>();
    ebooks.data?.forEach(ebook => {
      const academy = extractAcademyMetadata((ebook as { htmlContent?: string | null }).htmlContent);
      if (academy.courseTitle) names.add(academy.courseTitle);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [ebooks.data]);

  const refresh = async () => {
    await utils.admin.ebooks.invalidate();
    await utils.member.ebooks.invalidate();
    await utils.member.courses.invalidate();
    await utils.member.academy.invalidate();
    if (selectedId) await utils.admin.ebook.invalidate({ id: selectedId });
  };

  const create = trpc.admin.createEbook.useMutation({
    onSuccess: () => {
      void refresh();
      setForm(newForm());
      toast.success("Material da Academia criado.");
    },
    onError: error => toast.error(error.message),
  });
  const update = trpc.admin.updateEbook.useMutation({
    onSuccess: () => {
      void refresh();
      toast.success("Material atualizado.");
    },
    onError: error => toast.error(error.message),
  });

  const pending = create.isPending || update.isPending;
  const currentPdfUrl = detail.data?.pdfUrl ?? null;
  const hasExistingPdf = Boolean(currentPdfUrl);
  const isCourseMaterial = form.usage !== "library";

  const resetForm = () => {
    setSelectedId(null);
    setForm(newForm());
  };

  async function handlePdfChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Selecione um arquivo PDF.");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      toast.error("O PDF deve ter no máximo 25 MB.");
      return;
    }
    try {
      const pdfUpload = await readPdfFile(file);
      setForm(current => {
        const title = current.title.trim() || titleFromPdfName(file.name) || "Novo e-book";
        const sourceId = current.sourceId.trim() || `pdf-${Date.now()}`;
        const academy = buildAcademyMetadata({ ...current, title });
        return {
          ...current,
          sourceId,
          sourceFile: file.name,
          title,
          htmlContent: createPdfFallbackHtml(title, file.name, academy),
          pdfUpload,
        };
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível ler o PDF selecionado.");
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) {
      toast.error("Informe o título do material.");
      return;
    }
    if (!form.pdfUpload && !hasExistingPdf) {
      toast.error("Selecione um arquivo PDF antes de salvar.");
      return;
    }
    if (isCourseMaterial && !form.academyCourseTitle.trim()) {
      toast.error("Informe o curso da Academia.");
      return;
    }
    const orderNumber = form.academyOrder ? Number(form.academyOrder) : 0;
    if (Number.isNaN(orderNumber) || orderNumber < 0 || orderNumber > 999) {
      toast.error("Informe uma ordem válida para o material.");
      return;
    }

    const academy = buildAcademyMetadata(form);
    const sourceId = form.sourceId.trim() || `pdf-${Date.now()}`;
    const sourceFile = form.pdfUpload?.originalName || form.sourceFile.trim() || `${title}.pdf`;
    const payload = {
      sourceId,
      sourceFile,
      sourcePath: form.sourcePath.trim() || "Upload PDF",
      title,
      summary: form.summary.trim() || null,
      htmlContent: createPdfFallbackHtml(title, sourceFile, academy),
      status: form.status,
      pdfUpload: form.pdfUpload,
    };

    if (selectedId) update.mutate({ id: selectedId, ...payload });
    else create.mutate(payload);
  }

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Academia</span>
          <h1 className="text-3xl font-semibold text-white">Academia e e-books</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">
            Publique PDFs como aulas de curso, e-books avulsos ou materiais que aparecem nos dois lugares.
          </p>
        </header>

        <section className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-white/10 bg-zinc-950/60 p-3">
            <button type="button" onClick={resetForm} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-black">
              <PlusCircle className="size-4" />
              Novo material
            </button>
            <div className="max-h-[68vh] space-y-2 overflow-y-auto">
              {ebooks.isLoading ? (
                <p className="p-3 text-sm text-zinc-400">Carregando materiais...</p>
              ) : ebooks.data?.length ? (
                ebooks.data.map(ebook => {
                  const academy = extractAcademyMetadata((ebook as { htmlContent?: string | null }).htmlContent);
                  return (
                    <button
                      type="button"
                      key={ebook.id}
                      onClick={() => setSelectedId(ebook.id)}
                      className={`w-full rounded-xl border p-3 text-left transition hover:border-emerald-300/50 ${selectedId === ebook.id ? "border-emerald-300/70 bg-emerald-300/10" : "border-white/10 bg-black/25"}`}
                    >
                      <div className="flex items-start gap-2">
                        {academy.usage === "library" ? <BookOpenText className="mt-0.5 size-4 shrink-0 text-emerald-300" /> : <GraduationCap className="mt-0.5 size-4 shrink-0 text-emerald-300" />}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">{ebook.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
                            {ebook.status === "published" ? "Publicado" : ebook.status === "draft" ? "Rascunho" : "Arquivado"} · {usageLabels[academy.usage]}
                          </p>
                          {academy.courseTitle ? <p className="mt-1 truncate text-xs text-emerald-200">{academy.courseTitle}</p> : null}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="p-3 text-sm text-zinc-400">Nenhum material cadastrado.</p>
              )}
            </div>
          </aside>

          <div className="space-y-6">
            <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-medium text-white">{selectedId ? "Editar material" : "Novo material da Academia"}</h2>
                  <p className="mt-1 text-sm text-zinc-400">Envie um PDF e defina se ele será avulso, aula de curso ou os dois.</p>
                </div>
                {selectedId && (
                  <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
                    <X className="size-4" />
                    Fechar edição
                  </button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_180px_180px]">
                <label className="text-sm text-zinc-200">
                  Título do material
                  <input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" />
                </label>
                <label className="text-sm text-zinc-200">
                  Uso
                  <select value={form.usage} onChange={event => setForm({ ...form, usage: event.target.value as AcademyUsage })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white">
                    <option value="library">E-book avulso</option>
                    <option value="course">E-book de curso</option>
                    <option value="both">Curso e biblioteca</option>
                  </select>
                </label>
                <label className="text-sm text-zinc-200">
                  Status
                  <select value={form.status} onChange={event => setForm({ ...form, status: event.target.value as EbookStatus })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white">
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Arquivado</option>
                  </select>
                </label>
              </div>

              {isCourseMaterial ? (
                <section className="rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4">
                  <div className="mb-3 flex items-center gap-2 text-white">
                    <GraduationCap className="size-5 text-emerald-300" />
                    <h3 className="font-medium">Dados do curso</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-[1fr_160px]">
                    <label className="text-sm text-zinc-200">
                      Curso
                      <input required list="academy-course-options" value={form.academyCourseTitle} onChange={event => setForm({ ...form, academyCourseTitle: event.target.value })} placeholder="Ex.: Engatinhando no MKT" className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" />
                      <datalist id="academy-course-options">
                        {courseOptions.map(course => <option key={course} value={course} />)}
                      </datalist>
                    </label>
                    <label className="text-sm text-zinc-200">
                      Ordem
                      <input type="number" min={0} max={999} value={form.academyOrder} onChange={event => setForm({ ...form, academyOrder: event.target.value })} placeholder="1" className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" />
                    </label>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="text-sm text-zinc-200">
                      Categoria
                      <input value={form.academyCategory} onChange={event => setForm({ ...form, academyCategory: event.target.value })} placeholder="Ex.: Iniciantes" className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" />
                    </label>
                    <label className="text-sm text-zinc-200">
                      Nível
                      <select value={form.academyLevel} onChange={event => setForm({ ...form, academyLevel: event.target.value as AcademyLevel })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white">
                        <option value="fundamentos">Fundamentos</option>
                        <option value="pratica">Prática</option>
                        <option value="avancado">Avançado</option>
                      </select>
                    </label>
                  </div>
                </section>
              ) : null}

              <label className="block text-sm text-zinc-200">
                Arquivo PDF
                <span className="mt-1 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-emerald-300/35 bg-emerald-300/5 px-4 py-5 text-center transition hover:border-emerald-300/70 hover:bg-emerald-300/10">
                  <UploadCloud className="mb-2 size-7 text-emerald-300" />
                  <span className="text-sm font-semibold text-white">{form.pdfUpload?.originalName || (hasExistingPdf ? "PDF atual mantido" : "Selecionar PDF")}</span>
                  <span className="mt-1 text-xs leading-5 text-zinc-400">Apenas .pdf, até 25 MB.</span>
                </span>
                <input type="file" accept=".pdf,application/pdf" onChange={handlePdfChange} className="sr-only" />
              </label>

              {currentPdfUrl ? (
                <a href={currentPdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/50 hover:text-emerald-100">
                  <ExternalLink className="size-4" />
                  Ver PDF atual
                </a>
              ) : null}

              <label className="block text-sm text-zinc-200">
                Resumo
                <textarea value={form.summary} onChange={event => setForm({ ...form, summary: event.target.value })} className="mt-1 min-h-24 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" />
              </label>

              <button disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
                <Save className="size-4" />
                {pending ? "Salvando..." : selectedId ? "Salvar material" : "Criar material"}
              </button>
            </form>

            <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
              <div className="mb-3 flex items-center gap-2 text-white">
                <FileText className="size-5 text-emerald-300" />
                <h2 className="font-medium">Padrão da Academia</h2>
              </div>
              <p className="text-sm leading-6 text-zinc-300">
                Materiais marcados como curso aparecem agrupados na Academia. Materiais avulsos continuam na Biblioteca de e-books.
              </p>
            </section>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
