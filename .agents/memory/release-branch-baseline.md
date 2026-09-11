---
name: Base de release atual
description: Registra qual linha remota foi validada como base mais recente do workspace.
---

A linha `release/final-audit-launch` foi validada como posterior à `main` e passou a ser a base do workspace. A `main` continua sendo uma linha remota anterior, não a base local atual.

**Why:** A branch de release continha alterações posteriores de aplicação e auditoria que não estavam na `main`. Trocar de volta sem comparar os ponteiros pode reintroduzir uma versão mais antiga.

**How to apply:** Antes de atualizar ou enviar código, comparar explicitamente `main` e `release/final-audit-launch`. Não fazer push ou merge automático entre elas.