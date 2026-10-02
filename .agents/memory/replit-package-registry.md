---
name: Registry do preview Replit
description: Recuperação local quando o proxy de pacotes do workspace bloqueia uma dependência do lockfile.
---

Em alguns workspaces Replit, variáveis de ambiente apontam o pnpm para um
proxy interno de pacotes que pode retornar 403. Um 403, por si só, não prova
que o proxy falhou: o pacote pode estar bloqueado por uma vulnerabilidade.

**Why:** O registry recusou uma versão de Vitest sem suporte e uma versão
vulnerável de uma dependência transitiva do plugin Tailwind. Usar outro registry
nessas condições contornaria uma proteção de segurança.

**How to apply:** Verificar a URL efetiva com `pnpm config get registry` e, se
necessário, identificar o pacote e a advisory antes de agir. Se for falha
confirmada de proxy sem bloqueio de segurança, seguir a recuperação local
documentada pelo workspace. Se uma versão vulnerável/sem suporte for recusada,
atualizar a dependência direta responsável; nunca trocar de registry para
instalar essa versão.