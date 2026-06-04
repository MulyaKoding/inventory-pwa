"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Alert,
  Box,
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
  storeId?: string
}
interface Merek {
  id: string
  kode: string
  nama: string
  pabrikId: string
  pabrikNama?: string
  storeId?: string
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
  storeId?: string
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
  storeId?: string
}

interface StoreOption {
  id: string
  storeId: string
  storeName: string
}

type TabKey = "satuan" | "pabrik" | "merek" | "supplier" | "barang"
type ViewMode = "list" | "form"

const TAB_LIST: { key: TabKey; label: string; step: number }[] = [
  { key: "satuan", label: "Satuan", step: 1 },
  { key: "pabrik", label: "Pabrik", step: 2 },
  { key: "merek", label: "Merek", step: 3 },
  { key: "supplier", label: "Supplier", step: 4 },
  { key: "barang", label: "Buat Barang", step: 5 }
]

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

// ── Icons ──────────────────────────────────────────────────────────────────
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

// ── Field ──────────────────────────────────────────────────────────────────
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

// ── Delete Modal ───────────────────────────────────────────────────────────
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

// ── Skeleton ───────────────────────────────────────────────────────────────
function SkeletonRows({ cols, isDark }: { cols: number; isDark: boolean }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
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

// ── Table ──────────────────────────────────────────────────────────────────
function TableWrap({ children, p }: { children: React.ReactNode; p: Palette }) {
  return (
    <Box
      sx={{
        border: `1px solid ${p.border}`,
        borderRadius: "6px",
        overflow: "hidden"
      }}
    >
      <Box sx={{ overflowX: "auto", maxHeight: "60vh", overflowY: "auto" }}>
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

// ── ActionBtns — NOW WITH EDIT ─────────────────────────────────────────────
function ActionBtns({
  onEdit,
  onDelete,
  p,
  isDark
}: {
  onEdit: () => void
  onDelete: () => void
  p: Palette
  isDark: boolean
}) {
  return (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      <Tooltip title="Edit">
        <IconButton
          size="small"
          onClick={onEdit}
          sx={{
            color: p.textMuted,
            "&:hover": {
              color: isDark ? "#60a5fa" : "#1e3a8a",
              bgcolor: isDark ? "#0d1f3c" : "#e6f1fb"
            }
          }}
        >
          <Icon
            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
            size={14}
          />
        </IconButton>
      </Tooltip>
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

function EmptyRow({
  cols,
  text,
  p
}: {
  cols: number
  text: string
  p: Palette
}) {
  return (
    <tr>
      <td
        colSpan={cols}
        style={{
          padding: "48px 32px",
          textAlign: "center",
          fontSize: 13,
          color: p.textMuted,
          fontFamily: "'Nunito', sans-serif"
        }}
      >
        {text}
      </td>
    </tr>
  )
}

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

// ── Form Page Header ───────────────────────────────────────────────────────
function FormPageHeader({
  title,
  onBack,
  onSave,
  saving,
  saveLabel,
  p,
  isDark
}: {
  title: string
  onBack: () => void
  onSave: () => void
  saving: boolean
  saveLabel: string
  p: Palette
  isDark: boolean
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 3,
        pb: 2.5,
        borderBottom: `1px solid ${p.border}`
      }}
    >
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: p.textPrimary,
          fontFamily: "'Nunito', sans-serif"
        }}
      >
        {title}
      </span>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            border: `1px solid ${p.border}`,
            borderRadius: 6,
            background: "transparent",
            color: p.textSecondary,
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Nunito', sans-serif",
            cursor: "pointer"
          }}
        >
          Batal
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 20px",
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
          <Icon d="M5 13l4 4L19 7" size={14} color="#fff" />
          {saving ? "Menyimpan..." : saveLabel}
        </button>
      </Box>
    </Box>
  )
}

