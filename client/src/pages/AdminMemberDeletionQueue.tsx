import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { withAppBase } from "@/lib/devPath";
import { ArrowLeft, Clock3, RotateCcw, Trash2, UsersRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type ManagedMember = {
  id: number;
  name: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  lastSignedIn: string;
  blocked: boolean;
  deletionRequestedAt: string | null;
  deleteAfter: string | null;
  referralsCount: number;
  sponsorId: number | null;
};

type MemberManagementResponse = { members: ManagedMember[]; deletionQueue: ManagedMember[] };

function formatDate(value: Date | string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}

async function request(path: string, init?: RequestInit) {
  const response = await fetch(withAppBase(path), {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Não foi possível concluir a operação.");
  return data;
}

export default function AdminMemberDeletionQueue() {
  const [queue, setQueue] = useState<ManagedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request("/api/admin/member-management") as MemberManagementResponse;
      setQueue(data.deletionQueue);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar a área temporária de exclusão.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadQueue(); }, [loadQueue]);

  async function restoreMember(member: ManagedMember) {
    if (!window.confirm(`Restaurar ${member.name || `membro #${member.id}`} e cancelar a exclusão programada?`)) return;
    setBusyId(member.id);
    try {
      await request("/api/admin/member-management/restore", {
        method: "POST",
        body: JSON.stringify({ userId: member.id }),
      });
      await loadQueue();
      toast.success("Exclusão cancelada e acesso restaurado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao restaurar membro.");
    } finally {
      setBusyId(null);
    }
  }

  async function permanentlyDeleteMember(member: ManagedMember) {
    const label = member.name || `membro #${member.id}`;
    if (!window.confirm(`Excluir definitivamente ${label}?\n\nEsta ação é irreversível e remove agora os dados da conta. Os indicados desse membro não serão excluídos; eles permanecerão ativos e ficarão órfãos.`)) return;
    setBusyId(member.id);
    try {
      await request("/api/admin/member-management/delete-now", {
        method: "POST",
        body: JSON.stringify({ userId: member.id }),
      });
      await loadQueue();
      toast.success("Membro excluído definitivamente. Os indicados foram preservados.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao excluir definitivamente o membro.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-6xl space-y-7 p-5 sm:p-8">
        <header className="space-y-3">
          <a href={withAppBase("/admin/membros")} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white">
            <ArrowLeft className="size-4" /> Voltar para Membros e rede
          </a>
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.16em] text-amber-300">Gestão de membros</span>
            <h1 className="text-3xl font-semibold text-white">Área temporária de exclusão</h1>
            <p className="max-w-3xl text-sm leading-6 text-zinc-300">Contas permanecem aqui por 7 dias antes da remoção definitiva.</p>
            <p className="max-w-3xl text-sm leading-6 text-zinc-400">Os indicados do membro excluído são preservados e passam a ficar órfãos.</p>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-amber-300/25 bg-amber-300/5 p-5">
            <div className="flex items-center gap-2 text-amber-100"><Clock3 className="size-5 text-amber-300" /><span className="text-sm font-medium">Aguardando decisão</span></div>
            <strong className="mt-2 block text-3xl text-white">{loading ? "..." : queue.length}</strong>
          </article>
          <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
            <div className="flex items-center gap-2 text-white"><UsersRound className="size-5 text-emerald-300" /><span className="text-sm font-medium">Regra da rede</span></div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Excluir uma conta nunca apaga os membros indicados por ela.</p>
          </article>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-white"><Clock3 className="size-5 text-amber-300" /><h2 className="font-medium">Contas em período de exclusão</h2></div>
          {loading ? <p className="text-sm text-zinc-400">Carregando contas...</p> : queue.length ? (
            <div className="space-y-3">
              {queue.map(member => (
                <article key={member.id} className="min-w-0 rounded-xl border border-amber-300/20 bg-black/25 p-4 sm:p-5">
                  <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="min-w-0">
                        <strong className="block break-words text-white">{member.name || `Membro #${member.id}`}</strong>
                        <p className="break-all text-sm text-zinc-400">{member.email || "Sem e-mail"}</p>
                        <p className="mt-1 text-xs text-zinc-500">ID #{member.id}</p>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-2">
                        <div className="rounded-lg bg-white/[0.035] p-2.5"><span className="block text-zinc-500">Enviado para exclusão</span><strong className="mt-1 block font-medium text-zinc-200">{formatDate(member.deletionRequestedAt)}</strong></div>
                        <div className="rounded-lg bg-white/[0.035] p-2.5"><span className="block text-zinc-500">Exclusão automática</span><strong className="mt-1 block font-medium text-amber-200">{formatDate(member.deleteAfter)}</strong></div>
                        <div className="rounded-lg bg-white/[0.035] p-2.5"><span className="block text-zinc-500">Indicados ativos</span><strong className="mt-1 block font-medium text-zinc-200">{member.referralsCount}</strong></div>
                        <div className="rounded-lg bg-white/[0.035] p-2.5"><span className="block text-zinc-500">Situação</span><strong className="mt-1 block font-medium text-red-200">Bloqueado durante retenção</strong></div>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                      <button disabled={busyId === member.id} onClick={() => void restoreMember(member)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-300/30 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-300/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
                        <RotateCcw className="size-4" /> Restaurar
                      </button>
                      <button disabled={busyId === member.id} onClick={() => void permanentlyDeleteMember(member)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-400/30 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
                        <Trash2 className="size-4" /> Excluir definitivamente
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="rounded-xl border border-dashed border-white/15 p-6 text-center"><p className="text-sm text-zinc-300">Nenhuma conta está aguardando exclusão.</p><p className="mt-1 text-xs text-zinc-500">Quando uma conta entrar no período de retenção de 7 dias, ela aparecerá aqui.</p></div>}
        </section>
      </main>
    </DashboardLayout>
  );
}
