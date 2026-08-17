CREATE TABLE IF NOT EXISTS `referralLinks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sponsorId` INT NOT NULL,
  `referredUserId` INT NOT NULL,
  `status` ENUM('active', 'archived') NOT NULL DEFAULT 'active',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `referral_links_referred_unique` (`referredUserId`),
  KEY `referral_links_sponsor_idx` (`sponsorId`),
  KEY `referral_links_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
