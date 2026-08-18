import { useState } from "react";
import { ClipboardList, RefreshCw, Save } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";

const statuses = [
  ["pending", "Novo pedido"], ["contacted", "Contato iniciado"], ["approved", "Aprovado"], ["archived", "Arquivado"],
] as const;

export default function AdminApplications() {
  const utils = trpc.useUtils();
  const applications = trpc.admin.applications.useQuery();
  const update = trpc.admin.updateApplication.useMutation({ onSuccess: () => utils.admin.applications.invalidate() });
  const [notes, setNotes] = useState<Record<number, string>>({});
  return <DashboardLayout menuItems={adminMenu} title="Pedidos públicos" subtitle="Acompanhe as solicitações enviadas pela landing e registre o retorno dado a cada pessoa.">
    <section className="office-section">
      <div className="office-section-head"><div><span className="office-eyebrow">Solicitações</span><h2>Pedidos recebidos</h2><p>Cada mudança de status fica disponível no acompanhamento público pelo código do pedido.</p></div><button className="btn btn-ghost" type="button" onClick={() => applications.refetch()}><RefreshCw size={15} /> Atualizar</button></div>
      {applications.isLoading ? <div className="office-loading"><span>Carregando pedidos</span><i /><i /><i /></div> : applications.error ? <div className="office-empty"><ClipboardList size={25} /><h2>Não foi possível carregar os pedidos.</h2><p>{applications.error.message}</p></div> : !applications.data?.length ? <div className="office-empty"><ClipboardList size={25} /><h2>Nenhum pedido registrado.</h2><p>As solicitações enviadas pelo formulário público aparecerão neste local.</p></div> : <div className="office-stack">{applications.data.map(application => <article className="office-card" key={application.id}><div className="office-card-head"><div><span className="office-list-code">{application.trackingCode || `Pedido #${application.id}`}</span><h3>{application.fullName}</h3><p>{application.email} · {application.whatsapp}</p></div><time>{new Date(application.createdAt).toLocaleString("pt-BR")}</time></div><div className="office-form-grid"><label><span>Status</span><select defaultValue={application.status} onChange={event => update.mutate({ id: application.id, status: event.target.value as "pending" | "contacted" | "approved" | "archived", adminNote: notes[application.id] ?? application.adminNote ?? "" })}>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="office-form-full"><span>Retorno visível no acompanhamento</span><textarea value={notes[application.id] ?? application.adminNote ?? ""} onChange={event => setNotes(current => ({ ...current, [application.id]: event.target.value }))} placeholder="Ex.: Entraremos em contato pelo WhatsApp informado." rows={3} /></label></div><div className="office-card-actions"><button className="btn btn-primary" type="button" disabled={update.isPending} onClick={() => update.mutate({ id: application.id, status: application.status, adminNote: notes[application.id] ?? application.adminNote ?? "" })}><Save size={15} /> {update.isPending ? "Salvando..." : "Salvar retorno"}</button></div></article>)}</div>}
    </section>
  </DashboardLayout>;
}
