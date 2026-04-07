"use client"

import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography
} from "@mui/material"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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
  p?: Record<string, string>
}

// ── COOKIE HELPER ──────────────────────────────────────────────────────────────
function getCookie(name: string): string {
  if (typeof document === "undefined") return ""
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split("=")[1]) : ""
}

// ── HEADER ────────────────────────────────────────────────────────────────────
export default function Header({
  isDark,
  onToggleTheme,
  onMenuClick,
  onAddProduct,
  title = "Product Inventory",
  showAddButton = true,
  notificationCount = 0,
  p = {}
}: HeaderProps) {
  const T = "0.3s ease"
  const router = useRouter()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)

  // Read user info from client-readable cookies set on login
  const [userName, setUserName] = useState("User")
  const [userRole, setUserRole] = useState("Member")

  useEffect(() => {
    const name = getCookie("user_name")
    const role = getCookie("user_role")
    if (name) setUserName(name)
    if (role) setUserRole(role)
  }, [])

  // Initial letter for avatar
  const avatarLetter = userName.charAt(0).toUpperCase()

  const handleUserMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget)
  }
  const handleUserMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleUserMenuClose()

    // 1. Hit server route to clear httpOnly token cookie
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})

    // 2. Clear client-readable cookies (user_name, user_role)
    const past = "Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = `user_name=; expires=${past}; path=/`
    document.cookie = `user_role=; expires=${past}; path=/`

    // 3. Clear any remaining localStorage / sessionStorage
    try {
      localStorage.clear()
    } catch {}
    try {
      sessionStorage.clear()
    } catch {}

    // 4. Redirect to login
    router.push("/login")
  }

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

      {/* Right */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, md: 2 },
          flexShrink: 0
        }}
      >
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

        {/* Notifications */}
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

        {/* Add Product */}
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

        {/* ── USER AVATAR BUTTON ── */}
        <Tooltip title="Account">
          <IconButton
            onClick={handleUserMenuOpen}
            size="small"
            sx={{
              width: 32,
              height: 32,
              bgcolor: "#FF6B35",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'DM Mono', monospace",
              borderRadius: "4px",
              border: menuOpen
                ? "1.5px solid #087463"
                : "1.5px solid transparent",
              transition: "border-color 0.2s",
              "&:hover": { bgcolor: "#e55f2d" }
            }}
          >
            {avatarLetter}
          </IconButton>
        </Tooltip>

        {/* ── USER DROPDOWN ── */}
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleUserMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                mt: 1,
                minWidth: 200,
                bgcolor: isDark ? "#141414" : "#fff",
                border: `1px solid ${p.border}`,
                borderRadius: "6px",
                boxShadow: isDark
                  ? "0 8px 32px rgba(0,0,0,0.7)"
                  : "0 8px 24px rgba(0,0,0,0.1)",
                fontFamily: "'DM Mono', monospace",
                overflow: "visible",
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: -6,
                  right: 12,
                  width: 12,
                  height: 12,
                  bgcolor: isDark ? "#141414" : "#fff",
                  border: `1px solid ${p.border}`,
                  borderRight: "none",
                  borderBottom: "none",
                  transform: "rotate(45deg)",
                  zIndex: 0
                }
              }
            }
          }}
        >
          {/* ── User Info ── */}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: "#FF6B35",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                  fontFamily: "inherit",
                  flexShrink: 0
                }}
              >
                {avatarLetter}
              </Box>
              <Box>
                <Typography
                  sx={{
                    color: p.textPrimary,
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "'DM Mono', monospace",
                    lineHeight: 1.2
                  }}
                >
                  {/* Truncate long names */}
                  {userName.length > 18
                    ? userName.slice(0, 18) + "…"
                    : userName}
                </Typography>
                <Typography
                  sx={{
                    color: p.textMuted,
                    fontSize: 10,
                    fontFamily: "'DM Mono', monospace",
                    textTransform: "capitalize"
                  }}
                >
                  {userRole}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ borderColor: p.border, my: 0.5 }} />

          {/* Profile */}
          <MenuItem
            onClick={handleUserMenuClose}
            sx={{
              px: 2,
              py: 1,
              gap: 1.5,
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              color: p.textSecondary,
              "&:hover": { bgcolor: p.hoverBg, color: p.textPrimary }
            }}
          >
            <ListItemIcon sx={{ minWidth: "auto" }}>
              <Icon
                d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                size={15}
                color={p.textMuted}
              />
            </ListItemIcon>
            Profile
          </MenuItem>

          {/* Settings */}
          <MenuItem
            onClick={handleUserMenuClose}
            sx={{
              px: 2,
              py: 1,
              gap: 1.5,
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              color: p.textSecondary,
              "&:hover": { bgcolor: p.hoverBg, color: p.textPrimary }
            }}
          >
            <ListItemIcon sx={{ minWidth: "auto" }}>
              <Icon
                d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a7.1 7.1 0 0 0 .1-1v-2a7.1 7.1 0 0 0-.1-1l2.2-1.6a.5.5 0 0 0 .1-.6l-2-3.5a.5.5 0 0 0-.6-.2l-2.6 1a6.8 6.8 0 0 0-1.7-1l-.4-2.7A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.5.4l-.4 2.8a6.8 6.8 0 0 0-1.7 1l-2.6-1a.5.5 0 0 0-.6.2L2.2 8.9a.5.5 0 0 0 .1.6L4.5 11a7.1 7.1 0 0 0-.1 1v2a7.1 7.1 0 0 0 .1 1L2.3 16.6a.5.5 0 0 0-.1.6l2 3.5a.5.5 0 0 0 .6.2l2.6-1a6.8 6.8 0 0 0 1.7 1l.4 2.7a.5.5 0 0 0 .5.4h4a.5.5 0 0 0 .5-.4l.4-2.7a6.8 6.8 0 0 0 1.7-1l2.6 1a.5.5 0 0 0 .6-.2l2-3.5a.5.5 0 0 0-.1-.6z"
                size={15}
                color={p.textMuted}
              />
            </ListItemIcon>
            Settings
          </MenuItem>

          <Divider sx={{ borderColor: p.border, my: 0.5 }} />

          {/* Logout */}
          <MenuItem
            onClick={handleLogout}
            sx={{
              px: 2,
              py: 1,
              gap: 1.5,
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              color: "#ef4444",
              "&:hover": {
                bgcolor: isDark ? "#2e1010" : "#fef2f2",
                color: "#dc2626"
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: "auto" }}>
              <Icon
                d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                size={15}
                color="#ef4444"
              />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  )
}
