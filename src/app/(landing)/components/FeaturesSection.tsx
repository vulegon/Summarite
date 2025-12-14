import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import SpeedIcon from "@mui/icons-material/Speed";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MergeIcon from "@mui/icons-material/Merge";
import BugReportIcon from "@mui/icons-material/BugReport";
import RateReviewIcon from "@mui/icons-material/RateReview";
import AssignmentIcon from "@mui/icons-material/Assignment";

export function FeaturesSection() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, sm: 8, md: 10 }, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ textAlign: "center", mb: { xs: 4, sm: 6 } }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{ fontWeight: 700, color: "grey.900", mb: 2, fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
        >
          主な機能
        </Typography>
        <Typography variant="body1" sx={{ color: "grey.600", fontSize: { xs: "0.875rem", sm: "1rem" } }}>
          あなたの活動を可視化し、振り返りを効率化
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: "100%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid",
              borderColor: "grey.100",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Avatar
                sx={{
                  width: { xs: 48, sm: 64 },
                  height: { xs: 48, sm: 64 },
                  mb: { xs: 2, sm: 3 },
                  backgroundColor: "#dbeafe",
                }}
              >
                <IntegrationInstructionsIcon sx={{ color: "#2563eb", fontSize: { xs: 24, sm: 32 } }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: { xs: 1, sm: 2 }, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                GitHub連携
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                OAuthでGitHubと連携し、以下のメトリクスを自動取得します。
              </Typography>
              <List dense>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <MergeIcon sx={{ fontSize: 18, color: "grey.600" }} />
                  </ListItemIcon>
                  <ListItemText primary="PR作成・マージ数" primaryTypographyProps={{ variant: "body2" }} />
                </ListItem>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <RateReviewIcon sx={{ fontSize: 18, color: "grey.600" }} />
                  </ListItemIcon>
                  <ListItemText primary="コードレビュー数" primaryTypographyProps={{ variant: "body2" }} />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <BugReportIcon sx={{ fontSize: 18, color: "grey.600" }} />
                  </ListItemIcon>
                  <ListItemText primary="Issue作成・クローズ数" primaryTypographyProps={{ variant: "body2" }} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: "100%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid",
              borderColor: "grey.100",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Avatar
                sx={{
                  width: { xs: 48, sm: 64 },
                  height: { xs: 48, sm: 64 },
                  mb: { xs: 2, sm: 3 },
                  backgroundColor: "#e0e7ff",
                }}
              >
                <AssignmentIcon sx={{ color: "#4f46e5", fontSize: { xs: 24, sm: 32 } }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: { xs: 1, sm: 2 }, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                Jira連携
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                Jira Cloudと連携し、チケット状態を取得します。
              </Typography>
              <List dense>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon sx={{ fontSize: 18, color: "success.main" }} />
                  </ListItemIcon>
                  <ListItemText primary="完了チケット数" primaryTypographyProps={{ variant: "body2" }} />
                </ListItem>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <SpeedIcon sx={{ fontSize: 18, color: "info.main" }} />
                  </ListItemIcon>
                  <ListItemText primary="進行中チケット数" primaryTypographyProps={{ variant: "body2" }} />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <BugReportIcon sx={{ fontSize: 18, color: "warning.main" }} />
                  </ListItemIcon>
                  <ListItemText primary="停滞チケット検出" primaryTypographyProps={{ variant: "body2" }} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: "100%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid",
              borderColor: "grey.100",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Avatar
                sx={{
                  width: { xs: 48, sm: 64 },
                  height: { xs: 48, sm: 64 },
                  mb: { xs: 2, sm: 3 },
                  backgroundColor: "#f3e8ff",
                }}
              >
                <AutoAwesomeIcon sx={{ color: "#9333ea", fontSize: { xs: 24, sm: 32 } }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: { xs: 1, sm: 2 }, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                AI要約
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                OpenAIまたはClaude AIが活動データを分析・要約します。
              </Typography>
              <List dense>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CalendarMonthIcon sx={{ fontSize: 18, color: "grey.600" }} />
                  </ListItemIcon>
                  <ListItemText primary="週次レポート生成" primaryTypographyProps={{ variant: "body2" }} />
                </ListItem>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <BarChartIcon sx={{ fontSize: 18, color: "grey.600" }} />
                  </ListItemIcon>
                  <ListItemText primary="月次レポート生成" primaryTypographyProps={{ variant: "body2" }} />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 18, color: "grey.600" }} />
                  </ListItemIcon>
                  <ListItemText primary="成果のハイライト抽出" primaryTypographyProps={{ variant: "body2" }} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
