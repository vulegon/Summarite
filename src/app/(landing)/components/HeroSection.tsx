"use client";

import { useSession, signIn } from "next-auth/react";
import { useSyncExternalStore } from "react";
import { Box, Container, Typography, Button, Chip, CircularProgress } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Link from "next/link";
import { SummariteLogo } from "@/components/icons/SummariteLogo";

const emptySubscribe = () => () => {};

export function HeroSection() {
  const { data: session, status } = useSession();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isLoading = !mounted || status === "loading";

  return (
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
            あなたの開発実績を
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

          {isLoading ? (
            <CircularProgress sx={{ color: "white" }} size={32} />
          ) : session ? (
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
  );
}
