import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { CalendarClock, ServerCog } from "lucide-react";

export default function AdminFutureImplementations() {
  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-6xl p-4 md:p-8">
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <CalendarClock className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Futuras Implementações</h1>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            Central administrativa para registrar e acompanhar melhorias planejadas para o projeto.
          </p>
        </header>

        <section className="rounded-2xl border bg-card p-5 shadow-sm md:p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl border bg-muted/40 p-3">
              <ServerCog className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">Bootstrap automático da VPS</h2>
                <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">Planejado</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Criar um processo seguro e reproduzível para preparar uma nova VPS Ubuntu para receber o projeto e o fluxo de Auto Deploy, reduzindo a necessidade de configuração manual em futuras migrações de servidor.
              </p>
              <div className="mt-4 rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                Implementação futura: script de bootstrap/provisionamento, validações idempotentes, configuração do ambiente de deploy e documentação de migração.
              </div>
            </div>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
