import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { adminMenu } from "@/lib/adminNavigation";
import { Network, ShieldCheck, UsersRound } from "lucide-react";

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function statusLabel(status: "active" | "archived") {
  return status === "active" ? "Ativo" : "Arquivado";
}

function statusClass(status: "active" | "archived") {
  return status === "active"
    ? "rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200"
    : "rounded-full bg-zinc-700/50 px-3 py-1 text-xs text-zinc-300";
}

export default function AdminReferrals() {
  const network = trpc.admin.referralLinks.useQuery();
  const data = network.data;
  const links = data?.links ?? [];

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Governança de relacionamento</span>
          <h1 className="text-3xl font-semibold text-white">Membros e rede</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">
            Visão global dos vínculos de indicação criados automaticamente pelo fluxo de adesão, pagamento e ativação.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-5">
            <p className="text-xs uppercase tracking-wider text-emerald-200">Vínculos ativos</p>
            <strong className="mt-2 block text-3xl text-white">{network.isLoading ? "..." : data?.activeCount ?? 0}</strong>
          </article>
          <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Vínculos arquivados</p>
            <strong className="mt-2 block text-3xl text-white">{network.isLoading ? "..." : data?.archivedCount ?? 0}</strong>
          </article>
          <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Patrocinadores</p>
            <strong className="mt-2 block text-3xl text-white">{network.isLoading ? "..." : data?.sponsorCount ?? 0}</strong>
          </article>
          <article className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Membros indicados</p>
            <strong className="mt-2 block text-3xl text-white">{network.isLoading ? "..." : data?.referredCount ?? 0}</strong>
          </article>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="size-5 text-emerald-300" />
              <h2 className="font-medium">Vínculos registrados</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-zinc-400">
              Esta tela é somente consultiva. O administrador não cria vínculos manualmente; a origem é sempre a tabela referralLinks gerada pelo fluxo real.
            </p>
          </div>

          {network.isLoading ? (
            <p className="mt-5 rounded-xl border border-white/10 bg-black/25 p-5 text-sm text-zinc-400">Carregando vínculos...</p>
          ) : network.error ? (
            <p className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-100">
              Não foi possível carregar os vínculos da rede. Tente novamente.
            </p>
          ) : links.length ? (
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {links.map(link => (
                <article key={link.id} className="rounded-xl border border-white/10 bg-black/25 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-zinc-400">Patrocinador</p>
                      <p className="truncate font-medium text-white">{link.sponsorName || `Membro #${link.sponsorId}`}</p>
                      {link.sponsorEmail ? <p className="truncate text-xs text-zinc-500">{link.sponsorEmail}</p> : null}
                    </div>
                    <span className={statusClass(link.status)}>{statusLabel(link.status)}</span>
                  </div>
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <p className="text-sm text-zinc-400">Indicado</p>
                    <p className="truncate font-medium text-white">{link.referredName || `Membro #${link.referredUserId}`}</p>
                    {link.referredEmail ? <p className="truncate text-xs text-zinc-500">{link.referredEmail}</p> : null}
                  </div>
                  <div className="mt-3 grid gap-2 border-t border-white/10 pt-3 text-xs text-zinc-500 sm:grid-cols-2">
                    <span>Criado em {formatDate(link.createdAt)}</span>
                    <span>Atualizado em {formatDate(link.updatedAt)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-white/15 p-5">
              <div className="flex items-center gap-2 text-white">
                <Network className="size-5 text-emerald-300" />
                <strong>Nenhum vínculo ativo ou arquivado encontrado.</strong>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                Pedidos atribuídos ainda não aparecem aqui. O vínculo passa a existir somente quando o pedido é confirmado, o acesso é ativado e o novo membro conclui a configuração da conta.
              </p>
            </div>
          )}
        </section>
      </main>
    </DashboardLayout>
  );
}
