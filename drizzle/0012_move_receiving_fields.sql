ALTER TABLE receivingPreferences
  ADD COLUMN paypalEmail VARCHAR(320) NULL,
  ADD COLUMN paypalEnabled INT NOT NULL DEFAULT 0,
  ADD COLUMN pagseguroEmail VARCHAR(320) NULL,
  ADD COLUMN pagseguroEnabled INT NOT NULL DEFAULT 0,
  ADD COLUMN bank1Name VARCHAR(180) NULL,
  ADD COLUMN bank1Agency VARCHAR(64) NULL,
  ADD COLUMN bank1Account VARCHAR(96) NULL,
  ADD COLUMN bank1Type ENUM('checking', 'savings') NULL,
  ADD COLUMN bank1Holder VARCHAR(180) NULL,
  ADD COLUMN bank2Name VARCHAR(180) NULL,
  ADD COLUMN bank2Agency VARCHAR(64) NULL,
  ADD COLUMN bank2Account VARCHAR(96) NULL,
  ADD COLUMN bank2Type ENUM('checking', 'savings') NULL,
  ADD COLUMN bank2Holder VARCHAR(180) NULL,
  ADD COLUMN pixType VARCHAR(64) NULL,
  ADD COLUMN pixKey VARCHAR(255) NULL;

INSERT INTO receivingPreferences (
  userId, paypalEmail, paypalEnabled, pagseguroEmail, pagseguroEnabled,
  bank1Name, bank1Agency, bank1Account, bank1Type, bank1Holder,
  bank2Name, bank2Agency, bank2Account, bank2Type, bank2Holder,
  pixType, pixKey
)
SELECT
  userId, paypalEmail, paypalEnabled, pagseguroEmail, pagseguroEnabled,
  bank1Name, bank1Agency, bank1Account, bank1Type, bank1Holder,
  bank2Name, bank2Agency, bank2Account, bank2Type, bank2Holder,
  pixType, pixKey
FROM memberAccountDetails
ON DUPLICATE KEY UPDATE
  paypalEmail = VALUES(paypalEmail),
  paypalEnabled = VALUES(paypalEnabled),
  pagseguroEmail = VALUES(pagseguroEmail),
  pagseguroEnabled = VALUES(pagseguroEnabled),
  bank1Name = VALUES(bank1Name),
  bank1Agency = VALUES(bank1Agency),
  bank1Account = VALUES(bank1Account),
  bank1Type = VALUES(bank1Type),
  bank1Holder = VALUES(bank1Holder),
  bank2Name = VALUES(bank2Name),
  bank2Agency = VALUES(bank2Agency),
  bank2Account = VALUES(bank2Account),
  bank2Type = VALUES(bank2Type),
  bank2Holder = VALUES(bank2Holder),
  pixType = VALUES(pixType),
  pixKey = VALUES(pixKey);
