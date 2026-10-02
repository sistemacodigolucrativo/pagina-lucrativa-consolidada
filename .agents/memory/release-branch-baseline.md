---
name: Validação da ancestralidade das branches
description: Como selecionar com segurança a base entre branches main e release.
---

Os nomes `main` e `release` não garantem qual branch contém a base mais recente. A relação entre elas pode mudar e uma nota de baseline pode ficar obsoleta.

**Why:** Uma retomada encontrou a branch local `main` contendo a linha de release e commits posteriores, contrariando a anotação antiga que apontava `release` como base vigente.

**How to apply:** Antes de atualizar ou enviar código, confira a branch atual, `git status`, ponteiros locais/remotos e ancestralidade com `merge-base`/`rev-list`. Não faça push ou merge automático com base apenas no nome da branch ou nesta nota.