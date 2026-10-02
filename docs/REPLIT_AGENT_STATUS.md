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

Iniciar a Etapa 4: validar a detecção de desktop e desktop mobile e então integrar um resolver único de apresentação ao runtime e ao cabeçalho, sem mexer no conteúdo comercial compartilhado.

## Etapa 3 — Isolamento de estilos

**Status:** concluída.

### Auditoria e decisões

- A skin Premium ativa da página real está sob `.real-public-sales-preview`, aplicada junto de `.public-sales-premium-preview` pelo registry. Os seletores ativos dessa skin já usam o wrapper; não foi necessário alterá-los nesta auditoria.
- `PreviewPublicSales.css` ainda contém regras `.premium-preview-*` de uma composição de demonstração anterior. Não encontrei markup React que use esses nomes; não remover nem reestruturar esse bloco sem confirmar seu destino e os testes legados que ainda citam o preview.
- As regras de seções e componentes de venda em `index.css` são usadas pela composição de `Home`. `.sales-page` também é usada em `PublicInfoPage`; `.shell` e `.btn` são compartilhadas por outras rotas. Essas regras compartilhadas não devem receber escopo exclusivo da landing.
- Foram encontrados seletores não encapsulados da família antiga `.premium-preview-*` em `PreviewPublicSales.css`, mas sem consumidores React ativos. A contagem de 14 citada na retomada não corresponde ao conjunto atual; a classificação foi feita sobre os seletores presentes no checkout.
- A matriz comparou as classes efetivamente usadas por `Home` com `PublicInfoPage` e outras rotas. Estilos ativos de carrossel/estrutura, prova social, depoimentos, avaliações, grids de pacote e objeções, conteúdo de referência, animação de entrada e botão flutuante da landing foram limitados a `.reference-page`, incluindo suas regras responsivas.
- `.eyebrow` e `.top-promo-banner`, seus descendentes, variantes e media queries também ficaram sob `.reference-page`.
- `.public-info-grid` e suas regras compartilhadas permaneceram globais. `.sales-page`, `.shell`, `.btn`, tipografia e os estilos de navegação compartilhada não receberam escopo exclusivo.
- A auditoria deixou apenas as regras globais de navegação compartilhada e `.faq.is-open`, que não tem consumidor ativo identificado. As famílias com nomes próprios de produto (`.sales-*`, `.public-*`) permanecem distinguíveis; não foi feita uma reestruturação ampla do CSS.

### Alterações

- `client/src/index.css`: escopo seguro dos grupos de landing comprovadamente usados apenas por `Home`, incluindo seletores descendentes e variantes responsivas. Regras compartilhadas e estilos antigos sem consumidor identificado foram preservados.
- `replit.md`: cada etapa concluída agora deve registrar mudanças, decisões, verificações, erros, pendências e próximo passo exato em `docs/REPLIT_AGENT_STATUS.md`, com contexto de continuidade para Remix.

### Verificações

- `pnpm check`: passou.
- `pnpm build`: passou; Vite manteve o aviso existente de um chunk acima de 500 kB.
- `pnpm exec vitest run server/publicHeader.responsive.test.ts`: 24 testes passaram.
- O parser PostCSS aceitou `client/src/index.css`; `git diff --check` passou.
- Capturas após reiniciar o workflow: `official` (`/`), carrossel (`/#estrutura-digital`), prova social em desktop e mobile (`/#depoimentos`), `premium` (`/preview`), página institucional (`/institucional`) e privacidade (`/politica-de-privacidade`). As rotas carregaram e as capturas não mostraram erros de console.
- A análise estática confirmou que os grupos modificados pertencem à composição `Home`; as telas administrativas autenticadas não foram visualmente verificadas neste navegador.
- O workflow `Start application` reiniciou na porta 5000; logs de inicialização sem erros.

### Erros e observações

- A primeira chamada `pnpm test -- server/publicHeader.responsive.test.ts` executou a suíte completa: 319 passaram e o teste de PDFs expirou no limite de 5 s. A chamada Vitest direta e focada passou 24/24.
- O aviso de chunk do build e a recomendação de atualizar `baseline-browser-mapping` não foram introduzidos por esta alteração.

### Pendências

