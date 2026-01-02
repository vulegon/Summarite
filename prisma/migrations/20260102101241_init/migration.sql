-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "github_sync_status" TEXT DEFAULT 'idle',
    "github_synced_at" TIMESTAMP(3),
    "jira_sync_status" TEXT DEFAULT 'idle',
    "jira_synced_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "summaries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "period_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

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

-- CreateIndex
CREATE INDEX "summaries_user_id_period_type_idx" ON "summaries"("user_id", "period_type");

-- CreateIndex
CREATE UNIQUE INDEX "summaries_user_id_period_start_period_end_period_type_key" ON "summaries"("user_id", "period_start", "period_end", "period_type");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_events" ADD CONSTRAINT "github_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jira_events" ADD CONSTRAINT "jira_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summaries" ADD CONSTRAINT "summaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
