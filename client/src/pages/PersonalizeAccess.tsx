import { ArrowRight, Settings2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { withAppBase } from "@/lib/devPath";

export default function PersonalizeAccess() {
  const { isAuthenticated, loading } = useAuth();
  return <main className="access-page"><div className="access-card"><a href={withAppBase("/")} className="access-back">← Voltar para a Página Lucrativa</a><div className="access-seal"><Settings2 size={25} /></div><span className="office-eyebrow">Ativação e personalização</span><h1>Agora, configure sua estrutura.</h1><p>Depois da liberação, o Escritório Virtual orienta os primeiros passos para você personalizar sua presença, organizar sua operação e começar a utilizar os recursos disponíveis.</p><div className="access-steps"><div><b>01</b><span>Entre com a conta autorizada para o seu acesso.</span></div><div><b>02</b><span>Complete seu perfil e configure os dados da sua operação.</span></div><div><b>03</b><span>Conheça a oferta, aprenda a divulgar e crie seu primeiro caminho de campanha.</span></div><div><b>04</b><span>Acompanhe visitas, contatos, pedidos e registros conforme sua operação gerar atividade.</span></div></div>{loading ? <p className="access-loading">Verificando acesso…</p> : isAuthenticated ? <a className="btn btn-primary" href={withAppBase("/membros/configuracoes")}>Abrir meu Escritório Virtual <ArrowRight size={16} /></a> : <a className="btn btn-primary" href={withAppBase("/acesso")}>Entrar para personalizar <ShieldCheck size={16} /></a>}</div></main>;
}
