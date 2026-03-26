-- CreateTable
CREATE TABLE "swish_recurring_agreements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "agreement_token" VARCHAR(500) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "auto_topup_amount" DECIMAL(10,2) NOT NULL,
    "low_balance_threshold" DECIMAL(20,5) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "swish_recurring_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "swish_recurring_agreements_user_id_key" ON "swish_recurring_agreements"("user_id");

-- AddForeignKey
ALTER TABLE "swish_recurring_agreements" ADD CONSTRAINT "swish_recurring_agreements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
