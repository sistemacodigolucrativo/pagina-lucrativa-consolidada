import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { Bell } from "lucide-react";

export default function AdminToast() {
  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-6xl p-4 md:p-8">
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Toast</h1>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            Central de configuração das notificações Toast exibidas nas páginas públicas.
          </p>
        </header>

        <section className="rounded-2xl border bg-card p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold">Configuração do Toast</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Esta área centraliza o gerenciamento do sistema de Toast já existente no projeto. As configurações de conteúdo e comportamento serão administradas aqui sem criar um segundo mecanismo de notificações.
          </p>
          <div className="mt-5 rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
            Estrutura administrativa criada e preparada para receber os controles do Toast público.
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
