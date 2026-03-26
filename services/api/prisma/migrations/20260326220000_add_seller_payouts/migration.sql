-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateTable
CREATE TABLE "seller_swish_numbers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "swish_number" TEXT NOT NULL,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seller_swish_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_payouts" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "swish_payout_id" TEXT,
    "amount_sek" INTEGER NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "initiated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "seller_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seller_swish_numbers_user_id_key" ON "seller_swish_numbers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "seller_payouts_order_id_key" ON "seller_payouts"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "seller_payouts_swish_payout_id_key" ON "seller_payouts"("swish_payout_id");

-- CreateIndex
CREATE INDEX "seller_payouts_seller_id_idx" ON "seller_payouts"("seller_id");

-- AddForeignKey
ALTER TABLE "seller_swish_numbers" ADD CONSTRAINT "seller_swish_numbers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_payouts" ADD CONSTRAINT "seller_payouts_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_payouts" ADD CONSTRAINT "seller_payouts_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
