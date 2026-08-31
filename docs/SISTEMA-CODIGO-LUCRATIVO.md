# Código Lucrativo — Documentação do Sistema

> Documento funcional e técnico de referência. Atualizado a partir da estrutura real do repositório.

## 1. O que é o Código Lucrativo

O **Código Lucrativo** é uma aplicação web fullstack que entrega ao membro uma estrutura digital pronta para operar um negócio digital, evitando que ele precise construir do zero página, escritório virtual, materiais, capacitação, acompanhamento de pedidos, rede e recursos de divulgação.

A proposta central é: **receber uma estrutura já desenvolvida, personalizar a operação, aprender a utilizar as ferramentas, divulgar e acompanhar os registros da própria atividade.**

O sistema não deve ser apresentado como promessa de ganho automático. Pedido, venda, ganho, saldo, recebimento e transação são conceitos distintos e devem permanecer tecnicamente e comercialmente separados.

## 2. Perfis principais

### Visitante
Acessa a experiência pública, conhece a proposta, consulta informações e pode iniciar o fluxo comercial previsto pela aplicação.

### Membro
Recebe acesso ao **Escritório Virtual**, onde administra sua presença, acompanha pedidos e ganhos, utiliza materiais, acessa capacitação, acompanha rede e desempenho e utiliza canais de suporte.

### Administrador
Acessa o **Painel Administrativo**, responsável pela gestão operacional do ecossistema: membros, conteúdos, recursos, publicações, capacitação, suporte, depoimentos e configurações administrativas disponíveis no código.

## 3. Jornada geral

Fluxo conceitual:

1. visitante conhece o Código Lucrativo;
2. inicia uma solicitação/pedido;
3. acompanha a solicitação;
4. realiza a ativação/personalização conforme o fluxo vigente;
5. acessa o Escritório Virtual;
6. configura seus dados e página;
7. aprende pelos recursos de capacitação;
8. utiliza materiais e ferramentas de divulgação;
9. acompanha pedidos, ganhos, rede e desempenho;
10. utiliza suporte quando necessário.

## 4. Escritório Virtual do membro

A navegação real está centralizada em `shared/memberOfficeContent.ts`.

### Início
- **Visão geral** (`/membros`) — resumo operacional do membro.
- **Primeiros passos** (`/membros/como-divulgar`) — orientação inicial de uso.
- **Central de Divulgação** (`/membros/operacao`) — área operacional relacionada à divulgação.

### Minha página
- **Minha página e perfil** (`/membros/configuracoes`) — personalização e informações públicas.
- **Dados da conta** (`/membros/meus-dados`) — dados cadastrais do membro.
- **Dados de recebimento** (`/membros/recebimentos`) — preferências/dados utilizados pelo fluxo de recebimento.

### Vendas
- **Meus pedidos** (`/membros/meus-pedidos`) — acompanhamento dos pedidos atribuídos ao membro.
- **Ganhos e extrato** (`/membros/ganhos`) — acompanhamento financeiro disponibilizado ao membro.

### Rede
- **Minha rede** (`/membros/rede`) — visualização da rede/indicações conforme as regras existentes.

### Conteúdo
- **Material de divulgação** (`/membros/artigos`) — materiais destinados à divulgação.
- **Biblioteca de Recursos** (`/membros/materiais`) — biblioteca de recursos disponibilizados ao membro.

### Capacitação
- **Academia** (`/membros/academia`) — conteúdo educacional/cursos.
- **Biblioteca de e-books** (`/membros/ebooks`) — e-books disponibilizados na plataforma.
- **Certificados** (`/membros/cartao-certificado`) — experiência de certificados/cartão de certificado prevista pelo sistema.

### Desempenho
- **Meu desempenho** (`/membros/pontos`) — indicadores/pontuação existentes no produto.

### Ajuda
- **Fale conosco** (`/membros/fale-conosco`) — canal de suporte.
- **Enviar depoimento** (`/membros/fazer-depoimento`) — envio de depoimento pelo membro.

## 5. Painel Administrativo

A navegação administrativa real está centralizada em `client/src/lib/adminNavigation.ts`.

### Visão geral
- **Dashboard** (`/admin`) — visão consolidada da operação.

### Gestão de membros
- **Membros e rede** (`/admin/membros`) — gestão de membros e relações de rede.

### Conteúdo
- **Material de Divulgação** (`/admin/material-divulgacao`) — administração dos materiais de divulgação.
- **Biblioteca de Recursos** (`/admin/biblioteca-recursos`) — administração dos recursos entregues aos membros.
- **Publicações** (`/admin/publicacoes`) — gestão das publicações/conteúdos correspondentes.

### Capacitação
- **Academia** (`/admin/academia`) — administração da estrutura educacional.
- **E-books** (`/admin/ebooks`) — administração da biblioteca de e-books.

### Relacionamento
- **Suporte** (`/admin/suporte`) — gestão do atendimento.
- **Depoimentos** (`/admin/relatos`) — gestão/moderação dos depoimentos.

### Sistema
- **Configurar Seções** (`/admin/imagens`) — configurações visuais/seções suportadas pela aplicação.
- **Preview** (`/preview`) — visualização de preview.
- **Toast** (`/admin/toast`) — área administrativa relacionada aos avisos/toasts existentes.

### Anotações
- **FUTURAS IMPLEMENTAÇÕES** (`/admin/futuras-implementacoes`) — registro/área prevista no painel para itens futuros.

## 6. Dashboard e métricas

O Dashboard deve priorizar **dados reais ou métricas calculáveis a partir de dados reais**. Nenhuma métrica fictícia deve ser apresentada como dado de produção.

