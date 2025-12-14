import { Box, Container, Typography, Card, CardContent, Avatar, Grid } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import SpeedIcon from "@mui/icons-material/Speed";

export function TargetUsersSection() {
  return (
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
                  開発者
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                  自分の活動量を可視化したい方。
                  週次・月次の成果を数値で確認し、
                  振り返りや自己評価に活用できます。
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
                  効率化したい方
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                  振り返りを効率化したい方。
                  週次・月次の振り返り準備として、
                  AIが生成したサマリーを活用できます。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
