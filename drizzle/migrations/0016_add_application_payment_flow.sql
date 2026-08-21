-- Fluxo de adesão, pagamento manual, notificações e senha especial por pedido.
-- Migration aditiva: preserva pedidos e dados existentes.

ALTER TABLE `applications`
  ADD COLUMN `paymentStatus` enum('not_started','awaiting_payment','receipt_received','confirmed','rejected') NOT NULL DEFAULT 'awaiting_payment' AFTER `status`,
  ADD COLUMN `activationStatus` enum('not_started','access_issued','personalization_started','member_activated','cancelled') NOT NULL DEFAULT 'not_started' AFTER `paymentStatus`,
  ADD COLUMN `offerAmountCents` int NOT NULL DEFAULT 5000 AFTER `activationStatus`,
  ADD COLUMN `selectedPaymentMethod` varchar(120) NULL AFTER `offerAmountCents`,
  ADD KEY `applications_payment_status_idx` (`paymentStatus`),
  ADD KEY `applications_activation_status_idx` (`activationStatus`);

CREATE TABLE IF NOT EXISTS `memberPaymentLinks` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `label` varchar(120) NOT NULL,
  `paymentUrl` varchar(1024) NOT NULL,
  `isEnabled` int NOT NULL DEFAULT 1,
  `sortOrder` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `member_payment_links_user_sort_idx` (`userId`, `sortOrder`),
  KEY `member_payment_links_enabled_idx` (`userId`, `isEnabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `applicationPaymentReceipts` (
  `id` int AUTO_INCREMENT NOT NULL,
  `applicationId` int NOT NULL,
  `ownerUserId` int NOT NULL,
  `storageKey` varchar(1024) NOT NULL,
  `fileUrl` varchar(1024) NOT NULL,
  `contentType` varchar(80) NOT NULL,
  `originalName` varchar(255),
  `fileSize` int NOT NULL DEFAULT 0,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewedAt` timestamp NULL,
  `reviewedBy` int NULL,
  PRIMARY KEY (`id`),
  KEY `application_payment_receipts_application_date_idx` (`applicationId`, `createdAt`),
  KEY `application_payment_receipts_owner_status_idx` (`ownerUserId`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `memberNotifications` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `type` varchar(80) NOT NULL,
  `title` varchar(180) NOT NULL,
  `message` text NOT NULL,
  `entityType` varchar(80) NOT NULL,
  `entityId` int NOT NULL,
  `readAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `member_notifications_user_read_date_idx` (`userId`, `readAt`, `createdAt`),
  KEY `member_notifications_entity_idx` (`entityType`, `entityId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `applicationAccessTokens` (
  `id` int AUTO_INCREMENT NOT NULL,
  `applicationId` int NOT NULL,
  `ownerUserId` int NOT NULL,
  `publicCode` varchar(48) NOT NULL,
  `tokenHash` varchar(255) NOT NULL,
  `status` enum('active','revoked','used') NOT NULL DEFAULT 'active',
  `accessCount` int NOT NULL DEFAULT 0,
  `lastAccessAt` timestamp NULL,
  `expiresAt` timestamp NULL,
  `usedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `application_access_tokens_code_unique` (`publicCode`),
  KEY `application_access_tokens_application_status_idx` (`applicationId`, `status`),
  KEY `application_access_tokens_owner_status_idx` (`ownerUserId`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
