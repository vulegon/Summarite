import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGitHubMetricsFromDB, getJiraMetricsFromDB } from "@/services/sync";
import { getMonthlyPeriod } from "@/lib/period";
import { GithubMetrics, JiraMetrics } from "@/types";

export interface MetricsResponse {
  github: GithubMetrics;
  jira: JiraMetrics;
  periodStart: string;
  periodEnd: string;
  periodType: "weekly" | "monthly";
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
    // DBからGitHubメトリクスを集計
    const githubMetrics = await getGitHubMetricsFromDB(
      session.user.id,
      period.start,
      period.end
    );

    // DBからJiraメトリクスを集計
    const jiraMetrics: JiraMetrics = await getJiraMetricsFromDB(
      session.user.id,
      period.start,
      period.end
    );

    // サマリーを取得
    const existingSummary = await prisma.summary.findFirst({
      where: {
        userId: session.user.id,
        periodStart: period.start,
        periodEnd: period.end,
        periodType: "monthly",
      },
    });

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
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
