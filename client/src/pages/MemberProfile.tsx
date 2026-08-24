import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import GettingStartedReturnButton from "@/components/GettingStartedReturnButton";
import { PhoneInput } from "@/components/PhoneInput";
import { trpc } from "@/lib/trpc";
import { normalizePhone, validatePhoneBR } from "@shared/contactValidation";
import { normalizeHttpUrl, validateHttpUrl } from "@shared/structuredValidation";
import { ImagePlus, Link2, MapPin, Save, Settings, Share2, Upload, UserRoundPen } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

const menu: DashboardMenuItem[] = [
  { icon: Settings, label: "Editar perfil", path: "/membros/configuracoes", group: "Escritório" },
  { icon: Link2, label: "Campanhas", path: "/membros/campanhas", group: "Ferramentas" },
];

const field = "mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white outline-none transition focus:border-emerald-300/70 focus:ring-2 focus:ring-emerald-300/20";
const errorClass = "mt-1 block text-xs text-red-300";
const urlFields = [
  ["websiteUrl", "URL do seu Website"],
  ["facebookUrl", "URL do seu perfil no Facebook"],
  ["instagramUrl", "URL do seu perfil no Instagram"],
  ["twitterUrl", "Twitter"],
  ["linkedinUrl", "Linkedin"],
  ["youtubeUrl", "Youtube"],
] as const;

type ProfileForm = {
  slug: string;
  bio: string;
  whatsapp: string;
  websiteUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  skype: string;
  address: string;
  addressNumber: string;
  addressComplement: string;
  postalCode: string;
  district: string;
  city: string;
  state: string;
};
type ProfileErrors = Partial<Record<keyof ProfileForm | "photoUrl", string>>;

const emptyForm: ProfileForm = {
  slug: "", bio: "", whatsapp: "", websiteUrl: "", facebookUrl: "", instagramUrl: "", twitterUrl: "", linkedinUrl: "", youtubeUrl: "", skype: "",
  address: "", addressNumber: "", addressComplement: "", postalCode: "", district: "", city: "", state: "",
};

