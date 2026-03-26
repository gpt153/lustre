-- AlterTable
ALTER TABLE "user_balances" ALTER COLUMN "balance" SET DEFAULT 0, ALTER COLUMN "balance" TYPE DECIMAL(20,5) USING balance::DECIMAL(20,5);

-- AlterTable
ALTER TABLE "token_transactions"
  ALTER COLUMN "amount" TYPE DECIMAL(20,5) USING amount::DECIMAL(20,5),
  ADD COLUMN "description" TEXT,
  ADD COLUMN "service_ref" TEXT;

-- CreateTable
CREATE TABLE "spread_configs" (
    "id" UUID NOT NULL,
    "segment" TEXT,
    "market" TEXT,
    "multiplier" DECIMAL(10,5) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spread_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "spread_configs_segment_market_key" ON "spread_configs"("segment", "market");
