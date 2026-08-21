# Fluxo de adesão, pagamento e acompanhamento

Atualização: 2026-08-21  
Branch: `fluxo-adesao-pagamento-personalizacao`

## Jornada pública

1. O visitante preenche nome, e-mail e WhatsApp na página pública.
2. `applications.submit` cria o pedido com `trackingCode`.
3. O comprador é direcionado para `/pedido/:trackingCode/pagamento`.
4. A tela de pagamento mostra o código como código de acompanhamento, valor, PIX habilitado, links de checkout habilitados e upload de comprovante.
5. Após upload, `applications.uploadReceipt` salva o arquivo via `storagePut`, registra o comprovante, muda `paymentStatus` para `receipt_received` e cria notificação para o patrocinador.
6. O comprador acompanha em `/pedido/acompanhar` usando `trackingCode + e-mail`.

## Acompanhamento público

`applications.lookup` retorna apenas dados públicos necessários:

- `trackingCode`;
- datas;
- valor;
- `status`;
- `paymentStatus`;
- `activationStatus`;
- último status de comprovante;
- próxima ação;
- acesso especial somente quando o pagamento estiver aprovado.

Código correto com e-mail incorreto retorna `null`.

## Patrocinador

O patrocinador acessa `/membros/meus-pedidos`, abre o pedido, vê comprovantes e pode aprovar ou rejeitar.

Ao aprovar:

- o comprovante vira `approved`;
- o pedido vira `approved`;
- `paymentStatus` vira `confirmed`;
- `activationStatus` vira `access_issued`;
- o backend cria credencial especial individual por pedido, de forma idempotente.

Ao rejeitar:

- o comprovante vira `rejected`;
- `paymentStatus` vira `rejected`;
- nenhuma credencial especial é liberada.

## Tabelas utilizadas

- `applications`
- `applicationPaymentReceipts`
- `memberNotifications`
- `applicationAccessTokens`
- `receivingPreferences`
- `memberPaymentLinks`

## Rotas principais

- `/pedido/:trackingCode/pagamento`
- `/pedido/confirmacao?codigo=...` mantém compatibilidade e renderiza pagamento.
- `/pedido/acompanhar`
- `/senha-especial/:code`
- `/membros/meus-pedidos`

## Segurança

`trackingCode` identifica o pedido, mas não autentica personalização.

A senha especial é individual por pedido. O banco mantém hash para validação e uma versão criptografada para recuperação na página pública de acompanhamento após aprovação. Senhas e tokens reais não devem ser documentados.
