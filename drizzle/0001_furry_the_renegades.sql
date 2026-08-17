CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(180) NOT NULL,
	`email` varchar(320) NOT NULL,
	`whatsapp` varchar(32) NOT NULL,
	`status` enum('pending','contacted','approved','archived') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `applications_status_date_idx` ON `applications` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `applications_email_idx` ON `applications` (`email`);