- A família antiga `.premium-preview-*` continua sem consumidor identificado; manter até decidir seu destino e confirmar os testes que ainda a referenciam.
- A interface administrativa autenticada não foi capturada; os seletores alterados foram conferidos estaticamente como pertencentes à landing.

### Próximo passo exato

Seguir para a Etapa 4: validar a detecção de desktop e desktop mobile antes de integrar um resolver único de apresentação ao runtime e ao cabeçalho.

## Etapa 4 — Desktop real e desktop mobile

**Status:** concluída.

### Feito

- Criado um resolver compartilhado para breakpoints visuais (`mobile` até 560 px, `tablet` até 980 px, `desktop` acima de 980 px), limite de cabeçalho compacto (900 px) e identificação explícita de desktop aberto em telefone.
- A identificação desktop-no-telefone exige entrada tátil, lado menor da tela de até 560 px e viewport a partir de 901 px. Ela não sobrescreve o breakpoint visual nem força o layout mobile/tablet; os dois modos continuam baseados na largura real do viewport, inclusive em orientação horizontal.
- Runtime de copy/layout flutuante e editor visual passaram a consumir o resolver compartilhado.
- O runtime do cabeçalho também consome o resolver, registra o modo atual em `data-public-sales-presentation`, acompanha mudanças de rota, resize, orientação e alteração de ponteiro, e aplica a classe compacta somente pelo limite de viewport de 900 px.
- Removida a duplicação do media query de 900 px no CSS do cabeçalho compacto; a classe aplicada pelo runtime tornou-se a fonte única para esse efeito de rolagem. As demais regras responsivas da página permaneceram inalteradas.
- Nenhum conteúdo comercial, template, rota ou dado persistido foi alterado.

### Verificações

- `pnpm check`: passou.
- `pnpm exec vitest run shared/publicSalesPresentation.test.ts server/publicHeader.responsive.test.ts`: 30 testes passaram.
- `pnpm build`: passou; permanece o aviso já conhecido de chunk acima de 500 kB e recomendação de atualizar `baseline-browser-mapping`.
- Workflow principal reiniciado; `/` capturada em 1440×1000 e 390×844. Ambas carregaram sem erro de aplicação no console.
- Os testes do resolver cobrem mobile normal, tablet, desktop, desktop no navegador do telefone, orientação horizontal e limites de 560/900/980 px. A detecção de “solicitar site para computador” não foi confirmada em aparelho físico.
- Nenhum teste com gravação no banco foi executado; nenhum dado de banco foi consultado ou alterado.

### Limitações

- Não foi possível confirmar visualmente o modo “site para computador” em um telefone físico ou navegador com essa opção. Os limites e a decisão de modo foram validados com entradas determinísticas no resolver.
- A tela administrativa autenticada não foi visualmente verificada no navegador de captura.

### Próximo passo exato

Iniciar a Etapa 5: auditar o contrato do editor visual por IDs estáveis e a compatibilidade com layouts já persistidos; preservar a versão 1 e não modificar dados remotos.

## Histórico de etapas

| Etapa | Estado | Resultado |
|---|---|---|
| 0 — Baseline e diagnóstico | Concluída | Base atual `official`, sem overrides/layout visual; composição compartilhada em `Home`; divergências de breakpoints anotadas. |
| 1 — Conteúdo canônico | Concluída | Provider resolve defaults e overrides válidos em um snapshot único usado pela home existente. |
| 2 — Registry de templates | Concluída | Metadados e renderer compartilham os templates existentes e centralizam o wrapper premium. |
| 3 — Isolamento de estilos | Concluída | Grupos ativos exclusivos de `Home` foram limitados a `.reference-page`; estilos compartilhados ficaram globais e regras antigas sem consumidor foram preservadas. |
| 4 — Desktop real e desktop mobile | Concluída | Resolver compartilhado mantém breakpoint visual e compactação do cabeçalho por viewport e identifica separadamente desktop aberto em telefone. |
| 5 — Editor visual por contrato | Planejada | Manter persistência existente; estabilizar mapeamento lógico somente com compatibilidade v1. |
| 6 — Contrato para novos templates | Planejada | Documentar manifesto/registro com base no registry implementado. |
| 7 — Validação final | Planejada | Executar check/build/testes e cenários que forem acessíveis sem declarar validação física não executada. |