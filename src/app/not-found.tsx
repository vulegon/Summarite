"use client";

import {
  Box,
  Container,
  Typography,
  Button,
} from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Link from "next/link";

export default function NotFound() {
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
          <SearchOffIcon
            sx={{
              fontSize: { xs: 80, sm: 120 },
              color: "rgba(255,255,255,0.5)",
              mb: 3,
            }}
          />
          <Typography
            variant="h1"
            sx={{
              fontWeight: 800,
              color: "white",
              mb: 1,
              fontSize: { xs: "4rem", sm: "6rem" },
              opacity: 0.9,
            }}
          >
            404
          </Typography>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: "white",
              mb: 2,
              fontSize: { xs: "1.5rem", sm: "2rem" },
            }}
          >
            ページが見つかりません
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255,255,255,0.7)",
              mb: 4,
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            お探しのページは存在しないか、移動した可能性があります。
          </Typography>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={Link}
              href="/"
              variant="contained"
              startIcon={<HomeIcon />}
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
              トップページへ
            </Button>
            <Button
              component={Link}
              href="/dashboard"
              variant="outlined"
              startIcon={<DashboardIcon />}
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
              ダッシュボードへ
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
