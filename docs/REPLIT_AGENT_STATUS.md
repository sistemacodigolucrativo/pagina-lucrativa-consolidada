# Status do desenvolvimento — Página Pública de Vendas

## Objetivo

Executar a documentação em `DESENVOLVIMENTO DE LAYOUT/` de forma incremental, preservando a arquitetura e os templates existentes. A regra central é manter conteúdo e funcionalidades comerciais compartilhados entre apresentações visuais.

## Estado inicial e escopo lido

- Instruções anteriores do projeto: `replit.md` não existia; criado nesta execução.
- Estado local antes das alterações: branch `main`, árvore de trabalho limpa.
- Documentação externa consultada integralmente: índice e arquivos 01 a 05 de `DESENVOLVIMENTO DE LAYOUT`.
- Scripts disponíveis: `pnpm check`, `pnpm build`, `pnpm test`; execução de testes e build ainda não realizada.
- `architecture.md` define `/` como landing pública e separa os painéis de membro e administração.
- Não foi lido nem conectado ao banco remoto nesta etapa; nenhum dado foi alterado.

## Decisões de execução

1. Seguir as fases na ordem recomendada, sem reescrever `Home.tsx` ou substituir templates por aproximações.
2. Primeiro verificar o fluxo, persistência e templates efetivamente existentes; adaptar as fases ao código atual, não presumir que o mapeamento remoto representa fielmente esta branch.
3. Preservar `official` e `premium` e o comportamento comercial existente.
4. Não declarar critérios visuais, administrativos ou comerciais aprovados sem executar as verificações correspondentes.

## Etapa 0 — Baseline e diagnóstico

**Status:** concluída.

### Feito

- Confirmada a branch local `main` sem alterações pré-existentes.
- Confirmada a ausência do `replit.md` e do presente arquivo de status no início.
- Lidos integralmente os seis documentos do diretório externo: `00-INDICE.md` a `05-CHECKLIST-DE-VALIDACAO.md`.
- Identificados os entregáveis de arquitetura prescritos: snapshot de conteúdo, registry de templates, breakpoints canônicos, resolução desktop-on-mobile e editor por IDs estáveis.
- Inspecionados `PublicHome`, `Home`, os contratos compartilhados de copy/template/layout, o runtime público/editor, o painel de imagens/layout, CSS importado e o endpoint de configuração.
- Baseline visual capturado em 1440×1000 e 390×844. Em ambos, a home carrega com os mesmos blocos e sem erro de console; a captura desktop mostra hero em uma coluna com a imagem abaixo do título e espaço visual amplo à direita. A captura mobile mostra o header compacto, hero empilhado e CTA abaixo da dobra.
- Consulta GET somente leitura a `/api/public-sales-copy` confirmou template ativo `official`, nenhuma seção de override, layout flutuante ou layout visual salvo e editor visual desativado. Nenhum dado foi gravado.
- O código efetivo mantém o conteúdo/comportamento da home em `Home.tsx`; `PublicHome` troca `official` por `premium` com um wrapper CSS sobre a mesma página.
- Breakpoints do runtime (`mobile` até 560px, `tablet` até 980px), cabeçalho compacto (900px), CSS da página e breakpoints de prévia administrativa não seguem um único contrato.
- O editor já persiste layout separado por template/breakpoint e implementa interações próprias; alvos editáveis são identificados pelo par de campo lógico e mapeados ao DOM por seletores configurados. Portanto, não será reescrito antes de auditar exatamente as lacunas e a compatibilidade com os dados existentes.
- `pnpm check` passou depois de restaurar dependências.
- `pnpm test` executou 314 testes: 311 passaram e 3 falharam em duas suítes; pelo menos duas falhas de `server/publicHeader.responsive.test.ts` esperam markup de CTA antigo que não existe no `Home.tsx` atual. Como nenhum arquivo de produção da página foi alterado, isso fica registrado como falha preexistente da baseline.
- Para recuperar a validação sem instalar versões recusadas pelo firewall, foram atualizados `@tailwindcss/vite` para 4.3.3 e Vitest para 5.0.3; `pdfjs-dist` continuou em 4.10.38. O instalador resolveu o lockfile inteiro para as versões compatíveis atuais, embora só os dois ranges diretos acima tenham mudado no manifesto.
- O workflow reiniciou automaticamente após o ajuste de pacotes; log confirma o servidor na porta 5000 sem erro de inicialização. O aviso de peer do `@builder.io/vite-plugin-jsx-loc` (espera Vite 4/5, projeto usa Vite 7) permanece registrado como preexistente e não foi alterado nesta tarefa.

