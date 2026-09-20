# Decisões e preparação operacional

Nenhum comando deste documento foi executado na VPS nesta auditoria. Deploy, sync com escrita, migrations, alterações de schema e merge continuam sujeitos à autorização do responsável.

## Autenticação e mutações

- O login utilizado pelo aplicativo é o de senha no banco. O módulo OAuth existente não está registrado no entrypoint; não foi ativado um provedor sem configuração conhecida.
- `ENABLE_LOCAL_AUTH=true` habilita esse login. Contas `local_demo_*` e método `local_demo` são sempre recusados em produção. O operador deve confirmar previamente uma conta administrativa real no banco. Não promover automaticamente nenhum usuário.
- Gerar `JWT_SECRET` aleatório com pelo menos 32 bytes. Nunca copiar exemplos ou gravar o valor no Git. A validação do startup detecta ausência, exemplos conhecidos e baixa diversidade, mas não prova entropia.
- `PUBLIC_APP_ORIGIN` deve conter a origem HTTPS usada pelo navegador, sem caminho ou barra final. Mutações exigem Origin exato, ou Referer exato na ausência de Origin. Ausência, `null`, origem divergente e `Sec-Fetch-Site: cross-site` são recusados. Não liberar CORS arbitrário nem SameSite=None para contornar essa regra.
- Cookies de sessão usam HttpOnly, SameSite=Lax e Secure em produção. Sessões anteriores das contas reais exigem novo login. A cada requisição, usuário, papel e versão da credencial são conferidos no banco; senha alterada e usuário removido revogam a sessão.
- Senhas e respostas secretas passam a scrypt assíncrono, salt aleatório de 16 bytes, N=16384/r=8/p=5 (perfil de 16 MiB listado pela OWASP). Duas derivações simultâneas e fila limitada evitam consumo ilimitado de memória. O formato cabe nas colunas existentes de 255 caracteres; nenhum schema foi alterado.
- Login válido atualiza hash SHA-256 legado de forma condicional para não sobrescrever uma troca de senha concorrente. Resposta secreta legada é atualizada após verificação correta; redefinições gravam senha moderna. Recuperação pública por pergunta secreta fica restrita a membros, não a administradores. Perguntas continuam sendo um fator fraco; substituir por recuperação com token de uso único é uma evolução separada.
- Mutações administrativas REST e tRPC exigem login recente (até 15 minutos) e registro persistente antes da ação. Para renovar, sair e entrar novamente. Não há alteração automática de credenciais nem envio de mensagem.
- Configurar `SECURITY_AUDIT_DIR` absoluto e privado, fora das releases e de `LOCAL_STORAGE_DIR` (servido pelo proxy). O processo deve ter escrita. Registros JSONL contêm ator, operação, fase e identificador de correlação, sem cookies, senha, segredo ou conteúdo do corpo. Falta de registro inicial bloqueia a operação. Evento `started` sem final exige reconciliação com o banco; registro em arquivo e transação SQL não são atomicamente integrados.
- A lista de membros via GET deixa de disparar exclusões. A rotina agendada existente mantém a política de prazo e passa a registrar o ator da solicitação; não foi executada nesta sessão.

## Fontes técnicas consultadas em 2026-09-20

- [OWASP: Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html): algoritmos com salt/custo, perfil scrypt e atualização gradual.
- [Node.js: crypto.scrypt](https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback): derivação assíncrona, salt e limite de memória.
- [OWASP: CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html): origem configurada no servidor, comparação exata, Referer e bloqueio na ausência de ambos.
- [GitHub: eventos e payloads](https://docs.github.com/en/webhooks/webhook-events-and-payloads#push): intervalo before/after do evento push.

## Limites da validação

Testes locais exercitam lógica real de hashing, middleware HTTP e arquivos de auditoria temporários. Consultas de identidade e conteúdo são testadas com driver simulado. Não houve acesso ao banco vivo, autenticação no domínio real, envio de mensagens, restart de serviço ou deploy. Passar na suíte local não comprova configuração correta da VPS.


## Continuidade: banco, conteúdo e CI

- Produção exige DATABASE_URL ou opt-in exato ALLOW_VPS_SOCKET_DB=true. O alias REMOTE_DATABASE_URL serve apenas ao desenvolvimento. Os scripts de importação, sync e exportação compartilham a política; não selecionar banco porque um socket existe.
- /api/healthz responde somente saúde e modo de conexão, com SELECT 1. Configuração inválida impede startup; falha do banco retorna 503 na checagem. URL, senha e erro do driver não integram a resposta.
- Conteúdo: ver docs/CONTENT_BOOTSTRAP.md. O CI valida arquivos sem banco; o deploy exige --check antes de ativação e após ativação. Apply não é automático. Divergências da VPS não foram medidas nesta sessão.
- O processo de deploy precisa acessar o arquivo persistente DEPLOY_ROOT/.env (ou DEPLOY_RUNTIME_ENV_FILE). A leitura usa node --env-file, sem source/eval de shell. Conferir igualdade com EnvironmentFile do systemd e variáveis herdadas; não presumir que uma sessão SSH herda a configuração do serviço.
- Backup deve ficar em diretório privado fora das releases e do storage público, com 0700/0600. Não usar storage/backups. Apply usa transação InnoDB e requer janela de edição controlada. Rollback de código não reverte dados já sincronizados.
- HIGH-06: comparar todo o intervalo do push, bloquear base desconhecida e usar SHA imutável entre jobs. workflow_dispatch passa a exigir a SHA completa da release ativa, reconferida pelo script antes da ativação. O script compara também os arquivos de schema da candidata com a release ativa, cobrindo falhas/pulos no histórico de deploy. Nunca executar migrations automaticamente.
- Há chave privada RSA no histórico da base. Foi removida da árvore da branch, não usada nem exibida. Deve ser revogada/rotacionada onde autorizada; a limpeza histórica, artefatos e investigação de uso exigem plano separado. O risco continua bloqueando liberação operacional até evidência suficiente.

## Fontes adicionais consultadas nesta continuidade

- [GitHub Actions checkout](https://github.com/actions/checkout): ref explícita e histórico completo para validar commits.
- [MySQL 8.4 — transações](https://dev.mysql.com/doc/refman/8.4/en/commit.html): READ ONLY, isolamento, commit/rollback e dependência de mecanismo transacional.
- [Node.js — operações de arquivo](https://nodejs.org/api/fs.html): criação exclusiva wx, permissões e sincronização do arquivo.
- [GitHub — remoção de dados sensíveis](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository): remoção da árvore não substitui revogação/rotação da credencial.
