"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Tabs, Tab, Chip, Button, Typography, CircularProgress } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { PeriodType } from "../actions";

interface PeriodSelectorProps {
  currentPeriod: PeriodType;
  periodStart?: string;
  periodEnd?: string;
  customStart?: string;
  customEnd?: string;
}

const getDefaultDates = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
};

const periodToTab = (period: PeriodType): number => {
  switch (period) {
    case "weekly":
      return 0;
    case "monthly":
      return 1;
    case "custom":
      return 2;
    default:
      return 0;
  }
};

const tabToPeriod = (tab: number): PeriodType => {
  switch (tab) {
    case 0:
      return "weekly";
    case 1:
      return "monthly";
    case 2:
      return "custom";
    default:
      return "weekly";
  }
};

export function PeriodSelector({
  currentPeriod,
  periodStart,
  periodEnd,
  customStart,
  customEnd,
}: PeriodSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaults = getDefaultDates();
  const [isPending, startTransition] = useTransition();

  const [startDate, setStartDate] = useState(customStart ?? defaults.start);
  const [endDate, setEndDate] = useState(customEnd ?? defaults.end);

  const activeTab = periodToTab(currentPeriod);

  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      const period = tabToPeriod(newValue);
      const params = new URLSearchParams(searchParams.toString());

      if (period === "custom") {
        params.set("period", "custom");
        params.set("start", startDate);
        params.set("end", endDate);
      } else {
        params.set("period", period);
        params.delete("start");
        params.delete("end");
      }

      startTransition(() => {
        router.push(`/dashboard?${params.toString()}`);
      });
    },
    [router, searchParams, startDate, endDate]
  );

  const handleFetchCustom = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", "custom");
    params.set("start", startDate);
    params.set("end", endDate);
    startTransition(() => {
      router.push(`/dashboard?${params.toString()}`);
    });
  }, [router, searchParams, startDate, endDate]);

  const formatPeriod = useCallback((start: string, end: string) => {
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    return `${format(startDateObj, "M月d日", { locale: ja })} 〜 ${format(endDateObj, "M月d日", { locale: ja })}`;
  }, []);

  return (
    <Box sx={{ mb: { xs: 2, sm: 4 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
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
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.2)",
                fontSize: "0.875rem",
                outline: "none",
                backgroundColor: "#ffffff",
                color: "#1a1a2e",
              }}
            />
            <Typography sx={{ color: "rgba(0,0,0,0.5)" }}>〜</Typography>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.2)",
                fontSize: "0.875rem",
                outline: "none",
                backgroundColor: "#ffffff",
                color: "#1a1a2e",
              }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleFetchCustom}
              disabled={isPending}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                textTransform: "none",
                fontWeight: 600,
                ml: 1,
                minWidth: 70,
                "&.Mui-disabled": {
                  background: "rgba(102, 126, 234, 0.5)",
                  color: "#fff",
                },
              }}
            >
              {isPending ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "取得"}
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
}
