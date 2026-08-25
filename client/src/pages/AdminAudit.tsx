import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { ClipboardList, ShieldCheck } from "lucide-react";

export default function AdminAudit() {
  const activities = trpc.admin.activities.useQuery();

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Sistema</span>
          <h1 className="text-3xl font-semibold text-white">Auditoria</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">Acompanhe a trilha de atividades operacionais registrada pelo sistema.</p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-white">
            <ClipboardList className="size-5 text-emerald-300" />
            <h2 className="font-medium">Atividades recentes</h2>
          </div>
          {activities.isLoading ? (
            <p className="text-sm text-zinc-400">Carregando atividades...</p>
          ) : activities.data?.length ? (
            <div className="space-y-3">
              {activities.data.map(item => (
                <article key={item.id} className="border-l-2 border-emerald-300/60 pl-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-300" />
                    <p className="text-sm text-zinc-200">{item.description}</p>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">{new Date(item.createdAt).toLocaleString("pt-BR")}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-zinc-400">Nenhuma atividade registrada.</p>
          )}
        </section>
      </main>
    </DashboardLayout>
  );
}
