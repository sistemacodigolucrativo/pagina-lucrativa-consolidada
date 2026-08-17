# Auditoria Visual — Página Lucrativa

## Evidência pública e escopo

A auditoria será conduzida diretamente sobre a versão publicada em `https://www.ocodigolucrativo.site/paginalucrativa/`, sem alterar a identidade escura e dourada, a estrutura comercial ou os componentes existentes. A referência de execução é o plano fornecido pelo solicitante em `pasted_content.txt`.

## Primeira dobra — desktop

**Classificação preliminar: crítico.** Na captura pública em viewport desktop, o título principal ocupa aproximadamente sete linhas e ultrapassa a altura útil da primeira dobra. A frase de apoio e os CTAs ficam abaixo de um bloco tipográfico muito dominante. A composição deverá reduzir a dependência do tamanho bruto por meio de largura de texto, agrupamento semântico, contraste de pesos e espaçamento, mantendo a ênfase nas palavras-chave douradas.

| Elemento | Observação inicial | Direção de auditoria |
| --- | --- | --- |
| Título do hero | Muitas linhas e termos isolados, com forte pressão vertical | Reduzir medida e tamanho de modo seletivo; preservar o destaque de “Página Lucrativa” e “PAGAMENTOS” por peso e cor |
| Linha de apoio | Chega após um bloco visualmente pesado | Reequilibrar distância e legibilidade para que complemente, não concorra |
| CTAs | Presentes, porém visualmente tardios na dobra | Reposicionar pela redução cirúrgica do título e ritmo vertical |
| Navegação | Visualmente compacta e coerente | Manter, salvo problema identificado em breakpoints menores |

Esta anotação é preliminar e será complementada com inspeção de todas as seções e dos breakpoints solicitados.

## Evidências comparativas registradas

| Breakpoint capturado na VPS | Classificação | Achado visual | Ajuste candidato |
| --- | --- | --- | --- |
| Desktop — 1440 × 900 | **Crítico** | O título do hero mantém a leitura e a paleta, mas avança abaixo da primeira dobra; a ação principal e a frase de apoio não são vistas no mesmo campo de leitura. | Reduzir seletivamente a escala e a largura do título, com maior prioridade em aproximar mensagem, apoio e CTA. |
| Smartphone pequeno — 320 × 568 | **Crítico** | O título chega à quinta linha antes de o conteúdo de apoio aparecer. O CTA inferior fixo cobre parcialmente a leitura do hero no recorte inicial. | Recalibrar a escala fluida, a medida e o ritmo vertical do hero; preservar o CTA sem ocultar texto. |

Em ambos os casos, a linguagem visual — fundo escuro, detalhes dourados e alternância de peso — é adequada e deve ser **mantida**. A intervenção deve atuar na proporção e na composição, não na identidade.

| Breakpoint capturado na VPS | Classificação | Achado visual | Direção de auditoria |
| --- | --- | --- | --- |
| Smartphone convencional — 390 × 844 | **Importante** | A leitura do título melhora em relação ao aparelho de 320 px, mas ainda demanda sete linhas e empurra o CTA principal para a borda inferior. | Conter o título em uma composição de quatro a cinco linhas, sem reduzir a evidência das palavras douradas. |
| Tablet — 768 × 1024 | **Refinamento** | O hero tem CTA e apoio visíveis na mesma dobra; há oportunidade de diminuir a área vazia e aproximar o objeto visual da narrativa. | Preservar a escala intermediária e ajustar apenas medida, alinhamento vertical e o início do elemento lateral. |

### Diretriz consolidada do hero

O hero deve deixar de depender de uma escala máxima de 79 px no desktop e de até 61 px no mobile. A revisão priorizará uma escala fluida mais contida, uma largura de coluna específica para cada breakpoint e uma redução de espaçamentos verticais onde isso recuperar o CTA na primeira dobra. A paleta, a alternância de palavras em dourado, o label e a composição com o cartão visual serão preservados.

## Landing completa — classificação por grupos

As capturas integrais foram produzidas diretamente na VPS em 1280 × 12000 e 390 × 15000. Elas confirmam que a arquitetura editorial, os fundos alternados, os índices de seção, os cartões de mídia e a sequência comercial devem ser **mantidos**. A oportunidade de intervenção concentra-se nos blocos de copy longa e no hero.

| Grupo de seção | Desktop | Mobile | Classificação | Decisão |
| --- | --- | --- | --- | --- |
| Navegação e marca | Compacta e legível | Compacta e legível | **Manter** | Não modificar proporção, cor ou CTA do cabeçalho. |
| Hero | Título ultrapassa a primeira dobra | Título domina a dobra e encontra o CTA fixo | **Crítico** | Refinar escala, medida e ritmo vertical. |
| Faixa de prova institucional | Leitura rápida | Empilhamento simples | **Manter** | Não alterar. |
| Blocos numerados de copy longa | Hierarquia coerente, porém títulos muito dominantes nas passagens mais longas | Muitos títulos ficam entre três e cinco linhas, tornando o ritmo repetitivo e pesado | **Importante** | Ajustar exclusivamente `.reference-copy h2`, a medida e o espaçamento desse grupo. |
| Blocos de vídeo e oferta | Boa alternância de conteúdo e contraste | Mantêm função comercial clara | **Refinamento** | Preservar escala-base; revisar apenas o espaçamento decorrente da nova tipografia. |
| CTA flutuante | Complementa a jornada | Pode cobrir o final do hero em telas curtas | **Importante** | Manter a presença, mas criar área segura para a leitura do hero e reduzir a intrusão visual. |
| Rodapé | Discreto e proporcional | Discreto e proporcional | **Manter** | Não modificar. |

