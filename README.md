# Código Lucrativo — Estrutura Digital Pronta

A Código Lucrativo é uma aplicação web fullstack que apresenta e opera uma **estrutura de negócio digital pronta para começar**. A reformulação desta versão reposiciona a comunicação comercial de uma oferta centrada em preço e ganhos para uma proposta baseada em infraestrutura existente: Código Lucrativo personalizada, Escritório Virtual, campanhas, pedidos, contatos, produtos, Academia, materiais, acompanhamento e recursos administrativos disponíveis para cada membro.

> A linha central da experiência é: **não comece do zero; receba uma estrutura digital já desenvolvida, personalize sua operação, aprenda a utilizar as ferramentas, divulgue e acompanhe os registros da sua atividade.**

A aplicação preserva as rotas, a autenticação, a persistência, o fluxo de pedidos, as regras financeiras e a arquitetura React + TypeScript + Express + tRPC + Drizzle + MySQL. As mudanças principais desta entrega estão concentradas em copy, nomenclatura, SEO, jornada pós-pedido, primeira experiência do membro, documentação de prova e apresentação visual da Home.

## Visão técnica

| Camada | Implementação |
| --- | --- |
| Cliente | React 19, TypeScript, Vite e Tailwind CSS 4 |
| Servidor | Node.js, Express, tRPC e `tsx` |
| Dados | MySQL compatível com Drizzle ORM |
| Schema e migrações | `drizzle/schema.ts` e diretório `drizzle/` |
| Autenticação | OAuth configurável e sessão demo existente do projeto |
| Arquivos | Integração S3 quando configurada pelo ambiente |
| Testes | Vitest, testes de integração e suíte E2E Playwright em `e2e/` |
| Preview | Vite em modo desenvolvimento com HMR na porta 3000 |

## O que foi alterado nesta versão

A Home agora comunica a progressão **problema → desejo → mecanismo → produto → jornada → stack → comparação → facilidade → ativo digital → prova**, em vez de repetir preço, pagamento e ganhos como se fossem o produto. O hero apresenta o conceito de negócio digital pronto e a “Estrutura Digital Replicável”, explicando que a estrutura reduz a necessidade de construir página, painel, materiais, campanhas e operação do zero.

A oferta, o formulário, o FAQ, as telas de confirmação, acompanhamento e personalização passaram a falar em **solicitação e ativação da estrutura**, sem esconder o valor de entrada, as orientações reais de pagamento ou as condições administrativas. A copy também esclarece que pedido, venda, ganho, saldo, recebimento e transação não são sinônimos e que não existe garantia de resultado financeiro automático.

O Escritório Virtual recebeu uma jornada inicial de oito passos, nomenclatura comercial mais clara e textos alinhados aos recursos efetivamente identificados no código. Campanhas, visitas, contatos, pedidos atribuídos, indicações, resultados, preferências de recebimento, cursos, e-books e materiais foram descritos com os limites reais de cada fluxo.

A Home também inclui a imagem `client/public/codigo-lucrativo-banner.png` como banner superior. A navegação permanece logo abaixo da imagem e o botão vermelho **Fechar imagem de apresentação** remove o banner do fluxo visual para que a navegação ocupe o topo.

## Pré-requisitos

Para desenvolvimento local ou implantação em VPS, utilize Node.js 22 ou compatível com o projeto, pnpm 10 e um banco MySQL acessível. O repositório inclui `pnpm-lock.yaml`; use instalação congelada para reproduzir as dependências.

