import { ArrowRight, BadgeCheck, ChevronLeft, Settings2 } from "lucide-react";
import { useLocation } from "wouter";

export default function ApplicationConfirmation() {
  const [location] = useLocation();
  const code = new URLSearchParams(location.split("?")[1] ?? "").get("codigo");
  return <main className="access-page"><div className="access-card"><a href="/" className="access-back"><ChevronLeft size={15} /> Voltar para a Página Lucrativa</a><div className="access-seal"><BadgeCheck size={25} /></div><span className="office-eyebrow">Pedido registrado</span><h1>Recebemos o seu pedido.</h1><p>O próximo passo é aguardar o retorno com as instruções de pagamento e a senha especial para personalizar a sua Página Lucrativa.</p>{code && <p className="access-note">Código para acompanhamento: <strong>{code}</strong></p>}<div className="access-steps"><div><b>01</b><span>Pedido registrado para acompanhamento.</span></div><div><b>02</b><span>Orientação para o pagamento único de R$ 50,00.</span></div><div><b>03</b><span>Senha especial para personalizar sua página.</span></div></div><div className="access-actions"><a className="btn btn-primary" href="/personalizar">Entender a personalização <Settings2 size={16} /></a><a className="btn btn-ghost" href={`/pedido/acompanhar?codigo=${encodeURIComponent(code ?? "")}`}>Acompanhar pedido <ArrowRight size={16} /></a></div></div></main>;
}
