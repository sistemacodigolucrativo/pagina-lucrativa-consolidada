-- Fluxo de lançamentos: o membro registra vendas ou solicita saques; a administração registra, aprova ou invalida cada movimento.
ALTER TABLE transactions
  ADD COLUMN createdBy INT NULL AFTER userId,
  ADD COLUMN status ENUM('pending', 'posted', 'void') NOT NULL DEFAULT 'posted' AFTER amountCents,
  ADD COLUMN adminNote TEXT NULL AFTER status,
  ADD COLUMN createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER occurredAt,
  ADD COLUMN updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER createdAt;

CREATE INDEX transactions_status_idx ON transactions (status, occurredAt);
