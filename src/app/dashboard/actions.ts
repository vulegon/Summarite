import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getGitHubMetricsFromDB,
  getJiraMetricsFromDB,
  getSyncStatus as getSyncStatusFromDB,
} from "@/services/sync";
import { getWeeklyPeriod, getMonthlyPeriod } from "@/lib/period";
import { GithubMetrics, JiraMetrics } from "@/types";

export type PeriodType = "weekly" | "monthly" | "custom";

export interface MetricsData {
  github: GithubMetrics;
  jira: JiraMetrics;
  periodStart: string;
  periodEnd: string;
  periodType: PeriodType;
  hasSummary: boolean;
  summary?: string;
  // 前期間との比較用データ（weekly/monthlyのみ）
  previousGithub?: GithubMetrics;
  previousJira?: JiraMetrics;
}

export interface SyncStatusData {
  github: {
    status: "idle" | "syncing" | "completed" | "failed";
    syncedAt: string | null;
  };
  jira: {
    status: "idle" | "syncing" | "completed" | "failed";
    syncedAt: string | null;
  };
}

export async function getMetrics(
  periodType: PeriodType,
  customStart?: string,
  customEnd?: string
): Promise<MetricsData | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  let startDate: Date;
  let endDate: Date;
  let previousStartDate: Date | null = null;
  let previousEndDate: Date | null = null;
  let dbPeriodType: "weekly" | "monthly" | "custom" = periodType;

  if (periodType === "weekly") {
    const period = getWeeklyPeriod(0);
    const previousPeriod = getWeeklyPeriod(1);
    startDate = period.start;
    endDate = period.end;
    previousStartDate = previousPeriod.start;
    previousEndDate = previousPeriod.end;
  } else if (periodType === "monthly") {
    const period = getMonthlyPeriod(0);
    const previousPeriod = getMonthlyPeriod(1);
    startDate = period.start;
    endDate = period.end;
    previousStartDate = previousPeriod.start;
    previousEndDate = previousPeriod.end;
  } else {
    if (!customStart || !customEnd) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      startDate = start;
      endDate = end;
    } else {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    }
    dbPeriodType = "custom";
    // カスタム期間は比較なし
  }

  try {
    // 今期のメトリクスと前期のメトリクスを並列で取得
    const [githubMetrics, jiraMetrics, previousGithubMetrics, previousJiraMetrics] = await Promise.all([
      getGitHubMetricsFromDB(session.user.id, startDate, endDate),
      getJiraMetricsFromDB(session.user.id, startDate, endDate),
      previousStartDate && previousEndDate
        ? getGitHubMetricsFromDB(session.user.id, previousStartDate, previousEndDate)
        : Promise.resolve(null),
      previousStartDate && previousEndDate
        ? getJiraMetricsFromDB(session.user.id, previousStartDate, previousEndDate)
        : Promise.resolve(null),
    ]);

    let existingSummary = null;
    if (periodType !== "custom") {
      existingSummary = await prisma.summary.findFirst({
        where: {
          userId: session.user.id,
          periodStart: startDate,
          periodEnd: endDate,
          periodType: dbPeriodType === "custom" ? "weekly" : dbPeriodType,
        },
      });
    }

    return {
      github: githubMetrics,
      jira: jiraMetrics,
      periodStart: startDate.toISOString(),
      periodEnd: endDate.toISOString(),
      periodType: dbPeriodType,
      hasSummary: !!existingSummary,
      summary: existingSummary?.content,
      previousGithub: previousGithubMetrics ?? undefined,
      previousJira: previousJiraMetrics ?? undefined,
    };
  } catch (error) {
    console.error("Failed to fetch metrics:", error);
    return null;
  }
}

export async function getSyncStatus(): Promise<SyncStatusData | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  try {
    const status = await getSyncStatusFromDB(session.user.id);

    return {
      github: {
        status: status.github.status,
        syncedAt: status.github.syncedAt?.toISOString() ?? null,
      },
      jira: {
        status: status.jira.status,
        syncedAt: status.jira.syncedAt?.toISOString() ?? null,
      },
    };
  } catch (error) {
    console.error("Failed to fetch sync status:", error);
    return null;
  }
}
