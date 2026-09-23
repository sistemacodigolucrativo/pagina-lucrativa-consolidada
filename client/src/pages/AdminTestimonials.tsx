import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { withAppBase } from "@/lib/devPath";
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, ClipboardCheck, Download, FileText, LayoutDashboard, Save, Search, Star, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const menu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin", group: "Visão geral" },
  { icon: FileText, label: "Agradecimentos", path: "/admin/relatos", group: "Relacionamento" },
];
const statusLabels = { pending: "Em análise", approved: "Aprovado", rejected: "Necessita ajuste", archived: "Arquivado" } as const;
type TestimonialStatus = keyof typeof statusLabels;
const statusPaths: Record<TestimonialStatus, string> = {
  pending: "/admin/relatos/em-analise",
  approved: "/admin/relatos/aprovados",
  rejected: "/admin/relatos/necessita-ajuste",
  archived: "/admin/relatos/arquivados",
};
const statusOrder = ["pending", "approved", "rejected", "archived"] as const;

const testimonialJsonTemplate = JSON.stringify({
  depoimentos: [
    {
      nome: "Nome da pessoa",
      texto: "Texto do depoimento",
      avaliacao: 5,
      cargo_ou_contexto: "Aluno / Cliente / Membro",
      imagem: "",
      status: "ativo",
      ordem: 1,
    },
  ],
}, null, 2);

type TestimonialJsonItem = {
  nome: string;
  texto: string;
  avaliacao?: number | null;
  cargo_ou_contexto?: string | null;
  imagem?: string | null;
  status?: "ativo" | "rascunho" | "arquivado" | "approved" | "pending" | "archived" | null;
  ordem?: number | null;
};

function parseTestimonialsJsonInput(value: string): { depoimentos: TestimonialJsonItem[] } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("JSON malformado. Revise aspas, vírgulas e chaves antes de importar.");
  }
  if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as { depoimentos?: unknown }).depoimentos)) {
    throw new Error('O JSON precisa conter a chave "depoimentos" com uma lista de itens.');
  }
  const depoimentos = (parsed as { depoimentos: unknown[] }).depoimentos.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error(`Depoimento ${index + 1} precisa ser um objeto.`);
    const record = item as Record<string, unknown>;
    const nome = typeof record.nome === "string" ? record.nome.trim() : "";
    const texto = typeof record.texto === "string" ? record.texto.trim() : "";
    if (!nome || !texto) throw new Error(`Depoimento ${index + 1} precisa ter nome e texto.`);
    const avaliacao = typeof record.avaliacao === "number" && Number.isFinite(record.avaliacao) ? Math.max(1, Math.min(5, Math.round(record.avaliacao))) : 5;
    const status = typeof record.status === "string" && ["ativo", "rascunho", "arquivado", "approved", "pending", "archived"].includes(record.status) ? record.status as TestimonialJsonItem["status"] : "ativo";
    return {
      nome,
      texto,
      avaliacao,
      cargo_ou_contexto: typeof record.cargo_ou_contexto === "string" ? record.cargo_ou_contexto.trim() : "",
      imagem: typeof record.imagem === "string" ? record.imagem.trim() : "",
      status,
      ordem: typeof record.ordem === "number" && Number.isFinite(record.ordem) ? Math.max(1, Math.round(record.ordem)) : index + 1,
    };
  });
  if (!depoimentos.length) throw new Error("Inclua pelo menos um depoimento para importar.");
  return { depoimentos };
}

