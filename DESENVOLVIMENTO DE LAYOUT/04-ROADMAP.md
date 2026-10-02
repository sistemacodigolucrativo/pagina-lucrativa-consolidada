# Roadmap — Sistema de Templates da Página Pública

## Objetivo

Organizar a evolução do sistema de templates em marcos objetivos, com entregáveis verificáveis e sem misturar documentação, arquitetura, implementação e validação.

## Marco 1 — Diagnóstico e baseline

### Entregáveis

- Inventário final de arquivos.
- Screenshots baseline.
- Registro das diferenças entre:
  - desktop real notebook;
  - desktop no Chrome mobile;
  - tablet;
  - mobile normal.
- Lista de estilos globais que afetam a página pública.
- Lista de pontos do editor visual que dependem de seletores DOM.

### Critério de conclusão

O estado atual está documentado e qualquer regressão pode ser comparada com o baseline.

## Marco 2 — Conteúdo canônico

### Entregáveis

- `PublicSalesContentSnapshot`.
- Resolver de conteúdo público.
- Migração dos fallbacks espalhados para um ponto único.
- Garantia de que todos os templates usam os mesmos textos.

### Critério de conclusão

Alterar um texto no sistema altera a exibição em todos os templates, sem duplicação manual.

## Marco 3 — Registry de templates

### Entregáveis

- `publicSalesTemplateRegistry`.
- Manifesto do template oficial.
- Manifesto do template premium.
- Resolução do template ativo via registry.
- Painel administrativo lendo os templates disponíveis pelo registry.

### Critério de conclusão

Trocar o template ativo muda a apresentação visual sem perder conteúdo e sem alterar a lógica comercial.

## Marco 4 — Separação de estilos

### Entregáveis

- CSS base da página pública.
- CSS do template oficial.
- CSS do template premium.
- CSS do editor visual isolado.
- Remoção ou incorporação controlada de patches soltos.

### Critério de conclusão

O CSS de um template não interfere no outro e o CSS administrativo não interfere na experiência pública.

## Marco 5 — Correção do modo desktop mobile

### Entregáveis

- Resolvedor de modo visual.
- Classe de documento para `desktop-on-mobile`.
- Regra de renderização desktop real no Chrome mobile com “versão para computador”.
- Desativação de compactações mobile/tablet nesse modo.
- Validação visual lado a lado com notebook.

### Critério de conclusão

A composição em desktop mobile corresponde ao desktop real em estrutura, ordem, hierarquia e posicionamento relativo.

## Marco 6 — Editor visual por contrato

### Entregáveis

- Elementos editáveis com IDs lógicos estáveis.
- Clique simples seleciona.
- Duplo clique edita texto.
- Drag real move.
- Resize com alças.
- Snap/magnetismo.
- Reordenação inteligente em grids/listas.
- Persistência por template e breakpoint.
- Preservação de estilos textuais.

### Critério de conclusão

O editor manipula elementos sem deslocamento acidental, sem perda de formatação e sem quebrar responsividade.

## Marco 7 — Primeiro template plug and play novo

### Entregáveis

- Template de prova registrado pelo novo sistema.
- Uso do mesmo conteúdo canônico.
- Estilos escopados.
- Suporte a desktop/tablet/mobile.
- Compatibilidade com editor visual.

### Critério de conclusão

Um novo template pode ser adicionado sem copiar a página inteira e sem duplicar lógica comercial.

## Marco 8 — Validação final

### Entregáveis

- Relatório de validação visual.
- Relatório de validação funcional.
- Relatório de regressões corrigidas.
- Checklist completo marcado.

### Critério de conclusão

Página pública, templates, editor visual, fluxo comercial, referral, métricas e prova social permanecem funcionais.

## Dependências críticas

1. Conteúdo canônico antes de template plug and play.
2. Registry antes de novos templates.
3. Política de breakpoint antes de editor avançado.
4. Editor por IDs estáveis antes de drag and drop avançado.
5. Validação desktop mobile antes de declarar responsividade concluída.

## Prioridade recomendada

1. Corrigir arquitetura de conteúdo.
2. Criar registry.
3. Resolver desktop mobile.
4. Reestruturar editor.
5. Criar novos templates.

## Risco principal

Tentar criar novos templates antes de separar conteúdo e apresentação.

Isso faria o sistema crescer duplicando textos, estilos, regras comerciais e bugs.
