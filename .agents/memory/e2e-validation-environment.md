---
name: Ambiente de validação E2E
description: Regras duráveis para executar a suíte Playwright desta aplicação no workspace.
---

A validação E2E local precisa de um Chromium compatível e das bibliotecas gráficas/áudio do sistema; a suíte não deve ser classificada como falha do produto antes de confirmar que o navegador iniciou.

**Why:** O ambiente de desenvolvimento não fornece necessariamente Google Chrome em `/usr/bin/google-chrome`, e o Chromium baixado pelo Playwright pode falhar por bibliotecas nativas ausentes.

**How to apply:** Instalar as dependências do navegador pelo gerenciador de pacotes do workspace, validar as dependências compartilhadas do executável e apontar `PLAYWRIGHT_CHROME_PATH` para o Chromium instalado antes da execução.

Para verificar o modo “desktop no navegador mobile” em Chromium headless, emule um viewport/layout CSS de 980 px com uma tela de 430 px, `mobile: true` e entrada tátil via CDP, sem alterar a meta viewport antes de o runtime iniciar.

**Why:** Alterar a meta viewport como parte da simulação faz o runtime guardar esse valor artificial como o original e pode invalidar o teste de restauração ao sair da página.

**How to apply:** Deixe o HTML carregar sua meta viewport original; use métricas CDP para simular o viewport solicitado pelo navegador e valide que o app aplica 1366 px, desativa compactação e restaura a meta ao sair da página de vendas.