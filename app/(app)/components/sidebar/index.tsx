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
    label: "Master Barang",
    icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4",
    href: "/master-barang"
  },
  {
    label: "Registrasi Toko",
    icon: "M3 3v18h18M18 9l-5 5-4-4-4 4",
    href: "/registration"
  },
  {
    label: "Daftar Toko",
    icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
    href: "/list-toko"
  },
  {
    label: "Settings",
    icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a7.1 7.1 0 0 0 .1-1v-2a7.1 7.1 0 0 0-.1-1l2.2-1.6a.5.5 0 0 0 .1-.6l-2-3.5a.5.5 0 0 0-.6-.2l-2.6 1a6.8 6.8 0 0 0-1.7-1l-.4-2.7A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.5.4l-.4 2.8a6.8 6.8 0 0 0-1.7 1l-2.6-1a.5.5 0 0 0-.6.2L2.2 8.9a.5.5 0 0 0 .1.6L4.5 11a7.1 7.1 0 0 0-.1 1v2a7.1 7.1 0 0 0 .1 1L2.3 16.6a.5.5 0 0 0-.1.6l2 3.5a.5.5 0 0 0 .6.2l2.6-1a6.8 6.8 0 0 0 1.7 1l.4 2.7a.5.5 0 0 0 .5.4h4a.5.5 0 0 0 .5-.4l.4-2.7a6.8 6.8 0 0 0 1.7-1l2.6 1a.5.5 0 0 0 .6-.2l2-3.5a.5.5 0 0 0-.1-.6z",
    href: "/settings"
  }
]

interface SidebarProps {
  isDark?: boolean
  T?: string
}

export default function Sidebar({ isDark, T = "0.3s ease" }: SidebarProps) {
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
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(160deg, #060b1a 0%, #0c1733 40%, #0f2050 70%, #1e3a8a 100%)",
        borderRight: "1px solid rgba(255,255,255,.08)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          zIndex: 0
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: -60,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,130,246,.25) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0
        }
      }}
    >
      {/* ── LOGO ── */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          position: "relative",
          zIndex: 1
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(59,130,246,.4)"
          }}
        >
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 900,
              fontSize: 11,
              fontFamily: "'Nunito', sans-serif",
              letterSpacing: "0.05em"
            }}
          >
            INV
          </Typography>
        </Box>
        <Box>
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 900,
              fontSize: 15,
              letterSpacing: "0.06em",
              fontFamily: "'Nunito', sans-serif",
              lineHeight: 1.2
            }}
          >
            STOCKR
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,.4)",
              fontSize: 10,
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600
            }}
          >
            Inventory Management
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,.08)", mb: 1 }} />

      {/* ── NAV ── */}
      <List dense sx={{ px: 1, flex: 1, position: "relative", zIndex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => router.push(item.href)}
                sx={{
                  borderRadius: "8px",
                  px: 1.5,
                  py: 1,
                  bgcolor: isActive ? "rgba(59,130,246,.2)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(59,130,246,.4)" : "transparent"}`,
                  cursor: "pointer",
                  transition: `all ${T}`,
                  "&:hover": {
                    bgcolor: isActive
                      ? "rgba(59,130,246,.25)"
                      : "rgba(255,255,255,.07)",
                    border: `1px solid ${isActive ? "rgba(59,130,246,.4)" : "rgba(255,255,255,.1)"}`
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Icon
                    d={item.icon}
                    size={16}
                    color={isActive ? "#60a5fa" : "rgba(255,255,255,.4)"}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? "#fff" : "rgba(255,255,255,.55)",
                    fontFamily: "'Nunito', sans-serif"
                  }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "#60a5fa",
                      flexShrink: 0
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      {/* ── USER ── */}
      <Box
        sx={{
          px: 2,
          py: 2.5,
          borderTop: "1px solid rgba(255,255,255,.08)",
          position: "relative",
          zIndex: 1
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "#FF6B35",
              fontSize: 12,
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              boxShadow: "0 2px 8px rgba(255,107,53,.4)"
            }}
          >
            {avatarLetter}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {userName.length > 14 ? userName.slice(0, 14) + "…" : userName}
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,.35)",
                fontSize: 10,
                textTransform: "capitalize",
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600
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
