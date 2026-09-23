import DashboardLayout from "@/components/DashboardLayout";
import { adminMenu } from "@/lib/adminNavigation";
import { CalendarClock, FileText, ServerCog } from "lucide-react";

const knowledgeProductSpec = `# ESPECIFICAÇÃO — TRANSFORMAÇÃO DO CONHECIMENTO DO MEMBRO EM PRODUTO DIGITAL
 
## 1. VISÃO DO PROJETO
 
O objetivo do Código Lucrativo não é simplesmente disponibilizar um curso genérico ou entregar o mesmo e-book pronto para todos os membros.
 
A proposta é criar, dentro da plataforma, um **processo personalizado de identificação, estruturação e transformação do conhecimento individual de cada membro em um produto digital próprio**, inicialmente com foco na criação de e-books.
 
Em outras palavras:
 
**cada membro entra com aquilo que sabe; o sistema ajuda a transformar esse conhecimento em um produto digital estruturado e potencialmente comercializável.**
 
O sistema não deve partir do pressuposto de que o membro já sabe qual produto criar.
 
Ele deverá ajudá-lo a descobrir isso.
  
## 2. PRINCÍPIO CENTRAL
 
O ativo inicial é o **conhecimento do membro**.
 
Esse conhecimento pode vir de:
 
 
- profissão;
 
- experiência profissional;
 
- habilidade prática;
 
- hobby;
 
- atividade que domina;
 
- experiência de vida;
 
- conhecimento técnico;
 
- método próprio;
 
- capacidade adquirida ao longo dos anos;
 
- problema que já aprendeu a resolver.
 

 
O sistema deverá identificar quais desses conhecimentos possuem potencial para serem transformados em conteúdo útil para outras pessoas.
  
## 3. ETAPA DE DIAGNÓSTICO
 
Antes de gerar qualquer e-book, deverá existir uma etapa de diagnóstico.
 
O sistema deverá conversar com o membro e coletar informações sobre:
 
 
- o que ele sabe fazer;
 
- profissão ou área de atuação;
 
- experiências anteriores;
 
- habilidades;
 
- assuntos sobre os quais consegue ensinar;
 
- problemas que sabe resolver;
 
- resultados que já conseguiu obter;
 
- público que poderia se beneficiar desse conhecimento;
 
- nível de conhecimento em cada assunto;
 
- preferência ou facilidade para determinados temas.
 

 
Essa etapa deve funcionar como uma **entrevista guiada**.
 
O membro não precisa conhecer termos como nicho, persona, posicionamento, copywriting ou infoproduto para responder.
 
As perguntas devem utilizar linguagem simples.
  
## 4. DESCOBERTA DE OPORTUNIDADES
 
A partir das respostas, o sistema deverá identificar possíveis oportunidades de produto.
 
Exemplo:
 
Um membro informa que trabalha há vários anos como confeiteiro.
 
Em vez de simplesmente perguntar:
 
"Qual e-book você deseja criar?"
 
o sistema poderá identificar possibilidades como:
 
 
- primeiros passos na confeitaria;
 
- produção de bolos para venda;
 
- cálculo de preço;
 
- organização de encomendas;
 
- técnicas específicas;
 
- receitas para determinado público;
 
- como começar uma pequena produção em casa.
 

 
A IA deverá transformar conhecimento amplo em **possibilidades concretas de produto**.
  
## 5. ESCOLHA DO PRODUTO
 
Depois da análise, o sistema poderá apresentar algumas propostas ao membro.
 
Cada proposta poderá informar:
 
 
- tema;
 
- problema que resolve;
 
- público potencial;
 
- promessa principal;
 
- conteúdo que poderia ser abordado;
 
- nível de dificuldade para produzir;
 
- diferenciais que podem ser explorados.
 

 
O membro escolhe uma direção antes da geração definitiva.
 
A IA atua como orientadora, não simplesmente como geradora automática de texto.
  
## 6. APROFUNDAMENTO DO CONHECIMENTO
 
Depois que o tema for escolhido, deverá ocorrer uma segunda entrevista, agora específica sobre aquele assunto.
 
O objetivo é extrair o máximo possível do conhecimento real do membro.
 
A IA poderá perguntar:
 
 
- Como você realiza determinada atividade?
 
- Quais erros iniciantes normalmente cometem?
 
- Qual sequência você recomenda?
 
- O que você aprendeu com experiência?
 
- Quais atalhos funcionam?
 
- O que normalmente não funciona?
 
- Quais exemplos reais consegue fornecer?
 
- Quais recomendações daria para alguém começando?
 
- Existe algum método ou sequência própria?
 

 
Essa etapa é fundamental.
 
O produto não deve ser simplesmente um texto genérico produzido pela IA.
 
A IA deve **organizar e potencializar o conhecimento humano fornecido pelo membro**.
  
## 7. ESTRUTURAÇÃO DO PRODUTO
 
Com as informações coletadas, o sistema deverá estruturar o produto.
 
Para um e-book, isso pode envolver:
 
 
- título;
 
- subtítulo;
 
- promessa;
 
- introdução;
 
- capítulos;
 
- subcapítulos;
 
- sequência pedagógica;
 
- exemplos;
 
- exercícios, quando aplicável;
 
- checklists;
 
- conclusão;
 
- chamada para próxima ação.
 

 
Antes da produção completa, poderá ser apresentado um sumário para aprovação do membro.
  
## 8. GERAÇÃO ASSISTIDA DO E-BOOK
 
Após aprovação da estrutura, a IA deverá produzir o conteúdo utilizando:
 
**conhecimento fornecido pelo membro + organização editorial + assistência de IA.**
 
A IA poderá melhorar:
 
 
- clareza;
 
- gramática;
 
- organização;
 
- didática;
 
- exemplos;
 
- estrutura;
 
- legibilidade.
 

 
Porém, deve evitar inventar experiências pessoais, credenciais, resultados ou histórias atribuídas ao membro.
 
Quando faltar informação importante, a preferência deverá ser **perguntar ao membro**, e não fabricar conteúdo.
  
## 9. PERSONALIZAÇÃO
 
O resultado deverá pertencer à identidade daquele membro.
 
Quando aplicável, permitir personalização de:
 
 
- nome do autor;
 
- nome do produto;
 
- descrição;
 
- apresentação do autor;
 
- identidade visual;
 
- capa;
 
- imagens;
 
- informações comerciais.
 

 
Dois membros com conhecimentos diferentes devem conseguir produzir produtos completamente diferentes dentro da mesma plataforma.
  
## 10. PRODUTO FINAL
 
Inicialmente, o principal formato poderá ser o e-book.
 
Entretanto, a arquitetura conceitual não deve tratar "e-book" como o objetivo definitivo.
 
O verdadeiro objeto do sistema é:
 
**CONHECIMENTO → PRODUTO DIGITAL**
 
Isso permite futuramente transformar o mesmo mecanismo em criação assistida de:
 
 
- e-books;
 
- guias;
 
- manuais;
 
- apostilas;
 
- minicursos;
 
- cursos;
 
- checklists;
 
- materiais de apoio;
 
- outros produtos digitais.
 

 
Portanto, o e-book deve ser entendido como o **primeiro formato de saída**, e não como a definição completa do sistema.
  
## 11. FLUXO CONCEITUAL
 
O fluxo esperado é:
 
MEMBRO ↓ Diagnóstico de conhecimentos ↓ Identificação de habilidades e experiências ↓ Análise de possibilidades ↓ Sugestões de produtos ↓ Escolha do tema ↓ Entrevista especializada ↓ Extração do conhecimento ↓ Definição de público e problema ↓ Estruturação do produto ↓ Aprovação do membro ↓ Geração assistida ↓ Revisão/personalização ↓ Produto digital final
  
## 12. DIFERENCIAL ESTRATÉGICO
 
O Código Lucrativo não deve funcionar apenas como:
 
"Faça este curso e aprenda a vender."
 
A proposta é mais ampla:
 
**"Vamos descobrir aquilo que você já sabe, identificar como esse conhecimento pode gerar valor para outras pessoas e ajudá-lo a transformá-lo em um produto digital estruturado."**
 
Portanto, a plataforma deixa de ser apenas um ambiente de treinamento e passa a funcionar também como uma **estrutura de criação assistida de ativos digitais personalizados para cada membro**.
  
## 13. EXPERIÊNCIA DO USUÁRIO
 
Todo o processo deverá ser adequado para pessoas sem conhecimento técnico.
 
O usuário não deverá precisar saber previamente:
 
 
- o que é persona;
 
- o que é copy;
 
- o que é funil;
 
- como estruturar um e-book;
 
- como organizar capítulos;
 
- como diagramar conteúdo;
 
- como escrever profissionalmente;
 
- como criar uma oferta.
 

 
Esses conceitos podem existir internamente no sistema, mas a interface deve traduzi-los para perguntas e decisões simples.
 
Exemplo:
 
Evitar:
 
"Defina a persona do seu infoproduto."
 
Preferir:
 
"Quem é a pessoa que mais se beneficiaria daquilo que você sabe ensinar?"
 
A complexidade deve ficar com o sistema, e não com o membro.
  
## 14. REGRA FUNDAMENTAL PARA A IA
 
A IA não deve substituir o conhecimento do membro por conteúdo genérico.
 
Ela deverá funcionar principalmente como:
 
**entrevistadora + analista + organizadora + redatora + revisora + assistente de criação.**
 
Sempre que possível:
 
 
1. extrair conhecimento;
 
2. compreender;
 
3. organizar;
 
4. estruturar;
 
5. complementar apenas quando apropriado;
 
6. validar com o membro;
 
7. gerar o produto.
 

 
O objetivo é que o resultado tenha participação intelectual real do membro e não pareça apenas mais um e-book genérico produzido automaticamente.
  
## 15. IMPLEMENTAÇÃO NO CÓDIGO LUCRATIVO
 
Antes de propor arquivos, banco de dados, endpoints, componentes React, serviços de IA ou alterações arquiteturais, a IA responsável pela implementação deverá obrigatoriamente auditar a branch real do projeto.
 
A implementação deverá aproveitar a estrutura existente sempre que possível.
 
Não recriar autenticação, painel, usuários, banco de dados ou outras estruturas que o Código Lucrativo já possua.
 
A nova funcionalidade deverá ser integrada ao fluxo existente do membro, preservando:
 
 
- autenticação;
 
- permissões;
 
- hierarquia;
 
- navegação;
 
- dados existentes;
 
- funcionalidades atuais;
 
- responsividade;
 
- segurança.
 
Somente depois da auditoria do código real deverá ser elaborado o plano técnico definitivo de implementação.`;

