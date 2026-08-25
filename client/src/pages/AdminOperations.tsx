import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AdminOperations() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/admin");
  }, [setLocation]);

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-4xl p-5 sm:p-8">
        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Rota legada</span>
          <h1 className="mt-2 text-2xl font-semibold text-white">Módulo administrativo removido</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-300">Esta rota legada não possui operação própria. As rotinas atuais continuam disponíveis nos fluxos específicos do membro e do público, e esta página será redirecionada para o Dashboard.</p>
        </section>
      </main>
    </DashboardLayout>
  );
}
