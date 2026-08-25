import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { EyeOff, Settings } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const settings = trpc.admin.platformSettings.useQuery();
  const utils = trpc.useUtils();
  const updateSettings = trpc.admin.updatePlatformSettings.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.admin.platformSettings.invalidate(), utils.public.platformSettings.invalidate()]);
      toast.success("Configuração atualizada.");
    },
    onError: error => toast.error(error.message),
  });
  const hideExternalPreviewNotice = Boolean(settings.data?.hideExternalPreviewNotice);

  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-5xl space-y-7 p-5 sm:p-8">
        <header className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Sistema</span>
          <h1 className="text-3xl font-semibold text-white">Configurações</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-300">Ajustes gerais da plataforma que não pertencem a um módulo operacional específico.</p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
          <div className="flex items-center gap-3 text-white">
            <span className="grid size-10 place-items-center rounded-xl border border-emerald-300/30 bg-emerald-300/10 text-emerald-200">
              <Settings className="size-5" />
            </span>
            <div>
              <h2 className="font-medium">Preview externo</h2>
              <p className="mt-1 text-sm leading-6 text-zinc-400">Controle o aviso externo de preview sem misturar configurações ao Dashboard.</p>
            </div>
          </div>
          <label className="mt-5 inline-flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-zinc-200">
            <input
              type="checkbox"
              checked={hideExternalPreviewNotice}
              disabled={settings.isLoading || updateSettings.isPending}
              onChange={event => updateSettings.mutate({ hideExternalPreviewNotice: event.target.checked })}
              className="size-4 accent-emerald-300"
            />
            <EyeOff className="size-4 text-emerald-300" />
            Ocultar banner externo de preview
          </label>
        </section>
      </main>
    </DashboardLayout>
  );
}
