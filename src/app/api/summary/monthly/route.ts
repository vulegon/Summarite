import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGitHubMetricsFromDB, getJiraMetricsFromDB } from "@/services/sync";
import { generateSummary } from "@/services/ai";
import { getMonthlyPeriod } from "@/lib/period";
import { SummaryResponse } from "@/types";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const monthsAgo = parseInt(searchParams.get("monthsAgo") || "0", 10);
  const period = getMonthlyPeriod(monthsAgo);

  try {
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

    // 既存のサマリーがあれば返す
    if (existingSummary) {
      const response: SummaryResponse = {
        github: githubMetrics,
        jira: jiraMetrics,
        summary: existingSummary.content,
        periodStart: period.start.toISOString(),
        periodEnd: period.end.toISOString(),
        periodType: "monthly",
      };

      return NextResponse.json(response);
    }

    // サマリーを生成
    const { summary, model } = await generateSummary(
      githubMetrics,
      jiraMetrics,
      "monthly"
    );

    await prisma.summary.create({
      data: {
        userId: session.user.id,
        periodStart: period.start,
        periodEnd: period.end,
        periodType: "monthly",
        content: summary,
        model,
      },
    });

    const response: SummaryResponse = {
      github: githubMetrics,
      jira: jiraMetrics,
      summary,
      periodStart: period.start.toISOString(),
      periodEnd: period.end.toISOString(),
      periodType: "monthly",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Monthly summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
