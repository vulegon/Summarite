import { Box, Container, Typography, Avatar, Grid } from "@mui/material";

export function HowItWorksSection() {
  return (
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
  );
}
