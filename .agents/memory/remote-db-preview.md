---
name: Banco remoto no preview
description: Regra para conectar o Preview do Replit ao MySQL remoto sem alterar o contrato de produção.
---

O Preview do workspace usa `DATABASE_URL` quando disponível; caso contrário, monta uma URL MySQL a partir de `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER` e `MYSQL_PASSWORD`, codificando usuário, senha e banco. `REMOTE_DATABASE_URL` continua como fallback. Em produção, `DATABASE_URL` continua sendo a variável prioritária.

**Why:** `DATABASE_URL` é uma variável gerenciada pelo runtime do Replit e não deve ser configurada manualmente pelo fluxo de Secrets. Campos separados evitam que caracteres especiais da senha quebrem uma URL copiada sem percent-encoding, sem alterar o contrato de produção.

**How to apply:** Nunca registrar a URL ou a senha neste diretório. Para o Preview, configure os cinco campos `MYSQL_*` como variáveis/Secret e deixe a aplicação montar a URL. Ao preparar o deploy da VPS, use a `DATABASE_URL` própria da VPS e confirme que o fallback local não substitui essa variável.

No Preview, a existência de um Secret no painel não prova que o processo do workflow o recebeu. Confirme a presença booleana no processo ativo e execute uma consulta somente de leitura antes de afirmar que há conexão.

**Why:** Um diagnóstico do Preview encontrou `MYSQL_PASSWORD` e `REMOTE_DATABASE_URL` cadastrados, mas ausentes no processo do workflow; a aplicação ficou sem URL de banco apesar da configuração visual.

**How to apply:** Para confirmar conectividade, verifique apenas se a configuração foi carregada e rode `SELECT 1`; não exponha valores nem considere uma resposta HTTP com dados padrão como prova de conexão.

Valores opcionais de URL também podem ser strings vazias; `??` não avança para o fallback nesse caso.

**Why:** A URL montada para o Preview podia ser `""`, bloqueando a URL remota alternativa mesmo quando ela estivesse configurada.

**How to apply:** Ao escolher entre URLs opcionais, trate strings vazias como ausentes e mantenha o Preview separado da exigência de `DATABASE_URL` em produção.