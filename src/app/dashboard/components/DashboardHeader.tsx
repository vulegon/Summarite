"use client";

import { memo } from "react";
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  Button,
  Popover,
  IconButton,
  Divider,
  Avatar,
  Chip,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LogoutIcon from "@mui/icons-material/Logout";
import AddLinkIcon from "@mui/icons-material/AddLink";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { SummariteLogo } from "@/components/icons/SummariteLogo";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    hasGithub?: boolean;
    hasJira?: boolean;
  };
  anchorEl: HTMLElement | null;
  onUserMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onUserMenuClose: () => void;
}

export const DashboardHeader = memo(function DashboardHeader({
  user,
  anchorEl,
  onUserMenuOpen,
  onUserMenuClose,
}: DashboardHeaderProps) {
  const handleLogout = () => {
    onUserMenuClose();
    signOut();
  };

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: { xs: 1.5, sm: 2 },
          }}
        >
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 1.5 },
              textDecoration: "none",
            }}
          >
            <SummariteLogo size={32} />
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.2rem", sm: "1.5rem" },
                color: "white",
                display: { xs: "none", sm: "block" },
              }}
            >
              Summarite
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
            {/* GitHub連携状態 */}
            {user.hasGithub ? (
              <Chip
                icon={<GitHubIcon sx={{ fontSize: 16 }} />}
                label="GitHub連携済"
                size="small"
                sx={{
                  bgcolor: "rgba(34, 197, 94, 0.2)",
                  color: "#4ade80",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  "& .MuiChip-icon": { color: "#4ade80" },
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  display: { xs: "none", sm: "flex" },
                }}
              />
            ) : (
              <Button
                variant="outlined"
                size="small"
                startIcon={<GitHubIcon />}
                onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                sx={{
                  borderColor: "rgba(255,255,255,0.3)",
                  color: "rgba(255,255,255,0.9)",
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  px: { xs: 1.5, sm: 2 },
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.5)",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                  "& .MuiButton-startIcon": {
                    display: { xs: "none", sm: "inherit" },
                  },
                }}
              >
                GitHub連携
              </Button>
            )}

            {/* Jira連携状態 */}
            {user.hasJira ? (
              <Chip
                icon={<AssignmentIcon sx={{ fontSize: 16 }} />}
                label="Jira連携済"
                size="small"
                sx={{
                  bgcolor: "rgba(0, 82, 204, 0.2)",
                  color: "#60a5fa",
                  border: "1px solid rgba(0, 82, 204, 0.3)",
                  "& .MuiChip-icon": { color: "#60a5fa" },
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  display: { xs: "none", sm: "flex" },
                }}
              />
            ) : (
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddLinkIcon />}
                href="/api/connect/jira"
                sx={{
                  borderColor: "rgba(255,255,255,0.3)",
                  color: "rgba(255,255,255,0.9)",
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  px: { xs: 1.5, sm: 2 },
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.5)",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                  "& .MuiButton-startIcon": {
                    display: { xs: "none", sm: "inherit" },
                  },
                }}
              >
                Jira連携
              </Button>
            )}

            <IconButton onClick={onUserMenuOpen} sx={{ p: 0 }}>
              {user.image ? (
                <Image
                  src={user.image}
                  alt="Avatar"
                  width={40}
                  height={40}
                  style={{
                    borderRadius: "50%",
                    border: "2px solid rgba(102, 126, 234, 0.5)",
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  {user.name?.charAt(0) || "U"}
                </Avatar>
              )}
            </IconButton>

            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={onUserMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              sx={{ mt: 1 }}
              slotProps={{
                paper: {
                  sx: {
                    bgcolor: "#1a1a2e",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 2,
                    minWidth: 240,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                  },
                },
              }}
            >
              <Box sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt="Avatar"
                      width={48}
                      height={48}
                      style={{ borderRadius: "50%" }}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      }}
                    >
                      {user.name?.charAt(0) || "U"}
                    </Avatar>
                  )}
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: "white" }}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1.5 }} />
                <Button
                  fullWidth
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    justifyContent: "flex-start",
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "rgba(239, 68, 68, 0.15)",
                      color: "#f87171",
                    },
                  }}
                >
                  ログアウト
                </Button>
              </Box>
            </Popover>
          </Box>
        </Box>
      </Container>
    </Box>
  );
});
