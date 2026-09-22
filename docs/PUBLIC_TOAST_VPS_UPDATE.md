# Atualização VPS — Toast público

Esta atualização separa os registros técnicos do Toast das Publicações comuns.

## O que muda

- Os modelos e configurações do Toast passam a usar a categoria técnica `public-toast-config`.
- A tela **Publicações** já oculta essa categoria técnica.
- A tela correta para editar esses registros continua sendo **Administração > Toast**.
- O script `scripts/sync-public-toast-content.mjs` migra registros antigos da categoria `Toast` e cria os modelos/configuração padrão quando eles não existirem.

## Procedimento recomendado na VPS

Execute dentro da pasta do projeto em produção.

```bash
cd /home/ubuntu/servicos/pagina-lucrativa/current

# confirmar branch atual e salvar ponto de retorno
git status
git branch --show-current
git rev-parse HEAD

# buscar a branch de correção
git fetch origin fix/toast-seeds-publications-filter

# entrar na branch para teste
git checkout fix/toast-seeds-publications-filter

# instalar dependências se necessário
pnpm install --frozen-lockfile

# validar TypeScript/testes/build antes de reiniciar produção
pnpm check
pnpm test
pnpm build

# ver o que o script faria no banco
node scripts/sync-public-toast-content.mjs

# aplicar migração/seed do Toast
node scripts/sync-public-toast-content.mjs --apply
```

Depois reinicie o serviço usado na VPS. Exemplo com systemd:

```bash
sudo systemctl restart pagina-lucrativa
sudo systemctl status pagina-lucrativa --no-pager
```

Se o projeto usa PM2, adapte para o nome real do processo:

```bash
pm2 restart pagina-lucrativa
pm2 status
```

## Validação manual

1. Abra `/admin/publicacoes`.
2. Confirme que não aparecem mais itens como `Cadastro`, `Aquisição`, `Entrada no grupo`, `Visualização`, `Início`, `Vaga garantida` ou `Configuração do Toast` em formato JSON bruto.
3. Abra `/admin/toast`.
4. Confirme que os modelos aparecem com campos visuais editáveis.
5. Confirme que a configuração global aparece como campos de formulário: ativo/inativo, cabeçalho, rodapé, cores, primeira exibição, intervalo e tempo visível.
6. Abra a página pública e confirme se os Toasts aparecem conforme a configuração.

## Rollback

Se algo falhar antes do merge definitivo, volte para a branch/commit anterior salvo no início:

```bash
git checkout main
# ou, se a produção usa outro branch, volte para ele
sudo systemctl restart pagina-lucrativa
```

A sincronização do Toast não apaga registros existentes. Ela apenas muda a categoria técnica antiga `Toast` para `public-toast-config` e cria registros padrão ausentes.
