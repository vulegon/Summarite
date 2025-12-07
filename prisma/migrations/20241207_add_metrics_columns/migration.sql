-- AlterTable
ALTER TABLE "github_metrics" ADD COLUMN     "additions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "commits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deletions" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "summaries_user_id_period_start_period_end_period_type_key" ON "summaries"("user_id", "period_start", "period_end", "period_type");
