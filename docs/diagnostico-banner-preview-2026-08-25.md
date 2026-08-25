# Diagnóstico final do banner no preview

## Causa raiz

A captura enviada pelo usuário estava correta. O banner não vinha de cache do navegador nem dos componentes da Página Lucrativa. A origem era o plugin `vite-plugin-manus-runtime`, registrado em `vite.config.ts`, que injeta o runtime de preview no HTML de desenvolvimento. O runtime contém o componente compilado `src/modules/Alert/PreviewerModeAlert.tsx` e o texto:

> This page is not live and cannot be shared directly. Please publish to get a public link.

## Correção aplicada

O plugin foi removido do array de plugins do Vite e a dependência foi removida do `package.json` e do `pnpm-lock.yaml`. Também já havia sido removido o controle remoto `hideExternalPreviewNotice`, incluindo endpoints, schema funcional, tela Admin e entrada de menu. A regra CSS defensiva anterior também foi retirada porque a origem agora não é mais carregada pelo projeto.

## Evidências

Antes da correção, o HTML servido pela porta 3000 continha uma ocorrência do texto e uma ocorrência de `PreviewerModeAlert`, ambas dentro do runtime injetado. Depois da correção, o mesmo HTML retornou:

- texto do banner: `0` ocorrências;
- `PreviewerModeAlert`: `0` ocorrências;
- `manus-runtime`: `0` ocorrências;
- HTTP: `200`.

## Validação independente

O Playwright foi executado contra o endereço público do preview usando Chromium em desktop `1280 x 800` e emulação real de `Pixel 5`. Ambos os cenários carregaram a aplicação com HTTP 200, localizaram zero ocorrências do banner, não encontraram marcador `PreviewerModeAlert` e não fizeram requisições de `platformSettings`.

A rota `/admin/configuracoes` também foi exercitada no Pixel 5. Ela não renderiza mais a tela removida e redireciona para a barreira de acesso `/acesso`.

## Estado

O preview da porta 3000 foi reiniciado para eliminar o processo antigo que ainda carregava o plugin. O endereço continua sendo:

https://3000-ig9wz4zrmhdz0xelue3wj-d6a781b2.us4.manus.computer/

As verificações `pnpm check`, `pnpm test` — 58 arquivos e 183 testes —, `pnpm build` e `git diff --check` passaram. Nenhum commit ou push foi realizado.
