"use client";

import { useSession, signIn } from "next-auth/react";
import { Box, Container, Typography, Button } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Link from "next/link";

export function CTASection() {
  const { data: session } = useSession();

  return (
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
  );
}