// ── List Page Header ───────────────────────────────────────────────────────
function ListPageHeader({
  title,
  count,
  onAdd,
  addLabel,
  search,
  onSearch,
  p,
  isDark
}: {
  title: string
  count: number
  onAdd: () => void
  addLabel: string
  search: string
  onSearch: (v: string) => void
  p: Palette
  isDark: boolean
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 2.5,
        gap: 2
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: p.textPrimary,
            fontFamily: "'Nunito', sans-serif"
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: isDark ? "#60a5fa" : "#1e3a8a",
            background: isDark ? "#0d1f3c" : "#dbeafe",
            border: `1px solid ${isDark ? "#1e3a8a" : "#bfdbfe"}`,
            borderRadius: 100,
            padding: "1px 9px",
            fontFamily: "'Nunito', sans-serif"
          }}
        >
          {count}
        </span>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flex: 1,
          justifyContent: "flex-end"
        }}
      >
        <Box sx={{ position: "relative", width: { xs: "100%", sm: 220 } }}>
          <Box
            sx={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: p.textMuted
            }}
          >
            <Icon
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              size={13}
            />
          </Box>
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Cari kode / nama..."
            style={{
              padding: "7px 12px 7px 30px",
              borderRadius: 6,
              border: `1px solid ${p.border}`,
              background: p.inputBg,
              color: p.textPrimary,
              fontFamily: "'Nunito', sans-serif",
              fontSize: 12,
              outline: "none",
              width: "100%",
              boxSizing: "border-box"
            }}
          />
        </Box>
        <button
          onClick={onAdd}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 16px",
            border: "none",
            borderRadius: 6,
            background: "linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%)",
            boxShadow: "0 4px 12px rgba(59,130,246,.2)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Nunito', sans-serif",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          <Icon d="M12 5v14M5 12h14" size={13} color="#fff" />
          {addLabel}
        </button>
      </Box>
    </Box>
  )
}

