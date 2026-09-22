import DashboardLayout from "@/components/DashboardLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { adminMenu } from "@/lib/adminNavigation";
import { withAppBase } from "@/lib/devPath";
import { CheckCircle2, Clock3, KeyRound, RefreshCw, Rocket, ShieldCheck, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type DeployState = {
  status: "idle" | "deploying" | "completed" | "failed";
  progress: number;
  stage?: string;
  sha?: string;
  updatedAt?: string;
};

type ManualDeployAudit = {
  status: "running" | "completed" | "failed";
  sha: string;
  requestedBy: number | null;
  requestedAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  stage: string | null;
  exitCode: number | null;
  deployRef?: string | null;
};

type ManualDeployInfo = {
  available: boolean;
  currentSha: string | null;
  workerActive: boolean;
  queued: boolean;
  deployStatus: DeployState;
  lastManualDeploy: ManualDeployAudit | null;
  updates: string[];
  hasSavedGithubToken: boolean;
  defaultDeployRef: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(withAppBase(path), {
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Não foi possível concluir a operação.");
  return data as T;
}

function statusLabel(info: ManualDeployInfo | null) {
  if (!info) return "Carregando";
  if (info.deployStatus.status === "deploying") return "Em execução";
  if (info.queued) return "Aguardando execução";
  if (info.deployStatus.status === "failed") return "Último deploy falhou";
  if (info.deployStatus.status === "completed") return "Pronto";
  return info.available ? "Pronto" : "Indisponível";
}

function manualAuditLabel(audit: ManualDeployAudit | null) {
  if (!audit) return "Ainda não verificado";
  if (audit.status === "running") return "Execução manual em andamento";
  if (audit.status === "completed") return "Execução manual confirmada";
  return "Execução manual falhou";
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}

export default function AdminManualDeploy() {
  const [info, setInfo] = useState<ManualDeployInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [saveGithubToken, setSaveGithubToken] = useState(false);
  const [deployRef, setDeployRef] = useState("main");

  const load = useCallback(async (showError = false) => {
    try {
      const next = await request<ManualDeployInfo>("/api/admin/manual-deploy");
      setInfo(next);
      setDeployRef(current => current || next.defaultDeployRef || "main");
    } catch (error) {
      if (showError) toast.error(error instanceof Error ? error.message : "Falha ao consultar deploy manual.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      if (cancelled) return;
      await load(false);
    };
    void refresh();
    const timer = window.setInterval(refresh, 1500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [load]);

  const tokenRequired = !info?.hasSavedGithubToken && !githubToken.trim();
  const blocked = !info?.available || info?.queued || info?.deployStatus.status === "deploying" || submitting || tokenRequired;
  const progress = Math.max(0, Math.min(100, Math.round(info?.deployStatus.progress ?? 0)));
  const shortSha = useMemo(() => info?.currentSha?.slice(0, 12) ?? "—", [info?.currentSha]);
  const audit = info?.lastManualDeploy ?? null;

  async function startDeploy() {
    setSubmitting(true);
    try {
      const cleanToken = githubToken.trim();
      const result = await request<{ status: "queued"; sha: string | null; deployRef: string; requestedAt: string; tokenSaved: boolean }>("/api/admin/manual-deploy", {
        method: "POST",
        body: JSON.stringify({
          confirm: true,
          deployRef: deployRef.trim() || info?.defaultDeployRef || "main",
          githubToken: cleanToken || undefined,
          saveGithubToken: Boolean(cleanToken && saveGithubToken),
        }),
      });
      if (!saveGithubToken) setGithubToken("");
      toast.success(`Deploy solicitado para ${result.deployRef}.`);
      await load(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao iniciar deploy manual.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Sistema</span>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Deploy manual</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">
            Atualize a VPS pelo painel usando o script mestre de autodeploy: GitHub, release, banco, migrations, syncs, restart e healthcheck.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
          <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5 lg:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-white"><Rocket className="size-5 text-emerald-300" /><h2 className="font-medium">Atualização da VPS</h2></div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">O botão agora busca a ref configurada no GitHub e executa o script mestre, não apenas republica o mesmo pacote.</p>
              </div>
              <span className="w-fit shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-200">{statusLabel(info)}</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                <span className="text-xs uppercase tracking-wider text-zinc-500">SHA atual</span>
                <strong className="mt-2 block break-all font-mono text-sm text-white">{loading ? "Carregando..." : shortSha}</strong>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                <span className="text-xs uppercase tracking-wider text-zinc-500">Worker</span>
                <strong className={info?.workerActive ? "mt-2 flex items-center gap-2 text-sm text-emerald-200" : "mt-2 flex items-center gap-2 text-sm text-amber-200"}>
                  {info?.workerActive ? <CheckCircle2 className="size-4" /> : <TriangleAlert className="size-4" />}
                  {info?.workerActive ? "Ativo" : "Indisponível"}
                </strong>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                <span className="text-xs uppercase tracking-wider text-zinc-500">Token salvo</span>
                <strong className={info?.hasSavedGithubToken ? "mt-2 flex items-center gap-2 text-sm text-emerald-200" : "mt-2 flex items-center gap-2 text-sm text-zinc-300"}>
                  <KeyRound className="size-4" />{info?.hasSavedGithubToken ? "Sim" : "Não"}
                </strong>
              </div>
            </div>

            {info?.deployStatus.status === "deploying" ? (
              <div className="mt-5 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4" role="status" aria-live="polite">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0"><p className="text-sm font-medium text-white">Deploy em execução</p><p className="truncate text-xs text-zinc-400">{info.deployStatus.stage || "Publicando nova versão"}</p></div>
                  <strong className="shrink-0 font-mono text-sm text-emerald-300">{progress}%</strong>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-300 transition-[width] duration-500" style={{ width: `${progress}%` }} /></div>
              </div>
            ) : info?.queued ? (
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100"><Clock3 className="size-5 shrink-0" />Solicitação confirmada e aguardando o worker da VPS.</div>
            ) : null}
          </article>

          <article className="rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center gap-2 text-white"><ShieldCheck className="size-5 text-emerald-300" /><h2 className="font-medium">Token GitHub</h2></div>
            <p className="mt-3 text-sm leading-6 text-zinc-300">Informe o token do repositório. Se marcar para salvar, ele fica na VPS com permissão restrita e não volta para o navegador.</p>
            <button type="button" onClick={() => void load(true)} className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/5 sm:w-auto">
              <RefreshCw className="size-4" /> Atualizar estado
            </button>
          </article>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5 lg:p-6">
          <h2 className="text-lg font-medium text-white">Configurar atualização</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-zinc-200">Branch/ref para publicar
              <input value={deployRef} onChange={event => setDeployRef(event.target.value)} placeholder={info?.defaultDeployRef || "main"} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" />
            </label>
            <label className="block text-sm text-zinc-200">Token GitHub {info?.hasSavedGithubToken ? <span className="text-zinc-500">(opcional, já existe token salvo)</span> : <span className="text-amber-200">(obrigatório)</span>}
              <input type="password" autoComplete="off" value={githubToken} onChange={event => setGithubToken(event.target.value)} placeholder="github_pat_... ou ghp_..." className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white" />
            </label>
          </div>
          <label className="mt-4 flex items-start gap-3 rounded-xl border border-white/10 bg-black/25 p-4 text-sm text-zinc-300">
            <input type="checkbox" checked={saveGithubToken} onChange={event => setSaveGithubToken(event.target.checked)} disabled={!githubToken.trim()} className="mt-1" />
            <span>Salvar este token com segurança na VPS para os próximos deploys.</span>
          </label>
          {tokenRequired ? <p className="mt-3 text-sm text-amber-200">Informe um token para liberar o botão de deploy.</p> : null}
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5 lg:p-6" aria-labelledby="manual-deploy-audit-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 id="manual-deploy-audit-title" className="text-lg font-medium text-white">Última execução manual</h2>
              <p className="mt-1 text-sm leading-6 text-zinc-400">Registro gravado pelo worker da VPS.</p>
            </div>
            <span className={audit?.status === "completed" ? "w-fit shrink-0 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-200" : audit?.status === "failed" ? "w-fit shrink-0 rounded-full border border-red-400/25 bg-red-400/10 px-3 py-1 text-xs font-medium text-red-200" : "w-fit shrink-0 rounded-full border border-amber-300/20 bg-amber-300/5 px-3 py-1 text-xs font-medium text-amber-100"}>{manualAuditLabel(audit)}</span>
          </div>
          {audit ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-xl border border-white/10 bg-black/25 p-3"><span className="text-[11px] uppercase tracking-wider text-zinc-500">SHA</span><strong className="mt-1 block break-all font-mono text-xs text-zinc-200">{audit.sha.slice(0, 12)}</strong></div>
              <div className="rounded-xl border border-white/10 bg-black/25 p-3"><span className="text-[11px] uppercase tracking-wider text-zinc-500">Ref</span><strong className="mt-1 block text-xs font-medium text-zinc-200">{audit.deployRef || "—"}</strong></div>
              <div className="rounded-xl border border-white/10 bg-black/25 p-3"><span className="text-[11px] uppercase tracking-wider text-zinc-500">Solicitado</span><strong className="mt-1 block text-xs font-medium text-zinc-200">{formatDate(audit.requestedAt)}</strong></div>
              <div className="rounded-xl border border-white/10 bg-black/25 p-3"><span className="text-[11px] uppercase tracking-wider text-zinc-500">Iniciado</span><strong className="mt-1 block text-xs font-medium text-zinc-200">{formatDate(audit.startedAt)}</strong></div>
              <div className="rounded-xl border border-white/10 bg-black/25 p-3"><span className="text-[11px] uppercase tracking-wider text-zinc-500">Finalizado</span><strong className="mt-1 block text-xs font-medium text-zinc-200">{formatDate(audit.finishedAt)}</strong></div>
              <div className="rounded-xl border border-white/10 bg-black/25 p-3 sm:col-span-2 lg:col-span-5"><span className="text-[11px] uppercase tracking-wider text-zinc-500">Resultado</span><strong className={audit.status === "completed" ? "mt-1 block text-sm font-medium text-emerald-200" : audit.status === "failed" ? "mt-1 block text-sm font-medium text-red-200" : "mt-1 block text-sm font-medium text-amber-100"}>{audit.stage || "Execução registrada pelo worker"}{audit.exitCode !== null ? ` · código ${audit.exitCode}` : ""}</strong></div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-white/15 p-4 text-sm leading-6 text-zinc-400">Nenhuma execução manual registrada ainda.</div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5 lg:p-6">
          <h2 className="text-lg font-medium text-white">O que o processo executa</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(info?.updates ?? []).map((item, index) => (
              <div key={item} className="flex min-w-0 gap-3 rounded-xl border border-white/10 bg-black/25 p-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-300/10 text-xs font-semibold text-emerald-200">{index + 1}</span>
                <p className="text-sm leading-6 text-zinc-300">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-white/10 pt-5">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button disabled={blocked} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">
                  <Rocket className="size-4" /> {submitting ? "Solicitando..." : "Executar atualização"}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar atualização da VPS?</AlertDialogTitle>
                  <AlertDialogDescription className="text-left leading-6 text-zinc-400">O painel vai publicar a ref <strong className="font-mono text-zinc-200">{deployRef || info?.defaultDeployRef || "main"}</strong> usando o script mestre.</AlertDialogDescription>
                </AlertDialogHeader>
                <ol className="space-y-2 text-sm text-zinc-300">
                  {(info?.updates ?? []).map((item, index) => <li key={item} className="flex gap-2"><span className="font-mono text-emerald-300">{index + 1}.</span><span>{item}</span></li>)}
                </ol>
                <p className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-xs leading-5 text-amber-100">Se salvar o token, ele será gravado apenas na VPS, fora do frontend. Se não salvar, será usado somente nesta execução.</p>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction disabled={submitting} onClick={() => void startDeploy()} className="bg-emerald-300 text-black hover:bg-emerald-200">Confirmar e iniciar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {!loading && !info?.available ? <p className="mt-3 text-xs leading-5 text-amber-200">O botão permanece bloqueado enquanto o worker seguro da VPS não estiver ativo.</p> : null}
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
