ALTER TABLE memberProfiles
  ADD COLUMN IF NOT EXISTS instagramUrl VARCHAR(512) NULL AFTER facebookUrl;
