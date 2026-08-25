import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { Megaphone, UsersRound } from "lucide-react";
import { toast } from "sonner";

type ContactStatus = "new" | "contacted" | "qualified" | "archived";

const statusLabels: Record<ContactStatus, string> = {
  new: "Novo",
  contacted: "Contatado",
  qualified: "Qualificado",
  archived: "Arquivado",
};

export default function AdminOutreach() {
  const utils = trpc.useUtils();
  const contacts = trpc.admin.contacts.useQuery();
  const updateContact = trpc.admin.updateContact.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.admin.contacts.invalidate(), utils.admin.activities.invalidate(), utils.member.contacts.invalidate()]);
      toast.success("Status do contato atualizado.");
    },
    onError: error => toast.error(error.message),
  });

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Comercial</span>
          <h1 className="text-3xl font-semibold text-white">Divulgação</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">Supervisione contatos captados pela Central de Divulgação. Campanhas pessoais continuam sob controle do próprio membro.</p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-white">
            <Megaphone className="size-5 text-emerald-300" />
            <h2 className="font-medium">Contatos captados</h2>
          </div>
          {contacts.isLoading ? (
            <p className="text-sm text-zinc-400">Carregando contatos...</p>
          ) : contacts.data?.length ? (
            <div className="space-y-3">
              {contacts.data.map(item => (
                <article key={item.id} className="rounded-xl border border-white/10 bg-black/25 p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div className="min-w-0">
                      <span className="text-xs uppercase tracking-wider text-emerald-200">{statusLabels[item.status]}</span>
                      <h3 className="mt-1 font-medium text-white">{item.name}</h3>
                      <p className="text-sm text-zinc-400">{item.email}{item.whatsapp ? ` · ${item.whatsapp}` : ""}</p>
                      <p className="mt-1 text-xs text-emerald-200">Origem: {item.source} · consentimento em {new Date(item.consentAt).toLocaleDateString("pt-BR")}</p>
                      {item.consentNote ? <p className="mt-2 text-sm text-zinc-300">{item.consentNote}</p> : null}
                    </div>
                    <select
                      value={item.status}
                      onChange={event => updateContact.mutate({ id: item.id, status: event.target.value as ContactStatus })}
                      disabled={updateContact.isPending}
                      className="h-10 rounded-lg border border-white/15 bg-black px-3 text-sm text-white"
                    >
                      <option value="new">Novo</option>
                      <option value="contacted">Contatado</option>
                      <option value="qualified">Qualificado</option>
                      <option value="archived">Arquivado</option>
                    </select>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm leading-6 text-zinc-400">Nenhum contato captado foi registrado.</p>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 text-sm leading-6 text-zinc-300">
          <div className="flex items-center gap-2 text-white">
            <UsersRound className="size-5 text-emerald-300" />
            <h2 className="font-medium">Escopo administrativo</h2>
          </div>
          <p className="mt-3">Esta área acompanha contatos e estados globais. A criação e edição de campanhas permanecem no painel do membro.</p>
        </section>
      </main>
    </DashboardLayout>
  );
}
