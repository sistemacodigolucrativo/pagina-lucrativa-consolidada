# Relatório técnico — Cópia pública Violeta Neon e CTA flutuante

**Projeto:** `pagina-lucrativa-consolidada`  
**Data:** 26 de agosto de 2026  
**Escopo:** substituição visual do card de conversão da Home e CTA flutuante público

## 1. Auditoria do template original

O item denominado **“Violeta neon”** no Preview administrativo não é uma Home completa. Ele é uma instância do componente genérico `OfferPreviewCard`, usada na quinta variação da página privada `client/src/pages/Preview.tsx`, com a classe de tom `.offer-preview-violet`.

A auditoria confirmou que o card do Preview contém somente conteúdo visual de demonstração e não possui o formulário real, o submit tRPC, a atribuição de afiliado, a geração de código de acompanhamento ou o redirecionamento para pagamento. Portanto, não seria seguro trocar a Home pela instância privada diretamente.

## 2. Cópia independente

Foi criada a implementação pública independente `client/src/components/VioletaNeonActivationCard.tsx`, com estilos próprios `violeta-neon-*` em `client/src/index.css`. O componente não importa, altera ou compartilha estado com `OfferPreviewCard`.

O original permanece em `Preview.tsx` como:

> `OfferPreviewCard model="Modelo 05" title="Violeta neon" tone="violet" legacyClass="preview-model-05"`

A Home passou a utilizar a cópia no bloco real `#f`, preservando o layout editorial e todo o conteúdo das demais seções.

## 3. Funcionalidades preservadas e transportadas

A cópia pública recebe as propriedades do fluxo real e mantém o contrato de conversão existente.

| Funcionalidade | Tratamento |
|---|---|
| Formulário | Mantido com campos `fullName`, `email` e `whatsapp`. |
| Máscara e validação de WhatsApp | Mantidas pelo componente existente `PhoneInput`. |
| Normalização de e-mail | Mantida pela função `normalizeEmail` da Home. |
| Identificação de afiliado | Mantida pelo `affiliateSlug` calculado na Home. |
| Tracking e submissão | Mantidos pelo `trpc.applications.submit.useMutation`. |
| Código de acompanhamento e pagamento | Mantidos pelo `savePaymentAccessToken` e pelo redirecionamento original. |
| Estado de carregamento e erro | Repassados ao novo componente sem alterar o contrato. |
| Conteúdo comercial | Preço, benefícios, explicação da oferta e aviso de que o pagamento não é processado automaticamente foram preservados ou reorganizados visualmente. |
| Navbar, seções, vídeos, SEO e rodapé | Permanecem na Home atual. |

## 4. CTA flutuante público

Foi criado `client/src/components/PublicConversionCta.tsx`, montado uma única vez no roteador compartilhado. Ele aparece somente em rotas públicas elegíveis e aponta para `/#f`, o fluxo principal de conversão.

O CTA é compacto no desktop e mantém área de toque mínima de **52 px** no mobile. Quando o formulário `#f` está visível, o CTA desaparece para não cobrir campos ou o botão de submissão. Ele usa `IntersectionObserver`, considera a rota atual e não aparece em `/membros`, `/admin`, `/preview`, `/pedido/*` ou caminhos desconhecidos.

A posição foi definida em relação aos elementos flutuantes existentes: o CTA fica separado do Chat de membros e o toast de atividade ilustrativa permanece em uma camada superior, acima do Chat. A implementação usa safe area inferior e não provoca overflow horizontal.

## 5. Validação do Preview

No preview do workspace, a Home mostrou o card público Violeta Neon com selo, preço, benefícios, campos reais e botão de ativação. A navbar simplificada, a seção de estrutura digital, o rodapé, o Chat de membros e o toast transparente permaneceram presentes.

O E2E também acessou o Preview administrativo autenticado e confirmou que o modelo original `.offer-preview-violet` continua presente, enquanto o componente público `.violeta-neon-activation-card` não é renderizado naquela área.

Preview: <https://3001-ig9wz4zrmhdz0xelue3wj-d6a781b2.us4.manus.computer/>

## 6. Validações automatizadas

| Validação | Resultado |
|---|---|
| `pnpm check` | Aprovado. |
| `pnpm test` | Aprovado: 61 arquivos e 196 testes. |
| `pnpm build` | Aprovado. O aviso de chunk grande é informativo e não bloqueou o build. |
| E2E Violeta Neon/CTA | Aprovado em 390 px, 768 px e 1280 px. |
| E2E do toast global | Mantido e aprovado em desktop/mobile. |
| E2E de formulário, e-mail e WhatsApp | Mantidos na suíte pública. |
| Contratos estruturais | Confirmam isolamento do Preview original, montagem única do CTA e preservação da Home. |
| `git diff --check` | Aprovado antes do commit. |

## 7. Publicação

A produção foi verificada antes desta alteração e estava ativa no release `20260826-unified-7862e83`, respondendo HTTP 200. Após as validações, o commit `f01ef532b5bc289cf501711826e7ec7b6c0749c3` foi enviado à `main` e publicado no release isolado `20260826-unified-f01ef53`. O symlink `current` aponta para esse release, `pagina-lucrativa.service` está ativo e o endpoint local responde HTTP 200. A verificação pública de `https://ocodigolucrativo.site/` confirmou a navbar, o CTA flutuante, o formulário real e o conteúdo da Home. O ambiente `/dev` permanece removido e responde HTTP 410.

O SHA completo está alinhado entre workspace, `origin/main`, marcador do release e produção:

> `f01ef532b5bc289cf501711826e7ec7b6c0749c3`

A produção mantém os 52 HTMLs de e-books empacotados. Nenhum arquivo sensível foi incluído no release, e o template original do Preview continua separado da cópia pública.
