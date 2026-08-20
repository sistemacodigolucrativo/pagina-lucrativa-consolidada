-- Campaign analytics foundation. This migration is additive and preserves legacy counters and links.
ALTER TABLE `campaignLinks`
  ADD `source` varchar(96),
  ADD `medium` varchar(96),
  ADD `content` varchar(160),
  ADD `status` enum('active','paused','archived') NOT NULL DEFAULT 'active',
  ADD `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD `archivedAt` timestamp NULL,
  ADD UNIQUE KEY `campaign_links_user_slug_unique` (`userId`, `slug`),
  ADD KEY `campaign_links_user_status_idx` (`userId`, `status`);

CREATE TABLE IF NOT EXISTS `campaignClickEvents` (
  `id` int AUTO_INCREMENT NOT NULL,
  `campaignId` int NOT NULL,
  `userId` int NOT NULL,
  `visitorId` varchar(64) NOT NULL,
  `sessionId` varchar(64) NOT NULL,
  `occurredAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `referrerOrigin` varchar(255),
  `userAgentCategory` varchar(48),
  `deviceType` varchar(32),
  `utmSource` varchar(96),
  `utmMedium` varchar(96),
  `utmCampaign` varchar(160),
  `utmContent` varchar(160),
  `landingPath` varchar(512),
  PRIMARY KEY (`id`),
  KEY `campaign_click_events_campaign_date_idx` (`campaignId`, `occurredAt`),
  KEY `campaign_click_events_user_date_idx` (`userId`, `occurredAt`),
  KEY `campaign_click_events_visitor_idx` (`visitorId`),
  KEY `campaign_click_events_session_idx` (`sessionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `campaignAttributions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `campaignId` int NOT NULL,
  `userId` int NOT NULL,
  `visitorId` varchar(64) NOT NULL,
  `sessionId` varchar(64) NOT NULL,
  `firstOccurredAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastOccurredAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiresAt` timestamp NOT NULL,
  `source` varchar(96),
  `medium` varchar(96),
  `campaignName` varchar(160),
  `content` varchar(160),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `campaign_attributions_campaign_date_idx` (`campaignId`, `lastOccurredAt`),
  KEY `campaign_attributions_user_date_idx` (`userId`, `lastOccurredAt`),
  UNIQUE KEY `campaign_attributions_user_visitor_session_unique` (`userId`, `visitorId`, `sessionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `memberContacts`
  ADD `captureType` enum('manual','campaign','organic') NOT NULL DEFAULT 'manual';
