# Relatório de Validação — Código Lucrativo 2026

**Data da validação:** 11 de setembro de 2026  
**Branch:** `release/final-audit-launch`  
**Ambiente:** Preview local do workspace  
**URL de validação:** `http://127.0.0.1:5000/`  
**Workflow:** `Start application`  
**Status do workflow:** Em execução  

## Resumo executivo

| Verificação | Resultado |
|---|---:|
| Testes Playwright E2E | **28 aprovados / 28 executados** |
| Falhas E2E | **0** |
| Checagem TypeScript (`pnpm check`) | **Aprovada** |
| Verificação de whitespace (`git diff --check`) | **Aprovada** |
| Resposta HTTP do Preview | **HTTP 200** |
| Inspeção visual da landing | **Aprovada** |
| Console do navegador na captura final | **Sem erros** |

## Comando principal executado

```bash
cd e2e
E2E_BASE_URL=http://127.0.0.1:5000 \
PLAYWRIGHT_CHROME_PATH=/repl/tools/bin/chromium \
pnpm exec playwright test tests/published-site.spec.ts --workers=1
```

**Resultado:** `28 passed (2.2m)`

## Lista completa dos testes

Todos os cenários abaixo foram executados no projeto Playwright `chromium-publicado`.

### Landing pública, conversão e composição visual

| # | Cenário | Resultado |
|---:|---|:---:|
| 1 | A rota legada de landing permanece documentada como não encontrada | **PASSOU** |
| 2 | A landing pública exibe a marca, navegação e formulário de pedido | **PASSOU** |
| 3 | Navbar simplificada preserva destinos, CTA, sticky e menu móvel | **PASSOU** |
| 4 | Seção independente da estrutura digital preserva a composição em desktop, tablet e mobile | **PASSOU** |
| 5 | Cópia pública Violeta Neon preserva o formulário e o CTA flutuante sem alterar o Preview original | **PASSOU** |
| 6 | Toast global usa atividade ilustrativa, alterna notificações e não aparece em áreas privadas | **PASSOU** |

### Formulários públicos e autenticação

| # | Cenário | Resultado |
|---:|---|:---:|
| 7 | WhatsApp público sanitiza a digitação, aplica máscara e bloqueia número incompleto | **PASSOU** |
| 8 | E-mail público normaliza espaços e bloqueia estrutura inválida antes do pedido | **PASSOU** |
| 9 | Credenciais inválidas permanecem no acesso e informam o erro | **PASSOU** |
| 10 | Área de acesso é enxuta, permite mostrar a senha e sinaliza a recuperação futura | **PASSOU** |
| 11 | Membro e administrador entram nos respectivos ambientes | **PASSOU** |
| 12 | Pedido público recente mantém a data legível dentro do conteúdo no mobile | **PASSOU** |
| 13 | Formulários administrativos empilham e contêm seus campos no celular | **PASSOU** |
| 14 | Rotas de painéis sem sessão redirecionam ao acesso local | **PASSOU** |

### Escritório Virtual do membro

| # | Cenário | Resultado |
|---:|---|:---:|
| 15 | Membro navega pelas ferramentas sem alterar dados | **PASSOU** |
| 16 | Configurações atuais do membro e estado público indisponível são explícitos | **PASSOU** |
| 17 | Campos monetários e chave PIX higienizam dados estruturados no Escritório Virtual | **PASSOU** |
| 18 | Curso publicado abre o e-book associado no leitor integrado | **PASSOU** |
| 19 | Leitor integrado contém a página do e-book em celular, tablet e desktop | **PASSOU** |
| 20 | Botão Ampliar alterna o leitor integrado para tela cheia e permite sair com Esc | **PASSOU** |
| 21 | Menu móvel preserva o catálogo do Escritório Virtual e expande seus grupos | **PASSOU** |
| 22 | Fluxo móvel preserva menus visíveis após trocar rotas do Escritório Virtual | **PASSOU** |
| 23 | Membro não consegue abrir a administração | **PASSOU** |

### Administração e permissões

| # | Cenário | Resultado |
|---:|---|:---:|
| 24 | Administração carrega ferramentas de curadoria sem gravar registros | **PASSOU** |
| 25 | Administrador também acessa o próprio Escritório como afiliado | **PASSOU** |
| 26 | Logout encerra a sessão e retorna à landing pública | **PASSOU** |
| 27 | Menu móvel da administração preserva o catálogo em rotas contextuais | **PASSOU** |
| 28 | Auditoria mobile percorre destinos atuais dos menus de membro e administração | **PASSOU** |

## Checagens complementares

### TypeScript

Comando:

```bash
pnpm check
```

Resultado:

```text
tsc --noEmit
Process exited with code 0
```

### Preview

- Workflow `Start application` permaneceu em execução.
- Servidor respondeu em `http://127.0.0.1:5000/`.
- Verificação HTTP final: `preview_http=200`.
- A landing foi capturada no viewport de 1280 × 720.
- A captura visual confirmou a marca, navegação, headline, composição visual e botão flutuante.
- Console do navegador sem erros de aplicação.

Captura gerada:

```text
screenshots/preview-final.jpg
```

### Integridade do diff

Comando:

```bash
git diff --check
```

Resultado: aprovado, sem whitespace inválido.

## Ajustes validados nesta rodada

1. O CTA flutuante público foi montado na landing, além de permanecer com comportamento responsivo.
2. O CTA passou a reagir também ao evento de scroll, além do `IntersectionObserver`, evitando perda de estado em scroll imediato após o carregamento.
3. O teste do toast respeita o escopo atual da implementação: atividade ilustrativa na landing e ausência em áreas privadas.
4. O cenário de pedido administrativo navega diretamente para `/admin/pedidos`.
5. Os testes administrativos aceitam os estados explícitos de carregamento, erro e banco indisponível sem mascarar falhas.
6. Os seletores móveis foram escopados ao Sidebar atual para não confundir itens repetidos no conteúdo da página.
7. O fluxo móvel aguarda o fechamento assíncrono do drawer antes de abrir a próxima rota.
8. O catálogo administrativo passou a ser validado com os nomes e títulos atuais, incluindo “Pontos e performance”.

## Observação sobre o banco no Preview

No modo `DEMO_PREVIEW`, algumas consultas administrativas registraram `Banco de dados indisponível` nos logs. A interface trata esse caso como estado explícito de indisponibilidade, e os testes validam essa resposta sem apresentar dados falsos.

Isso não impediu a validação da navegação, autenticação, permissões, layout, formulários, estados vazios e comportamento responsivo.

## Conclusão

O projeto está validado para uso no Preview do workspace. A suíte E2E completa passou com **28 de 28 cenários**, a checagem TypeScript passou e o workflow continua disponível na porta 5000.