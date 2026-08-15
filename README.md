# Página Lucrativa 2026

Landing page estática do **Sprint de Vendas / Startlab**, construída com React, Vite e Tailwind CSS. A interface inclui navegação por âncoras, CTAs, FAQ interativo e layout responsivo para desktop e mobile.

Os assets visuais estão versionados em `client/public/assets`, portanto a página não depende dos caminhos temporários do workspace para carregar as imagens.

## Execução local

Use `pnpm install` para instalar as dependências e `pnpm dev` para iniciar o ambiente local. Para validar antes de publicar, execute `pnpm check` e `pnpm build`.

## Escopo desta versão

Este repositório contém a **landing page pública**. As áreas autenticadas de administração e membros existentes no projeto PHP original não fazem parte desta versão estática; elas exigem a migração de autenticação, sessão e banco de dados antes de serem publicadas neste frontend.
