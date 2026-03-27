-- CreateEnum
CREATE TYPE "IntentionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'EXPIRED', 'DELETED');

-- CreateEnum
CREATE TYPE "IntentionSeeking" AS ENUM ('CASUAL', 'RELATIONSHIP', 'FRIENDSHIP', 'EXPLORATION', 'EVENT', 'OTHER');

-- CreateEnum
CREATE TYPE "IntentionAvailability" AS ENUM ('WEEKDAYS', 'WEEKENDS', 'FLEXIBLE');

-- CreateTable
CREATE TABLE "intentions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "seeking" "IntentionSeeking" NOT NULL,
    "gender_preferences" "Gender"[] NOT NULL,
    "age_min" INTEGER NOT NULL,
    "age_max" INTEGER NOT NULL,
    "distance_radius_km" INTEGER NOT NULL,
    "orientation_match" "Orientation"[] NOT NULL,
    "availability" "IntentionAvailability" NOT NULL,
    "relationship_structure" "RelationshipType",
    "status" "IntentionStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intentions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intention_kink_tags" (
    "id" UUID NOT NULL,
    "intention_id" UUID NOT NULL,
    "kink_tag_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intention_kink_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "intentions_status_seeking_expires_at_idx" ON "intentions"("status", "seeking", "expires_at");

-- CreateIndex
CREATE INDEX "intentions_user_id_idx" ON "intentions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "intention_kink_tags_intention_id_kink_tag_id_key" ON "intention_kink_tags"("intention_id", "kink_tag_id");

-- AddForeignKey
ALTER TABLE "intentions" ADD CONSTRAINT "intentions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intention_kink_tags" ADD CONSTRAINT "intention_kink_tags_intention_id_fkey" FOREIGN KEY ("intention_id") REFERENCES "intentions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intention_kink_tags" ADD CONSTRAINT "intention_kink_tags_kink_tag_id_fkey" FOREIGN KEY ("kink_tag_id") REFERENCES "kink_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