```bash
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install --frozen-lockfile
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha os valores reais no servidor. Nunca faça commit de `.env`, tokens, senhas, chaves de API ou credenciais de banco.

| Variável | Obrigatória | Uso |
| --- | --- | --- |
| `NODE_ENV` | Sim | Use `development` no preview e `production` no servidor final. |
| `PORT` | Não | Porta HTTP; padrão `3000`. |
| `DATABASE_URL` | Sim para dados persistidos | URL MySQL usada pelo Drizzle e pelo servidor. |
| `JWT_SECRET` | Sim | Segredo usado pela camada de sessão/token. Gere um valor longo e aleatório. |
| `VITE_APP_ID` | Conforme ambiente | Identificador da aplicação. |
| `OAUTH_SERVER_URL` | Quando OAuth estiver ativo | Servidor OAuth utilizado pelo login real. |
| `VITE_OAUTH_PORTAL_URL` | Quando OAuth estiver ativo | URL do portal OAuth consumida pelo cliente. |
| `OWNER_OPEN_ID` | Conforme ambiente | Identificador do proprietário usado pelo ambiente integrado. |
| `BUILT_IN_FORGE_API_URL` | Somente se o recurso integrado for utilizado | Endpoint server-side da integração Forge. |
| `BUILT_IN_FORGE_API_KEY` | Somente se o recurso integrado for utilizado | Chave server-side da integração Forge. |
| `VITE_FRONTEND_FORGE_API_URL` | Somente se o cliente utilizar o recurso | Endpoint público configurado para o cliente. |
| `VITE_FRONTEND_FORGE_API_KEY` | Somente se o cliente utilizar o recurso | Chave pública prevista pela integração; não coloque segredo privado aqui. |
| `LOCAL_STORAGE_DIR` | Não | Diretório local opcional para armazenamento compatível com o projeto. |

## Desenvolvimento com atualização ao vivo

O comando oficial mantém Express, Vite e `tsx watch` ativos. As alterações em React, TypeScript e CSS são aplicadas pelo HMR enquanto o navegador permanece aberto.

```bash
pnpm dev
```

A aplicação ficará disponível em `http://localhost:3000/`. Para disponibilizar temporariamente o preview fora do ambiente local, utilize o endereço público exposto pelo workspace. Esse endereço é destinado à revisão durante o desenvolvimento; não substitui um deploy permanente em domínio próprio.

## Banco de dados e migrações

O schema principal está em `drizzle/schema.ts`. As migrações versionadas acompanham o repositório em `drizzle/`, incluindo a sequência de alterações de consentimento, e-books, produtos, pedidos, transações, indicações, pontuação, depoimentos, vínculos de cursos e campos de perfil.

Com `DATABASE_URL` configurada, o comando oficial do projeto é:

```bash
pnpm db:push
```

Esse script executa a geração e a aplicação das migrações configuradas pelo Drizzle. Em produção, faça backup do banco antes de aplicar alterações e execute o comando com a versão do código que será colocada em serviço. Não substitua regras financeiras, tabelas ou migrações manualmente sem revisar o schema e o histórico SQL.

## Conteúdo padrão da Biblioteca e Academia

Os e-books padrão, suas categorias e os cursos padrão da Academia são versionados no repositório. A fonte da verdade é o GitHub: `ebook-import/ebook-manifest.tsv`, `shared/ebookLibraryCatalog.ts`, os PDFs em `ebook-import/fontes_importados/` e `content-seeds/academy-courses.json`.

O acervo padrão atual contém 87 e-books empacotados. A Academia usa 29 desses materiais em 11 cursos e 16 módulos progressivos, mantendo `usage: "both"` para que o mesmo PDF possa aparecer na Biblioteca e dentro do curso. Em uma VPS nova, depois de configurar o banco e aplicar o schema, use o bootstrap controlado:

```bash
node scripts/sync-packaged-content.mjs --dry-run
node scripts/sync-packaged-content.mjs --apply
```

Esse fluxo é idempotente e usa `sourceId` para não duplicar e-books. O deploy normal não executa importação destrutiva automaticamente. Detalhes de operação, backup, rollback e exportação de cursos estão em `docs/CONTENT_BOOTSTRAP.md`.

## Testes e build

Os comandos oficiais usados nesta entrega são:

```bash
pnpm check
pnpm test
pnpm build
```

A suíte principal cobre rotas, contratos de integração, autenticação, conteúdo do Escritório Virtual, e-books, perfil público, produtos, operações, finanças e comportamento responsivo de componentes. A suíte E2E fica em `e2e/` e possui dependências próprias:

```bash
cd e2e
pnpm install
E2E_BASE_URL=http://127.0.0.1:3000 PLAYWRIGHT_CHROME_PATH=/usr/bin/chromium pnpm test
```

Se o ambiente utilizar o Chromium instalado em outro caminho, ajuste `PLAYWRIGHT_CHROME_PATH`. A configuração antiga do pacote pode apontar para `/usr/bin/google-chrome`; neste workspace o executável validado é `/usr/bin/chromium`.

## Build e execução em produção

