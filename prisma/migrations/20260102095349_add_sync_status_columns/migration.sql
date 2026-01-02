/*
  Warnings:

  - You are about to drop the `github_metrics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `jira_metrics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "github_metrics" DROP CONSTRAINT "github_metrics_user_id_fkey";

-- DropForeignKey
ALTER TABLE "jira_metrics" DROP CONSTRAINT "jira_metrics_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "github_sync_status" TEXT DEFAULT 'idle',
ADD COLUMN     "github_synced_at" TIMESTAMP(3),
ADD COLUMN     "jira_sync_status" TEXT DEFAULT 'idle',
ADD COLUMN     "jira_synced_at" TIMESTAMP(3);

-- DropTable
DROP TABLE "github_metrics";

-- DropTable
DROP TABLE "jira_metrics";

-- CreateTable
CREATE TABLE "github_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL,
    "external_id" TEXT NOT NULL,
    "repo" TEXT,
    "additions" INTEGER,
    "deletions" INTEGER,
    "commits" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "github_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jira_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL,
    "issue_key" TEXT NOT NULL,
    "project_key" TEXT,
    "project_name" TEXT,
    "issue_type" TEXT,
    "priority" TEXT,
    "status" TEXT,
    "summary" TEXT,
    "assignee" TEXT,
    "reporter" TEXT,
    "story_points" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jira_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "github_events_user_id_event_date_idx" ON "github_events"("user_id", "event_date");

-- CreateIndex
CREATE INDEX "github_events_user_id_event_type_event_date_idx" ON "github_events"("user_id", "event_type", "event_date");

-- CreateIndex
CREATE UNIQUE INDEX "github_events_user_id_event_type_external_id_key" ON "github_events"("user_id", "event_type", "external_id");

-- CreateIndex
CREATE INDEX "jira_events_user_id_event_date_idx" ON "jira_events"("user_id", "event_date");

-- CreateIndex
CREATE INDEX "jira_events_user_id_project_key_event_date_idx" ON "jira_events"("user_id", "project_key", "event_date");

-- CreateIndex
CREATE UNIQUE INDEX "jira_events_user_id_event_type_issue_key_key" ON "jira_events"("user_id", "event_type", "issue_key");

-- AddForeignKey
ALTER TABLE "github_events" ADD CONSTRAINT "github_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jira_events" ADD CONSTRAINT "jira_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
