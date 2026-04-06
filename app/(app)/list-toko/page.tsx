"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Alert,
  Box,
  Chip,
  Drawer,
  IconButton,
  Modal,
  Snackbar,
  ThemeProvider,
  Tooltip,
  createTheme,
  useMediaQuery
} from "@mui/material"
import Header from "../components/header/page"
import Sidebar from "../components/sidebar"
import { useTheme } from "../hooks/useTheme"

const DRAWER_WIDTH = 220

interface StoreOwner {
  nik: string
  fullName: string
  birthDate: string
  address: string
  gender: string
  ktpImageUrl: string | null
  inputMethod: string
}

interface Store {
  id: string
  storeId: string
  storeName: string
  storeType: string
  storePhone: string
  storeEmail: string | null
  storeAddress: string
  storeCity: string
  storeProvince: string
  storePostalCode: string | null
  status: "active" | "inactive" | "suspended"
  owner: StoreOwner
  createdAt: string
  updatedAt: string
}

const Icon = ({
  d,
  size = 16,
  color = "currentColor",
  strokeWidth = 2
}: {
  d: string
  size?: number
  color?: string
  strokeWidth?: number
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
)

function statusColor(status: string, isDark: boolean) {
  if (status === "active")
    return {
      bg: isDark ? "#0a2e1c" : "#f0fdf4",
      text: isDark ? "#4ade80" : "#16a34a",
      border: isDark ? "#1a5c38" : "#bbf7d0",
      label: "Aktif"
    }
  if (status === "inactive")
    return {
      bg: isDark ? "#1f1f1f" : "#f8fafc",
      text: isDark ? "#888" : "#64748b",
      border: isDark ? "#333" : "#e2e8f0",
      label: "Nonaktif"
    }
  return {
    bg: isDark ? "#2e1010" : "#fef2f2",
    text: isDark ? "#f87171" : "#dc2626",
    border: isDark ? "#5a1a1a" : "#fecaca",
    label: "Suspended"
  }
}

// ── Store Detail Modal ─────────────────────────────────────────────────────
function StoreDetailModal({
  store,
  open,
  onClose,
  isDark,
  p
}: {
  store: Store | null
  open: boolean
  onClose: () => void
  isDark: boolean
  p: Record<string, string>
}) {
  if (!store) return null
  const sc = statusColor(store.status, isDark)

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        py: 1.5,
        borderBottom: `1px solid ${p.border}`,
        gap: { xs: 0.3, sm: 2 },
        "&:last-child": { borderBottom: "none" }
      }}
    >
      <Box sx={{ width: { xs: "100%", sm: 140 }, flexShrink: 0 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: p.textMuted,
            fontFamily: "'Nunito', sans-serif",
            letterSpacing: "0.05em"
          }}
        >
          {label}
        </span>
      </Box>
      <span
        style={{
          fontSize: 13,
          color: p.textPrimary,
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 600,
          flex: 1
        }}
      >
        {value || "-"}
      </span>
    </Box>
  )

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95vw", sm: 580 },
          maxHeight: "90vh",
          overflow: "auto",
          bgcolor: p.bgPaper,
          border: `1px solid ${p.border}`,
          borderRadius: "10px",
          boxShadow: p.menuShadow,
          outline: "none"
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            borderBottom: `1px solid ${p.border}`,
            bgcolor: p.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 1
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                bgcolor: isDark ? "#0d1f3c" : "#e6f1fb",
                border: `1px solid ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                flexShrink: 0
              }}
            >
              🏪
            </Box>
            <Box>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 700,
                  color: p.textPrimary,
                  fontFamily: "'Nunito', sans-serif"
                }}
              >
                Detail Toko
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: p.textMuted,
                  fontFamily: "'Nunito', sans-serif"
                }}
              >
                {store.storeId}
              </p>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={sc.label}
              size="small"
              sx={{
                bgcolor: sc.bg,
                color: sc.text,
                border: `1px solid ${sc.border}`,
                fontFamily: "'Nunito', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                height: 22
              }}
            />
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ color: p.textMuted }}
            >
              <Icon d="M18 6 6 18M6 6l12 12" size={16} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 11,
              fontWeight: 700,
              color: isDark ? "#60a5fa" : "#1e3a8a",
              fontFamily: "'Nunito', sans-serif",
              letterSpacing: "0.08em"
            }}
          >
            INFORMASI TOKO
          </p>
          <Box
            sx={{
              bgcolor: p.bg,
              border: `1px solid ${p.border}`,
              borderRadius: "6px",
              px: 2,
              mb: 3
            }}
          >
            <DetailRow label="NAMA TOKO" value={store.storeName} />
            <DetailRow label="JENIS TOKO" value={store.storeType} />
            <DetailRow label="TELEPON" value={store.storePhone} />
            <DetailRow label="EMAIL" value={store.storeEmail || "-"} />
            <DetailRow label="ALAMAT" value={store.storeAddress} />
            <DetailRow
              label="KOTA / PROVINSI"
              value={`${store.storeCity}, ${store.storeProvince}`}
            />
            <DetailRow label="KODE POS" value={store.storePostalCode || "-"} />
          </Box>

          <p
            style={{
              margin: "0 0 10px",
              fontSize: 11,
              fontWeight: 700,
              color: isDark ? "#60a5fa" : "#1e3a8a",
              fontFamily: "'Nunito', sans-serif",
              letterSpacing: "0.08em"
            }}
          >
            DATA PEMILIK
          </p>
          <Box
            sx={{
              bgcolor: p.bg,
              border: `1px solid ${p.border}`,
              borderRadius: "6px",
              px: 2,
              mb: 3
            }}
          >
            <DetailRow label="NAMA LENGKAP" value={store.owner.fullName} />
            <DetailRow label="NIK" value={store.owner.nik} />
            <DetailRow label="TANGGAL LAHIR" value={store.owner.birthDate} />
            <DetailRow label="JENIS KELAMIN" value={store.owner.gender} />
            <DetailRow label="ALAMAT KTP" value={store.owner.address} />
            <DetailRow
              label="INPUT METHOD"
              value={
                store.owner.inputMethod === "ocr" ? "Scan KTP (OCR)" : "Manual"
              }
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              p: 2,
              bgcolor: p.bg,
              border: `1px solid ${p.border}`,
              borderRadius: "6px"
            }}
          >
            {[
              { label: "TERDAFTAR", val: store.createdAt },
              { label: "TERAKHIR UPDATE", val: store.updatedAt }
            ].map((m) => (
              <Box key={m.label}>
                <p
                  style={{
                    margin: "0 0 2px",
                    fontSize: 10,
                    color: p.textMuted,
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700
                  }}
                >
                  {m.label}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: p.textPrimary,
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 600
                  }}
                >
                  {new Date(m.val).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

// ── Delete Modal ───────────────────────────────────────────────────────────
function DeleteModal({
  store,
  open,
  onClose,
  onConfirm,
  isDark,
  p,
  isDeleting
}: {
  store: Store | null
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isDark: boolean
  p: Record<string, string>
  isDeleting: boolean
}) {
  if (!store) return null
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90vw", sm: 420 },
          bgcolor: p.bgPaper,
          border: `1px solid ${p.border}`,
          borderRadius: "10px",
          boxShadow: p.menuShadow,
          outline: "none",
          overflow: "hidden"
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: `1px solid ${p.border}`,
            bgcolor: p.bg
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 700,
              color: p.textPrimary,
              fontFamily: "'Nunito', sans-serif"
            }}
          >
            Hapus Toko
          </p>
        </Box>
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              p: 2,
              bgcolor: isDark ? "#2e1010" : "#fef2f2",
              border: `1px solid ${isDark ? "#5a1a1a" : "#fecaca"}`,
              borderRadius: "6px",
              mb: 3
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "#ef4444",
                fontFamily: "'Nunito', sans-serif",
                lineHeight: 1.6
              }}
            >
              Yakin ingin menghapus toko{" "}
              <strong>&ldquo;{store.storeName}&rdquo;</strong>? Tindakan ini
              tidak dapat dibatalkan.
            </p>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px",
                border: `1px solid ${p.border}`,
                borderRadius: 6,
                background: "transparent",
                color: p.textSecondary,
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                cursor: "pointer"
              }}
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                borderRadius: 6,
                background: isDeleting ? "#b91c1c" : "#dc2626",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                cursor: isDeleting ? "not-allowed" : "pointer",
                opacity: isDeleting ? 0.7 : 1
              }}
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

// ── Mobile Store Card ──────────────────────────────────────────────────────
function StoreCard({
  store,
  isDark,
  p,
  onDetail,
  onDelete
}: {
  store: Store
  isDark: boolean
  p: Record<string, string>
  onDetail: () => void
  onDelete: () => void
}) {
  const sc = statusColor(store.status, isDark)
  return (
    <Box
      sx={{
        border: `1px solid ${p.border}`,
        borderRadius: "8px",
        bgcolor: p.bgPaper,
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1.5
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flex: 1,
            minWidth: 0
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "6px",
              bgcolor: isDark ? "#0d1f3c" : "#e6f1fb",
              border: `1px solid ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0
            }}
          >
            🏪
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                color: p.textPrimary,
                fontFamily: "'Nunito', sans-serif",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {store.storeName}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 700,
                color: isDark ? "#60a5fa" : "#1e3a8a",
                fontFamily: "'Nunito', sans-serif"
              }}
            >
              {store.storeId}
            </p>
          </Box>
        </Box>
        <span
          style={{
            display: "inline-block",
            padding: "3px 10px",
            borderRadius: 100,
            background: sc.bg,
            color: sc.text,
            border: `1px solid ${sc.border}`,
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "'Nunito', sans-serif",
            whiteSpace: "nowrap",
            flexShrink: 0
          }}
        >
          {sc.label}
        </span>
      </Box>

      {/* Info grid 2x2 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          bgcolor: p.bg,
          border: `1px solid ${p.border}`,
          borderRadius: "6px",
          p: 1.5
        }}
      >
        {[
          { label: "Jenis", val: store.storeType },
          { label: "Telepon", val: store.storePhone },
          { label: "Pemilik", val: store.owner.fullName },
          { label: "Kota", val: `${store.storeCity}, ${store.storeProvince}` }
        ].map((item) => (
          <Box key={item.label}>
            <p
              style={{
                margin: "0 0 1px",
                fontSize: 9,
                fontWeight: 700,
                color: p.textMuted,
                fontFamily: "'Nunito', sans-serif",
                letterSpacing: "0.05em"
              }}
            >
              {item.label.toUpperCase()}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 600,
                color: p.textPrimary,
                fontFamily: "'Nunito', sans-serif",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {item.val}
            </p>
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: p.textMuted,
            fontFamily: "'Nunito', sans-serif"
          }}
        >
          {new Date(store.createdAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          })}
        </span>
        <Box sx={{ display: "flex", gap: 1 }}>
          <button
            onClick={onDetail}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "6px 12px",
              border: `1px solid ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
              borderRadius: 5,
              background: isDark ? "#0d1f3c" : "#e6f1fb",
              color: isDark ? "#60a5fa" : "#1e3a8a",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
              cursor: "pointer"
            }}
          >
            <Icon
              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
              size={12}
            />
            Detail
          </button>
          <button
            onClick={onDelete}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "6px 12px",
              border: `1px solid ${isDark ? "#5a1a1a" : "#fecaca"}`,
              borderRadius: 5,
              background: isDark ? "#2e1010" : "#fef2f2",
              color: "#ef4444",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
              cursor: "pointer"
            }}
          >
            <Icon
              d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
              size={12}
            />
            Hapus
          </button>
        </Box>
      </Box>
    </Box>
  )
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function ListTokoPage() {
  const router = useRouter()
  const { isDark, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteStore, setDeleteStore] = useState<Store | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    msg: string
    severity: "success" | "error"
  }>({ open: false, msg: "", severity: "success" })

  const showSnackbar = (msg: string, severity: "success" | "error") =>
    setSnackbar({ open: true, msg, severity })

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? "dark" : "light",
          primary: { main: "#1e3a8a" },
          background: {
            default: isDark ? "#0D0D0D" : "#f8fafc",
            paper: isDark ? "#141414" : "#ffffff"
          },
          text: {
            primary: isDark ? "#F5F5F0" : "#0f172a",
            secondary: isDark ? "#888" : "#64748b"
          }
        },
        typography: { fontFamily: "'Nunito', sans-serif" },
        shape: { borderRadius: 2 }
      }),
    [isDark]
  )

  const p = useMemo(
    () => ({
      bg: isDark ? "#0D0D0D" : "#f8fafc",
      bgPaper: isDark ? "#111111" : "#ffffff",
      sidebarBg: isDark ? "#0D0D0D" : "#ffffff",
      border: isDark ? "#1f1f1f" : "#e2e8f0",
      textPrimary: isDark ? "#F5F5F0" : "#0f172a",
      textSecondary: isDark ? "#888888" : "#64748b",
      textMuted: isDark ? "#555555" : "#94a3b8",
      tableHeadBg: isDark ? "#111111" : "#f8fafc",
      menuShadow: isDark
        ? "0 8px 32px rgba(0,0,0,0.8)"
        : "0 8px 32px rgba(0,0,0,0.12)"
    }),
    [isDark]
  )

  const T = "0.3s ease"
  const isMobile = useMediaQuery("(max-width: 768px)")

  const drawerPaperSx = (pt: boolean) => ({
    width: DRAWER_WIDTH,
    boxSizing: "border-box" as const,
    bgcolor: p.sidebarBg,
    borderRight: `1px solid ${p.border}`,
    pt: pt ? 1 : 0,
    transition: `background-color ${T}, border-color ${T}`
  })

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/stores")
      const data = await res.json()
      if (data.success) setStores(data.data)
      else throw new Error(data.error)
    } catch {
      showSnackbar("Gagal mengambil data toko", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = useCallback(async () => {
    if (!deleteStore) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/stores/${deleteStore.id}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error()
      setStores((prev) => prev.filter((s) => s.id !== deleteStore.id))
      showSnackbar(`"${deleteStore.storeName}" berhasil dihapus`, "success")
      setDeleteOpen(false)
      setDeleteStore(null)
    } catch {
      showSnackbar("Gagal menghapus toko", "error")
    } finally {
      setIsDeleting(false)
    }
  }, [deleteStore])

  const filtered = useMemo(
    () =>
      stores.filter((s) => {
        const q = search.toLowerCase()
        const matchSearch =
          !q ||
          s.storeName.toLowerCase().includes(q) ||
          s.storeId.toLowerCase().includes(q) ||
          s.storeCity.toLowerCase().includes(q) ||
          s.owner.fullName.toLowerCase().includes(q) ||
          s.storePhone.includes(q)
        const matchStatus = filterStatus === "all" || s.status === filterStatus
        const matchType = filterType === "all" || s.storeType === filterType
        return matchSearch && matchStatus && matchType
      }),
    [stores, search, filterStatus, filterType]
  )

  const storeTypes = useMemo(
    () => Array.from(new Set(stores.map((s) => s.storeType))),
    [stores]
  )
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const stats = useMemo(() => {
    const total = stores.length
    const active = stores.filter((s) => s.status === "active").length
    const inactive = stores.filter((s) => s.status === "inactive").length
    const suspended = stores.filter((s) => s.status === "suspended").length
    return [
      { label: "Total Toko", value: String(total), color: "#1e3a8a" },
      { label: "Aktif", value: String(active), color: "#16a34a" },
      { label: "Nonaktif", value: String(inactive), color: "#64748b" },
      { label: "Suspended", value: String(suspended), color: "#dc2626" }
    ]
  }, [stores])

  const inputStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 6,
    border: `1px solid ${p.border}`,
    background: isDark ? "#111" : "#fff",
    color: p.textPrimary,
    fontFamily: "'Nunito', sans-serif",
    fontSize: 13,
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const
  }

  const openDetail = (store: Store) => {
    setSelectedStore(store)
    setDetailOpen(true)
  }
  const openDeleteConfirm = (store: Store) => {
    setDeleteStore(store)
    setDeleteOpen(true)
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: p.bg,
          fontFamily: "'Nunito', sans-serif",
          transition: `background-color ${T}`
        }}
      >
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
            title="List Toko"
            breadcrumb="STOCKR / LIST TOKO"
            showAddButton={false}
            onAddProduct={() => router.push("/registration")}
            notificationCount={0}
            p={p}
          />

          <Box
            sx={{ flex: 1, overflow: "auto", p: { xs: "12px", sm: "16px" } }}
          >
            {/* Stat Cards — 2 kolom di mobile, 4 di desktop */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(4, 1fr)"
                },
                gap: { xs: 1.5, sm: 2 },
                mb: { xs: 2, sm: 3 }
              }}
            >
              {stats.map((s) => (
                <Box
                  key={s.label}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    border: `1px solid ${p.border}`,
                    bgcolor: p.bgPaper,
                    borderRadius: "8px",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "3px",
                      bgcolor: s.color
                    }
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: 9,
                      fontWeight: 700,
                      color: p.textMuted,
                      fontFamily: "'Nunito', sans-serif",
                      letterSpacing: "0.06em"
                    }}
                  >
                    {s.label.toUpperCase()}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: isMobile ? 22 : 28,
                      fontWeight: 900,
                      color: p.textPrimary,
                      fontFamily: "'Nunito', sans-serif",
                      lineHeight: 1
                    }}
                  >
                    {s.value}
                  </p>
                </Box>
              ))}
            </Box>

            {/* Main card */}
            <Box
              sx={{
                border: `1px solid ${p.border}`,
                bgcolor: p.bgPaper,
                borderRadius: "8px",
                overflow: "hidden"
              }}
            >
              {/* Filter bar */}
              <Box
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: 2,
                  borderBottom: `1px solid ${p.border}`,
                  bgcolor: p.bg
                }}
              >
                {/* Search — full width */}
                <Box sx={{ position: "relative", mb: 1.5 }}>
                  <Box
                    sx={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: p.textMuted,
                      display: "flex",
                      zIndex: 1
                    }}
                  >
                    <Icon
                      d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0"
                      size={14}
                    />
                  </Box>
                  <input
                    type="text"
                    placeholder="Cari nama toko, ID, kota, pemilik..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    style={{ ...inputStyle, paddingLeft: 32 }}
                  />
                </Box>

                {/* Filters + button row */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Box sx={{ flex: "1 1 110px", minWidth: 0 }}>
                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value)
                        setPage(1)
                      }}
                      style={inputStyle}
                    >
                      <option value="all">Semua Status</option>
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </Box>
                  <Box sx={{ flex: "1 1 130px", minWidth: 0 }}>
                    <select
                      value={filterType}
                      onChange={(e) => {
                        setFilterType(e.target.value)
                        setPage(1)
                      }}
                      style={inputStyle}
                    >
                      <option value="all">Semua Jenis</option>
                      {storeTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Box>
                  <button
                    onClick={() => router.push("/registration")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "8px 14px",
                      border: "none",
                      borderRadius: 6,
                      background:
                        "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                      boxShadow: "0 4px 12px rgba(59,130,246,.25)",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "'Nunito', sans-serif",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      height: 38
                    }}
                  >
                    <Icon d="M12 5v14M5 12h14" size={14} color="#fff" />
                    {isMobile ? "Tambah" : "Tambah Toko"}
                  </button>
                </Box>
              </Box>

              {/* ── MOBILE: Card List ── */}
              {isMobile ? (
                <Box
                  sx={{
                    p: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5
                  }}
                >
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Box
                        key={i}
                        sx={{
                          border: `1px solid ${p.border}`,
                          borderRadius: "8px",
                          p: 2
                        }}
                      >
                        {[100, 60, 80, 50].map((w, j) => (
                          <Box
                            key={j}
                            sx={{
                              height: 11,
                              borderRadius: 1,
                              bgcolor: isDark ? "#1f1f1f" : "#f1f5f9",
                              width: `${w}%`,
                              mb: 1.2,
                              animation: "pulse 1.5s ease-in-out infinite",
                              "@keyframes pulse": {
                                "0%, 100%": { opacity: 1 },
                                "50%": { opacity: 0.4 }
                              }
                            }}
                          />
                        ))}
                      </Box>
                    ))
                  ) : paginated.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: "center" }}>
                      <p
                        style={{
                          margin: "0 0 12px",
                          fontSize: 14,
                          color: p.textMuted,
                          fontFamily: "'Nunito', sans-serif"
                        }}
                      >
                        {search ||
                        filterStatus !== "all" ||
                        filterType !== "all"
                          ? "Tidak ada toko yang sesuai filter"
                          : "Belum ada toko terdaftar"}
                      </p>
                      {!search &&
                        filterStatus === "all" &&
                        filterType === "all" && (
                          <button
                            onClick={() => router.push("/registration")}
                            style={{
                              padding: "8px 20px",
                              border: "none",
                              borderRadius: 6,
                              background:
                                "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                              color: "#fff",
                              fontSize: 13,
                              fontWeight: 700,
                              fontFamily: "'Nunito', sans-serif",
                              cursor: "pointer"
                            }}
                          >
                            + Daftarkan Toko Pertama
                          </button>
                        )}
                    </Box>
                  ) : (
                    paginated.map((store) => (
                      <StoreCard
                        key={store.id}
                        store={store}
                        isDark={isDark}
                        p={p}
                        onDetail={() => openDetail(store)}
                        onDelete={() => openDeleteConfirm(store)}
                      />
                    ))
                  )}
                </Box>
              ) : (
                /* ── DESKTOP: Table ── */
                <Box sx={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: p.tableHeadBg,
                          borderBottom: `1px solid ${p.border}`
                        }}
                      >
                        {[
                          { label: "ID TOKO", w: 120 },
                          { label: "NAMA TOKO", w: "auto" },
                          { label: "JENIS", w: 160 },
                          { label: "PEMILIK", w: 160 },
                          { label: "KOTA", w: 130 },
                          { label: "TELEPON", w: 140 },
                          { label: "STATUS", w: 100 },
                          { label: "TERDAFTAR", w: 120 },
                          { label: "", w: 80 }
                        ].map((col) => (
                          <th
                            key={col.label}
                            style={{
                              padding: "10px 16px",
                              textAlign: "left",
                              fontSize: 10,
                              fontWeight: 700,
                              color: p.textMuted,
                              letterSpacing: "0.08em",
                              whiteSpace: "nowrap",
                              width: col.w
                            }}
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            {Array.from({ length: 9 }).map((_, j) => (
                              <td key={j} style={{ padding: "14px 16px" }}>
                                <Box
                                  sx={{
                                    height: 12,
                                    borderRadius: 1,
                                    bgcolor: isDark ? "#1f1f1f" : "#f1f5f9",
                                    width: j === 1 ? "80%" : "60%",
                                    animation:
                                      "pulse 1.5s ease-in-out infinite",
                                    "@keyframes pulse": {
                                      "0%, 100%": { opacity: 1 },
                                      "50%": { opacity: 0.4 }
                                    }
                                  }}
                                />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : paginated.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            style={{
                              padding: "48px 16px",
                              textAlign: "center"
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontSize: 14,
                                color: p.textMuted,
                                fontFamily: "'Nunito', sans-serif"
                              }}
                            >
                              {search ||
                              filterStatus !== "all" ||
                              filterType !== "all"
                                ? "Tidak ada toko yang sesuai filter"
                                : "Belum ada toko terdaftar"}
                            </p>
                            {!search &&
                              filterStatus === "all" &&
                              filterType === "all" && (
                                <button
                                  onClick={() => router.push("/registration")}
                                  style={{
                                    marginTop: 12,
                                    padding: "8px 20px",
                                    border: "none",
                                    borderRadius: 6,
                                    background:
                                      "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                                    color: "#fff",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    fontFamily: "'Nunito', sans-serif",
                                    cursor: "pointer"
                                  }}
                                >
                                  + Daftarkan Toko Pertama
                                </button>
                              )}
                          </td>
                        </tr>
                      ) : (
                        paginated.map((store, idx) => {
                          const sc = statusColor(store.status, isDark)
                          const isEven = idx % 2 === 0
                          return (
                            <tr
                              key={store.id}
                              style={{
                                background: isEven
                                  ? "transparent"
                                  : isDark
                                    ? "rgba(255,255,255,0.01)"
                                    : "rgba(0,0,0,0.01)",
                                borderBottom: `1px solid ${isDark ? "#111" : "#f8fafc"}`,
                                transition: "background 0.15s"
                              }}
                              onMouseEnter={(e) => {
                                ;(
                                  e.currentTarget as HTMLTableRowElement
                                ).style.background = isDark
                                  ? "#161616"
                                  : "#f8fafc"
                              }}
                              onMouseLeave={(e) => {
                                ;(
                                  e.currentTarget as HTMLTableRowElement
                                ).style.background = isEven
                                  ? "transparent"
                                  : isDark
                                    ? "rgba(255,255,255,0.01)"
                                    : "rgba(0,0,0,0.01)"
                              }}
                            >
                              <td style={{ padding: "12px 16px" }}>
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: isDark ? "#60a5fa" : "#1e3a8a",
                                    fontFamily: "'Nunito', sans-serif"
                                  }}
                                >
                                  {store.storeId}
                                </span>
                              </td>
                              <td
                                style={{ padding: "12px 16px", minWidth: 180 }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: "6px",
                                      bgcolor: isDark ? "#0d1f3c" : "#e6f1fb",
                                      border: `1px solid ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: 14,
                                      flexShrink: 0
                                    }}
                                  >
                                    🏪
                                  </Box>
                                  <Box>
                                    <p
                                      style={{
                                        margin: 0,
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color: p.textPrimary,
                                        fontFamily: "'Nunito', sans-serif"
                                      }}
                                    >
                                      {store.storeName}
                                    </p>
                                    {store.storeEmail && (
                                      <p
                                        style={{
                                          margin: 0,
                                          fontSize: 11,
                                          color: p.textMuted,
                                          fontFamily: "'Nunito', sans-serif"
                                        }}
                                      >
                                        {store.storeEmail}
                                      </p>
                                    )}
                                  </Box>
                                </Box>
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <span
                                  style={{
                                    fontSize: 12,
                                    color: p.textSecondary,
                                    fontFamily: "'Nunito', sans-serif"
                                  }}
                                >
                                  {store.storeType}
                                </span>
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: p.textPrimary,
                                    fontFamily: "'Nunito', sans-serif"
                                  }}
                                >
                                  {store.owner.fullName}
                                </p>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 10,
                                    color: p.textMuted,
                                    fontFamily: "'Nunito', sans-serif"
                                  }}
                                >
                                  NIK: {store.owner.nik.slice(0, 6)}••••••••••
                                </p>
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 12,
                                    color: p.textPrimary,
                                    fontFamily: "'Nunito', sans-serif"
                                  }}
                                >
                                  {store.storeCity}
                                </p>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 10,
                                    color: p.textMuted,
                                    fontFamily: "'Nunito', sans-serif"
                                  }}
                                >
                                  {store.storeProvince}
                                </p>
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <span
                                  style={{
                                    fontSize: 12,
                                    color: p.textSecondary,
                                    fontFamily: "'Nunito', sans-serif"
                                  }}
                                >
                                  {store.storePhone}
                                </span>
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "3px 10px",
                                    borderRadius: 100,
                                    background: sc.bg,
                                    color: sc.text,
                                    border: `1px solid ${sc.border}`,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    fontFamily: "'Nunito', sans-serif"
                                  }}
                                >
                                  {sc.label}
                                </span>
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: p.textMuted,
                                    fontFamily: "'Nunito', sans-serif"
                                  }}
                                >
                                  {new Date(store.createdAt).toLocaleDateString(
                                    "id-ID",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric"
                                    }
                                  )}
                                </span>
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <Box sx={{ display: "flex", gap: 0.5 }}>
                                  <Tooltip title="Lihat detail">
                                    <IconButton
                                      size="small"
                                      onClick={() => openDetail(store)}
                                      sx={{
                                        color: p.textMuted,
                                        "&:hover": {
                                          color: isDark ? "#60a5fa" : "#1e3a8a",
                                          bgcolor: isDark
                                            ? "#0d1f3c"
                                            : "#e6f1fb"
                                        }
                                      }}
                                    >
                                      <Icon
                                        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
                                        size={15}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Hapus toko">
                                    <IconButton
                                      size="small"
                                      onClick={() => openDeleteConfirm(store)}
                                      sx={{
                                        color: p.textMuted,
                                        "&:hover": {
                                          color: "#ef4444",
                                          bgcolor: isDark
                                            ? "#2e1010"
                                            : "#fef2f2"
                                        }
                                      }}
                                    >
                                      <Icon
                                        d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
                                        size={15}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </Box>
              )}

              {/* Pagination */}
              {!loading && filtered.length > 0 && (
                <Box
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: 2,
                    borderTop: `1px solid ${p.border}`,
                    bgcolor: p.tableHeadBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: p.textMuted,
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  >
                    <strong style={{ color: p.textSecondary }}>
                      {(page - 1) * PAGE_SIZE + 1}–
                      {Math.min(page * PAGE_SIZE, filtered.length)}
                    </strong>{" "}
                    dari{" "}
                    <strong style={{ color: p.textSecondary }}>
                      {filtered.length}
                    </strong>{" "}
                    toko
                  </span>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {[
                      {
                        label: "‹",
                        action: () => setPage((v) => Math.max(1, v - 1)),
                        disabled: page === 1,
                        active: false
                      },
                      ...Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => ({
                          label: String(i + 1),
                          action: () => setPage(i + 1),
                          disabled: false,
                          active: page === i + 1
                        })
                      ),
                      {
                        label: "›",
                        action: () =>
                          setPage((v) => Math.min(totalPages, v + 1)),
                        disabled: page === totalPages,
                        active: false
                      }
                    ].map((btn, i) => (
                      <button
                        key={i}
                        onClick={btn.action}
                        disabled={btn.disabled}
                        style={{
                          width: 32,
                          height: 32,
                          border: `1px solid ${btn.active ? "#1e3a8a" : p.border}`,
                          borderRadius: 6,
                          background: btn.active
                            ? isDark
                              ? "#0d1f3c"
                              : "#e6f1fb"
                            : "transparent",
                          color: btn.disabled
                            ? p.textMuted
                            : btn.active
                              ? isDark
                                ? "#60a5fa"
                                : "#1e3a8a"
                              : p.textSecondary,
                          cursor: btn.disabled ? "not-allowed" : "pointer",
                          fontSize: 13,
                          fontWeight: 700,
                          fontFamily: "'Nunito', sans-serif",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <StoreDetailModal
        store={selectedStore}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false)
          setSelectedStore(null)
        }}
        isDark={isDark}
        p={p}
      />
      <DeleteModal
        store={deleteStore}
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false)
          setDeleteStore(null)
        }}
        onConfirm={handleDelete}
        isDark={isDark}
        p={p}
        isDeleting={isDeleting}
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
          sx={{ fontFamily: "'Nunito', sans-serif", fontSize: 13 }}
        >
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  )
}
