# Integração dos templates Obsidian aos painéis

Branch de trabalho: `layout-paineis-demo`.

Fonte do template: `/home/ubuntu/untitled (4).zip`.

Escopo: substituir visualmente os painéis administrativo e de membros do Página Lucrativa, sem criar projeto separado e sem remover regras de negócio, rotas, permissões, autenticação, APIs ou dados reais.

## Mapeamento aplicado

| Situação | Página Lucrativa | Template Obsidian | Decisão |
|---|---|---|---|
| A | Dashboard admin, métricas de membros, publicações, cursos, suporte e depoimentos | Cockpit executivo, cards métricos, log e gráfico | Métricas reais preservadas; componentes visuais Obsidian adicionados ao `AdminOffice`. |
| A | Menu admin por grupos | Menu admin Obsidian por categorias | Grupos atuais preservados e estilizados pelo shell Obsidian. |
| A | Visão geral do membro, link de indicação, ganhos, rede, academia | Member dashboard, hub, cards de aprendizado e performance | Dados reais preservados; cards visuais Obsidian integrados ao `MemberOffice`. |
| A | Cursos publicados via tRPC | Card “Continuar Aprendendo” | O card usa curso real quando disponível e mostra placeholder seguro quando não houver dados. |
| B | Rotas reais de pedidos, recebimento, depoimento, perfil, suporte, e-books, pontos e campanhas | Algumas telas não aparecem com a mesma granularidade | Rotas e páginas existentes foram mantidas. O layout comum aplica a identidade Obsidian sem esconder funcionalidades. |
| B | Rotas administrativas auxiliares e legadas | Não há equivalência direta no protótipo | As rotas permanecem no `App.tsx`; nenhuma funcionalidade foi removida. |
| C | Filtros avançados, exportação de relatórios, gráficos históricos e saque | Existem no template como botões/cards/áreas previstas | Placeholders visuais preservados desabilitados ou sem backend inventado. |
| C | Progresso detalhado por aula e gráficos históricos do membro | Existem como placeholders do template | Componentes visuais mantidos com indicação de preparação futura. |

## Arquivos envolvidos

- `client/src/components/DashboardLayout.tsx`: shell autenticado real preservado.
- `client/src/components/dashboard/PanelPrimitives.tsx`: primitivas Obsidian adicionadas para uso incremental.
- `client/src/c1-obsidian-emerald.css`: camada visual Obsidian isolada no dashboard autenticado.
- `client/src/pages/AdminOffice.tsx`: cockpit admin com dados reais e placeholders preservados.
- `client/src/pages/MemberOffice.tsx`: visão do membro com dados reais e placeholders preservados.
- `client/src/App.tsx`: rotas reais preservadas.

## Regras preservadas

- Obsidian é interface/template, não projeto separado.
- Nenhuma chave, token ou credencial foi adicionada.
- Nenhuma rota real foi removida.
- Nenhum backend novo foi inventado para placeholders.
- Funcionalidades existentes continuam usando tRPC e componentes reais do Página Lucrativa.
