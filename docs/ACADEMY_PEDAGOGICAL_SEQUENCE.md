# Sequência pedagógica da Academia

Este documento registra a organização didática aplicada para a Academia e a implementação do módulo introdutório de glossário operacional.

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

O glossário foi implementado como primeiro contato conceitual do aluno com a Academia.

### Posição aplicada

Curso: `Preparação e mentalidade de execução`

Módulo aplicado:

```text
moduleOrder: 1
title: Glossário operacional da Academia
```

Os módulos anteriores foram deslocados depois dele:

```text
moduleOrder: 2 — Clareza financeira e energia de execução
moduleOrder: 3 — Aprendizagem e foco
```

### Aula aplicada

```text
title: Termos essenciais para começar
sourceId: a7f2c9e31b6d4a80
```

### Material empacotado

O material próprio do glossário foi registrado em:

```text
ebook-import/ebook-manifest.tsv
ebook-import/fontes_importados/a7f2c9e31b6d4a80/source.pdf
shared/ebookLibraryCatalog.ts
```

Categoria de biblioteca:

```text
Ferramentas e modelos
```

### Termos mínimos cobertos

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

## Validação técnica

O importador da Academia exige que toda aula tenha um `sourceId` existente no `ebook-import/ebook-manifest.tsv` e um PDF empacotado válido sob `ebook-import/fontes_importados/<sourceId>/source.pdf`.

A implementação preserva essas regras:

1. O `sourceId` do glossário foi criado.
2. O material foi registrado no manifesto de e-books.
3. O PDF foi empacotado no diretório esperado.
4. O catálogo canônico recebeu a categoria do novo material.
5. O módulo foi inserido como primeiro módulo da Academia.
6. Os testes foram atualizados para validar 88 materiais, 17 módulos e 30 aulas versionadas.

## Procedimento pós-deploy

Após o deploy da `main`, a VPS deve sincronizar o banco com o manifesto versionado:

```bash
cd /home/ubuntu/servicos/pagina-lucrativa/current
node scripts/sync-packaged-content.mjs --dry-run
node scripts/sync-packaged-content.mjs --apply
node scripts/sync-packaged-content.mjs --dry-run
```

O último `dry-run` deve retornar `totalPlannedUpdates: 0` e `totalPlannedInserts: 0`.
