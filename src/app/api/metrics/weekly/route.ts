import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GitHubService, getGitHubAccessToken } from "@/services/github";
import { JiraService, getJiraAccessToken } from "@/services/jira";
import { getWeeklyPeriod } from "@/lib/period";
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
  const weeksAgo = parseInt(searchParams.get("weeksAgo") || "0", 10);
  const period = getWeeklyPeriod(weeksAgo);

  try {
    // Check for existing metrics
    const existingMetrics = await prisma.githubMetric.findFirst({
      where: {
        userId: session.user.id,
        periodStart: period.start,
        periodEnd: period.end,
        periodType: "weekly",
      },
    });

    const existingJiraMetrics = await prisma.jiraMetric.findFirst({
      where: {
        userId: session.user.id,
        periodStart: period.start,
        periodEnd: period.end,
        periodType: "weekly",
      },
    });

    const existingSummary = await prisma.summary.findFirst({
      where: {
        userId: session.user.id,
        periodStart: period.start,
        periodEnd: period.end,
        periodType: "weekly",
      },
    });

    // Return cached metrics if available
    if (existingMetrics) {
      const response: MetricsResponse = {
        github: {
          prsOpened: existingMetrics.prsOpened,
          prsMerged: existingMetrics.prsMerged,
          reviews: existingMetrics.reviews,
          issuesOpened: existingMetrics.issuesOpened,
          issuesClosed: existingMetrics.issuesClosed,
          additions: existingMetrics.additions,
          deletions: existingMetrics.deletions,
          commits: existingMetrics.commits,
        },
        jira: existingJiraMetrics
          ? {
              created: existingJiraMetrics.created,
              done: existingJiraMetrics.done,
              inProgress: existingJiraMetrics.inProgress,
              stalled: existingJiraMetrics.stalled,
            }
          : { created: 0, done: 0, inProgress: 0, stalled: 0 },
        periodStart: period.start.toISOString(),
        periodEnd: period.end.toISOString(),
        periodType: "weekly",
        hasSummary: !!existingSummary,
        summary: existingSummary?.content,
      };

      return NextResponse.json(response);
    }

    // Fetch new metrics
    let githubMetrics: GithubMetrics = {
      prsOpened: 0,
      prsMerged: 0,
      reviews: 0,
      issuesOpened: 0,
      issuesClosed: 0,
      additions: 0,
      deletions: 0,
      commits: 0,
    };

    let jiraMetrics: JiraMetrics = {
      created: 0,
      done: 0,
      inProgress: 0,
      stalled: 0,
    };

    const githubToken = await getGitHubAccessToken(session.user.id);
    if (githubToken) {
      const githubService = new GitHubService(githubToken);
      githubMetrics = await githubService.getMetrics(period);

      await prisma.githubMetric.upsert({
        where: {
          userId_periodStart_periodEnd_periodType: {
            userId: session.user.id,
            periodStart: period.start,
            periodEnd: period.end,
            periodType: "weekly",
          },
        },
        update: { ...githubMetrics },
        create: {
          userId: session.user.id,
          periodStart: period.start,
          periodEnd: period.end,
          periodType: "weekly",
          ...githubMetrics,
        },
      });
    }

    const jiraToken = await getJiraAccessToken(session.user.id);
    if (jiraToken) {
      const jiraService = new JiraService(jiraToken);
      jiraMetrics = await jiraService.getMetrics(period);

      await prisma.jiraMetric.upsert({
        where: {
          userId_periodStart_periodEnd_periodType: {
            userId: session.user.id,
            periodStart: period.start,
            periodEnd: period.end,
            periodType: "weekly",
          },
        },
        update: { ...jiraMetrics },
        create: {
          userId: session.user.id,
          periodStart: period.start,
          periodEnd: period.end,
          periodType: "weekly",
          ...jiraMetrics,
        },
      });
    }

    const response: MetricsResponse = {
      github: githubMetrics,
      jira: jiraMetrics,
      periodStart: period.start.toISOString(),
      periodEnd: period.end.toISOString(),
      periodType: "weekly",
      hasSummary: false,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Weekly metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
