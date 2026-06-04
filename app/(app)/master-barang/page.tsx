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

// ── Types ──────────────────────────────────────────────────────────────────
interface Satuan {
  id: string
  kode: string
  nama: string
  keterangan?: string
}

interface Pabrik {
  id: string
  kode: string
  nama: string
  kota?: string
  telepon?: string
  alamat?: string
}

interface Merek {
  id: string
  kode: string
  nama: string
  pabrikId: string
  pabrikNama?: string
}

interface Supplier {
  id: string
  kode: string
  nama: string
  kontakPerson?: string
  telepon?: string
  email?: string
  kota?: string
  alamat?: string
}

interface Barang {
  id: string
  kode: string
  nama: string
  barcode?: string
  jenis?: string
  satuanId: string
  satuanNama?: string
  merekId?: string
  merekNama?: string
  supplierId?: string
  supplierNama?: string
  hargaBeli: number
  hargaJual: number
  stokMinimum: number
  status: "aktif" | "nonaktif"
  createdAt: string
}

type TabKey = "satuan" | "pabrik" | "merek" | "supplier" | "barang"

const TAB_LIST: { key: TabKey; label: string; step: number }[] = [
  { key: "satuan", label: "Satuan", step: 1 },
  { key: "pabrik", label: "Pabrik", step: 2 },
  { key: "merek", label: "Merek", step: 3 },
  { key: "supplier", label: "Supplier", step: 4 },
  { key: "barang", label: "Buat Barang", step: 5 }
]

// ── Palette type ──────────────────────────────────────────────────────────
interface Palette {
  bg: string
  bgPaper: string
  sidebarBg: string
  border: string
  borderHover?: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  activeNavBg?: string
  activeNavBorder?: string
  hoverBg?: string
  tableHeadBg: string
  tableRowBorder?: string
  progressTrack?: string
  menuShadow: string
  inputBg: string
}

// ── Small Icon helper ──────────────────────────────────────────────────────
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

// ── Reusable form field ────────────────────────────────────────────────────
function Field({
  label,
  required,
  children
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#64748b",
          fontFamily: "'Nunito', sans-serif",
          letterSpacing: "0.04em"
        }}
      >
        {label.toUpperCase()}
        {required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </Box>
  )
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────
function DeleteModal({
  open,
  label,
  onClose,
  onConfirm,
  isDark,
  p,
  isDeleting
}: {
  open: boolean
  label: string
  onClose: () => void
  onConfirm: () => void
  isDark: boolean
  p: Palette
  isDeleting: boolean
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90vw", sm: 400 },
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
            Konfirmasi Hapus
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
              Yakin ingin menghapus <strong>&ldquo;{label}&rdquo;</strong>?
              Tindakan ini tidak dapat dibatalkan.
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

// ── Skeleton rows ──────────────────────────────────────────────────────────
function SkeletonRows({ cols, isDark }: { cols: number; isDark: boolean }) {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} style={{ padding: "12px 14px" }}>
              <Box
                sx={{
                  height: 11,
                  borderRadius: 1,
                  bgcolor: isDark ? "#1f1f1f" : "#f1f5f9",
                  width: j === 1 ? "75%" : "55%",
                  animation: "pulse 1.5s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%,100%": { opacity: 1 },
                    "50%": { opacity: 0.4 }
                  }
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ── Table wrapper ──────────────────────────────────────────────────────────
function TableWrap({ children, p }: { children: React.ReactNode; p: Palette }) {
  return (
    <Box
      sx={{
        border: `1px solid ${p.border}`,
        borderRadius: "6px",
        overflow: "hidden",
        mt: 2
      }}
    >
      <Box sx={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "'Nunito', sans-serif"
          }}
        >
          {children}
        </table>
      </Box>
    </Box>
  )
}

// ── Th ────────────────────────────────────────────────────────────────────
function Th({
  children,
  w,
  p
}: {
  children?: React.ReactNode
  w?: number | string
  p: Palette
}) {
  return (
    <th
      style={{
        padding: "9px 14px",
        textAlign: "left",
        fontSize: 10,
        fontWeight: 700,
        color: p.textMuted,
        letterSpacing: "0.08em",
        whiteSpace: "nowrap",
        background: p.tableHeadBg,
        borderBottom: `1px solid ${p.border}`,
        width: w
      }}
    >
      {children}
    </th>
  )
}

// ── Td ────────────────────────────────────────────────────────────────────
function Td({
  children,
  muted,
  p,
  isDark
}: {
  children: React.ReactNode
  muted?: boolean
  p: Palette
  isDark: boolean
}) {
  return (
    <td
      style={{
        padding: "11px 14px",
        fontSize: 13,
        color: muted ? p.textMuted : p.textPrimary,
        fontFamily: "'Nunito', sans-serif",
        borderBottom: `1px solid ${isDark ? "#111" : "#f8fafc"}`
      }}
    >
      {children}
    </td>
  )
}

// ── Action buttons ────────────────────────────────────────────────────────
function ActionBtns({
  onDelete,
  p,
  isDark
}: {
  onDelete: () => void
  p: Palette
  isDark: boolean
}) {
  return (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      <Tooltip title="Hapus">
        <IconButton
          size="small"
          onClick={onDelete}
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
            size={14}
          />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

// ── Info note ──────────────────────────────────────────────────────────────
function InfoNote({ text, isDark }: { text: string; isDark: boolean }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        p: "10px 14px",
        bgcolor: isDark ? "#0a2219" : "#f0fdf4",
        border: `1px solid ${isDark ? "#1a5c38" : "#bbf7d0"}`,
        borderRadius: "6px",
        mb: 2
      }}
    >
      <Icon
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01"
        size={15}
        color={isDark ? "#4ade80" : "#16a34a"}
      />
      <span
        style={{
          fontSize: 12,
          color: isDark ? "#4ade80" : "#166534",
          fontFamily: "'Nunito', sans-serif",
          lineHeight: 1.5
        }}
      >
        {text}
      </span>
    </Box>
  )
}

// ── Save + Next button ─────────────────────────────────────────────────────
function SaveNextBtn({
  onSave,
  onSkip,
  nextTab,
  saving,
  setActiveTab,
  p
}: {
  onSave: () => void
  onSkip?: () => void
  nextTab?: TabKey
  saving: boolean
  setActiveTab: (tab: TabKey) => void
  p: Palette
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 1,
        mt: 2,
        pt: 2,
        borderTop: `1px solid ${p.border}`
      }}
    >
      {onSkip && nextTab && (
        <button
          onClick={() => {
            onSkip()
            setActiveTab(nextTab)
          }}
          style={{
            padding: "9px 18px",
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
          Lewati
        </button>
      )}
      <button
        onClick={onSave}
        disabled={saving}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "9px 20px",
          border: "none",
          borderRadius: 6,
          background: saving
            ? "#1e3a8a"
            : "linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%)",
          boxShadow: "0 4px 12px rgba(59,130,246,.25)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 700,
          fontFamily: "'Nunito', sans-serif",
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.7 : 1
        }}
      >
        <Icon d="M12 5v14M5 12h14" size={14} color="#fff" />
        {saving
          ? "Menyimpan..."
          : nextTab
            ? "Simpan & Lanjut"
            : "Simpan Barang"}
      </button>
    </Box>
  )
}

