"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SummaryResponse } from "@/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchSummary();
    }
  }, [session, activeTab]);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = activeTab === "weekly"
        ? "/api/summary/weekly"
        : "/api/summary/monthly";
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error("Failed to fetch summary");
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${format(startDate, "yyyy/MM/dd", { locale: ja })} - ${format(endDate, "yyyy/MM/dd", { locale: ja })}`;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Summarite</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-sm">{session.user?.name}</span>
            {session.user?.image && (
              <img
                src={session.user.image}
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
            )}
            <button
              onClick={() => signOut()}
              className="text-gray-400 hover:text-white text-sm"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("weekly")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "weekly"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              週次レポート
            </button>
            <button
              onClick={() => setActiveTab("monthly")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "monthly"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              月次レポート
            </button>
          </div>
          <a
            href="/api/connect/jira"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm border border-gray-600"
          >
            Jiraを連携
          </a>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-300">
            {error}
          </div>
        )}

        {!loading && summary && (
          <>
            <div className="text-gray-400 mb-6">
              期間: {formatPeriod(summary.periodStart, summary.periodEnd)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard label="作成したPR" value={summary.github.prsOpened} />
                  <MetricCard label="マージしたPR" value={summary.github.prsMerged} />
                  <MetricCard label="レビュー" value={summary.github.reviews} />
                  <MetricCard label="作成したIssue" value={summary.github.issuesOpened} />
                  <MetricCard label="クローズしたIssue" value={summary.github.issuesClosed} />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.571 11.429h-2.286v-2.286h2.286v2.286zm4.571 0h-2.286v-2.286h2.286v2.286zm4.572 0h-2.286v-2.286h2.286v2.286zm-9.143 4.571h-2.286v-2.286h2.286v2.286zm4.571 0h-2.286v-2.286h2.286v2.286zm4.572 0h-2.286v-2.286h2.286v2.286zm-9.143 4.572h-2.286v-2.286h2.286v2.286zm4.571 0h-2.286v-2.286h2.286v2.286zm4.572 0h-2.286v-2.286h2.286v2.286zm2.286-16h-2.286v2.857h-17.143v14.857h22.857v-17.714h-3.428zm1.143 16h-20.571v-12h20.571v12z"/>
                  </svg>
                  Jira
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard label="作成" value={summary.jira.created} />
                  <MetricCard label="完了" value={summary.jira.done} />
                  <MetricCard label="進行中" value={summary.jira.inProgress} />
                  <MetricCard label="停滞" value={summary.jira.stalled} color="yellow" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI要約
              </h2>
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {summary.summary}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color = "blue",
}: {
  label: string;
  value: number;
  color?: "blue" | "yellow" | "green" | "red";
}) {
  const colorClasses = {
    blue: "text-blue-400",
    yellow: "text-yellow-400",
    green: "text-green-400",
    red: "text-red-400",
  };

  return (
    <div className="bg-gray-700/50 rounded-lg p-4">
      <div className="text-gray-400 text-sm mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
    </div>
  );
}
