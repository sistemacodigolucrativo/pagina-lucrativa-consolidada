ALTER TABLE users
  ADD COLUMN passwordHash VARCHAR(255) NULL AFTER email;

CREATE TABLE memberAccountDetails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  paypalEmail VARCHAR(320) NULL,
  paypalEnabled INT NOT NULL DEFAULT 0,
  pagseguroEmail VARCHAR(320) NULL,
  pagseguroEnabled INT NOT NULL DEFAULT 0,
  bank1Name VARCHAR(180) NULL,
  bank1Agency VARCHAR(64) NULL,
  bank1Account VARCHAR(96) NULL,
  bank1Type ENUM('checking', 'savings') NULL,
  bank1Holder VARCHAR(180) NULL,
  bank2Name VARCHAR(180) NULL,
  bank2Agency VARCHAR(64) NULL,
  bank2Account VARCHAR(96) NULL,
  bank2Type ENUM('checking', 'savings') NULL,
  bank2Holder VARCHAR(180) NULL,
  pixType VARCHAR(64) NULL,
  pixKey VARCHAR(255) NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY member_account_details_user_unique (userId)
);