// ── Section label ──────────────────────────────────────────────────────────
function SectionLabel({
  text,
  isDark,
  p
}: {
  text: string
  isDark: boolean
  p: Palette
}) {
  return (
    <Box
      sx={{
        gridColumn: "1 / -1",
        pt: 1,
        pb: 0.5,
        borderBottom: `1px solid ${p.border}`,
        mb: 0.5
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: isDark ? "#60a5fa" : "#1e3a8a",
          fontFamily: "'Nunito', sans-serif",
          letterSpacing: "0.08em"
        }}
      >
        {text}
      </span>
    </Box>
  )
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function MasterBarangPage() {
  const router = useRouter()
  const { isDark, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>("satuan")

  // ── Data states ──
  const [satuanList, setSatuanList] = useState<Satuan[]>([])
  const [pabrikList, setPabrikList] = useState<Pabrik[]>([])
  const [merekList, setMerekList] = useState<Merek[]>([])
  const [supplierList, setSupplierList] = useState<Supplier[]>([])
  const [barangList, setBarangList] = useState<Barang[]>([])

  // ── Loading ──
  const [loadingSatuan, setLoadingSatuan] = useState(false)
  const [loadingPabrik, setLoadingPabrik] = useState(false)
  const [loadingMerek, setLoadingMerek] = useState(false)
  const [loadingSupplier, setLoadingSupplier] = useState(false)
  const [loadingBarang, setLoadingBarang] = useState(false)

  // ── Saving ──
  const [saving, setSaving] = useState(false)

  // ── Delete modal ──
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    label: string
    onConfirm: () => void
  }>({ open: false, label: "", onConfirm: () => {} })
  const [isDeleting, setIsDeleting] = useState(false)

  // ── Snackbar ──
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    msg: string
    severity: "success" | "error"
  }>({ open: false, msg: "", severity: "success" })
  const showSnackbar = (msg: string, severity: "success" | "error") =>
    setSnackbar({ open: true, msg, severity })

  // ── Forms ──
  const [satuanForm, setSatuanForm] = useState({
    kode: "",
    nama: "",
    keterangan: ""
  })
  const [pabrikForm, setPabrikForm] = useState({
    kode: "",
    nama: "",
    kota: "",
    telepon: "",
    alamat: ""
  })
  const [merekForm, setMerekForm] = useState({
    kode: "",
    nama: "",
    pabrikId: ""
  })
  const [supplierForm, setSupplierForm] = useState({
    kode: "",
    nama: "",
    kontakPerson: "",
    telepon: "",
    email: "",
    kota: "",
    alamat: ""
  })
  const [barangForm, setBarangForm] = useState({
    kode: "",
    nama: "",
    barcode: "",
    jenis: "",
    satuanId: "",
    merekId: "",
    supplierId: "",
    hargaBeli: "",
    hargaJual: "",
    stokMinimum: "",
    status: "aktif"
  })

  // ── Theme ──
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
      borderHover: isDark ? "#333333" : "#cbd5e1",
      textPrimary: isDark ? "#F5F5F0" : "#0f172a",
      textSecondary: isDark ? "#888888" : "#64748b",
      textMuted: isDark ? "#555555" : "#94a3b8",
      activeNavBg: isDark ? "#0d1f3c" : "#e6f1fb",
      activeNavBorder: isDark ? "#0d3830" : "#a7d4ce",
      hoverBg: isDark ? "#161616" : "#f1f5f9",
      tableHeadBg: isDark ? "#111111" : "#f8fafc",
      tableRowBorder: isDark ? "#151515" : "#f1f5f9",
      progressTrack: isDark ? "#1f1f1f" : "#e2e8f0",
      menuShadow: isDark
        ? "0 8px 32px rgba(0,0,0,0.8)"
        : "0 8px 32px rgba(0,0,0,0.12)",
      inputBg: isDark ? "#111" : "#fff"
    }),
    [isDark]
  )

  const T = "0.3s ease"
  const isMobile = useMediaQuery("(max-width: 768px)")

  const inputStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 6,
    border: `1px solid ${p.border}`,
    background: p.inputBg,
    color: p.textPrimary,
    fontFamily: "'Nunito', sans-serif",
    fontSize: 13,
    outline: "none",
    width: "100%",
    boxSizing: "border-box"
  }

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    resize: "none",
    height: 72
  }

  // ── Fetch helpers ──
  const fetchSatuan = async () => {
    setLoadingSatuan(true)
    try {
      const res = await fetch("/api/master/satuan")
      const data = await res.json()
      if (data.success) setSatuanList(data.data)
    } catch {
      /* silent */
    } finally {
      setLoadingSatuan(false)
    }
  }

  const fetchPabrik = async () => {
    setLoadingPabrik(true)
    try {
      const res = await fetch("/api/master/pabrik")
      const data = await res.json()
      if (data.success) setPabrikList(data.data)
    } catch {
      /* silent */
    } finally {
      setLoadingPabrik(false)
    }
  }

  const fetchMerek = async () => {
    setLoadingMerek(true)
    try {
      const res = await fetch("/api/master/merek")
      const data = await res.json()
      if (data.success) setMerekList(data.data)
    } catch {
      /* silent */
    } finally {
      setLoadingMerek(false)
    }
  }

  const fetchSupplier = async () => {
    setLoadingSupplier(true)
    try {
      const res = await fetch("/api/master/supplier")
      const data = await res.json()
      if (data.success) setSupplierList(data.data)
    } catch {
      /* silent */
    } finally {
      setLoadingSupplier(false)
    }
  }

  const fetchBarang = async () => {
    setLoadingBarang(true)
    try {
      const res = await fetch("/api/master/barang")
      const data = await res.json()
      if (data.success) setBarangList(data.data)
    } catch {
      /* silent */
    } finally {
      setLoadingBarang(false)
    }
  }

  useEffect(() => {
    fetchSatuan()
    fetchPabrik()
    fetchMerek()
    fetchSupplier()
    fetchBarang()
  }, [])

  // ── Save handlers ──
  const handleSaveSatuan = async () => {
    if (!satuanForm.kode || !satuanForm.nama) {
      showSnackbar("Kode dan Nama wajib diisi", "error")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/master/satuan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(satuanForm)
      })
      if (!res.ok) throw new Error()
      showSnackbar("Satuan berhasil disimpan", "success")
      setSatuanForm({ kode: "", nama: "", keterangan: "" })
      fetchSatuan()
    } catch {
      showSnackbar("Gagal menyimpan satuan", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleSavePabrik = async () => {
    if (!pabrikForm.kode || !pabrikForm.nama) {
      showSnackbar("Kode dan Nama wajib diisi", "error")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/master/pabrik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pabrikForm)
      })
      if (!res.ok) throw new Error()
      showSnackbar("Pabrik berhasil disimpan", "success")
      setPabrikForm({ kode: "", nama: "", kota: "", telepon: "", alamat: "" })
      fetchPabrik()
    } catch {
      showSnackbar("Gagal menyimpan pabrik", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveMerek = async () => {
    if (!merekForm.kode || !merekForm.nama) {
      showSnackbar("Kode dan Nama wajib diisi", "error")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/master/merek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merekForm)
      })
      if (!res.ok) throw new Error()
      showSnackbar("Merek berhasil disimpan", "success")
      setMerekForm({ kode: "", nama: "", pabrikId: "" })
      fetchMerek()
    } catch {
      showSnackbar("Gagal menyimpan merek", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSupplier = async () => {
    if (!supplierForm.kode || !supplierForm.nama) {
      showSnackbar("Kode dan Nama wajib diisi", "error")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/master/supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierForm)
      })
      if (!res.ok) throw new Error()
      showSnackbar("Supplier berhasil disimpan", "success")
      setSupplierForm({
        kode: "",
        nama: "",
        kontakPerson: "",
        telepon: "",
        email: "",
        kota: "",
        alamat: ""
      })
      fetchSupplier()
    } catch {
      showSnackbar("Gagal menyimpan supplier", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBarang = async () => {
    if (!barangForm.kode || !barangForm.nama || !barangForm.satuanId) {
      showSnackbar("Kode, Nama, dan Satuan wajib diisi", "error")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/master/barang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...barangForm,
          hargaBeli: Number(barangForm.hargaBeli),
          hargaJual: Number(barangForm.hargaJual),
          stokMinimum: Number(barangForm.stokMinimum)
        })
      })
      if (!res.ok) throw new Error()
      showSnackbar("Barang berhasil disimpan", "success")
      setBarangForm({
        kode: "",
        nama: "",
        barcode: "",
        jenis: "",
        satuanId: "",
        merekId: "",
        supplierId: "",
        hargaBeli: "",
        hargaJual: "",
        stokMinimum: "",
        status: "aktif"
      })
      fetchBarang()
    } catch {
      showSnackbar("Gagal menyimpan barang", "error")
    } finally {
      setSaving(false)
    }
  }

  // ── Delete handlers ──
  const confirmDelete = (label: string, onConfirm: () => void) =>
    setDeleteModal({ open: true, label, onConfirm })

  const deleteSatuan = (id: string, nama: string) =>
    confirmDelete(nama, async () => {
      setIsDeleting(true)
      try {
        await fetch(`/api/master/satuan/${id}`, { method: "DELETE" })
        setSatuanList((prev) => prev.filter((s) => s.id !== id))
        showSnackbar("Satuan dihapus", "success")
        setDeleteModal((m) => ({ ...m, open: false }))
      } catch {
        showSnackbar("Gagal menghapus", "error")
      } finally {
        setIsDeleting(false)
      }
    })

  const deletePabrik = (id: string, nama: string) =>
    confirmDelete(nama, async () => {
      setIsDeleting(true)
      try {
        await fetch(`/api/master/pabrik/${id}`, { method: "DELETE" })
        setPabrikList((prev) => prev.filter((s) => s.id !== id))
        showSnackbar("Pabrik dihapus", "success")
        setDeleteModal((m) => ({ ...m, open: false }))
      } catch {
        showSnackbar("Gagal menghapus", "error")
      } finally {
        setIsDeleting(false)
      }
    })

  const deleteMerek = (id: string, nama: string) =>
    confirmDelete(nama, async () => {
      setIsDeleting(true)
      try {
        await fetch(`/api/master/merek/${id}`, { method: "DELETE" })
        setMerekList((prev) => prev.filter((s) => s.id !== id))
        showSnackbar("Merek dihapus", "success")
        setDeleteModal((m) => ({ ...m, open: false }))
      } catch {
        showSnackbar("Gagal menghapus", "error")
      } finally {
        setIsDeleting(false)
      }
    })

  const deleteSupplier = (id: string, nama: string) =>
    confirmDelete(nama, async () => {
      setIsDeleting(true)
      try {
        await fetch(`/api/master/supplier/${id}`, { method: "DELETE" })
        setSupplierList((prev) => prev.filter((s) => s.id !== id))
        showSnackbar("Supplier dihapus", "success")
        setDeleteModal((m) => ({ ...m, open: false }))
      } catch {
        showSnackbar("Gagal menghapus", "error")
      } finally {
        setIsDeleting(false)
      }
    })

  const deleteBarang = (id: string, nama: string) =>
    confirmDelete(nama, async () => {
      setIsDeleting(true)
      try {
        await fetch(`/api/master/barang/${id}`, { method: "DELETE" })
        setBarangList((prev) => prev.filter((s) => s.id !== id))
        showSnackbar("Barang dihapus", "success")
        setDeleteModal((m) => ({ ...m, open: false }))
      } catch {
        showSnackbar("Gagal menghapus", "error")
      } finally {
        setIsDeleting(false)
      }
    })

  // ── Tab content renderers ──────────────────────────────────────────────

  const renderSatuan = () => (
    <Box>
      <InfoNote
        text="Satuan digunakan sebagai referensi penghitungan stok barang."
        isDark={isDark}
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2
        }}
      >
        <Field label="Kode Satuan" required>
          <input
            style={inputStyle}
            value={satuanForm.kode}
            onChange={(e) =>
              setSatuanForm((f) => ({ ...f, kode: e.target.value }))
            }
            placeholder="Contoh: PCS, BOX, BTL"
          />
        </Field>
        <Field label="Nama Satuan" required>
          <input
            style={inputStyle}
            value={satuanForm.nama}
            onChange={(e) =>
              setSatuanForm((f) => ({ ...f, nama: e.target.value }))
            }
            placeholder="Contoh: Pieces, Box, Botol"
          />
        </Field>
        <Box sx={{ gridColumn: "1 / -1" }}>
          <Field label="Keterangan">
            <textarea
              style={textareaStyle}
              value={satuanForm.keterangan}
              onChange={(e) =>
                setSatuanForm((f) => ({ ...f, keterangan: e.target.value }))
              }
              placeholder="Deskripsi tambahan (opsional)"
            />
          </Field>
        </Box>
      </Box>
      <SaveNextBtn
        onSave={handleSaveSatuan}
        onSkip={() => {}}
        nextTab="pabrik"
        saving={saving}
        setActiveTab={setActiveTab}
        p={p}
      />

      <TableWrap p={p}>
        <thead>
          <tr>
            <Th p={p}>KODE</Th>
            <Th p={p}>NAMA SATUAN</Th>
            <Th p={p}>KETERANGAN</Th>
            <Th p={p} w={60}></Th>
          </tr>
        </thead>
        <tbody>
          {loadingSatuan ? (
            <SkeletonRows cols={4} isDark={isDark} />
          ) : satuanList.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                style={{
                  padding: "32px",
                  textAlign: "center",
                  fontSize: 13,
                  color: p.textMuted,
                  fontFamily: "'Nunito', sans-serif"
                }}
              >
                Belum ada data satuan
              </td>
            </tr>
          ) : (
            satuanList.map((s) => (
              <tr key={s.id}>
                <Td p={p} isDark={isDark}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isDark ? "#60a5fa" : "#1e3a8a"
                    }}
                  >
                    {s.kode}
                  </span>
                </Td>
                <Td p={p} isDark={isDark}>
                  {s.nama}
                </Td>
                <Td p={p} isDark={isDark} muted>
                  {s.keterangan || "—"}
                </Td>
                <Td p={p} isDark={isDark}>
                  <ActionBtns
                    onDelete={() => deleteSatuan(s.id, s.nama)}
                    p={p}
                    isDark={isDark}
                  />
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrap>
    </Box>
  )

  const renderPabrik = () => (
    <Box>
      <InfoNote
        text="Data pabrik digunakan sebagai referensi produsen barang."
        isDark={isDark}
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2
        }}
      >
        <Field label="Kode Pabrik" required>
          <input
            style={inputStyle}
            value={pabrikForm.kode}
            onChange={(e) =>
              setPabrikForm((f) => ({ ...f, kode: e.target.value }))
            }
            placeholder="Contoh: KF, GSK"
          />
        </Field>
        <Field label="Nama Pabrik" required>
          <input
            style={inputStyle}
            value={pabrikForm.nama}
            onChange={(e) =>
              setPabrikForm((f) => ({ ...f, nama: e.target.value }))
            }
            placeholder="Nama perusahaan pabrik"
          />
        </Field>
        <Field label="Kota">
          <input
            style={inputStyle}
            value={pabrikForm.kota}
            onChange={(e) =>
              setPabrikForm((f) => ({ ...f, kota: e.target.value }))
            }
            placeholder="Kota pabrik"
          />
        </Field>
        <Field label="No. Telepon">
          <input
            style={inputStyle}
            value={pabrikForm.telepon}
            onChange={(e) =>
              setPabrikForm((f) => ({ ...f, telepon: e.target.value }))
            }
            placeholder="+62..."
          />
        </Field>
        <Box sx={{ gridColumn: "1 / -1" }}>
          <Field label="Alamat">
            <textarea
              style={textareaStyle}
              value={pabrikForm.alamat}
              onChange={(e) =>
                setPabrikForm((f) => ({ ...f, alamat: e.target.value }))
              }
              placeholder="Alamat lengkap pabrik"
            />
          </Field>
        </Box>
      </Box>
      <SaveNextBtn
        onSave={handleSavePabrik}
        onSkip={() => {}}
        nextTab="merek"
        saving={saving}
        setActiveTab={setActiveTab}
        p={p}
      />

      <TableWrap p={p}>
        <thead>
          <tr>
            <Th p={p}>KODE</Th>
            <Th p={p}>NAMA PABRIK</Th>
            <Th p={p}>KOTA</Th>
            <Th p={p}>TELEPON</Th>
            <Th p={p} w={60}></Th>
          </tr>
        </thead>
        <tbody>
          {loadingPabrik ? (
            <SkeletonRows cols={5} isDark={isDark} />
          ) : pabrikList.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                style={{
                  padding: "32px",
                  textAlign: "center",
                  fontSize: 13,
                  color: p.textMuted,
                  fontFamily: "'Nunito', sans-serif"
                }}
              >
                Belum ada data pabrik
              </td>
            </tr>
          ) : (
            pabrikList.map((s) => (
              <tr key={s.id}>
                <Td p={p} isDark={isDark}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isDark ? "#60a5fa" : "#1e3a8a"
                    }}
                  >
                    {s.kode}
                  </span>
                </Td>
                <Td p={p} isDark={isDark}>
                  {s.nama}
                </Td>
                <Td p={p} isDark={isDark} muted>
                  {s.kota || "—"}
                </Td>
                <Td p={p} isDark={isDark} muted>
                  {s.telepon || "—"}
                </Td>
                <Td p={p} isDark={isDark}>
                  <ActionBtns
                    onDelete={() => deletePabrik(s.id, s.nama)}
                    p={p}
                    isDark={isDark}
                  />
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrap>
    </Box>
  )

  const renderMerek = () => (
    <Box>
      <InfoNote
        text="Merek dikaitkan dengan pabrik produsen yang sudah terdaftar."
        isDark={isDark}
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2
        }}
      >
        <Field label="Kode Merek" required>
          <input
            style={inputStyle}
            value={merekForm.kode}
            onChange={(e) =>
              setMerekForm((f) => ({ ...f, kode: e.target.value }))
            }
            placeholder="Contoh: PAR, AMX"
          />
        </Field>
        <Field label="Nama Merek" required>
          <input
            style={inputStyle}
            value={merekForm.nama}
            onChange={(e) =>
              setMerekForm((f) => ({ ...f, nama: e.target.value }))
            }
            placeholder="Nama merek produk"
          />
        </Field>
        <Box sx={{ gridColumn: "1 / -1" }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
            <Box sx={{ flex: 1 }}>
              <Field label="Pabrik">
                <select
                  style={inputStyle}
                  value={merekForm.pabrikId}
                  onChange={(e) =>
                    setMerekForm((f) => ({ ...f, pabrikId: e.target.value }))
                  }
                >
                  <option value="">— Pilih Pabrik —</option>
                  {pabrikList.map((pb) => (
                    <option key={pb.id} value={pb.id}>
                      {pb.nama}
                    </option>
                  ))}
                </select>
              </Field>
            </Box>
            <button
              onClick={() => setActiveTab("pabrik")}
              style={{
                padding: "8px 12px",
                border: `1px solid ${p.border}`,
                borderRadius: 6,
                background: "transparent",
                color: p.textSecondary,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                cursor: "pointer",
                whiteSpace: "nowrap",
                height: 38
              }}
            >
              + Pabrik Baru
            </button>
          </Box>
        </Box>
      </Box>
      <SaveNextBtn
        onSave={handleSaveMerek}
        onSkip={() => {}}
        nextTab="supplier"
        saving={saving}
        setActiveTab={setActiveTab}
        p={p}
      />

      <TableWrap p={p}>
        <thead>
          <tr>
            <Th p={p}>KODE</Th>
            <Th p={p}>NAMA MEREK</Th>
            <Th p={p}>PABRIK</Th>
            <Th p={p} w={60}></Th>
          </tr>
        </thead>
        <tbody>
          {loadingMerek ? (
            <SkeletonRows cols={4} isDark={isDark} />
          ) : merekList.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                style={{
                  padding: "32px",
                  textAlign: "center",
                  fontSize: 13,
                  color: p.textMuted,
                  fontFamily: "'Nunito', sans-serif"
                }}
              >
                Belum ada data merek
              </td>
            </tr>
          ) : (
            merekList.map((s) => (
              <tr key={s.id}>
                <Td p={p} isDark={isDark}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isDark ? "#60a5fa" : "#1e3a8a"
                    }}
                  >
                    {s.kode}
                  </span>
                </Td>
                <Td p={p} isDark={isDark}>
                  {s.nama}
                </Td>
                <Td p={p} isDark={isDark} muted>
                  {s.pabrikNama || "—"}
                </Td>
                <Td p={p} isDark={isDark}>
                  <ActionBtns
                    onDelete={() => deleteMerek(s.id, s.nama)}
                    p={p}
                    isDark={isDark}
                  />
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrap>
    </Box>
  )

  const renderSupplier = () => (
    <Box>
      <InfoNote
        text="Supplier adalah distributor atau pemasok yang akan tercatat di setiap penerimaan barang."
        isDark={isDark}
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2
        }}
      >
        <Field label="Kode Supplier" required>
          <input
            style={inputStyle}
            value={supplierForm.kode}
            onChange={(e) =>
              setSupplierForm((f) => ({ ...f, kode: e.target.value }))
            }
            placeholder="Contoh: SUP001"
          />
        </Field>
        <Field label="Nama Supplier" required>
          <input
            style={inputStyle}
            value={supplierForm.nama}
            onChange={(e) =>
              setSupplierForm((f) => ({ ...f, nama: e.target.value }))
            }
            placeholder="Nama perusahaan supplier"
          />
        </Field>
        <Field label="Kontak Person">
          <input
            style={inputStyle}
            value={supplierForm.kontakPerson}
            onChange={(e) =>
              setSupplierForm((f) => ({ ...f, kontakPerson: e.target.value }))
            }
            placeholder="Nama PIC"
          />
        </Field>
        <Field label="No. Telepon">
          <input
            style={inputStyle}
            value={supplierForm.telepon}
            onChange={(e) =>
              setSupplierForm((f) => ({ ...f, telepon: e.target.value }))
            }
            placeholder="+62..."
          />
        </Field>
        <Field label="Email">
          <input
            style={inputStyle}
            type="email"
            value={supplierForm.email}
            onChange={(e) =>
              setSupplierForm((f) => ({ ...f, email: e.target.value }))
            }
            placeholder="email@supplier.com"
          />
        </Field>
        <Field label="Kota">
          <input
            style={inputStyle}
            value={supplierForm.kota}
            onChange={(e) =>
              setSupplierForm((f) => ({ ...f, kota: e.target.value }))
            }
            placeholder="Kota"
          />
        </Field>
        <Box sx={{ gridColumn: "1 / -1" }}>
          <Field label="Alamat">
            <textarea
              style={textareaStyle}
              value={supplierForm.alamat}
              onChange={(e) =>
                setSupplierForm((f) => ({ ...f, alamat: e.target.value }))
              }
              placeholder="Alamat lengkap supplier"
            />
          </Field>
        </Box>
      </Box>
      <SaveNextBtn
        onSave={handleSaveSupplier}
        onSkip={() => {}}
        nextTab="barang"
        saving={saving}
        setActiveTab={setActiveTab}
        p={p}
      />

      <TableWrap p={p}>
        <thead>
          <tr>
            <Th p={p}>KODE</Th>
            <Th p={p}>NAMA SUPPLIER</Th>
            <Th p={p}>KOTA</Th>
            <Th p={p}>KONTAK</Th>
            <Th p={p}>TELEPON</Th>
            <Th p={p} w={60}></Th>
          </tr>
        </thead>
        <tbody>
          {loadingSupplier ? (
            <SkeletonRows cols={6} isDark={isDark} />
          ) : supplierList.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                style={{
                  padding: "32px",
                  textAlign: "center",
                  fontSize: 13,
                  color: p.textMuted,
                  fontFamily: "'Nunito', sans-serif"
                }}
              >
                Belum ada data supplier
              </td>
            </tr>
          ) : (
            supplierList.map((s) => (
              <tr key={s.id}>
                <Td p={p} isDark={isDark}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isDark ? "#60a5fa" : "#1e3a8a"
                    }}
                  >
                    {s.kode}
                  </span>
                </Td>
                <Td p={p} isDark={isDark}>
                  {s.nama}
                </Td>
                <Td p={p} isDark={isDark} muted>
                  {s.kota || "—"}
                </Td>
                <Td p={p} isDark={isDark} muted>
                  {s.kontakPerson || "—"}
                </Td>
                <Td p={p} isDark={isDark} muted>
                  {s.telepon || "—"}
                </Td>
                <Td p={p} isDark={isDark}>
                  <ActionBtns
                    onDelete={() => deleteSupplier(s.id, s.nama)}
                    p={p}
                    isDark={isDark}
                  />
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrap>
    </Box>
  )

  const renderBarang = () => (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2
        }}
      >
        <SectionLabel text="IDENTITAS BARANG" isDark={isDark} p={p} />
        <Field label="Kode Barang" required>
          <input
            style={inputStyle}
            value={barangForm.kode}
            onChange={(e) =>
              setBarangForm((f) => ({ ...f, kode: e.target.value }))
            }
            placeholder="Auto / Manual"
          />
        </Field>
        <Field label="Nama Barang" required>
          <input
            style={inputStyle}
            value={barangForm.nama}
            onChange={(e) =>
              setBarangForm((f) => ({ ...f, nama: e.target.value }))
            }
            placeholder="Nama lengkap barang"
          />
        </Field>
        <Field label="Barcode">
          <input
            style={inputStyle}
            value={barangForm.barcode}
            onChange={(e) =>
              setBarangForm((f) => ({ ...f, barcode: e.target.value }))
            }
            placeholder="Scan atau ketik barcode"
          />
        </Field>
        <Field label="Jenis Barang">
          <select
            style={inputStyle}
            value={barangForm.jenis}
            onChange={(e) =>
              setBarangForm((f) => ({ ...f, jenis: e.target.value }))
            }
          >
            <option value="">— Pilih Jenis —</option>
            <option>Obat Bebas</option>
            <option>Obat Keras</option>
            <option>Alat Kesehatan</option>
            <option>Kosmetik</option>
            <option>Suplemen</option>
            <option>Lainnya</option>
          </select>
        </Field>

        <SectionLabel text="REFERENSI" isDark={isDark} p={p} />
        <Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
            <Box sx={{ flex: 1 }}>
              <Field label="Satuan" required>
                <select
                  style={inputStyle}
                  value={barangForm.satuanId}
                  onChange={(e) =>
                    setBarangForm((f) => ({ ...f, satuanId: e.target.value }))
                  }
                >
                  <option value="">— Pilih Satuan —</option>
                  {satuanList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.kode} — {s.nama}
                    </option>
                  ))}
                </select>
              </Field>
            </Box>
            <button
              onClick={() => setActiveTab("satuan")}
              style={{
                padding: "8px 10px",
                border: `1px solid ${p.border}`,
                borderRadius: 6,
                background: "transparent",
                color: p.textSecondary,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                cursor: "pointer",
                height: 38
              }}
            >
              +
            </button>
          </Box>
        </Box>
        <Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
            <Box sx={{ flex: 1 }}>
              <Field label="Merek">
                <select
                  style={inputStyle}
                  value={barangForm.merekId}
                  onChange={(e) =>
                    setBarangForm((f) => ({ ...f, merekId: e.target.value }))
                  }
                >
                  <option value="">— Pilih Merek —</option>
                  {merekList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama}
                    </option>
                  ))}
                </select>
              </Field>
            </Box>
            <button
              onClick={() => setActiveTab("merek")}
              style={{
                padding: "8px 10px",
                border: `1px solid ${p.border}`,
                borderRadius: 6,
                background: "transparent",
                color: p.textSecondary,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                cursor: "pointer",
                height: 38
              }}
            >
              +
            </button>
          </Box>
        </Box>
        <Box sx={{ gridColumn: "1 / -1" }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
            <Box sx={{ flex: 1 }}>
              <Field label="Supplier Default">
                <select
                  style={inputStyle}
                  value={barangForm.supplierId}
                  onChange={(e) =>
                    setBarangForm((f) => ({ ...f, supplierId: e.target.value }))
                  }
                >
                  <option value="">— Pilih Supplier —</option>
                  {supplierList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.kode})
                    </option>
                  ))}
                </select>
              </Field>
            </Box>
            <button
              onClick={() => setActiveTab("supplier")}
              style={{
                padding: "8px 10px",
                border: `1px solid ${p.border}`,
                borderRadius: 6,
                background: "transparent",
                color: p.textSecondary,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                cursor: "pointer",
                height: 38
              }}
            >
              +
            </button>
          </Box>
        </Box>

        <SectionLabel text="HARGA & STOK" isDark={isDark} p={p} />
        <Field label="Harga Beli (Rp)">
          <input
            style={inputStyle}
            type="number"
            value={barangForm.hargaBeli}
            onChange={(e) =>
              setBarangForm((f) => ({ ...f, hargaBeli: e.target.value }))
            }
            placeholder="0"
            min={0}
          />
        </Field>
        <Field label="Harga Jual (Rp)">
          <input
            style={inputStyle}
            type="number"
            value={barangForm.hargaJual}
            onChange={(e) =>
              setBarangForm((f) => ({ ...f, hargaJual: e.target.value }))
            }
            placeholder="0"
            min={0}
          />
        </Field>
        <Field label="Stok Minimum">
          <input
            style={inputStyle}
            type="number"
            value={barangForm.stokMinimum}
            onChange={(e) =>
              setBarangForm((f) => ({ ...f, stokMinimum: e.target.value }))
            }
            placeholder="0"
            min={0}
          />
        </Field>
        <Field label="Status">
          <select
            style={inputStyle}
            value={barangForm.status}
            onChange={(e) =>
              setBarangForm((f) => ({
                ...f,
                status: e.target.value as "aktif" | "nonaktif"
              }))
            }
          >
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Non-Aktif</option>
          </select>
        </Field>
      </Box>

      <SaveNextBtn
        onSave={handleSaveBarang}
        saving={saving}
        setActiveTab={setActiveTab}
        p={p}
      />

      <TableWrap p={p}>
        <thead>
          <tr>
            <Th p={p}>KODE</Th>
            <Th p={p}>NAMA BARANG</Th>
            <Th p={p}>SATUAN</Th>
            <Th p={p}>MEREK</Th>
            <Th p={p}>HARGA JUAL</Th>
            <Th p={p}>STATUS</Th>
            <Th p={p} w={60} />
          </tr>
        </thead>
        <tbody>
          {loadingBarang ? (
            <SkeletonRows cols={7} isDark={isDark} />
          ) : barangList.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                style={{
                  padding: "32px",
                  textAlign: "center",
                  fontSize: 13,
                  color: p.textMuted,
                  fontFamily: "'Nunito', sans-serif"
                }}
              >
                Belum ada data barang
              </td>
            </tr>
          ) : (
            barangList.map((b) => (
              <tr key={b.id}>
                <Td p={p} isDark={isDark}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isDark ? "#60a5fa" : "#1e3a8a"
                    }}
                  >
                    {b.kode}
                  </span>
                </Td>
                <Td p={p} isDark={isDark}>
                  {b.nama}
                </Td>
                <Td p={p} isDark={isDark} muted>
                  {b.satuanNama || "—"}
                </Td>
                <Td p={p} isDark={isDark} muted>
                  {b.merekNama || "—"}
                </Td>
                <Td p={p} isDark={isDark}>
                  Rp {b.hargaJual.toLocaleString("id-ID")}
                </Td>
                <Td p={p} isDark={isDark}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: 100,
                      background:
                        b.status === "aktif"
                          ? isDark
                            ? "#0a2e1c"
                            : "#f0fdf4"
                          : isDark
                            ? "#1f1f1f"
                            : "#f8fafc",
                      color:
                        b.status === "aktif"
                          ? isDark
                            ? "#4ade80"
                            : "#16a34a"
                          : isDark
                            ? "#888"
                            : "#64748b",
                      border: `1px solid ${
                        b.status === "aktif"
                          ? isDark
                            ? "#1a5c38"
                            : "#bbf7d0"
                          : isDark
                            ? "#333"
                            : "#e2e8f0"
                      }`,
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  >
                    {b.status === "aktif" ? "Aktif" : "Non-Aktif"}
                  </span>
                </Td>
                <Td p={p} isDark={isDark}>
                  <ActionBtns
                    onDelete={() => deleteBarang(b.id, b.nama)}
                    p={p}
                    isDark={isDark}
                  />
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrap>
    </Box>
  )

  // ── Step indicator ──
  const currentStep = TAB_LIST.find((t) => t.key === activeTab)?.step ?? 1

  // ── Render ─────────────────────────────────────────────────────────────
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
        {/* Drawers */}
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
              bgcolor: "transparent",
              border: "none",
              overflow: "hidden"
            }
          }}
        >
          <Sidebar isDark={isDark} T={T} />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
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

        {/* Main content */}
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
            title="Master Barang"
            showAddButton={false}
            onAddProduct={() => {}}
            notificationCount={0}
            p={p}
          />

          <Box
            sx={{ flex: 1, overflow: "auto", p: { xs: "12px", sm: "16px" } }}
          >
            {/* Stat cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(5, 1fr)"
                },
                gap: { xs: 1.5, sm: 2 },
                mb: { xs: 2, sm: 3 }
              }}
            >
              {[
                { label: "Satuan", value: satuanList.length, color: "#1e3a8a" },
                { label: "Pabrik", value: pabrikList.length, color: "#0891b2" },
                { label: "Merek", value: merekList.length, color: "#7c3aed" },
                {
                  label: "Supplier",
                  value: supplierList.length,
                  color: "#d97706"
                },
                {
                  label: "Total Barang",
                  value: barangList.length,
                  color: "#16a34a"
                }
              ].map((s) => (
                <Box
                  key={s.label}
                  onClick={() => {
                    if (s.label !== "Total Barang") {
                      setActiveTab(s.label.toLowerCase() as TabKey)
                    } else {
                      setActiveTab("barang")
                    }
                  }}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    border: `1px solid ${p.border}`,
                    bgcolor: p.bgPaper,
                    borderRadius: "8px",
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "box-shadow .15s",
                    "&:hover": {
                      boxShadow: isDark
                        ? "0 0 0 1px #1e3a8a"
                        : "0 0 0 1px #b5d4f4"
                    },
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
              {/* Tab header */}
              <Box
                sx={{
                  borderBottom: `1px solid ${p.border}`,
                  bgcolor: p.tableHeadBg,
                  display: "flex",
                  alignItems: "stretch",
                  overflowX: "auto"
                }}
              >
                {TAB_LIST.map((tab) => {
                  const isActive = activeTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "12px 18px",
                        border: "none",
                        borderBottom: isActive
                          ? "2px solid #1e3a8a"
                          : "2px solid transparent",
                        background: isActive ? p.bgPaper : "transparent",
                        color: isActive
                          ? isDark
                            ? "#60a5fa"
                            : "#1e3a8a"
                          : p.textSecondary,
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 600,
                        fontFamily: "'Nunito', sans-serif",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "color .15s, background .15s"
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: isActive
                            ? isDark
                              ? "#0d1f3c"
                              : "#e6f1fb"
                            : isDark
                              ? "#1f1f1f"
                              : "#f1f5f9",
                          color: isActive
                            ? isDark
                              ? "#60a5fa"
                              : "#1e3a8a"
                            : p.textMuted,
                          fontSize: 10,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                      >
                        {tab.step}
                      </span>
                      {tab.label}
                    </button>
                  )
                })}
              </Box>

              {/* Tab content */}
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Progress hint */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2.5
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: p.textMuted,
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  >
                    Langkah {currentStep} dari 5
                  </span>
                  <Box
                    sx={{
                      flex: 1,
                      height: 3,
                      bgcolor: isDark ? "#1f1f1f" : "#f1f5f9",
                      borderRadius: 2,
                      overflow: "hidden"
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${(currentStep / 5) * 100}%`,
                        background: "linear-gradient(90deg,#1e3a8a,#3b82f6)",
                        borderRadius: 2,
                        transition: "width .3s ease"
                      }}
                    />
                  </Box>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isDark ? "#60a5fa" : "#1e3a8a",
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  >
                    {Math.round((currentStep / 5) * 100)}%
                  </span>
                </Box>

                {activeTab === "satuan" && renderSatuan()}
                {activeTab === "pabrik" && renderPabrik()}
                {activeTab === "merek" && renderMerek()}
                {activeTab === "supplier" && renderSupplier()}
                {activeTab === "barang" && renderBarang()}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Delete modal */}
      <DeleteModal
        open={deleteModal.open}
        label={deleteModal.label}
        onClose={() => setDeleteModal((m) => ({ ...m, open: false }))}
        onConfirm={deleteModal.onConfirm}
        isDark={isDark}
        p={p}
        isDeleting={isDeleting}
      />

      {/* Snackbar */}
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
