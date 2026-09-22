# Atualização VPS — Toast público

Este documento descreve o procedimento completo para testar e aplicar, em VPS, a correção que separa os registros técnicos do Toast das Publicações comuns.

## Objetivo da atualização

A atualização corrige o cenário em que modelos e configurações técnicas do Toast aparecem em **Administração > Publicações** como texto bruto/JSON.

Depois da atualização:

- **Publicações** deve listar apenas conteúdos comuns.
- **Toast** deve concentrar os modelos e configurações das notificações flutuantes.
- Os registros antigos com categoria `Toast` são migrados para a categoria técnica `public-toast-config`.
- Os modelos e a configuração padrão do Toast são criados se estiverem ausentes no banco.
- Nenhum registro existente é apagado pelo script de sincronização.

## Arquivos envolvidos

- `shared/publicToastSystem.ts`
  - Define a categoria técnica atual `public-toast-config`.
  - Define os modelos padrão do Toast.
  - Define a configuração padrão do Toast.

- `scripts/sync-public-toast-content.mjs`
  - Migra registros antigos de `Toast` para `public-toast-config`.
  - Insere modelos padrão ausentes.
  - Insere configuração global ausente.
  - Possui modo seguro de dry-run sem `--apply`.

- `client/src/pages/AdminPublications.tsx`
  - A tela Publicações já oculta categorias técnicas como `public-toast-config`.

## Pré-requisitos

Antes de executar, confirme:

- acesso SSH à VPS;
- acesso ao diretório do projeto em produção;
- acesso ao banco MySQL/MariaDB usado pela aplicação;
- `git`, `node`, `pnpm` e cliente `mysql/mysqldump` disponíveis na VPS;
- arquivo `.env` existente e com `DATABASE_URL` válido, ou banco acessível pelo socket local `/run/mysqld/mysqld.sock`.

O script usa esta ordem para conectar ao banco:

1. `DATABASE_URL`;
2. `REMOTE_DATABASE_URL`;
3. socket local `/run/mysqld/mysqld.sock`, usando `DB_SOCKET_USER` ou `ubuntu`, e `DB_SOCKET_DATABASE` ou `pagina_lucrativa`.

## 1. Entrar na VPS e ir para o projeto

```bash
ssh ubuntu@SEU_IP_OU_DOMINIO
cd /home/ubuntu/servicos/pagina-lucrativa/current
```

Se o projeto estiver em outro caminho, ajuste o `cd`.

## 2. Registrar o estado atual antes de mexer

```bash
pwd
git status
git branch --show-current
git rev-parse HEAD
node -v
pnpm -v
```

Anote o branch e o commit atual. Eles são o ponto de retorno caso seja necessário desfazer a atualização.

Também salve em variáveis para facilitar:

```bash
export BEFORE_BRANCH=$(git branch --show-current)
export BEFORE_COMMIT=$(git rev-parse HEAD)
echo "Branch anterior: $BEFORE_BRANCH"
echo "Commit anterior: $BEFORE_COMMIT"
```

## 3. Conferir o ambiente do banco

```bash
ls -la .env
printenv DATABASE_URL | sed 's/:.*@/:***@/'
```

Se a aplicação usa `.env` e a variável não aparece em `printenv`, confira sem expor segredo na tela:

```bash
grep -E '^(DATABASE_URL|REMOTE_DATABASE_URL|DB_SOCKET_USER|DB_SOCKET_DATABASE)=' .env | sed 's/:.*@/:***@/'
```

## 4. Fazer backup do banco antes da sincronização

Crie uma pasta de backups:

```bash
mkdir -p ~/backups/pagina-lucrativa
```

### Opção A — backup usando DATABASE_URL do `.env`

Se o `.env` possui `DATABASE_URL=mysql://...`, use este comando Node para gerar variáveis temporárias:

```bash
node - <<'NODE'
import 'dotenv/config';
const value = process.env.DATABASE_URL || process.env.REMOTE_DATABASE_URL;
if (!value) throw new Error('DATABASE_URL ou REMOTE_DATABASE_URL não encontrada.');
const url = new URL(value);
console.log(`export DB_HOST='${url.hostname}'`);
console.log(`export DB_PORT='${url.port || 3306}'`);
console.log(`export DB_USER='${decodeURIComponent(url.username)}'`);
console.log(`export DB_PASS='${decodeURIComponent(url.password)}'`);
console.log(`export DB_NAME='${url.pathname.replace(/^\//, '')}'`);
NODE
```

