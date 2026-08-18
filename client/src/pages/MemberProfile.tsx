import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { PhoneInput } from "@/components/PhoneInput";
import { trpc } from "@/lib/trpc";
import { normalizePhone } from "@shared/contactValidation";
import { normalizeHttpUrl } from "@shared/structuredValidation";
import { Link2, Save, Settings, UserRoundPen } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

const menu: DashboardMenuItem[] = [
  { icon: Settings, label: "Editar perfil", path: "/membros/configuracoes", group: "Escritório" },
  { icon: Link2, label: "Campanhas", path: "/membros/campanhas", group: "Ferramentas" },
];

const field = "mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white";

export default function MemberProfile() {
  const utils = trpc.useUtils();
  const profile = trpc.member.profile.useQuery();
  const [form, setForm] = useState({ slug: "", bio: "", whatsapp: "", websiteUrl: "" });

  useEffect(() => {
    if (!profile.data) return;
    setForm({
      slug: profile.data.slug,
      bio: profile.data.bio ?? "",
      whatsapp: normalizePhone(profile.data.whatsapp),
      websiteUrl: profile.data.websiteUrl ?? "",
    });
  }, [profile.data]);

  const saveProfile = trpc.member.updateProfile.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.member.profile.invalidate(), utils.member.overview.invalidate()]);
      toast.success("Perfil público atualizado.");
    },
    onError: error => toast.error(error.message),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveProfile.mutate({
      ...form,
      bio: form.bio || null,
      whatsapp: form.whatsapp || null,
      websiteUrl: form.websiteUrl ? normalizeHttpUrl(form.websiteUrl) : null,
    });
  };

  return <DashboardLayout menuItems={menu} title="Escritório Virtual"><main className="mx-auto w-full max-w-4xl space-y-6 p-5 sm:p-8">
    <header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-amber-300">Página personalizada</span><h1 className="text-3xl font-semibold text-white">Editar perfil</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Defina exclusivamente as informações que podem aparecer na sua página pública personalizada e nos seus links de divulgação.</p></header>
    <aside className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-50">Os dados cadastrais privados da conta ficam separados em <strong>Meus dados</strong>. Dados de recebimento são configurados em sua própria área.</aside>
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="flex items-center gap-2 text-white"><UserRoundPen size={18} className="text-amber-300" /><h2 className="font-medium">Perfil público</h2></div>
      <label className="block text-sm text-zinc-200">Identificador público<input required minLength={3} maxLength={96} value={form.slug} onChange={event => setForm({ ...form, slug: event.target.value.toLowerCase().replace(/\s+/g, "-") })} className={field} placeholder="seu-nome" /></label>
      <label className="block text-sm text-zinc-200">Apresentação<textarea maxLength={2000} value={form.bio} onChange={event => setForm({ ...form, bio: event.target.value })} className={`${field} min-h-28`} placeholder="Como você quer se apresentar em sua página?" /></label>
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm text-zinc-200">WhatsApp público<PhoneInput value={form.whatsapp} onChange={whatsapp => setForm({ ...form, whatsapp })} className={field} placeholder="(00) 0 0000-0000" /></label><label className="text-sm text-zinc-200">Website público<input type="url" value={form.websiteUrl} onChange={event => setForm({ ...form, websiteUrl: event.target.value })} className={field} placeholder="https://" /></label></div>
      <button disabled={saveProfile.isPending} className="inline-flex items-center gap-2 rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"><Save size={16} />{saveProfile.isPending ? "Salvando..." : "Salvar perfil público"}</button>
    </form>
  </main></DashboardLayout>;
}
