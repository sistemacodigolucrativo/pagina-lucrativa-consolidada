-- Permite recuperar a credencial especial aprovada sem armazenar senha pura.
ALTER TABLE `applicationAccessTokens`
  ADD COLUMN `encryptedToken` varchar(512) NULL AFTER `tokenHash`;
