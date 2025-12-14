import { Box, Container, Typography, Divider } from "@mui/material";

export function Footer() {
  return (
    <Box sx={{ bgcolor: "white", py: { xs: 3, sm: 4 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Divider sx={{ mb: { xs: 3, sm: 4 } }} />
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
            Summarite
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}>
            Next.js / TypeScript / Prisma / OpenAI / Claude
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
