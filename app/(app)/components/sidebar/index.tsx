"use client"

import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

// ── ICON ──────────────────────────────────────────────────────────────────────
const Icon = ({
  d,
  size = 16,
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

// ── NAV ITEMS ─────────────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
    href: "/dashboard"
  },
  {
    label: "Inventory",
    icon: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 3H8L6 7h12z",
    href: "/inventory"
  },
  {
    label: "Orders",
    icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
    href: "/orders"
  },
  {
    label: "Analytics",
    icon: "M3 3v18h18M18 9l-5 5-4-4-4 4",
    href: "/analytics"
  },
  {
    label: "Settings",
    icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a7.1 7.1 0 0 0 .1-1v-2a7.1 7.1 0 0 0-.1-1l2.2-1.6a.5.5 0 0 0 .1-.6l-2-3.5a.5.5 0 0 0-.6-.2l-2.6 1a6.8 6.8 0 0 0-1.7-1l-.4-2.7A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.5.4l-.4 2.8a6.8 6.8 0 0 0-1.7 1l-2.6-1a.5.5 0 0 0-.6.2L2.2 8.9a.5.5 0 0 0 .1.6L4.5 11a7.1 7.1 0 0 0-.1 1v2a7.1 7.1 0 0 0 .1 1L2.3 16.6a.5.5 0 0 0-.1.6l2 3.5a.5.5 0 0 0 .6.2l2.6-1a6.8 6.8 0 0 0 1.7 1l.4 2.7a.5.5 0 0 0 .5.4h4a.5.5 0 0 0 .5-.4l.4-2.7a6.8 6.8 0 0 0 1.7-1l2.6 1a.5.5 0 0 0 .6-.2l2-3.5a.5.5 0 0 0-.1-.6z",
    href: "/settings"
  }
]

// ── PROPS ─────────────────────────────────────────────────────────────────────
interface SidebarProps {
  p: Record<string, string>
  isDark: boolean
  T?: string
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function Sidebar({ p, isDark, T = "0.3s ease" }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [userName, setUserName] = useState("User")
  const [userRole, setUserRole] = useState("Member")

  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return ""
      const match = document.cookie
        .split("; ")
        .find((r) => r.startsWith(`${name}=`))
      return match ? decodeURIComponent(match.split("=")[1]) : ""
    }
    const name = getCookie("user_name")
    const role = getCookie("user_role")
    if (name) setUserName(name)
    if (role) setUserRole(role)
  }, [])

  const avatarLetter = userName.charAt(0).toUpperCase()

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* ── LOGO ── */}
      <Box
        sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            bgcolor: "#087463",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          <Typography
            sx={{
              color: "#0D0D0D",
              fontWeight: 900,
              fontSize: 14,
              fontFamily: "'DM Mono', monospace"
            }}
          >
            INV
          </Typography>
        </Box>
        <Typography
          sx={{
            color: p.textPrimary,
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: "0.05em",
            transition: `color ${T}`
          }}
        >
          STOCKR
        </Typography>
      </Box>

      <Divider sx={{ borderColor: p.border, mb: 1 }} />

      {/* ── NAV ── */}
      <List dense sx={{ px: 1, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => router.push(item.href)}
                sx={{
                  borderRadius: "4px",
                  px: 1.5,
                  py: 1,
                  bgcolor: isActive ? p.activeNavBg : "transparent",
                  border: `1px solid ${isActive ? p.activeNavBorder : "transparent"}`,
                  cursor: "pointer",
                  transition: `background-color ${T}, border-color ${T}`,
                  "&:hover": {
                    bgcolor: isActive ? p.activeNavBg : p.hoverBg
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Icon
                    d={item.icon}
                    size={16}
                    color={isActive ? "#087463" : p.textMuted}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? "#087463" : p.textSecondary,
                    fontFamily: "'DM Mono', monospace"
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      {/* ── USER ── */}
      <Box
        sx={{
          px: 2,
          py: 3,
          borderTop: `1px solid ${p.border}`,
          transition: `border-color ${T}`
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{ width: 32, height: 32, bgcolor: "#FF6B35", fontSize: 12 }}
          >
            {avatarLetter}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                color: p.textPrimary,
                fontSize: 12,
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {userName.length > 14 ? userName.slice(0, 14) + "…" : userName}
            </Typography>
            <Typography
              sx={{
                color: p.textMuted,
                fontSize: 10,
                textTransform: "capitalize"
              }}
            >
              {userRole}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
