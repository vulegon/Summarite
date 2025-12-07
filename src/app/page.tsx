"use client";

import { useSession, signIn } from "next-auth/react";
import { useSyncExternalStore } from "react";
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
import DashboardIcon from "@mui/icons-material/Dashboard";
import Link from "next/link";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import GroupsIcon from "@mui/icons-material/Groups";
import SpeedIcon from "@mui/icons-material/Speed";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MergeIcon from "@mui/icons-material/Merge";
import BugReportIcon from "@mui/icons-material/BugReport";
import RateReviewIcon from "@mui/icons-material/RateReview";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { SummariteLogo } from "@/components/icons/SummariteLogo";

const emptySubscribe = () => () => {};

export default function Home() {
  const { data: session, status } = useSession();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

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
        <Container maxWidth="lg" sx={{ position: "relative", px: { xs: 2, sm: 3 } }}>
          <Box sx={{ textAlign: "center", maxWidth: 800, mx: "auto" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 1.5, sm: 2 },
                mb: { xs: 2, sm: 3 },
              }}
            >
              <SummariteLogo size={48} />
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.75rem", sm: "2.5rem" },
                  color: "white",
                  letterSpacing: "-0.02em",
                }}
              >
                Summarite
              </Typography>
            </Box>
            <Chip
              label="GitHub & Jira 連携"
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                color: "white",
                mb: { xs: 2, sm: 3 },
                fontWeight: 500,
                fontSize: { xs: "0.75rem", sm: "0.8125rem" },
              }}
            />
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                mb: { xs: 2, sm: 3 },
                fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3.5rem" },
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
                mb: { xs: 3, sm: 4 },
                fontWeight: 400,
                lineHeight: 1.8,
                fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
              }}
            >
              Summariteは、GitHubとJiraのデータを統合し、
              <Box component="br" sx={{ display: { xs: "none", sm: "block" } }} />
              週次・月次のメトリクスをAIが分析・要約するダッシュボードです。
            </Typography>
            {session ? (
              <Button
                component={Link}
                href="/dashboard"
                variant="contained"
                size="large"
                startIcon={<DashboardIcon />}
                sx={{
                  bgcolor: "white",
                  color: "#1a1a2e",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                  px: { xs: 3, sm: 5 },
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: "0.9rem", sm: "1.1rem" },
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                ダッシュボードへ
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<LoginIcon />}
                  onClick={() => signIn()}
                  sx={{
                    bgcolor: "white",
                    color: "#1a1a2e",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                    px: { xs: 3, sm: 5 },
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: "0.9rem", sm: "1.1rem" },
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  ログイン
                </Button>
                <Typography
                  variant="body2"
                  sx={{ mt: 2, color: "rgba(255,255,255,0.6)", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  無料で始められます
                </Typography>
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, sm: 8, md: 10 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 4, sm: 6 } }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, color: "grey.900", mb: 2, fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
          >
            主な機能
          </Typography>
          <Typography variant="body1" sx={{ color: "grey.600", fontSize: { xs: "0.875rem", sm: "1rem" } }}>
            開発チームの活動を可視化し、振り返りを効率化
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 4 }}>
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
              <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                <Avatar
                  sx={{
                    width: { xs: 48, sm: 64 },
                    height: { xs: 48, sm: 64 },
                    mb: { xs: 2, sm: 3 },
                    backgroundColor: "#dbeafe",
                  }}
                >
                  <IntegrationInstructionsIcon sx={{ color: "#2563eb", fontSize: { xs: 24, sm: 32 } }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: { xs: 1, sm: 2 }, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                  GitHub連携
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
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
              <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                <Avatar
                  sx={{
                    width: { xs: 48, sm: 64 },
                    height: { xs: 48, sm: 64 },
                    mb: { xs: 2, sm: 3 },
                    backgroundColor: "#e0e7ff",
                  }}
                >
                  <AssignmentIcon sx={{ color: "#4f46e5", fontSize: { xs: 24, sm: 32 } }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: { xs: 1, sm: 2 }, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                  Jira連携
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
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
              <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                <Avatar
                  sx={{
                    width: { xs: 48, sm: 64 },
                    height: { xs: 48, sm: 64 },
                    mb: { xs: 2, sm: 3 },
                    backgroundColor: "#f3e8ff",
                  }}
                >
                  <AutoAwesomeIcon sx={{ color: "#9333ea", fontSize: { xs: 24, sm: 32 } }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: { xs: 1, sm: 2 }, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                  AI要約
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
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
      <Box sx={{ bgcolor: "white", py: { xs: 5, sm: 8, md: 10 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ textAlign: "center", mb: { xs: 4, sm: 6 } }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{ fontWeight: 700, color: "grey.900", mb: 2, fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
            >
              こんな方におすすめ
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, sm: 4 }} justifyContent="center">
            <Grid size={{ xs: 12, sm: 6, md: 5 }}>
              <Card
                sx={{
                  height: "100%",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: "1px solid",
                  borderColor: "grey.100",
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                  <Avatar
                    sx={{
                      width: { xs: 48, sm: 56 },
                      height: { xs: 48, sm: 56 },
                      mb: 2,
                      backgroundColor: "#dcfce7",
                    }}
                  >
                    <GroupsIcon sx={{ color: "#16a34a", fontSize: { xs: 24, sm: 28 } }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: { xs: 1, sm: 2 }, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                    開発者 / PM
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                    チームや個人の活動量を把握したい方。
                    週次・月次の成果を数値で確認し、
                    1on1やパフォーマンスレビューに活用できます。
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 5 }}>
              <Card
                sx={{
                  height: "100%",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: "1px solid",
                  borderColor: "grey.100",
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                  <Avatar
                    sx={{
                      width: { xs: 48, sm: 56 },
                      height: { xs: 48, sm: 56 },
                      mb: 2,
                      backgroundColor: "#fef3c7",
                    }}
                  >
                    <SpeedIcon sx={{ color: "#d97706", fontSize: { xs: 24, sm: 28 } }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: { xs: 1, sm: 2 }, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                    スクラムチーム
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
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
      <Container maxWidth="lg" sx={{ py: { xs: 5, sm: 8, md: 10 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 4, sm: 6 } }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, color: "grey.900", mb: 2, fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
          >
            使い方
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 3, sm: 4 }} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: "center" }}>
              <Avatar
                sx={{
                  width: { xs: 60, sm: 80 },
                  height: { xs: 60, sm: 80 },
                  mx: "auto",
                  mb: 2,
                  bgcolor: "#667eea",
                  color: "white",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
                }}
              >
                1
              </Avatar>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 1, color: "grey.900", fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                ログイン
              </Typography>
              <Typography variant="body2" sx={{ color: "grey.600", fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                GitHubまたはGoogleアカウントでログインし、
                サービスへのアクセスを許可します。
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: "center" }}>
              <Avatar
                sx={{
                  width: { xs: 60, sm: 80 },
                  height: { xs: 60, sm: 80 },
                  mx: "auto",
                  mb: 2,
                  bgcolor: "#667eea",
                  color: "white",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
                }}
              >
                2
              </Avatar>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 1, color: "grey.900", fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                Jiraを連携（任意）
              </Typography>
              <Typography variant="body2" sx={{ color: "grey.600", fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                必要に応じてJira Cloudを連携し、
                チケット情報も統合できます。
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: "center" }}>
              <Avatar
                sx={{
                  width: { xs: 60, sm: 80 },
                  height: { xs: 60, sm: 80 },
                  mx: "auto",
                  mb: 2,
                  bgcolor: "#667eea",
                  color: "white",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
                }}
              >
                3
              </Avatar>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 1, color: "grey.900", fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                レポートを確認
              </Typography>
              <Typography variant="body2" sx={{ color: "grey.600", fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
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
          py: { xs: 5, sm: 8, md: 10 },
        }}
      >
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{ fontWeight: 700, mb: 2, fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
            >
              今すぐ始めましょう
            </Typography>
            {session ? (
              <>
                <Typography
                  variant="body1"
                  sx={{ color: "rgba(255,255,255,0.8)", mb: { xs: 3, sm: 4 }, fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  ダッシュボードで活動を確認しましょう。
                </Typography>
                <Button
                  component={Link}
                  href="/dashboard"
                  variant="contained"
                  size="large"
                  startIcon={<DashboardIcon />}
                  sx={{
                    bgcolor: "white",
                    color: "#1a1a2e",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                    px: { xs: 3, sm: 5 },
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: "0.9rem", sm: "1.1rem" },
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  ダッシュボードへ
                </Button>
              </>
            ) : (
              <>
                <Typography
                  variant="body1"
                  sx={{ color: "rgba(255,255,255,0.8)", mb: { xs: 3, sm: 4 }, fontSize: { xs: "0.875rem", sm: "1rem" } }}
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
                    px: { xs: 3, sm: 5 },
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: "0.9rem", sm: "1.1rem" },
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  ログイン
                </Button>
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: "white", py: { xs: 3, sm: 4 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Divider sx={{ mb: { xs: 3, sm: 4 } }} />
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              Summarite
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}>
              Next.js / TypeScript / Prisma / OpenAI / Claude
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
