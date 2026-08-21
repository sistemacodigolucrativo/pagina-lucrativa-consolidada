ALTER TABLE `receivingPreferences`
  ADD COLUMN `bank3Name` varchar(180) NULL,
  ADD COLUMN `bank3Agency` varchar(64) NULL,
  ADD COLUMN `bank3Account` varchar(96) NULL,
  ADD COLUMN `bank3Type` enum('checking', 'savings') NULL,
  ADD COLUMN `bank3Holder` varchar(180) NULL,
  ADD COLUMN `bank4Name` varchar(180) NULL,
  ADD COLUMN `bank4Agency` varchar(64) NULL,
  ADD COLUMN `bank4Account` varchar(96) NULL,
  ADD COLUMN `bank4Type` enum('checking', 'savings') NULL,
  ADD COLUMN `bank4Holder` varchar(180) NULL;
