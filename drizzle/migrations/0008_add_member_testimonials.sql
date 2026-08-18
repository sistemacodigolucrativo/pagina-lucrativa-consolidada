CREATE TABLE IF NOT EXISTS `memberTestimonials` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `content` text NOT NULL,
  `authorConfirmed` int NOT NULL DEFAULT 0,
  `status` enum('pending','approved','rejected','archived') NOT NULL DEFAULT 'pending',
  `adminNote` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `memberTestimonials_id` PRIMARY KEY(`id`),
  KEY `member_testimonials_user_updated_idx` (`userId`,`updatedAt`),
  KEY `member_testimonials_status_updated_idx` (`status`,`updatedAt`)
);
