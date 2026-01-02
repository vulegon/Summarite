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
  // 前期間との比較用データ（weekly/monthlyのみ）
  previousGithub?: GithubMetrics;
  previousJira?: JiraMetrics;
  previousPeriodStart?: string;
  previousPeriodEnd?: string;
}


export interface Period {
  start: Date;
  end: Date;
  type: "weekly" | "monthly" | "custom";
}
