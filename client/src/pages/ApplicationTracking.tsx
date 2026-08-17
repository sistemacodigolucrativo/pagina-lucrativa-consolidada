import { FormEvent, useState } from "react";
import { ArrowRight, ClipboardCheck, Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const labels = { pending: "Pedido registrado", contacted: "Contato iniciado", approved: "Pedido aprovado", archived: "Pedido encerrado" } as const;
export default function ApplicationTracking() {
  const [, setLocation] = useLocation();
  const initialCode = new URLSearchParams(window.location.search).get("codigo") ?? "";
  const [trackingCode, setTrackingCode] = useState(initialCode);
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState<{ trackingCode: string; email: string } | null>(null);
  const lookup = trpc.applications.lookup.useQuery(query!, { enabled: !!query, retry: false });
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setQuery({ trackingCode: trackingCode.trim().toUpperCase(), email: email.trim().toLowerCase() }); setLocation(`/pedido/acompanhar?codigo=${encodeURIComponent(trackingCode.trim().toUpperCase())}`); }
  return <main className="access-page"><div className="access-card"><Link href="/" className="access-back">← Voltar para a Página Lucrativa</Link><div className="access-seal"><ClipboardCheck size={25} /></div><span className="office-eyebrow">Acompanhamento</span><h1>Consulte seu pedido.</h1><p>Informe o código recebido na confirmação e o mesmo e-mail utilizado no formulário.</p><form className="office-form-grid access-form" onSubmit={submit}><label className="office-form-full"><span>Código do pedido</span><input value={trackingCode} onChange={event => setTrackingCode(event.target.value)} required placeholder="PL-XXXXXXXXXXXX" /></label><label className="office-form-full"><span>E-mail utilizado</span><input value={email} onChange={event => setEmail(event.target.value)} required type="email" placeholder="voce@email.com" /></label><button className="btn btn-primary" type="submit"><Search size={16} /> Consultar pedido</button></form>{lookup.isFetching ? <p className="access-note">Consultando o andamento...</p> : lookup.error ? <p className="application-error">Não localizamos um pedido com estes dados.</p> : lookup.data ? <section className="access-steps"><div><b>PL</b><span><strong>{labels[lookup.data.status]}</strong><br />Pedido registrado em {new Date(lookup.data.createdAt).toLocaleDateString("pt-BR")}.</span></div>{lookup.data.adminNote && <div><b>→</b><span>{lookup.data.adminNote}</span></div>}</section> : null}<div className="access-actions"><Link href="/" className="btn btn-ghost">Fazer novo pedido <ArrowRight size={16} /></Link></div></div></main>;
}