// ── Store Selector ─────────────────────────────────────────────────────────
function StoreSelector({
  storeList,
  value,
  onChange,
  loading,
  p,
  isDark,
  inputStyle
}: {
  storeList: StoreOption[]
  value: string
  onChange: (v: string) => void
  loading: boolean
  p: Palette
  isDark: boolean
  inputStyle: React.CSSProperties
}) {
  return (
    <Box
      sx={{
        gridColumn: "1 / -1",
        p: 2,
        mb: 1,
        bgcolor: isDark ? "#0d1f3c22" : "#eff6ff",
        border: `1px solid ${isDark ? "#1e3a8a55" : "#bfdbfe"}`,
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap"
      }}
    >
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke={isDark ? "#60a5fa" : "#1e3a8a"}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: isDark ? "#60a5fa" : "#1e3a8a",
            fontFamily: "'Nunito', sans-serif",
            whiteSpace: "nowrap"
          }}
        >
          Toko Tujuan <span style={{ color: "#ef4444" }}>*</span>
        </span>
      </Box>
      <Box sx={{ flex: 1, minWidth: 200 }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading || storeList.length === 0}
          style={{
            ...inputStyle,
            borderColor: !value ? "#f87171" : (inputStyle.border as string),
            background: isDark ? "#0d1f3c" : "#dbeafe",
            color: isDark ? "#93c5fd" : "#1e3a8a",
            fontWeight: 700
          }}
        >
          <option value="">
            {loading
              ? "Memuat daftar toko..."
              : storeList.length === 0
                ? "Tidak ada toko tersedia"
                : "— Pilih Toko —"}
          </option>
          {storeList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.storeName} ({s.storeId})
            </option>
          ))}
        </select>
      </Box>
      {!value && (
        <span
          style={{
            fontSize: 11,
            color: "#ef4444",
            fontFamily: "'Nunito', sans-serif",
            flexShrink: 0
          }}
        >
          Pilih toko terlebih dahulu
        </span>
      )}
    </Box>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function MasterBarangPage() {
  const router = useRouter()
  const { isDark, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>("satuan")

  const [viewMode, setViewMode] = useState<Record<TabKey, ViewMode>>({
    satuan: "list",
    pabrik: "list",
    merek: "list",
    supplier: "list",
    barang: "list"
  })

  const setView = (tab: TabKey, mode: ViewMode) =>
    setViewMode((prev) => ({ ...prev, [tab]: mode }))

  const goToForm = (tab: TabKey) => {
    setActiveTab(tab)
    setView(tab, "form")
  }

  // Reset form & editing state saat kembali ke list
  const goToList = (tab: TabKey) => {
    setView(tab, "list")
    if (tab === "satuan") {
      setEditingSatuan(null)
      setSatuanForm({ kode: "", nama: "", keterangan: "" })
    }
    if (tab === "pabrik") {
      setEditingPabrik(null)
      setPabrikForm({
        kode: "",
        nama: "",
        kota: "",
        telepon: "",
        alamat: "",
        storeId: selectedStoreId
      })
    }
    if (tab === "merek") {
      setEditingMerek(null)
      setMerekForm({
        kode: "",
        nama: "",
        pabrikId: "",
        storeId: selectedStoreId
      })
    }
    if (tab === "supplier") {
      setEditingSupplier(null)
      setSupplierForm({
        kode: "",
        nama: "",
        kontakPerson: "",
        telepon: "",
        email: "",
        kota: "",
        alamat: "",
        storeId: selectedStoreId
      })
    }
    if (tab === "barang") {
      setEditingBarang(null)
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
        status: "aktif",
        storeId: selectedStoreId
      })
    }
  }

  // ── Data ──
  const [satuanList, setSatuanList] = useState<Satuan[]>([])
  const [pabrikList, setPabrikList] = useState<Pabrik[]>([])
  const [merekList, setMerekList] = useState<Merek[]>([])
  const [supplierList, setSupplierList] = useState<Supplier[]>([])
  const [barangList, setBarangList] = useState<Barang[]>([])

  const [loadingSatuan, setLoadingSatuan] = useState(false)
  const [loadingPabrik, setLoadingPabrik] = useState(false)
  const [loadingMerek, setLoadingMerek] = useState(false)
  const [loadingSupplier, setLoadingSupplier] = useState(false)
  const [loadingBarang, setLoadingBarang] = useState(false)
  const [saving, setSaving] = useState(false)

  const [storeList, setStoreList] = useState<StoreOption[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState("")
  const [loadingStores, setLoadingStores] = useState(false)

  // ── Editing state per entity ──
  const [editingSatuan, setEditingSatuan] = useState<Satuan | null>(null)
  const [editingPabrik, setEditingPabrik] = useState<Pabrik | null>(null)
  const [editingMerek, setEditingMerek] = useState<Merek | null>(null)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [editingBarang, setEditingBarang] = useState<Barang | null>(null)

  useEffect(() => {
    fetchPabrik()
    fetchMerek()
    fetchSupplier()
    fetchBarang()
  }, [selectedStoreId])

  // ── Helpers buka form Edit dengan pre-fill ──
  const goToFormEditSatuan = (data: Satuan) => {
    setEditingSatuan(data)
    setSatuanForm({
      kode: data.kode,
      nama: data.nama,
      keterangan: data.keterangan || ""
    })
    setActiveTab("satuan")
    setView("satuan", "form")
  }
  const goToFormEditPabrik = (data: Pabrik) => {
    setEditingPabrik(data)
    setPabrikForm({
      kode: data.kode,
      nama: data.nama,
      kota: data.kota || "",
      telepon: data.telepon || "",
      alamat: data.alamat || "",
      storeId: data.storeId || selectedStoreId
    })
    setActiveTab("pabrik")
    setView("pabrik", "form")
  }
  const goToFormEditMerek = (data: Merek) => {
    setEditingMerek(data)
    setMerekForm({
      kode: data.kode,
      nama: data.nama,
      pabrikId: data.pabrikId,
      storeId: data.storeId || selectedStoreId
    })
    setActiveTab("merek")
    setView("merek", "form")
  }
  const goToFormEditSupplier = (data: Supplier) => {
    setEditingSupplier(data)
    setSupplierForm({
      kode: data.kode,
      nama: data.nama,
      kontakPerson: data.kontakPerson || "",
      telepon: data.telepon || "",
      email: data.email || "",
      kota: data.kota || "",
      alamat: data.alamat || "",
      storeId: data.storeId || selectedStoreId
    })
    setActiveTab("supplier")
    setView("supplier", "form")
  }
  const goToFormEditBarang = (data: Barang) => {
    setEditingBarang(data)
    setBarangForm({
      kode: data.kode,
      nama: data.nama,
      barcode: data.barcode || "",
      jenis: data.jenis || "",
      satuanId: data.satuanId,
      merekId: data.merekId || "",
      supplierId: data.supplierId || "",
      hargaBeli: String(data.hargaBeli),
      hargaJual: String(data.hargaJual),
      stokMinimum: String(data.stokMinimum),
      status: data.status,
      storeId: data.storeId || selectedStoreId
    })
    setActiveTab("barang")
    setView("barang", "form")
  }

  // ── Delete ──
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
    alamat: "",
    storeId: ""
  })
  const [merekForm, setMerekForm] = useState({
    kode: "",
    nama: "",
    pabrikId: "",
    storeId: ""
  })
  const [supplierForm, setSupplierForm] = useState({
    kode: "",
    nama: "",
    kontakPerson: "",
    telepon: "",
    email: "",
    kota: "",
    alamat: "",
    storeId: ""
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
    status: "aktif",
    storeId: ""
  })

  const [searchSatuan, setSearchSatuan] = useState("")
  const [searchPabrik, setSearchPabrik] = useState("")
  const [searchMerek, setSearchMerek] = useState("")
  const [searchSupplier, setSearchSupplier] = useState("")
  const [searchBarang, setSearchBarang] = useState("")

  const filteredSatuan = satuanList.filter(
    (s) =>
      s.kode.toLowerCase().includes(searchSatuan.toLowerCase()) ||
      s.nama.toLowerCase().includes(searchSatuan.toLowerCase())
  )
  const filteredPabrik = pabrikList.filter(
    (s) =>
      s.kode.toLowerCase().includes(searchPabrik.toLowerCase()) ||
      s.nama.toLowerCase().includes(searchPabrik.toLowerCase())
  )
  const filteredMerek = merekList.filter(
    (s) =>
      s.kode.toLowerCase().includes(searchMerek.toLowerCase()) ||
      s.nama.toLowerCase().includes(searchMerek.toLowerCase())
  )
  const filteredSupplier = supplierList.filter(
    (s) =>
      s.kode.toLowerCase().includes(searchSupplier.toLowerCase()) ||
      s.nama.toLowerCase().includes(searchSupplier.toLowerCase())
  )
  const filteredBarang = barangList.filter(
    (s) =>
      s.kode.toLowerCase().includes(searchBarang.toLowerCase()) ||
      s.nama.toLowerCase().includes(searchBarang.toLowerCase())
  )

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

  // ── Fetchers ──
  const fetchSatuan = async () => {
    setLoadingSatuan(true)
    try {
      const r = await fetch("/api/master/satuan")
      const d = await r.json()
      if (d.success) setSatuanList(d.data)
    } catch {
    } finally {
      setLoadingSatuan(false)
    }
  }

  // fetchPabrik SATU definisi saja, terima optional storeId
  const fetchPabrik = async (storeId?: string) => {
    const id = storeId ?? selectedStoreId
    setLoadingPabrik(true)
    try {
      const params = id ? `?storeId=${id}` : ""
      const r = await fetch(`/api/master/pabrik${params}`)
      const d = await r.json()
      if (d.success) {
        setPabrikList(
          d.data.map((item: any) => ({
            id: item.id,
            kode: item.pabrikCode,
            nama: item.pabrikName,
            kota: item.city,
            telepon: item.phone,
            alamat: item.address,
            storeId: item.storeId
          }))
        )
      }
    } catch {
    } finally {
      setLoadingPabrik(false)
    }
  }

  const fetchMerek = async () => {
    setLoadingMerek(true)
    try {
      const r = await fetch("/api/master/merek")
      const d = await r.json()
      if (d.success) setMerekList(d.data)
    } catch {
    } finally {
      setLoadingMerek(false)
    }
  }

  const fetchSupplier = async () => {
    setLoadingSupplier(true)
    try {
      const r = await fetch("/api/master/supplier")
      const d = await r.json()
      if (d.success) setSupplierList(d.data)
    } catch {
    } finally {
      setLoadingSupplier(false)
    }
  }

  const fetchBarang = async () => {
    setLoadingBarang(true)
    try {
      const r = await fetch("/api/master/barang")
      const d = await r.json()
      if (d.success) setBarangList(d.data)
    } catch {
    } finally {
      setLoadingBarang(false)
    }
  }

  // fetchMyStores mengembalikan storeId terpilih
  const fetchMyStores = async (): Promise<string> => {
    setLoadingStores(true)
    try {
      const r = await fetch("/api/stores/my")
      const d = await r.json()
      if (d.success) {
        setStoreList(d.data)
        if (d.data.length === 1) {
          setSelectedStoreId(d.data[0].id)
          return d.data[0].id
        }
      }
    } catch {
    } finally {
      setLoadingStores(false)
    }
    return ""
  }

  // ── Effects ──

  // SATU init effect — fetch semua setelah stores selesai
  useEffect(() => {
    fetchSatuan()
    fetchMyStores().then((storeId) => {
      fetchPabrik(storeId)
      fetchMerek()
      fetchSupplier()
      fetchBarang()
    })
  }, [])

  // Re-fetch saat user ganti store, SKIP saat mount pertama
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    fetchPabrik()
    fetchMerek()
    fetchSupplier()
    fetchBarang()
  }, [selectedStoreId])

  // ── Save handlers — POST untuk create, PUT untuk edit ──
  const handleSaveSatuan = async () => {
    if (!satuanForm.kode || !satuanForm.nama) {
      showSnackbar("Kode dan Nama wajib diisi", "error")
      return
    }
    setSaving(true)
    try {
      const isEdit = !!editingSatuan
      const res = await fetch(
        isEdit
          ? `/api/master/satuan/${editingSatuan!.id}`
          : "/api/master/satuan",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(satuanForm)
        }
      )
      if (!res.ok) throw new Error()
      showSnackbar(
        isEdit ? "Satuan berhasil diperbarui" : "Satuan berhasil disimpan",
        "success"
      )
      goToList("satuan")
      fetchSatuan()
    } catch {
      showSnackbar("Gagal menyimpan satuan", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleSavePabrik = async () => {
    if (!pabrikForm.kode || !pabrikForm.nama || !selectedStoreId) {
      showSnackbar("Kode, Nama, dan Toko wajib diisi", "error")
      return
    }
    setSaving(true)
    try {
      const isEdit = !!editingPabrik
      const res = await fetch(
        isEdit
          ? `/api/master/pabrik/${editingPabrik!.id}`
          : "/api/master/pabrik",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pabrikCode: pabrikForm.kode,
            pabrikName: pabrikForm.nama,
            city: pabrikForm.kota,
            phone: pabrikForm.telepon,
            address: pabrikForm.alamat,
            storeId: selectedStoreId
          })
        }
      )
      if (!res.ok) throw new Error()
      showSnackbar(
        isEdit ? "Pabrik berhasil diperbarui" : "Pabrik berhasil disimpan",
        "success"
      )
      goToList("pabrik")
      fetchPabrik()
    } catch {
      showSnackbar("Gagal menyimpan pabrik", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveMerek = async () => {
    if (!merekForm.kode || !merekForm.nama || !merekForm.storeId) {
      showSnackbar("Kode, Nama, dan Toko wajib diisi", "error")
      return
    }
    setSaving(true)
    try {
      const isEdit = !!editingMerek
      const res = await fetch(
        isEdit ? `/api/master/merek/${editingMerek!.id}` : "/api/master/merek",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(merekForm)
        }
      )
      if (!res.ok) throw new Error()
      showSnackbar(
        isEdit ? "Merek berhasil diperbarui" : "Merek berhasil disimpan",
        "success"
      )
      goToList("merek")
      fetchMerek()
    } catch {
      showSnackbar("Gagal menyimpan merek", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSupplier = async () => {
    if (!supplierForm.kode || !supplierForm.nama || !supplierForm.storeId) {
      showSnackbar("Kode, Nama, dan Toko wajib diisi", "error")
      return
    }
    setSaving(true)
    try {
      const isEdit = !!editingSupplier
      const res = await fetch(
        isEdit
          ? `/api/master/supplier/${editingSupplier!.id}`
          : "/api/master/supplier",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(supplierForm)
        }
      )
      if (!res.ok) throw new Error()
      showSnackbar(
        isEdit ? "Supplier berhasil diperbarui" : "Supplier berhasil disimpan",
        "success"
      )
      goToList("supplier")
      fetchSupplier()
    } catch {
      showSnackbar("Gagal menyimpan supplier", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBarang = async () => {
    if (
      !barangForm.kode ||
      !barangForm.nama ||
      !barangForm.satuanId ||
      !barangForm.storeId
    ) {
      showSnackbar("Kode, Nama, Satuan, dan Toko wajib diisi", "error")
      return
    }
    setSaving(true)
    try {
      const isEdit = !!editingBarang
      const res = await fetch(
        isEdit
          ? `/api/master/barang/${editingBarang!.id}`
          : "/api/master/barang",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...barangForm,
            hargaBeli: Number(barangForm.hargaBeli),
            hargaJual: Number(barangForm.hargaJual),
            stokMinimum: Number(barangForm.stokMinimum)
          })
        }
      )
      if (!res.ok) throw new Error()
      showSnackbar(
        isEdit ? "Barang berhasil diperbarui" : "Barang berhasil disimpan",
        "success"
      )
      goToList("barang")
      fetchBarang()
    } catch {
      showSnackbar("Gagal menyimpan barang", "error")
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ──
  const confirmDelete = (label: string, onConfirm: () => void) =>
    setDeleteModal({ open: true, label, onConfirm })

  const deleteSatuan = (id: string, nama: string) =>
    confirmDelete(nama, async () => {
      setIsDeleting(true)
      try {
        await fetch(`/api/master/satuan/${id}`, { method: "DELETE" })
        setSatuanList((p) => p.filter((s) => s.id !== id))
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
        setPabrikList((p) => p.filter((s) => s.id !== id))
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
        setMerekList((p) => p.filter((s) => s.id !== id))
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
        setSupplierList((p) => p.filter((s) => s.id !== id))
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
        setBarangList((p) => p.filter((s) => s.id !== id))
        showSnackbar("Barang dihapus", "success")
        setDeleteModal((m) => ({ ...m, open: false }))
      } catch {
        showSnackbar("Gagal menghapus", "error")
      } finally {
        setIsDeleting(false)
      }
    })

  // ══════════════════════════════════════════════════
  // TAB RENDERERS
  // ══════════════════════════════════════════════════

  const renderSatuan = () => {
    if (viewMode.satuan === "form")
      return (
        <Box>
          <FormPageHeader
            title={
              editingSatuan
                ? `Edit Satuan — ${editingSatuan.nama}`
                : "Tambah Satuan Barang"
            }
            onBack={() => goToList("satuan")}
            onSave={handleSaveSatuan}
            saving={saving}
            saveLabel={editingSatuan ? "Simpan Perubahan" : "Simpan Satuan"}
            p={p}
            isDark={isDark}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2.5
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
                autoFocus
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
        </Box>
      )

    return (
      <Box>
        <ListPageHeader
          title="Daftar Satuan Barang"
          count={filteredSatuan.length}
          onAdd={() => goToForm("satuan")}
          addLabel="Tambah Satuan"
          search={searchSatuan}
          onSearch={setSearchSatuan}
          p={p}
          isDark={isDark}
        />
        <TableWrap p={p}>
          <thead>
            <tr>
              <Th p={p}>KODE</Th>
              <Th p={p}>NAMA SATUAN</Th>
              <Th p={p}>KETERANGAN</Th>
              <Th p={p} w={80} />
            </tr>
          </thead>
          <tbody>
            {loadingSatuan ? (
              <SkeletonRows cols={4} isDark={isDark} />
            ) : filteredSatuan.length === 0 ? (
              <EmptyRow
                cols={4}
                text={
                  searchSatuan
                    ? "Tidak ada hasil pencarian."
                    : "Belum ada data satuan."
                }
                p={p}
              />
            ) : (
              filteredSatuan.map((s) => (
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
                      onEdit={() => goToFormEditSatuan(s)}
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
  }

  const renderPabrik = () => {
    if (viewMode.pabrik === "form")
      return (
        <Box>
          <FormPageHeader
            title={
              editingPabrik
                ? `Edit Pabrik — ${editingPabrik.nama}`
                : "Tambah Pabrik"
            }
            onBack={() => goToList("pabrik")}
            onSave={handleSavePabrik}
            saving={saving}
            saveLabel={editingPabrik ? "Simpan Perubahan" : "Simpan Pabrik"}
            p={p}
            isDark={isDark}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2.5
            }}
          >
            <StoreSelector
              storeList={storeList}
              value={selectedStoreId}
              onChange={(v) => setSelectedStoreId(v)}
              loading={loadingStores}
              p={p}
              isDark={isDark}
              inputStyle={inputStyle}
            />
            <Field label="Kode Pabrik" required>
              <input
                style={inputStyle}
                value={pabrikForm.kode}
                onChange={(e) =>
                  setPabrikForm((f) => ({ ...f, kode: e.target.value }))
                }
                placeholder="Contoh: KF, GSK"
                autoFocus
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
        </Box>
      )

    return (
      <Box>
        <ListPageHeader
          title="Daftar Pabrik"
          count={filteredPabrik.length}
          onAdd={() => goToForm("pabrik")}
          addLabel="Tambah Pabrik"
          search={searchPabrik}
          onSearch={setSearchPabrik}
          p={p}
          isDark={isDark}
        />
        <TableWrap p={p}>
          <thead>
            <tr>
              <Th p={p}>KODE</Th>
              <Th p={p}>NAMA PABRIK</Th>
              <Th p={p}>KOTA</Th>
              <Th p={p}>TELEPON</Th>
              <Th p={p} w={80} />
            </tr>
          </thead>
          <tbody>
            {loadingPabrik ? (
              <SkeletonRows cols={5} isDark={isDark} />
            ) : filteredPabrik.length === 0 ? (
              <EmptyRow
                cols={5}
                text={
                  searchPabrik
                    ? "Tidak ada hasil pencarian."
                    : "Belum ada data pabrik."
                }
                p={p}
              />
            ) : (
              filteredPabrik.map((s) => (
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
                      onEdit={() => goToFormEditPabrik(s)}
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
  }

  const renderMerek = () => {
    if (viewMode.merek === "form")
      return (
        <Box>
          <FormPageHeader
            title={
              editingMerek
                ? `Edit Merek — ${editingMerek.nama}`
                : "Tambah Merek"
            }
            onBack={() => goToList("merek")}
            onSave={handleSaveMerek}
            saving={saving}
            saveLabel={editingMerek ? "Simpan Perubahan" : "Simpan Merek"}
            p={p}
            isDark={isDark}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2.5
            }}
          >
            <StoreSelector
              storeList={storeList}
              value={selectedStoreId}
              onChange={(v) => setSelectedStoreId(v)}
              loading={loadingStores}
              p={p}
              isDark={isDark}
              inputStyle={inputStyle}
            />
            <Field label="Kode Merek" required>
              <input
                style={inputStyle}
                value={merekForm.kode}
                onChange={(e) =>
                  setMerekForm((f) => ({ ...f, kode: e.target.value }))
                }
                placeholder="Contoh: PAR, AMX"
                autoFocus
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
                        setMerekForm((f) => ({
                          ...f,
                          pabrikId: e.target.value
                        }))
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
                  onClick={() => goToForm("pabrik")}
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
        </Box>
      )

    return (
      <Box>
        <ListPageHeader
          title="Daftar Merek"
          count={filteredMerek.length}
          onAdd={() => goToForm("merek")}
          addLabel="Tambah Merek"
          search={searchMerek}
          onSearch={setSearchMerek}
          p={p}
          isDark={isDark}
        />
        <TableWrap p={p}>
          <thead>
            <tr>
              <Th p={p}>KODE</Th>
              <Th p={p}>NAMA MEREK</Th>
              <Th p={p}>PABRIK</Th>
              <Th p={p} w={80} />
            </tr>
          </thead>
          <tbody>
            {loadingMerek ? (
              <SkeletonRows cols={4} isDark={isDark} />
            ) : filteredMerek.length === 0 ? (
              <EmptyRow
                cols={4}
                text={
                  searchMerek
                    ? "Tidak ada hasil pencarian."
                    : "Belum ada data merek."
                }
                p={p}
              />
            ) : (
              filteredMerek.map((s) => (
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
                      onEdit={() => goToFormEditMerek(s)}
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
  }

  const renderSupplier = () => {
    if (viewMode.supplier === "form")
      return (
        <Box>
          <FormPageHeader
            title={
              editingSupplier
                ? `Edit Supplier — ${editingSupplier.nama}`
                : "Tambah Supplier"
            }
            onBack={() => goToList("supplier")}
            onSave={handleSaveSupplier}
            saving={saving}
            saveLabel={editingSupplier ? "Simpan Perubahan" : "Simpan Supplier"}
            p={p}
            isDark={isDark}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2.5
            }}
          >
            <StoreSelector
              storeList={storeList}
              value={selectedStoreId}
              onChange={(v) => setSelectedStoreId(v)}
              loading={loadingStores}
              p={p}
              isDark={isDark}
              inputStyle={inputStyle}
            />
            <Field label="Kode Supplier" required>
              <input
                style={inputStyle}
                value={supplierForm.kode}
                onChange={(e) =>
                  setSupplierForm((f) => ({ ...f, kode: e.target.value }))
                }
                placeholder="Contoh: SUP001"
                autoFocus
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
                  setSupplierForm((f) => ({
                    ...f,
                    kontakPerson: e.target.value
                  }))
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
        </Box>
      )

    return (
      <Box>
        <ListPageHeader
          title="Daftar Supplier"
          count={filteredSupplier.length}
          onAdd={() => goToForm("supplier")}
          addLabel="Tambah Supplier"
          search={searchSupplier}
          onSearch={setSearchSupplier}
          p={p}
          isDark={isDark}
        />
        <TableWrap p={p}>
          <thead>
            <tr>
              <Th p={p}>KODE</Th>
              <Th p={p}>NAMA SUPPLIER</Th>
              <Th p={p}>KOTA</Th>
              <Th p={p}>KONTAK</Th>
              <Th p={p}>TELEPON</Th>
              <Th p={p} w={80} />
            </tr>
          </thead>
          <tbody>
            {loadingSupplier ? (
              <SkeletonRows cols={6} isDark={isDark} />
            ) : filteredSupplier.length === 0 ? (
              <EmptyRow
                cols={6}
                text={
                  searchSupplier
                    ? "Tidak ada hasil pencarian."
                    : "Belum ada data supplier."
                }
                p={p}
              />
            ) : (
              filteredSupplier.map((s) => (
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
                      onEdit={() => goToFormEditSupplier(s)}
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
  }

  const renderBarang = () => {
    if (viewMode.barang === "form")
      return (
        <Box>
          <FormPageHeader
            title={
              editingBarang
                ? `Edit Barang — ${editingBarang.nama}`
                : "Tambah Barang"
            }
            onBack={() => goToList("barang")}
            onSave={handleSaveBarang}
            saving={saving}
            saveLabel={editingBarang ? "Simpan Perubahan" : "Simpan Barang"}
            p={p}
            isDark={isDark}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2.5
            }}
          >
            <StoreSelector
              storeList={storeList}
              value={selectedStoreId}
              onChange={(v) => setSelectedStoreId(v)}
              loading={loadingStores}
              p={p}
              isDark={isDark}
              inputStyle={inputStyle}
            />
            <SectionLabel text="IDENTITAS BARANG" isDark={isDark} p={p} />
            <Field label="Kode Barang" required>
              <input
                style={inputStyle}
                value={barangForm.kode}
                onChange={(e) =>
                  setBarangForm((f) => ({ ...f, kode: e.target.value }))
                }
                placeholder="Auto / Manual"
                autoFocus
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
                        setBarangForm((f) => ({
                          ...f,
                          satuanId: e.target.value
                        }))
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
                  onClick={() => goToForm("satuan")}
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
                        setBarangForm((f) => ({
                          ...f,
                          merekId: e.target.value
                        }))
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
                  onClick={() => goToForm("merek")}
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
                        setBarangForm((f) => ({
                          ...f,
                          supplierId: e.target.value
                        }))
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
                  onClick={() => goToForm("supplier")}
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
        </Box>
      )

    return (
      <Box>
        <ListPageHeader
          title="Daftar Barang"
          count={filteredBarang.length}
          onAdd={() => goToForm("barang")}
          addLabel="Tambah Barang"
          search={searchBarang}
          onSearch={setSearchBarang}
          p={p}
          isDark={isDark}
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
              <Th p={p} w={80} />
            </tr>
          </thead>
          <tbody>
            {loadingBarang ? (
              <SkeletonRows cols={7} isDark={isDark} />
            ) : filteredBarang.length === 0 ? (
              <EmptyRow
                cols={7}
                text={
                  searchBarang
                    ? "Tidak ada hasil pencarian."
                    : "Belum ada data barang."
                }
                p={p}
              />
            ) : (
              filteredBarang.map((b) => (
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
                        border: `1px solid ${b.status === "aktif" ? (isDark ? "#1a5c38" : "#bbf7d0") : isDark ? "#333" : "#e2e8f0"}`,
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
                      onEdit={() => goToFormEditBarang(b)}
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
  }

  // ── Render ──────────────────────────────────────────────────────────────
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
                {
                  label: "Satuan",
                  value: satuanList.length,
                  color: "#1e3a8a",
                  tab: "satuan" as TabKey
                },
                {
                  label: "Pabrik",
                  value: pabrikList.length,
                  color: "#0891b2",
                  tab: "pabrik" as TabKey
                },
                {
                  label: "Merek",
                  value: merekList.length,
                  color: "#7c3aed",
                  tab: "merek" as TabKey
                },
                {
                  label: "Supplier",
                  value: supplierList.length,
                  color: "#d97706",
                  tab: "supplier" as TabKey
                },
                {
                  label: "Total Barang",
                  value: barangList.length,
                  color: "#16a34a",
                  tab: "barang" as TabKey
                }
              ].map((s) => (
                <Box
                  key={s.label}
                  onClick={() => {
                    setActiveTab(s.tab)
                    goToList(s.tab)
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
              {/* Tabs */}
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
                  const isFormMode = viewMode[tab.key] === "form"
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
                      {isFormMode && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#3b82f6",
                            flexShrink: 0
                          }}
                        />
                      )}
                    </button>
                  )
                })}
              </Box>

              {/* Content */}
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
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

      <DeleteModal
        open={deleteModal.open}
        label={deleteModal.label}
        onClose={() => setDeleteModal((m) => ({ ...m, open: false }))}
        onConfirm={deleteModal.onConfirm}
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
