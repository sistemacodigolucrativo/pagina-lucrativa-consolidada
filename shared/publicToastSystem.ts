export type PublicToastTemplate = {
  id: string | number;
  title: string;
  message: string;
  disclaimer: string;
};

export type PublicToastSettings = {
  enabled: boolean;
  showSimulationNotice: boolean;
  headerMessage: string;
  footerMessage: string;
  headerColor: string;
  nameColor: string;
  messageColor: string;
  footerColor: string;
  initialDelaySeconds: number;
  intervalMinSeconds: number;
  intervalMaxSeconds: number;
  visibleSeconds: number;
};

export const PUBLIC_TOAST_CATEGORY = "Toast";
export const PUBLIC_TOAST_TEMPLATE_TYPE = "social-proof-template";
export const PUBLIC_TOAST_SETTINGS_TYPE = "social-proof-settings";

export const publicToastDefaultSettings: PublicToastSettings = {
  enabled: true,
  showSimulationNotice: true,
  headerMessage: "Atividade ilustrativa",
  footerMessage: "Demonstração ilustrativa — não representa uma atividade real.",
  headerColor: "#FACC15",
  nameColor: "#38BDF8",
  messageColor: "#FFFFFF",
  footerColor: "#F9A8D4",
  initialDelaySeconds: 12,
  intervalMinSeconds: 22,
  intervalMaxSeconds: 60,
  visibleSeconds: 5,
};

export const publicToastDefaultTemplates: readonly PublicToastTemplate[] = [
  { id: "default-register", title: "Cadastro", message: "{{nome}} acabou de se cadastrar", disclaimer: "Demonstração ilustrativa — não representa uma atividade real." },
  { id: "default-purchase", title: "Aquisição", message: "{{nome}} acabou de adquirir o programa", disclaimer: "Demonstração ilustrativa — não representa uma atividade real." },
  { id: "default-group", title: "Entrada no grupo", message: "{{nome}} entrou para o grupo", disclaimer: "Demonstração ilustrativa — não representa uma atividade real." },
  { id: "default-viewing", title: "Visualização", message: "{{nome}} está visualizando agora", disclaimer: "Demonstração ilustrativa — não representa uma atividade real." },
  { id: "default-start", title: "Início", message: "{{nome}} acabou de iniciar o programa", disclaimer: "Demonstração ilustrativa — não representa uma atividade real." },
  { id: "default-slot", title: "Vaga garantida", message: "{{nome}} acabou de garantir sua vaga", disclaimer: "Demonstração ilustrativa — não representa uma atividade real." },
];

export const publicToastNames = [
  "Ana", "Bruno", "Camila", "Carlos", "Daniel", "Eduardo", "Elaine", "Felipe", "Fernanda", "Gabriel",
  "Isabela", "João", "Julia", "Larissa", "Lucas", "Marcos", "Mariana", "Mateus", "Patricia", "Paulo",
  "Rafael", "Renata", "Ricardo", "Roberta", "Sabrina", "Thiago", "Vanessa", "Vinicius", "Aline", "Amanda",
] as const;

export const publicToastSurnames = [
  "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes",
  "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa",
  "Rocha", "Dias", "Andrade", "Moreira", "Nunes", "Marques", "Machado", "Mendes", "Freitas", "Cardoso",
] as const;

export const publicToastCities = [
  "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Recife", "Salvador", "Fortaleza", "Brasília",
  "Goiânia", "Manaus", "Belém", "Porto Alegre", "Florianópolis", "Campinas", "Natal", "João Pessoa",
] as const;

function normalizeColor(value: unknown, fallback: string) {
  const color = String(value ?? "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color.toUpperCase() : fallback;
}

export function normalizePublicToastSettings(value: Partial<PublicToastSettings> | null | undefined): PublicToastSettings {
  const next = { ...publicToastDefaultSettings, ...(value ?? {}) };
  const initialDelaySeconds = Math.max(1, Math.min(300, Number(next.initialDelaySeconds) || publicToastDefaultSettings.initialDelaySeconds));
  const intervalMinSeconds = Math.max(5, Math.min(600, Number(next.intervalMinSeconds) || publicToastDefaultSettings.intervalMinSeconds));
  const intervalMaxSeconds = Math.max(intervalMinSeconds, Math.min(900, Number(next.intervalMaxSeconds) || publicToastDefaultSettings.intervalMaxSeconds));
  const visibleSeconds = Math.max(2, Math.min(30, Number(next.visibleSeconds) || publicToastDefaultSettings.visibleSeconds));
  return {
    enabled: Boolean(next.enabled),
    showSimulationNotice: Boolean(next.showSimulationNotice),
    headerMessage: String(next.headerMessage ?? publicToastDefaultSettings.headerMessage).trim().slice(0, 120),
    footerMessage: String(next.footerMessage ?? publicToastDefaultSettings.footerMessage).trim().slice(0, 500),
    headerColor: normalizeColor(next.headerColor, publicToastDefaultSettings.headerColor),
    nameColor: normalizeColor(next.nameColor, publicToastDefaultSettings.nameColor),
    messageColor: normalizeColor(next.messageColor, publicToastDefaultSettings.messageColor),
    footerColor: normalizeColor(next.footerColor, publicToastDefaultSettings.footerColor),
    initialDelaySeconds,
    intervalMinSeconds,
    intervalMaxSeconds,
    visibleSeconds,
  };
}
