export interface GithubMetrics {
  prsOpened: number;
  prsMerged: number;
  reviews: number;
  issuesOpened: number;
  issuesClosed: number;
  additions: number;
  deletions: number;
  commits: number;
}

export interface JiraMetrics {
  created: number;
  done: number;
  inProgress: number;
  stalled: number;
}

export interface SummaryResponse {
  github: GithubMetrics;
  jira: JiraMetrics;
  summary: string;
  periodStart: string;
  periodEnd: string;
  periodType: "weekly" | "monthly";
}

export type AIProvider = "openai" | "anthropic" | "gemini";

export interface Period {
  start: Date;
  end: Date;
  type: "weekly" | "monthly" | "custom";
}
