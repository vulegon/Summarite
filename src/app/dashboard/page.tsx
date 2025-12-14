"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import { GithubMetrics, JiraMetrics, AIProvider } from "@/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Popover,
  IconButton,
  Divider,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Tooltip,
} from "@mui/material";

interface MetricsData {
  github: GithubMetrics;
  jira: JiraMetrics;
  periodStart: string;
  periodEnd: string;
  periodType: "weekly" | "monthly" | "custom";
  hasSummary: boolean;
  summary?: string;
}
import GitHubIcon from "@mui/icons-material/GitHub";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LogoutIcon from "@mui/icons-material/Logout";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import AddLinkIcon from "@mui/icons-material/AddLink";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MergeIcon from "@mui/icons-material/Merge";
import RateReviewIcon from "@mui/icons-material/RateReview";
import BugReportIcon from "@mui/icons-material/BugReport";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import WarningIcon from "@mui/icons-material/Warning";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CommitIcon from "@mui/icons-material/Commit";
import RefreshIcon from "@mui/icons-material/Refresh";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { SummariteLogo } from "@/components/icons/SummariteLogo";

type SyncStatus = "idle" | "syncing" | "completed" | "failed";

const emptySubscribe = () => () => {};

// デフォルトの日付を計算（今日から1週間前）
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
  const [aiProvider, setAiProvider] = useState<AIProvider>("gemini");
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

  const generateSummary = async () => {
    if (!metrics) return;

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
          provider: aiProvider,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleProviderChange = (event: SelectChangeEvent) => {
    setAiProvider(event.target.value as AIProvider);
  };

  const handleDisconnect = async (provider: "github" | "jira") => {
    setDisconnecting(provider);
    try {
      const response = await fetch(`/api/connect/${provider}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to disconnect ${provider}`);
      }

      // ページをリロードしてセッション情報を更新
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setDisconnecting(null);
    }
  };

  // 同期状態を取得
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

  // 再取得ボタンのハンドラ（GitHub）
  const handleRefreshGitHub = async () => {
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
  };

  // 再取得ボタンのハンドラ（Jira）
  const handleRefreshJira = async () => {
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
  };

  // 同期状態をポーリング
  useEffect(() => {
    if (githubSyncStatus === "syncing" || jiraSyncStatus === "syncing") {
      const interval = setInterval(async () => {
        await fetchSyncStatus();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [githubSyncStatus, jiraSyncStatus, fetchSyncStatus]);

  // 同期完了時にメトリクスを再取得
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
          <Typography sx={{ color: "rgba(0,0,0,0.5)" }}>
            読み込み中...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!session) {
    return null;
  }

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${format(startDate, "M月d日", { locale: ja })} 〜 ${format(endDate, "M月d日", { locale: ja })}`;
  };

  const aiProviders = [
    { value: "gemini", label: "Gemini", description: "Google AI" },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    signOut();
  };

  const githubMetricsDisplay = [
    { label: "作成PR", value: metrics?.github.prsOpened ?? 0, icon: TrendingUpIcon, color: "#3b82f6" },
    { label: "マージPR", value: metrics?.github.prsMerged ?? 0, icon: MergeIcon, color: "#22c55e" },
    { label: "レビュー", value: metrics?.github.reviews ?? 0, icon: RateReviewIcon, color: "#a855f7" },
    { label: "コミット", value: metrics?.github.commits ?? 0, icon: CommitIcon, color: "#8b5cf6" },
    { label: "作成Issue", value: metrics?.github.issuesOpened ?? 0, icon: BugReportIcon, color: "#f97316" },
    { label: "完了Issue", value: metrics?.github.issuesClosed ?? 0, icon: CheckCircleIcon, color: "#06b6d4" },
  ];

  const codeChanges = {
    additions: metrics?.github.additions ?? 0,
    deletions: metrics?.github.deletions ?? 0,
  };

  const jiraMetricsDisplay = [
    { label: "作成", value: metrics?.jira.created ?? 0, icon: TrendingUpIcon, color: "#0052CC" },
    { label: "完了", value: metrics?.jira.done ?? 0, icon: CheckCircleIcon, color: "#22c55e" },
    { label: "進行中", value: metrics?.jira.inProgress ?? 0, icon: HourglassEmptyIcon, color: "#06b6d4" },
    { label: "停滞", value: metrics?.jira.stalled ?? 0, icon: WarningIcon, color: "#ef4444" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: { xs: 1.5, sm: 2 },
            }}
          >
            <Box
              component={Link}
              href="/"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, sm: 1.5 },
                textDecoration: "none",
              }}
            >
              <SummariteLogo size={32} />
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.2rem", sm: "1.5rem" },
                  color: "white",
                  display: { xs: "none", sm: "block" },
                }}
              >
                Summarite
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
              {/* GitHub連携状態 */}
              {session.user?.hasGithub ? (
                <Chip
                  icon={<GitHubIcon sx={{ fontSize: 16 }} />}
                  label="GitHub連携済"
                  size="small"
                  sx={{
                    bgcolor: "rgba(34, 197, 94, 0.2)",
                    color: "#4ade80",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    "& .MuiChip-icon": { color: "#4ade80" },
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    display: { xs: "none", sm: "flex" },
                  }}
                />
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<GitHubIcon />}
                  onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                  sx={{
                    borderColor: "rgba(255,255,255,0.3)",
                    color: "rgba(255,255,255,0.9)",
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 1.5, sm: 2 },
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.5)",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                    "& .MuiButton-startIcon": {
                      display: { xs: "none", sm: "inherit" },
                    },
                  }}
                >
                  GitHub連携
                </Button>
              )}

              {/* Jira連携状態 */}
              {session.user?.hasJira ? (
                <Chip
                  icon={<AssignmentIcon sx={{ fontSize: 16 }} />}
                  label="Jira連携済"
                  size="small"
                  sx={{
                    bgcolor: "rgba(0, 82, 204, 0.2)",
                    color: "#60a5fa",
                    border: "1px solid rgba(0, 82, 204, 0.3)",
                    "& .MuiChip-icon": { color: "#60a5fa" },
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    display: { xs: "none", sm: "flex" },
                  }}
                />
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddLinkIcon />}
                  href="/api/connect/jira"
                  sx={{
                    borderColor: "rgba(255,255,255,0.3)",
                    color: "rgba(255,255,255,0.9)",
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 1.5, sm: 2 },
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.5)",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                    "& .MuiButton-startIcon": {
                      display: { xs: "none", sm: "inherit" },
                    },
                  }}
                >
                  Jira連携
                </Button>
              )}

              <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="Avatar"
                    width={40}
                    height={40}
                    style={{
                      borderRadius: "50%",
                      border: "2px solid rgba(102, 126, 234, 0.5)",
                    }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    {session.user?.name?.charAt(0) || "U"}
                  </Avatar>
                )}
              </IconButton>

              <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleUserMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{ mt: 1 }}
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: "#1a1a2e",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 2,
                      minWidth: 240,
                      boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                    },
                  },
                }}
              >
                <Box sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="Avatar"
                        width={48}
                        height={48}
                        style={{ borderRadius: "50%" }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      >
                        {session.user?.name?.charAt(0) || "U"}
                      </Avatar>
                    )}
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: "white" }}>
                        {session.user?.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
                        {session.user?.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1.5 }} />
                  <Button
                    fullWidth
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      justifyContent: "flex-start",
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: "rgba(239, 68, 68, 0.15)",
                        color: "#f87171",
                      },
                    }}
                  >
                    ログアウト
                  </Button>
                </Box>
              </Popover>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        {/* Period Selection */}
        <Box sx={{ mb: { xs: 2, sm: 4 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                "& .MuiTabs-indicator": {
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  height: 3,
                  borderRadius: 2,
                },
                "& .MuiTab-root": {
                  color: "rgba(0,0,0,0.4)",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  minWidth: { xs: 60, sm: 100 },
                  px: { xs: 1.5, sm: 2 },
                  "&.Mui-selected": {
                    color: "#1a1a2e",
                  },
                },
              }}
            >
              <Tab label="週次" />
              <Tab label="月次" />
              <Tab label="カスタム" />
            </Tabs>

            {activeTab === 2 ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(0,0,0,0.2)",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />
                <Typography sx={{ color: "rgba(0,0,0,0.5)" }}>〜</Typography>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(0,0,0,0.2)",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={fetchMetrics}
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    textTransform: "none",
                    fontWeight: 600,
                    ml: 1,
                  }}
                >
                  取得
                </Button>
              </Box>
            ) : (
              metrics && (
                <Chip
                  icon={<CalendarTodayIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                  label={formatPeriod(metrics.periodStart, metrics.periodEnd)}
                  sx={{
                    bgcolor: "rgba(102, 126, 234, 0.1)",
                    color: "#667eea",
                    border: "1px solid rgba(102, 126, 234, 0.2)",
                    "& .MuiChip-icon": { color: "#667eea" },
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    fontWeight: 600,
                    py: 2,
                  }}
                />
              )
            )}
          </Box>
        </Box>

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
            {/* GitHub Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  bgcolor: "white",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: { xs: 2, sm: 4 },
                  overflow: "hidden",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  "&:hover": {
                    transform: { sm: "translateY(-4px)" },
                    boxShadow: { sm: "0 20px 40px rgba(0,0,0,0.1)" },
                  },
                }}
              >
                <Box
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: { xs: 32, sm: 40 },
                        height: { xs: 32, sm: 40 },
                        borderRadius: 2,
                        bgcolor: "#24292e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <GitHubIcon sx={{ color: "white", fontSize: { xs: 18, sm: 24 } }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                      GitHub
                    </Typography>
                    <Tooltip
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            データ取得について
                          </Typography>
                          <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                            • 過去3ヶ月分のデータが対象です
                          </Typography>
                          <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                            • コード変更量はマージ済みのPRから集計されます
                          </Typography>
                          <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                            • Organizationのプライベートリポジトリを取得するには、GitHubでアプリへのアクセス許可が必要です
                          </Typography>
                          <Typography variant="caption" component="div" sx={{ color: "rgba(255,255,255,0.7)", mt: 1 }}>
                            設定: github.com/settings/applications
                          </Typography>
                        </Box>
                      }
                      arrow
                      placement="bottom-start"
                    >
                      <HelpOutlineIcon
                        sx={{
                          fontSize: { xs: 16, sm: 18 },
                          color: "rgba(0,0,0,0.4)",
                          cursor: "help",
                          ml: 0.5,
                          "&:hover": { color: "#667eea" },
                        }}
                      />
                    </Tooltip>
                  </Box>
                  {session.user?.hasGithub && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {githubSyncedAt && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(0,0,0,0.4)",
                            fontSize: { xs: "0.6rem", sm: "0.7rem" },
                            display: { xs: "none", sm: "block" },
                          }}
                        >
                          {format(githubSyncedAt, "M/d HH:mm", { locale: ja })}更新
                        </Typography>
                      )}
                      <Button
                        size="small"
                        startIcon={
                          githubSyncStatus === "syncing" ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <RefreshIcon />
                          )
                        }
                        onClick={handleRefreshGitHub}
                        disabled={githubSyncStatus === "syncing"}
                        sx={{
                          color: githubSyncStatus === "syncing" ? "#667eea" : "rgba(0,0,0,0.5)",
                          textTransform: "none",
                          fontSize: { xs: "0.7rem", sm: "0.75rem" },
                          minWidth: "auto",
                          "&:hover": {
                            color: "#667eea",
                            bgcolor: "rgba(102, 126, 234, 0.08)",
                          },
                        }}
                      >
                        {githubSyncStatus === "syncing" ? "同期中..." : "再取得"}
                      </Button>
                      <Button
                        size="small"
                        startIcon={disconnecting === "github" ? <CircularProgress size={14} color="inherit" /> : <LinkOffIcon />}
                        onClick={() => handleDisconnect("github")}
                        disabled={disconnecting === "github"}
                        sx={{
                          color: "rgba(0,0,0,0.4)",
                          textTransform: "none",
                          fontSize: { xs: "0.7rem", sm: "0.75rem" },
                          "&:hover": {
                            color: "#ef4444",
                            bgcolor: "rgba(239, 68, 68, 0.08)",
                          },
                        }}
                      >
                        {disconnecting === "github" ? "解除中..." : "解除"}
                      </Button>
                    </Box>
                  )}
                </Box>
                <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                  {session.user?.hasGithub ? (
                    <>
                      {/* 同期中バナー */}
                      {githubSyncStatus === "syncing" && (
                        <Box
                          sx={{
                            mb: 2,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: "rgba(102, 126, 234, 0.1)",
                            border: "1px solid rgba(102, 126, 234, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1.5,
                          }}
                        >
                          <CircularProgress size={18} sx={{ color: "#667eea" }} />
                          <Typography
                            sx={{
                              color: "#667eea",
                              fontWeight: 600,
                              fontSize: { xs: "0.8rem", sm: "0.875rem" },
                            }}
                          >
                            GitHubからデータを取得中...
                          </Typography>
                        </Box>
                      )}
                      <Grid container spacing={{ xs: 1, sm: 2 }}>
                        {githubMetricsDisplay.map((metric) => (
                          <Grid size={{ xs: 6, sm: 4 }} key={metric.label}>
                            <MetricCard {...metric} />
                          </Grid>
                        ))}
                      </Grid>

                      {/* Code Changes Section */}
                      <Box
                        sx={{
                          mt: 2,
                          p: { xs: 1.5, sm: 2 },
                          borderRadius: 2,
                          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(239, 68, 68, 0.08) 100%)",
                          border: "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: "rgba(0,0,0,0.6)",
                            mb: 1.5,
                            fontWeight: 600,
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          }}
                        >
                          コード変更量
                        </Typography>
                        <Box sx={{ display: "flex", gap: { xs: 2, sm: 4 }, flexWrap: "wrap" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: 1,
                                bgcolor: "rgba(34, 197, 94, 0.15)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <AddIcon sx={{ fontSize: 16, color: "#22c55e" }} />
                            </Box>
                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  color: "#22c55e",
                                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                                  lineHeight: 1,
                                }}
                              >
                                +{codeChanges.additions.toLocaleString()}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "rgba(0,0,0,0.5)", fontSize: { xs: "0.65rem", sm: "0.7rem" } }}
                              >
                                追加行
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: 1,
                                bgcolor: "rgba(239, 68, 68, 0.15)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <RemoveIcon sx={{ fontSize: 16, color: "#ef4444" }} />
                            </Box>
                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  color: "#ef4444",
                                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                                  lineHeight: 1,
                                }}
                              >
                                -{codeChanges.deletions.toLocaleString()}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "rgba(0,0,0,0.5)", fontSize: { xs: "0.65rem", sm: "0.7rem" } }}
                              >
                                削除行
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto" }}>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                color: codeChanges.additions - codeChanges.deletions >= 0 ? "#22c55e" : "#ef4444",
                                fontSize: { xs: "0.9rem", sm: "1rem" },
                              }}
                            >
                              {codeChanges.additions - codeChanges.deletions >= 0 ? "+" : ""}
                              {(codeChanges.additions - codeChanges.deletions).toLocaleString()} 行
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "rgba(0,0,0,0.4)", fontSize: { xs: "0.65rem", sm: "0.7rem" } }}
                            >
                              純増減
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </>
                  ) : (
                    <Box
                      sx={{
                        textAlign: "center",
                        py: { xs: 4, sm: 6 },
                      }}
                    >
                      <GitHubIcon sx={{ fontSize: 48, color: "rgba(0,0,0,0.2)", mb: 2 }} />
                      <Typography
                        sx={{
                          color: "rgba(0,0,0,0.6)",
                          mb: 3,
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
                        GitHubと連携して開発活動を可視化しましょう
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<GitHubIcon />}
                        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                        sx={{
                          bgcolor: "#24292e",
                          textTransform: "none",
                          fontWeight: 600,
                          px: 4,
                          py: 1.5,
                          "&:hover": {
                            bgcolor: "#1a1a1a",
                          },
                        }}
                      >
                        GitHubと連携する
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Jira Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  bgcolor: "white",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: { xs: 2, sm: 4 },
                  overflow: "hidden",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  "&:hover": {
                    transform: { sm: "translateY(-4px)" },
                    boxShadow: { sm: "0 20px 40px rgba(0,0,0,0.1)" },
                  },
                }}
              >
                <Box
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: { xs: 32, sm: 40 },
                        height: { xs: 32, sm: 40 },
                        borderRadius: 2,
                        bgcolor: "#0052CC",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <AssignmentIcon sx={{ color: "white", fontSize: { xs: 18, sm: 24 } }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                      Jira
                    </Typography>
                    <Tooltip
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            各項目の集計条件
                          </Typography>
                          <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                            • 作成: 期間内に作成されたチケット
                          </Typography>
                          <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                            • 完了: 期間内に完了（Done）したチケット
                          </Typography>
                          <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                            • 進行中: 期間内に更新された進行中のチケット
                          </Typography>
                          <Typography variant="caption" component="div">
                            • 停滞: 期間より前に作成され未完了のチケット
                          </Typography>
                        </Box>
                      }
                      arrow
                      placement="bottom-start"
                    >
                      <HelpOutlineIcon
                        sx={{
                          fontSize: { xs: 16, sm: 18 },
                          color: "rgba(0,0,0,0.4)",
                          cursor: "help",
                          ml: 0.5,
                          "&:hover": { color: "#0052CC" },
                        }}
                      />
                    </Tooltip>
                  </Box>
                  {session.user?.hasJira && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {jiraSyncedAt && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(0,0,0,0.4)",
                            fontSize: { xs: "0.6rem", sm: "0.7rem" },
                            display: { xs: "none", sm: "block" },
                          }}
                        >
                          {format(jiraSyncedAt, "M/d HH:mm", { locale: ja })}更新
                        </Typography>
                      )}
                      <Button
                        size="small"
                        startIcon={
                          jiraSyncStatus === "syncing" ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <RefreshIcon />
                          )
                        }
                        onClick={handleRefreshJira}
                        disabled={jiraSyncStatus === "syncing"}
                        sx={{
                          color: jiraSyncStatus === "syncing" ? "#0052CC" : "rgba(0,0,0,0.5)",
                          textTransform: "none",
                          fontSize: { xs: "0.7rem", sm: "0.75rem" },
                          minWidth: "auto",
                          "&:hover": {
                            color: "#0052CC",
                            bgcolor: "rgba(0, 82, 204, 0.08)",
                          },
                        }}
                      >
                        {jiraSyncStatus === "syncing" ? "同期中..." : "再取得"}
                      </Button>
                      <Button
                        size="small"
                        startIcon={disconnecting === "jira" ? <CircularProgress size={14} color="inherit" /> : <LinkOffIcon />}
                        onClick={() => handleDisconnect("jira")}
                        disabled={disconnecting === "jira"}
                        sx={{
                          color: "rgba(0,0,0,0.4)",
                          textTransform: "none",
                          fontSize: { xs: "0.7rem", sm: "0.75rem" },
                          "&:hover": {
                            color: "#ef4444",
                            bgcolor: "rgba(239, 68, 68, 0.08)",
                          },
                        }}
                      >
                        {disconnecting === "jira" ? "解除中..." : "解除"}
                      </Button>
                    </Box>
                  )}
                </Box>
                <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                  {session.user?.hasJira ? (
                    <>
                      {/* 同期中バナー */}
                      {jiraSyncStatus === "syncing" && (
                        <Box
                          sx={{
                            mb: 2,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: "rgba(0, 82, 204, 0.1)",
                            border: "1px solid rgba(0, 82, 204, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1.5,
                          }}
                        >
                          <CircularProgress size={18} sx={{ color: "#0052CC" }} />
                          <Typography
                            sx={{
                              color: "#0052CC",
                              fontWeight: 600,
                              fontSize: { xs: "0.8rem", sm: "0.875rem" },
                            }}
                          >
                            Jiraからデータを取得中...
                          </Typography>
                        </Box>
                      )}
                      <Grid container spacing={{ xs: 1, sm: 2 }}>
                        {jiraMetricsDisplay.map((metric) => (
                          <Grid size={{ xs: 6, sm: 6 }} key={metric.label}>
                            <MetricCard {...metric} />
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  ) : (
                    <Box
                      sx={{
                        textAlign: "center",
                        py: { xs: 4, sm: 6 },
                      }}
                    >
                      <AssignmentIcon sx={{ fontSize: 48, color: "rgba(0,0,0,0.2)", mb: 2 }} />
                      <Typography
                        sx={{
                          color: "rgba(0,0,0,0.6)",
                          mb: 3,
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
                        Jiraと連携してタスク管理を可視化しましょう
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AssignmentIcon />}
                        href="/api/connect/jira"
                        sx={{
                          bgcolor: "#0052CC",
                          textTransform: "none",
                          fontWeight: 600,
                          px: 4,
                          py: 1.5,
                          "&:hover": {
                            bgcolor: "#0043a8",
                          },
                        }}
                      >
                        Jiraと連携する
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* AI Summary Card */}
            <Grid size={{ xs: 12 }}>
              <Card
                sx={{
                  bgcolor: "white",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: { xs: 2, sm: 4 },
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                  }}
                />
                <Box
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    display: "flex",
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: { xs: 32, sm: 40 },
                        height: { xs: 32, sm: 40 },
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <AutoAwesomeIcon sx={{ color: "white", fontSize: { xs: 18, sm: 24 } }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                        AI要約
                      </Typography>
                      <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.5)", fontSize: { xs: "0.65rem", sm: "0.75rem" } }}>
                        AIがメトリクスを分析して要約を生成します
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: { xs: "100%", sm: "auto" } }}>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <InputLabel id="ai-provider-label">AIモデル</InputLabel>
                      <Select
                        labelId="ai-provider-label"
                        value={aiProvider}
                        label="AIモデル"
                        onChange={handleProviderChange}
                        sx={{
                          bgcolor: "rgba(0,0,0,0.02)",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        {aiProviders.map((p) => (
                          <MenuItem key={p.value} value={p.value}>
                            {p.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      onClick={generateSummary}
                      disabled={summaryLoading}
                      startIcon={summaryLoading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
                      sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 3,
                        "&:hover": {
                          background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
                        },
                      }}
                    >
                      {summaryLoading ? "生成中..." : summary ? "再生成" : "要約を生成"}
                    </Button>
                  </Box>
                </Box>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  {summary ? (
                    <Typography
                      sx={{
                        color: "rgba(0,0,0,0.8)",
                        whiteSpace: "pre-wrap",
                        lineHeight: { xs: 1.8, sm: 2 },
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      }}
                    >
                      {summary}
                    </Typography>
                  ) : (
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 4,
                        color: "rgba(0,0,0,0.4)",
                      }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                      <Typography>
                        上のボタンをクリックしてAI要約を生成してください
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: { xs: 2, sm: 3 },
        bgcolor: "rgba(0,0,0,0.02)",
        border: "1px solid rgba(0,0,0,0.06)",
        transition: "all 0.2s",
        "&:hover": {
          bgcolor: "rgba(0,0,0,0.04)",
          borderColor: `${color}40`,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
        <Icon sx={{ fontSize: { xs: 14, sm: 18 }, color: color }} />
        <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.6)", fontSize: { xs: "0.7rem", sm: "0.875rem" } }}>
          {label}
        </Typography>
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: color,
          letterSpacing: "-0.02em",
          fontSize: { xs: "1.5rem", sm: "2rem" },
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