### Arquivos alterados

- `replit.md` (criado e complementado com contexto técnico/padrões).
- `docs/REPLIT_AGENT_STATUS.md` (criado e atualizado).
- `docs/visual-checks/public-sales-baseline-desktop-1440.jpg` (captura preservada).
- `docs/visual-checks/public-sales-baseline-mobile-390.jpg` (captura preservada).
- `.agents/memory/replit-package-registry.md` (regra corrigida para não contornar bloqueio de segurança).
- `package.json` e `pnpm-lock.yaml` (atualização de dependências necessária à validação segura).

### Testes executados

- `pnpm check`: passou.
- `pnpm test`: 311 passaram, 3 falharam como descrito acima.
- Instalação inicial das versões declaradas falhou no registry interno (`vitest@2.1.9`).
- A atualização segura de `@tailwindcss/vite` e Vitest concluiu; o lockfile agora não mantém o pacote transitivo `tar` vulnerável que causava o bloqueio.
- Verificação read-only de branch/estado, leitura de `architecture.md`/scripts, duas capturas do preview e GET público somente leitura das chaves de configuração.
- Console do browser nas duas capturas: conexão Vite e aviso de React DevTools; nenhum erro crítico.

### Erros encontrados

- Na baseline, três testes falharam por expectativas de markup/estrutura que já não correspondiam à implementação ativa. As assertions impactadas foram atualizadas para verificar a estrutura atual e o contrato do snapshot; a suíte completa passou ao final da Fase 1.
- Peer warning preexistente entre `@builder.io/vite-plugin-jsx-loc` e Vite 7.
- `replit.md` e o relatório de status não existiam; foram criados conforme solicitado.

### Pendências

- Rodar `pnpm build` e validar os fluxos administrativos/comerciais afetados na Fase 7.
- O lockfile foi re-resolvido pelo pnpm durante a atualização necessária das dependências; o diff inclui pacotes transitivos e snapshots de peer além dos dois ranges diretos. A instalação congelada passou. Não editar manualmente nem reduzir o lockfile sem uma resolução reproduzível equivalente.

### Próximo passo registrado ao concluir a baseline

Implementar a Fase 1: adicionar um resolver tipado de `PublicSalesContentSnapshot` a partir dos defaults e overrides válidos; expor o snapshot no provider e migrar a página existente sem mudar copy, visual, lógica de pedido ou dados persistidos.

## Etapa 1 — Conteúdo canônico

**Status:** concluída.

### Feito

- Criado `PublicSalesContentSnapshot`, com defaults derivados de `PUBLIC_SALES_COPY_SECTIONS`, overrides apenas para campos conhecidos e valores string, rastreamento de campos explicitamente sobrescritos e coleções ordenadas para pacote, perfil ideal e objeções.
- O provider resolve o snapshot quando os overrides mudam. `PublicHome` passa o mesmo conteúdo a `official` e `premium`; `Home` continua compatível com `/preview` por meio do contexto.
- Migrados os consumidores comerciais da home para o snapshot. A página deixou de manter cópias locais de pacote, perfis e objeções. Markup rico dos títulos/CTA e comportamento de pedidos continuam na composição existente.
- Alinhados os defaults divergentes de prova social à copy já exibida e as perguntas/respostas do editor à lista pública compartilhada. Nenhuma copy persistida foi alterada; não houve gravações no banco.
- Atualizadas assertions estáticas de cabeçalho/home para validar os pontos de integração e seletores atualmente usados, em vez de exigir strings de markup antigas.
- `replit.md` atualizado com a fonte de conteúdo canônica e a regra contra duplicação de defaults.

### Arquivos alterados

