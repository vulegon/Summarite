"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Grid,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LoginIcon from "@mui/icons-material/Login";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import GroupsIcon from "@mui/icons-material/Groups";
import SpeedIcon from "@mui/icons-material/Speed";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MergeIcon from "@mui/icons-material/Merge";
import BugReportIcon from "@mui/icons-material/BugReport";
import RateReviewIcon from "@mui/icons-material/RateReview";
import AssignmentIcon from "@mui/icons-material/Assignment";

const emptySubscribe = () => () => {};

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          color: "white",
          py: { xs: 8, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px),
                              radial-gradient(circle at 75% 75%, #fff 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Box sx={{ textAlign: "center", maxWidth: 800, mx: "auto" }}>
            <Chip
              label="GitHub & Jira 連携"
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                color: "white",
                mb: 3,
                fontWeight: 500,
              }}
            />
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                lineHeight: 1.2,
              }}
            >
              開発チームの成果を
              <br />
              AIが自動で要約
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.8)",
                mb: 4,
                fontWeight: 400,
                lineHeight: 1.8,
              }}
            >
              Summariteは、GitHubとJiraのデータを統合し、
              <br />
              週次・月次のメトリクスをAIが分析・要約するダッシュボードです。
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={() => signIn()}
              sx={{
                bgcolor: "white",
                color: "#1a1a2e",
                "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                px: 5,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              ログイン
            </Button>
            <Typography
              variant="body2"
              sx={{ mt: 2, color: "rgba(255,255,255,0.6)" }}
            >
              無料で始められます
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, color: "grey.900", mb: 2 }}
          >
            主な機能
          </Typography>
          <Typography variant="body1" sx={{ color: "grey.600" }}>
            開発チームの活動を可視化し、振り返りを効率化
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: "100%",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid",
                borderColor: "grey.100",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mb: 3,
                    backgroundColor: "#dbeafe",
                  }}
                >
                  <IntegrationInstructionsIcon sx={{ color: "#2563eb", fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  GitHub連携
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  OAuthでGitHubと連携し、以下のメトリクスを自動取得します。
                </Typography>
                <List dense>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <MergeIcon sx={{ fontSize: 18, color: "grey.600" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="PR作成・マージ数"
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <RateReviewIcon sx={{ fontSize: 18, color: "grey.600" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="コードレビュー数"
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <BugReportIcon sx={{ fontSize: 18, color: "grey.600" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Issue作成・クローズ数"
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: "100%",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid",
                borderColor: "grey.100",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mb: 3,
                    backgroundColor: "#e0e7ff",
                  }}
                >
                  <AssignmentIcon sx={{ color: "#4f46e5", fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Jira連携
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Jira Cloudと連携し、チケット状態を取得します。
                </Typography>
                <List dense>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: "success.main" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="完了チケット数"
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <SpeedIcon sx={{ fontSize: 18, color: "info.main" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="進行中チケット数"
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <BugReportIcon sx={{ fontSize: 18, color: "warning.main" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="停滞チケット検出"
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: "100%",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid",
                borderColor: "grey.100",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mb: 3,
                    backgroundColor: "#f3e8ff",
                  }}
                >
                  <AutoAwesomeIcon sx={{ color: "#9333ea", fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  AI要約
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  OpenAIまたはClaude AIが活動データを分析・要約します。
                </Typography>
                <List dense>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CalendarMonthIcon sx={{ fontSize: 18, color: "grey.600" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="週次レポート生成"
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <BarChartIcon sx={{ fontSize: 18, color: "grey.600" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="月次レポート生成"
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <AutoAwesomeIcon sx={{ fontSize: 18, color: "grey.600" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="成果のハイライト抽出"
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Target Users Section */}
      <Box sx={{ bgcolor: "white", py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{ fontWeight: 700, color: "grey.900", mb: 2 }}
            >
              こんな方におすすめ
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Card
                sx={{
                  height: "100%",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: "1px solid",
                  borderColor: "grey.100",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      mb: 2,
                      backgroundColor: "#dcfce7",
                    }}
                  >
                    <GroupsIcon sx={{ color: "#16a34a", fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    開発者 / PM
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    チームや個人の活動量を把握したい方。
                    週次・月次の成果を数値で確認し、
                    1on1やパフォーマンスレビューに活用できます。
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Card
                sx={{
                  height: "100%",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: "1px solid",
                  borderColor: "grey.100",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      mb: 2,
                      backgroundColor: "#fef3c7",
                    }}
                  >
                    <SpeedIcon sx={{ color: "#d97706", fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    スクラムチーム
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    スプリント振り返りを効率化したい方。
                    レトロスペクティブの事前準備として、
                    AIが生成したサマリーを活用できます。
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How it works */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, color: "grey.900", mb: 2 }}
          >
            使い方
          </Typography>
        </Box>

        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: "center" }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 2,
                  bgcolor: "#667eea",
                  color: "white",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
                }}
              >
                1
              </Avatar>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 1, color: "grey.900" }}
              >
                ログイン
              </Typography>
              <Typography variant="body2" sx={{ color: "grey.600" }}>
                GitHubまたはGoogleアカウントでログインし、
                サービスへのアクセスを許可します。
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: "center" }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 2,
                  bgcolor: "#667eea",
                  color: "white",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
                }}
              >
                2
              </Avatar>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 1, color: "grey.900" }}
              >
                Jiraを連携（任意）
              </Typography>
              <Typography variant="body2" sx={{ color: "grey.600" }}>
                必要に応じてJira Cloudを連携し、
                チケット情報も統合できます。
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: "center" }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 2,
                  bgcolor: "#667eea",
                  color: "white",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
                }}
              >
                3
              </Avatar>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 1, color: "grey.900" }}
              >
                レポートを確認
              </Typography>
              <Typography variant="body2" sx={{ color: "grey.600" }}>
                ダッシュボードで週次・月次のメトリクスと
                AI要約を確認できます。
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: "#1a1a2e",
          color: "white",
          py: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              今すぐ始めましょう
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "rgba(255,255,255,0.8)", mb: 4 }}
            >
              GitHubアカウントがあれば、すぐに利用開始できます。
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={() => signIn()}
              sx={{
                bgcolor: "white",
                color: "#1a1a2e",
                "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                px: 5,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              ログイン
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: "white", py: 4 }}>
        <Container maxWidth="lg">
          <Divider sx={{ mb: 4 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Summarite
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Next.js / TypeScript / Prisma / OpenAI / Claude
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
