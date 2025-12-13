import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGitHubMetricsFromDB } from "@/services/sync";
import { JiraService, getJiraAccessToken } from "@/services/jira";
import { GithubMetrics, JiraMetrics } from "@/types";

export interface MetricsResponse {
  github: GithubMetrics;
  jira: JiraMetrics;
  periodStart: string;
  periodEnd: string;
  periodType: "custom";
  hasSummary: boolean;
  summary?: string;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");

  if (!startDateStr || !endDateStr) {
    return NextResponse.json(
      { error: "startDate and endDate are required" },
      { status: 400 }
    );
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // 終了日は23:59:59に設定
  endDate.setHours(23, 59, 59, 999);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json(
      { error: "Invalid date format" },
      { status: 400 }
    );
  }

  if (startDate > endDate) {
    return NextResponse.json(
      { error: "startDate must be before endDate" },
      { status: 400 }
    );
  }

  try {
    // DBからGitHubメトリクスを集計
    const githubMetrics = await getGitHubMetricsFromDB(
      session.user.id,
      startDate,
      endDate
    );

    // Jiraメトリクスを取得（APIから直接）
    let jiraMetrics: JiraMetrics = {
      created: 0,
      done: 0,
      inProgress: 0,
      stalled: 0,
    };

    const jiraToken = await getJiraAccessToken(session.user.id);
    if (jiraToken) {
      const jiraService = new JiraService(jiraToken);
      jiraMetrics = await jiraService.getMetrics({
        start: startDate,
        end: endDate,
        type: "custom" as const,
      });
    }

    // カスタム期間のサマリーは既存のものを検索しない（毎回新規生成）
    const response: MetricsResponse = {
      github: githubMetrics,
      jira: jiraMetrics,
      periodStart: startDate.toISOString(),
      periodEnd: endDate.toISOString(),
      periodType: "custom",
      hasSummary: false,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Custom metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