const maintenanceMenuSpec = `# ESPECIFICAÇÃO — MENU DE MANUTENÇÃO PÓS-INSTALAÇÃO VIA SSH

Sim. Esse menu pós-instalação via SSH é uma boa ideia.

O comando poderia ser:

menu

Ou:

codigo-menu

E abrir algo assim:

=====================================
 CÓDIGO LUCRATIVO — MENU MANUTENÇÃO
=====================================

1) Status geral do sistema
2) Gerenciar administrador
3) Backup do banco de dados
4) Backup completo da VPS/projeto
5) Restaurar backup
6) Segurança e credenciais
7) Banco de dados / limpeza segura
8) Deploy, build e rollback
9) Logs e diagnóstico
10) Nginx, domínio e SSL
11) Verificação de produção
0) Sair

## 1. Status geral do sistema

Serve para ver rapidamente se está tudo vivo.

Deve mostrar:

- Serviço pagina-lucrativa.service: active/inactive
- Domínio respondendo HTTP 200 ou erro
- Uso de disco
- Uso de memória
- Banco conectando ou não
- Último commit em produção
- Último backup disponível

Por que precisa: antes de mexer em qualquer coisa, você precisa saber se o sistema está saudável.

## 2. Gerenciar administrador

Esse é um dos pontos mais importantes.

Opções:

1) Listar administradores
2) Alterar e-mail do admin
3) Alterar senha do admin
4) Criar novo admin
5) Remover admin
6) Rebaixar admin para membro

Por que precisa: se você esquecer senha, perder e-mail ou precisar trocar acesso administrativo, não fica dependente do painel.

Como deve corrigir/funcionar: o menu deve alterar diretamente no banco, mas sempre fazendo backup antes.

Regra obrigatória: antes de alterar admin, criar backup SQL automático.

## 3. Backup do banco de dados

Opções:

1) Criar backup SQL agora
2) Listar backups SQL existentes
3) Ver tamanho/data do último backup
4) Validar backup SQL em banco temporário

Por que precisa: o banco guarda usuários, admins, pedidos, membros, e-mails, senhas hash, conteúdos e dados operacionais.

Como deve funcionar: usar mysqldump, salvar em pasta segura e registrar data/hora.

## 4. Backup completo da VPS/projeto

Opções:

1) Backup completo do projeto
2) Backup completo com banco + arquivos
3) Backup de .env, Nginx, systemd e storage
4) Gerar manifesto do backup
5) Gerar checksum

Por que precisa: backup só do banco não recupera tudo. Você também precisa dos arquivos, .env, configurações de serviço, Nginx, uploads e storage.

Como deve funcionar: gerar .tar.gz com manifesto e checksum, sem expor segredo no relatório.

## 5. Restaurar backup

Opções:

1) Restaurar banco em banco temporário
2) Restaurar banco em produção
3) Restaurar arquivos do projeto
4) Restaurar backup completo

Por que precisa: backup que nunca foi restaurado é apenas uma promessa.

Como deve funcionar: por segurança, restauração em produção deve exigir confirmação forte:

DIGITE: RESTAURAR PRODUCAO

E antes de restaurar, criar backup do estado atual.

## 6. Segurança e credenciais

Opções:

1) Verificar JWT_SECRET
2) Verificar DATABASE_URL
3) Verificar ENABLE_DEMO_ACCOUNTS
4) Listar fingerprints SSH autorizadas
5) Remover chave SSH antiga
6) Gerar nova chave SSH
7) Verificar permissões de arquivos sensíveis
8) Procurar arquivos .env, .pem, .key expostos no projeto

Por que precisa: foi exatamente aí que apareceram riscos na auditoria.

Como deve funcionar: nunca imprimir valor real de senha, token, chave, JWT_SECRET ou DATABASE_URL. Mostrar só status mascarado.

Exemplo:

JWT_SECRET: presente, tamanho 64
DATABASE_URL: presente, conexão OK
ENABLE_DEMO_ACCOUNTS: ausente/desativado

## 7. Banco de dados / limpeza segura

Opções:

1) Limpar sessões expiradas
2) Limpar logs antigos
3) Limpar tokens temporários expirados
4) Limpar backups antigos
5) Otimizar tabelas
6) Ver tamanho das tabelas

Por que precisa: com o tempo, banco e arquivos acumulam lixo operacional.

Como deve funcionar: nada de apagar usuários, membros, pedidos ou dados financeiros sem confirmação. Limpeza deve ser só de dados temporários/expirados.

Regra obrigatória: antes de qualquer limpeza, backup automático.

## 8. Deploy, build e rollback

Opções:

1) Ver commit atual
2) Atualizar projeto da main
3) Rodar pnpm check
4) Rodar pnpm test
5) Rodar pnpm build
6) Reiniciar serviço
7) Fazer rollback para build anterior

Por que precisa: se uma atualização quebrar o sistema, você precisa voltar rápido.

Como deve funcionar: antes de aplicar nova build, salvar backup do dist atual.

## 9. Logs e diagnóstico

Opções:

1) Ver logs do serviço
2) Ver erros recentes
3) Ver logs do Nginx
4) Ver status do banco
5) Ver uso de disco
6) Ver portas em uso

Por que precisa: quando der erro, você precisa diagnosticar sem caçar comando manual.

Como deve funcionar: mostrar apenas os últimos registros e não expor segredo.

## 10. Nginx, domínio e SSL

Opções:

1) Testar configuração do Nginx
2) Reiniciar Nginx
3) Ver domínio configurado
4) Testar HTTPS
5) Ver validade do certificado SSL
6) Renovar SSL

Por que precisa: se domínio, proxy ou SSL quebrar, o site sai do ar mesmo com app funcionando.

Como deve funcionar: usar testes seguros antes de reiniciar.

## 11. Verificação de produção

Opções:

1) Testar home pública
2) Testar login demo bloqueado
3) Testar /ebook-files sem login
4) Testar /ebook-files com sessão
5) Testar arquivos sensíveis bloqueados
6) Gerar relatório final

Por que precisa: isso automatiza os testes feitos manualmente.

Como deve funcionar: gerar um relatório .md em CORRECOES/ ou RELATORIOS/, sem segredos.

## Itens recomendados adicionais

Inclua também:

1) Rollback de emergência
2) Restaurar backup em banco temporário
3) Verificar validade do SSL
4) Verificar espaço em disco
5) Listar administradores
6) Remover administrador
7) Criar administrador emergencial
8) Verificar permissões de arquivos sensíveis
9) Gerar relatório de manutenção
10) Testar produção automaticamente

## Recomendação de primeira versão

Para a primeira versão, fazer só o essencial:

1) Status geral
2) Alterar senha/e-mail admin
3) Criar/remover admin
4) Backup SQL
5) Backup completo
6) Restaurar backup em banco temporário
7) Segurança SSH/JWT/DATABASE_URL
8) Testes de produção
9) Logs
10) Rollback

Isso já resolveria 90% dos problemas reais de manutenção pós-instalação.`;


