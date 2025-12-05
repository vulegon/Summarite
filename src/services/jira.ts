import { prisma } from "@/lib/prisma";
import { JiraMetrics, Period } from "@/types";

interface JiraSearchResponse {
  total: number;
  issues: unknown[];
}

export class JiraService {
  private accessToken: string;
  private cloudId: string | null = null;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async getCloudId(): Promise<string> {
    if (this.cloudId) return this.cloudId;

    const response = await fetch(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get Jira cloud ID");
    }

    const resources = await response.json();
    if (!resources.length) {
      throw new Error("No Jira cloud resources found");
    }

    this.cloudId = resources[0].id;
    return this.cloudId!;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const cloudId = await this.getCloudId();
    const response = await fetch(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Jira API error: ${response.status}`);
    }

    return response.json();
  }

  async getMetrics(period: Period): Promise<JiraMetrics> {
    const startDate = period.start.toISOString().split("T")[0];
    const endDate = period.end.toISOString().split("T")[0];

    const [created, done, inProgress, stalled] = await Promise.all([
      this.searchCount(`created >= "${startDate}" AND created <= "${endDate}"`),
      this.searchCount(
        `status = Done AND resolutiondate >= "${startDate}" AND resolutiondate <= "${endDate}"`
      ),
      this.searchCount(
        `status = "In Progress" AND updated >= "${startDate}" AND updated <= "${endDate}"`
      ),
      this.searchCount(
        `status != Done AND updated < "${startDate}" AND created < "${startDate}"`
      ),
    ]);

    return {
      created,
      done,
      inProgress,
      stalled,
    };
  }

  private async searchCount(jql: string): Promise<number> {
    try {
      const result = await this.fetch<JiraSearchResponse>(
        `/search?jql=${encodeURIComponent(jql)}&maxResults=0`
      );
      return result.total;
    } catch {
      return 0;
    }
  }
}

export async function getJiraAccessToken(
  userId: string
): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "jira",
    },
  });

  return account?.accessToken || null;
}
