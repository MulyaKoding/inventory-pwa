"use client"

import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
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
  Snackbar,
  Tooltip,
  Typography
} from "@mui/material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowModel,
  GridRowsProp,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
  useGridApiContext
} from "@mui/x-data-grid"
import { useCallback, useMemo, useState } from "react"

// ── ICONS ────────────────────────────────────────────────────────────────────
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

const MoonIcon = ({
  size = 18,
  color = "currentColor"
}: {
  size?: number
  color?: string
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    stroke="none"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const SunIcon = ({
  size = 18,
  color = "currentColor"
}: {
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
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

// ── INITIAL DATA ──────────────────────────────────────────────────────────────
const INITIAL_ROWS: GridRowsProp = [
  {
    id: "PRD-001",
    name: "Wireless Headphones Pro",
    category: "Electronics",
    sku: "WHP-9X",
    stock: 124,
    price: 299000,
    status: "In Stock",
    sold: 87
  },
  {
    id: "PRD-002",
    name: "Cotton Oversized Tee",
    category: "Apparel",
    sku: "COT-OS-BLK",
    stock: 8,
    price: 189000,
    status: "Low Stock",
    sold: 312
  },
  {
    id: "PRD-003",
    name: "Smart Desk Lamp",
    category: "Home",
    sku: "SDL-USB-W",
    stock: 0,
    price: 450000,
    status: "Out of Stock",
    sold: 54
  },
  {
    id: "PRD-004",
    name: "Precision Screwdriver Set",
    category: "Tools",
    sku: "PSS-32PC",
    stock: 67,
    price: 125000,
    status: "In Stock",
    sold: 201
  },
  {
    id: "PRD-005",
    name: "Vitamin C Serum 30ml",
    category: "Beauty",
    sku: "VCS-30-P",
    stock: 15,
    price: 220000,
    status: "Low Stock",
    sold: 445
  },
  {
    id: "PRD-006",
    name: "Mechanical Keyboard TKL",
    category: "Electronics",
    sku: "MKB-TKL-R",
    stock: 39,
    price: 875000,
    status: "In Stock",
    sold: 129
  },
  {
    id: "PRD-007",
    name: "Linen Throw Blanket",
    category: "Home",
    sku: "LTB-NAT-L",
    stock: 93,
    price: 340000,
    status: "In Stock",
    sold: 76
  },
  {
    id: "PRD-008",
    name: "Retinol Night Cream",
    category: "Beauty",
    sku: "RNC-50G",
    stock: 4,
    price: 195000,
    status: "Low Stock",
    sold: 388
  }
]

const CATEGORIES = ["Electronics", "Apparel", "Home", "Tools", "Beauty"]
const STATUSES = ["In Stock", "Low Stock", "Out of Stock"]

const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"
  },
  {
    label: "Inventory",
    icon: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 3H8L6 7h12z",
    active: true
  },
  {
    label: "Orders",
    icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
  },
  { label: "Analytics", icon: "M3 3v18h18M18 9l-5 5-4-4-4 4" },
  {
    label: "Settings",
    icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a7.1 7.1 0 0 0 .1-1v-2a7.1 7.1 0 0 0-.1-1l2.2-1.6a.5.5 0 0 0 .1-.6l-2-3.5a.5.5 0 0 0-.6-.2l-2.6 1a6.8 6.8 0 0 0-1.7-1l-.4-2.7A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.5.4l-.4 2.8a6.8 6.8 0 0 0-1.7 1l-2.6-1a.5.5 0 0 0-.6.2L2.2 8.9a.5.5 0 0 0 .1.6L4.5 11a7.1 7.1 0 0 0-.1 1v2a7.1 7.1 0 0 0 .1 1L2.3 16.6a.5.5 0 0 0-.1.6l2 3.5a.5.5 0 0 0 .6.2l2.6-1a6.8 6.8 0 0 0 1.7 1l.4 2.7a.5.5 0 0 0 .5.4h4a.5.5 0 0 0 .5-.4l.4-2.7a6.8 6.8 0 0 0 1.7-1l2.6 1a.5.5 0 0 0 .6-.2l2-3.5a.5.5 0 0 0-.1-.6z"
  }
]

const STAT_CARDS = [
  { label: "Total Products", value: "248", delta: "+12", trend: "up" },
  { label: "Low Stock Alerts", value: "18", delta: "+3", trend: "down" },
  { label: "Gross Revenue", value: "Rp 48.2M", delta: "+8.4%", trend: "up" },
  { label: "Orders Today", value: "63", delta: "+21%", trend: "up" }
]

function statusColor(status: string, isDark: boolean) {
  if (status === "In Stock")
    return {
      bg: isDark ? "#1a2e1a" : "#f0fdf4",
      text: isDark ? "#4ade80" : "#16a34a",
      border: isDark ? "#2d5a2d" : "#bbf7d0"
    }
  if (status === "Low Stock")
    return {
      bg: isDark ? "#2e2010" : "#fff7ed",
      text: isDark ? "#fb923c" : "#ea580c",
      border: isDark ? "#5a3a10" : "#fed7aa"
    }
  return {
    bg: isDark ? "#2e1010" : "#fef2f2",
    text: isDark ? "#f87171" : "#dc2626",
    border: isDark ? "#5a1a1a" : "#fecaca"
  }
}

// ── THEME TOGGLE ──────────────────────────────────────────────────────────────
function ThemeToggle({
  isDark,
  onToggle
}: {
  isDark: boolean
  onToggle: () => void
}) {
  return (
    <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
      <Box
        onClick={onToggle}
        role="button"
        aria-label="Toggle theme"
        sx={{
          width: 56,
          height: 28,
          bgcolor: isDark ? "#1a1a1a" : "#e2e8f0",
          border: isDark ? "1px solid #2a2a2a" : "1px solid #cbd5e1",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          px: "3px",
          cursor: "pointer",
          position: "relative",
          transition: "background-color 0.3s ease, border-color 0.3s ease",
          userSelect: "none",
          "&:hover": { opacity: 0.85 }
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 7,
            opacity: isDark ? 0.5 : 0,
            transition: "opacity 0.3s",
            display: "flex",
            alignItems: "center",
            pointerEvents: "none"
          }}
        >
          <MoonIcon size={11} color="#94a3b8" />
        </Box>
        <Box
          sx={{
            position: "absolute",
            right: 7,
            opacity: isDark ? 0 : 0.6,
            transition: "opacity 0.3s",
            display: "flex",
            alignItems: "center",
            pointerEvents: "none"
          }}
        >
          <SunIcon size={11} color="#64748b" />
        </Box>
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            bgcolor: isDark ? "#087463" : "#1e293b",
            transform: isDark ? "translateX(28px)" : "translateX(0px)",
            transition:
              "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isDark
              ? "0 0 8px rgba(232,255,71,0.4)"
              : "0 1px 4px rgba(0,0,0,0.25)",
            zIndex: 1,
            pointerEvents: "none"
          }}
        >
          {isDark ? (
            <MoonIcon size={11} color="#0D0D0D" />
          ) : (
            <SunIcon size={11} color="#087463" />
          )}
        </Box>
      </Box>
    </Tooltip>
  )
}

