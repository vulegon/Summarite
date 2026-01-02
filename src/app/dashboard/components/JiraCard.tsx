"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import AssignmentIcon from "@mui/icons-material/Assignment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import WarningIcon from "@mui/icons-material/Warning";
import RefreshIcon from "@mui/icons-material/Refresh";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { JiraMetrics } from "@/types";
import { MetricCard } from "./MetricCard";

type SyncStatus = "idle" | "syncing" | "completed" | "failed";

interface JiraCardProps {
  hasJira: boolean;
  metrics: JiraMetrics | null;
  initialSyncStatus: SyncStatus;
  initialSyncedAt?: string | null;
}

export function JiraCard({
  hasJira,
  metrics,
  initialSyncStatus,
  initialSyncedAt,
}: JiraCardProps) {
  const router = useRouter();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(initialSyncStatus);
  const [syncedAt, setSyncedAt] = useState<Date | null>(
    initialSyncedAt ? new Date(initialSyncedAt) : null
  );
  const [disconnecting, setDisconnecting] = useState(false);

  const jiraMetricsDisplay = [
    { label: "作成", value: metrics?.created ?? 0, icon: TrendingUpIcon, color: "#0052CC" },
    { label: "完了", value: metrics?.done ?? 0, icon: CheckCircleIcon, color: "#22c55e" },
    { label: "進行中", value: metrics?.inProgress ?? 0, icon: HourglassEmptyIcon, color: "#06b6d4" },
    { label: "停滞", value: metrics?.stalled ?? 0, icon: WarningIcon, color: "#ef4444" },
  ];

  const fetchSyncStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/metrics/status");
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data.jira.status);
        setSyncedAt(data.jira.syncedAt ? new Date(data.jira.syncedAt) : null);
      }
    } catch (err) {
      console.error("Failed to fetch sync status:", err);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      const response = await fetch("/api/metrics/jira-sync", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to start Jira sync");
      }

      setSyncStatus("syncing");
    } catch (err) {
      console.error("Sync error:", err);
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    setDisconnecting(true);
    try {
      const response = await fetch("/api/connect/jira", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect Jira");
      }

      window.location.reload();
    } catch (err) {
      console.error("Disconnect error:", err);
      setDisconnecting(false);
    }
  }, []);

  // 初回表示時（まだ一度もsyncしていない場合）に自動でsyncを開始
  useEffect(() => {
    if (hasJira && initialSyncStatus === "idle" && !initialSyncedAt) {
      handleRefresh();
    }
  }, [hasJira, initialSyncStatus, initialSyncedAt, handleRefresh]);

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
              bgcolor: "#0052CC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AssignmentIcon sx={{ color: "white", fontSize: { xs: 18, sm: 24 } }} />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            Jira
          </Typography>
          <Tooltip
            title={
              <Box sx={{ p: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  各項目の集計条件（自分が担当のチケットのみ）
                </Typography>
                <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                  • 作成: 期間内に作成された自分担当のチケット
                </Typography>
                <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                  • 完了: 期間内に完了（Done）した自分担当のチケット
                </Typography>
                <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                  • 進行中: 期間内に更新された自分担当の進行中チケット
                </Typography>
                <Typography variant="caption" component="div">
                  • 停滞: 期間より前に作成され未完了の自分担当チケット
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
        {hasJira && (
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
                color: syncStatus === "syncing" ? "#0052CC" : "rgba(0,0,0,0.5)",
                textTransform: "none",
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                minWidth: "auto",
                "&:hover": {
                  color: "#0052CC",
                  bgcolor: "rgba(0, 82, 204, 0.08)",
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
        {hasJira ? (
          <>
            {syncStatus === "syncing" && (
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
  );
}
