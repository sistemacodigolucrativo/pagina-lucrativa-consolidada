---
name: Banco remoto no preview
description: Regra para conectar o Preview do Replit ao MySQL remoto sem alterar o contrato de produção.
---

O Preview do workspace compartilha intencionalmente o mesmo MySQL remoto usado pela VPS. Ele monta uma URL MySQL a partir de `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER` e `MYSQL_PASSWORD`, codificando usuário, senha e banco; `REMOTE_DATABASE_URL` continua como fallback. Em produção, `DATABASE_URL` continua sendo a variável prioritária.

**Why:** Como o Preview compartilha o banco da VPS, gravações nele afetam dados reais. `DATABASE_URL` também é gerenciada pelo runtime do Replit e não deve ser configurada manualmente pelo fluxo de Secrets; campos separados evitam que caracteres especiais quebrem a URL.

**How to apply:** Nunca registrar URLs ou senhas neste diretório. Trate qualquer gravação ou migração pelo Preview como operação em produção: só faça com autorização explícita. Após adicionar ou confirmar os campos `MYSQL_*`, reinicie o workflow e valide com `SELECT 1`. Ao preparar o deploy da VPS, confirme que a `DATABASE_URL` própria da VPS continua prioritária.

No Preview, a existência de um Secret no painel não prova que o processo do workflow o recebeu. Confirme a presença booleana no processo ativo e execute uma consulta somente de leitura antes de afirmar que há conexão.

**Why:** A existência de um Secret no painel não garante que o processo ativo já o recebeu; após a confirmação segura de um Secret, o processo passou a recebê-lo somente depois do reinício do workflow.

**How to apply:** Após adicionar ou confirmar um Secret, reinicie o workflow; então verifique apenas a presença da configuração e rode `SELECT 1`. Não exponha valores nem considere uma resposta HTTP com dados padrão como prova de conexão.

Valores opcionais de URL também podem ser strings vazias; `??` não avança para o fallback nesse caso.

**Why:** A URL montada para o Preview podia ser `""`, bloqueando a URL remota alternativa mesmo quando ela estivesse configurada.

**How to apply:** Ao escolher entre URLs opcionais, trate strings vazias como ausentes e mantenha o Preview separado da exigência de `DATABASE_URL` em produção.