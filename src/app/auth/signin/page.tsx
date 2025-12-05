"use client";

import { signIn } from "next-auth/react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

export default function SignIn() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f5f5 0%, #ffffff 50%, #fafafa 100%)",
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: "100%",
          mx: 2,
          boxShadow: 3,
          border: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: "bold", color: "grey.900", mb: 2 }}
          >
            Summarite にログイン
          </Typography>
          <Typography variant="body1" sx={{ color: "grey.500", mb: 4 }}>
            GitHubアカウントでログインして、メトリクスダッシュボードにアクセスしましょう。
          </Typography>
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<GitHubIcon />}
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            sx={{
              bgcolor: "grey.900",
              "&:hover": { bgcolor: "grey.800" },
              py: 1.5,
            }}
          >
            GitHubでログイン
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