export default function AdminTestimonials() {
  const utils = trpc.useUtils();
  const [location, setLocation] = useLocation();
  const testimonials = trpc.admin.testimonials.useQuery();
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set());
  const [jsonInput, setJsonInput] = useState(testimonialJsonTemplate);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonPreview, setJsonPreview] = useState<TestimonialJsonItem[] | null>(null);
  const [replaceAllBeforeImport, setReplaceAllBeforeImport] = useState(false);
  const [exportedJson, setExportedJson] = useState("");
  const activeStatus = statusOrder.find(status => statusPaths[status] === location) ?? null;
  const isQueueScreen = activeStatus !== null;

  const update = trpc.admin.updateTestimonial.useMutation({
    onSuccess: async () => {
      await utils.admin.testimonials.invalidate();
      toast.success("Revisão do agradecimento atualizada.");
    },
    onError: error => toast.error(error.message),
  });

  const importTestimonials = trpc.admin.importTestimonialsJson.useMutation({
    onSuccess: async result => {
      await utils.admin.testimonials.invalidate();
      setJsonError(null);
      toast.success(`${result.created} depoimentos importados. ${result.skippedDuplicates} duplicados ignorados.`);
    },
    onError: error => toast.error(error.message),
  });

  const exportTestimonials = trpc.admin.exportTestimonialsJson.useMutation({
    onSuccess: async data => {
      const json = JSON.stringify(data, null, 2);
      setExportedJson(json);
      try {
        await navigator.clipboard?.writeText(json);
        toast.success("JSON dos depoimentos copiado para a área de transferência.");
      } catch {
        toast.success("JSON dos depoimentos gerado para copiar manualmente.");
      }
    },
    onError: error => toast.error(error.message),
  });

  const deleteAllTestimonials = trpc.admin.deleteAllTestimonials.useMutation({
    onSuccess: async result => {
      setExportedJson(JSON.stringify(result.backup, null, 2));
      await utils.admin.testimonials.invalidate();
      toast.success(`${result.deleted} depoimentos removidos. Backup JSON gerado abaixo.`);
    },
    onError: error => toast.error(error.message),
  });

  function save(id: number, status: TestimonialStatus, fallbackNote: string | null) {
    update.mutate({ id, status, adminNote: notes[id] ?? fallbackNote ?? null });
  }

  function validateJsonInput() {
    try {
      const parsed = parseTestimonialsJsonInput(jsonInput);
      setJsonPreview(parsed.depoimentos);
      setJsonError(null);
      toast.success(`${parsed.depoimentos.length} depoimentos detectados no JSON.`);
      return parsed;
    } catch (error) {
      const message = error instanceof Error ? error.message : "JSON inválido.";
      setJsonPreview(null);
      setJsonError(message);
      toast.error(message);
      return null;
    }
  }

  function importJsonInput() {
    const parsed = validateJsonInput();
    if (!parsed) return;
    if (replaceAllBeforeImport && !window.confirm("Substituir todos os depoimentos atuais antes da importação? Um backup JSON deve ser exportado antes desta ação.")) return;
    importTestimonials.mutate({ depoimentos: parsed.depoimentos, replaceAll: replaceAllBeforeImport });
  }

  function deleteAllWithConfirmation() {
    const confirmation = window.prompt('Para deletar todos os depoimentos, digite exatamente: DELETAR DEPOIMENTOS');
    if (confirmation !== "DELETAR DEPOIMENTOS") {
      toast.error("Confirmação inválida. Nenhum depoimento foi removido.");
      return;
    }
    deleteAllTestimonials.mutate({ confirmation });
  }

  function toggleExpanded(id: number) {
    setExpandedIds(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const all = testimonials.data ?? [];
  const counts = useMemo(() => ({
    all: all.length,
    pending: all.filter(item => item.status === "pending").length,
    approved: all.filter(item => item.status === "approved").length,
    rejected: all.filter(item => item.status === "rejected").length,
    archived: all.filter(item => item.status === "archived").length,
  }), [all]);

  const visible = useMemo(() => {
    if (!activeStatus) return [];
    const term = query.trim().toLowerCase();
    return all.filter(item => {
      if (item.status !== activeStatus) return false;
      if (!term) return true;
      return [item.memberName ?? "", item.memberEmail ?? "", item.content, item.adminNote ?? ""].some(value => value.toLowerCase().includes(term));
    });
  }, [activeStatus, all, query]);

  async function remove(id: number, memberName: string | null) {
    if (!window.confirm(`Excluir definitivamente o agradecimento de ${memberName || "este membro"}?\n\nEsta ação não poderá ser desfeita.`)) return;
    setDeletingId(id);
    try {
      const response = await fetch(withAppBase(`/api/admin/relationship-maintenance/testimonials/${id}`), { method: "DELETE", credentials: "include" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Não foi possível excluir o agradecimento.");
      await utils.admin.testimonials.invalidate();
      toast.success("Agradecimento excluído.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir o agradecimento.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <DashboardLayout menuItems={menu} title="Administração">
      <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 overflow-x-clip p-4 sm:space-y-7 sm:p-6 lg:p-8">
        <header className="min-w-0 space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Gestão de agradecimentos</span>
          <h1 className="break-words text-2xl font-semibold text-white sm:text-3xl">
            {activeStatus ? `Agradecimentos — ${statusLabels[activeStatus]}` : "Agradecimentos de membros"}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">
            {activeStatus
              ? `Lista independente dos agradecimentos com status ${statusLabels[activeStatus].toLowerCase()}.`
              : "Revise, aprove, solicite ajustes, arquive ou exclua agradecimentos enviados pela própria conta autenticada."}
          </p>
        </header>

        {!isQueueScreen ? (
          <>
            <section className="min-w-0 overflow-hidden rounded-2xl border border-amber-300/15 bg-zinc-950/60 p-4 sm:p-6">
              <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
                <div className="min-w-0 space-y-4">
                  <div className="min-w-0">
                    <span className="text-xs uppercase tracking-[0.16em] text-amber-200">Importação por JSON</span>
                    <h2 className="mt-1 break-words text-lg font-semibold text-white">Importar depoimentos gerados por IA</h2>
                    <p className="mt-1 text-sm leading-6 text-zinc-400">Cole uma lista no formato padrão, valide a estrutura e importe sem alterar o layout público atual.</p>
                  </div>
                  <textarea
                    value={jsonInput}
                    onChange={event => { setJsonInput(event.target.value); setJsonError(null); }}
                    className="min-h-72 w-full min-w-0 rounded-xl border border-white/15 bg-black/45 px-3 py-3 font-mono text-xs leading-5 text-zinc-100 outline-none ring-amber-300/40 focus:ring-2"
                    spellCheck={false}
                    aria-label="JSON de depoimentos"
                  />
                  {jsonError ? <p className="rounded-xl border border-red-300/30 bg-red-950/25 px-3 py-2 text-sm text-red-100">{jsonError}</p> : null}
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <button type="button" onClick={validateJsonInput} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-amber-200/30 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-200/10"><ClipboardCheck className="size-4" />Validar JSON</button>
                    <button type="button" onClick={importJsonInput} disabled={importTestimonials.isPending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-200 disabled:opacity-60"><Upload className="size-4" />Importar depoimentos</button>
                    <button type="button" onClick={() => exportTestimonials.mutate()} disabled={exportTestimonials.isPending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-white/10 disabled:opacity-60"><Download className="size-4" />Exportar depoimentos</button>
                    <button type="button" onClick={deleteAllWithConfirmation} disabled={deleteAllTestimonials.isPending || counts.all === 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-400/35 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/10 disabled:opacity-50"><Trash2 className="size-4" />Deletar todos os depoimentos</button>
                  </div>
                  <label className="flex items-start gap-2 text-sm leading-6 text-zinc-300">
                    <input type="checkbox" checked={replaceAllBeforeImport} onChange={event => setReplaceAllBeforeImport(event.target.checked)} className="mt-1 size-4 rounded border-white/20 bg-black text-amber-300" />
                    Substituir todos os depoimentos antes de importar. Use somente após exportar backup JSON.
                  </label>
                  {exportedJson ? (
                    <div className="min-w-0 rounded-xl border border-white/10 bg-black/30 p-3">
                      <p className="mb-2 text-xs uppercase tracking-wider text-zinc-400">Backup/exportação JSON</p>
                      <textarea value={exportedJson} readOnly className="min-h-36 w-full min-w-0 rounded-lg border border-white/10 bg-black px-3 py-2 font-mono text-xs leading-5 text-zinc-200" />
                    </div>
                  ) : null}
                </div>
                <aside className="min-w-0 space-y-4">
                  <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                    <h3 className="text-sm font-semibold text-white">Modelo para copiar e enviar para IA</h3>
                    <pre className="mt-3 max-h-72 overflow-auto rounded-lg border border-white/10 bg-black p-3 text-xs leading-5 text-zinc-300"><code>{testimonialJsonTemplate}</code></pre>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                    <h3 className="text-sm font-semibold text-white">Pré-visualização</h3>
                    {jsonPreview?.length ? (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-emerald-200">{jsonPreview.length} depoimentos detectados</p>
                        {jsonPreview.slice(0, 6).map((item, index) => (
                          <div key={`${item.nome}-${index}`} className="rounded-lg border border-white/10 bg-zinc-950/80 p-3">
                            <p className="break-words text-sm font-semibold text-white">{item.nome}</p>
                            <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-zinc-400">{item.texto}</p>
                          </div>
                        ))}
                        {jsonPreview.length > 6 ? <p className="text-xs text-zinc-500">Mais {jsonPreview.length - 6} itens serão importados.</p> : null}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-zinc-400">Valide o JSON para ver quantos depoimentos serão importados antes de salvar.</p>
                    )}
                  </div>
                </aside>
              </div>
            </section>

            <section className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
                <span className="text-xs uppercase tracking-wider text-zinc-400">Todos</span>
                <strong className="mt-1 block text-2xl text-white">{counts.all}</strong>
              </div>
              {statusOrder.map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setLocation(statusPaths[status])}
                  className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/60 p-4 text-left transition hover:border-emerald-300/40 hover:bg-emerald-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
                >
                  <span className="block break-words text-xs uppercase tracking-wider text-zinc-400">{statusLabels[status]}</span>
                  <strong className="mt-1 block text-2xl text-white">{counts[status]}</strong>
                </button>
              ))}
            </section>

            <section id="testimonial-all-list" className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-6">
              <div className="mb-4 min-w-0">
                <h2 className="break-words font-medium text-white">Todos os agradecimentos</h2>
                <p className="mt-1 text-xs text-zinc-500">{counts.all} registros cadastrados</p>
              </div>
              {testimonials.isLoading ? (
                <p className="text-sm text-zinc-400">Carregando agradecimentos...</p>
              ) : testimonials.isError ? (
                <p className="rounded-xl border border-red-300/30 p-4 text-sm text-red-200">Não foi possível carregar os agradecimentos. Confirme a sessão administrativa e tente novamente.</p>
              ) : all.length ? (
                <div className="space-y-3">
                  {all.map(item => {
                    const expanded = expandedIds.has(item.id);
                    return (
                      <article key={item.id} className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/25 p-3 sm:p-4">
                        <button type="button" onClick={() => toggleExpanded(item.id)} aria-expanded={expanded} aria-controls={`testimonial-content-${item.id}`} className="block w-full min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60">
                          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                              <span className="text-xs uppercase tracking-wider text-emerald-200">{statusLabels[item.status as TestimonialStatus]}</span>
                              <h3 className="mt-1 break-words font-medium text-white">{item.memberName || "Membro sem nome"}</h3>
                              <p className="break-words text-xs text-zinc-500">{item.memberEmail || "E-mail não informado"}</p>
                            </div>
                            <time className="shrink-0 text-xs text-zinc-500">Atualizado em {new Date(item.updatedAt).toLocaleString("pt-BR")}</time>
                          </div>
                          <p id={`testimonial-content-${item.id}`} className={`mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-200 ${expanded ? "" : "line-clamp-3"}`}>{item.content}</p>
                          <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-200">
                            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                            {expanded ? "Recolher agradecimento" : "Ver agradecimento completo"}
                          </span>
                        </button>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm leading-6 text-zinc-400">Ainda não há agradecimentos cadastrados.</p>
              )}
            </section>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setLocation("/admin/relatos")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-emerald-300/40 hover:text-emerald-100 sm:w-auto"
            >
              <ArrowLeft className="size-4" />
              Voltar para Agradecimentos
            </button>

            <section id="testimonial-moderation-list" className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-6">
              <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="break-words font-medium text-white">{activeStatus ? statusLabels[activeStatus] : "Fila de moderação"}</h2>
                  <p className="mt-1 text-xs text-zinc-500">{activeStatus ? `${counts[activeStatus]} registros neste status` : ""}</p>
                </div>
                <label className="relative block w-full sm:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-3 size-4 text-zinc-500" />
                  <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar membro ou conteúdo" className="h-10 w-full min-w-0 rounded-lg border border-white/15 bg-black pl-9 pr-3 text-sm text-white" />
                </label>
              </div>

              {testimonials.isLoading ? (
                <p className="text-sm text-zinc-400">Carregando agradecimentos...</p>
              ) : testimonials.isError ? (
                <p className="rounded-xl border border-red-300/30 p-4 text-sm text-red-200">Não foi possível carregar a fila de agradecimentos. Confirme a sessão administrativa e tente novamente.</p>
              ) : visible.length ? (
                <div className="space-y-2">
                  {visible.map(item => {
                    const expanded = expandedIds.has(item.id);
                    const detailsId = `testimonial-moderation-details-${item.id}`;
                    return (
                      <article key={item.id} className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/25">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(item.id)}
                          aria-expanded={expanded}
                          aria-controls={detailsId}
                          className="flex min-h-11 w-full min-w-0 items-center gap-2 px-3 py-2 text-left transition hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-300/60 sm:gap-3 sm:px-4"
                        >
                          <span className="shrink-0 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                            {statusLabels[item.status as TestimonialStatus]}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{item.memberName || "Membro sem nome"}</span>
                          <span className="hidden min-w-0 max-w-52 truncate text-xs text-zinc-500 md:block">{item.memberEmail || "E-mail não informado"}</span>
                          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-200">
                            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                            <span className="hidden sm:inline">{expanded ? "Recolher" : "Expandir"}</span>
                          </span>
                        </button>

                        {expanded ? (
                          <div id={detailsId} className="min-w-0 border-t border-white/10 px-3 pb-4 pt-4 sm:px-4 sm:pb-5">
                            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0 flex-1">
                                <p className="break-words text-sm text-zinc-500">{item.memberEmail || "E-mail não informado"}</p>
                                <p className="mt-1 flex items-center gap-1 text-xs text-zinc-400"><Star className="size-3 text-emerald-300" />{item.rating ? `${item.rating}/5` : "Sem avaliação registrada"}</p>
                              </div>
                              <time className="shrink-0 text-xs text-zinc-500">Atualizado em {new Date(item.updatedAt).toLocaleString("pt-BR")}</time>
                            </div>
                            <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-200">{item.content}</p>
                            <div className="mt-5 grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_180px_auto]">
                              <label className="min-w-0 text-sm text-zinc-300">Nota privada para o membro
                                <textarea value={notes[item.id] ?? item.adminNote ?? ""} onChange={event => setNotes(current => ({ ...current, [item.id]: event.target.value }))} maxLength={4000} className="mt-1 min-h-24 w-full min-w-0 rounded-lg border border-white/15 bg-black px-3 py-2 text-white outline-none ring-emerald-300/50 focus:ring-2" placeholder="Opcional: descreva a decisão ou o ajuste necessário." />
                              </label>
                              <label className="min-w-0 text-sm text-zinc-300">Status
                                <select value={item.status} onChange={event => save(item.id, event.target.value as TestimonialStatus, item.adminNote)} className="mt-1 h-11 w-full min-w-0 rounded-lg border border-white/15 bg-black px-3 text-white">
                                  <option value="pending">Em análise</option><option value="approved">Aprovado</option><option value="rejected">Necessita ajuste</option><option value="archived">Arquivado</option>
                                </select>
                              </label>
                              <div className="mt-auto grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                                <button onClick={() => save(item.id, item.status as TestimonialStatus, item.adminNote)} disabled={update.isPending} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black transition active:scale-[.97] disabled:opacity-60"><Save className="size-4" />Salvar nota</button>
                                <button onClick={() => void remove(item.id, item.memberName)} disabled={deletingId === item.id} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-400/30 px-4 py-2 text-sm font-semibold text-red-200 disabled:opacity-60"><Trash2 className="size-4" />Excluir</button>
                              </div>
                            </div>
                            <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-zinc-500"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-200" />Aprovação mantém a origem real do agradecimento; o conteúdo não deve ser fabricado ou alterado para simular a experiência do membro.</p>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm leading-6 text-zinc-400">Nenhum agradecimento corresponde a este status e à busca atual.</p>
              )}
            </section>
          </>
        )}
      </main>
    </DashboardLayout>
  );
}