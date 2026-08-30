import { ArrowUpRight, CircleAlert, LoaderCircle, type LucideIcon } from "lucide-react";
import type { ReactNode, KeyboardEvent } from "react";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  detail: string;
  action?: ReactNode;
};

export function SectionHeader({ eyebrow, title, detail, action }: SectionHeaderProps) {
  return (
    <header className="office-intro">
      <div>
        <span className="office-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{detail}</p>
      </div>
      {action ? <div className="office-intro-action">{action}</div> : null}
    </header>
  );
}

type MetricCardProps = {
  label: string;
  value: ReactNode;
  detail: string;
  icon?: LucideIcon;
  onActivate?: () => void;
  ariaLabel?: string;
  onClick?: () => void;
  "aria-label"?: string;
};

export function MetricCard({ label, value, detail, icon: Icon, onActivate, ariaLabel, onClick, "aria-label": accessibleLabel }: MetricCardProps) {
  const activate = onActivate ?? onClick;
  const interactive = Boolean(activate);
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!activate || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    activate();
  };

  return (
    <article
      className={`office-metric-card${interactive ? " is-interactive" : ""}`}
      role={interactive ? "link" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? ariaLabel ?? accessibleLabel : undefined}
      onClick={activate}
      onKeyDown={onKeyDown}
    >
      <div className="office-metric-heading">
        <span>{label}</span>
        {Icon ? <Icon aria-hidden="true" /> : null}
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
      {interactive ? <ArrowUpRight className="office-metric-arrow" aria-hidden="true" /> : null}
    </article>
  );
}

export function LoadingPanel({ label = "Carregando seu escritório" }: { label?: string }) {
  return (
    <div className="office-loading" role="status" aria-live="polite">
      <LoaderCircle aria-hidden="true" />
      <span>{label}</span>
      <i />
      <i />
      <i />
    </div>
  );
}

export function StatePanel({
  title,
  message,
  error = false,
}: {
  title: string;
  message: string;
  error?: boolean;
}) {
  const Icon = error ? CircleAlert : ArrowUpRight;
  return (
    <section className={`office-empty${error ? " is-error" : ""}`} role={error ? "alert" : undefined}>
      <span className="office-empty-mark"><Icon aria-hidden="true" /></span>
      <h2>{title}</h2>
      <p>{message}</p>
    </section>
  );
}
