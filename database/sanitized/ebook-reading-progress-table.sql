-- Standalone sanitized table definition found in VPS dump and absent from the current GitHub schema/migrations.
-- Contains structure only; no reading-progress rows are included.

DROP TABLE IF EXISTS `ebookReadingProgress`;
CREATE TABLE `ebookReadingProgress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `ebookId` int(11) NOT NULL,
  `courseId` int(11) DEFAULT NULL,
  `context` enum('library','academy') NOT NULL DEFAULT 'library',
  `progressPercent` int(11) NOT NULL DEFAULT 0,
  `currentPage` int(11) DEFAULT NULL,
  `totalPages` int(11) DEFAULT NULL,
  `lastAccessedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ebook_reading_progress_user_ebook_context_unique` (`userId`,`ebookId`,`context`),
  KEY `ebook_reading_progress_user_access_idx` (`userId`,`lastAccessedAt`),
  KEY `ebook_reading_progress_ebook_idx` (`ebookId`),
  KEY `ebook_reading_progress_course_idx` (`courseId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
