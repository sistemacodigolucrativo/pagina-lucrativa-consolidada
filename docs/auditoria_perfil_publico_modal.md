# Auditoria — resumo e modal do perfil público

**Página validada:** `https://ocodigolucrativo.site/?afiliado=membro-validado`
**Release:** `20260819-1055-public-profile-modal`

A página de indicação passou a exibir no topo somente a foto, o nome `Membro de demonstração`, os links Website, Facebook, Twitter, Linkedin e Youtube e o botão `Ver mais`. A bio, Skype e WhatsApp não aparecem mais no resumo do cabeçalho.

O botão `Ver mais` abriu o diálogo responsivo com `role="dialog"`, título `Perfil público`, foto, nome, bio, links completos, Skype, WhatsApp clicável e botão `Fechar`. O fluxo também possui fechamento pelo botão X, clique fora do painel e tecla Escape; enquanto o modal está aberto, a rolagem do documento é bloqueada e o próprio painel possui rolagem vertical.

A suíte automatizada do release foi aprovada com 44 arquivos e 113 testes. `pnpm check` e `pnpm build` também foram aprovados. O serviço permanece ativo e as rotas `/`, `/membros/configuracoes` e `/membros/recebimentos` retornaram HTTP 200.

Depois do teste de abertura, a tecla Escape fechou o modal e devolveu a página ao estado compacto, mantendo somente foto, nome, redes sociais e `Ver mais` no topo. Não houve alteração de dados de perfil durante a validação.

Uma nova abertura confirmou novamente a presença do diálogo com os detalhes públicos; ao retornar ao estado fechado, o DOM voltou a expor apenas o resumo e o botão `Ver mais`.

No release `20260819-1115-profile-layout`, a validação visual confirmou a foto em formato quadrado posicionada à esquerda, a identificação `Oportunidade apresentada pelo Empreendedor Digital:` e `Apresentador(a) da Página Lucrativa` incorporada ao resumo, o botão `Ver mais` reduzido e a ausência do container `reference-presenter` no hero. O contato `Ficou alguma dúvida? Solicite contato pelo WhatsApp.` passou a aparecer como link discreto no footer e permaneceu funcional.

## Nova inspeção de posicionamento

Na abertura de `https://ocodigolucrativo.site/?afiliado=membro-validado` às 11:19, o navegador carregou a página sem renderizar o bloco afiliado, embora o mesmo perfil tenha sido exibido corretamente nas validações anteriores. O conteúdo público exibido não continha `Ver mais`, a foto ou a identificação do apresentador. Essa inconsistência foi registrada como possível carregamento/transient do perfil e deve ser verificada antes de uma nova alteração visual.

## Perfil real identificado

A consulta ao banco confirmou que o perfil do usuário é `marcelo`, com nome `Marcelo R. Souza`, foto `/manus-storage/member-profiles/2/profile_c2c17bdd.png` e WhatsApp cadastrado. A inspeção correta em `?afiliado=marcelo` mostrou o conjunto foto + identificação do apresentador no strip imediatamente abaixo da navegação e acima do hero. O slug `membro-validado` usado em validações anteriores era apenas um perfil de demonstração e não existe mais no banco.

## Reposicionamento publicado

O release `20260819-1130-profile-hero-position` moveu o conjunto foto + identificação para dentro da área principal de apresentação do hero, antes do título da oferta. O antigo strip separado acima do hero deixou de existir. A foto de Marcelo R. Souza e a identificação do apresentador agora pertencem visualmente ao conteúdo do apresentador, com nome, redes e `Ver mais` na mesma hierarquia.

Na validação de `?afiliado=marcelo`, o resumo apareceu no novo local e o modal abriu corretamente. O modal foi mantido fora do container animado para continuar preso à viewport; seus detalhes, WhatsApp e fechamento permanecem funcionando. A suíte do candidato passou após atualizar o teste legado de cabeçalho para a nova arquitetura: 44 arquivos e 113 testes, além de TypeScript e build aprovados.
