# Editor visual real da Página Pública de Vendas

## Arquivos alterados

- `shared/publicVisualEditor.ts`
- `server/_core/publicSalesCopyConfig.ts`
- `client/src/pages/AdminSalesImages.tsx`
- `client/src/pages/AdminVisualSalesEditor.css`
- `client/src/components/PublicSalesCopyRuntime.tsx`
- `client/src/index.css`

## Componentes envolvidos

- `AdminSalesImages`: mantém a seleção de template e adiciona o toggle persistente do modo de edição visual.
- `PublicSalesCopyProvider`: carrega a configuração pública, incluindo template, textos, layout flutuante e layout visual salvo.
- `PublicSalesCopyRuntime`: aplica textos/layouts na página real e injeta a camada de edição apenas para administradores autenticados.

## Funcionamento do modo de edição

O toggle "Modo de edição visual" fica na área administrativa de configuração da página pública. Quando ativado, a própria página pública real passa a exibir controles administrativos para usuários com `role === "admin"`.

Visitantes comuns não recebem controles de edição. O endpoint público pode informar que o modo está ativo, mas a camada editável só é montada no frontend quando a sessão atual é administrativa. O salvamento usa mutações protegidas por `adminProcedure`.

## Persistência do toggle

O toggle é salvo como conteúdo gerenciado:

- categoria: `public-sales-visual-editor`
- recurso: `mode`
- corpo: `{ "enabled": boolean }`

## Template ativo

As alterações visuais são salvas por template e breakpoint. O registro de layout usa o template ativo carregado pelo runtime público:

- `official`
- `premium`

O resource type segue o formato `layout:{template}:{breakpoint}`.

## Persistência das alterações

Textos editados reutilizam a arquitetura existente de copy pública:

- categoria: `public-sales-copy`
- recurso: id da seção

Posição, tamanho, ocultação e duplicações visuais usam:

- categoria: `public-sales-visual-editor`
- recurso: `layout:{template}:{breakpoint}`

Cada layout registra:

- template
- breakpoint
- elementos alterados
- deslocamento visual
- largura/altura
- ocultação
- duplicação baseada em um elemento original

## Ações suportadas

- edição inline de textos mapeados em `PUBLIC_SALES_COPY_SECTIONS`
- mover elemento selecionado
- redimensionar com alça visual
- duplicar elemento visualmente
- excluir/ocultar elemento visualmente
- salvar alterações pendentes
- descartar alterações pendentes
- aviso ao tentar sair com alterações não salvas

## Componentes editáveis

A camada usa os seletores já existentes em `shared/publicSalesCopyEditor.ts`. Isso cobre os principais títulos, textos, cards, itens, dúvidas, oferta e blocos de copy pública mapeados no sistema atual.

## IDs estáveis e compatibilidade v1

- Campos de copy mantêm o ID lógico `{sectionId}.{fieldKey}`.
- Alvos de layout com identidade própria recebem `data-public-visual-key`; o ID canônico segue `{sectionId}.{kind}.{stableKey}`, onde `kind` é `block`, `image` ou `action`.
- Quando há uma chave estável, o ID posicional antigo (`block1`, `image1` ou `action1`) é lido como alias para compatibilidade com layouts já salvos.
- A normalização acontece em memória ao aplicar ou editar o layout. O layout antigo só é regravado com IDs canônicos se um administrador editar e salvar; não há migração automática nem escrita em banco.
- O contrato persistido continua em `version: 1`, com as mesmas categorias, resource types e separação por template/breakpoint. IDs sem consumidor atual continuam preservados.
- Para novos itens repetidos, forneça uma chave de domínio estável no HTML; não use texto visível nem posição do array como identidade. Se não houver chave segura ou o ID ultrapassar 180 caracteres, mantenha o ID v1 posicional.

## Responsividade

O resolver compartilhado classifica o layout pela largura real do viewport:

- mobile: até 560 px
- tablet: até 980 px
- desktop: acima de 980 px

Ele também identifica explicitamente o modo desktop aberto em um telefone quando
há entrada tátil, lado menor da tela de até 560 px e viewport de pelo menos
901 px. Esse modo não substitui o breakpoint visual: o editor continua usando a
largura do viewport, e a compactação do cabeçalho continua seguindo seu próprio
limite de 900 px. A apresentação pode ser inspecionada em
`data-public-sales-presentation` no elemento raiz do documento.

Os layouts visuais são persistidos separadamente por breakpoint, evitando que uma alteração mobile sobrescreva diretamente desktop/tablet.

## Limitações conhecidas

- A troca de imagem continua disponível no editor administrativo interno já existente; a camada pública desta etapa foca em texto, mover, resize, duplicar e ocultar.
- Duplicações são clones visuais do elemento original e não criam novos componentes React permanentes no código.
- A edição de texto rico preserva o estilo do componente real ao renderizar/salvar, mas durante a digitação inline o navegador pode simplificar nós internos. O título do hero continua sendo reconstruído pelo runtime existente após salvar/recarregar.
- O descarte recarrega a página para garantir restauração limpa do estado salvo.

## Validações executadas

- `pnpm check`
- Cinco suítes focadas de editor, templates, conteúdo e cabeçalho: 35 testes passaram.
- A primeira execução padrão de `pnpm test` passou em 84 arquivos/327 testes; o teste de PDFs excedeu 5 s sob concorrência e expirou. Reexecução completa com concorrência limitada e timeout de 15 s passou: 85 arquivos/328 testes.
- `pnpm build` passou; há avisos de chunk JavaScript acima de 500 kB e recomendação de atualizar `baseline-browser-mapping`.
- Workflow `Start application` reiniciado e ativo na porta 5000.
- Preview Oficial `/`: desktop 1440×1000 e mobile 390×844. Preview Premium `/preview`: desktop 1440×1000 e mobile 390×844. Os quatro carregaram sem erros de aplicação no console.
- Os testes Vitest foram executados sem as variáveis de ambiente do banco. Nenhuma migração ou gravação remota foi executada.

## Limitações e pendências recomendadas

- Validar manualmente no navegador com administrador autenticado.
- A execução padrão da suíte completa ainda pode expirar o teste de PDF com limite de 5 s sob alta concorrência; a reexecução com concorrência reduzida passou.
- A opção “solicitar site para computador” não foi confirmada em aparelho físico; o resolver foi coberto por testes determinísticos.
- Evoluir edição de imagens diretamente na página pública se isso for necessário além do editor administrativo atual.
