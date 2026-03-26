-- CreateTable
CREATE TABLE "marketplace_payments" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "swish_payment_id" TEXT NOT NULL,
    "swish_token" TEXT NOT NULL,
    "amount_sek" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payer_alias" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_payments_order_id_key" ON "marketplace_payments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_payments_swish_payment_id_key" ON "marketplace_payments"("swish_payment_id");

-- AddForeignKey
ALTER TABLE "marketplace_payments" ADD CONSTRAINT "marketplace_payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
