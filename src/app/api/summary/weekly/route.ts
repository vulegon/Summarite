import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GitHubService, getGitHubAccessToken } from "@/services/github";
import { JiraService, getJiraAccessToken } from "@/services/jira";
import { generateSummary } from "@/services/ai";
import { getWeeklyPeriod } from "@/lib/period";
import { SummaryResponse, GithubMetrics, JiraMetrics } from "@/types";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const weeksAgo = parseInt(searchParams.get("weeksAgo") || "0", 10);
  const period = getWeeklyPeriod(weeksAgo);

  try {
    const existingMetrics = await prisma.githubMetric.findFirst({
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

    if (existingMetrics && existingSummary) {
      const existingJiraMetrics = await prisma.jiraMetric.findFirst({
        where: {
          userId: session.user.id,
          periodStart: period.start,
          periodEnd: period.end,
          periodType: "weekly",
        },
      });

      const response: SummaryResponse = {
        github: {
          prsOpened: existingMetrics.prsOpened,
          prsMerged: existingMetrics.prsMerged,
          reviews: existingMetrics.reviews,
          issuesOpened: existingMetrics.issuesOpened,
          issuesClosed: existingMetrics.issuesClosed,
        },
        jira: existingJiraMetrics
          ? {
              created: existingJiraMetrics.created,
              done: existingJiraMetrics.done,
              inProgress: existingJiraMetrics.inProgress,
              stalled: existingJiraMetrics.stalled,
            }
          : { created: 0, done: 0, inProgress: 0, stalled: 0 },
        summary: existingSummary.content,
        periodStart: period.start.toISOString(),
        periodEnd: period.end.toISOString(),
        periodType: "weekly",
      };

      return NextResponse.json(response);
    }

    let githubMetrics: GithubMetrics = {
      prsOpened: 0,
      prsMerged: 0,
      reviews: 0,
      issuesOpened: 0,
      issuesClosed: 0,
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

    const { summary, model } = await generateSummary(
      githubMetrics,
      jiraMetrics,
      "weekly"
    );

    await prisma.summary.create({
      data: {
        userId: session.user.id,
        periodStart: period.start,
        periodEnd: period.end,
        periodType: "weekly",
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
      periodType: "weekly",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Weekly summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
