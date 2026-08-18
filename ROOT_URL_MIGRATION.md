# URL canônica da Página Lucrativa

A Página Lucrativa utiliza `https://ocodigolucrativo.site/` como endereço público canônico.

As rotas públicas e autenticadas usam a raiz do domínio, como `/acesso`, `/membros` e `/admin`.
O prefixo histórico `/paginalucrativa` é tratado no Nginx apenas como compatibilidade de links antigos e redireciona permanentemente para o caminho equivalente na raiz.

Exemplos:

| URL histórica | URL canônica |
|---|---|
| `/paginalucrativa/` | `/` |
| `/paginalucrativa/acesso` | `/acesso` |
| `/paginalucrativa/membros` | `/membros` |
| `/paginalucrativa/admin` | `/admin` |
