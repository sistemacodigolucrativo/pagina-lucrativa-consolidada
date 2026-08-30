CREATE TABLE `affiliateLinkClickEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`visitorId` varchar(64) NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`referrerOrigin` varchar(255),
	`userAgentCategory` varchar(48),
	`deviceType` varchar(32),
	`utmSource` varchar(96),
	`utmMedium` varchar(96),
	`utmCampaign` varchar(160),
	`utmContent` varchar(160),
	`landingPath` varchar(512),
	CONSTRAINT `affiliateLinkClickEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `applicationAccessTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`ownerUserId` int NOT NULL,
	`publicCode` varchar(48) NOT NULL,
	`tokenHash` varchar(255) NOT NULL,
	`encryptedToken` varchar(512),
	`status` enum('active','revoked','used') NOT NULL DEFAULT 'active',
	`accessCount` int NOT NULL DEFAULT 0,
	`lastAccessAt` timestamp,
	`expiresAt` timestamp,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int NOT NULL,
	CONSTRAINT `applicationAccessTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `application_access_tokens_code_unique` UNIQUE(`publicCode`)
);
--> statement-breakpoint
CREATE TABLE `applicationPaymentReceipts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`ownerUserId` int NOT NULL,
	`storageKey` varchar(1024) NOT NULL,
	`fileUrl` varchar(1024) NOT NULL,
	`contentType` varchar(80) NOT NULL,
	`originalName` varchar(255),
	`fileSize` int NOT NULL DEFAULT 0,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	`reviewedBy` int,
	CONSTRAINT `applicationPaymentReceipts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaignAttributions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`userId` int NOT NULL,
	`visitorId` varchar(64) NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`firstOccurredAt` timestamp NOT NULL DEFAULT (now()),
	`lastOccurredAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`source` varchar(96),
	`medium` varchar(96),
	`campaignName` varchar(160),
	`content` varchar(160),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaignAttributions_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaign_attributions_user_visitor_session_unique` UNIQUE(`userId`,`visitorId`,`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `campaignClickEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`userId` int NOT NULL,
	`visitorId` varchar(64) NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`referrerOrigin` varchar(255),
	`userAgentCategory` varchar(48),
	`deviceType` varchar(32),
	`utmSource` varchar(96),
	`utmMedium` varchar(96),
	`utmCampaign` varchar(160),
	`utmContent` varchar(160),
	`landingPath` varchar(512),
	CONSTRAINT `campaignClickEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaignConversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`userId` int NOT NULL,
	`attributionId` int,
	`visitorId` varchar(64),
	`sessionId` varchar(64),
	`conversionType` enum('lead','application','order','sale','commission') NOT NULL,
	`status` enum('active','reversed') NOT NULL DEFAULT 'active',
	`entityType` varchar(48) NOT NULL,
	`entityId` int,
	`valueCents` int NOT NULL DEFAULT 0,
	`captureMode` enum('automatic','manual') NOT NULL DEFAULT 'automatic',
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaignConversions_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaign_conversions_entity_unique` UNIQUE(`entityType`,`entityId`,`conversionType`)
);
--> statement-breakpoint
CREATE TABLE `ebooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` varchar(64) NOT NULL,
	`sourceFile` varchar(255) NOT NULL,
	`sourcePath` varchar(1024) NOT NULL,
	`title` varchar(240) NOT NULL,
	`summary` text,
	`htmlContent` longtext NOT NULL,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`createdBy` int,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ebooks_id` PRIMARY KEY(`id`),
	CONSTRAINT `ebooks_sourceId_unique` UNIQUE(`sourceId`)
);
--> statement-breakpoint
CREATE TABLE `managedContent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kind` enum('material','article','faq','notice') NOT NULL,
	`title` varchar(240) NOT NULL,
	`summary` text,
	`body` text,
	`resourceUrl` varchar(2048),
	`resourceCategory` varchar(96),
	`resourceType` varchar(96),
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `managedContent_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memberAccountDetails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`paypalEmail` varchar(320),
	`paypalEnabled` int NOT NULL DEFAULT 0,
	`pagseguroEmail` varchar(320),
	`pagseguroEnabled` int NOT NULL DEFAULT 0,
	`bank1Name` varchar(180),
	`bank1Agency` varchar(64),
	`bank1Account` varchar(96),
	`bank1Type` enum('checking','savings'),
	`bank1Holder` varchar(180),
	`bank2Name` varchar(180),
	`bank2Agency` varchar(64),
	`bank2Account` varchar(96),
	`bank2Type` enum('checking','savings'),
	`bank2Holder` varchar(180),
	`pixType` varchar(64),
	`pixKey` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memberAccountDetails_id` PRIMARY KEY(`id`),
	CONSTRAINT `member_account_details_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `memberActivities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('contact_created','contact_updated','invitation_prepared','invitation_cancelled','admin_contact_update') NOT NULL,
	`entityType` varchar(48) NOT NULL,
	`entityId` int,
	`description` varchar(320) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `memberActivities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memberContacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`campaignId` int,
	`name` varchar(180) NOT NULL,
	`email` varchar(320) NOT NULL,
	`whatsapp` varchar(32),
	`source` varchar(160) NOT NULL,
	`consentAt` timestamp NOT NULL DEFAULT (now()),
	`consentNote` text,
	`captureType` enum('manual','campaign','organic') NOT NULL DEFAULT 'manual',
	`status` enum('new','contacted','qualified','archived') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memberContacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memberInvitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contactId` int,
	`channel` enum('link','email','whatsapp') NOT NULL DEFAULT 'link',
	`message` text,
	`status` enum('prepared','cancelled') NOT NULL DEFAULT 'prepared',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `memberInvitations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memberNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(80) NOT NULL,
	`title` varchar(180) NOT NULL,
	`message` text NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` int NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `memberNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memberPaymentLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`label` varchar(120) NOT NULL,
	`paymentUrl` varchar(1024) NOT NULL,
	`isEnabled` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memberPaymentLinks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memberTestimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`rating` int,
	`authorConfirmed` int NOT NULL DEFAULT 0,
	`status` enum('pending','approved','rejected','archived') NOT NULL DEFAULT 'pending',
	`adminNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memberTestimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pointEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`reason` varchar(320) NOT NULL,
	`status` enum('pending','posted','void') NOT NULL DEFAULT 'posted',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pointEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publicSalesSectionImages` (
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
	CONSTRAINT `publicSalesSectionImages_id` PRIMARY KEY(`id`),
	CONSTRAINT `public_sales_section_images_section_uidx` UNIQUE(`sectionId`)
);
--> statement-breakpoint
CREATE TABLE `receivingPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`holderName` varchar(180),
	`method` enum('pix','bank_transfer','other') NOT NULL DEFAULT 'pix',
	`receivingKey` varchar(255),
	`instructions` text,
	`paypalEmail` varchar(320),
	`paypalEnabled` int NOT NULL DEFAULT 0,
	`pagseguroEmail` varchar(320),
	`pagseguroEnabled` int NOT NULL DEFAULT 0,
	`bank1Name` varchar(180),
	`bank1Agency` varchar(64),
	`bank1Account` varchar(96),
	`bank1Type` enum('checking','savings'),
	`bank1Holder` varchar(180),
	`bank2Name` varchar(180),
	`bank2Agency` varchar(64),
	`bank2Account` varchar(96),
	`bank2Type` enum('checking','savings'),
	`bank2Holder` varchar(180),
	`bank3Name` varchar(180),
	`bank3Agency` varchar(64),
	`bank3Account` varchar(96),
	`bank3Type` enum('checking','savings'),
	`bank3Holder` varchar(180),
	`bank4Name` varchar(180),
	`bank4Agency` varchar(64),
	`bank4Account` varchar(96),
	`bank4Type` enum('checking','savings'),
	`bank4Holder` varchar(180),
	`pixType` varchar(64),
	`pixKey` varchar(255),
	`responsibleUseModalSeenAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `receivingPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `receiving_preferences_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `referralLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sponsorId` int NOT NULL,
	`referredUserId` int NOT NULL,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referralLinks_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_links_referred_unique` UNIQUE(`referredUserId`)
);
--> statement-breakpoint
CREATE TABLE `supportTickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(180) NOT NULL,
	`message` text NOT NULL,
	`status` enum('open','answered','closed') NOT NULL DEFAULT 'open',
	`adminResponse` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supportTickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userSecurityRecovery` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`securityQuestion` varchar(240) NOT NULL,
	`securityAnswerHash` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSecurityRecovery_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_security_recovery_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `campaignLinks` DROP INDEX `campaign_links_slug_unique`;--> statement-breakpoint
DROP INDEX `campaign_links_user_idx` ON `campaignLinks`;--> statement-breakpoint
ALTER TABLE `applications` ADD `trackingCode` varchar(24);--> statement-breakpoint
ALTER TABLE `applications` ADD `ownerUserId` int;--> statement-breakpoint
ALTER TABLE `applications` ADD `affiliateSlug` varchar(96);--> statement-breakpoint
ALTER TABLE `applications` ADD `paymentStatus` enum('not_started','awaiting_payment','receipt_received','confirmed','rejected') DEFAULT 'awaiting_payment' NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `activationStatus` enum('not_started','access_issued','personalization_started','member_activated','cancelled') DEFAULT 'not_started' NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `offerAmountCents` int DEFAULT 5000 NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `selectedPaymentMethod` varchar(120);--> statement-breakpoint
ALTER TABLE `applications` ADD `adminNote` text;--> statement-breakpoint
ALTER TABLE `applications` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `campaignLinks` ADD `source` varchar(96);--> statement-breakpoint
ALTER TABLE `campaignLinks` ADD `medium` varchar(96);--> statement-breakpoint
ALTER TABLE `campaignLinks` ADD `content` varchar(160);--> statement-breakpoint
ALTER TABLE `campaignLinks` ADD `status` enum('active','paused','archived') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `campaignLinks` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `campaignLinks` ADD `archivedAt` timestamp;--> statement-breakpoint
ALTER TABLE `courses` ADD `routeKey` varchar(160) NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `ebookId` int;--> statement-breakpoint
ALTER TABLE `memberProfiles` ADD `facebookUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `memberProfiles` ADD `instagramUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `memberProfiles` ADD `twitterUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `memberProfiles` ADD `linkedinUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `memberProfiles` ADD `youtubeUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `memberProfiles` ADD `skype` varchar(255);--> statement-breakpoint
ALTER TABLE `memberProfiles` ADD `address` varchar(255);--> statement-breakpoint
ALTER TABLE `memberProfiles` ADD `addressNumber` varchar(32);--> statement-breakpoint
ALTER TABLE `memberProfiles` ADD `addressComplement` varchar(160);--> statement-breakpoint
ALTER TABLE `memberProfiles` ADD `postalCode` varchar(20);--> statement-breakpoint
ALTER TABLE `memberProfiles` ADD `district` varchar(120);--> statement-breakpoint
ALTER TABLE `memberProfiles` ADD `city` varchar(120);--> statement-breakpoint
ALTER TABLE `memberProfiles` ADD `state` varchar(80);--> statement-breakpoint
ALTER TABLE `memberProfiles` ADD `metricsViewedAt` timestamp;--> statement-breakpoint
ALTER TABLE `transactions` ADD `createdBy` int;--> statement-breakpoint
ALTER TABLE `transactions` ADD `campaignId` int;--> statement-breakpoint
ALTER TABLE `transactions` ADD `status` enum('pending','posted','void') DEFAULT 'posted' NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `adminNote` text;--> statement-breakpoint
ALTER TABLE `transactions` ADD `createdAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `campaignLinks` ADD CONSTRAINT `campaign_links_user_slug_unique` UNIQUE(`userId`,`slug`);--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_route_key_unique` UNIQUE(`routeKey`);--> statement-breakpoint
CREATE INDEX `affiliate_link_click_events_user_date_idx` ON `affiliateLinkClickEvents` (`userId`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `affiliate_link_click_events_visitor_idx` ON `affiliateLinkClickEvents` (`visitorId`);--> statement-breakpoint
CREATE INDEX `affiliate_link_click_events_session_idx` ON `affiliateLinkClickEvents` (`sessionId`);--> statement-breakpoint
CREATE INDEX `application_access_tokens_application_status_idx` ON `applicationAccessTokens` (`applicationId`,`status`);--> statement-breakpoint
CREATE INDEX `application_access_tokens_owner_status_idx` ON `applicationAccessTokens` (`ownerUserId`,`status`);--> statement-breakpoint
CREATE INDEX `application_payment_receipts_application_date_idx` ON `applicationPaymentReceipts` (`applicationId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `application_payment_receipts_owner_status_idx` ON `applicationPaymentReceipts` (`ownerUserId`,`status`);--> statement-breakpoint
CREATE INDEX `campaign_attributions_campaign_date_idx` ON `campaignAttributions` (`campaignId`,`lastOccurredAt`);--> statement-breakpoint
CREATE INDEX `campaign_attributions_user_date_idx` ON `campaignAttributions` (`userId`,`lastOccurredAt`);--> statement-breakpoint
CREATE INDEX `campaign_click_events_campaign_date_idx` ON `campaignClickEvents` (`campaignId`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `campaign_click_events_user_date_idx` ON `campaignClickEvents` (`userId`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `campaign_click_events_visitor_idx` ON `campaignClickEvents` (`visitorId`);--> statement-breakpoint
CREATE INDEX `campaign_click_events_session_idx` ON `campaignClickEvents` (`sessionId`);--> statement-breakpoint
CREATE INDEX `campaign_conversions_campaign_date_idx` ON `campaignConversions` (`campaignId`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `campaign_conversions_user_date_idx` ON `campaignConversions` (`userId`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `ebooks_status_updated_idx` ON `ebooks` (`status`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `managed_content_status_kind_idx` ON `managedContent` (`status`,`kind`);--> statement-breakpoint
CREATE INDEX `member_activities_user_date_idx` ON `memberActivities` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `member_contacts_user_status_idx` ON `memberContacts` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `member_contacts_campaign_idx` ON `memberContacts` (`campaignId`);--> statement-breakpoint
CREATE INDEX `member_invitations_user_date_idx` ON `memberInvitations` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `member_invitations_contact_idx` ON `memberInvitations` (`contactId`);--> statement-breakpoint
CREATE INDEX `member_notifications_user_read_date_idx` ON `memberNotifications` (`userId`,`readAt`,`createdAt`);--> statement-breakpoint
CREATE INDEX `member_notifications_entity_idx` ON `memberNotifications` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `member_payment_links_user_sort_idx` ON `memberPaymentLinks` (`userId`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `member_payment_links_enabled_idx` ON `memberPaymentLinks` (`userId`,`isEnabled`);--> statement-breakpoint
CREATE INDEX `member_testimonials_user_updated_idx` ON `memberTestimonials` (`userId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `member_testimonials_status_updated_idx` ON `memberTestimonials` (`status`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `point_entries_user_idx` ON `pointEntries` (`userId`);--> statement-breakpoint
CREATE INDEX `point_entries_status_idx` ON `pointEntries` (`status`);--> statement-breakpoint
CREATE INDEX `public_sales_section_images_updated_idx` ON `publicSalesSectionImages` (`updatedAt`);--> statement-breakpoint
CREATE INDEX `referral_links_sponsor_idx` ON `referralLinks` (`sponsorId`);--> statement-breakpoint
CREATE INDEX `referral_links_status_idx` ON `referralLinks` (`status`);--> statement-breakpoint
CREATE INDEX `support_tickets_user_updated_idx` ON `supportTickets` (`userId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `support_tickets_status_updated_idx` ON `supportTickets` (`status`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `applications_owner_date_idx` ON `applications` (`ownerUserId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `applications_affiliate_slug_idx` ON `applications` (`affiliateSlug`);--> statement-breakpoint
CREATE INDEX `campaign_links_user_created_idx` ON `campaignLinks` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `campaign_links_user_status_idx` ON `campaignLinks` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `courses_ebook_idx` ON `courses` (`ebookId`);--> statement-breakpoint
CREATE INDEX `transactions_campaign_idx` ON `transactions` (`campaignId`);