Princípio de implementação:

- existe dado/função real → conectar;
- pode ser calculado corretamente com dados existentes → calcular;
- não há dados suficientes → não inventar valor; manter apenas como possibilidade de produto quando apropriado.

Métricas de negócio úteis incluem, quando sustentadas pela persistência real, visitas, pedidos, conversão, ganhos, rede, conteúdos e indicadores operacionais.

**Taxa de publicação**, quando utilizada, representa conceitualmente:

`conteúdos publicados / total de conteúdos × 100`

Ela é uma métrica operacional e não deve substituir indicadores comerciais mais relevantes.

## 7. Conteúdo e capacitação

O Código Lucrativo reúne diferentes tipos de ativos digitais. Biblioteca de Recursos, Material de Divulgação, Academia e E-books possuem finalidades diferentes e não devem ser tratados como módulos duplicados.

- **Material de Divulgação:** ativos destinados à promoção/divulgação.
- **Biblioteca de Recursos:** recursos e ferramentas disponibilizados ao membro.
- **Academia:** experiência estruturada de capacitação.
- **E-books:** biblioteca editorial/didática em formato de e-book.

O administrador gerencia os ativos; o membro consome/utiliza aquilo que estiver disponibilizado conforme as regras reais.

## 8. Pedidos, ganhos e rede

A aplicação possui conceitos de pedidos, transações/ganhos e indicações/rede. A documentação e a interface devem evitar tratar esses termos como sinônimos.

- **Pedido:** registro comercial criado pelo fluxo correspondente.
- **Venda:** pedido que satisfaz as condições reais para ser considerado venda.
- **Ganho:** valor atribuído conforme regra financeira vigente.
- **Saldo/recebimento:** representação financeira conforme o fluxo implementado.
- **Rede/indicação:** vínculo entre membros conforme persistência e regras do sistema.

Qualquer alteração financeira deve ser auditada no schema, backend, persistência e testes antes de ser documentada como regra vigente.

## 9. Arquitetura técnica

| Camada | Tecnologia |
| --- | --- |
| Front-end | React 19 + TypeScript + TSX |
| Build/dev | Vite |
| Estilos | Tailwind CSS 4 + CSS |
| Ícones | Lucide React nas interfaces atuais |
| Roteamento cliente | Wouter |
| Backend | Node.js + Express |
| API tipada | tRPC |
| Persistência | MySQL |
| ORM/schema | Drizzle ORM |
| Testes | Vitest + integração + Playwright E2E |
| Gerenciador | pnpm |

## 10. Organização técnica essencial

- `client/src/` — aplicação React e interface.
- `client/src/pages/` — páginas públicas, administrativas e do membro.
- `client/src/components/` — componentes reutilizáveis.
- `client/src/lib/adminNavigation.ts` — menu administrativo.
- `client/src/lib/memberDashboardNavigation.ts` — integração da navegação do membro com o layout.
- `shared/memberOfficeContent.ts` — catálogo canônico de navegação do Escritório Virtual.
- `server/` — servidor, tRPC, autenticação e persistência.
- `server/routers.ts` — contratos/operações tRPC.
- `server/db.ts` — acesso/persistência de dados.
- `drizzle/schema.ts` — schema principal do banco.
- `drizzle/` — migrações.
- `docs/` — documentação técnica, auditorias e decisões.
- `e2e/` — testes de ponta a ponta.

## 11. Princípios de desenvolvimento

1. **Código real é a fonte de verdade.** Documentação deve acompanhar a implementação.
2. **Não inventar funcionalidade.** Uma função só é considerada existente quando o fluxo real a sustenta.
3. **Não inventar métricas.** Produção deve usar dados reais.
4. **Preservar contratos.** Alterações visuais não devem quebrar tRPC, autenticação, autorização, persistência ou regras de negócio.
5. **Reutilizar antes de reescrever.** Componentes e fluxos existentes devem ser aproveitados.
6. **Responsividade obrigatória.** Desktop, tablet e mobile fazem parte do produto.
7. **Acessibilidade.** Controles devem manter foco, teclado, rótulos e contraste adequados.
8. **Segurança operacional.** Nunca versionar segredos, `.env`, tokens, cookies, dumps ou credenciais.
9. **Testar antes de publicar.** `pnpm check`, `pnpm test` e `pnpm build` devem fazer parte da validação.
10. **Sem promessa financeira fictícia.** Comunicação comercial deve refletir exatamente o produto e seus limites.

## 12. Deploy e operação

O projeto possui documentação específica de autodeploy em `docs/auto-deploy-vps.md`. Mudanças de código devem respeitar o fluxo de branch/deploy configurado no repositório.

Antes de considerar uma versão pronta:

```bash
pnpm check
pnpm test
pnpm build
```

Falha de deploy deve ser investigada antes de declarar a versão publicada.

## 13. Regra para documentação futura

Ao adicionar ou alterar um módulo, documentar no mínimo:

- objetivo;
- usuário que utiliza;
- rota/interface;
- dados de entrada;
- dados de saída;
- permissões;
- persistência;
- operações tRPC/backend;
- estados de loading/erro/vazio;
- comportamento mobile;
- testes;
- impacto em deploy/migração, quando houver.

## 14. Fonte de verdade

Este documento explica o produto em nível funcional e arquitetural. Em caso de divergência, verificar nesta ordem:

1. código atual da branch/release em análise;
2. schema e migrações;
3. contratos do backend/tRPC;
4. testes automatizados;
5. documentação em `docs/`;
6. textos comerciais.

A documentação deve ser corrigida quando ficar atrás do código — nunca o código ser interpretado a partir de uma descrição desatualizada.