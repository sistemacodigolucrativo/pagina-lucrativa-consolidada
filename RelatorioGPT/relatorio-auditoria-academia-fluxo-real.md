# Relatório Técnico - Refatoração da Academia

Data: 2026-09-06
Branch local: `academia-fluxo-real`
Base: `origin/main` em `83d7b80`
Deploy temporário validado: `https://ocodigolucrativo.site/`

Atualização em 2026-09-07: removida redundância visual do card `Novo material PDF` na tela administrativa.

## 1. Causa raiz encontrada

A Academia estava ambígua entre três fluxos: cursos legados (`courses`), e-books administrativos (`ebooks`) e listagem do membro. O admin podia alterar um estado sem que a área do membro lesse a mesma regra/fonte de dados.

A correção adotada no curto prazo foi tornar `ebooks` a fonte operacional dos materiais PDF da Academia, usando a metadata compatível `codigo-lucrativo-academy` para curso, categoria, nível e ordem. A tabela `courses` ficou apenas como compatibilidade temporária.

## 2. O que foi implementado

- Domínio compartilhado `Academy` com status canônicos `draft`, `published` e `archived`.
- Serviço canônico `server/academyService.ts` para admin e membro.
- Namespace tRPC novo: `admin.academy` e `member.academy`.
- Aliases antigos preservados para evitar quebra imediata.
- Tela nova `AdminAcademy.tsx` baseada no fluxo de PDF existente.
- Tela nova `MemberAcademy.tsx` usando `ResponsiveEbookFrame` como leitor oficial.
- Wrappers temporários em `AdminEbooks.tsx` e `MemberCourses.tsx`.
- Remoção da tela antiga `AdminCourses.tsx`.
- Testes novos para helpers, agrupamento, visibilidade e contratos de rota.
- Formulário `Novo material PDF` deixou de aparecer automaticamente na entrada de `/admin/academia`.
- Aviso de visibilidade movido para o topo da área de cursos e materiais, acima do botão `Novo material`.

## 3. Fases do plano concluídas

Concluídas:

- Arquitetura canônica da Academia.
- Reaproveitamento de `ebooks`, metadata `codigo-lucrativo-academy`, `courseProgress` e `ResponsiveEbookFrame`.
- Renomeação progressiva sem quebrar rotas.
- Centralização de tipos e regras em `shared/academy.ts`.
- Backend canônico em `server/academyService.ts`.
- Namespace tRPC canônico com aliases antigos.
- Refatoração inicial de `/admin/academia`.
- Refatoração inicial de `/membros/academia`.
- Testes de status, agrupamento, metadata e rotas.
- Build e deploy temporário na VPS.

Parcial:

- Quebra fina em arquivos menores de componentes ainda ficou dentro de `AdminAcademy.tsx` e `MemberAcademy.tsx` nesta rodada para evitar reescrita ampla.

## 4. Arquivos alterados

- `shared/academy.ts`
- `shared/academy.test.ts`
- `server/academyService.ts`
- `server/academyService.test.ts`
- `server/db.ts`
- `server/routers.ts`
- `server/courses.integration.test.ts`
- `server/ebooks.integration.test.ts`
- `client/src/App.tsx`
- `client/src/pages/AdminAcademy.tsx`
- `client/src/pages/AdminCourses.tsx` removido
- `client/src/pages/AdminEbooks.tsx`
- `client/src/pages/MemberAcademy.tsx`
- `client/src/pages/MemberCourses.tsx`
- `client/src/pages/MemberOffice.tsx`
- `RelatorioGPT/relatorio-auditoria-academia-fluxo-real.md`

## 5. Reaproveitado do código existente

- Upload/armazenamento via `storagePut`.
- Tabela `ebooks` e enum atual de status.
- Metadata HTML como compatibilidade.
- Progresso via `courseProgress`.
- Rotas existentes `/admin/academia`, `/admin/ebooks`, `/membros/academia` e `/membros/curso/:courseKey`.
- `ResponsiveEbookFrame` para leitura do PDF.
- tRPC, Drizzle, Vite, React e padrões visuais já existentes.

## 6. O que não foi reescrito de propósito

- Não houve migração estrutural de banco.
- Não foram removidas tabelas legadas.
- Não foi criada nova tabela `academyCourses` ou `academyMaterials`.
- Não foi alterada a página pública de vendas.
- Não foi alterado o fluxo geral de autenticação, pagamento, afiliado ou tracking.
- Não foi substituído o leitor PDF oficial.

## 7. Regras antes/depois

Antes:

- Admin e membro podiam depender de contratos diferentes entre `courses` e `ebooks`.
- `courses.isPublished` não representava bem o domínio novo da Academia.

Depois:

- Material aparece para membro somente se `status === "published"` e possuir `courseTitle`/`courseSlug`.
- `draft` não aparece para membro.
- `archived` não aparece para membro.
- Publicado sem curso não aparece para membro e vira pendência administrativa.
- Progresso ausente retorna `0%`.

## 8. Endpoints revisados

Canônicos:

