import { prisma } from "@/lib/prisma";
import { GitHubService, getGitHubAccessToken } from "@/services/github";
import { subMonths } from "date-fns";

export type SyncStatus = "idle" | "syncing" | "completed" | "failed";

/**
 * GitHubイベントを非同期で取得してDBに保存
 * デフォルトで過去3ヶ月分を取得
 */
export async function syncGitHubEvents(userId: string): Promise<void> {
  console.log(`[syncGitHubEvents] Starting sync for user: ${userId}`);

  try {
    const accessToken = await getGitHubAccessToken(userId);
    if (!accessToken) {
      throw new Error("GitHub access token not found");
    }
    console.log(`[syncGitHubEvents] Got access token`);

    const githubService = new GitHubService(accessToken);

    // 過去3ヶ月分を取得
    const endDate = new Date();
    const startDate = subMonths(endDate, 3);
    console.log(`[syncGitHubEvents] Fetching events from ${startDate} to ${endDate}`);

    const events = await githubService.fetchEvents(startDate, endDate);
    console.log(`[syncGitHubEvents] Fetched ${events.length} events`);

    // イベントをDBに保存（upsert）
    for (const event of events) {
      await prisma.githubEvent.upsert({
        where: {
          userId_eventType_externalId: {
            userId,
            eventType: event.eventType,
            externalId: event.externalId,
          },
        },
        update: {
          eventDate: event.eventDate,
          repo: event.repo,
          additions: event.additions,
          deletions: event.deletions,
          commits: event.commits,
        },
        create: {
          userId,
          eventType: event.eventType,
          eventDate: event.eventDate,
          externalId: event.externalId,
          repo: event.repo,
          additions: event.additions,
          deletions: event.deletions,
          commits: event.commits,
        },
      });
    }

    // 同期完了を記録
    await prisma.user.update({
      where: { id: userId },
      data: {
        githubSyncStatus: "completed",
        githubSyncedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("GitHub sync error:", error);

    // 同期失敗を記録
    await prisma.user.update({
      where: { id: userId },
      data: { githubSyncStatus: "failed" },
    });

    throw error;
  }
}

/**
 * 同期状態を取得
 */
export async function getSyncStatus(userId: string): Promise<{
  github: { status: SyncStatus; syncedAt: Date | null };
  jira: { status: SyncStatus; syncedAt: Date | null };
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      githubSyncStatus: true,
      githubSyncedAt: true,
      jiraSyncStatus: true,
      jiraSyncedAt: true,
    },
  });

  return {
    github: {
      status: (user?.githubSyncStatus as SyncStatus) || "idle",
      syncedAt: user?.githubSyncedAt || null,
    },
    jira: {
      status: (user?.jiraSyncStatus as SyncStatus) || "idle",
      syncedAt: user?.jiraSyncedAt || null,
    },
  };
}

/**
 * 指定期間のGitHubメトリクスをDBから集計
 */
export async function getGitHubMetricsFromDB(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  prsOpened: number;
  prsMerged: number;
  reviews: number;
  issuesOpened: number;
  issuesClosed: number;
  additions: number;
  deletions: number;
  commits: number;
}> {
  const events = await prisma.githubEvent.findMany({
    where: {
      userId,
      eventDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const metrics = {
    prsOpened: 0,
    prsMerged: 0,
    reviews: 0,
    issuesOpened: 0,
    issuesClosed: 0,
    additions: 0,
    deletions: 0,
    commits: 0,
  };

  for (const event of events) {
    switch (event.eventType) {
      case "pr_opened":
        metrics.prsOpened++;
        break;
      case "pr_merged":
        metrics.prsMerged++;
        metrics.additions += event.additions || 0;
        metrics.deletions += event.deletions || 0;
        break;
      case "review":
        metrics.reviews++;
        break;
      case "issue_opened":
        metrics.issuesOpened++;
        break;
      case "issue_closed":
        metrics.issuesClosed++;
        break;
      case "commit":
        // commitイベントはリポジトリごとのコミット数を持っている
        metrics.commits += event.commits || 0;
        break;
    }
  }

  return metrics;
}
