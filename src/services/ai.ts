import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GithubMetrics, JiraMetrics, AIProvider } from "@/types";

function buildPrompt(
  github: GithubMetrics,
  jira: JiraMetrics,
  periodType: "weekly" | "monthly"
): string {
  const periodLabel = periodType === "weekly" ? "週次" : "月次";

  return `以下は開発チームの${periodLabel}活動データです。このデータを分析し、チームの成果と改善点を簡潔に要約してください。

## GitHub メトリクス
- 作成したPR数: ${github.prsOpened}
- マージされたPR数: ${github.prsMerged}
- レビュー数: ${github.reviews}
- 作成したIssue数: ${github.issuesOpened}
- クローズしたIssue数: ${github.issuesClosed}
- コミット数: ${github.commits}
- 追加行数: ${github.additions.toLocaleString()}行
- 削除行数: ${github.deletions.toLocaleString()}行

## Jira メトリクス
- 作成したチケット数: ${jira.created}
- 完了したチケット数: ${jira.done}
- 進行中のチケット数: ${jira.inProgress}
- 停滞しているチケット数: ${jira.stalled}

以下の形式で要約を作成してください：
1. 今期の主な成果（2-3文）
2. 注目すべきポイント（ポジティブな点）
3. 改善が必要な領域（もしあれば）
4. 次期に向けた提案

日本語で、簡潔かつ建設的なトーンで回答してください。`;
}

export async function generateSummary(
  github: GithubMetrics,
  jira: JiraMetrics,
  periodType: "weekly" | "monthly",
  provider?: AIProvider
): Promise<{ summary: string; model: string }> {
  const selectedProvider = provider || (process.env.AI_PROVIDER as AIProvider) || "gemini";
  const prompt = buildPrompt(github, jira, periodType);

  if (selectedProvider === "openai") {
    return generateWithOpenAI(prompt);
  } else if (selectedProvider === "anthropic") {
    return generateWithAnthropic(prompt);
  } else {
    return generateWithGemini(prompt);
  }
}

async function generateWithOpenAI(
  prompt: string
): Promise<{ summary: string; model: string }> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "あなたは開発チームのパフォーマンスアナリストです。データに基づいた建設的なフィードバックを提供します。",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 1000,
    temperature: 0.7,
  });

  return {
    summary: response.choices[0]?.message?.content || "要約を生成できませんでした",
    model: "gpt-4-turbo-preview",
  };
}

async function generateWithAnthropic(
  prompt: string
): Promise<{ summary: string; model: string }> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    system:
      "あなたは開発チームのパフォーマンスアナリストです。データに基づいた建設的なフィードバックを提供します。",
  });

  const textContent = response.content.find((c) => c.type === "text");
  return {
    summary:
      textContent && "text" in textContent
        ? textContent.text
        : "要約を生成できませんでした",
    model: "claude-3-5-sonnet",
  };
}

async function generateWithGemini(
  prompt: string
): Promise<{ summary: string; model: string }> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemPrompt =
    "あなたは開発チームのパフォーマンスアナリストです。データに基づいた建設的なフィードバックを提供します。";

  const result = await model.generateContent(`${systemPrompt}\n\n${prompt}`);
  const response = result.response;

  return {
    summary: response.text() || "要約を生成できませんでした",
    model: "gemini-1.5-flash",
  };
}
