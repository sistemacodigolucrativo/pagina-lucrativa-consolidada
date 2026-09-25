-- Sanitized public-content seed extracted from VPS dump.
-- Includes only public templates/settings/copy. Excludes member controls, test rows, users, tokens, payments, events and progress.
-- Safe to review before applying. Ids and createdBy are intentionally omitted/sanitized.

INSERT INTO `managedContent`
  (`kind`,`title`,`summary`,`body`,`resourceUrl`,`resourceCategory`,`resourceType`,`status`,`createdBy`)
VALUES
  ('notice','Cadastro','{{nome}} acabou de se cadastrar','{"disclaimer": "Demonstração ilustrativa — não representa uma atividade real."}',NULL,'Toast','social-proof-template','published',NULL),
  ('notice','Aquisição','{{nome}} acabou de adquirir o programa','{"disclaimer": "Demonstração ilustrativa — não representa uma atividade real."}',NULL,'Toast','social-proof-template','published',NULL),
  ('notice','Entrada no grupo','{{nome}} entrou para o grupo','{"disclaimer": "Demonstração ilustrativa — não representa uma atividade real."}',NULL,'Toast','social-proof-template','published',NULL),
  ('notice','Visualização','{{nome}} está visualizando agora','{"disclaimer": "Demonstração ilustrativa — não representa uma atividade real."}',NULL,'Toast','social-proof-template','published',NULL),
  ('notice','Início','{{nome}} acabou de iniciar o programa','{"disclaimer": "Demonstração ilustrativa — não representa uma atividade real."}',NULL,'Toast','social-proof-template','published',NULL),
  ('notice','Vaga garantida','{{nome}} acabou de garantir sua vaga','{"disclaimer": "Demonstração ilustrativa — não representa uma atividade real."}',NULL,'Toast','social-proof-template','published',NULL),
  ('notice','Configuração do Toast','Configuração global do sistema de Toast.','{"enabled":true,"showSimulationNotice":true,"headerMessage":"Atividade ilustrativa","footerMessage":"Demonstração ilustrativa — não representa uma atividade real.","headerColor":"#FACC15","nameColor":"#38BDF8","messageColor":"#FFFFFF","footerColor":"#F9A8D4","initialDelaySeconds":12,"intervalMinSeconds":22,"intervalMaxSeconds":60,"visibleSeconds":5}',NULL,'Toast','social-proof-settings','published',NULL),
  ('notice','Posição dos elementos flutuantes da página pública',NULL,'{"desktop":{"fab":{"x":87.5,"y":94.9375},"cta":{"x":89.16666666666667,"y":77.55376344086021},"toast":{"x":50,"y":12}},"tablet":{"fab":{"x":92,"y":88},"cta":{"x":82,"y":78},"toast":{"x":50,"y":12}},"mobile":{"fab":{"x":88,"y":86},"cta":{"x":72,"y":76},"toast":{"x":50,"y":14}}}',NULL,'public-sales-layout','floating','published',NULL),
  ('notice','Copy: Hero',NULL,'{"kicker":"Para quem quer entrar no digital com método pronto","title":"Receba o Método Código Lucrativo pronto para começar — com estrutura consolidada para ativar e operar.","description":"Tenha acesso ao Método Código Lucrativo com Escritório Virtual, ferramentas de divulgação, materiais e recursos organizados para aprender, ativar e acompanhar sua operação em um único ambiente.","trust":"Você recebe uma estrutura pronta, entende o método, ativa sua operação e acompanha tudo em um só lugar."}',NULL,'public-sales-copy','hero','published',NULL)
ON DUPLICATE KEY UPDATE
  `summary`=VALUES(`summary`),
  `body`=VALUES(`body`),
  `resourceUrl`=VALUES(`resourceUrl`),
  `resourceCategory`=VALUES(`resourceCategory`),
  `resourceType`=VALUES(`resourceType`),
  `status`=VALUES(`status`),
  `updatedAt`=CURRENT_TIMESTAMP;
