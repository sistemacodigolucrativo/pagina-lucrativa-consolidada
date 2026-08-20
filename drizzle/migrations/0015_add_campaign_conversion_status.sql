-- Conversion status allows a posted financial transaction to be reversed without deleting attribution history.
ALTER TABLE `campaignConversions`
  ADD COLUMN `status` enum('active','reversed') NOT NULL DEFAULT 'active',
  ADD KEY `campaign_conversions_status_idx` (`status`);
