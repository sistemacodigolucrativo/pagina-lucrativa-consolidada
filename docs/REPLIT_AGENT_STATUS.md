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

## Etapa 5 — Editor visual por IDs estáveis

**Status:** concluída.

### Feito

- Confirmado que os campos de copy já usam IDs lógicos `{sectionId}.{fieldKey}`; blocos, imagens e ações ainda dependiam da posição no DOM.
- Criado um contrato para alvos de layout com chave estável: `{sectionId}.{kind}.{stableKey}`. O markup usa `data-public-visual-key` nos itens de pacote, objeções, prova social, imagens de seção e ações pertinentes, inclusive o envio do formulário de ativação.
- IDs posicionais v1 (`block1`, `image1`, `action1`) continuam como aliases de leitura. Ao editar, o ID canônico tem precedência, referências `duplicateOf` são atualizadas em memória e os aliases reconhecidos são removidos apenas do layout pendente que o administrador poderá salvar.
- IDs sem chave estável e registros sem consumidor continuam preservados; chaves muito longas permanecem no formato posicional v1. A versão, as categorias, os resource types e a separação por template/breakpoint não mudaram.
- Elementos duplicados visualmente são excluídos da descoberta de alvos para que um clone não altere os índices legados dos demais elementos.
- Documentado o contrato e a compatibilidade em `docs/public-sales-visual-editor.md`; assertions de markup foram alinhadas às novas chaves sem mudar a validação dos CTAs.
- Nenhuma consulta manual, gravação ou migração de banco foi executada.

### Arquivos alterados

- `shared/publicVisualEditor.ts` e `client/src/components/PublicSalesCopyRuntime.tsx`.
- `client/src/pages/Home.tsx` e `client/src/components/VioletaNeonActivationCard.tsx`.
- `server/publicVisualEditor.integration.test.ts` e `server/publicHeader.responsive.test.ts`.
- `docs/public-sales-visual-editor.md`.

### Verificações

- `pnpm check`: passou.
- Suítes focadas do editor visual, templates, conteúdo e cabeçalho: 35 testes passaram.
- Cobertos: precedência do ID canônico, leitura de layout somente com ID legado, remapeamento de `duplicateOf`, ausência de mutação do objeto original, fallback posicional e preservação da versão 1.

### Próximo passo exato

Documentar o contrato para registrar novos templates na Etapa 6.

## Etapa 6 — Contrato para novos templates

**Status:** concluída.

### Feito

- Criado `docs/PUBLIC_SALES_TEMPLATE_CONTRACT.md` com o fluxo de inclusão de IDs, metadados e renderers, escopo de estilos, testes mínimos e compatibilidade dos layouts v1.
- Registrada a regra em `replit.md` para que futuras Remix mantenham os IDs lógicos e aliases compatíveis do editor visual.
- O documento proíbe renomear/reutilizar IDs persistidos, duplicar a página ou lógica comercial, criar fontes de copy por template e fazer alterações remotas de banco como parte do registro.

### Próximo passo exato

Executar a validação final da Etapa 7 em uma sessão sem acesso às variáveis de banco.

## Etapa 7 — Validação final

**Status:** concluída.

### Verificações

- `pnpm check`: passou.
- Execução focada das cinco suítes pertinentes: 35 testes passaram.
- A execução padrão de `pnpm test` passou em 84 arquivos/327 testes, mas o teste de PDFs ultrapassou seu limite de 5 s sob concorrência e expirou. Reexecução completa com `--maxWorkers=4 --no-file-parallelism --testTimeout=15000`: 85 arquivos e 328 testes passaram. As variáveis de banco foram removidas durante as execuções de Vitest.
- `pnpm build`: passou. Permanecem os avisos conhecidos de chunk JavaScript acima de 500 kB e recomendação de atualizar `baseline-browser-mapping`.
- Workflow `Start application` reiniciado e em execução na porta 5000, sem erro de inicialização.
- Preview Oficial capturado em `/` e Premium em `/preview`, cada um a 1440×1000 e 390×844. As páginas carregaram sem erros de aplicação no console.
- Nenhuma migração ou gravação remota foi executada durante a validação.

