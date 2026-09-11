---
name: Banco remoto no preview
description: Regra para conectar o Preview do Replit ao MySQL remoto sem alterar o contrato de produção.
---

O Preview do workspace usa o Secret `REMOTE_DATABASE_URL` como fallback quando `DATABASE_URL` não está disponível. Em produção, `DATABASE_URL` continua sendo a variável prioritária.

**Why:** `DATABASE_URL` é uma variável gerenciada pelo runtime do Replit e não deve ser configurada manualmente pelo fluxo de Secrets. O fallback permite testar o banco remoto sem colocar credenciais no código, no `.env` ou no Git.

**How to apply:** Nunca registrar a URL ou a senha neste diretório. Ao preparar o deploy da VPS, use a `DATABASE_URL` própria da VPS e confirme que o fallback local não substitui essa variável.