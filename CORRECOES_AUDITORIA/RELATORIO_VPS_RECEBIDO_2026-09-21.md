> Origem: relatório fornecido pelo usuário nesta conversa, produzido por outra IA conectada à VPS. O texto abaixo preserva as conclusões recebidas; não representa inspeção da VPS executada por este assistente. As ressalvas e correções de interpretação estão em PROGRESSO_CORRECOES.md e DECISOES_E_OPERACAO.md, na atualização de 21/09/2026.

# Relatório de auditoria operacional — Página Lucrativa Consolidada

**Data do exame:** 21/09/2026, horário de Brasília

**Ambiente:** VPS 201

**Escopo:** somente leitura

**Nenhum restart, deploy, pull, migration, alteração de schema, sync com escrita ou alteração de configuração foi executado.**

## 1. Serviço e versão em execução

**Item:** Serviço principal

**Status:** ativo

**Evidência:**

```text
pagina-lucrativa.service — active (running)
PID: 3396713
Usuário: ubuntu
Grupo: ubuntu
Node: v22.23.2
Porta: 3101
```

**Diretório de trabalho efetivo do processo:**

```text
/home/ubuntu/servicos/pagina-lucrativa/releases/20260920T012331Z-c2ab114d
```

**Symlink `current`:**

```text
/home/ubuntu/servicos/pagina-lucrativa/current
→ /home/ubuntu/servicos/pagina-lucrativa/releases/20260920T012331Z-c2ab114d
```

**SHA do release ativo:**

```text
c2ab114d8be7328b7a64eb60d1afb96841f2179c
```

## 2. Comparação com a branch corrigida

A branch remota auditada é:

```text
fix/auditoria-qualidade-aceitavel
```

SHA remoto confirmado:

```text
e9383934a6c460a62f466dbfb0dca66269ee2274
```

### Resultado

A VPS **não está executando a branch corrigida**.

```text
Release VPS:       c2ab114d8be7328b7a64eb60d1afb96841f2179c
Branch corrigida:  e9383934a6c460a62f466dbfb0dca66269ee2274
```

Além da divergência de SHA, foram verificadas diferenças diretas na árvore instalada.

Arquivos presentes na branch corrigida, mas ausentes no release ativo:

```text
server/_core/authConfig.ts
server/_core/csrf.ts
server/_core/databaseHealth.ts
server/memberContentPolicy.ts
scripts/lib/content-sync-backup.mjs
scripts/check-relational-integrity.mjs
```

Portanto, as correções da branch ainda não estão implantadas na VPS.

## 3. Banco de dados

**Item:** Banco efetivamente utilizado

**Status:** confirmado

**Banco:** MySQL compatível com MariaDB 10.11

**Método:**

Foi utilizada a configuração efetiva do serviço e uma conexão em transação somente leitura:

```sql
START TRANSACTION READ ONLY;
SELECT VERSION(), DATABASE();
```

A transação foi encerrada com `ROLLBACK`.

Resultado sanitizado:

```text
database: MySQL
serverVersionMajor: 10.11
databaseNamePresent: true
```

A configuração do serviço contém `DATABASE_URL`, e essa variável também chega ao processo ativo. `REMOTE_DATABASE_URL` não está presente no ambiente efetivo.

Os serviços locais do banco estavam ativos:

```text
mysql: active
mariadb: active
postgresql: active
```

A conexão comprovada pela aplicação foi a conexão MySQL/MariaDB. O socket local também existe, mas **não foi usado como prova de seleção do banco**, pois a aplicação recebe `DATABASE_URL`.

## 4. Administradores

Foi realizada uma consulta agregada somente leitura, sem exibir nomes, e-mails, IDs, hashes ou outros dados pessoais.

Resultado:

```text
Administradores com role=admin: 2
Método de login dos dois: local_demo
```

### Conclusão

**Não foi confirmada a existência de um administrador real.**

Os dois registros administrativos encontrados estão classificados como:

```text
local_demo
```

Além disso, o release instalado ainda contém `server/demoAuth.ts` e os endpoints administrativos utilizam `resolveDemoSession`.

A branch corrigida implementa uma política diferente:

- rejeita contas demo em produção;
- exige `ENABLE_LOCAL_AUTH=true` para login local real;
- valida sessão e credencial no banco;
- exige configuração explícita de segurança.

Essas proteções ainda não estão presentes no release ativo.

## 5. Configuração efetiva

O serviço utiliza:

```text
EnvironmentFile=/home/ubuntu/servicos/pagina-lucrativa/.env
NODE_ENV=production
PORT=3101
```

Variáveis presentes, sem exibição de valores:

```text
NODE_ENV
DATABASE_URL
JWT_SECRET
LOCAL_STORAGE_DIR
```

Variáveis obrigatórias da branch corrigida que estão ausentes:

```text
ENABLE_LOCAL_AUTH
PUBLIC_APP_ORIGIN
SECURITY_AUDIT_DIR
CONTENT_SYNC_BACKUP_DIR
ALLOW_VPS_SOCKET_DB
DEPLOY_RUNTIME_ENV_FILE
REMOTE_DATABASE_URL
```

### Impacto

O release antigo não possui os guards que fariam a ausência dessas configurações bloquear a inicialização. Portanto, a aplicação permanece ativa mesmo sem atender aos requisitos de configuração da branch corrigida.

