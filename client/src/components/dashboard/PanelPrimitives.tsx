import { ArrowUpRight, CircleAlert, HelpCircle, LoaderCircle, type LucideIcon } from "lucide-react";
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

type ObsidianCardProps = {
  title?: string;
  eyebrow?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ObsidianCard({
  title,
  eyebrow,
  description,
  action,
  children,
  className,
}: ObsidianCardProps) {
  return (
    <section className={`obsidian-card${className ? ` ${className}` : ""}`}>
      {(title || eyebrow || description || action) ? (
        <header className="obsidian-card-header">
          <div>
            {eyebrow ? <span className="obsidian-eyebrow">{eyebrow}</span> : null}
            {title ? <h2>{title}</h2> : null}
            {description ? <p>{description}</p> : null}
          </div>
          {action ? <div className="obsidian-card-action">{action}</div> : null}
        </header>
      ) : null}
      <div className="obsidian-card-content">{children}</div>
    </section>
  );
}

export function ObsidianBadge({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
}) {
  return <span className={`obsidian-badge is-${variant}`}>{children}</span>;
}

export function PlaceholderFeatureCard({
  title,
  description,
  icon: Icon = HelpCircle,
  status = "Preparado",
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  status?: string;
}) {
  return (
    <article className="obsidian-placeholder-card">
      <span className="obsidian-placeholder-icon"><Icon aria-hidden="true" /></span>
      <div>
        <ObsidianBadge>{status}</ObsidianBadge>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}

export function ObsidianProgressBars({
  values,
  labels,
}: {
  values: number[];
  labels?: string[];
}) {
  return (
    <div className="obsidian-bars" aria-label="Prévia visual de gráfico">
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className="obsidian-bar-column">
          <span style={{ height: `${Math.max(8, Math.min(100, value))}%` }} />
          {labels?.[index] ? <small>{labels[index]}</small> : null}
        </div>
      ))}
    </div>
  );
}