- `shared/publicSalesContent.ts` (resolver e tipos).
- `shared/publicSalesContent.test.ts` (defaults, ordenação e filtros de override).
- `shared/publicSalesCopyEditor.ts` (defaults de prova social e objeções compartilhadas).
- `client/src/components/PublicSalesCopyRuntime.tsx` (snapshot no contexto).
- `client/src/pages/PublicHome.tsx` e `client/src/pages/Home.tsx` (mesmo conteúdo para templates e consumo na página existente).
- `server/publicHeader.responsive.test.ts` e `server/publicHomeEnhancements.test.ts` (contratos atuais).
- `replit.md` e `docs/REPLIT_AGENT_STATUS.md`.

### Testes executados

- `pnpm check`: passou.
- Testes focados do snapshot/home/cabeçalho: 29 passaram.
- `pnpm test`: 82 arquivos e 316 testes passaram.
- `pnpm install --frozen-lockfile --lockfile-only`: passou; manifesto e lockfile estão sincronizados.
- Workflow reiniciado e servindo na porta 5000. Captura desktop após a alteração mostrou a home carregada; console sem erros de aplicação.

### Erros encontrados

- Não há falhas de aplicação/teste abertas nesta etapa. O workflow informa apenas que `baseline-browser-mapping` está desatualizado; não foi atualizado por ser alheio ao layout.
- O lockfile contém uma re-resolução ampla além dos dois ranges diretos atualizados (`@tailwindcss/vite` 4.3.3 e Vitest 5.0.3). Foi mantido o resultado produzido pelo pnpm por ser reproduzível em modo congelado; nenhum ajuste manual foi feito.

### Pendências

- Executar build e validação mais ampla do preview ao final.
- Nenhum bloqueio para as etapas seguintes.

## Etapa 2 — Registry de templates

**Status:** concluída.

### Feito

- Adicionado registry compartilhado com os mesmos IDs persistidos (`official`, `premium`), rótulos e descrições. Valores desconhecidos continuam resolvendo para `official`.
- Adicionado registry de renderização que aponta ambos os templates ao mesmo componente `Home`; somente `premium` aplica o wrapper CSS e atributo existentes.
- `PublicHome` e a prévia administrativa `/preview` usam o renderer registrado; não foi criada uma segunda página.
- O seletor e o resumo de salvamento do painel derivam os rótulos do registry. A configuração JSON, categoria e recurso persistidos não mudaram.
- Cobertos por teste os IDs, o fallback, a identidade do componente compartilhado e o wrapper premium.
- `replit.md` atualizado para registrar a localização da definição e o caminho de renderização.

### Arquivos alterados

- `shared/publicPageTemplate.ts` e `shared/publicPageTemplate.test.ts`.
- `client/src/pages/PublicSalesTemplateRegistry.tsx`.
- `client/src/pages/PublicHome.tsx`, `client/src/pages/Preview.tsx` e `client/src/pages/AdminSalesImages.tsx`.
- `server/publicSalesTemplateRegistry.test.ts`.
- `replit.md` e `docs/REPLIT_AGENT_STATUS.md`.

### Testes executados

- `pnpm check`: passou.
- Quatro suítes focadas de templates/home/cabeçalho: 31 testes passaram.
- Inspeção de referências confirmou que a condição por template saiu de `PublicHome`; o wrapper premium está definido no renderer.

### Erros encontrados

- Nenhum erro novo de tipo ou teste nesta etapa.

### Pendências

- Confirmar build, apresentação visual e fluxo administrativo na validação final.

### Próximo passo exato

Continuar pela Etapa 3 abaixo; o diagnóstico dos seletores e a primeira rodada de escopo já foram registrados ali.

## Etapa 3 — Isolamento de estilos

**Status:** em andamento.

### Auditoria inicial concluída

- A skin Premium ativa da página real está sob `.real-public-sales-preview`, aplicada junto de `.public-sales-premium-preview` pelo registry. Os seletores ativos dessa skin já usam o wrapper; não foi necessário alterá-los nesta auditoria.
- `PreviewPublicSales.css` ainda contém regras `.premium-preview-*` de uma composição de demonstração anterior. Não encontrei markup React que use esses nomes; não remover nem reestruturar esse bloco sem confirmar seu destino e os testes legados que ainda citam o preview.
- As regras de seções e componentes de venda em `index.css` são usadas pela composição de `Home`. `.sales-page` também é usada em `PublicInfoPage`; `.shell` e `.btn` são compartilhadas por outras rotas. Essas regras compartilhadas não devem receber escopo exclusivo da landing.
- Foram encontrados seletores não encapsulados da família antiga `.premium-preview-*` em `PreviewPublicSales.css`, mas sem consumidores React ativos. A contagem de 14 citada na retomada não corresponde ao conjunto atual; a classificação foi feita sobre os seletores presentes no checkout.
- Em `index.css`, `.eyebrow` e `.top-promo-banner` eram nomes genéricos usados pela landing. Seus estilos-base, descendentes, variantes do banner e media queries foram limitados a `.reference-page`. `.sales-page`, `.shell`, `.btn` e tipografia compartilhada permaneceram globais.

