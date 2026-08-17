import { Settings2, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";

export default function PersonalizeAccess() {
  const { isAuthenticated, loading } = useAuth();
  return <main className="access-page"><div className="access-card"><a href="/" className="access-back">← Voltar para a Página Lucrativa</a><div className="access-seal"><Settings2 size={25} /></div><span className="office-eyebrow">Personalizar</span><h1>Sua página, do seu jeito.</h1><p>A personalização é a etapa seguinte ao pedido aprovado. Entre no Escritório Virtual para configurar sua presença e acompanhar sua operação.</p><div className="access-steps"><div><b>01</b><span>Entre com a conta autorizada.</span></div><div><b>02</b><span>Acesse Configurações no seu Escritório Virtual.</span></div><div><b>03</b><span>Organize os dados da sua página e seus materiais.</span></div></div>{loading ? <p className="access-loading">Verificando acesso…</p> : isAuthenticated ? <a className="btn btn-primary" href="/membros/configuracoes">Abrir configurações <ArrowRight size={16} /></a> : <button className="btn btn-primary" type="button" onClick={startLogin}>Entrar para personalizar <ShieldCheck size={16} /></button>}</div></main>;
}
