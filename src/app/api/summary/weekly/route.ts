import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGitHubMetricsFromDB, getJiraMetricsFromDB } from "@/services/sync";
import { getWeeklyPeriod } from "@/lib/period";

interface MetricsResponse {
  github: {
    prsOpened: number;
    prsMerged: number;
    reviews: number;
    issuesOpened: number;
    issuesClosed: number;
    additions: number;
    deletions: number;
    commits: number;
  };
  jira: {
    created: number;
    done: number;
    inProgress: number;
    stalled: number;
  };
  periodStart: string;
  periodEnd: string;
  periodType: "weekly" | "monthly" | "custom";
  hasSummary: boolean;
  summary?: string;
  // 前週との比較用データ
  previousGithub?: MetricsResponse["github"];
  previousJira?: MetricsResponse["jira"];
  previousPeriodStart?: string;
  previousPeriodEnd?: string;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const weeksAgo = parseInt(searchParams.get("weeksAgo") || "0", 10);
  const period = getWeeklyPeriod(weeksAgo);
  const previousPeriod = getWeeklyPeriod(weeksAgo + 1);

  try {
    // 既存のサマリーを確認
    const existingSummary = await prisma.summary.findFirst({
      where: {
        userId: session.user.id,
        periodStart: period.start,
        periodEnd: period.end,
        periodType: "weekly",
      },
    });

    // DBからGitHubメトリクスを集計（今週と前週を並列で取得）
    const [githubMetrics, previousGithubMetrics] = await Promise.all([
      getGitHubMetricsFromDB(session.user.id, period.start, period.end),
      getGitHubMetricsFromDB(session.user.id, previousPeriod.start, previousPeriod.end),
    ]);

    // DBからJiraメトリクスを集計（今週と前週を並列で取得）
    const [jiraMetrics, previousJiraMetrics] = await Promise.all([
      getJiraMetricsFromDB(session.user.id, period.start, period.end),
      getJiraMetricsFromDB(session.user.id, previousPeriod.start, previousPeriod.end),
    ]);

    const response: MetricsResponse = {
      github: githubMetrics,
      jira: jiraMetrics,
      periodStart: period.start.toISOString(),
      periodEnd: period.end.toISOString(),
      periodType: "weekly",
      hasSummary: !!existingSummary,
      summary: existingSummary?.content,
      // 前週データ
      previousGithub: previousGithubMetrics,
      previousJira: previousJiraMetrics,
      previousPeriodStart: previousPeriod.start.toISOString(),
      previousPeriodEnd: previousPeriod.end.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Weekly metrics error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch metrics: ${errorMessage}` },
      { status: 500 }
    );
  }
}
