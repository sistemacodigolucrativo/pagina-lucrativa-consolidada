# Auditoria de SEO, terminologia e responsividade textual

## SEO aplicado

| Elemento | Estado anterior | Estado aplicado |
|---|---|---|
| `lang` | `pt-BR` | Mantido. |
| `<title>` | “Página Lucrativa 2026” | “Página Lucrativa  Negócio Digital Pronto para Começar”. |
| Meta description | Ausente | Inclui negócio digital, estrutura, Escritório Virtual, ferramentas, materiais e Academia de execução. |
| H1 | Centrado em pagamento de R$ 50,00 | “Negócio digital pronto para começar — sem construir toda a estrutura sozinho.” |
| H2 | Repetição de renda, pagamento e oportunidade | Progressão de problema, desejo, mecanismo, produto, jornada, stack, comparação, facilidade, ativo e prova. |
| Imagens | Alt text orientado a apresentação antiga | Alt text descreve pessoa, operação digital, organização e materiais sem keyword stuffing. |
| Open Graph | Ausente | `og:title`, `og:description`, `og:image`, `og:type`, `og:locale` e `og:site_name`. |
| Twitter Card | Ausente | Card grande com título, descrição e imagem coerentes. |
| Canonical | Ausente | Não incluído enquanto o projeto estiver em preview temporário; deve ser adicionado somente quando houver domínio permanente confirmado. |

A title tag e a description trabalham termos relacionados a negócio digital, estrutura digital, Escritório Virtual, ferramentas e Academia sem repetir palavras-chave artificialmente. A estrutura da Home usa um único H1 e H2 com funções argumentativas distintas. O conteúdo permanece indexável, mas o preview temporário não deve ser tratado como endereço canônico de produção.

## Glossário de interface aplicado

| Preferir | Evitar em textos comerciais |
|---|---|
| Minha operação | Ferramentas administrativas |
| Meus resultados | Ganhos como promessa isolada |
| Links & campanhas | Encurtador de URL |
| Minha rede direta | Rede de patrocinadores, sem definição |
| Meu apresentador | Patrocinador, quando a função é apenas apresentar o link |
| Academia de execução | Lista de cursos |
| Biblioteca de recursos / Biblioteca de execução | Baixar produtos |
| Preferências de recebimento | Pagamentos automáticos |
| Solicitações atribuídas | Vendas garantidas |
| Comunicação preparada | Automação de WhatsApp/Facebook |
| Contatos consentidos | Leads comprados ou importados |
| Membro | Afiliado, usuário ou revendedor sem definição |

As rotas técnicas continuam preservadas, incluindo `/membros/ganhos` e `/membros/patrocinador`, porque a revisão é de apresentação e não de arquitetura. Os labels visíveis foram atualizados sem renomear caminhos, persistência ou contratos.

## Responsividade textual

A Home mantém headlines com `clamp`, largura máxima e breakpoints existentes. Em telas menores, o H1 fica limitado a aproximadamente 19,5 caracteres por linha, os CTAs ocupam a largura disponível e o menu vira navegação recolhível. O offer stack usa grid de uma coluna no breakpoint de 900px, enquanto a barra de prova e os vídeos passam a uma coluna no breakpoint de 650px. Os títulos dos blocos usam largura máxima para evitar linhas excessivamente longas; o FAQ usa `details` nativo, que mantém a informação acessível e reduz a altura inicial.

Os textos financeiros foram reduzidos em tamanho e contexto, com preço e formulário depois do stack. A seção de oferta distingue “valor de entrada”, “solicitação”, “orientação de pagamento”, “lançamento” e “resultado”, evitando que o mobile transforme o preço no único argumento visível.

## Referências

[1]: ../client/index.html "SEO e metadados sociais da aplicação"
[2]: ../client/src/pages/Home.tsx "Home e hierarquia semântica"
[3]: ../client/src/index.css "Estilos responsivos e tokens visuais"
[4]: ../shared/memberOfficeContent.ts "Labels e grupos do Escritório Virtual"
[5]: https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm "Código de Defesa do Consumidor — Lei nº 8.078/1990"