Copie e execute as linhas `export` exibidas. Depois rode:

```bash
mysqldump \
  -h "$DB_HOST" \
  -P "$DB_PORT" \
  -u "$DB_USER" \
  -p"$DB_PASS" \
  --single-transaction \
  --routines \
  --triggers \
  "$DB_NAME" \
  > ~/backups/pagina-lucrativa/pagina_lucrativa_before_toast_$(date +%Y%m%d_%H%M%S).sql
```

### Opção B — backup usando socket local

Use se o banco roda localmente e o projeto acessa `/run/mysqld/mysqld.sock`:

```bash
mysqldump \
  --socket=/run/mysqld/mysqld.sock \
  -u "${DB_SOCKET_USER:-ubuntu}" \
  --single-transaction \
  --routines \
  --triggers \
  "${DB_SOCKET_DATABASE:-pagina_lucrativa}" \
  > ~/backups/pagina-lucrativa/pagina_lucrativa_before_toast_$(date +%Y%m%d_%H%M%S).sql
```

Confirme que o backup foi criado:

```bash
ls -lh ~/backups/pagina-lucrativa | tail
```

## 5. Buscar e entrar na branch de correção

```bash
git fetch origin fix/toast-seeds-publications-filter
git checkout fix/toast-seeds-publications-filter
git pull --ff-only origin fix/toast-seeds-publications-filter
```

Confirme:

```bash
git branch --show-current
git rev-parse HEAD
```

## 6. Instalar dependências e validar build

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

Se algum desses comandos falhar, pare a atualização e não reinicie a produção ainda. Guarde a mensagem de erro.

## 7. Conferir o estado atual dos registros de Toast no banco

Execute o script em modo seguro, sem alterar nada:

```bash
node scripts/sync-public-toast-content.mjs
```

Saída esperada: ele deve mostrar algo parecido com:

```text
[public-toast] Estado atual: {
  legacyToastRows: 7,
  currentToastRows: 0,
  currentTemplates: 0,
  currentSettings: 0
}
[public-toast] Dry-run concluído. Execute com --apply para aplicar a sincronização.
```

Os números podem variar. O importante é o script executar sem erro.

## 8. Aplicar a sincronização do Toast no banco

Depois do backup e do dry-run sem erro:

```bash
node scripts/sync-public-toast-content.mjs --apply
```

O que esse comando faz:

- troca `resourceCategory = 'Toast'` para `resourceCategory = 'public-toast-config'` nos registros técnicos do Toast;
- cria modelos padrão ausentes;
- cria a configuração global se estiver ausente;
- não apaga registros;
- preserva personalizações existentes quando já houver registros ativos.

## 9. Conferir o banco depois da sincronização

Se você tiver acesso ao cliente MySQL, rode consultas de conferência.

### Com DATABASE_URL convertido para variáveis DB_*

```bash
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME"
```

### Com socket local

```bash
mysql --socket=/run/mysqld/mysqld.sock -u "${DB_SOCKET_USER:-ubuntu}" "${DB_SOCKET_DATABASE:-pagina_lucrativa}"
```

Dentro do MySQL:

```sql
SELECT id, title, resourceCategory, resourceType, status
FROM managedContent
WHERE kind = 'notice'
  AND resourceType IN ('social-proof-template', 'social-proof-settings')
ORDER BY id;
```

Resultado esperado: os registros técnicos do Toast devem aparecer com `resourceCategory = 'public-toast-config'`, não mais `Toast`.

Consulta para confirmar se ainda restou item antigo:

```sql
SELECT COUNT(*) AS registros_antigos_toast
FROM managedContent
WHERE kind = 'notice'
  AND resourceCategory = 'Toast'
  AND resourceType IN ('social-proof-template', 'social-proof-settings');
```

Resultado esperado: `0`.

Saia do MySQL:

```sql
exit;
```

## 10. Reiniciar a aplicação

Identifique primeiro o gerenciador usado.

### systemd

```bash
systemctl list-units --type=service | grep -i 'pagina\|lucrativa\|node\|pm2'
```