export default function AdminFutureImplementations() {
  return (
    <DashboardLayout menuItems={adminMenu} title="Administração">
      <main className="mx-auto w-full max-w-6xl p-4 md:p-8">
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <CalendarClock className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Futuras Implementações</h1>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            Central administrativa para registrar e acompanhar melhorias planejadas para o projeto.
          </p>
        </header>

        <div className="grid gap-5">
          <section className="rounded-2xl border bg-card p-5 shadow-sm md:p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl border bg-muted/40 p-3">
                <ServerCog className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">Bootstrap automático da VPS</h2>
                  <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">Planejado</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Criar um processo seguro e reproduzível para preparar uma nova VPS Ubuntu para receber o projeto e o fluxo de Auto Deploy, reduzindo a necessidade de configuração manual em futuras migrações de servidor.
                </p>
                <div className="mt-4 rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                  Implementação futura: script de bootstrap/provisionamento, validações idempotentes, configuração do ambiente de deploy e documentação de migração.
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="w-fit rounded-xl border bg-muted/40 p-3">
                <ServerCog className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">Menu de manutenção pós-instalação via SSH</h2>
                  <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">Anotação salva</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Registrar a futura central de manutenção acessível por SSH para status, administração emergencial, backups, restauração segura, credenciais, deploy, rollback, logs, Nginx, SSL e verificações de produção.
                </p>
                <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                  <div className="rounded-xl border border-dashed bg-muted/20 p-4"><strong className="mb-1 block text-foreground">Comando sugerido</strong>Usar <span className="font-mono text-foreground">menu</span> ou <span className="font-mono text-foreground">codigo-menu</span> após login SSH.</div>
                  <div className="rounded-xl border border-dashed bg-muted/20 p-4"><strong className="mb-1 block text-foreground">Primeira versão</strong>Status geral, admins, backups, restauração temporária, segurança, testes, logs e rollback.</div>
                  <div className="rounded-xl border border-dashed bg-muted/20 p-4"><strong className="mb-1 block text-foreground">Regra de segurança</strong>Nunca expor segredos e sempre criar backup antes de ações administrativas sensíveis.</div>
                </div>
                <details className="mt-4 rounded-xl border bg-muted/20 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-foreground">Ver anotação completa</summary>
                  <pre className="mt-4 max-h-[32rem] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-background/70 p-4 text-xs leading-6 text-muted-foreground">
                    {maintenanceMenuSpec}
                  </pre>
                </details>
              </div>
            </div>
          </section>


          <section className="rounded-2xl border bg-card p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="w-fit rounded-xl border bg-muted/40 p-3">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">Produto digital personalizado a partir do conhecimento do membro</h2>
                  <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">Especificação salva</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Registrar a futura transformação do conhecimento individual do membro em produto digital próprio, começando por e-books, com diagnóstico guiado, descoberta de oportunidades, entrevista especializada, estruturação, geração assistida e personalização.
                </p>
                <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                  <div className="rounded-xl border border-dashed bg-muted/20 p-4">
                    <strong className="mb-1 block text-foreground">Ativo inicial</strong>
                    Conhecimento, experiência, profissão, habilidade prática, hobby ou método próprio do membro.
                  </div>
                  <div className="rounded-xl border border-dashed bg-muted/20 p-4">
                    <strong className="mb-1 block text-foreground">Fluxo central</strong>
                    Diagnóstico, oportunidades, escolha, aprofundamento, estruturação, aprovação e geração assistida.
                  </div>
                  <div className="rounded-xl border border-dashed bg-muted/20 p-4">
                    <strong className="mb-1 block text-foreground">Regra de implementação</strong>
                    Auditar a branch real e reaproveitar autenticação, permissões, navegação, banco e componentes existentes.
                  </div>
                </div>
                <details className="mt-4 rounded-xl border bg-muted/20 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-foreground">Ver especificação completa</summary>
                  <pre className="mt-4 max-h-[32rem] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-background/70 p-4 text-xs leading-6 text-muted-foreground">
                    {knowledgeProductSpec}
                  </pre>
                </details>
              </div>
            </div>
          </section>
        </div>
      </main>
    </DashboardLayout>
  );
}
