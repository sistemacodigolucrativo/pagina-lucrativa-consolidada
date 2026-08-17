# Inspeção da VPS — 18.119.174.102

## Acesso e escopo

- Acesso SSH confirmado com o usuário `ubuntu` e a chave privada fornecida pelo usuário.
- O usuário determinou que o miniapp existente deve permanecer na raiz do IP.
- A prévia da Página Lucrativa deve usar uma porta dedicada, exclusivamente para visualização.

## Estado observado sem alterações

| Recurso | Estado |
|---|---|
| Portas públicas | `80` e `443` estão sob Nginx; `3001`, `3101` e `3102` estavam em escuta. |
| Raiz do IP | O virtual host de `18.119.174.102` encaminha para `127.0.0.1:3001` (miniapp). |
| Página Lucrativa | `pagina-lucrativa.service` está ativo, executa como `ubuntu` em `*:3101` e responde externamente por `http://18.119.174.102:3101/`. |
| Serviços a preservar | `pweb-bot-tg.service`, `pweb-watchtower.service` e `telegram-notes-bot.service` estavam ativos. |
| Firewall | Inspeção somente leitura: UFW inativo, política `INPUT` do iptables em `ACCEPT` e nenhum conjunto de regras nftables retornado. O grupo de segurança externo não é administrável pela máquina, mas o HTTP externo em `3101` foi confirmado. |

## Decisão de implantação

Será atualizada exclusivamente a aplicação isolada em `3101`. Nenhuma alteração será feita na configuração Nginx responsável pela raiz do IP, nem no serviço do miniapp em `3001`.

## Verificação externa após a atualização

- URL verificada: `http://18.119.174.102:3101/`.
- A resposta HTTP externa foi bem-sucedida, mas a primeira renderização no navegador exibiu apenas um fundo escuro e o título antigo `Startlab · Sprint de Vendas`.
- A próxima etapa é inspecionar o console e os assets do frontend antes de declarar a prévia como disponível.

## Publicação isolada concluída

- A release `20260817-1842` foi construída em diretório isolado, validada por checagem de tipos e build de produção e ativada em `pagina-lucrativa.service`.
- A aplicação responde externamente em `http://18.119.174.102:3101/` com HTTP `200` e o título `Página Lucrativa 2026`.
- O miniapp de `127.0.0.1:3001` continuou respondendo com HTTP `200`; nenhuma configuração Nginx da raiz do IP foi modificada.
- A release anterior foi preservada em `/home/ubuntu/servicos/pagina-lucrativa/current-backup-20260817-1842` para reversão manual, se necessária.

## Autenticação local e domínio público

- A release ativa `20260817-2048-local-login-only` permanece isolada em `*:3101`; o miniapp da raiz não foi modificado.
- A autenticação Manus foi removida do cliente, do contexto de servidor e do registro de rotas. A VPS validou o login local, o logout com expiração de `pl_demo_session`, o bloqueio de visitante e membro nas operações protegidas e a autorização do perfil administrativo.
- `https://www.ocodigolucrativo.site/paginalucrativa/` respondeu com a landing e seus ativos estáticos; `https://www.ocodigolucrativo.site/paginalucrativa/acesso` carregou a entrada de usuário e senha.
- A requisição HTTP para `http://www.ocodigolucrativo.site/paginalucrativa/` retorna `301` para a URL HTTPS equivalente.
