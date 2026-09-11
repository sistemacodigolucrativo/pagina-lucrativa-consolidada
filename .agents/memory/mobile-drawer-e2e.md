---
name: Drawer móvel nos testes
description: Sincronização e escopo dos testes E2E para o Sidebar móvel baseado em Sheet.
---

Nos testes Playwright, o Sidebar móvel deve ser localizado pelo elemento com `data-sidebar="sidebar"` e `data-mobile="true"`, aberto pelo trigger do topo quando não estiver visível e considerado fechado somente após a navegação concluir e o drawer ficar oculto.

**Why:** O componente usa um Sheet que desmonta ou anima o conteúdo durante a troca de rota. Seletores globais podem capturar atalhos duplicados no conteúdo, e um clique imediato na próxima rota pode atingir um elemento já desmontado.

**How to apply:** Depois de clicar em um item do menu móvel, aguarde a URL esperada e o drawer ficar oculto antes de reabri-lo. Evite depender de `data-state` em elementos internos do menu ou de `scrollIntoViewIfNeeded` durante a animação.