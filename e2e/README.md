# Testes E2E publicados

Esta suíte valida o domínio publicado da Página Lucrativa, sem inserir pedidos, produtos, lançamentos, contatos ou qualquer outro registro persistente. Os cenários incluem landing pública, login local, bloqueios de rota, navegação do Escritório Virtual, curadoria administrativa e logout.

## Execução na VPS

A dependência é instalada em um executor isolado para não modificar a árvore `node_modules` compartilhada pela release ativa.

```bash
cd /home/ubuntu/servicos/pagina-lucrativa/e2e-runner
npm ci
npx playwright test --config ../current/e2e/playwright.config.ts
```

Por padrão, a configuração testa `https://www.ocodigolucrativo.site/` com o Google Chrome disponível na VPS, em modo headless e com `--no-sandbox`. Para apontar para outro ambiente, defina `E2E_BASE_URL`.

O relatório HTML é produzido em `e2e/playwright-report/index.html` e os artefatos de falha são gravados em `e2e/test-results/`.
