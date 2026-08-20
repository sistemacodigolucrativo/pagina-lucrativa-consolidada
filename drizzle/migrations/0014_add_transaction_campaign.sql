-- Optional campaign attribution for existing financial transactions. No amount/status data is changed.
ALTER TABLE `transactions`
  ADD COLUMN `campaignId` int NULL,
  ADD KEY `transactions_campaign_idx` (`campaignId`);
