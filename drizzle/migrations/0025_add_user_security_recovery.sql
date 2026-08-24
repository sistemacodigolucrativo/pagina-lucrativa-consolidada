CREATE TABLE IF NOT EXISTS `userSecurityRecovery` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `securityQuestion` varchar(240) NOT NULL,
  `securityAnswerHash` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_security_recovery_user_unique` (`userId`)
);
