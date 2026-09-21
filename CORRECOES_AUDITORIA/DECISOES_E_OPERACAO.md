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

## Relatório operacional recebido em 21/09/2026

Fonte: `RELATORIO_VPS_RECEBIDO_2026-09-21.md`, fornecido pelo usuário e produzido por outra IA na VPS 201. Este assistente não acessou a VPS. O relato informa release `c2ab114d8be7328b7a64eb60d1afb96841f2179c`, Node 22.23.2, conexão MySQL/MariaDB 10.11 via DATABASE_URL e dois administradores com loginMethod=local_demo. As conclusões abaixo confrontam esse relato com o código da branch; não são novos testes de produção.

### Requisitos reais de configuração

| Variável | Exigência na branch corrigida | Interpretação do relatório |
| --- | --- | --- |
| DATABASE_URL | URL válida com banco explícito; alternativa por socket requer opt-in. | Presença e conexão foram relatadas. Não mudar para socket apenas porque existe. Ainda falta confirmar correspondência com o schema pretendido. |
| JWT_SECRET | Validado no startup de produção por assertProductionAuthConfig. | Presença não comprova força/adequação; o relatório não informa o resultado dessa validação. |
| PUBLIC_APP_ORIGIN | Origem HTTPS exata obrigatória no startup de produção. | Ausência relatada impede o startup da candidata. |
| SECURITY_AUDIT_DIR | Caminho absoluto persistente, fora de release/storage, obrigatório no startup. Diretório privado e acessível ao executor são necessários para as mutações. | Ausência relatada também impede o startup da candidata. |
| ENABLE_LOCAL_AUTH | Habilita login local somente com valor true; ausência não causa, por si só, erro de startup. | Necessário para utilizar o login local real adotado pelo projeto; não torna contas demo aceitáveis. |
| CONTENT_SYNC_BACKUP_DIR | Obrigatório em produção no sync com --apply; não é exigido por --check nem pelo startup do servidor. | Provisionar antes de qualquer apply autorizado; backup dentro de release não atende ao requisito de persistência. |
| ALLOW_VPS_SOCKET_DB | Somente para a alternativa por socket quando não existe DATABASE_URL. | Ausência não é falha no cenário relatado, que usa URL. |
| DEPLOY_RUNTIME_ENV_FILE | Override opcional; padrão do deploy é DEPLOY_ROOT/.env. | O caminho padrão coincide com o EnvironmentFile relatado. Conferir executor, leitura e precedência de variáveis; não é obrigatório definir esse override. |
| REMOTE_DATABASE_URL | Alias apenas de desenvolvimento; ignorado em produção. | Ausência não é falha e não deve ser preenchida para solucionar o relatório. |

Referências locais: `shared/databaseConfig.mjs`, `server/_core/index.ts`, `server/_core/authConfig.ts`, `server/_core/csrf.ts`, `server/_core/adminAudit.ts`, `scripts/lib/content-sync-backup.mjs` e `scripts/deploy-vps.sh`.

### Limites da evidência recebida

- Os dois registros com loginMethod=local_demo serão recusados pela política nova em produção. É preciso identificar o responsável e preparar uma identidade real, preservando referências históricas. Não converter contas cegamente nem apenas trocar loginMethod: openId com prefixo local_demo_ também é recusado e a credencial precisa ser válida. Alteração de identidade, senha ou papel exige autorização separada.
- O nome `resolveDemoSession` e a existência de `demoAuth.ts` não provam isoladamente uma vulnerabilidade: a branch corrigida conserva esses nomes com outra implementação. A comparação de código/versão e os registros demo é que sustentam a conclusão.
- O retorno databaseNamePresent=true demonstra presença de um nome, mas não permite conferir se é o schema esperado. Solicitar confirmação sanitizada de correspondência; a lista de serviços ativos não identifica, sozinha, produto/instância de banco efetivamente usados.
- Não foram informados privilégios completos da conta do banco, engine/schema real, integridade relacional, equivalência dos conteúdos, força do JWT, ACLs ou integrantes do grupo pagina-deploy. Não marcar essas verificações como concluídas.
- Ausência do script de diagnóstico relacional no release antigo não comprova órfãos nem cria, por si só, um novo achado alto. A inspeção de dados de MED-03 continua pendente.
- As permissões relatadas não comprovam exposição pública dos backups ou do .env. Essa conclusão exige avaliar ACLs, diretórios ancestrais, grupos e configuração HTTP. O backup na release continua inadequado para persistência e privacidade operacional.
- A árvore Git da base c2ab114d inclui o caminho da chave removida. O relatório não verificou se existem cópias dela na VPS/releases/artefatos antigos; não afirmar que foram eliminadas, nem recuperar seu conteúdo para esse fim.

### Sequência corrigida para uma futura implantação autorizada

1. Resolver a situação da credencial privada e confirmar um meio administrativo seguro. Planejar conta administrativa real e recuperação; não relaxar o bloqueio de demos para manter acesso.
2. Definir a configuração válida da candidata, validar JWT sem expor valor e planejar/provisionar os diretórios privados persistentes sob autorização. O serviço roda como ubuntu, enquanto há arquivos de deploy sob pagina-deploy: definir quem executará o sync e evitar liberar permissões amplas para contornar a separação.
3. Fixar SHA candidata e reconfirmar SHA ativa, schema/engine/banco, artefato, backup e plano de retorno. Validar a candidata em ambiente controlado. Não confundir validação com Node 22 local com validação do MariaDB real.
4. Executar dry-run/--check da candidata ANTES da ativação, com a configuração correta. Se houver divergência, revisar/exportar curadoria e obter autorização específica para eventual apply transacional com backup. Exigir --check sem alterações pendentes antes de avançar. Não rodar automaticamente scripts da release antiga para simular a política nova.
5. Somente após os pré-requisitos e autorização de deploy, ativar a SHA validada. O procedimento existente também inicia worker e restaura o título público do Hero; esses efeitos devem constar do plano aprovado. Nenhum comando de deploy foi executado nesta etapa.
6. Validar health local/público, login administrativo real e negativas de autorização/CSRF em cenários controlados, conteúdo e logs. Repetir --check após ativação. Rollback de código não desfaz alterações anteriores de dados/configuração; retorno à versão antiga também restaura suas limitações de segurança.

O relatório recebido propunha dry-run/check somente depois do deploy. Isso foi corrigido neste procedimento: `scripts/deploy-vps.sh` já exige --check antes de trocar o symlink e o repete após ativação. Esta preparação não está autorizada automaticamente pelo recebimento do relatório.
