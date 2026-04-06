"use client"

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
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
import { useCallback, useEffect, useMemo, useState } from "react"
import Header from "../components/header/page"
import Sidebar from "../components/sidebar"
import { useTheme } from "../hooks/useTheme"

const DRAWER_WIDTH = 220

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

const CATEGORIES = ["Electronics", "Apparel", "Home", "Tools", "Beauty"]
const STATUSES = ["In Stock", "Low Stock", "Out of Stock"]

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
        flexWrap: "wrap",
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
        sx={{
          color: p.textMuted,
          fontSize: 10,
          letterSpacing: "0.05em",
          display: { xs: "none", sm: "block" }
        }}
      >
        DOUBLE-CLICK CELL TO EDIT
      </Typography>
    </GridToolbarContainer>
  )
}

function AddProductModal({
  open,
  onClose,
  onSuccess,
  isDark,
  p
}: {
  open: boolean
  onClose: () => void
  onSuccess: (product: any) => void
  isDark: boolean
  p: Record<string, string>
}) {
  const [form, setForm] = useState({
    name: "",
    category: "Electronics",
    sku: "",
    stock: "",
    price: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: isDark ? "#111" : "#f8fafc",
      fontFamily: "'DM Mono', monospace",
      fontSize: 13,
      "& fieldset": { borderColor: p.border },
      "&:hover fieldset": { borderColor: "#087463" },
      "&.Mui-focused fieldset": { borderColor: "#087463" }
    },
    "& .MuiInputLabel-root": {
      color: p.textSecondary,
      fontFamily: "'DM Mono', monospace",
      fontSize: 13
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#087463" },
    "& .MuiInputBase-input": { color: p.textPrimary }
  }

  const handleSubmit = async () => {
    setError("")
    if (!form.name || !form.sku || !form.stock || !form.price) {
      setError("Semua field wajib diisi")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          stock: Number(form.stock),
          price: Number(form.price)
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Gagal menambah produk")
        return
      }
      onSuccess(data)
      setForm({
        name: "",
        category: "Electronics",
        sku: "",
        stock: "",
        price: ""
      })
      onClose()
    } catch {
      setError("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: isDark ? "#141414" : "#fff",
          border: `1px solid ${p.border}`,
          borderRadius: "8px",
          mx: { xs: 2, sm: "auto" }
        }
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: "'DM Mono', monospace",
          color: p.textPrimary,
          borderBottom: `1px solid ${p.border}`,
          pb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Box>
          <Typography
            sx={{ fontWeight: 700, fontSize: 16, fontFamily: "inherit" }}
          >
            Add New Product
          </Typography>
          <Typography sx={{ color: p.textMuted, fontSize: 11, mt: 0.3 }}>
            Isi data produk baru
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: p.textMuted }}>
          <Icon d="M18 6 6 18M6 6l12 12" size={16} />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          pt: "20px !important",
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}
          >
            {error}
          </Alert>
        )}
        <TextField
          label="Nama Produk"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          fullWidth
          size="small"
          sx={inputSx}
        />
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" }
          }}
        >
          <TextField
            label="SKU"
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            fullWidth
            size="small"
            sx={inputSx}
          />
          <Select
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            size="small"
            fullWidth
            sx={{
              bgcolor: isDark ? "#111" : "#f8fafc",
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              color: p.textPrimary,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: p.border },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#087463"
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#087463"
              }
            }}
          >
            {CATEGORIES.map((c) => (
              <MenuItem
                key={c}
                value={c}
                sx={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}
              >
                {c}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" }
          }}
        >
          <TextField
            label="Stock"
            type="number"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            fullWidth
            size="small"
            sx={inputSx}
          />
          <TextField
            label="Harga (IDR)"
            type="number"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            fullWidth
            size="small"
            sx={inputSx}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 2, pt: 1 }}>
          <Button
            onClick={onClose}
            fullWidth
            variant="outlined"
            sx={{
              fontFamily: "'DM Mono', monospace",
              borderColor: p.border,
              color: p.textSecondary,
              "&:hover": { borderColor: p.borderHover }
            }}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              fontFamily: "'DM Mono', monospace",
              bgcolor: "#087463",
              color: "#fff",
              fontWeight: 700,
              "&:hover": { bgcolor: "#065a4d" },
              "&.Mui-disabled": { opacity: 0.7 }
            }}
          >
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function MainPage() {
  const { isDark, toggleTheme } = useTheme()
  const [rows, setRows] = useState<GridRowsProp>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    msg: string
    severity: "success" | "error"
  }>({ open: false, msg: "", severity: "success" })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/products")
      const data = await res.json()
      setRows(data.map((p: any) => ({ ...p, id: p.id || p._id })))
    } catch {
      showSnackbar("Gagal mengambil data produk", "error")
    } finally {
      setLoading(false)
    }
  }

  const showSnackbar = (msg: string, severity: "success" | "error") =>
    setSnackbar({ open: true, msg, severity })

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
      progressTrack: isDark ? "#1f1f1f" : "#e2e8f0",
      menuShadow: isDark
        ? "0 8px 32px rgba(0,0,0,0.8)"
        : "0 8px 32px rgba(0,0,0,0.12)"
    }),
    [isDark]
  )

  const T = "0.3s ease"

  const processRowUpdate = useCallback(async (newRow: GridRowModel) => {
    let updated = { ...newRow }
    if (typeof updated.stock === "number") {
      updated.status =
        updated.stock === 0
          ? "Out of Stock"
          : updated.stock < 15
            ? "Low Stock"
            : "In Stock"
    }
    try {
      const res = await fetch(`/api/products/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      })
      if (!res.ok) throw new Error()
      const saved = await res.json()
      setRows((prev) =>
        prev.map((r) => (r.id === saved.id ? { ...saved, id: saved.id } : r))
      )
      showSnackbar(`"${updated.name}" berhasil diupdate`, "success")
      return { ...saved, id: saved.id }
    } catch {
      showSnackbar("Gagal menyimpan perubahan", "error")
      throw new Error("Update failed")
    }
  }, [])

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!confirm(`Hapus produk "${name}"?`)) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setRows((prev) => prev.filter((r) => r.id !== id))
      showSnackbar(`"${name}" berhasil dihapus`, "success")
    } catch {
      showSnackbar("Gagal menghapus produk", "error")
    }
  }, [])

  const stats = useMemo(() => {
    const total = rows.length
    const lowStock = rows.filter(
      (r) => r.status === "Low Stock" || r.status === "Out of Stock"
    ).length
    const revenue = rows.reduce((sum, r) => sum + r.price * r.sold, 0)
    const revenueStr =
      revenue >= 1_000_000
        ? `Rp ${(revenue / 1_000_000).toFixed(1)}M`
        : `Rp ${revenue.toLocaleString("id-ID")}`
    return [
      {
        label: "Total Products",
        value: String(total),
        delta: `${total} items`,
        trend: "up"
      },
      {
        label: "Low Stock Alerts",
        value: String(lowStock),
        delta: `${lowStock} produk`,
        trend: lowStock > 0 ? "down" : "up"
      },
      {
        label: "Gross Revenue",
        value: revenueStr,
        delta: "all time",
        trend: "up"
      },
      {
        label: "Total Sold",
        value: String(rows.reduce((s, r) => s + (r.sold || 0), 0)),
        delta: "all products",
        trend: "up"
      }
    ]
  }, [rows])

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "productId",
        headerName: "ID",
        width: 90,
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
        minWidth: 160,
        editable: true,
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
                bgcolor: isDark ? "#1a1a1a" : "#f1f5f9",
                border: `1px solid ${p.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                color: p.textMuted
              }}
            >
              {String(params.row.productId || "").split("-")[1]}
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
        width: 110,
        editable: true,
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
        width: 120,
        editable: true,
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
        width: 90,
        editable: true,
        type: "number",
        renderCell: (params: GridRenderCellParams) => {
          const v = params.value as number
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
                    width: `${Math.min(100, (v / 150) * 100)}%`,
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
        width: 75,
        editable: true,
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
        width: 120,
        editable: true,
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
        width: 120,
        editable: true,
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
      },
      {
        field: "actions",
        headerName: "",
        width: 52,
        sortable: false,
        editable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Tooltip title="Hapus produk">
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.id, params.row.name)}
              sx={{
                color: p.textMuted,
                "&:hover": {
                  color: "#ef4444",
                  bgcolor: isDark ? "#2e1010" : "#fef2f2"
                }
              }}
            >
              <Icon
                d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
                size={15}
              />
            </IconButton>
          </Tooltip>
        )
      }
    ],
    [isDark, p, handleDelete]
  )

  const drawerPaperSx = (pt: boolean) => ({
    width: DRAWER_WIDTH,
    boxSizing: "border-box" as const,
    bgcolor: p.sidebarBg,
    borderRight: `1px solid ${p.border}`,
    pt: pt ? 1 : 0,
    transition: `background-color ${T}, border-color ${T}`
  })

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
            "& .MuiDrawer-paper": drawerPaperSx(false)
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
            "& .MuiDrawer-paper": drawerPaperSx(true)
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
            onToggleTheme={toggleTheme}
            onMenuClick={() => setMobileOpen(true)}
            onAddProduct={() => setModalOpen(true)}
            title="Product Inventory"
            breadcrumb="STOCKR / INVENTORY"
            showAddButton={true}
            notificationCount={3}
            p={p}
          />

          <Box sx={{ flex: 1, overflow: "auto", p: { xs: 2, md: 4 } }}>
            {/* Stat Cards */}
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
              {stats.map((s) => (
                <Paper
                  key={s.label}
                  elevation={0}
                  sx={{
                    p: { xs: 1.5, md: 2.5 },
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
                      fontSize: { xs: 9, md: 10 },
                      letterSpacing: "0.08em",
                      mb: 1
                    }}
                  >
                    {s.label.toUpperCase()}
                  </Typography>
                  <Typography
                    sx={{
                      color: p.textPrimary,
                      fontSize: { xs: 18, md: 26 },
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
                      fontSize: { xs: 10, md: 11 },
                      mt: 0.8
                    }}
                  >
                    {s.delta}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {/* DATA GRID */}
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
                }
              }}
            >
              <DataGrid
                rows={rows}
                columns={columns}
                editMode="cell"
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={() =>
                  showSnackbar("Gagal menyimpan", "error")
                }
                loading={loading}
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
              />
            </Paper>
          </Box>
        </Box>
      </Box>

      <AddProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(product) => {
          setRows((prev) => [{ ...product, id: product.id }, ...prev])
          showSnackbar(`"${product.name}" berhasil ditambahkan`, "success")
        }}
        isDark={isDark}
        p={p}
      />

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
