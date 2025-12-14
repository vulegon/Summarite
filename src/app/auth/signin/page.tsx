"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Container,
  CircularProgress,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { SummariteLogo } from "@/components/icons/SummariteLogo";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background pattern */}
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

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1, px: { xs: 2, sm: 3 } }}>
        <Card
          sx={{
            maxWidth: 420,
            width: "100%",
            mx: "auto",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            borderRadius: { xs: 2, sm: 3 },
            overflow: "hidden",
          }}
        >
          {/* Header with gradient */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              py: { xs: 3, sm: 4 },
              px: { xs: 2, sm: 3 },
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 1, sm: 1.5 },
                mb: 2,
              }}
            >
              <SummariteLogo size={40} />
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 700, color: "white", fontSize: { xs: "1.5rem", sm: "2rem" } }}
              >
                Summarite
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.8)", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              あなたの開発実績をAIが自動で要約
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Typography
              variant="body1"
              sx={{
                color: "grey.600",
                mb: { xs: 3, sm: 4 },
                textAlign: "center",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              アカウントでログインして
              <br />
              ダッシュボードにアクセス
            </Typography>

            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<GitHubIcon />}
              onClick={() => signIn("github", { callbackUrl })}
              sx={{
                bgcolor: "#24292e",
                "&:hover": { bgcolor: "#1b1f23" },
                py: { xs: 1.25, sm: 1.5 },
                mb: 2,
                borderRadius: 2,
                textTransform: "none",
                fontSize: { xs: "0.875rem", sm: "1rem" },
                fontWeight: 600,
              }}
            >
              GitHubでログイン
            </Button>

            <Divider sx={{ my: { xs: 2, sm: 2.5 } }}>
              <Typography variant="body2" sx={{ color: "grey.400", px: 2, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                または
              </Typography>
            </Divider>

            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<GoogleIcon />}
              onClick={() => signIn("google", { callbackUrl })}
              sx={{
                borderColor: "grey.300",
                color: "grey.700",
                "&:hover": {
                  borderColor: "grey.400",
                  bgcolor: "grey.50",
                },
                py: { xs: 1.25, sm: 1.5 },
                borderRadius: 2,
                textTransform: "none",
                fontSize: { xs: "0.875rem", sm: "1rem" },
                fontWeight: 600,
              }}
            >
              Googleでログイン
            </Button>

            <Typography
              variant="caption"
              sx={{
                display: "block",
                textAlign: "center",
                color: "grey.500",
                mt: { xs: 3, sm: 4 },
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
              }}
            >
              ログインすることで、利用規約に同意したものとみなされます
            </Typography>
          </CardContent>
        </Card>

        {/* Back to home link */}
        <Box sx={{ textAlign: "center", mt: { xs: 3, sm: 4 } }}>
          <Typography
            component="a"
            href="/"
            sx={{
              color: "rgba(255,255,255,0.7)",
              textDecoration: "none",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              "&:hover": {
                color: "white",
                textDecoration: "underline",
              },
            }}
          >
            トップページに戻る
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          }}
        >
          <CircularProgress sx={{ color: "white" }} />
        </Box>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
