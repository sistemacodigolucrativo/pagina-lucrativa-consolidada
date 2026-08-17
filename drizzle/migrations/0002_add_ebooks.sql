CREATE TABLE IF NOT EXISTS `ebooks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sourceId` VARCHAR(64) NOT NULL,
  `sourceFile` VARCHAR(255) NOT NULL,
  `sourcePath` VARCHAR(1024) NOT NULL,
  `title` VARCHAR(240) NOT NULL,
  `summary` TEXT NULL,
  `htmlContent` LONGTEXT NOT NULL,
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  `createdBy` INT NULL,
  `publishedAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ebooks_source_id_unique` (`sourceId`),
  KEY `ebooks_status_updated_idx` (`status`, `updatedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