### Limitações

- A interface administrativa autenticada não foi visualmente verificada porque o navegador de captura não possui sessão de administrador.
- A opção “solicitar site para computador” continua validada pelo resolver determinístico, não em um aparelho físico.
- A execução completa padrão ainda pode expirar o teste de PDF com o limite de 5 s sob alta concorrência; a suíte completa passou com concorrência reduzida e timeout de teste maior.

## Etapa 8 — Primeiro template plug-and-play adicional

**Status:** implementação concluída; Marco 8 em validação final.

### Relação com a sequência oficial

- O plano `03-PLANO-DE-ACAO.md` termina suas fases numeradas em 7 e permite continuar adicionando templates depois da validação inicial.
- O `04-ROADMAP.md` contém oito marcos; seu Marco 7 pede o primeiro template novo plug-and-play e o Marco 8 pede validação final.
- Para continuar sem reescrever as etapas já concluídas, esta entrada registra a continuação local como Etapa 8 e mantém explícito que ainda resta o Marco 8 do roadmap.

### Feito

- Registrado o ID estável `journey`, com metadados próprios e rótulo “Template Jornada”.
- O novo renderer reutiliza `Home` e o mesmo `PublicSalesContentSnapshot`; a apresentação fica isolada em `PublicSalesJourneyTemplate.css`. A seleção padrão continua `official` e os templates `official` e `premium` não foram substituídos.
- A lista do painel administrativo deriva de `PUBLIC_PAGE_TEMPLATES`, então a nova opção aparece sem fluxo paralelo. O layout visual continua separado por template e breakpoint; o contrato v1 e os layouts existentes não mudaram.
- `/preview?template=journey` permite validar o novo estilo sem persistir a seleção. `/preview` sem parâmetro continua exibindo `premium`.
- Não foram alterados copy, conteúdo comercial, CTAs, referral/tracking, fluxos de pedido, dados remotos ou dependências.

### Verificações

- `pnpm check`: passou.
- Suíte completa com `--maxWorkers=4 --no-file-parallelism --testTimeout=15000`: 85 arquivos e 328 testes passaram, com variáveis de banco removidas.
- `pnpm build`: passou. Persistem o aviso conhecido de chunk JavaScript acima de 500 kB e o aviso de dados desatualizados em `baseline-browser-mapping`.
- O CSS foi analisado: todos os seletores estão sob `.public-sales-journey-template`, sem fontes ou assets externos.
- Workflow `Start application` reiniciado e em execução na porta 5000. A prévia Journey carregou em desktop (1440×1000) e mobile (390×844); a página padrão `official` e `/preview` `premium` também renderizaram. Sem erros da aplicação no console.
- Nenhuma migração, gravação remota ou alteração do template ativo persistido foi executada.

### Limitações e próximo passo exato

- A captura não tem sessão administrativa, portanto o painel autenticado não foi verificado visualmente. O seletor é gerado da lista compartilhada, mas não foi salvo: salvar mudaria a configuração global persistida.
- Não foi usado um telefone físico para validar a opção “solicitar site para computador”; o modo continua coberto pelo resolver determinístico.
- O Marco 8 do `04-ROADMAP.md` fica parcialmente pendente. Quando houver uma sessão autorizada e um ambiente isolado de teste, verificar a opção Journey no painel e sua seleção sem tocar na configuração de produção; validar também os modos mobile e desktop-em-telefone em aparelho físico. Não salvar nem testar contra o banco remoto de produção.

### Estado para retomada

