CREATE TABLE IF NOT EXISTS `pointEntries` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `amount` INT NOT NULL,
  `reason` VARCHAR(320) NOT NULL,
  `status` ENUM('pending', 'posted', 'void') NOT NULL DEFAULT 'posted',
  `createdBy` INT NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `point_entries_user_idx` (`userId`),
  KEY `point_entries_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
