-- Alinha o catálogo legado ao modelo de produtos usado pelo fluxo de cadastro e curadoria.
ALTER TABLE products
  ADD COLUMN category VARCHAR(96) NULL AFTER description;

CREATE INDEX products_status_idx ON products (status);