Se o serviço for `pagina-lucrativa`:

```bash
sudo systemctl restart pagina-lucrativa
sudo systemctl status pagina-lucrativa --no-pager
```

Logs:

```bash
sudo journalctl -u pagina-lucrativa -n 100 --no-pager
```

### PM2

```bash
pm2 status
pm2 restart pagina-lucrativa
pm2 logs pagina-lucrativa --lines 100
```

Use o nome real do processo se for diferente.

## 11. Validação manual no navegador

Depois do restart, valide:

1. Abra `/admin/publicacoes`.
2. Confirme que não aparecem mais itens técnicos como:
   - `Cadastro`;
   - `Aquisição`;
   - `Entrada no grupo`;
   - `Visualização`;
   - `Início`;
   - `Vaga garantida`;
   - `Configuração do Toast`;
   - JSON bruto com `enabled`, `headerMessage`, `footerMessage`, cores ou segundos.
3. Abra `/admin/toast`.
4. Confirme que os modelos aparecem em campos visuais.
5. Confirme que a configuração global aparece em campos visuais:
   - ativo/inativo;
   - cabeçalho;
   - rodapé;
   - cores;
   - primeira exibição;
   - intervalo mínimo;
   - intervalo máximo;
   - tempo visível.
6. Abra a página pública.
7. Confirme se os Toasts aparecem quando o sistema está ativo.

## 12. Validação rápida por endpoint público

Se o domínio estiver apontando para a aplicação, teste:

```bash
curl -s https://SEU_DOMINIO/api/public-toast-config | head -c 1000
```

Em ambiente local da VPS:

```bash
curl -s http://127.0.0.1:3000/api/public-toast-config | head -c 1000
```

O retorno deve conter `templates` e `settings`. Não precisa editar esse JSON manualmente; ele é só a resposta técnica consumida pela página pública.

## 13. Merge para main depois do teste

Quando a branch estiver validada na VPS, faça o merge pelo GitHub do PR correspondente ou via terminal.

Via terminal:

```bash
git checkout main
git pull --ff-only origin main
git merge --no-ff fix/toast-seeds-publications-filter
git push origin main
```

Depois atualize a produção para a `main`, se esse for o fluxo oficial do servidor:

```bash
git checkout main
git pull --ff-only origin main
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
sudo systemctl restart pagina-lucrativa
```

Adapte o restart se usar PM2.

## 14. Rollback de código

Se a aplicação quebrar antes do merge definitivo, volte ao branch/commit anterior salvo no início:

```bash
git checkout "$BEFORE_BRANCH"
git reset --hard "$BEFORE_COMMIT"
pnpm install --frozen-lockfile
pnpm build
```

Depois reinicie o serviço:

```bash
sudo systemctl restart pagina-lucrativa
```

Ou, se usar PM2:

```bash
pm2 restart pagina-lucrativa
```

## 15. Rollback de banco

A sincronização do Toast é pequena e não apaga registros, mas se for necessário restaurar o banco inteiro, use o backup criado no início.

Atenção: restaurar o dump inteiro pode desfazer alterações feitas depois do backup. Use apenas se necessário.

### Com DATABASE_URL convertido para variáveis DB_*

```bash
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" \
  < ~/backups/pagina-lucrativa/NOME_DO_BACKUP.sql
```

### Com socket local

```bash
mysql --socket=/run/mysqld/mysqld.sock -u "${DB_SOCKET_USER:-ubuntu}" "${DB_SOCKET_DATABASE:-pagina_lucrativa}" \
  < ~/backups/pagina-lucrativa/NOME_DO_BACKUP.sql
```

Depois reinicie a aplicação.

## 16. Observações importantes

- Não exclua manualmente os registros `Cadastro`, `Aquisição`, `Entrada no grupo`, `Visualização`, `Início`, `Vaga garantida` ou `Configuração do Toast`.
- Eles são registros técnicos do sistema de Toast.
- O local correto de edição é **Administração > Toast**.
- A tela **Publicações** deve ficar limpa desses registros.
- O JSON continua existindo internamente no banco, mas o administrador deve editar por campos visuais, não manualmente.
- O script é idempotente: pode ser executado novamente sem duplicar os registros ativos já existentes.
