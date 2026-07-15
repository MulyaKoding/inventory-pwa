"use client"

import { Chip, Drawer } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import { cn } from "../../lib/utils"
import Header from "../components/header/page"
import Sidebar from "../components/sidebar"
import { useTheme } from "../hooks/useTheme"

const DRAWER_WIDTH = 220

// ── WEEKLY DATA (static display data, tidak berubah) ────────────────────────
const WEEKLY_DATA = [
  { day: "Sen", sales: 42, stock: 120 },
  { day: "Sel", sales: 78, stock: 98 },
  { day: "Rab", sales: 55, stock: 110 },
  { day: "Kam", sales: 91, stock: 85 },
  { day: "Jum", sales: 63, stock: 102 },
  { day: "Sab", sales: 110, stock: 77 },
  { day: "Min", sales: 87, stock: 93 }
]

// ── ACTIVITY (static display data) ─────────────────────────────────────────
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

// ── SPARK LINE ──────────────────────────────────────────────────────────────
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

// ── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  delta,
  trend,
  spark,
  sparkColor,
  isDark
}: {
  label: string
  value: string
  delta: string
  trend: "up" | "down" | "neutral"
  spark: number[]
  sparkColor: string
  isDark: boolean
}) {
  const trendTextClass =
    trend === "up"
      ? "text-[#16a34a]"
      : trend === "down"
        ? "text-[#dc2626]"
        : isDark
          ? "text-[#555555]"
          : "text-[#94a3b8]"
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→"
  const topBarClass =
    trend === "up"
      ? "bg-[#087463]"
      : trend === "down"
        ? "bg-[#FF6B35]"
        : isDark
          ? "bg-[#1f1f1f]"
          : "bg-[#e2e8f0]"

  return (
    <div
      className={cn(
        "relative overflow-hidden border p-4 md:p-2.5",
        isDark ? "bg-[#111111] border-[#1f1f1f]" : "bg-white border-[#e2e8f0]"
      )}
    >
      <span className={cn("absolute inset-x-0 top-0 h-0.5", topBarClass)} />
      <div className="flex items-start justify-between">
        <div>
          <p
            className={cn(
              "mb-1 text-[10px] tracking-[0.08em]",
              isDark ? "text-[#555555]" : "text-[#94a3b8]"
            )}
          >
            {label.toUpperCase()}
          </p>
          <p
            className={cn(
              "text-[20px] font-extrabold leading-none tracking-[-0.02em] md:text-[28px]",
              isDark ? "text-[#F5F5F0]" : "text-[#0f172a]"
            )}
          >
            {value}
          </p>
          <p className={cn("mt-0.75 text-[11px]", trendTextClass)}>
            {trendIcon} {delta}
          </p>
        </div>
        <SparkLine values={spark} color={sparkColor} />
      </div>
    </div>
  )
}

// ── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { isDark, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  // Fetch real product data — sama seperti di Inventory
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true)
      try {
        const res = await fetch("/api/products")
        const data = await res.json()
        setProducts(data.map((p: any) => ({ ...p, id: p.id || p._id })))
      } catch (err) {
        console.error("Gagal mengambil data produk", err)
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [])

  // ── Derived stats dari real product data ──────────────────────────────────
  const stats = useMemo(() => {
    const total = products.length
    const lowStockCount = products.filter(
      (p) => p.status === "Low Stock" || p.status === "Out of Stock"
    ).length
    const totalSold = products.reduce((sum, p) => sum + (p.sold || 0), 0)
    const revenue = products.reduce(
      (sum, p) => sum + (p.price || 0) * (p.sold || 0),
      0
    )
    const revenueStr =
      revenue >= 1_000_000_000
        ? `Rp ${(revenue / 1_000_000_000).toFixed(1)}B`
        : revenue >= 1_000_000
          ? `Rp ${(revenue / 1_000_000).toFixed(1)}M`
          : `Rp ${revenue.toLocaleString("id-ID")}`

    return [
      {
        label: "Total Products",
        value: String(total),
        delta: `${total} item`,
        trend: "neutral" as const,
        spark: [total, total, total, total, total, total, total],
        sparkColor: "#087463"
      },
      {
        label: "Low Stock Alerts",
        value: String(lowStockCount),
        delta:
          lowStockCount > 0 ? `${lowStockCount} perlu restok` : "semua aman",
        trend: (lowStockCount > 0 ? "down" : "up") as "up" | "down" | "neutral",
        spark: [0, 0, 0, 0, 0, 0, lowStockCount],
        sparkColor: "#f59e0b"
      },
      {
        label: "Gross Revenue",
        value: revenueStr,
        delta: revenue > 0 ? "dari semua produk" : "belum ada penjualan",
        trend: (revenue > 0 ? "up" : "neutral") as "up" | "down" | "neutral",
        spark: [0, 0, 0, 0, 0, 0, revenue > 0 ? 1 : 0],
        sparkColor: "#3b82f6"
      },
      {
        label: "Total Sold",
        value: String(totalSold),
        delta: "all products",
        trend: (totalSold > 0 ? "up" : "neutral") as "up" | "down" | "neutral",
        spark: [0, 0, 0, 0, 0, 0, totalSold > 0 ? 1 : 0],
        sparkColor: "#8b5cf6"
      }
    ]
  }, [products])

  // ── Top products sorted by sold ───────────────────────────────────────────
  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 5)
      .map((p, i) => ({ ...p, rank: i + 1 }))
  }, [products])

  // ── Stock distribution ────────────────────────────────────────────────────
  const stockDist = useMemo(() => {
    const inStock = products.filter((p) => p.status === "In Stock").length
    const lowStock = products.filter((p) => p.status === "Low Stock").length
    const outOfStock = products.filter(
      (p) => p.status === "Out of Stock"
    ).length
    return { total: products.length, inStock, lowStock, outOfStock }
  }, [products])

  // Object hex tetap dipertahankan untuk komponen anak (Header, Sidebar) yang
  // masih mengharapkan token warna dalam bentuk ini.
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

  // ── Kelas Tailwind terpusat, dikomposisi lewat cn() menggantikan sx ───────
  const cls = useMemo(
    () => ({
      page: cn(
        "flex min-h-screen font-nunito transition-colors duration-300",
        isDark ? "bg-[#0D0D0D]" : "bg-[#f8fafc]"
      ),
      panel: cn(
        "border",
        isDark ? "bg-[#111111] border-[#1f1f1f]" : "bg-white border-[#e2e8f0]"
      ),
      textMuted: cn(
        "text-[10px] tracking-[0.08em]",
        isDark ? "text-[#555555]" : "text-[#94a3b8]"
      ),
      textMutedXs: cn(
        "text-[9px] tracking-[0.06em]",
        isDark ? "text-[#555555]" : "text-[#94a3b8]"
      ),
      title: cn(
        "mt-0.75 text-[15px] font-bold",
        isDark ? "text-[#F5F5F0]" : "text-[#0f172a]"
      ),
      textPrimary: isDark ? "text-[#F5F5F0]" : "text-[#0f172a]",
      textSecondary: isDark ? "text-[#888888]" : "text-[#64748b]",
      divider: isDark ? "border-[#1f1f1f]" : "border-[#e2e8f0]",
      rowBorder: isDark ? "border-[#151515]" : "border-[#f1f5f9]",
      tableHead: isDark ? "bg-[#111111]" : "bg-[#f8fafc]",
      hover: isDark ? "hover:bg-[#161616]" : "hover:bg-[#f1f5f9]",
      trackBg: isDark ? "bg-[#1f1f1f]" : "bg-[#e2e8f0]",
      totalBadge: cn(
        "border",
        isDark
          ? "bg-[#0a1f1c] border-[#0d3830]"
          : "bg-[#e6f4f2] border-[#a7d4ce]"
      ),
      warnBadge: cn(
        "border",
        isDark
          ? "bg-[#2e2010] border-[#5a3a10]"
          : "bg-[#fff7ed] border-[#fed7aa]"
      )
    }),
    [isDark]
  )

  const T = "transition-colors duration-300"

  return (
    <div className={cls.page}>
      {/* ── SIDEBAR MOBILE ── */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        className="block md:hidden"
        sx={{
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: "transparent",
            border: "none",
            overflow: "hidden"
          }
        }}
      >
        <Sidebar isDark={isDark} T={T} />
      </Drawer>

      {/* ── SIDEBAR DESKTOP ── */}
      <Drawer
        variant="permanent"
        className="hidden md:block"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: "transparent",
            border: "none",
            overflow: "hidden"
          }
        }}
      >
        <Sidebar isDark={isDark} T={T} />
      </Drawer>

      {/* ── MAIN CONTENT ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onMenuClick={() => setMobileOpen(true)}
          onAddProduct={() => {}}
          title="Dashboard"
          showAddButton={false}
          notificationCount={3}
          p={p}
        />

        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* ── STAT CARDS (dari real API) ── */}
          <div className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} isDark={isDark} />
            ))}
          </div>

          {/* ── ROW 2: CHART + ACTIVITY ── */}
          <div className="mb-2 grid grid-cols-1 gap-2 lg:grid-cols-[1fr_340px]">
            {/* Weekly Sales Chart */}
            <div className={cn(cls.panel, "p-2.5")}>
              <div className="mb-2.5 flex items-start justify-between">
                <div>
                  <p className={cls.textMuted}>WEEKLY OVERVIEW</p>
                  <p className={cls.title}>Aktivitas 7 Hari</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    <span className="h-2 w-2 rounded-full bg-[#087463]" />
                    <p
                      className={cn(
                        "text-[10px]",
                        isDark ? "text-[#555555]" : "text-[#94a3b8]"
                      )}
                    >
                      Sales
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="h-2 w-2 rounded-full bg-brand-500" />
                    <p
                      className={cn(
                        "text-[10px]",
                        isDark ? "text-[#555555]" : "text-[#94a3b8]"
                      )}
                    >
                      Stock
                    </p>
                  </div>
                </div>
              </div>

              {/* Dual bar chart */}
              <div className="flex h-30 items-end gap-1 px-1">
                {WEEKLY_DATA.map((d, i) => {
                  const maxSales = Math.max(...WEEKLY_DATA.map((x) => x.sales))
                  const maxStock = Math.max(...WEEKLY_DATA.map((x) => x.stock))
                  const salesH = (d.sales / maxSales) * 100
                  const stockH = (d.stock / maxStock) * 100
                  const isToday = i === WEEKLY_DATA.length - 1
                  return (
                    <div
                      key={d.day}
                      className="flex h-full flex-1 flex-col items-center"
                    >
                      <div className="flex w-full flex-1 items-end gap-0.5 px-0.5">
                        <div
                          className={cn(
                            "flex-1 rounded-t-xs bg-[#087463] transition-all duration-300 hover:opacity-100",
                            isToday ? "opacity-100" : "opacity-40"
                          )}
                          style={{ height: `${salesH}%` }}
                        />
                        <div
                          className={cn(
                            "flex-1 rounded-t-xs bg-brand-500 transition-all duration-300 hover:opacity-100",
                            isToday ? "opacity-100" : "opacity-35"
                          )}
                          style={{ height: `${stockH}%` }}
                        />
                      </div>
                      <p
                        className={cn(
                          "mt-1 text-[9px]",
                          isDark ? "text-[#555555]" : "text-[#94a3b8]",
                          isToday ? "font-bold" : "font-normal"
                        )}
                      >
                        {d.day}
                      </p>
                    </div>
                  )
                })}
              </div>

              <hr className={cn("my-4 border-t", cls.divider)} />

              {/* Summary row */}
              <div className="flex gap-6">
                {[
                  {
                    label: "Avg Sales / Hari",
                    value: String(
                      Math.round(
                        WEEKLY_DATA.reduce((s, d) => s + d.sales, 0) / 7
                      )
                    ),
                    colorClass: "text-[#087463]"
                  },
                  {
                    label: "Total Transaksi",
                    value: String(WEEKLY_DATA.reduce((s, d) => s + d.sales, 0)),
                    colorClass: "text-[#3b82f6]"
                  },
                  {
                    label: "Avg Stock",
                    value: String(
                      Math.round(
                        WEEKLY_DATA.reduce((s, d) => s + d.stock, 0) / 7
                      )
                    ),
                    colorClass: isDark ? "text-[#555555]" : "text-[#94a3b8]"
                  }
                ].map((item) => (
                  <div key={item.label}>
                    <p className={cls.textMutedXs}>
                      {item.label.toUpperCase()}
                    </p>
                    <p
                      className={cn(
                        "text-lg font-extrabold tracking-[-0.02em]",
                        item.colorClass
                      )}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Timeline */}
            <div className={cn(cls.panel, "flex flex-col p-2.5")}>
              <p className={cls.textMuted}>ACTIVITY LOG</p>
              <p className={cn(cls.title, "mb-2")}>Aktivitas Hari Ini</p>

              <div className="flex flex-1 flex-col gap-0">
                {ACTIVITIES.map((act, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative flex gap-1.5",
                      i < ACTIVITIES.length - 1 ? "pb-1.5" : ""
                    )}
                  >
                    {i < ACTIVITIES.length - 1 && (
                      <span
                        className={cn(
                          "absolute bottom-0 top-5 w-px",
                          isDark ? "bg-[#1f1f1f]" : "bg-[#e2e8f0]"
                        )}
                        style={{ left: 27 }}
                      />
                    )}
                    <p
                      className={cn(
                        "mt-0.75 min-w-10 text-[10px] tabular-nums",
                        isDark ? "text-[#555555]" : "text-[#94a3b8]"
                      )}
                    >
                      {act.time}
                    </p>
                    <span
                      className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: activityColor(act.type),
                        boxShadow: `0 0 0 3px ${activityColor(act.type)}22`
                      }}
                    />
                    <div className="flex-1">
                      <p
                        className={cn(
                          "text-[11px] font-semibold leading-tight",
                          isDark ? "text-[#F5F5F0]" : "text-[#0f172a]"
                        )}
                      >
                        {act.action}
                      </p>
                      <p
                        className={cn(
                          "text-[10px]",
                          isDark ? "text-[#888888]" : "text-[#64748b]"
                        )}
                      >
                        {act.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── ROW 3: TOP PRODUCTS (dari real API) + STOCK STATUS ── */}
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_260px]">
            {/* Top Products — sorted by sold dari real data */}
            <div className={cn(cls.panel, "overflow-hidden")}>
              <div className={cn("border-b px-2.5 pb-1.5 pt-2.5", cls.divider)}>
                <p className={cls.textMuted}>PERFORMANCE</p>
                <p className={cls.title}>Top Produk</p>
              </div>

              {/* Header */}
              <div
                className={cn(
                  "grid grid-cols-[32px_1fr_80px_100px_80px_60px] border-b px-2.5 py-2",
                  cls.tableHead,
                  cls.divider
                )}
              >
                {["#", "PRODUK", "KATEGORI", "REVENUE", "SOLD", ""].map(
                  (h, i) => (
                    <p
                      key={i}
                      className={cn(
                        "text-[9px] font-bold tracking-widest",
                        isDark ? "text-[#555555]" : "text-[#94a3b8]"
                      )}
                    >
                      {h}
                    </p>
                  )
                )}
              </div>

              {loadingProducts ? (
                <div className="px-2.5 py-6">
                  <p
                    className={cn(
                      "text-xs",
                      isDark ? "text-[#555555]" : "text-[#94a3b8]"
                    )}
                  >
                    Memuat data produk...
                  </p>
                </div>
              ) : topProducts.length === 0 ? (
                <div className="px-2.5 py-6">
                  <p
                    className={cn(
                      "text-xs",
                      isDark ? "text-[#555555]" : "text-[#94a3b8]"
                    )}
                  >
                    Belum ada produk.
                  </p>
                </div>
              ) : (
                topProducts.map((prod, i) => {
                  const revenue = (prod.price || 0) * (prod.sold || 0)
                  const revenueStr =
                    revenue >= 1_000_000_000
                      ? `${(revenue / 1_000_000_000).toFixed(1)}B`
                      : revenue >= 1_000_000
                        ? `${(revenue / 1_000_000).toFixed(1)}M`
                        : revenue.toLocaleString("id-ID")
                  const prevSold =
                    i > 0 ? topProducts[i - 1].sold || 0 : (prod.sold || 0) + 1
                  const trend = (prod.sold || 0) >= prevSold ? "up" : "down"

                  return (
                    <div
                      key={prod.id}
                      className={cn(
                        "grid grid-cols-[32px_1fr_80px_100px_80px_60px] items-center px-2.5 py-3 transition-colors",
                        cls.hover,
                        i < topProducts.length - 1
                          ? cn("border-b", cls.rowBorder)
                          : ""
                      )}
                    >
                      <p
                        className={cn(
                          "text-xs",
                          prod.rank === 1
                            ? "font-extrabold text-[#087463]"
                            : cn(
                                "font-normal",
                                isDark ? "text-[#555555]" : "text-[#94a3b8]"
                              )
                        )}
                      >
                        {String(prod.rank).padStart(2, "0")}
                      </p>
                      <p
                        className={cn(
                          "text-[13px] font-semibold",
                          isDark ? "text-[#F5F5F0]" : "text-[#0f172a]"
                        )}
                      >
                        {prod.name}
                      </p>
                      <p
                        className={cn(
                          "text-[11px]",
                          isDark ? "text-[#888888]" : "text-[#64748b]"
                        )}
                      >
                        {prod.category}
                      </p>
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          isDark ? "text-[#F5F5F0]" : "text-[#0f172a]"
                        )}
                      >
                        {revenueStr}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          isDark ? "text-[#888888]" : "text-[#64748b]"
                        )}
                      >
                        {(prod.sold || 0).toLocaleString()}
                      </p>
                      <div className="flex justify-end">
                        <Chip
                          label={trend === "up" ? "↑" : "↓"}
                          size="small"
                          className="h-5! text-[10px]! font-bold!"
                          sx={{
                            bgcolor:
                              trend === "up"
                                ? isDark
                                  ? "#1a2e1a"
                                  : "#f0fdf4"
                                : isDark
                                  ? "#2e1010"
                                  : "#fef2f2",
                            color: trend === "up" ? "#16a34a" : "#dc2626",
                            border: `1px solid ${
                              trend === "up"
                                ? isDark
                                  ? "#2d5a2d"
                                  : "#bbf7d0"
                                : isDark
                                  ? "#5a1a1a"
                                  : "#fecaca"
                            }`
                          }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Stock Status Distribution — dari real data */}
            <div className={cn(cls.panel, "p-2.5")}>
              <p className={cls.textMuted}>STOCK STATUS</p>
              <p className={cn(cls.title, "mb-2.5")}>Distribusi</p>

              {[
                {
                  label: "In Stock",
                  count: stockDist.inStock,
                  total: stockDist.total || 1,
                  colorClass: "bg-[#087463]"
                },
                {
                  label: "Low Stock",
                  count: stockDist.lowStock,
                  total: stockDist.total || 1,
                  colorClass: "bg-[#f59e0b]"
                },
                {
                  label: "Out of Stock",
                  count: stockDist.outOfStock,
                  total: stockDist.total || 1,
                  colorClass: "bg-[#ef4444]"
                }
              ].map((item) => (
                <div key={item.label} className="mb-4">
                  <div className="mb-1 flex justify-between">
                    <p
                      className={cn(
                        "text-[11px]",
                        isDark ? "text-[#888888]" : "text-[#64748b]"
                      )}
                    >
                      {item.label}
                    </p>
                    <p
                      className={cn(
                        "text-[11px] font-bold",
                        isDark ? "text-[#F5F5F0]" : "text-[#0f172a]"
                      )}
                    >
                      {item.count}/{stockDist.total}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "h-1 overflow-hidden rounded-full",
                      cls.trackBg
                    )}
                  >
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        item.colorClass
                      )}
                      style={{ width: `${(item.count / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}

              <hr className={cn("my-4 border-t", cls.divider)} />

              {/* Summary badges */}
              <div className="flex flex-col gap-2">
                <div
                  className={cn(
                    "flex justify-between rounded p-3",
                    cls.totalBadge
                  )}
                >
                  <p className="text-[11px] text-[#087463]">Total Produk</p>
                  <p className="text-[13px] font-extrabold text-[#087463]">
                    {stockDist.total}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex justify-between rounded p-3",
                    cls.warnBadge
                  )}
                >
                  <p className="text-[11px] text-[#f59e0b]">Perlu Perhatian</p>
                  <p className="text-[13px] font-extrabold text-[#f59e0b]">
                    {stockDist.lowStock + stockDist.outOfStock}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