### Alterações deste avanço

- `client/src/index.css`: escopo de `.eyebrow` e `.top-promo-banner` sob `.reference-page`, incluindo usos internos e regras responsivas do banner.
- `replit.md`: cada etapa concluída agora deve registrar mudanças, decisões, verificações, erros, pendências e próximo passo exato em `docs/REPLIT_AGENT_STATUS.md`, com contexto de continuidade para Remix.

### Verificações

- `pnpm check`: passou.
- `pnpm build`: passou; Vite manteve o aviso existente de um chunk acima de 500 kB.
- `pnpm exec vitest run server/publicHeader.responsive.test.ts`: 24 testes passaram.
- `git diff --check`: passou.
- Prévia visual em desktop: `official` (`/`) e `premium` (`/preview`) carregaram. Em mobile (390×844), a home oficial preservou o banner e a apresentação compacta.
- A rota `/politica-de-privacidade` também carregou; os estilos de landing recém-escopados não foram aplicados nela.
- Workflow reiniciado após a alteração. Logs confirmam serviço na porta 5000 sem erro de inicialização; as capturas não mostraram erros de console.

### Erros e observações

- A primeira chamada `pnpm test -- server/publicHeader.responsive.test.ts` executou a suíte completa: 319 passaram e o teste de PDFs expirou no limite de 5 s. A chamada Vitest direta e focada passou 24/24.
- O aviso de chunk do build e a recomendação de atualizar `baseline-browser-mapping` não foram introduzidos por esta alteração.

### Pendências

- A Etapa 3 ainda não está concluída: classificar os demais seletores exclusivos de `Home` em `index.css` e aplicar o escopo seguro também aos grupos restantes, mantendo os estilos realmente compartilhados.
- A família antiga `.premium-preview-*` continua sem consumidor identificado; manter até decidir seu destino e confirmar os testes que ainda a referenciam.
- Revalidar `official`, `premium`, informações públicas e telas administrativas após completar a etapa.

### Próximo passo exato

Completar a matriz de seletores de `index.css` por uso real em `Home`, `PublicInfoPage` e componentes compartilhados. Escopar os grupos restantes comprovadamente exclusivos de `Home` sob `.reference-page`, preservando `.sales-page`, `.shell`, `.btn` e a tipografia quando compartilhados. Não apagar estilos `.premium-preview-*` sem identificar consumidores e substitutos.

## Histórico de etapas

| Etapa | Estado | Resultado |
|---|---|---|
| 0 — Baseline e diagnóstico | Concluída | Base atual `official`, sem overrides/layout visual; composição compartilhada em `Home`; divergências de breakpoints anotadas. |
| 1 — Conteúdo canônico | Concluída | Provider resolve defaults e overrides válidos em um snapshot único usado pela home existente. |
| 2 — Registry de templates | Concluída | Metadados e renderer compartilham os templates existentes e centralizam o wrapper premium. |
| 3 — Isolamento de estilos | Em andamento | Skin Premium ativa já está escopada; nomes genéricos da landing (`.eyebrow`, `.top-promo-banner`) foram limitados a `.reference-page`; faltam os demais grupos exclusivos. |
| 4 — Desktop real e desktop mobile | Planejada | Criar resolver único de apresentação e integrá-lo ao runtime/cabeçalho após validar detecção. |
| 5 — Editor visual por contrato | Planejada | Manter persistência existente; estabilizar mapeamento lógico somente com compatibilidade v1. |
| 6 — Contrato para novos templates | Planejada | Documentar manifesto/registro com base no registry implementado. |
| 7 — Validação final | Planejada | Executar check/build/testes e cenários que forem acessíveis sem declarar validação física não executada. |