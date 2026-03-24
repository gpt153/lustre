-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email",
ADD COLUMN "personnummer_hash" TEXT NOT NULL,
ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "display_name" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_personnummer_hash_key" ON "users"("personnummer_hash");

-- CreateTable
CREATE TABLE "encrypted_identities" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "encrypted_first_name" TEXT NOT NULL,
    "encrypted_last_name" TEXT NOT NULL,
    "encrypted_personnummer" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encrypted_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "device_info" TEXT,
    "ip_address" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "encrypted_identities_user_id_key" ON "encrypted_identities"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- AddForeignKey
ALTER TABLE "encrypted_identities" ADD CONSTRAINT "encrypted_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