O build oficial cria os arquivos estáticos do cliente e empacota o servidor:

```bash
pnpm build
NODE_ENV=production PORT=3000 pnpm start
```

O processo de produção serve o cliente compilado e mantém as rotas client-side disponíveis pelo servidor Express. Em uma VPS, coloque Nginx ou outro proxy reverso na frente do processo, habilite HTTPS, encaminhe o tráfego para `127.0.0.1:3000` e mantenha o processo com systemd, PM2 ou Docker.

## Implantação recomendada em VPS

O fluxo mínimo é instalar Node.js, pnpm e MySQL, clonar o repositório, criar o `.env`, instalar dependências, aplicar o banco, gerar o build e iniciar o processo de produção.

```bash
git clone <URL-DO-REPOSITORIO> codigo-lucrativo
cd codigo-lucrativo
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install --frozen-lockfile
cp .env.example .env
# edite .env com os valores reais
pnpm db:push
pnpm check
pnpm test
pnpm build
NODE_ENV=production PORT=3000 pnpm start
```

Em uma VPS com Docker, o `Dockerfile` e o `docker-compose.vps.yml` incluídos nesta versão permitem subir o serviço e o MySQL em conjunto. Antes da primeira inicialização persistente, configure os segredos no arquivo de ambiente, execute a migração com o container da aplicação e confirme o backup do volume do banco.

```bash
docker compose -f docker-compose.vps.yml build
docker compose -f docker-compose.vps.yml run --rm app pnpm db:push
docker compose -f docker-compose.vps.yml up -d
```

O banco deve utilizar volume persistente. Não exponha a porta do MySQL publicamente; deixe-a acessível apenas à rede interna do compose ou ao servidor de aplicação. Para domínio próprio, configure o proxy reverso e o certificado TLS fora da aplicação, mantendo a aplicação escutando em uma porta interna.

## Organização do projeto

| Caminho | Responsabilidade |
| --- | --- |
| `client/src/pages/Home.tsx` | Home comercial, hero, contentBlocks, oferta, FAQ e banner superior |
| `client/src/pages/ApplicationConfirmation.tsx` | Confirmação do pedido e próximos passos |
| `client/src/pages/ApplicationTracking.tsx` | Acompanhamento da solicitação |
| `client/src/pages/PersonalizeAccess.tsx` | Transição para personalização e Escritório Virtual |
| `client/src/pages/MemberOffice.tsx` | Jornada inicial e visão geral do membro |
| `shared/memberOfficeContent.ts` | Catálogo de grupos, labels e rotas do Escritório Virtual |
| `client/src/lib/memberDashboardNavigation.ts` | Navegação compartilhada do painel |
| `server/routers.ts` | Contratos tRPC e operações do backend |
| `server/db.ts` | Persistência e consultas do banco |
| `drizzle/schema.ts` | Schema MySQL do Drizzle |
| `drizzle/` | Migrações e metadados do banco |
| `docs/` | Inventário, estratégia, auditorias, pesquisas e validações desta entrega |
| `e2e/` | Configuração e testes Playwright do site publicado |

## Documentação de decisão e auditoria

Os documentos em `docs/` registram o inventário funcional, a matriz recurso-benefício, o glossário, os critérios de prova, a auditoria da copy, a análise dos vídeos, a pesquisa de transparência, a estratégia de reposicionamento, o SEO e a auditoria visual do preview. Eles devem ser consultados antes de adicionar nova promessa comercial ou alterar a nomenclatura de um módulo.

A regra de produto permanece: **não inventar funcionalidades, números, depoimentos, ganhos ou garantias**. Uma funcionalidade somente deve entrar na copy quando interface, backend, persistência, fluxo e utilidade para o membro forem confirmados.

## Segurança operacional

Não versionar arquivos `.env`, dumps de banco, tokens, cookies, senhas ou chaves privadas. Use HTTPS em produção, limite o acesso administrativo, mantenha o MySQL em rede privada, faça backups antes de migrações e monitore o processo da aplicação. O resultado financeiro não é automático nem garantido; a comunicação comercial deve continuar distinguindo acesso à estrutura, pedido, venda, ganho, recebimento e saldo.

## Licença

O projeto mantém a licença declarada no `package.json`. Consulte os termos comerciais, dados de terceiros, imagens e integrações antes de redistribuir o serviço publicamente.
