"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import { GithubMetrics, JiraMetrics } from "@/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Box, Container, CircularProgress, Typography, Card, CardContent, Grid, SelectChangeEvent } from "@mui/material";
import { DashboardHeader } from "./components/DashboardHeader";
import { PeriodSelector } from "./components/PeriodSelector";
import { GitHubCard } from "./components/GitHubCard";
import { JiraCard } from "./components/JiraCard";
import { AISummaryCard } from "./components/AISummaryCard";

interface MetricsData {
  github: GithubMetrics;
  jira: JiraMetrics;
  periodStart: string;
  periodEnd: string;
  periodType: "weekly" | "monthly" | "custom";
  hasSummary: boolean;
  summary?: string;
}

type SyncStatus = "idle" | "syncing" | "completed" | "failed";

const emptySubscribe = () => () => {};

const getDefaultDates = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [aiModel, setAiModel] = useState("gemini-2.5-flash");
  const [disconnecting, setDisconnecting] = useState<"github" | "jira" | null>(null);
  const [githubSyncStatus, setGithubSyncStatus] = useState<SyncStatus>("idle");
  const [githubSyncedAt, setGithubSyncedAt] = useState<Date | null>(null);
  const [jiraSyncStatus, setJiraSyncStatus] = useState<SyncStatus>("idle");
  const [jiraSyncedAt, setJiraSyncedAt] = useState<Date | null>(null);
  const [customStartDate, setCustomStartDate] = useState(getDefaultDates().start);
  const [customEndDate, setCustomEndDate] = useState(getDefaultDates().end);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const periodType = activeTab === 0 ? "weekly" : activeTab === 1 ? "monthly" : "custom";

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint: string;
      if (periodType === "weekly") {
        endpoint = "/api/metrics/weekly";
      } else if (periodType === "monthly") {
        endpoint = "/api/metrics/monthly";
      } else {
        endpoint = `/api/metrics/custom?startDate=${customStartDate}&endDate=${customEndDate}`;
      }
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error("Failed to fetch metrics");
      }

      const data: MetricsData = await response.json();
      setMetrics(data);
      if (data.hasSummary && data.summary) {
        setSummary(data.summary);
      } else {
        setSummary(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [periodType, customStartDate, customEndDate]);

  const hasGithub = !!session?.user?.hasGithub;
  const hasJira = !!session?.user?.hasJira;
  const canGenerateSummary = hasGithub || hasJira;

  const generateSummary = useCallback(async () => {
    if (!metrics || !canGenerateSummary) return;

    setSummaryLoading(true);
    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github: metrics.github,
          jira: metrics.jira,
          periodType: metrics.periodType,
          periodStart: metrics.periodStart,
          periodEnd: metrics.periodEnd,
          hasGithub,
          hasJira,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate summary");
      }

      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSummaryLoading(false);
    }
  }, [metrics, canGenerateSummary, hasGithub, hasJira]);

  const handleDisconnect = useCallback(async (provider: "github" | "jira") => {
    setDisconnecting(provider);
    try {
      const response = await fetch(`/api/connect/${provider}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to disconnect ${provider}`);
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setDisconnecting(null);
    }
  }, []);

  const fetchSyncStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/metrics/status");
      if (response.ok) {
        const data = await response.json();
        setGithubSyncStatus(data.github.status);
        setGithubSyncedAt(data.github.syncedAt ? new Date(data.github.syncedAt) : null);
        setJiraSyncStatus(data.jira.status);
        setJiraSyncedAt(data.jira.syncedAt ? new Date(data.jira.syncedAt) : null);
      }
    } catch (err) {
      console.error("Failed to fetch sync status:", err);
    }
  }, []);

  const handleRefreshGitHub = useCallback(async () => {
    try {
      const response = await fetch("/api/metrics/sync", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to start sync");
      }

      setGithubSyncStatus("syncing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }, []);

  const handleRefreshJira = useCallback(async () => {
    try {
      const response = await fetch("/api/metrics/jira-sync", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to start Jira sync");
      }

      setJiraSyncStatus("syncing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }, []);

  useEffect(() => {
    if (githubSyncStatus === "syncing" || jiraSyncStatus === "syncing") {
      const interval = setInterval(async () => {
        await fetchSyncStatus();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [githubSyncStatus, jiraSyncStatus, fetchSyncStatus]);

  useEffect(() => {
    if (githubSyncStatus === "completed" || jiraSyncStatus === "completed") {
      fetchMetrics();
    }
  }, [githubSyncStatus, jiraSyncStatus, fetchMetrics]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchMetrics();
      fetchSyncStatus();
    }
  }, [session, fetchMetrics, fetchSyncStatus]);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const handleUserMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleUserMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleModelChange = useCallback((event: SelectChangeEvent) => {
    setAiModel(event.target.value);
  }, []);

  const formatPeriod = useCallback((start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${format(startDate, "M月d日", { locale: ja })} 〜 ${format(endDate, "M月d日", { locale: ja })}`;
  }, []);

  if (!mounted || status === "loading") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: "#667eea", mb: 2 }} />
          <Typography sx={{ color: "rgba(0,0,0,0.5)" }}>読み込み中...</Typography>
        </Box>
      </Box>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
      }}
    >
      <DashboardHeader
        user={{
          name: session.user?.name,
          email: session.user?.email,
          image: session.user?.image,
          hasGithub: session.user?.hasGithub,
          hasJira: session.user?.hasJira,
        }}
        anchorEl={anchorEl}
        onUserMenuOpen={handleUserMenuOpen}
        onUserMenuClose={handleUserMenuClose}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <PeriodSelector
          activeTab={activeTab}
          onTabChange={handleTabChange}
          periodStart={metrics?.periodStart}
          periodEnd={metrics?.periodEnd}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomStartDateChange={setCustomStartDate}
          onCustomEndDateChange={setCustomEndDate}
          onFetchMetrics={fetchMetrics}
          formatPeriod={formatPeriod}
        />

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
            <CircularProgress sx={{ color: "#667eea" }} />
          </Box>
        )}

        {error && (
          <Card
            sx={{
              bgcolor: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: 3,
              mb: 4,
            }}
          >
            <CardContent>
              <Typography sx={{ color: "#dc2626" }}>{error}</Typography>
            </CardContent>
          </Card>
        )}

        {!loading && metrics && (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <GitHubCard
                hasGithub={hasGithub}
                metrics={metrics.github}
                syncStatus={githubSyncStatus}
                syncedAt={githubSyncedAt}
                disconnecting={disconnecting === "github"}
                onRefresh={handleRefreshGitHub}
                onDisconnect={() => handleDisconnect("github")}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <JiraCard
                hasJira={hasJira}
                metrics={metrics.jira}
                syncStatus={jiraSyncStatus}
                syncedAt={jiraSyncedAt}
                disconnecting={disconnecting === "jira"}
                onRefresh={handleRefreshJira}
                onDisconnect={() => handleDisconnect("jira")}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <AISummaryCard
                summary={summary}
                summaryLoading={summaryLoading}
                canGenerateSummary={canGenerateSummary}
                aiModel={aiModel}
                onModelChange={handleModelChange}
                onGenerateSummary={generateSummary}
              />
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}