- `admin.academy.list`
- `admin.academy.detail`
- `admin.academy.createMaterial`
- `admin.academy.updateMaterial`
- `admin.academy.setMaterialStatus`
- `admin.academy.archiveMaterial`
- `member.academy.listCourses`
- `member.academy.courseByRouteKey`
- `member.academy.updateProgress`

Aliases mantidos:

- `admin.ebooks`
- `admin.ebook`
- `admin.courses`
- `admin.createCourse`
- `admin.updateCourse`
- `admin.updateCoursePublication`
- `admin.updateCourseStatus`
- `member.courses`
- `member.course`
- `member.updateCourseProgress`

## 9. Tabelas/campos afetados

Tabela usada como fonte principal:

- `ebooks`: `id`, `title`, `summary`, `sourceFile`, `sourcePath`, `htmlContent`, `status`, `publishedAt`, `updatedAt`.

Tabela reaproveitada:

- `courseProgress`: `userId`, `courseId`, `progressPercent`, `lastAccessedAt`.

Tabela preservada como legado:

- `courses`.

Não houve alteração em `drizzle/schema.ts`.

## 10. Duplicidades e placeholders

Removido como tela ativa:

- `AdminCourses.tsx`.

Reduzido:

- lógica paralela de curso administrativo.
- mistura visual entre "curso" e "e-book avulso".
- redundância entre botão `Novo material` e card/formulário `Novo material PDF` aberto automaticamente.

Placeholders crus verificados nos testes:

- `{{COURSE...}}`
- `{{course...}}`
- `Course thumbnail`
- `Course title`

Resultado: não aparecem em `MemberAcademy.tsx`.

## 11. Testes executados

- `pnpm check`
- `pnpm test`
- `pnpm build`
- Deploy temporário via `scripts/deploy-vps.sh`
- HTTP público em `https://ocodigolucrativo.site/`
- Validação funcional real na VPS com criação, publicação, edição, progresso e arquivamento de materiais temporários.
- Validação estática do comportamento do admin: aviso acima do botão e formulário condicionado a clique/seleção.

## 12. Resultado

Typecheck:

- `pnpm check`: OK.

Testes:

- `pnpm test`: OK.
- 69 arquivos de teste passaram.
- 250 testes passaram.

Observação: apareceu stderr conhecido no teste `server/context.auth.test.ts` por tentativa local de leitura MySQL sem senha do usuário `ubuntu`, mas a suíte passou.

Build:

- `pnpm build`: OK.
- Assets gerados: `index-CZg1IrFd.js`, `index-B8daDLYS.css`, `pdf.worker.min-yatZIOMy.mjs`.

Deploy temporário:

- OK.
- Release: `/home/ubuntu/servicos/pagina-lucrativa/releases/20260907T133824Z-88cd0c67`
- Hash: `88cd0c67da8076176aad1e5dfe042a1592975105`
- Serviço: `pagina-lucrativa` ativo.
- HTTP público: `200`.

## 13. Validação funcional na VPS

Fluxo real validado contra o banco da VPS:

- criar material PDF como `draft`;
- confirmar que `draft` não aparece para membro;
- publicar material;
- criar segundo material publicado no mesmo curso;
- confirmar agrupamento do curso com 2 materiais;
- editar título, categoria, nível e resumo;
- confirmar que a edição refletiu na área de membro por `routeKey`;
- confirmar entrega de `pdfUrl` para o leitor;
- atualizar progresso para `40%`;
- arquivar materiais;
- confirmar que curso arquivado não aparece para membro;
- confirmar que materiais arquivados continuam auditáveis no admin;
- remover registros temporários de teste.

Resultado da validação:

```json
{
  "ok": true,
  "checks": [
    "draft-hidden",
    "published-visible",
    "edit-reflected",
    "progress-40",
    "archived-hidden",
    "admin-auditable"
  ]
}
```

Limpeza confirmada:

```json
{
  "remainingTestRows": []
}
```

## 14. O que não pôde ser validado

- Não foi feita validação visual autenticada por navegador nos viewports 1440, 1024 e 390 porque o projeto não possui Playwright instalado nesta branch.
- As rotas foram validadas por HTTP público (`200`) e o fluxo foi validado diretamente no backend publicado.
- Não foi feito push remoto. A rotina exige validação humana antes do push.

## 15. Riscos restantes

- A Academia ainda usa metadata dentro de `htmlContent`; isso é compatível e seguro para curto prazo, mas menos explícito do que colunas próprias.
- `courseProgress.courseId` usa ID determinístico derivado do slug do curso enquanto não existe tabela canônica `academyCourses`.
- A separação fina de componentes pode ser feita depois, sem alterar comportamento.
- Upload de thumbnail dedicado ainda não existe no modelo canônico.

## 16. Próximos passos recomendados

- Validar visualmente no domínio oficial com login admin/membro.
- Após aprovação visual, fazer commit e push na branch `academia-fluxo-real`.
- Em rodada futura, considerar migração leve para campos explícitos de Academia em `ebooks`.
- Depois de estabilizar, remover aliases antigos que ainda apontam para cursos/e-books legados.
