"use client";

import { memo } from "react";
import { Box, Tabs, Tab, Chip, Button, Typography } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

interface PeriodSelectorProps {
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  periodStart?: string;
  periodEnd?: string;
  customStartDate: string;
  customEndDate: string;
  onCustomStartDateChange: (value: string) => void;
  onCustomEndDateChange: (value: string) => void;
  onFetchMetrics: () => void;
  formatPeriod: (start: string, end: string) => string;
}

export const PeriodSelector = memo(function PeriodSelector({
  activeTab,
  onTabChange,
  periodStart,
  periodEnd,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange,
  onFetchMetrics,
  formatPeriod,
}: PeriodSelectorProps) {
  return (
    <Box sx={{ mb: { xs: 2, sm: 4 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Tabs
          value={activeTab}
          onChange={onTabChange}
          sx={{
            "& .MuiTabs-indicator": {
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              height: 3,
              borderRadius: 2,
            },
            "& .MuiTab-root": {
              color: "rgba(0,0,0,0.4)",
              textTransform: "none",
              fontWeight: 600,
              fontSize: { xs: "0.875rem", sm: "1rem" },
              minWidth: { xs: 60, sm: 100 },
              px: { xs: 1.5, sm: 2 },
              "&.Mui-selected": {
                color: "#1a1a2e",
              },
            },
          }}
        >
          <Tab label="週次" />
          <Tab label="月次" />
          <Tab label="カスタム" />
        </Tabs>

        {activeTab === 2 ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => onCustomStartDateChange(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.2)",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
            <Typography sx={{ color: "rgba(0,0,0,0.5)" }}>〜</Typography>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => onCustomEndDateChange(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.2)",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={onFetchMetrics}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                textTransform: "none",
                fontWeight: 600,
                ml: 1,
              }}
            >
              取得
            </Button>
          </Box>
        ) : (
          periodStart &&
          periodEnd && (
            <Chip
              icon={<CalendarTodayIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
              label={formatPeriod(periodStart, periodEnd)}
              sx={{
                bgcolor: "rgba(102, 126, 234, 0.1)",
                color: "#667eea",
                border: "1px solid rgba(102, 126, 234, 0.2)",
                "& .MuiChip-icon": { color: "#667eea" },
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                fontWeight: 600,
                py: 2,
              }}
            />
          )
        )}
      </Box>
    </Box>
  );
});
