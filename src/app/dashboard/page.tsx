"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import { SummaryResponse } from "@/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Image from "next/image";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  AppBar,
  Toolbar,
  Alert,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LogoutIcon from "@mui/icons-material/Logout";
import LinkIcon from "@mui/icons-material/Link";

const emptySubscribe = () => () => {};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const fetchSummary = useCallback(async () => {
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
  }, [activeTab]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchSummary();
    }
  }, [session, fetchSummary]);

  if (!mounted || status === "loading") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.50",
        }}
      >
        <CircularProgress />
      </Box>
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

  const handleTabChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: "weekly" | "monthly" | null
  ) => {
    if (newValue !== null) {
      setActiveTab(newValue);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <AppBar position="static" sx={{ bgcolor: "white", boxShadow: 1 }}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: "bold", color: "grey.900" }}
          >
            Summarite
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ color: "grey.600" }}>
              {session.user?.name}
            </Typography>
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt="Avatar"
                width={32}
                height={32}
                style={{ borderRadius: "50%" }}
              />
            )}
            <Button
              size="small"
              startIcon={<LogoutIcon />}
              onClick={() => signOut()}
              sx={{ color: "grey.600" }}
            >
              ログアウト
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <ToggleButtonGroup
            value={activeTab}
            exclusive
            onChange={handleTabChange}
            size="small"
          >
            <ToggleButton value="weekly">週次レポート</ToggleButton>
            <ToggleButton value="monthly">月次レポート</ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="outlined"
            size="small"
            startIcon={<LinkIcon />}
            href="/api/connect/jira"
            sx={{ borderColor: "grey.300", color: "grey.700" }}
          >
            Jiraを連携
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {!loading && summary && (
          <>
            <Typography variant="body2" sx={{ color: "grey.500", mb: 3 }}>
              期間: {formatPeriod(summary.periodStart, summary.periodEnd)}
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card sx={{ boxShadow: 1, border: "1px solid", borderColor: "grey.200" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <GitHubIcon sx={{ mr: 1, color: "grey.700" }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        GitHub
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <MetricCard label="作成したPR" value={summary.github.prsOpened} />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <MetricCard label="マージしたPR" value={summary.github.prsMerged} />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <MetricCard label="レビュー" value={summary.github.reviews} />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <MetricCard label="作成したIssue" value={summary.github.issuesOpened} />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <MetricCard label="クローズしたIssue" value={summary.github.issuesClosed} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <Card sx={{ boxShadow: 1, border: "1px solid", borderColor: "grey.200" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <Box
                        component="svg"
                        sx={{ width: 24, height: 24, mr: 1, color: "grey.700" }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M11.571 11.429h-2.286v-2.286h2.286v2.286zm4.571 0h-2.286v-2.286h2.286v2.286zm4.572 0h-2.286v-2.286h2.286v2.286zm-9.143 4.571h-2.286v-2.286h2.286v2.286zm4.571 0h-2.286v-2.286h2.286v2.286zm4.572 0h-2.286v-2.286h2.286v2.286zm-9.143 4.572h-2.286v-2.286h2.286v2.286zm4.571 0h-2.286v-2.286h2.286v2.286zm4.572 0h-2.286v-2.286h2.286v2.286zm2.286-16h-2.286v2.857h-17.143v14.857h22.857v-17.714h-3.428zm1.143 16h-20.571v-12h20.571v12z" />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Jira
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <MetricCard label="作成" value={summary.jira.created} />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <MetricCard label="完了" value={summary.jira.done} />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <MetricCard label="進行中" value={summary.jira.inProgress} />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <MetricCard
                          label="停滞"
                          value={summary.jira.stalled}
                          color="warning"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card sx={{ boxShadow: 1, border: "1px solid", borderColor: "grey.200" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <AutoAwesomeIcon sx={{ mr: 1, color: "grey.700" }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    AI要約
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{ color: "grey.700", whiteSpace: "pre-wrap", lineHeight: 1.8 }}
                >
                  {summary.summary}
                </Typography>
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
}

function MetricCard({
  label,
  value,
  color = "primary",
}: {
  label: string;
  value: number;
  color?: "primary" | "warning" | "success" | "error";
}) {
  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: "grey.50",
        border: "1px solid",
        borderColor: "grey.100",
      }}
      elevation={0}
    >
      <Typography variant="body2" sx={{ color: "grey.500", mb: 0.5 }}>
        {label}
      </Typography>
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          color:
            color === "primary"
              ? "primary.main"
              : color === "warning"
              ? "warning.main"
              : color === "success"
              ? "success.main"
              : "error.main",
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}
