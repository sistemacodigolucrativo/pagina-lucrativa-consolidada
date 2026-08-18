# Revisão geral de validação de formulários — 18 de agosto de 2026

## Escopo auditado

Foram revisados os formulários, modais e contratos de entrada da landing pública, do Escritório Virtual e da Administração. A revisão abrangeu e-mail, telefone e WhatsApp, links de campanha e perfil, chave PIX, moeda, duração de curso, pontuação, identificadores numéricos e acompanhamento de solicitações.

| Natureza do dado | Regra canônica | Camadas cobertas |
|---|---|---|
| E-mail | Remove espaços externos, normaliza para minúsculas e exige endereço completo sem espaços internos. | Formulário público, contatos, acompanhamento e API. |
| Telefone / WhatsApp | Mantém somente dígitos, limita a 10–11 dígitos e exibe máscara brasileira no campo. | Landing, perfil, contatos e API. |
| URL | Aceita somente endereços absolutos HTTP ou HTTPS dentro do limite do campo. | Campanhas, perfil e API. |
| Chave PIX | Exige CPF, CNPJ, telefone, e-mail ou chave aleatória válida quando o método selecionado é PIX. | Dados de recebimento e API. |
| Moeda | Sanitiza a entrada em reais, limita a duas casas decimais e converte para centavos inteiros. | Produtos, lançamentos e API. |
| Inteiro / pontuação | Remove caracteres indevidos no campo, respeita sinal somente onde permitido e mantém limites de negócio. | Cursos, pontos e API. |

## Garantias de implementação

A aplicação usa componentes e validadores compartilhados para evitar regras divergentes entre telas. Os contratos tRPC repetem as regras de negócio para impedir que chamadas diretas à API armazenem valores incompatíveis. Os campos textuais editoriais e instruções livres preservam seus limites de tamanho, mas não foram indevidamente tratados como campos numéricos ou identificadores.

## Cobertura de regressão

Os testes unitários validam normalização, limites e rejeições de contrato. A suíte Playwright publicada cobre máscara de WhatsApp, estrutura de e-mail, moeda, chave PIX, autenticação, navegação e responsividade dos fluxos principais.
