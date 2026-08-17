export type MemberNavigationItem = {
  label: string;
  path: string;
  group: "Operação" | "Crescimento" | "Conta";
};

export const memberNavigation: MemberNavigationItem[] = [
  { label: "Visão geral", path: "/membros", group: "Operação" },
  { label: "Links & campanhas", path: "/membros/campanhas", group: "Operação" },
  { label: "Ganhos", path: "/membros/ganhos", group: "Operação" },
  { label: "Produtos", path: "/membros/produtos", group: "Operação" },
  { label: "Academia", path: "/membros/academia", group: "Crescimento" },
  { label: "Rede & convites", path: "/membros/rede", group: "Crescimento" },
  { label: "Materiais", path: "/membros/materiais", group: "Crescimento" },
  { label: "Ranking", path: "/membros/ranking", group: "Crescimento" },
  { label: "Configurações", path: "/membros/configuracoes", group: "Conta" },
];

export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function formatCompactCount(value: number) {
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}
