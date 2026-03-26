-- CreateTable
CREATE TABLE "segpay_cards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "card_token" VARCHAR(500) NOT NULL,
    "last4" VARCHAR(4) NOT NULL,
    "brand" VARCHAR(50) NOT NULL,
    "expiry_month" INTEGER NOT NULL,
    "expiry_year" INTEGER NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "segpay_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "segpay_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "segpay_tx_id" VARCHAR(200),
    "amount_sek" DECIMAL(10,2) NOT NULL,
    "tokens_credit" DECIMAL(20,5) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "segpay_transactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "segpay_cards" ADD CONSTRAINT "segpay_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segpay_transactions" ADD CONSTRAINT "segpay_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
