CREATE TABLE IF NOT EXISTS `affiliateLinkClickEvents` (
  `id` int AUTO_INCREMENT NOT NULL,
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
  KEY `affiliate_link_click_events_user_date_idx` (`userId`, `occurredAt`),
  KEY `affiliate_link_click_events_visitor_idx` (`visitorId`),
  KEY `affiliate_link_click_events_session_idx` (`sessionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
