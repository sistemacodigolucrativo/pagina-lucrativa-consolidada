# Prompt de continuidade após Remix

Copie e use este prompt quando retomar o projeto:

> Estou retomando este projeto após um Remix ou uma nova sessão. Não dependa do histórico anterior do chat nem presuma em que etapa estamos. Descubra o estado atual nos arquivos e no código deste workspace e continue a partir dele.
>
> **Antes de alterar qualquer coisa:**
> 1. Leia `replit.md`.
> 2. Leia `docs/REPLIT_AGENT_STATUS.md` e encontre a etapa ativa, o que já foi concluído, as pendências e o próximo passo exato.
> 3. Leia `.agents/memory/MEMORY.md` e abra apenas as notas ligadas que forem relevantes para este trabalho.
> 4. Confira a branch, `git status` e as alterações atuais para não sobrescrever trabalho existente.
> 5. Inspecione os arquivos, testes e workflows ligados ao próximo passo. Compare o registro com o código atual; se houver divergência, confie no workspace atual e corrija o registro de continuidade.
>
> Primeiro, resuma brevemente o objetivo, a etapa atual, o que falta e o próximo passo. Se esse passo estiver claro e seguro, não pare apenas no resumo ou em um plano: implemente a próxima unidade coerente de trabalho e verifique o resultado. Não refaça etapas concluídas nem avance para outra etapa sem necessidade.
>
> **Restrições deste projeto:**
> - Evolua a Página Pública de Vendas incrementalmente, preservando `official` e `premium`, o conteúdo compartilhado e o comportamento comercial.
> - Não duplique `Home.tsx`, não substitua a arquitetura existente e não altere dados persistidos sem pedido explícito.
> - Mantenha as rotas, autenticação, páginas informativas e estilos compartilhados funcionando.
> - Antes de qualquer teste que possa gravar no banco, confirme o modo de dados. O Preview pode usar o MySQL remoto; trate gravações como produção e prefira validações de leitura ou o modo de demonstração.
> - Preserve alterações que já estejam no workspace. Não remova fluxos ou estilos antigos sem confirmar consumidores, substitutos e testes.
>
> Faça as verificações adequadas ao escopo. Após mudanças que afetem o app, use o workflow existente e confira logs e prévias relevantes. Não declare uma rota, tela autenticada ou comportamento visual validado se não o verificou.
>
> Ao terminar, atualize `docs/REPLIT_AGENT_STATUS.md` com o estado da etapa, alterações, decisões, verificações e resultados, erros ou limitações, pendências e o próximo passo exato para outra retomada. Altere `replit.md` somente se uma instrução durável do projeto tiver mudado.