# Arquitetura — Código Lucrativo 2026

## Princípios da reestruturação

O produto será reconstruído como uma plataforma de operação comercial para membros. A navegação do sistema de referência foi preservada em seus objetivos, mas será condensada em hubs claros, sem replicar textos, usuários, produtos, preços ou dados privados da referência.

| Área | Função principal | Rotas iniciais |
| --- | --- | --- |
| Landing pública | Apresentar o método, os recursos e o acesso ao escritório | `/` |
| Escritório do membro | Acompanhar operação, campanhas, ganhos, produtos e formação | `/membros`, `/membros/*` |
| Administração | Acompanhar membros, catálogo, cursos e operação | `/admin` |

## Navegação do membro

O escritório concentra a navegação em **Visão geral**, **Campanhas**, **Ganhos**, **Produtos**, **Academia**, **Rede**, **Materiais**, **Ranking** e **Configurações**. Cada rota deverá ter uma função objetiva, uma ação principal e um estado vazio útil quando não houver dados cadastrados.

## Modelo de dados inicial

O banco separa identidade de autenticação, perfil público, links de campanha, produtos, lançamentos financeiros, cursos e progresso de aprendizado. A camada administrativa usará o campo de papel do usuário já presente no template e nunca será exposta ao membro comum.

## Critérios da prévia

A prévia online demonstrará a landing pública e a estrutura navegável dos painéis. Conteúdos operacionais vazios deverão ser mostrados como estados de início de jornada, e não como métricas, produtos ou depoimentos fictícios.
