import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGitHubMetricsFromDB, getJiraMetricsFromDB } from "@/services/sync";
import { getMonthlyPeriod } from "@/lib/period";

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
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const monthsAgo = parseInt(searchParams.get("monthsAgo") || "0", 10);
  const period = getMonthlyPeriod(monthsAgo);

  try {
    // 既存のサマリーを確認
    const existingSummary = await prisma.summary.findFirst({
      where: {
        userId: session.user.id,
        periodStart: period.start,
        periodEnd: period.end,
        periodType: "monthly",
      },
    });

    // DBからGitHubメトリクスを集計
    const githubMetrics = await getGitHubMetricsFromDB(
      session.user.id,
      period.start,
      period.end
    );

    // DBからJiraメトリクスを集計
    const jiraMetrics = await getJiraMetricsFromDB(
      session.user.id,
      period.start,
      period.end
    );

    const response: MetricsResponse = {
      github: githubMetrics,
      jira: jiraMetrics,
      periodStart: period.start.toISOString(),
      periodEnd: period.end.toISOString(),
      periodType: "monthly",
      hasSummary: !!existingSummary,
      summary: existingSummary?.content,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Monthly metrics error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch metrics: ${errorMessage}` },
      { status: 500 }
    );
  }
}
