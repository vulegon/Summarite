"use client";

import { memo } from "react";
import { Box, Typography } from "@mui/material";

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

export const MetricCard = memo(function MetricCard({
  label,
  value,
  icon: Icon,
  color,
}: MetricCardProps) {
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: { xs: 2, sm: 3 },
        bgcolor: "rgba(0,0,0,0.02)",
        border: "1px solid rgba(0,0,0,0.06)",
        transition: "all 0.2s",
        "&:hover": {
          bgcolor: "rgba(0,0,0,0.04)",
          borderColor: `${color}40`,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
        <Icon sx={{ fontSize: { xs: 14, sm: 18 }, color: color }} />
        <Typography
          variant="body2"
          sx={{ color: "rgba(0,0,0,0.6)", fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: color,
          letterSpacing: "-0.02em",
          fontSize: { xs: "1.5rem", sm: "2rem" },
        }}
      >
        {value}
      </Typography>
    </Box>
  );
});
