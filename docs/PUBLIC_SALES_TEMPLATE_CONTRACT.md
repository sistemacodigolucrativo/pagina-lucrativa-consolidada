# Contrato para templates da Página Pública de Vendas

Este documento define como ampliar as apresentações públicas sem criar uma segunda fonte de conteúdo ou alterar os fluxos comerciais existentes.

## Fontes de verdade

- IDs, rótulos, descrições e normalização de IDs ficam em `shared/publicPageTemplate.ts`.
- O vínculo entre um ID e seu componente/wrapper fica em `client/src/pages/PublicSalesTemplateRegistry.tsx`.
- `PublicSalesTemplateRenderer` é o ponto de renderização usado pela página pública e pelas prévias.
- O componente recebe `PublicSalesContentSnapshot`; os textos, coleções, pedidos e demais comportamentos continuam compartilhados.

## Adicionar um template

1. Escolha um ID curto e permanente. Depois que um ID for persistido, não o renomeie nem o reutilize para outra apresentação.
2. Inclua o ID em `PUBLIC_PAGE_TEMPLATES` e registre `label` e `description` em `PUBLIC_PAGE_TEMPLATE_REGISTRY`, no mesmo commit.
3. Registre o componente e o wrapper em `PUBLIC_SALES_TEMPLATE_REGISTRY`.
   - Para uma variação apenas visual, reutilize `Home` e aplique um wrapper CSS específico.
   - Para uma composição realmente diferente, crie um componente de apresentação que receba `PublicSalesContentSnapshot`; não copie defaults nem a lógica comercial de `Home`.
4. Mantenha `PublicHome`, `/preview` e a prévia administrativa usando `PublicSalesTemplateRenderer`. Não introduza condicionais paralelas por template nas rotas.
5. Escopo estilos exclusivos sob o wrapper do template. Preserve estilos e contratos compartilhados usados pelos templates existentes.
6. Acrescente testes para normalização/fallback, metadados, registro do renderer, wrapper e preservação do snapshot compartilhado.

## Conteúdo, comportamento e persistência

- Preserve os IDs `official` e `premium`, seus rótulos/descrições atuais, o template padrão e seus comportamentos.
- A configuração do template ativo continua em `public-sales-layout` / `template`.
- Layouts visuais continuam em `public-sales-visual-editor` / `layout:{template}:{breakpoint}`, separados por template e breakpoint e validados como versão 1.
- Textos são obtidos do snapshot compartilhado; não mantenha uma cópia de conteúdo por template.
- Um template novo não exige nova categoria ou formato de dados. Não faça migração, seed ou gravação remota como parte do registro de apresentação.
- Para novos alvos repetíveis do editor visual, defina `data-public-visual-key` com uma chave de domínio estável. O ID resultante usa `{sectionId}.{kind}.{stableKey}`; o ID posicional v1 existente permanece como alias de leitura.
- Alvos sem chave estável continuam no formato posicional v1. Não derive uma chave persistida de texto visível, posição ou conteúdo que possa mudar.

## Validação mínima

- `pnpm check`.
- Testes de `shared/publicPageTemplate.test.ts` e `server/publicSalesTemplateRegistry.test.ts`.
- Testes do contrato do editor visual, incluindo leitura de IDs posicionais v1 e preservação da versão persistida.
- Renderização pública e prévias de cada template em desktop e mobile; não declarar testes administrativos autenticados ou em dispositivo físico sem executá-los.