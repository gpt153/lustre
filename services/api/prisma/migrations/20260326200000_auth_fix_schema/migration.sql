-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'PENDING_EMAIL';

-- AlterTable
ALTER TABLE "users" ADD COLUMN "email" TEXT,
ADD COLUMN "password_hash" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "phone_hash" TEXT;

ALTER TABLE "users" DROP COLUMN IF EXISTS "personnummer_hash";

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
CREATE UNIQUE INDEX "users_phone_hash_key" ON "users"("phone_hash");

-- CreateTable
CREATE TABLE "oauth_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "oauth_accounts_provider_provider_id_key" ON "oauth_accounts"("provider", "provider_id");

-- AddForeignKey
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
