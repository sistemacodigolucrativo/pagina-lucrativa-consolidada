# Implementação — fluxo racional do Painel do Membro

## Alterações realizadas

- `Primeiros passos` deixou de usar o componente multipropósito antigo e passou a possuir uma página própria e dinâmica (`MemberGettingStarted.tsx`).
- A jornada detecta configuração de perfil, recebimentos, primeira operação, primeiro clique e primeira conversão, direcionando cada etapa à ferramenta correta.
- `Fale conosco` agora possui componente dedicado (`MemberSupport.tsx`) e não carrega perfil, campanhas ou biblioteca.
- `Minha operação` foi reorganizada para apresentar primeiro métricas globais e depois métricas por operação individual.
- A interface usa o termo **Operação**; internamente o projeto preserva `campaign/campaignId` para compatibilidade técnica.
- Criação de operação passou a aceitar `source`, `medium` e `content`, reaproveitando os campos já existentes no schema.
- Analytics por operação agora agrega cliques, visitantes únicos, sessões, conversões e taxa de conversão.
- Cada operação possui URL própria de métricas: `/membros/operacao/{id}`.
- O menu do membro foi simplificado em uma sequência racional: Início → Minha página → Vendas → Rede → Conteúdo → Capacitação → Desempenho → Ajuda.
- Entradas redundantes foram removidas do menu, mas rotas antigas continuam compatíveis através de `MemberLegacyRedirect.tsx`.
- Links antigos de campanhas continuam preservados pela infraestrutura já existente de redirect público.
- O destaque da navegação de `Minha operação` permanece ativo também nas subrotas e páginas individuais de operação.
- Testes de arquitetura/rotas existentes foram atualizados para refletir o novo desenho.

## Compatibilidade preservada

Rotas legadas como `/membros/campanhas`, `/membros/convites`, `/membros/historico`, `/membros/automacoes`, `/membros/patrocinador` e rankings continuam aceitas e são redirecionadas para a fonte funcional atual.

## Validação executada neste ambiente

Os arquivos TypeScript/TSX alterados foram submetidos ao parser/transpilador TypeScript e não apresentaram erros sintáticos.

Não foi possível executar `pnpm check`, `pnpm test` e `pnpm build` neste ambiente porque o ZIP não contém `node_modules`, o binário `pnpm` não está instalado localmente e o ambiente não conseguiu acessar `registry.npmjs.org` para o Corepack baixar a versão definida no projeto.

Ao abrir o projeto em um ambiente com dependências disponíveis, executar:

```bash
pnpm install
pnpm check
pnpm test
pnpm build
```

Não considerar falhas futuras nesses comandos como já validadas por este documento; corrigir qualquer regressão encontrada antes de produção.
