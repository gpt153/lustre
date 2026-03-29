CREATE TYPE "AuditTargetType" AS ENUM ('USER', 'REPORT', 'ORGANIZATION');

CREATE TABLE "audit_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "admin_id" UUID NOT NULL,
  "action" TEXT NOT NULL,
  "target_type" "AuditTargetType" NOT NULL,
  "target_id" UUID NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_admin_id_idx" ON "audit_logs"("admin_id");
CREATE INDEX "audit_logs_target_id_idx" ON "audit_logs"("target_id");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");
