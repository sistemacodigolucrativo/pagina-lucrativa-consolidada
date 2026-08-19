import { ArrowRight, BadgeCheck, ChevronLeft, Settings2 } from "lucide-react";
import { useLocation } from "wouter";

export default function ApplicationConfirmation() {
  const [location] = useLocation();
  const code = new URLSearchParams(location.split("?")[1] ?? "").get("codigo");
  return <main className="access-page"><div className="access-card"><a href="/" className="access-back"><ChevronLeft size={15} /> Voltar para a Página Lucrativa</a><div className="access-seal"><BadgeCheck size={25} /></div><span className="office-eyebrow">Solicitação registrada</span><h1>Seu pedido de ativação foi registrado.</h1><p>O próximo passo é acompanhar o retorno com as orientações reais sobre pagamento, liberação do acesso e personalização da sua estrutura digital.</p>{code && <p className="access-note">Código para acompanhamento: <strong>{code}</strong></p>}<div className="access-steps"><div><b>01</b><span>Solicitação registrada para acompanhamento.</span></div><div><b>02</b><span>Orientação sobre o pagamento e as condições da ativação.</span></div><div><b>03</b><span>Liberação das instruções de acesso e personalização.</span></div></div><div className="access-actions"><a className="btn btn-primary" href="/personalizar">Conhecer a personalização <Settings2 size={16} /></a><a className="btn btn-ghost" href={`/pedido/acompanhar?codigo=${encodeURIComponent(code ?? "")}`}>Acompanhar solicitação <ArrowRight size={16} /></a></div></div></main>;
}
