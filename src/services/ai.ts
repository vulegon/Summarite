import { GoogleGenerativeAI } from "@google/generative-ai";
import { GithubMetrics, JiraMetrics } from "@/types";

interface GenerateSummaryOptions {
  github: GithubMetrics;
  jira: JiraMetrics;
  periodType: "weekly" | "monthly";
  hasGithub: boolean;
  hasJira: boolean;
  // 前期間との比較用データ（weekly/monthlyのみ）
  previousGithub?: GithubMetrics;
  previousJira?: JiraMetrics;
}

function formatChange(current: number, previous: number): string {
  const diff = current - previous;
  const sign = diff >= 0 ? "+" : "";
  if (previous === 0) {
    return diff === 0 ? "±0" : `${sign}${diff}`;
  }
  const percent = Math.round((diff / previous) * 100);
  return `${sign}${diff} (${sign}${percent}%)`;
}

function buildPrompt(options: GenerateSummaryOptions): string {
  const { github, jira, periodType, hasGithub, hasJira, previousGithub, previousJira } = options;
  const periodLabel = periodType === "weekly" ? "週次" : "月次";
  const previousPeriodLabel = periodType === "weekly" ? "前週" : "前月";
  const hasPreviousData = previousGithub || previousJira;

  let metricsSection = "";

  if (hasGithub) {
    metricsSection += `
## GitHub メトリクス（今期）
- 作成したPR数: ${github.prsOpened}
- マージされたPR数: ${github.prsMerged}
- レビュー数: ${github.reviews}
- 作成したIssue数: ${github.issuesOpened}
- クローズしたIssue数: ${github.issuesClosed}
- コミット数: ${github.commits}
- 追加行数: ${github.additions.toLocaleString()}行
- 削除行数: ${github.deletions.toLocaleString()}行
`;

    if (previousGithub) {
      metricsSection += `
## GitHub メトリクス（${previousPeriodLabel}との比較）
- 作成したPR数: ${formatChange(github.prsOpened, previousGithub.prsOpened)}
- マージされたPR数: ${formatChange(github.prsMerged, previousGithub.prsMerged)}
- レビュー数: ${formatChange(github.reviews, previousGithub.reviews)}
- 作成したIssue数: ${formatChange(github.issuesOpened, previousGithub.issuesOpened)}
- クローズしたIssue数: ${formatChange(github.issuesClosed, previousGithub.issuesClosed)}
- コミット数: ${formatChange(github.commits, previousGithub.commits)}
- 追加行数: ${formatChange(github.additions, previousGithub.additions)}
- 削除行数: ${formatChange(github.deletions, previousGithub.deletions)}
`;
    }
  }

  if (hasJira) {
    metricsSection += `
## Jira メトリクス（今期）
- 作成したチケット数: ${jira.created}
- 完了したチケット数: ${jira.done}
- 進行中のチケット数: ${jira.inProgress}
- 停滞しているチケット数: ${jira.stalled}
`;

    if (previousJira) {
      metricsSection += `
## Jira メトリクス（${previousPeriodLabel}との比較）
- 作成したチケット数: ${formatChange(jira.created, previousJira.created)}
- 完了したチケット数: ${formatChange(jira.done, previousJira.done)}
- 進行中のチケット数: ${formatChange(jira.inProgress, previousJira.inProgress)}
- 停滞しているチケット数: ${formatChange(jira.stalled, previousJira.stalled)}
`;
    }
  }

  const comparisonInstruction = hasPreviousData
    ? `\n## ${previousPeriodLabel}との比較\n（${previousPeriodLabel}と比較して顕著な変化があれば、その傾向と考えられる理由を記載）\n`
    : "";

  return `以下はあなたの${periodLabel}活動データです。このデータを分析し、成果と改善点を簡潔に要約してください。
${metricsSection}
以下のマークダウン形式で要約を作成してください。

## 今期の主な成果
（ここに2-3文で成果を記載）

## 注目すべきポイント
（ここにポジティブな点を箇条書きで記載）
${comparisonInstruction}
## 改善が必要な領域
（ここに改善点があれば箇条書きで記載、なければ「特になし」）

## 次期に向けた提案
（ここに提案を箇条書きで記載）

日本語で、簡潔かつ建設的なトーンで回答してください。`;
}

export async function generateSummary(
  options: GenerateSummaryOptions
): Promise<{ summary: string; model: string }> {
  const prompt = buildPrompt(options);
  return generateWithGemini(prompt);
}

async function generateWithGemini(
  prompt: string
): Promise<{ summary: string; model: string }> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEYが設定されていません");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemPrompt =
    "あなたは個人の開発パフォーマンスアナリストです。データに基づいた建設的なフィードバックを提供します。";

  const result = await model.generateContent(`${systemPrompt}\n\n${prompt}`);
  const response = result.response;

  return {
    summary: response.text() || "要約を生成できませんでした",
    model: "gemini-2.5-flash",
  };
}
