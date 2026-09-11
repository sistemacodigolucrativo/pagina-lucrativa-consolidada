---
name: Ambiente de validação E2E
description: Regras duráveis para executar a suíte Playwright desta aplicação no workspace.
---

A validação E2E local precisa de um Chromium compatível e das bibliotecas gráficas/áudio do sistema; a suíte não deve ser classificada como falha do produto antes de confirmar que o navegador iniciou.

**Why:** O ambiente de desenvolvimento não fornece necessariamente Google Chrome em `/usr/bin/google-chrome`, e o Chromium baixado pelo Playwright pode falhar por bibliotecas nativas ausentes.

**How to apply:** Instalar as dependências do navegador pelo gerenciador de pacotes do workspace, validar as dependências compartilhadas do executável e apontar `PLAYWRIGHT_CHROME_PATH` para o Chromium instalado antes da execução.