### Escopo técnico de intervenção

1. **Hero:** aplicar uma escala fluida própria, reduzir a medida do título em desktop e mobile e manter a ênfase por peso e dourado. O objetivo é trazer frase de apoio e CTA para a primeira dobra sem remover a força comercial.
2. **Copy numerada:** reduzir somente a escala máxima e mínima dos títulos de narrativa longa, combinando largura máxima, `line-height` e espaçamento de bloco. O índice, a regra dourada e os CTAs permanecerão como marcadores de hierarquia.
3. **CTA fixo no mobile:** manter a ação disponível, porém reservar espaço inferior seguro e evitar que ele oclua texto. Não serão incluídas animações contínuas ou efeitos novos.
4. **Demais grupos:** serão preservados, pois já apresentam contraste, leitura e composição coerentes com a identidade editorial.

## Fechamento dos breakpoints restantes

| Breakpoint capturado na VPS | Resultado | Implicação de implementação |
| --- | --- | --- |
| Notebook — 1280 × 800 | Confirma o problema do hero: o título ocupa quase toda a altura útil e o conteúdo de conversão desaparece abaixo da borda. | O teto da escala desktop precisa ser reduzido e a coluna de texto deve ter largura mais controlada. |
| Smartphone grande — 430 × 932 | A leitura melhora, mas o CTA fixo aparece junto ao CTA do hero, criando duas ações douradas consecutivas com o mesmo rótulo. | O CTA flutuante continuará como atalho, mas será convertido em controle mais discreto nesse contexto ou terá sua exibição condicionada após o hero. |

Com as seis larguras solicitadas capturadas diretamente na VPS, a auditoria conclui que o refinamento deve se limitar ao hero, aos títulos de copy longa e ao comportamento do CTA flutuante em telas móveis. Não há justificativa visual para alterar marca, paleta, navegação, prova institucional, vídeos, oferta ou rodapé.

## Refinamento aplicado e validação publicada

O refinamento foi implementado diretamente na VPS na release `20260817-2215-cta-contextual`. A escala do hero foi reduzida de forma fluida, a coluna textual passou a ter medida mais controlada, os títulos de copy longa receberam escala e espaçamento próprios e o CTA flutuante em mobile agora só se torna interativo depois da saída do hero.

| Critério | Resultado na versão ativa |
| --- | --- |
| Hero em 1440 px | O título preserva contraste e ênfase dourada, mas libera espaço para o texto de apoio e as ações comerciais na primeira dobra. |
| Hero em 320 px | A abertura não apresenta mais CTA flutuante sobreposto; navegação, selo, título e conteúdo mantêm leitura clara. |
| Títulos de copy longa | A escala passou a responder separadamente do hero, reduzindo a recorrência de títulos excessivamente altos no mobile. |
| CTA flutuante | Permanece disponível como atalho após o hero e deixa de duplicar a ação inicial durante a abertura da página. |
| Identidade visual | Marca, paleta preta e dourada, estrutura editorial, contraste e elementos de prova foram mantidos sem alterações. |

Na validação complementar em **768 × 1024**, foi identificada uma duplicidade residual do CTA por o controle contextual estar restrito a 650 px. A regra foi estendida para tablet na release `20260817-2230-tablet-cta-contextual`, compilada e publicada diretamente na VPS. A nova captura confirma que o hero preserva apenas suas duas ações intencionais — primária e secundária — sem um terceiro CTA flutuante competindo pela atenção.

### Diff tipográfico confirmado na VPS

O diff da folha de estilos ativa, comparado à release anterior ao refinamento, confirma as seguintes mudanças efetivas: hero de `785 px / 164–110 px` para `720 px / 142–94 px`; grade de duas colunas reduzida para uma medida de leitura controlada; título principal de `clamp(46px, 6vw, 79px)` para `clamp(45px, 5.25vw, 70px)` com largura máxima de `610 px`; títulos gerais de `66 px` para `60 px`; e títulos mobile de `52–61 px` para `42–48 px`, com largura de caracteres e entrelinha específicas. Os blocos de copy longa passaram a usar medidas de até `700 px` em telas amplas e `18ch` em telas pequenas. A paleta, a família tipográfica e os pesos de destaque foram preservados.

### Revisão final antes da sincronização

As capturas atuais confirmam uma composição ampla estável em desktop e a remoção do CTA flutuante concorrente nas telas menores. Entretanto, a captura de **320 px** revelou que a linha monetária do título principal ainda não possui folga tipográfica suficiente: `R$50,00` encosta visualmente na quebra seguinte. Esse único ponto deve receber uma correção pontual de medida e entrelinha móvel antes de fechar a auditoria e sincronizar o refinamento.

Após o ajuste de medida móvel, a quebra vertical do título foi estabilizada nas seis larguras auditadas. A revisão visual final, porém, identificou uma questão localizada de **tracking** no token monetário `R$50,00`, perceptível em 320 px e também em desktop: a combinação de espaçamento negativo global do título torna `R$` visualmente comprimido. A correção final deve isolar apenas esse token como uma unidade sem quebra e com tracking neutro, preservando a copy e o ritmo de todo o restante do título.

### Aceite visual final

Na release `20260817-2255-hero-price-token`, o valor `R$50,00` passou a ser uma unidade sem quebra com tracking neutro. As capturas finais produzidas diretamente na VPS em **320 px** e **1440 px** confirmam leitura limpa do token, títulos sem colisão, CTA principal legível e composição preservada. As demais quatro larguras auditadas — 390, 430, 768 e 1280 px — foram recapturadas na mesma versão ativa como evidência de cobertura responsiva.