// ── SELECT EDIT CELL (for category & status columns) ─────────────────────────
function SelectEditCell(
  props: GridRenderEditCellParams & { options: string[] }
) {
  const { id, field, value, options } = props
  const apiRef = useGridApiContext()
  return (
    <select
      value={value as string}
      onChange={(e) => {
        apiRef.current.setEditCellValue({ id, field, value: e.target.value })
        apiRef.current.stopCellEditMode({ id, field })
      }}
      autoFocus
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        outline: "none",
        background: "transparent",
        fontFamily: "inherit",
        fontSize: 12,
        cursor: "pointer",
        padding: "0 8px"
      }}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

// ── CUSTOM TOOLBAR ─────────────────────────────────────────────────────────────
function CustomToolbar({
  isDark,
  p
}: {
  isDark: boolean
  p: Record<string, string>
}) {
  return (
    <GridToolbarContainer
      sx={{
        px: 2,
        py: 1,
        borderBottom: `1px solid ${p.border}`,
        bgcolor: p.tableHeadBg,
        gap: 0.5,
        "& .MuiButton-root": {
          color: p.textSecondary,
          fontSize: 11,
          fontFamily: "'DM Mono', monospace",
          "&:hover": { bgcolor: p.hoverBg }
        }
      }}
    >
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      <Box sx={{ flex: 1 }} />
      <Typography
        sx={{ color: p.textMuted, fontSize: 10, letterSpacing: "0.05em" }}
      >
        DOUBLE-CLICK CELL TO EDIT
      </Typography>
    </GridToolbarContainer>
  )
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────────
export default function MainPage() {
  const [isDark, setIsDark] = useState(true)
  const [rows, setRows] = useState<GridRowsProp>(INITIAL_ROWS)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    msg: string
    severity: "success" | "error"
  }>({ open: false, msg: "", severity: "success" })

  // ── MUI Theme ───────────────────────────────────────────────────────────────
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? "dark" : "light",
          primary: { main: "#087463" },
          secondary: { main: "#FF6B35" },
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

  // ── Palette shortcuts ────────────────────────────────────────────────────────
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
      progressTrack: isDark ? "#1f1f1f" : "#e2e8f0",
      menuShadow: isDark
        ? "0 8px 32px rgba(0,0,0,0.8)"
        : "0 8px 32px rgba(0,0,0,0.12)"
    }),
    [isDark]
  )

  const T = "0.3s ease"

  // ── Inline edit save ─────────────────────────────────────────────────────────
  const processRowUpdate = useCallback((newRow: GridRowModel) => {
    // Auto-fix status based on stock
    let updatedRow = { ...newRow }
    if (typeof updatedRow.stock === "number") {
      if (updatedRow.stock === 0) updatedRow.status = "Out of Stock"
      else if (updatedRow.stock < 15) updatedRow.status = "Low Stock"
      else updatedRow.status = "In Stock"
    }
    setRows((prev) =>
      prev.map((r) => (r.id === updatedRow.id ? updatedRow : r))
    )
    setSnackbar({
      open: true,
      msg: `"${updatedRow.name}" updated`,
      severity: "success"
    })
    return updatedRow
  }, [])

  const handleProcessRowUpdateError = useCallback(() => {
    setSnackbar({
      open: true,
      msg: "Failed to save changes",
      severity: "error"
    })
  }, [])

  // ── Column definitions ───────────────────────────────────────────────────────
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "id",
        headerName: "ID",
        width: 90,
        sortable: true,
        editable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Typography
            sx={{ color: p.textMuted, fontSize: 11, fontFamily: "inherit" }}
          >
            {params.value}
          </Typography>
        )
      },
      {
        field: "name",
        headerName: "PRODUCT NAME",
        flex: 1.8,
        minWidth: 200,
        editable: true,
        sortable: true,
        renderCell: (params: GridRenderCellParams) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              height: "100%"
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "2px",
                flexShrink: 0,
                bgcolor: isDark
                  ? `hsl(${(params.row.id?.charCodeAt(4) ?? 0) * 47}, 20%, 15%)`
                  : `hsl(${(params.row.id?.charCodeAt(4) ?? 0) * 47}, 30%, 93%)`,
                border: `1px solid ${p.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                color: p.textMuted,
                fontFamily: "inherit"
              }}
            >
              {String(params.row.id).split("-")[1]}
            </Box>
            <Typography
              sx={{
                color: p.textPrimary,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit"
              }}
            >
              {params.value as string}
            </Typography>
          </Box>
        )
      },
      {
        field: "sku",
        headerName: "SKU",
        width: 120,
        editable: true,
        sortable: true,
        renderCell: (params: GridRenderCellParams) => (
          <Typography
            sx={{ color: p.textSecondary, fontSize: 11, fontFamily: "inherit" }}
          >
            {params.value as string}
          </Typography>
        )
      },
      {
        field: "category",
        headerName: "CATEGORY",
        width: 130,
        editable: true,
        sortable: true,
        type: "singleSelect",
        valueOptions: CATEGORIES,
        renderCell: (params: GridRenderCellParams) => (
          <Typography
            sx={{ color: p.textSecondary, fontSize: 12, fontFamily: "inherit" }}
          >
            {params.value as string}
          </Typography>
        ),
        renderEditCell: (params: GridRenderEditCellParams) => (
          <SelectEditCell {...params} options={CATEGORIES} />
        )
      },
      {
        field: "stock",
        headerName: "STOCK",
        width: 100,
        editable: true,
        sortable: true,
        type: "number",
        renderCell: (params: GridRenderCellParams) => {
          const v = params.value as number
          const pct = Math.min(100, (v / 150) * 100)
          const barColor = v === 0 ? "#f87171" : v < 15 ? "#fb923c" : "#087463"
          return (
            <Box sx={{ width: "100%", py: 0.5 }}>
              <Typography
                sx={{
                  color: p.textPrimary,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  lineHeight: 1.2
                }}
              >
                {v}
              </Typography>
              <Box
                sx={{
                  mt: 0.4,
                  height: 2,
                  borderRadius: 1,
                  bgcolor: p.progressTrack,
                  overflow: "hidden"
                }}
              >
                <Box
                  sx={{
                    width: `${pct}%`,
                    height: "100%",
                    bgcolor: barColor,
                    borderRadius: 1
                  }}
                />
              </Box>
            </Box>
          )
        }
      },
      {
        field: "sold",
        headerName: "SOLD",
        width: 80,
        editable: true,
        sortable: true,
        type: "number",
        renderCell: (params: GridRenderCellParams) => (
          <Typography
            sx={{ color: p.textSecondary, fontSize: 12, fontFamily: "inherit" }}
          >
            {(params.value as number).toLocaleString()}
          </Typography>
        )
      },
      {
        field: "price",
        headerName: "PRICE (IDR)",
        width: 130,
        editable: true,
        sortable: true,
        type: "number",
        renderCell: (params: GridRenderCellParams) => (
          <Typography
            sx={{
              color: p.textPrimary,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit"
            }}
          >
            {(params.value as number).toLocaleString("id-ID")}
          </Typography>
        )
      },
      {
        field: "status",
        headerName: "STATUS",
        width: 130,
        editable: true,
        sortable: true,
        type: "singleSelect",
        valueOptions: STATUSES,
        renderCell: (params: GridRenderCellParams) => {
          const sc = statusColor(params.value as string, isDark)
          return (
            <Chip
              label={params.value as string}
              size="small"
              sx={{
                bgcolor: sc.bg,
                color: sc.text,
                border: `1px solid ${sc.border}`,
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                fontWeight: 700,
                height: 22
              }}
            />
          )
        },
        renderEditCell: (params: GridRenderEditCellParams) => (
          <SelectEditCell {...params} options={STATUSES} />
        )
      }
    ],
    [isDark, p]
  )

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
        {/* ── SIDEBAR ── */}
        <Drawer
          variant="permanent"
          sx={{
            width: 220,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 220,
              boxSizing: "border-box",
              bgcolor: p.sidebarBg,
              borderRight: `1px solid ${p.border}`,
              pt: 1,
              transition: `background-color ${T}, border-color ${T}`
            }
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2.5,
              display: "flex",
              alignItems: "center",
              gap: 1.5
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                bgcolor: "#087463",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Typography
                sx={{
                  color: "#0D0D0D",
                  fontWeight: 900,
                  fontSize: 14,
                  fontFamily: "inherit"
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
          <List dense sx={{ px: 1 }}>
            {NAV_ITEMS.map((item) => (
              <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  sx={{
                    borderRadius: "4px",
                    px: 1.5,
                    py: 1,
                    bgcolor: item.active ? p.activeNavBg : "transparent",
                    border: `1px solid ${item.active ? p.activeNavBorder : "transparent"}`,
                    "&:hover": {
                      bgcolor: item.active ? p.activeNavBg : p.hoverBg
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Icon
                      d={item.icon}
                      size={16}
                      color={item.active ? "#087463" : p.textMuted}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 13,
                      fontWeight: item.active ? 700 : 400,
                      color: item.active ? "#087463" : p.textSecondary,
                      fontFamily: "'DM Mono', monospace"
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Box
            sx={{
              mt: "auto",
              px: 2,
              py: 3,
              borderTop: `1px solid ${p.border}`
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{ width: 32, height: 32, bgcolor: "#FF6B35", fontSize: 12 }}
              >
                R
              </Avatar>
              <Box>
                <Typography
                  sx={{ color: p.textPrimary, fontSize: 12, fontWeight: 600 }}
                >
                  Raaaamad
                </Typography>
                <Typography sx={{ color: p.textMuted, fontSize: 10 }}>
                  Admin
                </Typography>
              </Box>
            </Box>
          </Box>
        </Drawer>

        {/* ── MAIN CONTENT ── */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          {/* Top Bar */}
          <Box
            sx={{
              px: 4,
              py: 2,
              borderBottom: `1px solid ${p.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: p.sidebarBg,
              transition: `background-color ${T}, border-color ${T}`
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: p.textMuted,
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  mb: 0.3
                }}
              >
                STOCKR / INVENTORY
              </Typography>
              <Typography
                sx={{
                  color: p.textPrimary,
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: "-0.02em"
                }}
              >
                Product Inventory
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <ThemeToggle
                isDark={isDark}
                onToggle={() => setIsDark((v) => !v)}
              />
              <Tooltip title="Notifications">
                <IconButton sx={{ color: p.textSecondary }}>
                  <Badge
                    badgeContent={3}
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
              <Button
                variant="contained"
                size="small"
                sx={{
                  bgcolor: "#087463",
                  color: "#0D0D0D",
                  fontWeight: 700,
                  fontSize: 12,
                  px: 2,
                  py: 0.8,
                  "&:hover": { bgcolor: "#d4eb3a" }
                }}
                startIcon={
                  <Icon d="M12 5v14M5 12h14" size={14} color="#0D0D0D" />
                }
              >
                Add Product
              </Button>
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflow: "auto", p: 4 }}>
            {/* Stat Cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 2,
                mb: 4
              }}
            >
              {STAT_CARDS.map((s) => (
                <Paper
                  key={s.label}
                  elevation={0}
                  sx={{
                    p: 2.5,
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
                      bgcolor: s.trend === "up" ? "#087463" : "#FF6B35"
                    }
                  }}
                >
                  <Typography
                    sx={{
                      color: p.textMuted,
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      mb: 1
                    }}
                  >
                    {s.label.toUpperCase()}
                  </Typography>
                  <Typography
                    sx={{
                      color: p.textPrimary,
                      fontSize: 26,
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      lineHeight: 1
                    }}
                  >
                    {s.value}
                  </Typography>
                  <Typography
                    sx={{
                      color: s.trend === "up" ? "#16a34a" : "#dc2626",
                      fontSize: 11,
                      mt: 0.8
                    }}
                  >
                    {s.delta} vs last week
                  </Typography>
                </Paper>
              ))}
            </Box>

            {/* ── DATA GRID ── */}
            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${p.border}`,
                borderRadius: "4px",
                overflow: "hidden",
                bgcolor: p.bg,
                "& .MuiDataGrid-root": {
                  border: "none",
                  fontFamily: "'DM Mono', monospace",
                  color: p.textPrimary,
                  bgcolor: p.bg
                },
                "& .MuiDataGrid-columnHeaders": {
                  bgcolor: p.tableHeadBg,
                  borderBottom: `1px solid ${p.border}`,
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: p.textMuted
                  }
                },
                "& .MuiDataGrid-columnHeader": {
                  bgcolor: p.tableHeadBg,
                  "&:focus, &:focus-within": { outline: "none" }
                },
                "& .MuiDataGrid-row": {
                  "&:hover": { bgcolor: `${p.hoverBg} !important` },
                  borderBottom: `1px solid ${p.tableRowBorder}`
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "none",
                  "&:focus, &:focus-within": {
                    outline: `2px solid #087463`,
                    outlineOffset: "-2px"
                  }
                },
                "& .MuiDataGrid-cell--editing": {
                  bgcolor: isDark ? "#1a1a00 !important" : "#fefce8 !important",
                  boxShadow: `inset 0 0 0 2px #087463`
                },
                "& .MuiDataGrid-footerContainer": {
                  bgcolor: p.tableHeadBg,
                  borderTop: `1px solid ${p.border}`,
                  "& .MuiTablePagination-root": {
                    color: p.textSecondary,
                    fontFamily: "inherit",
                    fontSize: 12
                  },
                  "& .MuiTablePagination-selectIcon": {
                    color: p.textSecondary
                  },
                  "& .MuiIconButton-root": {
                    color: p.textSecondary,
                    "&.Mui-disabled": { color: p.textMuted }
                  }
                },
                "& .MuiDataGrid-virtualScroller": { bgcolor: p.bg },
                "& .MuiDataGrid-menuIcon .MuiSvgIcon-root": {
                  color: p.textMuted
                },
                "& .MuiDataGrid-sortIcon": { color: p.textMuted },
                "& .MuiDataGrid-columnSeparator .MuiSvgIcon-root": {
                  color: p.border
                },
                "& .MuiCheckbox-root": { color: p.textMuted },
                "& .MuiDataGrid-overlay": {
                  bgcolor: p.bg,
                  color: p.textSecondary
                },
                // Filter panel theming
                "& .MuiDataGrid-panel": { bgcolor: p.bgPaper },
                "& .MuiDataGrid-filterForm": {
                  bgcolor: p.bgPaper,
                  color: p.textPrimary
                },
                "& .MuiInput-underline:before": { borderBottomColor: p.border }
              }}
            >
              <DataGrid
                rows={rows}
                columns={columns}
                editMode="cell"
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={handleProcessRowUpdateError}
                disableRowSelectionOnClick
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } }
                }}
                slots={{
                  toolbar: () => <CustomToolbar isDark={isDark} p={p} />
                }}
                sx={{ minHeight: 400 }}
                getRowHeight={() => 52}
                columnVisibilityModel={{}}
                autosizeOnMount
              />
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}
        >
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  )
}