export default function MemberProfile() {
  const utils = trpc.useUtils();
  const profile = trpc.member.profile.useQuery();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => {
    if (!profile.data) return;
    setForm({
      slug: profile.data.slug,
      bio: profile.data.bio ?? "",
      whatsapp: normalizePhone(profile.data.whatsapp),
      websiteUrl: profile.data.websiteUrl ?? "",
      facebookUrl: profile.data.facebookUrl ?? "",
      instagramUrl: profile.data.instagramUrl ?? "",
      twitterUrl: profile.data.twitterUrl ?? "",
      linkedinUrl: profile.data.linkedinUrl ?? "",
      youtubeUrl: profile.data.youtubeUrl ?? "",
      skype: profile.data.skype ?? "",
      address: profile.data.address ?? "",
      addressNumber: profile.data.addressNumber ?? "",
      addressComplement: profile.data.addressComplement ?? "",
      postalCode: profile.data.postalCode ?? "",
      district: profile.data.district ?? "",
      city: profile.data.city ?? "",
      state: profile.data.state ?? "",
    });
  }, [profile.data]);

  const saveProfile = trpc.member.updateProfile.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.member.profile.invalidate(), utils.member.overview.invalidate()]);
      toast.success("Perfil atualizado com sucesso.");
    },
    onError: error => toast.error(error.message),
  });

  const uploadPhoto = trpc.member.uploadProfilePhoto.useMutation({
    onSuccess: async () => {
      await utils.member.profile.invalidate();
      toast.success("Foto de perfil atualizada.");
    },
    onError: error => toast.error(error.message),
    onSettled: () => setPhotoBusy(false),
  });

  const updateField = (key: keyof ProfileForm, value: string) => {
    setErrors(current => ({ ...current, [key]: undefined }));
    setForm(current => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: ProfileErrors = {};
    if (!profile.data?.photoUrl) nextErrors.photoUrl = "Envie uma foto de perfil.";
    if (!form.slug.trim()) nextErrors.slug = "Este campo é obrigatório.";
    if (form.slug.trim() && !/^(?=.*[a-z0-9])[a-z0-9-]{3,96}$/.test(form.slug.trim())) nextErrors.slug = "Use letras, números e hífens, com pelo menos 3 caracteres.";
    if (!form.whatsapp.trim()) nextErrors.whatsapp = "Este campo é obrigatório.";
    if (form.whatsapp.trim() && !validatePhoneBR(form.whatsapp)) nextErrors.whatsapp = "Informe um WhatsApp com DDD e 10 ou 11 dígitos.";
    if (!form.address.trim()) nextErrors.address = "Este campo é obrigatório.";
    for (const [key] of urlFields) {
      const value = form[key].trim();
      if (value && !validateHttpUrl(value)) nextErrors[key] = "Informe uma URL válida iniciada por http:// ou https://.";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      toast.error("Corrija os campos indicados antes de salvar.");
      return;
    }
    setErrors({});
    saveProfile.mutate({
      ...form,
      bio: form.bio || null,
      whatsapp: form.whatsapp || null,
      websiteUrl: form.websiteUrl ? normalizeHttpUrl(form.websiteUrl) : null,
      facebookUrl: form.facebookUrl ? normalizeHttpUrl(form.facebookUrl) : null,
      instagramUrl: form.instagramUrl ? normalizeHttpUrl(form.instagramUrl) : null,
      twitterUrl: form.twitterUrl ? normalizeHttpUrl(form.twitterUrl) : null,
      linkedinUrl: form.linkedinUrl ? normalizeHttpUrl(form.linkedinUrl) : null,
      youtubeUrl: form.youtubeUrl ? normalizeHttpUrl(form.youtubeUrl) : null,
      skype: form.skype || null,
      address: form.address || null,
      addressNumber: form.addressNumber || null,
      addressComplement: form.addressComplement || null,
      postalCode: form.postalCode || null,
      district: form.district || null,
      city: form.city || null,
      state: form.state || null,
    });
  };

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      toast.error("Envie uma imagem JPG, PNG ou GIF.");
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error("A foto deve ter no máximo 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setPhotoBusy(true);
      setErrors(current => ({ ...current, photoUrl: undefined }));
      uploadPhoto.mutate({ dataUrl: reader.result, contentType: file.type as "image/jpeg" | "image/png" | "image/gif" });
    };
    reader.onerror = () => toast.error("Não foi possível ler a foto selecionada.");
    reader.readAsDataURL(file);
  };

  return <DashboardLayout menuItems={menu} title="Escritório Virtual"><main className="mx-auto w-full max-w-5xl space-y-6 p-5 sm:p-8">
    <header className="space-y-2"><span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Página personalizada</span><h1 className="text-3xl font-semibold text-white">Editar perfil</h1><p className="max-w-3xl text-sm leading-6 text-zinc-300">Configure os dados públicos exibidos na sua Página Lucrativa.</p></header>
    <aside className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm leading-6 text-emerald-50">Aqui você configura os dados de exibição que aparecerão na sua página pública, acessada através do seu link de indicação.</aside>

    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <form onSubmit={handleSubmit} className="order-2 space-y-6 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 lg:order-1">
        <div className="flex items-center gap-2 text-white"><UserRoundPen size={18} className="text-emerald-300" /><h2 className="font-medium">Informações do perfil</h2></div>
        <label className="block text-sm text-zinc-200">Identificador público *<input required minLength={3} maxLength={96} value={form.slug} onChange={event => updateField("slug", event.target.value.toLowerCase().replace(/\s+/g, "-"))} aria-invalid={Boolean(errors.slug) || undefined} className={field} placeholder="seu-nome" />{errors.slug ? <small className={errorClass} role="alert">{errors.slug}</small> : null}</label>
        <label className="block text-sm text-zinc-200">Descrição sobre você <span className="text-zinc-500">(opcional)</span><textarea maxLength={2000} value={form.bio} onChange={event => updateField("bio", event.target.value)} className={`${field} min-h-32`} placeholder="Como você quer se apresentar em sua página?" /></label>
        <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm text-zinc-200">WhatsApp público *<PhoneInput required value={form.whatsapp} onChange={whatsapp => updateField("whatsapp", whatsapp)} className={field} placeholder="DDD e Número" />{errors.whatsapp ? <small className={errorClass} role="alert">{errors.whatsapp}</small> : null}</label><label className="text-sm text-zinc-200">Skype <span className="text-zinc-500">(opcional)</span><input value={form.skype} onChange={event => updateField("skype", event.target.value)} className={field} placeholder="Seu Skype" maxLength={255} /></label></div>

        <section className="space-y-4 border-t border-white/10 pt-5"><div className="flex items-center gap-2 text-white"><Share2 size={18} className="text-emerald-300" /><h2 className="font-medium">Redes e links</h2></div><p className="text-sm leading-6 text-zinc-400">Esses links são opcionais, mas precisam usar uma URL válida quando preenchidos.</p><div className="grid gap-3 sm:grid-cols-2">{urlFields.map(([key, label]) => <label key={key} className="text-sm text-zinc-200">{label} <span className="text-zinc-500">(opcional)</span><input type="url" value={form[key]} onChange={event => updateField(key, event.target.value)} aria-invalid={Boolean(errors[key]) || undefined} className={field} placeholder="http://" maxLength={512} />{errors[key] ? <small className={errorClass} role="alert">{errors[key]}</small> : null}</label>)}</div></section>

        <section className="space-y-4 border-t border-white/10 pt-5"><div className="flex items-center gap-2 text-white"><MapPin size={18} className="text-emerald-300" /><h2 className="font-medium">Endereço</h2></div><p className="text-sm leading-6 text-zinc-400">Os dados de endereço são usados apenas para controle do cadastro e não serão exibidos na página pública.</p><label className="block text-sm text-zinc-200">Endereço (Rua, Avenida, etc) *<input value={form.address} onChange={event => updateField("address", event.target.value)} aria-invalid={Boolean(errors.address) || undefined} className={field} maxLength={255} />{errors.address ? <small className={errorClass} role="alert">{errors.address}</small> : null}</label><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm text-zinc-200">Número <span className="text-zinc-500">(opcional)</span><input value={form.addressNumber} onChange={event => updateField("addressNumber", event.target.value)} className={field} maxLength={32} /></label><label className="text-sm text-zinc-200">Complemento <span className="text-zinc-500">(opcional)</span><input value={form.addressComplement} onChange={event => updateField("addressComplement", event.target.value)} className={field} maxLength={160} /></label><label className="text-sm text-zinc-200">CEP <span className="text-zinc-500">(opcional)</span><input value={form.postalCode} onChange={event => updateField("postalCode", event.target.value)} className={field} placeholder="00000-000" maxLength={20} /></label><label className="text-sm text-zinc-200">Bairro <span className="text-zinc-500">(opcional)</span><input value={form.district} onChange={event => updateField("district", event.target.value)} className={field} maxLength={120} /></label><label className="text-sm text-zinc-200">Cidade <span className="text-zinc-500">(opcional)</span><input value={form.city} onChange={event => updateField("city", event.target.value)} className={field} maxLength={120} /></label><label className="text-sm text-zinc-200">Estado <span className="text-zinc-500">(opcional)</span><input value={form.state} onChange={event => updateField("state", event.target.value)} className={field} maxLength={80} /></label></div></section>

        <button type="submit" disabled={saveProfile.isPending || profile.isLoading} className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"><Save size={16} />{saveProfile.isPending ? "Salvando..." : "Salvar perfil"}</button>
      </form>

      <aside className="order-1 space-y-4 lg:order-2"><section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5"><div className="flex items-center gap-2 text-white"><ImagePlus size={18} className="text-emerald-300" /><h2 className="font-medium">Foto pessoal *</h2></div><p className="mt-3 text-sm leading-6 text-zinc-400">JPG, PNG ou GIF, com até 1 MB. Obrigatória para concluir a Etapa 1.</p>{profile.data?.photoUrl ? <img src={profile.data.photoUrl} alt="Foto do perfil" className="mt-4 aspect-square w-full rounded-xl border border-white/10 object-cover" /> : <div className="mt-4 flex aspect-square items-center justify-center rounded-xl border border-dashed border-white/15 text-sm text-zinc-500">Nenhuma foto enviada</div>}{errors.photoUrl ? <small className={errorClass} role="alert">{errors.photoUrl}</small> : null}<label className="mt-4 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-emerald-300 px-3 py-2 text-sm font-semibold text-black"><Upload size={16} />{photoBusy ? "Enviando..." : "Enviar foto"}<input type="file" accept="image/jpeg,image/png,image/gif" className="sr-only" disabled={photoBusy} onChange={handlePhoto} /></label></section><section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 text-sm leading-6 text-zinc-400"><div className="flex items-center gap-2 text-white"><Link2 size={18} className="text-emerald-300" /><h2 className="font-medium">Perfil do Autor</h2></div><p className="mt-3">Descrição, WhatsApp, Website e redes sociais ficam associados ao seu perfil público e podem ser usados nas áreas editoriais autorizadas.</p></section></aside>
    </section>
  </main><GettingStartedReturnButton /></DashboardLayout>;
}
