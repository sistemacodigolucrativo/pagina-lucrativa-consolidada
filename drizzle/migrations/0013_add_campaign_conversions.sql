-- Campaign conversions. This migration adds attribution records without changing financial tables.
CREATE TABLE IF NOT EXISTS `campaignConversions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `campaignId` int NOT NULL,
  `userId` int NOT NULL,
  `attributionId` int,
  `visitorId` varchar(64),
  `sessionId` varchar(64),
  `conversionType` enum('lead','application','order','sale','commission') NOT NULL,
  `entityType` varchar(48) NOT NULL,
  `entityId` int,
  `valueCents` int NOT NULL DEFAULT 0,
  `captureMode` enum('automatic','manual') NOT NULL DEFAULT 'automatic',
  `occurredAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `campaign_conversions_campaign_date_idx` (`campaignId`, `occurredAt`),
  KEY `campaign_conversions_user_date_idx` (`userId`, `occurredAt`),
  UNIQUE KEY `campaign_conversions_entity_unique` (`entityType`, `entityId`, `conversionType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
