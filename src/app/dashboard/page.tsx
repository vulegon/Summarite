import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Box, Container, Typography, Card, CardContent, Grid } from "@mui/material";
import { getMetrics, getSyncStatus, PeriodType } from "./actions";
import { DashboardHeader } from "./components/DashboardHeader";
import { PeriodSelector } from "./components/PeriodSelector";
import { GitHubCard } from "./components/GitHubCard";
import { JiraCard } from "./components/JiraCard";
import { AISummaryCard } from "./components/AISummaryCard";

interface DashboardPageProps {
  searchParams: Promise<{
    period?: string;
    start?: string;
    end?: string;
  }>;
}

export default async function Dashboard({ searchParams }: DashboardPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const params = await searchParams;
  const periodType = (params.period ?? "weekly") as PeriodType;
  const customStart = params.start;
  const customEnd = params.end;

  const [metrics, syncStatus] = await Promise.all([
    getMetrics(periodType, customStart, customEnd),
    getSyncStatus(),
  ]);

  const hasGithub = !!session.user?.hasGithub;
  const hasJira = !!session.user?.hasJira;

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
          hasGithub,
          hasJira,
        }}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <PeriodSelector
          currentPeriod={periodType}
          periodStart={metrics?.periodStart}
          periodEnd={metrics?.periodEnd}
          customStart={customStart}
          customEnd={customEnd}
        />

        {!metrics && (
          <Card
            sx={{
              bgcolor: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: 3,
              mb: 4,
            }}
          >
            <CardContent>
              <Typography sx={{ color: "#dc2626" }}>
                メトリクスの取得に失敗しました
              </Typography>
            </CardContent>
          </Card>
        )}

        {metrics && (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <GitHubCard
                hasGithub={hasGithub}
                metrics={metrics.github}
                initialSyncStatus={syncStatus?.github.status ?? "idle"}
                initialSyncedAt={syncStatus?.github.syncedAt}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <JiraCard
                hasJira={hasJira}
                metrics={metrics.jira}
                initialSyncStatus={syncStatus?.jira.status ?? "idle"}
                initialSyncedAt={syncStatus?.jira.syncedAt}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <AISummaryCard
                initialSummary={metrics.summary ?? null}
                canGenerateSummary={hasGithub || hasJira}
                metrics={metrics}
                hasGithub={hasGithub}
                hasJira={hasJira}
              />
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}
