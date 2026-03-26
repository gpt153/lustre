-- Add REFERRAL to TokenTransactionType enum
ALTER TYPE "TokenTransactionType" ADD VALUE IF NOT EXISTS 'REFERRAL';

-- Create invite_links table
CREATE TABLE "invite_links" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "referrer_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "used_count" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "invite_links_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "invite_links_code_key" ON "invite_links"("code");

ALTER TABLE "invite_links" ADD CONSTRAINT "invite_links_referrer_id_fkey"
  FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create referral_rewards table
CREATE TABLE "referral_rewards" (
  "id" TEXT NOT NULL,
  "invite_link_id" TEXT NOT NULL,
  "referrer_id" UUID NOT NULL,
  "referee_id" UUID NOT NULL,
  "referrer_tokens" INTEGER NOT NULL,
  "referee_tokens" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "referral_rewards_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_invite_link_id_fkey"
  FOREIGN KEY ("invite_link_id") REFERENCES "invite_links"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referrer_id_fkey"
  FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referee_id_fkey"
  FOREIGN KEY ("referee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
