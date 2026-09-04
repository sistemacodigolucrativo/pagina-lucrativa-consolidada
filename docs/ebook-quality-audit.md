# Revisão automática da biblioteca de e-books

Esta revisão protege o painel de membros contra materiais importados com baixa qualidade operacional.

## O que é bloqueado antes de aparecer para membros

- Arquivos auxiliares de pacote/script que não são e-books consumíveis, especialmente itens de `Script_Ptc.zip` como `Read Me`, `adsense`, `banners`, `external`, `sitenoar`, `tos`, `version` e tabelas de usuários.
- Conversões HTML pequenas demais ou sem texto suficiente, sinal típico de material quebrado, vazio ou faltando partes.

## O que é corrigido automaticamente

- Títulos importados com caracteres quebrados são normalizados para nomes legíveis em português.
- Links locais, relativos, `file:`, `javascript:` ou inseguros são neutralizados no HTML entregue ao iframe do leitor.
- Materiais com referências legadas ou datas antigas continuam disponíveis quando têm conteúdo suficiente, mas recebem observação de revisão automática no resumo.

## Objetivo

Manter a biblioteca útil para estudo, sem expor ao membro arquivos técnicos soltos, páginas incompletas, links quebrados ou títulos corrompidos pela importação.
