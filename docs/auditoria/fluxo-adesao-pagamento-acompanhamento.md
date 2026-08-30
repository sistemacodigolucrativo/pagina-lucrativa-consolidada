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

## Ganhos e extrato

`/membros/ganhos` é um relatório de adesões atribuídas ao patrocinador autenticado.

O relatório é derivado de `applications.ownerUserId` e mostra pedidos, status de pagamento, adesões confirmadas, valor informativo dos pagamentos confirmados e comprovantes aguardando análise.

A área não representa carteira, saldo interno, saque ou custódia de valores. Pagamentos continuam ocorrendo diretamente entre comprador e patrocinador.

O membro não registra venda nem solicita saque nessa tela. Registros antigos de `transactions` permanecem preservados para histórico administrativo e integrações de conversão manual.

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
- `/personalizar?codigo=...`
- `/membros/meus-pedidos`
- `/membros/operacao/*` mantém as rotas técnicas da Central de Divulgação, incluindo campanhas, tráfego, conversões, contatos e histórico.

## Fluxos legados removidos

O sistema global antigo de senha especial foi removido da aplicação ativa. As rotas `/senha-especial/:code`, `/membros/mensagem-especial` e `/admin/mensagem-especial` não fazem mais parte do fluxo.

Os dados públicos iniciais da Código Lucrativo passaram a ser coletados durante `/personalizar?codigo=...`, antes do primeiro login. Com isso, o gate pós-login `/membros/perfil-inicial` foi removido.

## Navegação do membro

A área anteriormente apresentada ao membro como `Minha operação` passou a ser apresentada como `Central de Divulgação`.

As rotas técnicas `/membros/operacao/*` foram preservadas por compatibilidade e estabilidade arquitetural. A seção `/membros/operacao/campanhas` é exibida ao membro como `Campanhas`, sem renomear o domínio técnico interno de campanhas.

## Segurança

`trackingCode` identifica o pedido, mas não autentica personalização.

A senha especial é individual por pedido. O banco mantém hash para validação e uma versão criptografada para recuperação na página pública de acompanhamento após aprovação. Senhas e tokens reais não devem ser documentados.
