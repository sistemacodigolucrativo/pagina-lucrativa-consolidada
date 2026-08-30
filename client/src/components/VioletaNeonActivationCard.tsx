import type { FormEvent } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { PhoneInput } from "@/components/PhoneInput";

type VioletaNeonActivationCardProps = {
  contact: { email: string; whatsapp: string };
  isPending: boolean;
  errorMessage?: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onEmailChange: (value: string) => void;
  onWhatsappChange: (value: string) => void;
};

const benefits = ["Página personalizada", "Escritório Virtual", "Campanhas e pedidos"];

/**
 * Independent public adaptation of the private Preview model 05.
 * This component intentionally does not import or mutate OfferPreviewCard.
 */
export default function VioletaNeonActivationCard({
  contact,
  isPending,
  errorMessage,
  onSubmit,
  onEmailChange,
  onWhatsappChange,
}: VioletaNeonActivationCardProps) {
  return <form className="violeta-neon-activation-card application-form" onSubmit={onSubmit}>
    <div className="violeta-neon-topline"><span>Modelo público · Violeta Neon</span><i /></div>
    <div className="violeta-neon-seal" aria-hidden="true"><span>PL</span><small>ativação</small></div>
    <div className="violeta-neon-price">R$ 50,00 <small>acesso inicial</small></div>
    <h3>Ative sua estrutura digital</h3>
    <p>Solicite o acesso ao Código Lucrativo e siga para os meios de pagamento disponíveis.</p>
    <ul className="violeta-neon-benefits">{benefits.map(item => <li key={item}><Check size={15} /> {item}</li>)}</ul>
    <label className="application-field violeta-neon-field"><span>Nome completo</span><input name="fullName" autoComplete="name" required minLength={3} placeholder="Seu nome completo" /></label>
    <label className="application-field violeta-neon-field"><span>E-mail</span><input name="email" type="email" autoComplete="email" required maxLength={320} value={contact.email} onChange={event => onEmailChange(event.target.value)} placeholder="voce@email.com" /></label>
    <label className="application-field violeta-neon-field"><span>WhatsApp</span><PhoneInput name="whatsapp" required value={contact.whatsapp} onChange={onWhatsappChange} placeholder="(00) 0 0000-0000" /></label>
    {errorMessage ? <p className="application-error violeta-neon-error" role="alert">{errorMessage}</p> : null}
    <button className="violeta-neon-submit" type="submit" disabled={isPending}>{isPending ? "Registrando solicitação..." : "Solicitar ativação"}<ArrowUpRight size={16} /></button>
    <small className="violeta-neon-privacy">Seus dados serão usados para registrar e acompanhar esta solicitação. O formulário não processa o pagamento automaticamente.</small>
  </form>;
}
