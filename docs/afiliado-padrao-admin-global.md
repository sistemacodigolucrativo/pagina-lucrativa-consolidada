# Afiliado padrão do administrador global

## Objetivo

Quando a Home pública é acessada pelo domínio puro, sem parâmetro `afiliado`, o sistema resolve dinamicamente o perfil de membro do administrador global e o usa como referência padrão de indicação.

O navegador não precisa ser redirecionado para `?afiliado=...`.

## Prioridade de atribuição

1. Afiliado explícito válido informado na URL ou no formulário.
2. Administrador global como fallback somente quando não existe afiliado explícito.
3. Sem atribuição quando o administrador global não possui perfil de membro ou quando o afiliado explícito não resolve para um perfil válido.

Um link explícito de outro membro nunca deve ser substituído pelo administrador.

## Resolução dinâmica do administrador

O administrador global é identificado pelo mecanismo canônico do ambiente:

```text
OWNER_OPEN_ID / ENV.ownerOpenId
```

A resolução exige:

```text
users.openId = ENV.ownerOpenId
users.role = "admin"
memberProfiles.userId = users.id
```

Não há `userId`, slug, e-mail ou identificador pessoal hardcoded.

## Home pública

A Home separa dois conceitos:

```text
explicitAffiliateSlug = slug informado em ?afiliado=
effectiveAffiliate = afiliado explícito válido OU perfil padrão do administrador quando não há parâmetro afiliado
```

Quando o visitante acessa `/`, a Home consulta o perfil padrão e pode exibir nome, foto, bio, WhatsApp, site e redes sociais do perfil de membro do administrador.

Quando o visitante acessa `/?afiliado=<slug>`, a Home preserva o afiliado explícito.

## Pedidos

`createApplication()` garante a regra no backend:

```text
affiliateSlug válido e existente -> ownerUserId do afiliado informado
affiliateSlug ausente -> ownerUserId do administrador global, se houver perfil
affiliateSlug explícito inexistente -> sem fallback administrativo
admin sem memberProfile -> sem atribuição automática
```

## Métricas

O tracking do link principal continua usando `affiliateLinkClickEvents`.

No domínio puro `/`, quando há administrador global com perfil de membro, o clique é registrado para o slug desse administrador usando o mesmo fluxo existente de clique de afiliado.

O domínio puro não cria campanha artificial e não define `campaignId`.
