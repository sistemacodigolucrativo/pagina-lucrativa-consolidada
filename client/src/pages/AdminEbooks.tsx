import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { BookOpenText, ExternalLink, FileText, PlusCircle, Save, UploadCloud, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type EbookStatus = "draft" | "published" | "archived";
type PdfUpload = { dataUrl: string; contentType: "application/pdf"; originalName: string; size: number };
type EbookForm = {
  sourceId: string;
  sourceFile: string;
  sourcePath: string;
  title: string;
  summary: string;
  htmlContent: string;
  status: EbookStatus;
  pdfUpload: PdfUpload | null;
};

const MAX_PDF_BYTES = 25 * 1024 * 1024;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

function titleFromPdfName(filename: string) {
  return filename.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function createPdfFallbackHtml(title: string, filename = "ebook.pdf") {
  const safeTitle = escapeHtml(title.trim() || "E-book em PDF");
  const safeFilename = escapeHtml(filename.trim() || "ebook.pdf");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${safeTitle}</title></head><body><main><h1>${safeTitle}</h1><p>Este material foi publicado em PDF: ${safeFilename}.</p></main></body></html>`;
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
    setForm({
      sourceId: detail.data.sourceId,
      sourceFile: detail.data.sourceFile,
      sourcePath: detail.data.sourcePath,
      title: detail.data.title,
      summary: detail.data.summary || "",
      htmlContent: detail.data.htmlContent || createPdfFallbackHtml(detail.data.title, detail.data.sourceFile),
      status: detail.data.status as EbookStatus,
      pdfUpload: null,
    });
  }, [detail.data]);

  const refresh = async () => {
    await utils.admin.ebooks.invalidate();
    if (selectedId) await utils.admin.ebook.invalidate({ id: selectedId });
  };
  const create = trpc.admin.createEbook.useMutation({
    onSuccess: async () => {
      await refresh();
      setForm(newForm());
      toast.success("E-book em PDF criado.");
    },
    onError: error => toast.error(error.message),
  });
  const update = trpc.admin.updateEbook.useMutation({
    onSuccess: async () => {
      await refresh();
      toast.success("E-book atualizado.");
    },
    onError: error => toast.error(error.message),
  });

  const currentPdfUrl = detail.data?.pdfUrl ?? null;
  const hasExistingPdf = Boolean(currentPdfUrl);
  const pending = create.isPending || update.isPending;

  function resetForm() {
    setSelectedId(null);
    setForm(newForm());
  }

  async function handlePdfChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("Selecione um arquivo .pdf.");
      input.value = "";
      return;
    }

    if (file.size > MAX_PDF_BYTES) {
      toast.error("O PDF deve ter no máximo 25 MB.");
      input.value = "";
      return;
    }

    try {
      const upload = await readPdfFile(file);
      setForm(current => {
        const title = current.title.trim() || titleFromPdfName(file.name) || "Novo e-book";
        return {
          ...current,
          sourceId: current.sourceId || `pdf-${Date.now()}`,
          sourceFile: file.name,
          sourcePath: current.sourcePath || "Upload PDF",
          title,
          htmlContent: createPdfFallbackHtml(title, file.name),
          pdfUpload: upload,
        };
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível ler o PDF selecionado.");
      input.value = "";
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();

    const title = form.title.trim();
    if (!title) {
      toast.error("Informe o título do e-book.");
      return;
    }

    if (!form.pdfUpload && !hasExistingPdf) {
      toast.error("Selecione um arquivo PDF antes de salvar.");
      return;
    }

    const sourceId = form.sourceId.trim() || `pdf-${Date.now()}`;
    const sourceFile = form.pdfUpload?.originalName || form.sourceFile.trim() || `${title}.pdf`;
    const payload = {
      sourceId,
      sourceFile,
      sourcePath: form.sourcePath.trim() || "Upload PDF",
      title,
      summary: form.summary.trim() || null,
      htmlContent: createPdfFallbackHtml(title, sourceFile),
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
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Gestão de conteúdo</span>
          <h1 className="text-3xl font-semibold text-white">E-books em PDF</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">
            Publique materiais em PDF, revise metadados e controle quais e-books aparecem na biblioteca do membro.
          </p>
        </header>

        <section className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-white/10 bg-zinc-950/60 p-3">
            <button type="button" onClick={resetForm} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-black">
              <PlusCircle className="size-4" />
              Novo e-book
            </button>
            <div className="max-h-[68vh] space-y-2 overflow-y-auto">
              {ebooks.isLoading ? (
                <p className="p-3 text-sm text-zinc-400">Carregando catálogo...</p>
              ) : ebooks.data?.length ? (
                ebooks.data.map(ebook => (
                  <button
                    type="button"
                    key={ebook.id}
                    onClick={() => setSelectedId(ebook.id)}
                    className={`w-full rounded-xl border p-3 text-left transition hover:border-emerald-300/50 ${selectedId === ebook.id ? "border-emerald-300/70 bg-emerald-300/10" : "border-white/10 bg-black/25"}`}
                  >
                    <div className="flex items-start gap-2">
                      <BookOpenText className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{ebook.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
                          {ebook.status === "published" ? "Publicado" : ebook.status === "draft" ? "Rascunho" : "Arquivado"} · {ebook.contentType === "application/pdf" ? "PDF" : "HTML"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="p-3 text-sm text-zinc-400">Nenhum e-book no catálogo.</p>
              )}
            </div>
          </aside>

          <div className="space-y-6">
            <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-medium text-white">{selectedId ? "Editar e-book" : "Novo e-book em PDF"}</h2>
                  <p className="mt-1 text-sm text-zinc-400">Envie um arquivo .pdf e mantenha o material pronto para o leitor integrado.</p>
                </div>
                {selectedId && (
                  <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
                    <X className="size-4" />
                    Fechar edição
                  </button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_160px]">
                <label className="text-sm text-zinc-200">
                  Título
                  <input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" />
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

              <label className="block text-sm text-zinc-200">
                Arquivo PDF
                <span className="mt-1 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-emerald-300/35 bg-emerald-300/5 px-4 py-5 text-center transition hover:border-emerald-300/70 hover:bg-emerald-300/10">
                  <UploadCloud className="mb-2 size-7 text-emerald-300" />
                  <span className="text-sm font-semibold text-white">{form.pdfUpload?.originalName || (hasExistingPdf ? "PDF atual mantido" : "Selecionar PDF")}</span>
                  <span className="mt-1 text-xs leading-5 text-zinc-400">Apenas .pdf, até 25 MB.</span>
                </span>
                <input type="file" accept=".pdf,application/pdf" onChange={handlePdfChange} className="sr-only" />
              </label>

              {hasExistingPdf ? (
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
                {pending ? "Salvando..." : selectedId ? "Salvar e-book" : "Criar e-book"}
              </button>
            </form>

            <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
              <div className="mb-3 flex items-center gap-2 text-white">
                <FileText className="size-5 text-emerald-300" />
                <h2 className="font-medium">Padrão de publicação</h2>
              </div>
              <p className="text-sm leading-6 text-zinc-300">
                O arquivo PDF é salvo no storage da aplicação, validado no servidor e aberto no leitor integrado da biblioteca.
              </p>
            </section>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
