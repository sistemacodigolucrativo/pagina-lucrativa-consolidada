import { ArrowRight, ClipboardCheck, Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { normalizeEmail } from "@shared/contactValidation";

const labels = { pending: "Solicitação registrada", contacted: "Orientação iniciada", approved: "Ativação aprovada", archived: "Solicitação encerrada" } as const;

export default function ApplicationTracking() {
  const [, setLocation] = useLocation();
  const initialCode = new URLSearchParams(window.location.search).get("codigo") ?? "";
  const [trackingCode, setTrackingCode] = useState(initialCode);
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState<{ trackingCode: string; email: string } | null>(null);
  const lookup = trpc.applications.lookup.useQuery(query!, { enabled: !!query, retry: false });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextCode = trackingCode.trim().toUpperCase();
    const nextEmail = normalizeEmail(email);
    setQuery({ trackingCode: nextCode, email: nextEmail });
    setLocation(`/pedido/acompanhar?codigo=${encodeURIComponent(nextCode)}`);
  }
  return <main className="access-page"><div className="access-card"><Link href="/" className="access-back">← Voltar para a Página Lucrativa</Link><div className="access-seal"><ClipboardCheck size={25} /></div><span className="office-eyebrow">Acompanhamento da ativação</span><h1>Acompanhe sua solicitação.</h1><p>Informe o código recebido na confirmação e o mesmo e-mail utilizado no formulário para consultar o status do pedido e as orientações administrativas disponíveis.</p><form className="office-form-grid access-form" onSubmit={submit}><label className="office-form-full"><span>Código da solicitação</span><input value={trackingCode} onChange={event => setTrackingCode(event.target.value)} required placeholder="PL-XXXXXXXXXXXX" /></label><label className="office-form-full"><span>E-mail utilizado</span><input value={email} onChange={event => setEmail(normalizeEmail(event.target.value))} required maxLength={320} type="email" autoComplete="email" placeholder="voce@email.com" /></label><button className="btn btn-primary" type="submit"><Search size={16} /> Consultar status</button></form>{lookup.isFetching ? <p className="access-note">Consultando o andamento da solicitação...</p> : lookup.error ? <p className="application-error">Não localizamos uma solicitação com estes dados.</p> : lookup.data ? <section className="access-steps"><div><b>PL</b><span><strong>{labels[lookup.data.status]}</strong><br />Registrada em {new Date(lookup.data.createdAt).toLocaleDateString("pt-BR")}.</span></div>{lookup.data.adminNote && <div><b>→</b><span>{lookup.data.adminNote}</span></div>}</section> : null}<div className="access-actions"><Link href="/" className="btn btn-ghost">Voltar à estrutura <ArrowRight size={16} /></Link></div></div></main>;
}
