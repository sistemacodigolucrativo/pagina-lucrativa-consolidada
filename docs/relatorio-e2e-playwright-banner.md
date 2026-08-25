# Relatório E2E/Playwright — Banner de preview

## Objetivo

Verificar de forma independente se o banner `This page is not live and cannot be shared directly. Please publish to get a public link.` aparece na aplicação ou em viewport móvel, e confirmar que a rota Admin de configurações — removida junto com o controle remoto do banner — não continua renderizando a tela excluída.

## Método

A validação foi executada em 25 de agosto de 2026 com Playwright 1.62.0, usando o Chromium instalado no sistema (`/usr/bin/chromium`) e o preview online do workspace:

https://3000-ig9wz4zrmhdz0xelue3wj-d6a781b2.us4.manus.computer/

O teste abriu a página com viewport desktop de 1280 x 800 e viewport móvel de 393 x 851. Em cada cenário foram verificadas a resposta HTTP, o título, o texto completo do `body`, a visibilidade do texto do banner, o marcador estrutural `PreviewerModeAlert` e a ausência de requisições para `platformSettings` ou `hideExternalPreviewNotice`.

Também foi exercitada a URL `/admin/configuracoes` em viewport móvel. O resultado esperado é a barreira de acesso do Escritório Virtual, e não a tela de configurações removida.

## Resultados

| Cenário | HTTP | Título esperado | Banner no texto | Banner visível | Marcador `PreviewerModeAlert` | Requisição remota do banner |
|---|---:|---|---:|---:|---:|---:|
| Desktop 1280 x 800 | 200 | Aprovado | 0 | Não | 0 | 0 |
| Mobile 393 x 851 | 200 | Aprovado | 0 | Não | 0 | 0 |
| `/admin/configuracoes` sem autenticação | 200 | Barreira de acesso | Não | Não | Não encontrado | 0 |

A rota `/admin/configuracoes` redirecionou para `/acesso` e exibiu `Acesse seu Escritório Virtual.`. A tela removida não foi renderizada.

## Evidências geradas

- `e2e-artifacts/banner-desktop.png`
- `e2e-artifacts/banner-mobile.png`
- `/home/ubuntu/e2e-banner-check.py`

## Conclusão

A verificação E2E/Playwright passou nos cenários executados. O código da aplicação não emite requisições para o controle remoto removido, não renderiza o banner e não mantém a tela Admin que existia exclusivamente para controlá-lo. A mensagem ainda existe no runtime externo do ambiente de preview, conforme identificado na inspeção anterior, mas não foi encontrada no DOM/texto visível da aplicação durante os testes.

A validação foi feita contra o preview sem banco real de produção ou homologação. Nenhum banco foi alterado. Nenhum commit ou push foi realizado.
