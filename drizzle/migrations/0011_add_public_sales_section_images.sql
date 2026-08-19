CREATE TABLE IF NOT EXISTS `publicSalesSectionImages` (
  `id` int AUTO_INCREMENT NOT NULL,
  `sectionId` varchar(64) NOT NULL,
  `imageUrl` varchar(1024) NOT NULL,
  `storageKey` varchar(1024) NOT NULL,
  `contentType` varchar(32) NOT NULL,
  `status` enum('active','removed') NOT NULL DEFAULT 'active',
  `originalName` varchar(255),
  `createdBy` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `public_sales_section_images_id` PRIMARY KEY(`id`),
  CONSTRAINT `public_sales_section_images_section_uidx` UNIQUE(`sectionId`),
  KEY `public_sales_section_images_updated_idx` (`updatedAt`)
);