As fases 0–7 do `03-PLANO-DE-ACAO.md` e a implementação local da Etapa 8 estão concluídas. A sequência não termina aí: o `04-ROADMAP.md`, na [pasta de desenvolvimento no GitHub](https://github.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/tree/main/DESENVOLVIMENTO%20DE%20LAYOUT), tem oito marcos. A Etapa 8 atende ao Marco 7, de criar o primeiro template novo; o Marco 8, de validação final, ainda tem as verificações manuais listadas acima. O roadmap remoto não está incluído neste checkout.

## Histórico de etapas

| Etapa | Estado | Resultado |
|---|---|---|
| 0 — Baseline e diagnóstico | Concluída | Base atual `official`, sem overrides/layout visual; composição compartilhada em `Home`; divergências de breakpoints anotadas. |
| 1 — Conteúdo canônico | Concluída | Provider resolve defaults e overrides válidos em um snapshot único usado pela home existente. |
| 2 — Registry de templates | Concluída | Metadados e renderer compartilham os templates existentes e centralizam o wrapper premium. |
| 3 — Isolamento de estilos | Concluída | Grupos ativos exclusivos de `Home` foram limitados a `.reference-page`; estilos compartilhados ficaram globais e regras antigas sem consumidor foram preservadas. |
| 4 — Desktop real e desktop mobile | Concluída | Resolver compartilhado mantém breakpoint visual e compactação do cabeçalho por viewport e identifica separadamente desktop aberto em telefone. |
| 5 — Editor visual por contrato | Concluída | IDs canônicos por chave lógica com aliases legados; contrato persistido continua v1 e sem migração remota automática. |
| 6 — Contrato para novos templates | Concluída | Documentado o caminho de registry/renderer e a compatibilidade dos templates e layouts existentes. |
| 7 — Validação final | Concluída | Check/build passaram; 328 testes passaram com concorrência limitada; previews público, mobile e Premium carregaram. |
| 8 — Primeiro template novo (Marco 7 do roadmap) | Implementação concluída; Marco 8 em andamento | `journey` compartilha `Home` e conteúdo, usa CSS isolado e tem prévia não persistente; seguem pendentes verificações finais em aparelho e painel autenticado. |

## Retomada — validação do Marco 8 (02/10/2026)

### Estado da etapa

- As etapas 0–7 do `03-PLANO-DE-ACAO.md` e a implementação do template `journey` continuam concluídas.
- O Marco 8 do `04-ROADMAP.md` está em andamento; esta retomada corrigiu a divergência prioritária de desktop no navegador mobile e atualizou evidências.
- A documentação externa `06-CONFRONTO-DOCUMENTACAO-X-IMPLEMENTACAO.md` foi lida no GitHub. Ela ainda não está na cópia local da pasta `DESENVOLVIMENTO DE LAYOUT`, que contém os arquivos 00–05; não foi feito fetch/merge de branches.

### Alterações feitas

- `shared/publicSalesPresentation.ts` agora classifica os breakpoints do runtime conforme a arquitetura: mobile até 767 px, tablet até 1199 px e desktop a partir de 1200 px.
- Ao detectar `desktop-on-mobile`, o resolver força `visualBreakpoint: "desktop"` e desativa a compactação do cabeçalho.
- `PublicMobileCompactHeaderRuntime` aplica largura de viewport de 1366 px somente enquanto a Página Pública de Vendas está em `desktop-on-mobile`; ao sair da página, restaura o conteúdo original da meta viewport.
- Testes do resolver cobrem os limites canônicos, o breakpoint desktop forçado e a preservação das demais diretivas da meta viewport.
- Foram salvas capturas em 1366 px e 820 px para `official`, `premium` e `journey`:
  - `docs/visual-checks/public-sales-official-desktop-1366.jpg`
  - `docs/visual-checks/public-sales-premium-desktop-1366.jpg`
  - `docs/visual-checks/public-sales-journey-desktop-1366.jpg`
  - `docs/visual-checks/public-sales-official-tablet-820.jpg`
  - `docs/visual-checks/public-sales-premium-tablet-820.jpg`
  - `docs/visual-checks/public-sales-journey-tablet-820.jpg`

### Decisões tomadas

- O breakpoint visual do modo desktop em telefone não deve depender do viewport inicial reportado pelo navegador: o modo explícito resolve para desktop e usa um canvas de 1366 px.
- O CSS Premium real continua ativo: os seletores `.real-public-sales-preview` e `.public-sales-premium-preview` são aplicados pelo registry e encontrados na folha `PreviewPublicSales.css`.
- A família antiga `.premium-preview-*` não tem consumidor em markup, componentes ou testes encontrados no repositório. A folha contém também o CSS Premium real; nenhum trecho foi removido nesta retomada.
- Não houve alteração de conteúdo, lógica comercial, templates, seleção persistida ou dados do banco. Não foi necessário editar `replit.md`.

### Verificações executadas e resultados

- `env -u DATABASE_URL -u MYSQL_PASSWORD -u REMOTE_DATABASE_URL pnpm exec vitest run shared/publicSalesPresentation.test.ts`: 8 testes passaram.
- `pnpm check`: passou.
- `pnpm build`: passou; permanece o aviso conhecido de chunk JavaScript acima de 500 kB.
- `git diff --check`: passou com o registro atualizado.
- Chromium com emulação de toque, viewport inicial 980 px e tela de 430 px: confirmou `desktop-on-mobile`, meta viewport em 1366 px, mídia desktop ativa e cabeçalho compacto inativo.
- Na mesma emulação, a rota `/institucional` restaurou a meta viewport original; ao retornar à página em 390 px, o modo mobile permaneceu em `width=device-width`.
- Workflow `Start application` reiniciado em `DEMO_PREVIEW=1`; log confirma servidor na porta 5000 sem erro de inicialização.
- Capturas públicas de `official`, `premium` e `journey` em desktop (1366 px) e tablet (820 px) carregaram sem erros da aplicação no console. Os avisos vistos foram somente conexão Vite e dica do React DevTools.
- Nenhum teste com gravação, consulta manual ou migração de banco foi executado. A prévia foi mantida em modo de demonstração.

### Erros e limitações

- `pnpm test` completo não foi repetido nesta alteração focada; somente a suíte do resolver foi executada. O status anterior registra 328 testes passando com concorrência reduzida.
- A emulação Chromium confirma a mudança de viewport e as regras CSS desktop, mas não substitui a validação num aparelho Android físico com “Versão para computador”.
- A captura do navegador não possui sessão administrativa: o seletor e o salvamento de template no painel não foram verificados visualmente nem persistidos.
- As capturas registram o primeiro viewport de cada rota; não cobrem fluxo de pedido, conteúdo abaixo da dobra ou comportamento após interação.
- Os breakpoints do resolvedor agora seguem 767/1199 px; regras CSS de componentes continuam distribuídas por valores próprios (por exemplo, 760, 900, 980 e 1024 px). A consolidação geral de todos esses media queries ainda precisa de auditoria antes de alegar que cada regra CSS usa um único contrato.
- Uma simulação CDP inicial modificou a meta viewport antes da montagem do app e, por isso, não representava corretamente o valor original a restaurar. A validação foi refeita com métricas de dispositivo/tela e entrada tátil; desktop, restauração de rota e mobile normal passaram.

### Pendências

- Validar num Chrome Android físico a equivalência de composição do modo desktop com notebook, mantendo modo mobile normal e tablet.
- Com sessão autorizada e ambiente de dados isolado, validar o seletor de `journey` e os controles administrativos sem salvar na configuração do banco remoto.
- Executar a matriz funcional final do Marco 8 para pedido, referral/tracking, FAQ, prova social e editor; não declarar esses fluxos verificados com base apenas nas capturas.
- Decidir, após confirmar o restante dos consumidores e testes, se o CSS legado `.premium-preview-*` deve permanecer como demonstração ou ser retirado em mudança própria.

### Próximo passo exato

Continuar o Marco 8 sem tocar no banco remoto: validar o modo desktop em aparelho Android físico e, em ambiente isolado com sessão administrativa autorizada, conferir o seletor `journey`; depois executar a matriz funcional pendente e decidir separadamente o destino do CSS legado.

## Continuidade — correções responsivas focadas no Premium (02/10/2026)

### Escopo e estado

- O foco desta rodada segue a decisão registrada nos resultados de teste: estabilizar `premium` como base visual principal. `official` e `journey` permanecem preservados e não foram alterados nesta rodada.
- Esta rodada corrige no CSS ativo problemas reportados no celular deitado e na visibilidade/posição dos controles flutuantes. Não substitui a validação manual em Chrome Android.
- A aplicação continua usando o mesmo `Home`, renderer e conteúdo compartilhado. Não houve mudança em pedidos, copy, pagamentos, seleção persistida ou banco.

### Alterações feitas

- Em telas baixas na orientação paisagem (largura até 1024 px e altura até 540 px), o Premium usa o botão de menu compacto. O menu aberto fica em coluna, pode rolar verticalmente e não exige arraste lateral.
- Em celular estreito (até 760 px), o CTA flutuante fica no canto inferior direito e o controle de chat indisponível fica no canto inferior esquerdo, com margens para áreas seguras e espaço de rolagem após o conteúdo.
- O botão de chat continua intencionalmente desativado (“em breve”); esta alteração apenas torna o controle visível, sem simular uma funcionalidade de chat.
- Em `desktop-on-mobile`, o CTA flutuante permanece visível mesmo quando o breakpoint de viewport usado pelo modo desktop normalmente o ocultaria.
- O ordenamento do banner/imagem do hero logo após o título e o `scroll-margin-top` de 92 px para `#f` já estavam ativos antes desta rodada; devem ser confirmados no aparelho, não tratados como teste físico aprovado.
- As regras selecionadas da proposta CSS foram integradas à folha ativa. `artifacts/premium-public-sales-responsive-proposal/` agora está explicitamente marcado como referência histórica e não deve ser carregado separadamente.
- Foi acrescentada uma verificação de contrato CSS para os breakpoints e os controles flutuantes Premium.

### Verificações desta rodada

- `pnpm check`: passou.
- `pnpm exec vitest run server/publicHeader.responsive.test.ts --maxWorkers=2`: 25 testes passaram.
- `pnpm build`: passou; permanece o aviso conhecido de chunk JavaScript acima de 500 kB.
- `git diff --check`: passou após as alterações de código, documentação e inclusão das capturas.
- Workflow `Start application` reiniciado em `DEMO_PREVIEW=1` e permaneceu ativo na porta 5000. `/preview` carregou em 390×844, 844×390 e 1366×900 sem erro da aplicação no console.
- Capturas persistidas para a próxima retomada:
  - `docs/visual-checks/public-sales-premium-mobile-portrait-390x844.jpg`
  - `docs/visual-checks/public-sales-premium-mobile-landscape-844x390.jpg`
  - `docs/visual-checks/public-sales-premium-desktop-1366x900.jpg`
- A captura 844×390 mostra o botão compacto do menu; a captura 390×844 mostra o hero e o controle de chat no canto inferior esquerdo. As capturas são somente do primeiro viewport: não abriram o menu nem rolaram até a seção de pacotes.
- A visibilidade do CTA após a seção de pacotes, o scroll real até `#f` e o seletor CSS `desktop-on-mobile` ainda não foram confirmados visualmente em interação. A suíte executada valida os contratos CSS, não substitui esses testes.
- O relatório físico disponível no workspace é de Redmi 10C / Android 13 / MIUI 14 usando Opera. Não foi encontrado relatório de Chrome Android das etapas 3 e 4. Também não foi localizado Chromium executável no container para rodar o script Playwright local existente.
- Nenhum teste de pedido, envio do formulário, pagamento, gravação administrativa ou acesso ao banco remoto foi executado.

### Próximo passo exato

1. Fazer validação manual em Chrome Android no aparelho físico: mobile em pé e deitado; “Versão para computador” ligada em pé e deitado. Confirmar menu, CTA após a seção de pacotes, botão de chat visível porém desativado, âncoras e ausência de cortes; parar no formulário sem preencher/enviar.
3. Ajustar o CSS somente se os resultados físicos mostrarem problema reproduzível. Não voltar a ampliar a matriz aos três templates até o Premium estar estável.
4. Depois, seguir as pendências do Marco 8 já listadas acima: seletor administrativo em ambiente isolado e matriz funcional sem gravações remotas.