# Auditoria visual do banner e plano de identidade

## Estado atual

O banner superior é um arquivo rasterizado de 1774 × 887 pixels, utilizado por `TopPromoBanner` em `client/src/pages/Home.tsx`. O texto e o botão visual “QUERO COMEÇAR AGORA” estão incorporados na própria imagem; portanto, remover somente um elemento React não seria suficiente. A alteração deverá ser feita na imagem por edição visual, preservando composição, smartphone, logo, brilho, fundo e demais textos.

## Paleta extraída

A análise determinística do raster identificou uma identidade baseada em preto azulado profundo, verde esmeralda, verde neon e mint claro. A tabela abaixo registra as cores dominantes agrupadas por quantização de 24 cores e será complementada por cores exatas recorrentes do arquivo antes da substituição dos tokens CSS.

| Função visual | HEX de referência | Uso pretendido |
| --- | --- | --- |
| Preto azulado principal | `#000105` | Fundo global e áreas de maior contraste |
| Preto profundo | `#000001` | Fundo de seções e composição do banner |
| Azul-marinho quase preto | `#00060D` | Superfícies, header e variações de fundo |
| Verde profundo | `#01281B` | Painéis, estados escuros e contraste intermediário |
| Verde estrutural | `#014D2B` | Bordas, divisores, fundos de apoio e elementos secundários |
| Verde médio | `#029E41` | Estados ativos, ícones e acentos de apoio |
| Verde neon principal | `#03D660` | CTA, foco, destaques e elementos de ação |
| Mint claro | `#ABF6D0` | Tipografia clara, títulos destacados e contraste sobre fundos escuros |
| Verde acinzentado | `#99C3B3` | Texto secundário e apoio |
| Verde dessaturado | `#25493F` | Linhas, superfícies discretas e estados desativados |

## Pontos que receberão imagens

A página já possui imagens históricas em alguns blocos. Para evitar decoração sem função, as novas imagens serão concentradas em três funções: explicar a estrutura replicável, visualizar a jornada de ativação e personalização e reforçar a comparação entre construir sozinho e operar uma base existente. As imagens serão conceituais, sem textos longos embutidos, para que títulos, etapas e acessibilidade permaneçam no HTML.

A imagem do mecanismo será usada junto ao bloco “Conheça a Estrutura Digital Replicável”; a imagem da jornada será usada junto ao bloco “Da ativação aos primeiros passos da sua operação”; e a imagem de valor/stack será usada no bloco de comparação ou no bloco “O que existe por trás”. Cada arquivo será um asset autônomo, com proporção ampla e comportamento responsivo por `width: 100%`, `height: auto` e `object-fit: cover` apenas quando o enquadramento não sacrificar conteúdo.

## Restrições de implementação

As alterações não devem modificar containers, grids, alinhamentos ou breakpoints que já funcionam. A barra de navegação permanece abaixo do banner. A remoção do CTA será aplicada ao arquivo rasterizado por edição visual e não por sobreposição que esconda parte da composição. Nenhum push remoto será feito após esta tarefa.

## Paleta aplicada

Os tokens globais foram harmonizados com as cores dominantes identificadas no raster do banner. Foram usados os seguintes valores HEX presentes na análise do arquivo:

| Token | HEX aplicado | Papel |
| --- | --- | --- |
| `--background` | `#000105` | Fundo principal azul-preto |
| `--foreground` / `--ivory` | `#ABF6D0` | Texto claro e hierarquia principal |
| `--muted` | `#99C3B3` | Texto secundário |
| `--panel` | `#01090E` | Painéis e cartões escuros |
| `--panel-soft` | `#011514` | Superfícies secundárias |
| `--gold` | `#03D660` | Acento de ação e destaque |
| `--gold-bright` | `#ABF6D0` | Acento claro e contraste |
| `--gold-deep` | `#014D2B` | Gradientes e profundidade |

Os nomes históricos `gold` foram mantidos como variáveis internas para evitar refatoração ampla da arquitetura; seus valores agora pertencem à paleta verde/mint do banner. Vermelho foi preservado somente para o controle de fechamento e mensagens de erro, por possuir função semântica própria.

## Validação final

A verificação local passou em TypeScript, suíte unitária/integração, build de produção e teste visual Playwright nos breakpoints desktop `1440×900`, tablet `1024×768` e mobile `390×844`. Em todos os três contextos, o banner, o botão acessível, a navegação e as três imagens estratégicas foram encontrados; as imagens carregaram em `2560×1440`, não houve overflow horizontal e o fechamento removeu o banner, fazendo a navegação assumir `top: 0`.

O banner canônico agora é `client/public/codigo-lucrativo-banner.png` na versão editada sem o botão rasterizado “QUERO COMEÇAR AGORA”. As imagens estratégicas são `structure-mechanism.png`, `structure-journey.png` e `structure-value-stack.png`.
