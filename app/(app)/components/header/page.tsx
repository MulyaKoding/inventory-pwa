"use client"

import {
  Badge,
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography
} from "@mui/material"
import { ThemeToggle } from "../ThemeToggle"

// ── ICONS ─────────────────────────────────────────────────────────────────────
const Icon = ({
  d,
  size = 20,
  color = "currentColor"
}: {
  d: string
  size?: number
  color?: string
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
)

interface HeaderProps {
  isDark: boolean
  onToggleTheme: () => void
  onMenuClick: () => void
  onAddProduct?: () => void
  title?: string
  breadcrumb?: string
  showAddButton?: boolean
  notificationCount?: number
  p: Record<string, string>
}

export default function Header({
  isDark,
  onToggleTheme,
  onMenuClick,
  onAddProduct,
  title = "Product Inventory",
  breadcrumb = "STOCKR / INVENTORY",
  showAddButton = true,
  notificationCount = 0,
  p
}: HeaderProps) {
  const T = "0.3s ease"

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        py: { xs: 1.5, md: 2 },
        borderBottom: `1px solid ${p.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        bgcolor: p.sidebarBg,
        transition: `background-color ${T}, border-color ${T}`,
        gap: 1
      }}
    >
      {/* Left — Hamburger + Title */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, md: 2 },
          minWidth: 0
        }}
      >
        {/* Hamburger — mobile only */}
        <IconButton
          onClick={onMenuClick}
          sx={{
            display: { xs: "flex", md: "none" },
            color: p.textSecondary,
            flexShrink: 0
          }}
        >
          <Icon d="M3 12h18M3 6h18M3 18h18" size={20} color={p.textSecondary} />
        </IconButton>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: p.textMuted,
              fontSize: 11,
              letterSpacing: "0.1em",
              mb: 0.3,
              display: { xs: "none", sm: "block" }
            }}
          >
            {breadcrumb}
          </Typography>
          <Typography
            sx={{
              color: p.textPrimary,
              fontSize: { xs: 15, md: 20 },
              fontWeight: 800,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap"
            }}
          >
            {title}
          </Typography>
        </Box>
      </Box>

      {/* Right — Theme Toggle + Notifications + Add Button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, md: 2 },
          flexShrink: 0
        }}
      >
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

        <Tooltip title="Notifications">
          <IconButton sx={{ color: p.textSecondary }}>
            <Badge
              badgeContent={notificationCount}
              color="secondary"
              sx={{ "& .MuiBadge-badge": { fontSize: 9 } }}
            >
              <Icon
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
                size={18}
                color={p.textSecondary}
              />
            </Badge>
          </IconButton>
        </Tooltip>

        {showAddButton && onAddProduct && (
          <Button
            variant="contained"
            size="small"
            onClick={onAddProduct}
            sx={{
              bgcolor: "#087463",
              color: "#fff",
              fontWeight: 700,
              fontSize: 12,
              px: { xs: 1.5, md: 2 },
              py: 0.8,
              minWidth: { xs: 36, sm: "auto" },
              "&:hover": { bgcolor: "#065a4d" }
            }}
            startIcon={<Icon d="M12 5v14M5 12h14" size={14} color="#fff" />}
          >
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Add Product
            </Box>
          </Button>
        )}
      </Box>
    </Box>
  )
}
