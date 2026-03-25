-- AlterTable
ALTER TABLE "conversation_participants" ADD COLUMN "last_read_at" TIMESTAMPTZ;
ALTER TABLE "conversation_participants" ADD COLUMN "read_receipts" BOOLEAN NOT NULL DEFAULT TRUE;
