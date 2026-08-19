# Validação da navegação do Escritório Virtual

## Resultado

A navegação global do membro foi reorganizada em oito áreas mentais: **Início**, **Minha página**, **Vendas & Rede**, **Divulgação & Contatos**, **Conteúdos & Materiais**, **Academia**, **Desempenho** e **Ajuda**. O catálogo global passou a conter 35 destinos de uso frequente. As rotas individuais de cursos e o conteúdo complementar continuam registrados no roteamento, mas não aparecem mais como dezenas de opções no primeiro nível.

## Integridade funcional

| Verificação | Resultado |
|---|---|
| `pnpm check` | Aprovado; TypeScript sem erros. |
| `pnpm test` | Aprovado; 44 arquivos e 114 testes. |
| `pnpm build` | Aprovado; frontend e bundle do servidor gerados. |
| Teste E2E autenticado | Aprovado em desktop `1440×900` e mobile `390×844`. |
| Grupos globais | Oito grupos encontrados nos dois breakpoints. |
| Cursos individuais no primeiro nível | Não encontrados no menu global. |
| Grupo ativo em `/membros/configuracoes` | `Minha página` aberto. |
| Grupo ativo em `/membros/academia` | `Academia` aberto. |
| Estado dos grupos | Expansão manual permanece estável; a troca de rota abre o grupo correspondente. |
| Teste visual público | Aprovado em desktop, tablet e mobile, sem overflow horizontal. |

## Rotas preservadas

Nenhuma alteração foi feita em `client/src/App.tsx`, `server/routers.ts`, `drizzle/schema.ts`, migrations, autenticação ou regras financeiras. Os paths do catálogo que continuam no menu foram mantidos exatamente. As rotas históricas de cursos individuais, incluindo `/membros/curso/:courseKey`, continuam registradas e acessíveis por contexto da Academia ou compatibilidade, mas não são mais itens globais.

O conflito em que `MemberPerformance` chamava `/membros/historico` de “Histórico de pontos” foi corrigido apenas no label local: a função agora aponta semanticamente para `/membros/pontos-niveis`, enquanto `/membros/historico` permanece exclusivamente associado ao tráfego e às visitas, conforme `App.tsx` e `MemberTraffic.tsx`.

## Comportamento responsivo

No desktop expandido, o grupo da rota atual abre por padrão e os demais começam recolhidos. No sidebar reduzido a ícones, todos os grupos permanecem acessíveis para evitar que itens desapareçam atrás de gatilhos ocultos. No mobile, o mesmo catálogo é usado dentro do drawer. Ao navegar, o drawer fecha e pode ser reaberto normalmente; o grupo correspondente à nova rota abre quando o drawer é reaberto.

## Arquivos de documentação e teste

`docs/member-navigation-inventory.md` registra o diagnóstico da estrutura anterior e dos menus locais. `docs/member-navigation-matrix.md` contém a matriz rota → label → grupo → função. `e2e/member-navigation-check.mjs` valida os oito grupos, a ausência de cursos individuais no menu global e o grupo ativo em desktop e mobile.
