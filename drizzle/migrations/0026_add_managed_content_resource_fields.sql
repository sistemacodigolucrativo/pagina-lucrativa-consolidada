ALTER TABLE `managedContent`
  ADD COLUMN `resourceUrl` varchar(2048),
  ADD COLUMN `resourceCategory` varchar(96),
  ADD COLUMN `resourceType` varchar(96);
