import { prisma } from "@/lib/prisma";
import { JiraMetrics, Period } from "@/types";

export type JiraEventType = "created" | "done" | "in_progress";

export interface JiraEvent {
  eventType: JiraEventType;
  eventDate: Date;
  issueKey: string;
  projectKey?: string;
  projectName?: string;
  issueType?: string;
  priority?: string;
  status?: string;
  summary?: string;
  assignee?: string;
  reporter?: string;
  storyPoints?: number;
}

interface JiraSearchResponse {
  total: number;
  issues: JiraIssue[];
  nextPageToken?: string;
}

interface JiraIssue {
  id: string;
  key: string;
  fields: {
    project: {
      key: string;
      name: string;
    };
    issuetype: {
      name: string;
    };
    priority?: {
      name: string;
    };
    status: {
      name: string;
    };
    summary: string;
    assignee?: {
      displayName: string;
    };
    reporter?: {
      displayName: string;
    };
    created: string;
    resolutiondate?: string;
    updated: string;
    // ストーリーポイントはカスタムフィールド
    [key: string]: unknown;
  };
}

export class JiraService {
  private accessToken: string;
  private cloudId: string | null = null;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async getCloudId(): Promise<string> {
    if (this.cloudId) return this.cloudId;

    console.log("[JiraService] Getting cloud ID...");
    const response = await fetch(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[JiraService] Cloud ID error: ${response.status} - ${errorBody}`);
      throw new Error(`Failed to get Jira cloud ID: ${response.status} - ${errorBody}`);
    }

    const resources = await response.json();
    console.log("[JiraService] Resources:", JSON.stringify(resources));
    if (!resources.length) {
      throw new Error("No Jira cloud resources found");
    }

    this.cloudId = resources[0].id;
    console.log("[JiraService] Cloud ID:", this.cloudId);
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

  /**
   * 期間内のJiraイベントを取得
   * ストーリーポイントのカスタムフィールドIDを指定可能
   */
  async fetchEvents(
    startDate: Date,
    endDate: Date,
    storyPointsFieldId?: string
  ): Promise<JiraEvent[]> {
    const events: JiraEvent[] = [];
    const fromDate = startDate.toISOString().split("T")[0];
    const toDate = endDate.toISOString().split("T")[0];

    // 1. 期間内に作成された自分担当のチケット
    const createdIssues = await this.searchIssues(
      `assignee = currentUser() AND created >= "${fromDate}" AND created <= "${toDate}"`,
      storyPointsFieldId
    );
    for (const issue of createdIssues) {
      events.push(this.issueToEvent(issue, "created", new Date(issue.fields.created), storyPointsFieldId));
    }
    console.log(`[JiraService] Fetched ${createdIssues.length} created issues`);

    // 2. 期間内に完了した自分担当のチケット
    const doneIssues = await this.searchIssues(
      `assignee = currentUser() AND status = Done AND resolutiondate >= "${fromDate}" AND resolutiondate <= "${toDate}"`,
      storyPointsFieldId
    );
    for (const issue of doneIssues) {
      if (issue.fields.resolutiondate) {
        events.push(this.issueToEvent(issue, "done", new Date(issue.fields.resolutiondate), storyPointsFieldId));
      }
    }
    console.log(`[JiraService] Fetched ${doneIssues.length} done issues`);

    // 3. 期間内にIn Progressになった自分担当のチケット
    const inProgressIssues = await this.searchIssues(
      `assignee = currentUser() AND status = "In Progress" AND updated >= "${fromDate}" AND updated <= "${toDate}"`,
      storyPointsFieldId
    );
    for (const issue of inProgressIssues) {
      events.push(this.issueToEvent(issue, "in_progress", new Date(issue.fields.updated), storyPointsFieldId));
    }
    console.log(`[JiraService] Fetched ${inProgressIssues.length} in-progress issues`);

    console.log(`[JiraService] Total events fetched: ${events.length}`);
    return events;
  }

  private async searchIssues(jql: string, storyPointsFieldId?: string): Promise<JiraIssue[]> {
    const issues: JiraIssue[] = [];
    let nextPageToken: string | undefined;

    // 取得するフィールド
    const fields = [
      "project",
      "issuetype",
      "priority",
      "status",
      "summary",
      "assignee",
      "reporter",
      "created",
      "resolutiondate",
      "updated",
    ];
    if (storyPointsFieldId) {
      fields.push(storyPointsFieldId);
    }

    do {
      try {
        const result = await this.searchWithJql(jql, fields, nextPageToken);
        issues.push(...result.issues);
        nextPageToken = result.nextPageToken;

        // 1000件制限
        if (issues.length >= 1000) {
          console.log(`[JiraService] Reached 1000 issues limit`);
          break;
        }
      } catch (error) {
        console.error(`[JiraService] Error searching issues:`, error);
        break;
      }
    } while (nextPageToken);

    return issues;
  }

  private async searchWithJql(
    jql: string,
    fields: string[],
    nextPageToken?: string
  ): Promise<JiraSearchResponse> {
    const cloudId = await this.getCloudId();
    const url = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search/jql`;

    const body: Record<string, unknown> = {
      jql,
      fields,
      maxResults: 100,
    };
    if (nextPageToken) {
      body.nextPageToken = nextPageToken;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[JiraService] Search error: ${response.status} - ${errorBody}`);
      throw new Error(`Jira API error: ${response.status}`);
    }

    return response.json();
  }

  private issueToEvent(
    issue: JiraIssue,
    eventType: JiraEventType,
    eventDate: Date,
    storyPointsFieldId?: string
  ): JiraEvent {
    let storyPoints: number | undefined;
    if (storyPointsFieldId && issue.fields[storyPointsFieldId] != null) {
      const value = issue.fields[storyPointsFieldId];
      storyPoints = typeof value === "number" ? value : undefined;
    }

    return {
      eventType,
      eventDate,
      issueKey: issue.key,
      projectKey: issue.fields.project.key,
      projectName: issue.fields.project.name,
      issueType: issue.fields.issuetype.name,
      priority: issue.fields.priority?.name,
      status: issue.fields.status.name,
      summary: issue.fields.summary,
      assignee: issue.fields.assignee?.displayName,
      reporter: issue.fields.reporter?.displayName,
      storyPoints,
    };
  }
}

const JIRA_TOKEN_URL = "https://auth.atlassian.com/oauth/token";

export async function getJiraAccessToken(
  userId: string
): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "jira",
    },
  });

  if (!account?.accessToken) {
    return null;
  }

  // トークンが期限切れかチェック（5分前にリフレッシュ）
  const now = Math.floor(Date.now() / 1000);
  const isExpired = account.expiresAt && account.expiresAt < now + 300;

  if (isExpired && account.refreshToken) {
    console.log("[getJiraAccessToken] Token expired, refreshing...");
    try {
      const response = await fetch(JIRA_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "refresh_token",
          client_id: process.env.JIRA_CLIENT_ID,
          client_secret: process.env.JIRA_CLIENT_SECRET,
          refresh_token: account.refreshToken,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("[getJiraAccessToken] Refresh failed:", error);
        return null;
      }

      const tokens = await response.json();
      console.log("[getJiraAccessToken] Token refreshed successfully");

      // 新しいトークンを保存
      await prisma.account.update({
        where: { id: account.id },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || account.refreshToken,
          expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
        },
      });

      return tokens.access_token;
    } catch (error) {
      console.error("[getJiraAccessToken] Refresh error:", error);
      return null;
    }
  }

  return account.accessToken;
}
