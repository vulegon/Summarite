"use client";

import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ReactMarkdown from "react-markdown";
import { MetricsData } from "../actions";

interface AISummaryCardProps {
  initialSummary: string | null;
  canGenerateSummary: boolean;
  metrics: MetricsData;
  hasGithub: boolean;
  hasJira: boolean;
}

const aiModels = [{ value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "Google" }];

export function AISummaryCard({
  initialSummary,
  canGenerateSummary,
  metrics,
  hasGithub,
  hasJira,
}: AISummaryCardProps) {
  const [summary, setSummary] = useState<string | null>(initialSummary);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [aiModel, setAiModel] = useState("gemini-2.5-flash");
  const [error, setError] = useState<string | null>(null);

  const handleModelChange = useCallback((event: SelectChangeEvent) => {
    setAiModel(event.target.value);
  }, []);

  const handleGenerateSummary = useCallback(async () => {
    if (!metrics || !canGenerateSummary) return;

    setSummaryLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github: metrics.github,
          jira: metrics.jira,
          periodType: metrics.periodType,
          periodStart: metrics.periodStart,
          periodEnd: metrics.periodEnd,
          hasGithub,
          hasJira,
          previousGithub: metrics.previousGithub,
          previousJira: metrics.previousJira,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate summary");
      }

      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSummaryLoading(false);
    }
  }, [metrics, canGenerateSummary, hasGithub, hasJira]);

  return (
    <Card
      sx={{
        bgcolor: "white",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: { xs: 2, sm: 4 },
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        }}
      />
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 },
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AutoAwesomeIcon sx={{ color: "white", fontSize: { xs: 18, sm: 24 } }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              AI要約
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(0,0,0,0.5)", fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
            >
              AIがメトリクスを分析して要約を生成します
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, width: { xs: "100%", sm: "auto" } }}
        >
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="ai-model-label">AIモデル</InputLabel>
            <Select
              labelId="ai-model-label"
              value={aiModel}
              label="AIモデル"
              onChange={handleModelChange}
              sx={{
                bgcolor: "rgba(0,0,0,0.02)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0,0,0,0.1)",
                },
              }}
            >
              {aiModels.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleGenerateSummary}
            disabled={summaryLoading || !canGenerateSummary}
            startIcon={
              summaryLoading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />
            }
            sx={{
              background: canGenerateSummary
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "rgba(0,0,0,0.12)",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              "&:hover": {
                background: canGenerateSummary
                  ? "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)"
                  : "rgba(0,0,0,0.12)",
              },
            }}
          >
            {summaryLoading ? "生成中..." : summary ? "再生成" : "要約を生成"}
          </Button>
        </Box>
      </Box>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {error && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <Typography sx={{ color: "#dc2626", fontSize: "0.875rem" }}>{error}</Typography>
          </Box>
        )}
        {summary ? (
          <Box
            sx={{
              color: "rgba(0,0,0,0.8)",
              lineHeight: { xs: 1.8, sm: 2 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
              "& h1, & h2, & h3, & h4": {
                color: "#1a1a2e",
                fontWeight: 700,
                mt: 2,
                mb: 1,
              },
              "& h1": { fontSize: "1.5rem" },
              "& h2": { fontSize: "1.25rem" },
              "& h3": { fontSize: "1.1rem" },
              "& ul, & ol": {
                pl: 3,
                my: 1,
              },
              "& li": {
                mb: 0.5,
              },
              "& p": {
                my: 1,
              },
              "& strong": {
                color: "#1a1a2e",
                fontWeight: 600,
              },
            }}
          >
            <ReactMarkdown>{summary}</ReactMarkdown>
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              color: "rgba(0,0,0,0.4)",
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
            <Typography>
              {canGenerateSummary
                ? "上のボタンをクリックしてAI要約を生成してください"
                : "GitHubまたはJiraと連携してください"}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
