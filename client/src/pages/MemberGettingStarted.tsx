import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { withAppBase } from "@/lib/devPath";
import { trpc } from "@/lib/trpc";
import { BarChart3, Check, Circle, CreditCard, ExternalLink, Link2, MousePointerClick, UserRound, WalletCards } from "lucide-react";

const menu: DashboardMenuItem[] = [
  { icon: Circle, label: "Primeiros passos", path: "/membros/como-divulgar", group: "Início" },
  { icon: BarChart3, label: "Central de Divulgação", path: "/membros/operacao", group: "Início" },
  { icon: UserRound, label: "Minha página e perfil", path: "/membros/configuracoes", group: "Minha página" },
];

type Step = {
  title: string;
  description: string;
  path: string;
  action: string;
  done: boolean;
  icon: React.ReactNode;
};

export default function MemberGettingStarted() {
  const profile = trpc.member.profile.useQuery();
  const receiving = trpc.member.receiving.useQuery();
  const campaigns = trpc.member.campaigns.useQuery();
  const analytics = trpc.member.analytics.useQuery({ period: "all" });

  const profileReady = Boolean(profile.data?.slug && (profile.data?.bio || profile.data?.whatsapp));
  const receivingReady = Boolean(receiving.data?.method && (receiving.data?.receivingKey || receiving.data?.pixKey || receiving.data?.paypalEmail || receiving.data?.pagseguroEmail || receiving.data?.bank1Account));
  const operationReady = Boolean(campaigns.data?.length);
  const firstClick = (analytics.data?.totals.clicks ?? 0) > 0;
  const firstConversion = (analytics.data?.totals.conversions ?? 0) > 0;

  const steps: Step[] = [
    {
      title: "Configure sua Página Lucrativa",
      description: "Defina seu identificador público, apresentação e os dados que serão exibidos na sua página.",
      path: "/membros/configuracoes",
      action: profileReady ? "Revisar minha página" : "Configurar minha página",
      done: profileReady,
      icon: <UserRound className="size-5" />,
    },
    {
      title: "Configure seus recebimentos",
      description: "Informe como os recebimentos vinculados às suas campanhas devem ser tratados.",
      path: "/membros/recebimentos",
      action: receivingReady ? "Revisar recebimentos" : "Configurar recebimentos",
      done: receivingReady,
      icon: <WalletCards className="size-5" />,
    },
    {
      title: "Crie sua primeira campanha de divulgação",
      description: "Crie um link rastreável para Facebook, Instagram, WhatsApp ou qualquer outra origem que você queira medir.",
      path: "/membros/operacao/campanhas",
      action: operationReady ? "Ver minhas campanhas" : "Criar primeira campanha",
      done: operationReady,
      icon: <Link2 className="size-5" />,
    },
    {
      title: "Faça sua primeira divulgação",
      description: "Copie o link de uma campanha e divulgue. O sistema registrará os acessos automaticamente.",
      path: "/membros/operacao/campanhas",
      action: "Abrir minhas campanhas",
      done: firstClick,
      icon: <MousePointerClick className="size-5" />,
    },
    {
      title: "Acompanhe suas métricas",
      description: "Compare métricas globais e o desempenho de cada campanha.",
      path: "/membros/operacao",
      action: "Ver métricas globais",
      done: firstClick,
      icon: <BarChart3 className="size-5" />,
    },
    {
      title: "Conquiste sua primeira conversão",
      description: "Divulgue sua Página Lucrativa e conquiste sua primeira conversão através de uma das suas campanhas. Esta etapa será concluída automaticamente quando o sistema registrar seu primeiro resultado.",
      path: "/membros/operacao/conversoes",
      action: "Acompanhar conversões",
      done: firstConversion,
      icon: <CreditCard className="size-5" />,
    },
  ];

  const completed = steps.filter(step => step.done).length;
  const percentage = Math.round((completed / steps.length) * 100);

  return (
    <DashboardLayout menuItems={menu} title="Escritório Virtual">
      <main className="mx-auto w-full max-w-6xl space-y-7 p-5 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Sua jornada</span>
          <h1 className="text-3xl font-semibold text-white">Primeiros passos</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">O sistema identifica o que você já concluiu e direciona para a próxima etapa. Aqui você não configura tudo de novo: cada botão leva à ferramenta correta.</p>
        </header>

        <section className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-emerald-100">Progresso da configuração</p>
              <strong className="mt-1 block text-3xl text-white">{percentage}%</strong>
              <p className="mt-1 text-sm text-zinc-300">{completed} de {steps.length} etapas concluídas</p>
            </div>
            {profile.data?.slug ? <a href={withAppBase(`/?afiliado=${encodeURIComponent(profile.data.slug)}`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/40 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-300/10"><ExternalLink className="size-4" />Visualizar minha página</a> : null}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/40"><div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: `${percentage}%` }} /></div>
        </section>

        <section className="space-y-3">
          {steps.map((step, index) => (
            <article key={step.title} className={`rounded-2xl border p-5 ${step.done ? "border-emerald-300/20 bg-emerald-300/5" : "border-white/10 bg-zinc-950/60"}`}>
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 gap-4">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${step.done ? "bg-emerald-300 text-black" : "bg-white/5 text-zinc-300"}`}>{step.done ? <Check className="size-5" /> : step.icon}</div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-500">Etapa {index + 1}</p>
                    <h2 className="mt-1 font-medium text-white">{step.title}</h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-400">{step.description}</p>
                  </div>
                </div>
                <a href={withAppBase(step.path)} className={`shrink-0 rounded-lg px-4 py-2 text-center text-sm font-semibold ${step.done ? "border border-white/15 text-zinc-200 hover:bg-white/5" : "bg-emerald-300 text-black"}`}>{step.action}</a>
              </div>
            </article>
          ))}
        </section>
      </main>
    </DashboardLayout>
  );
}
