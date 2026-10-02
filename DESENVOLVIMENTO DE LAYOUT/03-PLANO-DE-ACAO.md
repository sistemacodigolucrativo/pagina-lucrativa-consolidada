# Plano de Ação — Evolução do Sistema de Templates

## Objetivo

Transformar a Página Pública de Vendas em um sistema de templates plug and play sem quebrar a página atual, o editor visual, o fluxo de pedidos, as métricas, o referral e a experiência pública.

## Regra de execução

Executar em fases pequenas.

Não reescrever tudo de uma vez.

Não remover o fluxo atual antes de a nova arquitetura estar validada.

## Fase 0 — Congelamento e baseline

### Ações

1. Registrar o estado atual da branch antes de alterar.
2. Validar a página pública atual em desktop real, desktop no Chrome mobile, tablet e mobile.
3. Registrar diferenças visuais entre desktop real e desktop mobile.
4. Confirmar template ativo atual.
5. Confirmar conteúdo atual salvo em banco/configuração.
6. Confirmar quais alterações visuais já estão persistidas pelo editor.

### Saída esperada

- Baseline visual.
- Lista de regressões conhecidas.
- Lista de arquivos envolvidos.
- Ponto seguro de rollback.

## Fase 1 — Separar conteúdo de apresentação

### Ações

1. Criar `PublicSalesContentSnapshot`.
2. Criar função `resolvePublicSalesContent()`.
3. Consolidar textos vindos de:
   - defaults de `shared/publicSalesCopyEditor.ts`;
   - overrides salvos;
   - dados do apresentador;
   - imagens de seção;
   - prova social;
   - FAQ;
   - CTAs.
4. Ajustar `Home.tsx` para receber conteúdo resolvido em vez de espalhar fallback diretamente na árvore.

### Regras

- Não duplicar textos.
- Não criar texto próprio por template.
- Preservar todos os textos atuais.
- Preservar comportamento de fallback.

### Saída esperada

- Conteúdo canônico único.
- `Home.tsx` menos acoplado a defaults.
- Base preparada para templates consumirem os mesmos textos.

## Fase 2 — Criar registry de templates

### Ações

1. Criar estrutura `client/src/public-sales/templates`.
2. Criar manifesto para template oficial.
3. Criar manifesto para template premium.
4. Criar `publicSalesTemplateRegistry`.
5. Substituir seleção condicional simples de `PublicHome.tsx` por resolução via registry.

### Regras

- O template oficial deve reproduzir o comportamento atual.
- O template premium deve preservar o visual atual.
- O conteúdo deve vir do mesmo snapshot.

### Saída esperada

- `official` e `premium` registrados como templates reais.
- Painel administrativo continua escolhendo o template ativo.
- Troca de template não perde conteúdo.

## Fase 3 — Isolar estilos por template

### Ações

1. Mover estilos específicos do premium para arquivo escopado do template premium.
2. Separar estilos base da página pública.
3. Separar estilos do editor visual.
4. Auditar `index.css`, `home-spacing-fixes.css`, `PreviewPublicSales.css` e `public-mobile-compact-header.css`.
5. Remover dependência de patches soltos quando possível.

### Regras

- CSS global só deve conter base compartilhada.
- CSS de template deve estar escopado.
- CSS de editor não pode afetar visitante comum.

### Saída esperada

- Menos conflito entre templates.
- Menos risco de regressão visual.
- Base clara para novos templates.

## Fase 4 — Resolver desktop real x desktop mobile

### Problema

O modo desktop do Chrome em celular não pode renderizar uma composição diferente do desktop real do notebook.

### Ações

1. Criar resolvedor `resolvePublicSalesPresentationMode()`.
2. Detectar e classificar:
   - mobile normal;
   - tablet;
   - desktop real;
   - desktop em navegador mobile.
3. Criar classe de documento para cada modo.
4. Garantir que `desktop-on-mobile` use a composição desktop real.
5. Desativar compactações mobile/tablet quando estiver em modo desktop-on-mobile.
6. Validar hero, imagem, botões, barra do apresentador, seções e grid.

### Regras

- Desktop em navegador mobile deve usar layout desktop.
- Não deve cair em tablet intermediário.
- Não deve empilhar o hero como mobile se o modo escolhido for desktop.
- Não deve ativar `PublicMobileCompactHeaderRuntime` no modo desktop-on-mobile.

### Saída esperada

- Desktop real e desktop mobile visualmente equivalentes em composição.
- Normal mobile continua com layout mobile.
- Tablet continua com layout tablet.

## Fase 5 — Reestruturar editor visual para contrato de template

### Ações

1. Trocar seleção por DOM/selector frágil por IDs canônicos de elementos.
2. Manter clique simples apenas para seleção.
3. Manter duplo clique para edição direta de texto.
4. Permitir mover apenas com ação real de drag.
5. Implementar snap/magnetismo.
6. Implementar reordenação inteligente em grids e listas.
7. Implementar resize com alças laterais e cantos.
8. Salvar layout por template e breakpoint.
9. Impedir perda de formatação textual.

### Regras

- O elemento não pode deslocar ao ser selecionado.
- Texto não pode perder cores parciais ao ser editado.
- Layout salvo no desktop não pode quebrar mobile.
- Layout salvo no mobile não pode quebrar desktop.
- Editor não pode capturar scroll indevidamente.

### Saída esperada

- Editor previsível.
- Layout persistido por template/breakpoint.
- Elementos editáveis por identidade lógica.

## Fase 6 — Criar contrato para novos templates

### Ações

1. Criar documentação técnica de criação de template.
2. Criar checklist de template novo.
3. Criar template mínimo de exemplo, se necessário.
4. Validar que novo template aparece no painel sem alterar a lógica pública.

### Saída esperada

- Novo template pode ser adicionado com baixo risco.
- Desenvolvedor sabe quais arquivos criar.
- O sistema se torna plug and play real.

## Fase 7 — Validação completa

### Ações

1. Rodar build.
2. Rodar typecheck.
3. Validar visualmente desktop real.
4. Validar desktop no Chrome mobile.
5. Validar tablet.
6. Validar mobile Android/iOS.
7. Validar troca de template.
8. Validar editor visual.
9. Validar fluxo público de pedido.
10. Validar tracking/referral.
11. Validar prova social e FAQ.

### Saída esperada

- Template oficial íntegro.
- Template premium íntegro.
- Conteúdo compartilhado.
- Desktop real e desktop mobile equivalentes.
- Editor visual funcional.
- Nenhuma regressão comercial crítica.

## Ordem obrigatória

1. Mapear.
2. Criar snapshot de conteúdo.
3. Criar registry.
4. Migrar templates atuais.
5. Resolver breakpoints e desktop mobile.
6. Reestruturar editor.
7. Validar.
8. Só depois adicionar novos templates.

## O que não fazer

- Não criar novo template copiando a página inteira.
- Não duplicar textos em cada template.
- Não resolver desktop mobile apenas diminuindo fonte.
- Não salvar layout absoluto para tudo.
- Não usar seletores instáveis como contrato definitivo.
- Não misturar CSS público, CSS de template e CSS administrativo.
- Não alterar fluxo de pedido como parte dessa refatoração.
