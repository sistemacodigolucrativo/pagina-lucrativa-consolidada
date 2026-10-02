---
name: Timeout de PDF no Vitest
description: Distinguir timeout por concorrência no conjunto completo de testes de uma falha real na inspeção local de PDFs.
---

O teste que inspeciona os PDFs locais pode ultrapassar o timeout de 5 segundos quando muitos arquivos Vitest rodam em paralelo; a suíte completa passou com menos workers e sem paralelismo entre arquivos.

**Why:** A concorrência por CPU e I/O no ambiente de desenvolvimento pode atrasar esse teste, embora a validação de PDFs funcione.

**How to apply:** Se apenas esse teste expirar na suíte completa, repita com concorrência reduzida antes de tratar o resultado como regressão. Registre o timeout original e o resultado da repetição; não aumente o timeout do projeto sem reproduzir a falha isoladamente.