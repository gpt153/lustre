-- CreateEnum
CREATE TYPE "SwipeAction" AS ENUM ('LIKE', 'PASS');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN "location" geography(Point,4326);

-- CreateTable
CREATE TABLE "swipes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "target_id" UUID NOT NULL,
    "action" "SwipeAction" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "swipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" UUID NOT NULL,
    "user1_id" UUID NOT NULL,
    "user2_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seen_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "target_id" UUID NOT NULL,
    "seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seen_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "swipes_user_id_target_id_key" ON "swipes"("user_id", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "matches_user1_id_user2_id_key" ON "matches"("user1_id", "user2_id");

-- CreateIndex
CREATE UNIQUE INDEX "seen_profiles_user_id_target_id_key" ON "seen_profiles"("user_id", "target_id");

-- CreateIndex
CREATE INDEX idx_profiles_location ON profiles USING GIST (location);

-- AddForeignKey
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seen_profiles" ADD CONSTRAINT "seen_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seen_profiles" ADD CONSTRAINT "seen_profiles_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
