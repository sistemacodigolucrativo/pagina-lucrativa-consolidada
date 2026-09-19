import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { adminMenu } from "@/lib/adminNavigation";
import { withAppBase } from "@/lib/devPath";
import { Ban, ChevronDown, Clock3, Network, PencilLine, ShieldCheck, Trash2, UsersRound } from "lucide-react";
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
  const response = await fetch(withAppBase(path), { credentials: "include", headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }, ...init });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Não foi possível concluir a operação.");
  return data;
}

export default function AdminReferrals() {
  const network = trpc.admin.referralLinks.useQuery();
  const [management, setManagement] = useState<MemberManagementResponse>({ members: [], deletionQueue: [] });
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [expandedMemberIds, setExpandedMemberIds] = useState<Set<number>>(() => new Set());

  const loadMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      const nextManagement = await request("/api/admin/member-management") as MemberManagementResponse;
      setManagement(nextManagement);
      setExpandedMemberIds(current => {
        const activeIds = new Set(nextManagement.members.filter(member => !member.deletionRequestedAt).map(member => member.id));
        return new Set([...current].filter(id => activeIds.has(id)));
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar os membros.");
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  useEffect(() => { void loadMembers(); }, [loadMembers]);

  function toggleMemberExpanded(memberId: number) {
    setExpandedMemberIds(current => {
      const next = new Set(current);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  }

  function editMember(member: ManagedMember) {
    window.location.assign(withAppBase(`/admin/membros/${member.id}/editar`));
  }

  async function toggleBlock(member: ManagedMember) {
    if (member.deletionRequestedAt) return void toast.error("Restaure o membro da fila de exclusão antes de alterar o bloqueio.");
    const blocked = !member.blocked;
    if (!window.confirm(`${blocked ? "Bloquear" : "Desbloquear"} ${member.name || `membro #${member.id}`}?`)) return;
    setBusyId(member.id);
    try {
      await request("/api/admin/member-management/block", { method: "POST", body: JSON.stringify({ userId: member.id, blocked }) });
      await loadMembers();
      toast.success(blocked ? "Membro bloqueado." : "Membro desbloqueado.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Falha ao alterar bloqueio."); }
    finally { setBusyId(null); }
  }

  async function scheduleDeletion(member: ManagedMember) {
    if (!window.confirm(`Enviar ${member.name || `membro #${member.id}`} para exclusão?\n\nA conta ficará bloqueada por 7 dias. Depois disso, os dados do membro serão removidos definitivamente. Os indicados não serão excluídos; eles ficarão órfãos.`)) return;
    setBusyId(member.id);
    try {
      const result = await request("/api/admin/member-management/delete", { method: "POST", body: JSON.stringify({ userId: member.id }) });
      await loadMembers();
      toast.success(`Exclusão programada para ${formatDate(result.deleteAfter)}.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Falha ao programar exclusão."); }
    finally { setBusyId(null); }
  }

  const data = network.data;
  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Gestão de membros</span>
          <h1 className="text-3xl font-semibold text-white">Membros e rede</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">Gerencie contas, bloqueios e exclusões com retenção de 7 dias sem apagar a rede de indicados.</p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5" aria-labelledby="referral-network-title">
          <div className="flex items-center gap-2 text-white"><ShieldCheck className="size-5 text-emerald-300" /><h2 id="referral-network-title" className="font-medium">Rede de indicações</h2></div>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Os vínculos continuam sendo criados pelo fluxo real de adesão. Quando um patrocinador é excluído definitivamente, os indicados permanecem ativos e o vínculo é removido.</p>
          {network.error ? <p className="mt-4 text-sm text-red-200">Não foi possível carregar a rede.</p> : !network.isLoading && !(data?.links.length) ? <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-white/15 p-4 text-sm text-zinc-400"><Network className="size-4" />Nenhum vínculo registrado.</div> : null}
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-5"><p className="text-xs uppercase tracking-wider text-emerald-200">Membros</p><strong className="mt-2 block text-3xl text-white">{loadingMembers ? "..." : management.members.length}</strong></article>
          <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><p className="text-xs uppercase tracking-wider text-zinc-400">Vínculos ativos</p><strong className="mt-2 block text-3xl text-white">{network.isLoading ? "..." : data?.activeCount ?? 0}</strong></article>
          <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:col-span-2 lg:col-span-1"><p className="text-xs uppercase tracking-wider text-zinc-400">Bloqueados</p><strong className="mt-2 block text-3xl text-white">{management.members.filter(member => member.blocked && !member.deletionRequestedAt).length}</strong></article>
        </section>

        {!loadingMembers && management.deletionQueue.length ? (
          <a href={withAppBase("/admin/membros/exclusoes")} className="block rounded-2xl border border-amber-300/25 bg-amber-300/5 p-4 transition hover:border-amber-300/45 hover:bg-amber-300/[0.08] focus:outline-none focus:ring-2 focus:ring-amber-300/30 sm:p-5" aria-label="Abrir Área temporária de exclusão">
            <div className="flex items-center gap-2 text-white"><Clock3 className="size-5 shrink-0 text-amber-300" /><h2 className="font-medium">Área temporária de exclusão</h2></div>
            <div className="mt-3 flex w-full items-center justify-between gap-4 rounded-xl border border-amber-300/20 bg-black/20 px-4 py-3" aria-label="Exclusões aguardando">
              <span className="text-xs uppercase tracking-wider text-amber-200">Exclusões aguardando</span>
              <strong className="shrink-0 text-2xl text-white sm:text-3xl">{management.deletionQueue.length}</strong>
            </div>
            <div className="mt-3 min-w-0">
              <p className="text-sm leading-6 text-zinc-300">Contas permanecem aqui por 7 dias antes da remoção definitiva.</p>
              <p className="text-sm leading-6 text-zinc-300">Os indicados do membro excluído são preservados e passam a ficar órfãos.</p>
            </div>
          </a>
        ) : null}

        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-white"><UsersRound className="size-5 text-emerald-300" /><h2 className="font-medium">Contas de membros</h2></div>
          {loadingMembers ? <p className="text-sm text-zinc-400">Carregando membros...</p> : management.members.length ? <div className="grid gap-2.5 lg:grid-cols-2">{management.members.filter(member => !member.deletionRequestedAt).map(member => {
            const expanded = expandedMemberIds.has(member.id);
            return <article key={member.id} className={`min-w-0 overflow-hidden rounded-xl border bg-black/25 transition-colors ${expanded ? "border-emerald-300/25" : "border-white/10 hover:border-white/20"}`}>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`member-details-${member.id}`}
                onClick={() => toggleMemberExpanded(member.id)}
                className="flex w-full min-w-0 items-center gap-3 p-3 text-left sm:p-3.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="min-w-0 flex-1 truncate font-medium text-white">{member.name || `Membro #${member.id}`}</p>
                    <span className={member.blocked ? "shrink-0 rounded-full bg-red-500/10 px-2 py-1 text-[11px] text-red-200" : "shrink-0 rounded-full bg-emerald-400/10 px-2 py-1 text-[11px] text-emerald-200"}>{member.blocked ? "Bloqueado" : "Ativo"}</span>
                  </div>
                  <div className="mt-0.5 flex min-w-0 items-center gap-2 text-xs text-zinc-500">
                    <span className="shrink-0">#{member.id}</span>
                    <span aria-hidden="true">•</span>
                    <span className="min-w-0 truncate">{member.email || "Sem e-mail"}</span>
                  </div>
                </div>
                <ChevronDown className={`size-4 shrink-0 text-zinc-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>

              {expanded ? <div id={`member-details-${member.id}`} className="border-t border-white/10 px-3 pb-3 pt-3 sm:px-3.5 sm:pb-3.5">
                <div className="grid gap-2 text-xs sm:grid-cols-2">
                  <div className="rounded-lg bg-white/[0.035] p-2.5"><span className="block text-zinc-500">Último acesso</span><strong className="mt-1 block break-words font-medium text-zinc-200">{formatDate(member.lastSignedIn)}</strong></div>
                  <div className="rounded-lg bg-white/[0.035] p-2.5"><span className="block text-zinc-500">Rede</span><strong className="mt-1 block break-words font-medium text-zinc-200">{member.referralsCount} indicados · {member.sponsorId ? `Patrocinador #${member.sponsorId}` : "Órfão"}</strong></div>
                  <div className="rounded-lg bg-white/[0.035] p-2.5"><span className="block text-zinc-500">Cadastro</span><strong className="mt-1 block break-words font-medium text-zinc-200">{formatDate(member.createdAt)}</strong></div>
                  <div className="rounded-lg bg-white/[0.035] p-2.5"><span className="block text-zinc-500">Última atualização</span><strong className="mt-1 block break-words font-medium text-zinc-200">{formatDate(member.updatedAt)}</strong></div>
                </div>
                <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3 sm:flex-row sm:flex-wrap">
                  <button disabled={busyId === member.id} onClick={() => editMember(member)} className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-200 disabled:opacity-50 sm:w-auto"><PencilLine className="size-4" />Editar</button>
                  <button disabled={busyId === member.id} onClick={() => void toggleBlock(member)} className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-amber-300/25 px-3 py-2 text-sm text-amber-200 disabled:opacity-50 sm:w-auto"><Ban className="size-4" />{member.blocked ? "Desbloquear" : "Bloquear"}</button>
                  <button disabled={busyId === member.id} onClick={() => void scheduleDeletion(member)} className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-red-400/25 px-3 py-2 text-sm text-red-200 disabled:opacity-50 sm:w-auto"><Trash2 className="size-4" />Excluir</button>
                </div>
              </div> : null}
            </article>;
          })}</div> : <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-zinc-400">Nenhum membro registrado.</p>}
        </section>
      </main>
    </DashboardLayout>
  );
}
