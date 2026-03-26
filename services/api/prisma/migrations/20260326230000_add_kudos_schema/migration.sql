-- CreateTable KudosBadgeCategory
CREATE TABLE "kudos_badge_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kudos_badge_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable KudosBadge
CREATE TABLE "kudos_badges" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "spicy_only" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kudos_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable Kudos
CREATE TABLE "kudos" (
    "id" UUID NOT NULL,
    "giver_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "match_id" UUID,
    "safe_date_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kudos_pkey" PRIMARY KEY ("id")
);

-- CreateTable KudosBadgeSelection
CREATE TABLE "kudos_badge_selections" (
    "id" UUID NOT NULL,
    "kudos_id" UUID NOT NULL,
    "badge_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kudos_badge_selections_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "kudos_badges" ADD CONSTRAINT "kudos_badges_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "kudos_badge_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kudos" ADD CONSTRAINT "kudos_giver_id_fkey" FOREIGN KEY ("giver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kudos" ADD CONSTRAINT "kudos_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kudos" ADD CONSTRAINT "kudos_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kudos_badge_selections" ADD CONSTRAINT "kudos_badge_selections_kudos_id_fkey" FOREIGN KEY ("kudos_id") REFERENCES "kudos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kudos_badge_selections" ADD CONSTRAINT "kudos_badge_selections_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "kudos_badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "kudos_badge_categories_slug_key" ON "kudos_badge_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "kudos_badges_slug_key" ON "kudos_badges"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "kudos_giver_id_recipient_id_match_id_key" ON "kudos"("giver_id", "recipient_id", "match_id");

-- CreateIndex
CREATE INDEX "kudos_recipient_id_idx" ON "kudos"("recipient_id");

-- CreateIndex
CREATE UNIQUE INDEX "kudos_badge_selections_kudos_id_badge_id_key" ON "kudos_badge_selections"("kudos_id", "badge_id");
