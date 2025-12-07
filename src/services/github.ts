import { prisma } from "@/lib/prisma";
import { GithubMetrics, Period } from "@/types";

interface GitHubSearchResponse {
  total_count: number;
  items: GitHubPRItem[];
}

interface GitHubPRItem {
  number: number;
  pull_request?: {
    url: string;
  };
  repository_url: string;
}

interface GitHubPRDetail {
  additions: number;
  deletions: number;
  commits: number;
}

export class GitHubService {
  private accessToken: string;
  private username: string | null = null;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetch<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  private async getUsername(): Promise<string> {
    if (this.username) return this.username;

    const user = await this.fetch<{ login: string }>(
      "https://api.github.com/user"
    );
    this.username = user.login;
    return this.username;
  }

  async getMetrics(period: Period): Promise<GithubMetrics> {
    const username = await this.getUsername();
    const startDate = period.start.toISOString().split("T")[0];
    const endDate = period.end.toISOString().split("T")[0];

    const [prsOpened, prsMerged, reviews, issuesOpened, issuesClosed, codeStats] =
      await Promise.all([
        this.searchCount(
          `type:pr author:${username} created:${startDate}..${endDate}`
        ),
        this.searchCount(
          `type:pr author:${username} merged:${startDate}..${endDate}`
        ),
        this.getReviewCount(username, startDate, endDate),
        this.searchCount(
          `type:issue author:${username} created:${startDate}..${endDate}`
        ),
        this.searchCount(
          `type:issue author:${username} closed:${startDate}..${endDate}`
        ),
        this.getCodeStats(username, startDate, endDate),
      ]);

    return {
      prsOpened,
      prsMerged,
      reviews,
      issuesOpened,
      issuesClosed,
      additions: codeStats.additions,
      deletions: codeStats.deletions,
      commits: codeStats.commits,
    };
  }

  private async searchCount(query: string): Promise<number> {
    const result = await this.fetch<GitHubSearchResponse>(
      `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=1`
    );
    return result.total_count;
  }

  private async getReviewCount(
    username: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
    const result = await this.fetch<GitHubSearchResponse>(
      `https://api.github.com/search/issues?q=${encodeURIComponent(
        `type:pr reviewed-by:${username} updated:${startDate}..${endDate}`
      )}&per_page=1`
    );
    return result.total_count;
  }

  private async getCodeStats(
    username: string,
    startDate: string,
    endDate: string
  ): Promise<{ additions: number; deletions: number; commits: number }> {
    try {
      const result = await this.fetch<GitHubSearchResponse>(
        `https://api.github.com/search/issues?q=${encodeURIComponent(
          `type:pr author:${username} merged:${startDate}..${endDate}`
        )}&per_page=100`
      );

      let totalAdditions = 0;
      let totalDeletions = 0;
      let totalCommits = 0;

      const prDetails = await Promise.all(
        result.items.slice(0, 20).map(async (item) => {
          if (!item.pull_request?.url) return null;
          try {
            const prDetail = await this.fetch<GitHubPRDetail>(item.pull_request.url);
            return prDetail;
          } catch {
            return null;
          }
        })
      );

      for (const pr of prDetails) {
        if (pr) {
          totalAdditions += pr.additions || 0;
          totalDeletions += pr.deletions || 0;
          totalCommits += pr.commits || 0;
        }
      }

      return {
        additions: totalAdditions,
        deletions: totalDeletions,
        commits: totalCommits,
      };
    } catch {
      return { additions: 0, deletions: 0, commits: 0 };
    }
  }
}

export async function getGitHubAccessToken(
  userId: string
): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "github",
    },
  });

  return account?.accessToken || null;
}
