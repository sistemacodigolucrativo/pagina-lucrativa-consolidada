import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { adminMenu } from "@/lib/adminNavigation";
import { withAppBase } from "@/lib/devPath";
import { Ban, Clock3, Network, PencilLine, RotateCcw, ShieldCheck, Trash2, UsersRound } from "lucide-react";
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

  const loadMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      setManagement(await request("/api/admin/member-management") as MemberManagementResponse);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar os membros.");
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  useEffect(() => { void loadMembers(); }, [loadMembers]);

  async function editMember(member: ManagedMember) {
    const name = window.prompt("Nome do membro:", member.name ?? "");
    if (name === null) return;
    const email = window.prompt("E-mail do membro:", member.email ?? "");
    if (email === null) return;
    setBusyId(member.id);
    try {
      await request("/api/admin/member-management/edit", { method: "POST", body: JSON.stringify({ userId: member.id, name, email }) });
      await loadMembers();
      toast.success("Membro atualizado.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Falha ao editar membro."); }
    finally { setBusyId(null); }
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

  async function restoreMember(member: ManagedMember) {
    if (!window.confirm(`Restaurar ${member.name || `membro #${member.id}`} e cancelar a exclusão programada?`)) return;
    setBusyId(member.id);
    try {
      await request("/api/admin/member-management/restore", { method: "POST", body: JSON.stringify({ userId: member.id }) });
      await loadMembers();
      toast.success("Exclusão cancelada e acesso restaurado.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Falha ao restaurar membro."); }
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

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-5"><p className="text-xs uppercase tracking-wider text-emerald-200">Membros</p><strong className="mt-2 block text-3xl text-white">{loadingMembers ? "..." : management.members.length}</strong></article>
          <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><p className="text-xs uppercase tracking-wider text-zinc-400">Vínculos ativos</p><strong className="mt-2 block text-3xl text-white">{network.isLoading ? "..." : data?.activeCount ?? 0}</strong></article>
          <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><p className="text-xs uppercase tracking-wider text-zinc-400">Bloqueados</p><strong className="mt-2 block text-3xl text-white">{management.members.filter(member => member.blocked && !member.deletionRequestedAt).length}</strong></article>
          <article className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5"><p className="text-xs uppercase tracking-wider text-amber-200">Exclusão em 7 dias</p><strong className="mt-2 block text-3xl text-white">{management.deletionQueue.length}</strong></article>
        </section>

        {management.deletionQueue.length ? <section className="rounded-2xl border border-amber-300/25 bg-amber-300/5 p-5">
          <div className="mb-4 flex items-center gap-2 text-white"><Clock3 className="size-5 text-amber-300" /><h2 className="font-medium">Área temporária de exclusão</h2></div>
          <p className="mb-4 text-sm leading-6 text-zinc-300">Contas permanecem aqui por 7 dias antes da remoção definitiva. Os indicados do membro excluído são preservados e passam a ficar órfãos.</p>
          <div className="space-y-3">{management.deletionQueue.map(member => <article key={member.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/20 bg-black/25 p-4"><div><strong className="text-white">{member.name || `Membro #${member.id}`}</strong><p className="text-sm text-zinc-400">{member.email || "Sem e-mail"}</p><p className="mt-1 text-xs text-amber-200">Exclusão definitiva: {formatDate(member.deleteAfter)}</p></div><button disabled={busyId === member.id} onClick={() => void restoreMember(member)} className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/30 px-3 py-2 text-sm text-emerald-200 disabled:opacity-50"><RotateCcw className="size-4" />Restaurar</button></article>)}</div>
        </section> : null}

        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
          <div className="mb-4 flex items-center gap-2 text-white"><UsersRound className="size-5 text-emerald-300" /><h2 className="font-medium">Contas de membros</h2></div>
          {loadingMembers ? <p className="text-sm text-zinc-400">Carregando membros...</p> : management.members.length ? <div className="grid gap-3 lg:grid-cols-2">{management.members.filter(member => !member.deletionRequestedAt).map(member => <article key={member.id} className="rounded-xl border border-white/10 bg-black/25 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-medium text-white">{member.name || `Membro #${member.id}`}</p><p className="truncate text-xs text-zinc-500">{member.email || "Sem e-mail"}</p><div className="mt-2 flex flex-wrap gap-2 text-xs"><span className={member.blocked ? "rounded-full bg-red-500/10 px-2 py-1 text-red-200" : "rounded-full bg-emerald-400/10 px-2 py-1 text-emerald-200"}>{member.blocked ? "Bloqueado" : "Ativo"}</span><span className="rounded-full bg-white/5 px-2 py-1 text-zinc-300">{member.referralsCount} indicados</span>{member.sponsorId ? <span className="rounded-full bg-white/5 px-2 py-1 text-zinc-300">Patrocinador #{member.sponsorId}</span> : <span className="rounded-full bg-amber-400/10 px-2 py-1 text-amber-200">Órfão</span>}</div></div><div className="text-right text-xs text-zinc-500">Último acesso<br />{formatDate(member.lastSignedIn)}</div></div><div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-3"><button disabled={busyId === member.id} onClick={() => void editMember(member)} className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-200"><PencilLine className="size-4" />Editar</button><button disabled={busyId === member.id} onClick={() => void toggleBlock(member)} className="inline-flex items-center gap-1 rounded-lg border border-amber-300/25 px-3 py-2 text-sm text-amber-200"><Ban className="size-4" />{member.blocked ? "Desbloquear" : "Bloquear"}</button><button disabled={busyId === member.id} onClick={() => void scheduleDeletion(member)} className="inline-flex items-center gap-1 rounded-lg border border-red-400/25 px-3 py-2 text-sm text-red-200"><Trash2 className="size-4" />Excluir</button></div></article>)}</div> : <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-zinc-400">Nenhum membro registrado.</p>}
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
          <div className="flex items-center gap-2 text-white"><ShieldCheck className="size-5 text-emerald-300" /><h2 className="font-medium">Rede de indicações</h2></div>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Os vínculos continuam sendo criados pelo fluxo real de adesão. Quando um patrocinador é excluído definitivamente, os indicados permanecem ativos e o vínculo é removido.</p>
          {network.error ? <p className="mt-4 text-sm text-red-200">Não foi possível carregar a rede.</p> : !network.isLoading && !(data?.links.length) ? <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-white/15 p-4 text-sm text-zinc-400"><Network className="size-4" />Nenhum vínculo registrado.</div> : null}
        </section>
      </main>
    </DashboardLayout>
  );
}
