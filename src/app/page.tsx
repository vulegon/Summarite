"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GitHubIcon from "@mui/icons-material/GitHub";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
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
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f5f5 0%, #ffffff 50%, #fafafa 100%)",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{ fontWeight: "bold", color: "grey.900", mb: 2 }}
          >
            Summarite
          </Typography>
          <Typography variant="h5" sx={{ color: "grey.600", mb: 3 }}>
            GitHub & Jira のデータを統合し、開発チームの成果を可視化
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "grey.500", mb: 6, maxWidth: 600, mx: "auto" }}
          >
            週次・月次のメトリクスを自動集計し、AIが分析・要約。
            チームの活動をひと目で把握できます。
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<GitHubIcon />}
            onClick={() => signIn("github")}
            sx={{
              bgcolor: "grey.900",
              "&:hover": { bgcolor: "grey.800" },
              px: 4,
              py: 1.5,
              fontSize: "1rem",
            }}
          >
            GitHubでログイン
          </Button>

          <Grid container spacing={4} sx={{ mt: 8, maxWidth: 900, mx: "auto" }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  height: "100%",
                  boxShadow: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <Avatar
                    sx={{
                      bgcolor: "blue.100",
                      width: 56,
                      height: 56,
                      mx: "auto",
                      mb: 2,
                      backgroundColor: "#dbeafe",
                    }}
                  >
                    <BarChartIcon sx={{ color: "#2563eb", fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    メトリクス集計
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    PR、Issue、レビュー数を自動集計
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  height: "100%",
                  boxShadow: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      mx: "auto",
                      mb: 2,
                      backgroundColor: "#f3e8ff",
                    }}
                  >
                    <AutoAwesomeIcon sx={{ color: "#9333ea", fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    AI要約
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    活動データをAIが分析・要約
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  height: "100%",
                  boxShadow: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      mx: "auto",
                      mb: 2,
                      backgroundColor: "#dcfce7",
                    }}
                  >
                    <CalendarMonthIcon sx={{ color: "#16a34a", fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    週次・月次レポート
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    定期的なふりかえりをサポート
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
