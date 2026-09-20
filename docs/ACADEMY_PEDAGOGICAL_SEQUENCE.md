# Sequência pedagógica da Academia

Este documento registra a organização didática recomendada para a Academia e a especificação do módulo introdutório de glossário operacional.

## Objetivo

A Academia deve seguir uma ordem progressiva de aprendizagem. O aluno precisa entender fundamentos, oferta, conteúdo, captação, relacionamento e conversão antes de avançar para tráfego, divulgação e escala.

## Ordem aplicada no manifesto

Arquivo alterado: `content-seeds/academy-courses.json`.

Ordem pedagógica atualizada:

1. Preparação e mentalidade de execução
2. Negócio digital pronto para operar
3. Marca e posicionamento
4. Produto digital e oferta inicial
5. Conteúdo e criativos de autoridade
6. Captação e funis
7. E-mail e relacionamento
8. Vendas e conversão
9. SEO e descoberta orgânica
10. Tráfego e divulgação
11. Marketing de rede e escala

## Alteração principal

`Vendas e conversão` foi movido para antes de `SEO e descoberta orgânica` e `Tráfego e divulgação`.

Motivo: tráfego antes de conversão pode gerar audiência sem oferta, copy e estrutura comercial maduras. A ordem correta é preparar produto, posicionamento, conteúdo, captação, relacionamento e venda antes de ampliar a distribuição.

## Glossário operacional da Academia

O glossário deve ser o primeiro contato conceitual do aluno com a Academia.

### Posição recomendada

Curso: `Preparação e mentalidade de execução`

Módulo sugerido:

```text
moduleOrder: 1
title: Glossário operacional da Academia
```

Os módulos atuais seriam deslocados depois dele:

```text
moduleOrder: 2 — Clareza financeira e energia de execução
moduleOrder: 3 — Aprendizagem e foco
```

### Aula sugerida

```text
title: Termos essenciais para começar
```

### Termos mínimos

- Lead
- Conversão
- Oferta
- Funil
- Copy
- Tráfego
- SEO
- Criativo
- Página de captura
- Escala
- Recorrência
- Autoridade

## Restrição técnica importante

O importador da Academia exige que toda aula tenha um `sourceId` existente no `ebook-import/ebook-manifest.tsv`.

Por isso, o glossário não foi inserido diretamente no `content-seeds/academy-courses.json` nesta etapa. Antes disso, é necessário criar ou empacotar um material real para o glossário, registrar esse material no manifesto de e-books e somente depois vincular o `sourceId` na Academia.

## Próxima implementação segura para o glossário

1. Criar o conteúdo do material `Termos essenciais para começar`.
2. Gerar/empacotar o arquivo correspondente na biblioteca.
3. Adicionar o novo item ao `ebook-import/ebook-manifest.tsv` com `sourceId` próprio.
4. Inserir o módulo `Glossário operacional da Academia` no início do curso `Preparação e mentalidade de execução`.
5. Reordenar os módulos existentes do curso para preservar a progressão.
6. Rodar o importador em modo dry-run antes de aplicar.
