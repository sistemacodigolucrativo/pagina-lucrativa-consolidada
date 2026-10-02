# Checklist de Validação — Templates e Layout Responsivo

## Objetivo

Validar se a evolução da Página Pública de Vendas realmente entrega templates plug and play, responsividade visual e compatibilidade entre desktop real, desktop mobile, tablet e mobile.

## 1. Validação de conteúdo compartilhado

- [ ] O mesmo texto do hero aparece no template oficial e no template premium.
- [ ] O mesmo texto da descrição aparece em todos os templates.
- [ ] Os mesmos CTAs aparecem em todos os templates.
- [ ] Os mesmos dados do apresentador aparecem em todos os templates.
- [ ] Os mesmos canais sociais aparecem de forma condicional em todos os templates.
- [ ] A mesma prova social aparece em todos os templates.
- [ ] O mesmo FAQ aparece em todos os templates.
- [ ] Alterar um texto no painel altera esse texto em todos os templates.
- [ ] Trocar de template não apaga textos já cadastrados.
- [ ] Nenhum template possui cópia própria silenciosa dos textos principais.

## 2. Validação de template ativo

- [ ] O painel permite selecionar Template Oficial.
- [ ] O painel permite selecionar Template Premium.
- [ ] O template salvo permanece após recarregar.
- [ ] Visitantes veem o template ativo correto.
- [ ] Admin vê o mesmo template ativo que o visitante.
- [ ] Trocar template não quebra pedido, botões, links ou imagens.
- [ ] O template ativo é resolvido por registry, não por condicional frágil espalhada.

## 3. Validação desktop real

Validar em:

- [ ] 1280px.
- [ ] 1366px.
- [ ] 1440px.
- [ ] 1536px.
- [ ] 1920px.

Checar:

- [ ] Hero em composição desktop correta.
- [ ] Texto e imagem com proporção equilibrada.
- [ ] Botões alinhados e com tamanho coerente.
- [ ] Barra informativa posicionada corretamente.
- [ ] Faixa do apresentador organizada.
- [ ] Seções com grid correto.
- [ ] Cards sem compressão indevida.
- [ ] Sem overflow horizontal.
- [ ] Sem espaços vazios injustificados.
- [ ] Sem quebra visual entre seções.

## 4. Validação desktop no Chrome mobile

Cenário obrigatório:

- Celular Android.
- Google Chrome.
- Opção “Versão para computador” ativada.

Checar:

- [ ] A página usa a composição desktop real.
- [ ] O hero não vira layout mobile/tablet intermediário.
- [ ] A imagem principal aparece na mesma lógica do desktop real.
- [ ] Os botões aparecem como no desktop real.
- [ ] A barra do apresentador aparece como no desktop real.
- [ ] A compactação mobile não é ativada indevidamente.
- [ ] O cabeçalho compacto mobile não interfere no modo desktop.
- [ ] A ordem das seções é a mesma do desktop real.
- [ ] O layout pode ser comparado visualmente com print do notebook.

Critério: desktop mobile deve ser equivalente em composição ao desktop real, ainda que a escala visual seja diferente por causa da tela física menor.

## 5. Validação mobile normal

Validar em celular sem “versão para computador”.

- [ ] Layout mobile continua próprio para celular.
- [ ] Header mobile funciona.
- [ ] Menu abre e fecha.
- [ ] Conteúdo não fica minúsculo como desktop escalado.
- [ ] Não existe overflow horizontal.
- [ ] CTA continua acessível.
- [ ] Formulário/pedido continua funcional.

## 6. Validação tablet

- [ ] Layout tablet não é desktop quebrado.
- [ ] Layout tablet não é mobile esticado.
- [ ] Grids se ajustam corretamente.
- [ ] Header mantém proporção.
- [ ] Cards mantêm leitura confortável.
- [ ] CTA continua acessível.

## 7. Validação do editor visual

- [ ] Toggle ativa modo de edição visual.
- [ ] Toggle desativa modo de edição visual.
- [ ] Visitante comum não vê ferramentas de edição.
- [ ] Admin vê ferramentas apenas com modo ativo.
- [ ] Clique simples apenas seleciona elemento.
- [ ] Elemento não se move ao selecionar.
- [ ] Duplo clique ativa edição de texto.
- [ ] Drag só ocorre com ação real de arrastar.
- [ ] Resize funciona por alças.
- [ ] Snap/magnetismo alinha elementos.
- [ ] Reordenação inteligente funciona em grids.
- [ ] Scroll da página não trava indevidamente.
- [ ] Seleção acompanha scroll sem borda duplicada.
- [ ] Salvar persiste alterações.
- [ ] Descartar desfaz alterações pendentes.

## 8. Validação de textos editáveis

- [ ] Texto simples salva corretamente.
- [ ] Texto com duas cores preserva as duas cores.
- [ ] Texto com destaque parcial preserva destaque.
- [ ] Texto com span interno não vira texto plano indevidamente.
- [ ] Texto de botão preserva formato do botão.
- [ ] Texto de card preserva estrutura do card.
- [ ] Texto editado não sobrepõe conteúdo hardcoded.
- [ ] Recarregar mantém texto salvo.
- [ ] Abrir como visitante exibe texto correto.

## 9. Validação de layout persistido

- [ ] Alteração desktop salva apenas desktop.
- [ ] Alteração tablet salva apenas tablet.
- [ ] Alteração mobile salva apenas mobile.
- [ ] Alteração do Template Premium não altera Template Oficial indevidamente.
- [ ] Alteração do Template Oficial não altera Template Premium indevidamente.
- [ ] Ordem, posição, tamanho e visibilidade persistem após reload.
- [ ] Duplicação gera elemento independente.
- [ ] Exclusão/ocultação não remove código base de forma destrutiva.

## 10. Validação funcional pública

- [ ] CTA principal funciona.
- [ ] CTA secundário funciona.
- [ ] Acompanhar pedido funciona.
- [ ] Entrar funciona.
- [ ] Formulário de pedido funciona.
- [ ] Referral/apresentador funciona.
- [ ] Links sociais funcionam.
- [ ] WhatsApp funciona quando configurado.
- [ ] Prova social carrega.
- [ ] FAQ funciona.
- [ ] Footer funciona.

## 11. Validação técnica

- [ ] `pnpm check` sem erro.
- [ ] `pnpm build` sem erro.
- [ ] Sem erro crítico no console.
- [ ] Sem warning de hydration/render recorrente.
- [ ] Sem loop de MutationObserver.
- [ ] Sem degradação perceptível de performance.
- [ ] Sem XSS em campos editáveis.
- [ ] Endpoints administrativos exigem permissão admin.

## 12. Critério final de aprovação

A evolução só pode ser considerada concluída quando:

1. Templates usam conteúdo único.
2. Template ativo troca visual sem perder dados.
3. Desktop real e desktop mobile são equivalentes em composição.
4. Mobile normal continua mobile.
5. Tablet continua tablet.
6. Editor visual opera sem deslocamento acidental.
7. Layout é salvo por template e breakpoint.
8. Funcionalidades comerciais continuam intactas.
