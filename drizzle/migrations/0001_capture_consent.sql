CREATE TABLE IF NOT EXISTS memberContacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  campaignId INT NULL,
  name VARCHAR(180) NOT NULL,
  email VARCHAR(320) NOT NULL,
  whatsapp VARCHAR(32) NULL,
  source VARCHAR(160) NOT NULL,
  consentAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  consentNote TEXT NULL,
  status ENUM('new','contacted','qualified','archived') NOT NULL DEFAULT 'new',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX member_contacts_user_status_idx (userId, status),
  INDEX member_contacts_campaign_idx (campaignId)
);
CREATE TABLE IF NOT EXISTS memberInvitations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  contactId INT NULL,
  channel ENUM('link','email','whatsapp') NOT NULL DEFAULT 'link',
  message TEXT NULL,
  status ENUM('prepared','cancelled') NOT NULL DEFAULT 'prepared',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX member_invitations_user_date_idx (userId, createdAt),
  INDEX member_invitations_contact_idx (contactId)
);
CREATE TABLE IF NOT EXISTS memberActivities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type ENUM('contact_created','contact_updated','invitation_prepared','invitation_cancelled','admin_contact_update') NOT NULL,
  entityType VARCHAR(48) NOT NULL,
  entityId INT NULL,
  description VARCHAR(320) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX member_activities_user_date_idx (userId, createdAt)
);
