# Preparação automática do workspace Replit

Este diretório contém o instalador `prepare-workspace.sh`. Ele prepara o ambiente para executar o projeto usando as convenções do Replit.

O instalador:

- clona o repositório quando o workspace ainda não tem o projeto;
- atualiza um clone existente usando `git pull --ff-only`;
- valida Node.js 20 ou superior;
- ativa o pnpm 10 quando necessário;
- instala as dependências com `pnpm install --frozen-lockfile`;
- executa `pnpm check`;
- inicia o preview na porta 5000;
- usa `DEMO_PREVIEW=1` por padrão, sem exigir um servidor MySQL local.

> O instalador não contém tokens, senhas, URLs de banco ou outras credenciais.

## 1. Workspace novo, sem projeto

Crie ou faça o remix de um workspace vazio no Replit e abra a ferramenta **Shell**.

Cole o comando abaixo:

```bash
curl -fsSL \
  https://raw.githubusercontent.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/main/scripts/prepare-workspace.sh \
  -o prepare-workspace.sh \
&& chmod +x prepare-workspace.sh \
&& ./prepare-workspace.sh
```

O script criará a pasta `pagina-lucrativa-consolidada`, clonará o repositório dentro dela, instalará as dependências, executará a checagem TypeScript e iniciará o preview.

Quando aparecer `Iniciando preview na porta 5000`, abra a aba **Preview** do Replit.

### Preparar sem iniciar o servidor

```bash
curl -fsSL \
  https://raw.githubusercontent.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/main/scripts/prepare-workspace.sh \
  -o prepare-workspace.sh \
&& chmod +x prepare-workspace.sh \
&& START_PREVIEW=0 ./prepare-workspace.sh
```

### Baixar e executar em um nome de pasta diferente

```bash
APP_DIR=meu-projeto ./prepare-workspace.sh
```

### Escolher uma branch

```bash
BRANCH=main ./prepare-workspace.sh
```

O padrão já é a branch principal do repositório.

## 2. Projeto totalmente importado

Se o workspace já contém um clone Git completo e o Shell está aberto na raiz do projeto, não clone o repositório novamente dentro de outra pasta.

Baixe o instalador e execute-o apontando para a pasta atual:

```bash
curl -fsSL \
  https://raw.githubusercontent.com/sistemacodigolucrativo/pagina-lucrativa-consolidada/main/scripts/prepare-workspace.sh \
  -o prepare-workspace.sh \
&& chmod +x prepare-workspace.sh \
&& APP_DIR=. ./prepare-workspace.sh
```

Nesse caso, o instalador:

1. busca atualizações do remoto;
2. executa `git pull --ff-only`;
3. instala ou confirma as dependências;
4. executa `pnpm check`;
5. inicia o preview.

Antes de usar `APP_DIR=.`, confirme que você está na raiz correta e que existe uma pasta `.git`:

```bash
pwd
git status
```

Se houver alterações locais importantes, salve-as em um commit ou faça backup antes. O modo `--ff-only` não cria merge automático nem sobrescreve conflitos.

## 3. Projeto parcialmente importado

### Parcial, mas ainda é um clone Git

Se a pasta já possui `.git`, use o mesmo comando do projeto completo:

```bash
APP_DIR=. ./prepare-workspace.sh
```

O instalador completa as dependências e tenta atualizar o clone sem criar um merge automático.

### Arquivos copiados, mas sem `.git`

Se a pasta contém arquivos do projeto, mas não possui `.git`, o instalador para de propósito para não sobrescrever arquivos:

```text
O destino já existe, mas não é um repositório Git
```

Escolha uma destas opções:

1. faça backup da pasta parcial e remova ou renomeie-a;
2. execute o instalador usando outro destino:

```bash
APP_DIR=pagina-lucrativa-consolidada ./prepare-workspace.sh
```

Não execute o instalador sobre uma pasta sem `.git` esperando que ele faça uma fusão automática.

## Banco de dados e modo real

Por padrão, o instalador inicia:

```bash
DEMO_PREVIEW=1
```

Esse modo usa os dados demo e não precisa de MySQL local.

Para executar o modo conectado ao banco real, configure os segredos no ambiente do Replit antes de iniciar:

```bash
DEMO_PREVIEW=0 START_PREVIEW=0 ./prepare-workspace.sh
```

O modo real exige pelo menos uma conexão MySQL válida em `DATABASE_URL` e os demais segredos usados pela aplicação. Não coloque esses valores no script ou no GitHub.

## Repositórios privados

O comando `curl` com a URL `raw.githubusercontent.com` funciona diretamente quando o arquivo está acessível publicamente. Para repositórios privados, use a importação GitHub autorizada pelo Replit ou um clone autenticado já configurado no workspace.

Nunca cole tokens, senhas ou chaves privadas no Shell, neste arquivo ou no repositório.

## Parar o preview

No Shell que está executando o servidor, pressione:

```text
Ctrl + C
```