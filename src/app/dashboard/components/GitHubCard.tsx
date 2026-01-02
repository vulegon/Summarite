"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MergeIcon from "@mui/icons-material/Merge";
import RateReviewIcon from "@mui/icons-material/RateReview";
import BugReportIcon from "@mui/icons-material/BugReport";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CommitIcon from "@mui/icons-material/Commit";
import RefreshIcon from "@mui/icons-material/Refresh";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { GithubMetrics } from "@/types";
import { MetricCard } from "./MetricCard";

type SyncStatus = "idle" | "syncing" | "completed" | "failed";

interface GitHubCardProps {
  hasGithub: boolean;
  metrics: GithubMetrics | null;
  initialSyncStatus: SyncStatus;
  initialSyncedAt?: string | null;
}

export function GitHubCard({
  hasGithub,
  metrics,
  initialSyncStatus,
  initialSyncedAt,
}: GitHubCardProps) {
  const router = useRouter();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(initialSyncStatus);
  const [syncedAt, setSyncedAt] = useState<Date | null>(
    initialSyncedAt ? new Date(initialSyncedAt) : null
  );
  const [disconnecting, setDisconnecting] = useState(false);

  const githubMetricsDisplay = [
    { label: "作成PR", value: metrics?.prsOpened ?? 0, icon: TrendingUpIcon, color: "#3b82f6" },
    { label: "マージPR", value: metrics?.prsMerged ?? 0, icon: MergeIcon, color: "#22c55e" },
    { label: "レビュー", value: metrics?.reviews ?? 0, icon: RateReviewIcon, color: "#a855f7" },
    { label: "コミット", value: metrics?.commits ?? 0, icon: CommitIcon, color: "#8b5cf6" },
    { label: "作成Issue", value: metrics?.issuesOpened ?? 0, icon: BugReportIcon, color: "#f97316" },
    { label: "完了Issue", value: metrics?.issuesClosed ?? 0, icon: CheckCircleIcon, color: "#06b6d4" },
  ];

  const codeChanges = {
    additions: metrics?.additions ?? 0,
    deletions: metrics?.deletions ?? 0,
  };

  const fetchSyncStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/metrics/status");
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data.github.status);
        setSyncedAt(data.github.syncedAt ? new Date(data.github.syncedAt) : null);
      }
    } catch (err) {
      console.error("Failed to fetch sync status:", err);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      const response = await fetch("/api/metrics/sync", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to start sync");
      }

      setSyncStatus("syncing");
    } catch (err) {
      console.error("Sync error:", err);
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    setDisconnecting(true);
    try {
      const response = await fetch("/api/connect/github", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect GitHub");
      }

      window.location.reload();
    } catch (err) {
      console.error("Disconnect error:", err);
      setDisconnecting(false);
    }
  }, []);

  // 初回表示時（まだ一度もsyncしていない場合）に自動でsyncを開始
  useEffect(() => {
    if (hasGithub && initialSyncStatus === "idle" && !initialSyncedAt) {
      handleRefresh();
    }
  }, [hasGithub, initialSyncStatus, initialSyncedAt, handleRefresh]);

  useEffect(() => {
    if (syncStatus === "syncing") {
      const interval = setInterval(fetchSyncStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [syncStatus, fetchSyncStatus]);

  useEffect(() => {
    if (syncStatus === "completed") {
      router.refresh();
    }
  }, [syncStatus, router]);

  return (
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
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
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
                <Typography
                  variant="caption"
                  component="div"
                  sx={{ color: "rgba(255,255,255,0.7)", mt: 1 }}
                >
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
        {hasGithub && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {syncedAt && (
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(0,0,0,0.4)",
                  fontSize: { xs: "0.6rem", sm: "0.7rem" },
                  display: { xs: "none", sm: "block" },
                }}
              >
                {format(syncedAt, "M/d HH:mm", { locale: ja })}更新
              </Typography>
            )}
            <Button
              size="small"
              startIcon={
                syncStatus === "syncing" ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <RefreshIcon />
                )
              }
              onClick={handleRefresh}
              disabled={syncStatus === "syncing"}
              sx={{
                color: syncStatus === "syncing" ? "#667eea" : "rgba(0,0,0,0.5)",
                textTransform: "none",
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                minWidth: "auto",
                "&:hover": {
                  color: "#667eea",
                  bgcolor: "rgba(102, 126, 234, 0.08)",
                },
              }}
            >
              {syncStatus === "syncing" ? "同期中..." : "再取得"}
            </Button>
            <Button
              size="small"
              startIcon={
                disconnecting ? <CircularProgress size={14} color="inherit" /> : <LinkOffIcon />
              }
              onClick={handleDisconnect}
              disabled={disconnecting}
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
              {disconnecting ? "解除中..." : "解除"}
            </Button>
          </Box>
        )}
      </Box>
      <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        {hasGithub ? (
          <>
            {syncStatus === "syncing" && (
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

            <Box
              sx={{
                mt: 2,
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                background:
                  "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(239, 68, 68, 0.08) 100%)",
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
                      color:
                        codeChanges.additions - codeChanges.deletions >= 0 ? "#22c55e" : "#ef4444",
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
  );
}
