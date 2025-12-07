"use client";

import { useSession, signOut } from "next-auth/react";
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
} from "@mui/material";

interface MetricsData {
  github: GithubMetrics;
  jira: JiraMetrics;
  periodStart: string;
  periodEnd: string;
  periodType: "weekly" | "monthly";
  hasSummary: boolean;
  summary?: string;
}
import GitHubIcon from "@mui/icons-material/GitHub";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LogoutIcon from "@mui/icons-material/Logout";
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
import { SummariteLogo } from "@/components/icons/SummariteLogo";

const emptySubscribe = () => () => {};

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
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const periodType = activeTab === 0 ? "weekly" : "monthly";

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = periodType === "weekly"
        ? "/api/metrics/weekly"
        : "/api/metrics/monthly";
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
  }, [periodType]);

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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchMetrics();
    }
  }, [session, fetchMetrics]);

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
    { value: "gemini", label: "Gemini (無料)", description: "Google AI" },
    { value: "anthropic", label: "Claude", description: "Anthropic" },
    { value: "openai", label: "GPT-4", description: "OpenAI" },
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
        {/* Title Section */}
        <Box sx={{ mb: { xs: 2, sm: 4 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: { xs: 1, sm: 2 },
              mb: 2,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "#1a1a2e",
                letterSpacing: "-0.02em",
                fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3rem" },
              }}
            >
              ダッシュボード
            </Typography>
            {metrics && (
              <Chip
                icon={<CalendarTodayIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                label={formatPeriod(metrics.periodStart, metrics.periodEnd)}
                size="small"
                sx={{
                  bgcolor: "rgba(102, 126, 234, 0.1)",
                  color: "#667eea",
                  border: "1px solid rgba(102, 126, 234, 0.2)",
                  "& .MuiChip-icon": { color: "#667eea" },
                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                }}
              />
            )}
          </Box>

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
          </Tabs>
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
                    gap: 1.5,
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
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
                </Box>
                <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
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
                    gap: 1.5,
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
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
                </Box>
                <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                  <Grid container spacing={{ xs: 1, sm: 2 }}>
                    {jiraMetricsDisplay.map((metric) => (
                      <Grid size={{ xs: 6, sm: 6 }} key={metric.label}>
                        <MetricCard {...metric} />
                      </Grid>
                    ))}
                  </Grid>
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
