"use client"

import {
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Avatar
} from "@mui/material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { useEffect, useMemo, useState } from "react"
import Header from "../components/header/page"
import Sidebar from "../components/sidebar"

const DRAWER_WIDTH = 220

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

const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
    active: true,
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

// ── MINI BAR CHART ─────────────────────────────────────────────────────────────
const WEEKLY_DATA = [
  { day: "Sen", sales: 42, stock: 120 },
  { day: "Sel", sales: 78, stock: 98 },
  { day: "Rab", sales: 55, stock: 110 },
  { day: "Kam", sales: 91, stock: 85 },
  { day: "Jum", sales: 63, stock: 102 },
  { day: "Sab", sales: 110, stock: 77 },
  { day: "Min", sales: 87, stock: 93 }
]

function MiniBarChart({
  data,
  color,
  p
}: {
  data: { day: string; val: number }[]
  color: string
  p: Record<string, string>
}) {
  const max = Math.max(...data.map((d) => d.val))
  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5, height: 56 }}>
      {data.map((d, i) => {
        const pct = (d.val / max) * 100
        return (
          <Box
            key={i}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: `${pct}%`,
                bgcolor: color,
                borderRadius: "2px 2px 0 0",
                opacity: i === data.length - 1 ? 1 : 0.45,
                transition: "opacity 0.2s",
                "&:hover": { opacity: 1 }
              }}
            />
            <Typography sx={{ color: p.textMuted, fontSize: 8, mt: 0.3 }}>
              {d.day}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}

// ── SPARK LINE ─────────────────────────────────────────────────────────────────
function SparkLine({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const norm = values.map((v) => ((v - min) / (max - min || 1)) * 30)
  const w = 80
  const points = norm
    .map((v, i) => `${(i / (values.length - 1)) * w},${32 - v}`)
    .join(" ")
  return (
    <svg width={w} height={36} viewBox={`0 0 ${w} 36`} fill="none">
      <polyline
        points={points}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      <circle
        cx={((values.length - 1) / (values.length - 1)) * w}
        cy={32 - norm[norm.length - 1]}
        r="2.5"
        fill={color}
      />
    </svg>
  )
}

// ── ACTIVITY TIMELINE ──────────────────────────────────────────────────────────
const ACTIVITIES = [
  {
    time: "08:42",
    action: "Produk baru ditambahkan",
    detail: "BB Ys23 — Apparel",
    type: "add"
  },
  {
    time: "09:15",
    action: "Stock diperbarui",
    detail: "XIAOMI — 20 unit",
    type: "edit"
  },
  {
    time: "10:03",
    action: "Produk dihapus",
    detail: "Nokia 3310 — Electronics",
    type: "delete"
  },
  {
    time: "11:30",
    action: "Produk baru ditambahkan",
    detail: "APPLE — Electronics",
    type: "add"
  },
  {
    time: "13:22",
    action: "Stock diperbarui",
    detail: "BB Ys23 — 30 unit",
    type: "edit"
  },
  {
    time: "14:50",
    action: "Low stock alert",
    detail: "APPLE — 12 unit tersisa",
    type: "warn"
  }
]

const activityColor = (type: string) => {
  if (type === "add") return "#087463"
  if (type === "edit") return "#3b82f6"
  if (type === "delete") return "#ef4444"
  return "#f59e0b"
}

// ── TOP PRODUCTS ───────────────────────────────────────────────────────────────
const TOP_PRODUCTS = [
  {
    rank: 1,
    name: "BB Ys23",
    category: "Apparel",
    sold: 214,
    revenue: 19260000,
    trend: "up"
  },
  {
    rank: 2,
    name: "XIAOMI",
    category: "Tools",
    sold: 187,
    revenue: 374000000,
    trend: "up"
  },
  {
    rank: 3,
    name: "APPLE",
    category: "Electronics",
    sold: 95,
    revenue: 95000000,
    trend: "down"
  }
]

// ── STAT CARD ──────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  delta,
  trend,
  spark,
  sparkColor,
  p
}: {
  label: string
  value: string
  delta: string
  trend: "up" | "down" | "neutral"
  spark: number[]
  sparkColor: string
  p: Record<string, string>
}) {
  const trendColor =
    trend === "up" ? "#16a34a" : trend === "down" ? "#dc2626" : p.textMuted
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→"
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        border: `1px solid ${p.border}`,
        bgcolor: p.bgPaper,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          bgcolor:
            trend === "up" ? "#087463" : trend === "down" ? "#FF6B35" : p.border
        }
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start"
        }}
      >
        <Box>
          <Typography
            sx={{
              color: p.textMuted,
              fontSize: 10,
              letterSpacing: "0.08em",
              mb: 1
            }}
          >
            {label.toUpperCase()}
          </Typography>
          <Typography
            sx={{
              color: p.textPrimary,
              fontSize: { xs: 20, md: 28 },
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1
            }}
          >
            {value}
          </Typography>
          <Typography sx={{ color: trendColor, fontSize: 11, mt: 0.8 }}>
            {trendIcon} {delta}
          </Typography>
        </Box>
        <SparkLine values={spark} color={sparkColor} />
      </Box>
    </Paper>
  )
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [isDark, setIsDark] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? "dark" : "light",
          primary: { main: "#087463" },
          background: {
            default: isDark ? "#0D0D0D" : "#f8fafc",
            paper: isDark ? "#141414" : "#ffffff"
          },
          text: {
            primary: isDark ? "#F5F5F0" : "#0f172a",
            secondary: isDark ? "#888" : "#64748b"
          }
        },
        typography: { fontFamily: "'DM Mono', 'Courier New', monospace" },
        shape: { borderRadius: 2 },
        components: {
          MuiButton: {
            styleOverrides: { root: { textTransform: "none", fontWeight: 600 } }
          }
        }
      }),
    [isDark]
  )

  const p = useMemo(
    () => ({
      bg: isDark ? "#0D0D0D" : "#f8fafc",
      bgPaper: isDark ? "#111111" : "#ffffff",
      sidebarBg: isDark ? "#0D0D0D" : "#ffffff",
      border: isDark ? "#1f1f1f" : "#e2e8f0",
      borderHover: isDark ? "#333333" : "#cbd5e1",
      textPrimary: isDark ? "#F5F5F0" : "#0f172a",
      textSecondary: isDark ? "#888888" : "#64748b",
      textMuted: isDark ? "#555555" : "#94a3b8",
      activeNavBg: isDark ? "#0a1f1c" : "#e6f4f2",
      activeNavBorder: isDark ? "#0d3830" : "#a7d4ce",
      hoverBg: isDark ? "#161616" : "#f1f5f9",
      tableHeadBg: isDark ? "#111111" : "#f8fafc",
      tableRowBorder: isDark ? "#151515" : "#f1f5f9",
      menuShadow: isDark
        ? "0 8px 32px rgba(0,0,0,0.8)"
        : "0 8px 32px rgba(0,0,0,0.12)"
    }),
    [isDark]
  )

  const T = "0.3s ease"

  const STATS = [
    {
      label: "Total Products",
      value: "3",
      delta: "+0 minggu ini",
      trend: "neutral" as const,
      spark: [2, 2, 3, 3, 3, 3, 3],
      sparkColor: "#087463"
    },
    {
      label: "Low Stock Alerts",
      value: "1",
      delta: "1 perlu restok",
      trend: "down" as const,
      spark: [0, 0, 1, 0, 1, 1, 1],
      sparkColor: "#f59e0b"
    },
    {
      label: "Gross Revenue",
      value: "Rp 0",
      delta: "belum ada penjualan",
      trend: "neutral" as const,
      spark: [0, 0, 0, 0, 0, 0, 0],
      sparkColor: "#3b82f6"
    },
    {
      label: "Total Sold",
      value: "0",
      delta: "all products",
      trend: "neutral" as const,
      spark: [0, 0, 0, 0, 0, 0, 0],
      sparkColor: "#8b5cf6"
    }
  ]

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: p.bg,
          fontFamily: "'DM Mono', monospace",
          transition: `background-color ${T}`
        }}
      >
        {/* ── SIDEBAR MOBILE ── */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              bgcolor: p.sidebarBg,
              borderRight: `1px solid ${p.border}`
            }
          }}
        >
          <Sidebar p={p} isDark={isDark} T={T} />
        </Drawer>

        {/* ── SIDEBAR DESKTOP ── */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              bgcolor: p.sidebarBg,
              borderRight: `1px solid ${p.border}`,
              pt: 1,
              transition: `background-color ${T}, border-color ${T}`
            }
          }}
        >
          <Sidebar p={p} isDark={isDark} T={T} />
        </Drawer>

        {/* ── MAIN CONTENT ── */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0
          }}
        >
          <Header
            isDark={isDark}
            onToggleTheme={() => setIsDark((v) => !v)}
            onMenuClick={() => setMobileOpen(true)}
            onAddProduct={() => {}}
            title="Dashboard"
            breadcrumb="STOCKR / DASHBOARD"
            showAddButton={false}
            notificationCount={3}
            p={p}
          />

          <Box sx={{ flex: 1, overflow: "auto", p: { xs: 2, md: 4 } }}>
            {/* ── STAT CARDS ── */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  lg: "repeat(4, 1fr)"
                },
                gap: { xs: 1.5, md: 2 },
                mb: { xs: 3, md: 4 }
              }}
            >
              {STATS.map((s) => (
                <StatCard key={s.label} {...s} p={p} />
              ))}
            </Box>

            {/* ── ROW 2: CHART + ACTIVITY ── */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1fr 340px" },
                gap: 2,
                mb: 2
              }}
            >
              {/* Weekly Sales Chart */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: `1px solid ${p.border}`,
                  bgcolor: p.bgPaper
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2.5
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: p.textMuted,
                        fontSize: 10,
                        letterSpacing: "0.08em"
                      }}
                    >
                      WEEKLY OVERVIEW
                    </Typography>
                    <Typography
                      sx={{
                        color: p.textPrimary,
                        fontSize: 15,
                        fontWeight: 700,
                        mt: 0.3
                      }}
                    >
                      Aktivitas 7 Hari
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "#087463"
                        }}
                      />
                      <Typography sx={{ color: p.textMuted, fontSize: 10 }}>
                        Sales
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "#3b82f6"
                        }}
                      />
                      <Typography sx={{ color: p.textMuted, fontSize: 10 }}>
                        Stock
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Dual bar chart */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 1,
                    height: 120,
                    px: 1
                  }}
                >
                  {WEEKLY_DATA.map((d, i) => {
                    const maxSales = Math.max(
                      ...WEEKLY_DATA.map((x) => x.sales)
                    )
                    const maxStock = Math.max(
                      ...WEEKLY_DATA.map((x) => x.stock)
                    )
                    const salesH = (d.sales / maxSales) * 100
                    const stockH = (d.stock / maxStock) * 100
                    const isToday = i === WEEKLY_DATA.length - 1
                    return (
                      <Box
                        key={d.day}
                        sx={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          height: "100%"
                        }}
                      >
                        <Box
                          sx={{
                            flex: 1,
                            width: "100%",
                            display: "flex",
                            alignItems: "flex-end",
                            gap: "2px",
                            px: "2px"
                          }}
                        >
                          <Box
                            sx={{
                              flex: 1,
                              height: `${salesH}%`,
                              bgcolor: "#087463",
                              opacity: isToday ? 1 : 0.4,
                              borderRadius: "2px 2px 0 0",
                              transition: "all 0.3s",
                              "&:hover": { opacity: 1 }
                            }}
                          />
                          <Box
                            sx={{
                              flex: 1,
                              height: `${stockH}%`,
                              bgcolor: "#3b82f6",
                              opacity: isToday ? 1 : 0.35,
                              borderRadius: "2px 2px 0 0",
                              transition: "all 0.3s",
                              "&:hover": { opacity: 1 }
                            }}
                          />
                        </Box>
                        <Typography
                          sx={{
                            color: p.textMuted,
                            fontSize: 9,
                            mt: 0.5,
                            fontWeight: isToday ? 700 : 400
                          }}
                        >
                          {d.day}
                        </Typography>
                      </Box>
                    )
                  })}
                </Box>

                <Divider sx={{ borderColor: p.border, my: 2 }} />

                {/* Summary row */}
                <Box sx={{ display: "flex", gap: 3 }}>
                  {[
                    {
                      label: "Avg Sales / Hari",
                      value: String(
                        Math.round(
                          WEEKLY_DATA.reduce((s, d) => s + d.sales, 0) / 7
                        )
                      ),
                      color: "#087463"
                    },
                    {
                      label: "Total Transaksi",
                      value: String(
                        WEEKLY_DATA.reduce((s, d) => s + d.sales, 0)
                      ),
                      color: "#3b82f6"
                    },
                    {
                      label: "Avg Stock",
                      value: String(
                        Math.round(
                          WEEKLY_DATA.reduce((s, d) => s + d.stock, 0) / 7
                        )
                      ),
                      color: p.textMuted
                    }
                  ].map((item) => (
                    <Box key={item.label}>
                      <Typography
                        sx={{
                          color: p.textMuted,
                          fontSize: 9,
                          letterSpacing: "0.06em"
                        }}
                      >
                        {item.label.toUpperCase()}
                      </Typography>
                      <Typography
                        sx={{
                          color: item.color,
                          fontSize: 18,
                          fontWeight: 800,
                          letterSpacing: "-0.02em"
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>

              {/* Activity Timeline */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: `1px solid ${p.border}`,
                  bgcolor: p.bgPaper,
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <Typography
                  sx={{
                    color: p.textMuted,
                    fontSize: 10,
                    letterSpacing: "0.08em"
                  }}
                >
                  ACTIVITY LOG
                </Typography>
                <Typography
                  sx={{
                    color: p.textPrimary,
                    fontSize: 15,
                    fontWeight: 700,
                    mt: 0.3,
                    mb: 2
                  }}
                >
                  Aktivitas Hari Ini
                </Typography>

                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0
                  }}
                >
                  {ACTIVITIES.map((act, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        position: "relative",
                        pb: i < ACTIVITIES.length - 1 ? 1.5 : 0
                      }}
                    >
                      {/* Line */}
                      {i < ACTIVITIES.length - 1 && (
                        <Box
                          sx={{
                            position: "absolute",
                            left: 27,
                            top: 20,
                            bottom: 0,
                            width: "1px",
                            bgcolor: p.border
                          }}
                        />
                      )}

                      {/* Time */}
                      <Typography
                        sx={{
                          color: p.textMuted,
                          fontSize: 10,
                          minWidth: 40,
                          mt: "3px",
                          fontVariantNumeric: "tabular-nums"
                        }}
                      >
                        {act.time}
                      </Typography>

                      {/* Dot */}
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: activityColor(act.type),
                          flexShrink: 0,
                          mt: "4px",
                          boxShadow: `0 0 0 3px ${activityColor(act.type)}22`
                        }}
                      />

                      {/* Content */}
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            color: p.textPrimary,
                            fontSize: 11,
                            fontWeight: 600,
                            lineHeight: 1.3
                          }}
                        >
                          {act.action}
                        </Typography>
                        <Typography
                          sx={{ color: p.textSecondary, fontSize: 10 }}
                        >
                          {act.detail}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>

            {/* ── ROW 3: TOP PRODUCTS + STOCK STATUS ── */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1fr 260px" },
                gap: 2
              }}
            >
              {/* Top Products Table */}
              <Paper
                elevation={0}
                sx={{
                  border: `1px solid ${p.border}`,
                  bgcolor: p.bgPaper,
                  overflow: "hidden"
                }}
              >
                <Box
                  sx={{
                    px: 2.5,
                    pt: 2.5,
                    pb: 1.5,
                    borderBottom: `1px solid ${p.border}`
                  }}
                >
                  <Typography
                    sx={{
                      color: p.textMuted,
                      fontSize: 10,
                      letterSpacing: "0.08em"
                    }}
                  >
                    PERFORMANCE
                  </Typography>
                  <Typography
                    sx={{
                      color: p.textPrimary,
                      fontSize: 15,
                      fontWeight: 700,
                      mt: 0.3
                    }}
                  >
                    Top Produk
                  </Typography>
                </Box>

                {/* Header */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "32px 1fr 80px 90px 80px 60px",
                    px: 2.5,
                    py: 1,
                    bgcolor: p.tableHeadBg,
                    borderBottom: `1px solid ${p.border}`
                  }}
                >
                  {["#", "PRODUK", "KATEGORI", "REVENUE", "SOLD", ""].map(
                    (h, i) => (
                      <Typography
                        key={i}
                        sx={{
                          color: p.textMuted,
                          fontSize: 9,
                          letterSpacing: "0.1em",
                          fontWeight: 700
                        }}
                      >
                        {h}
                      </Typography>
                    )
                  )}
                </Box>

                {TOP_PRODUCTS.map((prod, i) => (
                  <Box
                    key={prod.rank}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "32px 1fr 80px 90px 80px 60px",
                      px: 2.5,
                      py: 1.5,
                      borderBottom:
                        i < TOP_PRODUCTS.length - 1
                          ? `1px solid ${p.tableRowBorder}`
                          : "none",
                      "&:hover": { bgcolor: p.hoverBg },
                      alignItems: "center",
                      transition: "background 0.15s"
                    }}
                  >
                    <Typography
                      sx={{
                        color: prod.rank === 1 ? "#087463" : p.textMuted,
                        fontSize: 12,
                        fontWeight: prod.rank === 1 ? 800 : 400
                      }}
                    >
                      {String(prod.rank).padStart(2, "0")}
                    </Typography>
                    <Typography
                      sx={{
                        color: p.textPrimary,
                        fontSize: 13,
                        fontWeight: 600
                      }}
                    >
                      {prod.name}
                    </Typography>
                    <Typography sx={{ color: p.textSecondary, fontSize: 11 }}>
                      {prod.category}
                    </Typography>
                    <Typography
                      sx={{
                        color: p.textPrimary,
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      {(prod.revenue / 1_000_000).toFixed(1)}M
                    </Typography>
                    <Typography sx={{ color: p.textSecondary, fontSize: 12 }}>
                      {prod.sold}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Chip
                        label={prod.trend === "up" ? "↑" : "↓"}
                        size="small"
                        sx={{
                          bgcolor:
                            prod.trend === "up"
                              ? isDark
                                ? "#1a2e1a"
                                : "#f0fdf4"
                              : isDark
                                ? "#2e1010"
                                : "#fef2f2",
                          color: prod.trend === "up" ? "#16a34a" : "#dc2626",
                          fontSize: 10,
                          height: 20,
                          fontWeight: 700,
                          border: `1px solid ${
                            prod.trend === "up"
                              ? isDark
                                ? "#2d5a2d"
                                : "#bbf7d0"
                              : isDark
                                ? "#5a1a1a"
                                : "#fecaca"
                          }`
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Paper>

              {/* Stock Status Donut-like */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: `1px solid ${p.border}`,
                  bgcolor: p.bgPaper
                }}
              >
                <Typography
                  sx={{
                    color: p.textMuted,
                    fontSize: 10,
                    letterSpacing: "0.08em"
                  }}
                >
                  STOCK STATUS
                </Typography>
                <Typography
                  sx={{
                    color: p.textPrimary,
                    fontSize: 15,
                    fontWeight: 700,
                    mt: 0.3,
                    mb: 2.5
                  }}
                >
                  Distribusi
                </Typography>

                {[
                  { label: "In Stock", count: 2, total: 3, color: "#087463" },
                  { label: "Low Stock", count: 1, total: 3, color: "#f59e0b" },
                  {
                    label: "Out of Stock",
                    count: 0,
                    total: 3,
                    color: "#ef4444"
                  }
                ].map((item) => (
                  <Box key={item.label} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5
                      }}
                    >
                      <Typography sx={{ color: p.textSecondary, fontSize: 11 }}>
                        {item.label}
                      </Typography>
                      <Typography
                        sx={{
                          color: p.textPrimary,
                          fontSize: 11,
                          fontWeight: 700
                        }}
                      >
                        {item.count}/{item.total}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: isDark ? "#1f1f1f" : "#e2e8f0",
                        overflow: "hidden"
                      }}
                    >
                      <Box
                        sx={{
                          width: `${(item.count / item.total) * 100}%`,
                          height: "100%",
                          bgcolor: item.color,
                          borderRadius: 2,
                          transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)"
                        }}
                      />
                    </Box>
                  </Box>
                ))}

                <Divider sx={{ borderColor: p.border, my: 2 }} />

                {/* Summary badges */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      p: 1.5,
                      borderRadius: "4px",
                      bgcolor: isDark ? "#0a1f1c" : "#e6f4f2",
                      border: `1px solid ${isDark ? "#0d3830" : "#a7d4ce"}`
                    }}
                  >
                    <Typography sx={{ color: "#087463", fontSize: 11 }}>
                      Total Produk
                    </Typography>
                    <Typography
                      sx={{ color: "#087463", fontSize: 13, fontWeight: 800 }}
                    >
                      3
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      p: 1.5,
                      borderRadius: "4px",
                      bgcolor: isDark ? "#2e2010" : "#fff7ed",
                      border: `1px solid ${isDark ? "#5a3a10" : "#fed7aa"}`
                    }}
                  >
                    <Typography sx={{ color: "#f59e0b", fontSize: 11 }}>
                      Perlu Perhatian
                    </Typography>
                    <Typography
                      sx={{ color: "#f59e0b", fontSize: 13, fontWeight: 800 }}
                    >
                      1
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