Os valores de `DATABASE_URL`, `JWT_SECRET` e demais segredos não foram exibidos nem registrados.

## 6. Permissões e diretórios

### Configuração

```text
/home/ubuntu/servicos/pagina-lucrativa/.env
ubuntu:pagina-deploy 640
```

A permissão permite leitura pelo usuário do serviço, sem exposição pública direta.

### Diretórios relevantes

```text
/home/ubuntu/servicos/pagina-lucrativa
ubuntu:pagina-deploy 2775

/home/ubuntu/servicos/pagina-lucrativa/storage
ubuntu:ubuntu 750

/home/ubuntu/servicos/pagina-lucrativa/releases/<release>
pagina-deploy:pagina-deploy 2755
```

### Backups

Foi encontrado backup dentro da release:

```text
/home/ubuntu/servicos/pagina-lucrativa/releases/20260920T012331Z-c2ab114d/backups
```

Permissão observada:

```text
pagina-deploy:pagina-deploy 2755
```

Isso não atende ao padrão recomendado pela branch corrigida, que exige:

- diretório privado fora das releases;
- permissão `0700`;
- arquivos de backup com permissão `0600`;
- persistência independente da limpeza de releases.

Também não foi encontrada configuração efetiva para:

```text
SECURITY_AUDIT_DIR
CONTENT_SYNC_BACKUP_DIR
```

## 7. Proteções da versão instalada

| Proteção | Situação |
|---|---|
| Autenticação corrigida para produção | **Ausente no release ativo** |
| Bloqueio de contas demo em produção | **Não comprovado; código antigo usa `demoAuth`** |
| CSRF com validação de origem | **Ausente no `server/_core/index.ts` instalado** |
| Cookies `SameSite=Lax` em produção | **Não aplicado; código instalado usa `SameSite=None` quando HTTPS** |
| Endpoint `/api/healthz` | **Ausente no release ativo** |
| Seleção explícita de banco | **Configuração `DATABASE_URL` presente, mas guard da branch ausente** |
| Backup persistente fora das releases | **Ausente** |
| Diretório privado de auditoria | **Ausente na configuração** |
| Diagnóstico relacional read-only | **Arquivo ausente no release ativo** |
| Filtro de conteúdo administrativo interno | **Correção não presente no release** |

O endpoint `/api/healthz` não foi chamado porque sua implementação não existe no release ativo. Não foi enviado nenhum request mutável.

## 8. Verificações realizadas

Foram executadas somente consultas de leitura:

- status do `pagina-lucrativa.service`;
- configuração pública do systemd sem exibir ambiente;
- PID, usuário, grupo, diretório de trabalho e executável;
- versão do Node usado pelo processo;
- destino do symlink `current`;
- leitura do `.deployed-sha`;
- nomes de variáveis presentes no ambiente, sem valores;
- permissões de diretórios e arquivo `.env`;
- inspeção de arquivos de código instalados;
- consulta MySQL/MariaDB em transação `READ ONLY`;
- contagem agregada de administradores;
- classificação agregada por método de login;
- consulta da SHA remota da branch corrigida.

Não foram executados:

- deploy;
- restart ou reload;
- `git pull`, checkout, merge ou reset;
- migrations ou DDL;
- sync com `--apply`;
- login administrativo;
- requisições mutáveis;
- alteração de permissões;
- gravação na VPS.

## 9. Pendências por gravidade

### Críticas

1. **A VPS está usando uma versão anterior às correções de segurança.**
2. **Existem dois administradores classificados como `local_demo`; administrador real não confirmado.**
3. **A autenticação administrativa corrigida da branch ainda não está implantada.**
4. **A proteção CSRF corrigida ainda não está implantada.**
5. **A branch corrigida indica risco histórico relacionado a chave privada; a revogação/rotação não foi comprovada nesta auditoria.**

### Altas

1. Endpoint de saúde específico do banco ainda não está disponível.
2. Backup do sync está dentro da release e não em diretório persistente privado.
3. `SECURITY_AUDIT_DIR` e `CONTENT_SYNC_BACKUP_DIR` não estão configurados.
4. O release instalado não possui o novo diagnóstico relacional read-only.
5. O código antigo mantém fallback e políticas de banco anteriores às regras da branch corrigida.

## 10. Conclusão

A VPS está operacional e o serviço está ativo, mas **não está preparada para ser considerada alinhada ou validada segundo a branch `fix/auditoria-qualidade-aceitavel`**.

O banco está disponível e foi confirmado por consulta read-only. Foram encontrados dois administradores no banco, porém ambos estão classificados como `local_demo`; não foi confirmada uma conta administrativa real.

A próxima ação recomendada é uma implantação controlada da branch `e9383934...`, precedida por:

1. confirmação de administrador real;
2. configuração de `PUBLIC_APP_ORIGIN`;
3. confirmação de `JWT_SECRET` forte;
4. definição de `ENABLE_LOCAL_AUTH=true`, se o login local real for o mecanismo escolhido;
5. provisionamento de diretórios privados e persistentes para auditoria e backups;
6. validação do banco e do schema antes do deploy;
7. deploy autorizado;
8. `dry-run`/`check` do conteúdo;
9. health check do banco após a implantação.

Nenhuma dessas correções foi aplicada nesta auditoria.
