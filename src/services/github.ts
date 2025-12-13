import { prisma } from "@/lib/prisma";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

export type GithubEventType =
  | "pr_opened"
  | "pr_merged"
  | "review"
  | "issue_opened"
  | "issue_closed"
  | "commit";

export interface GithubEvent {
  eventType: GithubEventType;
  eventDate: Date;
  externalId: string;
  repo: string;
  additions?: number;
  deletions?: number;
  commits?: number;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface ContributionsCollectionResponse {
  viewer: {
    login: string;
    contributionsCollection: {
      totalCommitContributions: number;
      totalPullRequestContributions: number;
      totalPullRequestReviewContributions: number;
      totalIssueContributions: number;
      commitContributionsByRepository: Array<{
        repository: {
          nameWithOwner: string;
        };
        contributions: {
          totalCount: number;
        };
      }>;
    };
  };
}

interface SearchPRsResponse {
  mergedPRs: {
    issueCount: number;
    nodes: Array<{
      number: number;
      title: string;
      mergedAt: string;
      additions: number;
      deletions: number;
      commits: {
        totalCount: number;
      };
      repository: {
        nameWithOwner: string;
      };
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

interface SearchIssuesResponse {
  closedIssues: {
    issueCount: number;
    nodes: Array<{
      number: number;
      closedAt: string;
      repository: {
        nameWithOwner: string;
      };
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

interface SearchOpenedPRsResponse {
  openedPRs: {
    issueCount: number;
    nodes: Array<{
      number: number;
      createdAt: string;
      repository: {
        nameWithOwner: string;
      };
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

interface SearchOpenedIssuesResponse {
  openedIssues: {
    issueCount: number;
    nodes: Array<{
      number: number;
      createdAt: string;
      repository: {
        nameWithOwner: string;
      };
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

interface PullRequestReviewContributionsResponse {
  viewer: {
    contributionsCollection: {
      pullRequestReviewContributions: {
        totalCount: number;
        nodes: Array<{
          occurredAt: string;
          pullRequestReview: {
            createdAt: string;
            pullRequest: {
              number: number;
              repository: {
                nameWithOwner: string;
              };
            };
          };
        }>;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
      };
    };
  };
}

export class GitHubService {
  private accessToken: string;
  private username: string | null = null;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    console.log(`[GitHubService] GraphQL query executing...`);

    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    console.log(`[GitHubService] Response status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[GitHubService] Error body: ${errorBody}`);
      throw new Error(`GitHub GraphQL API error: ${response.status} - ${errorBody}`);
    }

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors && result.errors.length > 0) {
      console.error(`[GitHubService] GraphQL errors:`, result.errors);
      throw new Error(`GitHub GraphQL error: ${result.errors[0].message}`);
    }

    if (!result.data) {
      throw new Error("No data returned from GitHub GraphQL API");
    }

    return result.data;
  }

  private async getUsername(): Promise<string> {
    if (this.username) return this.username;

    const query = `query { viewer { login } }`;
    const data = await this.graphql<{ viewer: { login: string } }>(query);
    this.username = data.viewer.login;
    return this.username;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  /**
   * GraphQL APIを使用してユーザーの活動を取得
   * 期間制限なし、より正確なデータを取得可能
   */
  async fetchEvents(startDate: Date, endDate: Date): Promise<GithubEvent[]> {
    const username = await this.getUsername();
    console.log(
      `[GitHubService] Fetching events for ${username} from ${startDate.toISOString()} to ${endDate.toISOString()}`
    );

    const events: GithubEvent[] = [];
    const fromDate = this.formatDate(startDate);
    const toDate = this.formatDate(endDate);

    // 1. マージされたPR（additions/deletions含む）を取得
    const mergedPRs = await this.fetchMergedPRs(username, fromDate, toDate);
    events.push(...mergedPRs);
    console.log(`[GitHubService] Fetched ${mergedPRs.length} merged PRs`);

    // 2. 作成されたPRを取得
    const openedPRs = await this.fetchOpenedPRs(username, fromDate, toDate);
    events.push(...openedPRs);
    console.log(`[GitHubService] Fetched ${openedPRs.length} opened PRs`);

    // 3. レビューしたPRを取得（contributionsCollectionを使用して正確に取得）
    const reviews = await this.fetchReviews(username, fromDate, toDate, startDate, endDate);
    events.push(...reviews);
    console.log(`[GitHubService] Fetched ${reviews.length} reviews`);

    // 4. 作成されたIssueを取得
    const openedIssues = await this.fetchOpenedIssues(username, fromDate, toDate);
    events.push(...openedIssues);
    console.log(`[GitHubService] Fetched ${openedIssues.length} opened issues`);

    // 5. クローズされたIssueを取得
    const closedIssues = await this.fetchClosedIssues(username, fromDate, toDate);
    events.push(...closedIssues);
    console.log(`[GitHubService] Fetched ${closedIssues.length} closed issues`);

    // 6. コミット数を取得（contributionsCollectionから）
    const commitEvents = await this.fetchCommitContributions(startDate, endDate);
    events.push(...commitEvents);
    console.log(`[GitHubService] Fetched ${commitEvents.length} commit contributions`);

    console.log(`[GitHubService] Total events fetched: ${events.length}`);
    return events;
  }

  private async fetchMergedPRs(
    username: string,
    fromDate: string,
    toDate: string
  ): Promise<GithubEvent[]> {
    const events: GithubEvent[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const query = `
        query ($searchQuery: String!, $cursor: String) {
          mergedPRs: search(
            query: $searchQuery
            type: ISSUE
            first: 100
            after: $cursor
          ) {
            issueCount
            nodes {
              ... on PullRequest {
                number
                title
                mergedAt
                additions
                deletions
                commits {
                  totalCount
                }
                repository {
                  nameWithOwner
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      const searchQuery = `is:pr is:merged author:${username} merged:${fromDate}..${toDate}`;
      const data: SearchPRsResponse = await this.graphql<SearchPRsResponse>(query, {
        searchQuery,
        cursor,
      });

      for (const pr of data.mergedPRs.nodes) {
        if (pr.repository && pr.mergedAt) {
          events.push({
            eventType: "pr_merged",
            eventDate: new Date(pr.mergedAt),
            externalId: `${pr.repository.nameWithOwner}#${pr.number}`,
            repo: pr.repository.nameWithOwner,
            additions: pr.additions,
            deletions: pr.deletions,
            commits: pr.commits?.totalCount || 0,
          });
        }
      }

      hasNextPage = data.mergedPRs.pageInfo.hasNextPage;
      cursor = data.mergedPRs.pageInfo.endCursor;

      // 1000件制限に達した場合は終了
      if (events.length >= 1000) {
        console.log(`[GitHubService] Reached 1000 merged PRs limit`);
        break;
      }
    }

    return events;
  }

  private async fetchOpenedPRs(
    username: string,
    fromDate: string,
    toDate: string
  ): Promise<GithubEvent[]> {
    const events: GithubEvent[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const query = `
        query ($searchQuery: String!, $cursor: String) {
          openedPRs: search(
            query: $searchQuery
            type: ISSUE
            first: 100
            after: $cursor
          ) {
            issueCount
            nodes {
              ... on PullRequest {
                number
                createdAt
                repository {
                  nameWithOwner
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      const searchQuery = `is:pr author:${username} created:${fromDate}..${toDate}`;
      const data: SearchOpenedPRsResponse = await this.graphql<SearchOpenedPRsResponse>(query, {
        searchQuery,
        cursor,
      });

      for (const pr of data.openedPRs.nodes) {
        if (pr.repository && pr.createdAt) {
          events.push({
            eventType: "pr_opened",
            eventDate: new Date(pr.createdAt),
            externalId: `${pr.repository.nameWithOwner}#${pr.number}-opened`,
            repo: pr.repository.nameWithOwner,
          });
        }
      }

      hasNextPage = data.openedPRs.pageInfo.hasNextPage;
      cursor = data.openedPRs.pageInfo.endCursor;

      if (events.length >= 1000) break;
    }

    return events;
  }

  /**
   * contributionsCollectionを使用して正確なレビュー数を取得
   * レビュー日（occurredAt）でフィルタリングするため、正確なデータを取得可能
   */
  private async fetchReviews(
    _username: string,
    _fromDate: string,
    _toDate: string,
    startDate: Date,
    endDate: Date
  ): Promise<GithubEvent[]> {
    const events: GithubEvent[] = [];

    // contributionsCollectionは最大1年間なので、期間を分割
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    let currentStart = new Date(startDate);

    while (currentStart < endDate) {
      const currentEnd = new Date(
        Math.min(currentStart.getTime() + oneYearMs, endDate.getTime())
      );

      let cursor: string | null = null;
      let hasNextPage = true;

      while (hasNextPage) {
        const query = `
          query ($from: DateTime!, $to: DateTime!, $cursor: String) {
            viewer {
              contributionsCollection(from: $from, to: $to) {
                pullRequestReviewContributions(first: 100, after: $cursor) {
                  totalCount
                  nodes {
                    occurredAt
                    pullRequestReview {
                      createdAt
                      pullRequest {
                        number
                        repository {
                          nameWithOwner
                        }
                      }
                    }
                  }
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                }
              }
            }
          }
        `;

        try {
          const data: PullRequestReviewContributionsResponse = await this.graphql<PullRequestReviewContributionsResponse>(query, {
            from: currentStart.toISOString(),
            to: currentEnd.toISOString(),
            cursor,
          });

          const contributions: PullRequestReviewContributionsResponse["viewer"]["contributionsCollection"]["pullRequestReviewContributions"] = data.viewer.contributionsCollection.pullRequestReviewContributions;

          for (const node of contributions.nodes) {
            if (node.pullRequestReview?.pullRequest?.repository) {
              const reviewDate = new Date(node.occurredAt);
              const pr = node.pullRequestReview.pullRequest;
              events.push({
                eventType: "review",
                eventDate: reviewDate,
                externalId: `${pr.repository.nameWithOwner}#${pr.number}-review-${reviewDate.toISOString()}`,
                repo: pr.repository.nameWithOwner,
              });
            }
          }

          hasNextPage = contributions.pageInfo.hasNextPage;
          cursor = contributions.pageInfo.endCursor;

          if (events.length >= 1000) {
            console.log(`[GitHubService] Reached 1000 reviews limit`);
            break;
          }
        } catch (error) {
          console.error(`[GitHubService] Error fetching review contributions:`, error);
          break;
        }
      }

      if (events.length >= 1000) break;
      currentStart = new Date(currentEnd.getTime() + 1);
    }

    return events;
  }

  private async fetchOpenedIssues(
    username: string,
    fromDate: string,
    toDate: string
  ): Promise<GithubEvent[]> {
    const events: GithubEvent[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const query = `
        query ($searchQuery: String!, $cursor: String) {
          openedIssues: search(
            query: $searchQuery
            type: ISSUE
            first: 100
            after: $cursor
          ) {
            issueCount
            nodes {
              ... on Issue {
                number
                createdAt
                repository {
                  nameWithOwner
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      const searchQuery = `is:issue author:${username} created:${fromDate}..${toDate}`;
      const data: SearchOpenedIssuesResponse = await this.graphql<SearchOpenedIssuesResponse>(query, {
        searchQuery,
        cursor,
      });

      for (const issue of data.openedIssues.nodes) {
        if (issue.repository && issue.createdAt) {
          events.push({
            eventType: "issue_opened",
            eventDate: new Date(issue.createdAt),
            externalId: `${issue.repository.nameWithOwner}#${issue.number}-opened`,
            repo: issue.repository.nameWithOwner,
          });
        }
      }

