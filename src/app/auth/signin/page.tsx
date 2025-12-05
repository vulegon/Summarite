"use client";

import { signIn } from "next-auth/react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";

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
            アカウントでログインして、メトリクスダッシュボードにアクセスしましょう。
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
              mb: 2,
            }}
          >
            GitHubでログイン
          </Button>
          <Divider sx={{ my: 2 }}>または</Divider>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            startIcon={<GoogleIcon />}
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            sx={{
              borderColor: "grey.300",
              color: "grey.700",
              "&:hover": {
                borderColor: "grey.400",
                bgcolor: "grey.50",
              },
              py: 1.5,
            }}
          >
            Googleでログイン
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
