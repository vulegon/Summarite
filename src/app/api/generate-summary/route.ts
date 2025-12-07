import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSummary } from "@/services/ai";
import { GithubMetrics, JiraMetrics, AIProvider } from "@/types";

interface GenerateSummaryRequest {
  github: GithubMetrics;
  jira: JiraMetrics;
  periodType: "weekly" | "monthly";
  periodStart: string;
  periodEnd: string;
  provider: AIProvider;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: GenerateSummaryRequest = await request.json();
    const { github, jira, periodType, periodStart, periodEnd, provider } = body;

    const { summary, model } = await generateSummary(
      github,
      jira,
      periodType,
      provider
    );

    // Save to database
    await prisma.summary.upsert({
      where: {
        userId_periodStart_periodEnd_periodType: {
          userId: session.user.id,
          periodStart: new Date(periodStart),
          periodEnd: new Date(periodEnd),
          periodType,
        },
      },
      update: {
        content: summary,
        model,
      },
      create: {
        userId: session.user.id,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        periodType,
        content: summary,
        model,
      },
    });

    return NextResponse.json({ summary, model });
  } catch (error) {
    console.error("Generate summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
