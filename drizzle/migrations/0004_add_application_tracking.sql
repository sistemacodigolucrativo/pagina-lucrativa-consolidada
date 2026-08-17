-- Permite que o solicitante acompanhe o pedido e que a administração registre o retorno.
ALTER TABLE applications
  ADD COLUMN trackingCode VARCHAR(24) NULL AFTER whatsapp,
  ADD COLUMN adminNote TEXT NULL AFTER status,
  ADD COLUMN updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER createdAt;

CREATE UNIQUE INDEX applications_tracking_code_unique ON applications (trackingCode);