      hasNextPage = data.openedIssues.pageInfo.hasNextPage;
      cursor = data.openedIssues.pageInfo.endCursor;

      if (events.length >= 1000) break;
    }

    return events;
  }

  private async fetchClosedIssues(
    username: string,
    fromDate: string,
    toDate: string
  ): Promise<GithubEvent[]> {
    const events: GithubEvent[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const query = `
        query ($searchQuery: String!, $cursor: String) {
          closedIssues: search(
            query: $searchQuery
            type: ISSUE
            first: 100
            after: $cursor
          ) {
            issueCount
            nodes {
              ... on Issue {
                number
                closedAt
                repository {
                  nameWithOwner
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      // 自分がクローズしたIssue（assigneeまたはauthor）
      const searchQuery = `is:issue is:closed author:${username} closed:${fromDate}..${toDate}`;
      const data: SearchIssuesResponse = await this.graphql<SearchIssuesResponse>(query, {
        searchQuery,
        cursor,
      });

      for (const issue of data.closedIssues.nodes) {
        if (issue.repository && issue.closedAt) {
          events.push({
            eventType: "issue_closed",
            eventDate: new Date(issue.closedAt),
            externalId: `${issue.repository.nameWithOwner}#${issue.number}-closed`,
            repo: issue.repository.nameWithOwner,
          });
        }
      }

      hasNextPage = data.closedIssues.pageInfo.hasNextPage;
      cursor = data.closedIssues.pageInfo.endCursor;

      if (events.length >= 1000) break;
    }

    return events;
  }

  private async fetchCommitContributions(
    startDate: Date,
    endDate: Date
  ): Promise<GithubEvent[]> {
    const events: GithubEvent[] = [];

    // contributionsCollectionは最大1年間なので、期間を分割
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    let currentStart = new Date(startDate);

    while (currentStart < endDate) {
      const currentEnd = new Date(
        Math.min(currentStart.getTime() + oneYearMs, endDate.getTime())
      );

      const query = `
        query ($from: DateTime!, $to: DateTime!) {
          viewer {
            login
            contributionsCollection(from: $from, to: $to) {
              totalCommitContributions
              commitContributionsByRepository(maxRepositories: 100) {
                repository {
                  nameWithOwner
                }
                contributions {
                  totalCount
                }
              }
            }
          }
        }
      `;

      try {
        const data = await this.graphql<ContributionsCollectionResponse>(query, {
          from: currentStart.toISOString(),
          to: currentEnd.toISOString(),
        });

        // リポジトリごとのコミット数をイベントとして追加
        for (const repoContrib of data.viewer.contributionsCollection.commitContributionsByRepository) {
          if (repoContrib.contributions.totalCount > 0) {
            events.push({
              eventType: "commit",
              eventDate: currentStart, // 期間の開始日をイベント日とする
              externalId: `${repoContrib.repository.nameWithOwner}-commits-${currentStart.toISOString().split("T")[0]}`,
              repo: repoContrib.repository.nameWithOwner,
              commits: repoContrib.contributions.totalCount,
            });
          }
        }
      } catch (error) {
        console.error(`[GitHubService] Error fetching commit contributions:`, error);
      }

      currentStart = new Date(currentEnd.getTime() + 1);
    }

    return events;
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
