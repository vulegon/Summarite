"use client";

import {
  Box,
  Container,
  Typography,
  Button,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
        <Box sx={{ textAlign: "center" }}>
          <ErrorOutlineIcon
            sx={{
              fontSize: { xs: 80, sm: 120 },
              color: "#ef4444",
              mb: 3,
            }}
          />
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              color: "white",
              mb: 2,
              fontSize: { xs: "1.75rem", sm: "2.5rem" },
            }}
          >
            エラーが発生しました
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255,255,255,0.7)",
              mb: 4,
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            申し訳ありません。予期しないエラーが発生しました。
            <br />
            もう一度お試しいただくか、トップページにお戻りください。
          </Typography>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={reset}
              sx={{
                bgcolor: "white",
                color: "#1a1a2e",
                "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                px: { xs: 3, sm: 4 },
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: "0.875rem", sm: "1rem" },
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              もう一度試す
            </Button>
            <Button
              component={Link}
              href="/"
              variant="outlined"
              startIcon={<HomeIcon />}
              sx={{
                borderColor: "rgba(255,255,255,0.5)",
                color: "white",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
                px: { xs: 3, sm: 4 },
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: "0.875rem", sm: "1rem" },
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              トップページへ
            </Button>
          </Box>

          {process.env.NODE_ENV === "development" && error.message && (
            <Box
              sx={{
                mt: 4,
                p: 2,
                bgcolor: "rgba(239, 68, 68, 0.2)",
                borderRadius: 2,
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                }}
              >
                {error.message}
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
