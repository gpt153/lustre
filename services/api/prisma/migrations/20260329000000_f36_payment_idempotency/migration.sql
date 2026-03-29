-- F36: Payment Security — Idempotency Keys
-- Adds externalReference to TokenTransaction for idempotent webhook processing.
-- Adds unique constraint on (type, external_reference) to prevent duplicate credits.
-- Adds unique constraint on segpay_tx_id to prevent duplicate SegpayTransaction rows.

ALTER TABLE "token_transactions"
  ADD COLUMN IF NOT EXISTS "external_reference" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "token_transactions_type_external_reference_key"
  ON "token_transactions"("type", "external_reference")
  WHERE "external_reference" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "segpay_transactions_segpay_tx_id_key"
  ON "segpay_transactions"("segpay_tx_id")
  WHERE "segpay_tx_id" IS NOT NULL;
