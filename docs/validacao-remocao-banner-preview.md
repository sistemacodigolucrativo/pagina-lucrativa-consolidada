# Validação da remoção definitiva do banner

Data: 25 de agosto de 2026

O banner `This page is not live and cannot be shared directly. Please publish to get a public link.` pertence ao runtime externo de preview, não ao produto. O projeto removeu definitivamente o controle remoto que existia para ele: foram retirados o endpoint público, os endpoints Admin, o schema funcional, a tela `AdminSettings.tsx` e a entrada de menu.

Foi mantido apenas o seletor CSS defensivo em `client/src/index.css`:

```css
[data-loc*="PreviewerModeAlert"] { display: none !important; }
```

Após reiniciar o servidor e recarregar o preview, a Página Lucrativa renderizou normalmente sem o banner visível. A inspeção do DOM não encontrou instância visível do marcador `PreviewerModeAlert` (`count: 0`).

Preview: https://3000-ig9wz4zrmhdz0xelue3wj-d6a781b2.us4.manus.computer/

Nenhum commit ou push foi realizado.
