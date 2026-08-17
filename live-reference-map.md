# Mapa funcional — paginalucrativa.com.br

## Estrutura pública observada

| Ordem | Bloco | Copy e função observadas | Destino esperado |
|---:|---|---|---|
| 1 | Navegação | Início, Depoimentos, Personalizar e Escritório Virtual. | Âncoras e rotas de personalização/escritório. |
| 2 | Cabeçalho de convite | Identifica o empreendedor responsável, apresenta WhatsApp e oferece contato. | Ação de WhatsApp. |
| 3 | Hero | “Tenha sua Página Lucrativa Online…” com promessa de pagamento direto e CTA “Faça parte”. | Âncora para o formulário de pedido. |
| 4 | Vídeo explicativo | “Como funciona o sistema”. | Player incorporado. |
| 5 | Conteúdo comercial | Sequência de explicação sobre renda online, página própria, autonomia, pagamentos diretos e funcionamento contínuo. | Repetições do CTA para o formulário. |
| 6 | Confiança institucional | Informações de longevidade, participantes e proposta do sistema. | Conteúdo institucional. |
| 7 | Oferta e pedido | Apresenta R$ 50,00, pagamento ao convidante, senha especial para personalização e formulário nome/e-mail/WhatsApp. | Envio do pedido. |
| 8 | Rodapé | Copyright e contador de visitas. | Identidade institucional. |

## Regras de equivalência

1. A Página Lucrativa 2026 deve preservar a copy e a ordem funcional da referência nos blocos institucionais, CTAs, oferta e fluxo de pedido.
2. Os CTAs “Faça parte” devem sempre conduzir ao mesmo formulário de pedido, e o formulário deve conduzir a uma confirmação/instrução de acesso.
3. O atalho “Escritório Virtual” deve levar ao escritório de membros, enquanto “Personalizar” deve levar à experiência de configuração após a confirmação do pedido.
4. Não serão reproduzidos nomes, fotos, depoimentos, avaliações, lista de “últimos cadastrados”, contador de pessoas online ou resultados de terceiros. Esses são dados pessoais ou prova social de usuário, não conteúdo editorial do produto.

## Equivalências implementadas

| Elemento público | Destino implementado | Comportamento |
|---|---|---|
| “Faça parte” no hero, em cada bloco e no botão flutuante | `#f` | Desloca para o mesmo formulário de pedido. |
| Formulário de participação | `/pedido/confirmacao` | Registra nome, e-mail e WhatsApp no fluxo de pedidos e apresenta a próxima etapa. |
| “Entender a personalização” | `/personalizar` | Mostra as instruções antes de abrir as configurações. |
| “Ir para o Escritório” e “Abrir configurações” | `/membros` | Direciona para o Escritório Virtual autenticado. |
| Menu “Depoimentos” | `#videos` | Leva aos vídeos públicos incorporados da referência. |
