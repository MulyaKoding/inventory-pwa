"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
import { useTheme } from "../hooks/useTheme"
import Sidebar from "../components/sidebar"

const DRAWER_WIDTH = 220

// ══════════════════════════════════════════════════════════════════════════
// TYPES — Master Barang (Satuan / Pabrik / Merek / Supplier / Barang)
// ══════════════════════════════════════════════════════════════════════════
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

type MasterTabKey = "satuan" | "pabrik" | "merek" | "supplier" | "barang"
type ViewMode = "list" | "form"

const MASTER_TAB_LIST: { key: MasterTabKey; label: string; step: number }[] = [
  { key: "satuan", label: "Satuan", step: 1 },
  { key: "pabrik", label: "Pabrik", step: 2 },
  { key: "merek", label: "Merek", step: 3 },
  { key: "supplier", label: "Supplier", step: 4 },
  { key: "barang", label: "Buat Barang", step: 5 }
]

// ══════════════════════════════════════════════════════════════════════════
// TYPES — Stok (Balance / Transaksi / Opname)
// ══════════════════════════════════════════════════════════════════════════
interface BarangOption {
  id: string
  kode: string
  nama: string
  satuanNama?: string
}

interface SupplierOption {
  id: string
  kode: string
  nama: string
}

interface StokBalanceRow {
  id: string
  barangId: string
  kode: string
  nama: string
  satuan: string
  stokMasuk: number
  stokKeluar: number
  stokAkhir: number
  stokMinimum: number
}

interface TxItem {
  uid: string // id lokal utk key React (bukan dari DB)
  barangId: string
  barangKode: string
  barangNama: string
  satuanNama: string
  qty: string
  keterangan: string
}

interface TxHeader {
  id: string
  noTransaksi: string
  tanggal: string
  partnerId?: string
  partnerNama?: string
  alasan?: string
  keterangan?: string
  status: "draft" | "selesai"
  storeId?: string
  items: {
    barangId: string
    barangKode: string
    barangNama: string
    satuanNama: string
    qty: number
    keterangan?: string
  }[]
  createdAt: string
}

type MainTabKey = "masterbarang" | "balance" | "transaksi" | "opname"

type SubTabKey =
  | "penerimaan"
  | "pengeluaran"
  | "penyesuaian"
  | "retur-penerimaan"
  | "retur-pengeluaran"

// ── Konfigurasi per jenis transaksi (biar tidak duplikasi komponen) ─────────
const SUB_TAB_LIST: { key: SubTabKey; label: string }[] = [
  { key: "penerimaan", label: "Penerimaan Barang" },
  { key: "pengeluaran", label: "Pengeluaran Barang" },
  { key: "penyesuaian", label: "Penyesuaian (Rusak/Cacat)" },
  { key: "retur-penerimaan", label: "Retur Penerimaan" },
  { key: "retur-pengeluaran", label: "Retur Pengeluaran" }
]

interface SubTabConfig {
  label: string
  addLabel: string
  apiPath: string
  arah: "masuk" | "keluar" | "manual" // manual = tergantung form (penyesuaian)
  partnerType: "supplier" | "tujuan" | "none"
  partnerLabel: string
  showAlasan: boolean
  alasanOptions?: string[]
  noPrefix: string
  helperText: string
}

const SUB_TAB_CONFIG: Record<SubTabKey, SubTabConfig> = {
  penerimaan: {
    label: "Penerimaan Barang",
    addLabel: "Tambah Penerimaan",
    apiPath: "/api/inventory/penerimaan",
    arah: "masuk",
    partnerType: "supplier",
    partnerLabel: "Supplier",
    showAlasan: false,
    noPrefix: "RCV",
    helperText: "Menambah stok — barang datang dari supplier."
  },
  pengeluaran: {
    label: "Pengeluaran Barang",
    addLabel: "Tambah Pengeluaran",
    apiPath: "/api/inventory/pengeluaran",
    arah: "keluar",
    partnerType: "tujuan",
    partnerLabel: "Tujuan / Customer",
    showAlasan: false,
    noPrefix: "OUT",
    helperText: "Mengurangi stok — barang keluar ke pelanggan / cabang lain."
  },
  penyesuaian: {
    label: "Penyesuaian Stok",
    addLabel: "Tambah Penyesuaian",
    apiPath: "/api/inventory/penyesuaian",
    arah: "manual",
    partnerType: "none",
    partnerLabel: "",
    showAlasan: true,
    alasanOptions: [
      "Barang Rusak",
      "Barang Cacat",
      "Barang Hilang",
      "Kadaluarsa",
      "Selisih Stok Opname",
      "Lainnya"
    ],
    noPrefix: "ADJ",
    helperText:
      "Koreksi stok karena barang rusak, cacat, hilang, atau kadaluarsa."
  },
  "retur-penerimaan": {
    label: "Retur Penerimaan",
    addLabel: "Tambah Retur Penerimaan",
    apiPath: "/api/inventory/retur-penerimaan",
    arah: "keluar",
    partnerType: "supplier",
    partnerLabel: "Supplier",
    showAlasan: true,
    alasanOptions: [
      "Barang Rusak",
      "Salah Kirim",
      "Tidak Sesuai PO",
      "Lainnya"
    ],
    noPrefix: "RTP",
    helperText:
      "Mengurangi stok — barang yang sudah diterima dikembalikan ke supplier."
  },
  "retur-pengeluaran": {
    label: "Retur Pengeluaran",
    addLabel: "Tambah Retur Pengeluaran",
    apiPath: "/api/inventory/retur-pengeluaran",
    arah: "masuk",
    partnerType: "tujuan",
    partnerLabel: "Dari Customer",
    showAlasan: true,
    alasanOptions: [
      "Barang Rusak",
      "Salah Kirim",
      "Komplain Customer",
      "Lainnya"
    ],
    noPrefix: "RTK",
    helperText: "Menambah stok — barang yang sudah keluar dikembalikan lagi."
  }
}

interface Palette {
  bg: string
  bgPaper: string
  border: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  tableHeadBg: string
  menuShadow: string
  inputBg: string
  [key: string]: string
}

// ── Icon ───────────────────────────────────────────────────────────────────
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

// ── Section label (dipakai form Barang) ─────────────────────────────────
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

// ── Table helpers ────────────────────────────────────────────────────────
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
  isDark,
  align
}: {
  children: React.ReactNode
  muted?: boolean
  p: Palette
  isDark: boolean
  align?: "left" | "right" | "center"
}) {
  return (
    <td
      style={{
        padding: "11px 14px",
        fontSize: 13,
        textAlign: align || "left",
        color: muted ? p.textMuted : p.textPrimary,
        fontFamily: "'Nunito', sans-serif",
        borderBottom: `1px solid ${isDark ? "#111" : "#f8fafc"}`
      }}
    >
      {children}
    </td>
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

// ── Delete modal ────────────────────────────────────────────────────────
function DeleteModal({
  open,
  label,
  note,
  onClose,
  onConfirm,
  isDark,
  p,
  isDeleting
}: {
  open: boolean
  label: string
  note?: string
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
              Yakin ingin menghapus <strong>&ldquo;{label}&rdquo;</strong>?{" "}
              {note || "Tindakan ini tidak dapat dibatalkan."}
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

// ── List / Form headers ─────────────────────────────────────────────────
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
  onAdd?: () => void
  addLabel?: string
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
        gap: 2,
        flexWrap: "wrap"
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
        {onAdd && (
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
        )}
      </Box>
    </Box>
  )
}

function FormPageHeader({
  title,
  helper,
  onBack,
  onSave,
  saving,
  saveLabel,
  p
}: {
  title: string
  helper?: string
  onBack: () => void
  onSave: () => void
  saving: boolean
  saveLabel: string
  p: Palette
}) {
  return (
    <Box sx={{ mb: 3, pb: 2.5, borderBottom: `1px solid ${p.border}` }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
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
      {helper && (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 12,
            color: p.textMuted,
            fontFamily: "'Nunito', sans-serif"
          }}
        >
          {helper}
        </p>
      )}
    </Box>
  )
}

// ── Store selector ────────────────────────────────────────────────────────
function StoreSelector({
  storeList,
  value,
  onChange,
  loading,
  p,
  isDark,
  inputStyle,
  standalone = false
}: {
  storeList: StoreOption[]
  value: string
  onChange: (v: string) => void
  loading: boolean
  p: Palette
  isDark: boolean
  inputStyle: React.CSSProperties
  standalone?: boolean
}) {
  return (
    <Box
      sx={{
        ...(!standalone && { gridColumn: "1 / -1" }),
        p: 2,
        mb: standalone ? 2 : 1,
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
          {standalone ? "Toko" : "Toko Tujuan"}{" "}
          <span style={{ color: "#ef4444" }}>*</span>
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

// ── State generik untuk tiap sub-tab transaksi ──────────────────────────
interface TxSubState {
  viewMode: ViewMode
  list: TxHeader[]
  loading: boolean
  search: string
  editing: TxHeader | null
  form: {
    tanggal: string
    partnerId: string
    alasan: string
    keterangan: string
    items: TxItem[]
  }
}

const emptyForm = (): TxSubState["form"] => ({
  tanggal: new Date().toISOString().slice(0, 10),
  partnerId: "",
  alasan: "",
  keterangan: "",
  items: []
})

const emptyTxState = (): TxSubState => ({
  viewMode: "list",
  list: [],
  loading: false,
  search: "",
  editing: null,
  form: emptyForm()
})

let uidCounter = 0
const nextUid = () => `row-${Date.now()}-${uidCounter++}`

// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function StokPage() {
  const { isDark, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Master Barang ditaruh sebagai tab utama paling kiri
  const [mainTab, setMainTab] = useState<MainTabKey>("masterbarang")
  const [subTab, setSubTab] = useState<SubTabKey>("penerimaan")

  // ── Reference data (dipakai bersama Master Barang & Stok) ──
  const [storeList, setStoreList] = useState<StoreOption[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState("")
  const [loadingStores, setLoadingStores] = useState(false)

  // BarangOption / SupplierOption ringkas, dipakai sebagai referensi dropdown di form Transaksi Stok
  const [barangList, setBarangList] = useState<BarangOption[]>([])
  const [supplierList, setSupplierList] = useState<SupplierOption[]>([])

  // ══════════════════════════════════════════════════
  // STATE — MASTER BARANG (Satuan / Pabrik / Merek / Supplier / Barang)
  // ══════════════════════════════════════════════════
  const [masterTab, setMasterTab] = useState<MasterTabKey>("satuan")
  const [masterViewMode, setMasterViewMode] = useState<
    Record<MasterTabKey, ViewMode>
  >({
    satuan: "list",
    pabrik: "list",
    merek: "list",
    supplier: "list",
    barang: "list"
  })

  const setMasterView = (tab: MasterTabKey, mode: ViewMode) =>
    setMasterViewMode((prev) => ({ ...prev, [tab]: mode }))

  const goToMasterForm = (tab: MasterTabKey) => {
    setMasterTab(tab)
    setMasterView(tab, "form")
  }

  const goToMasterList = (tab: MasterTabKey) => {
    setMasterView(tab, "list")
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

  // ── Data master ──
  const [satuanList, setSatuanList] = useState<Satuan[]>([])
  const [pabrikList, setPabrikList] = useState<Pabrik[]>([])
  const [merekList, setMerekList] = useState<Merek[]>([])
  const [masterSupplierList, setMasterSupplierList] = useState<Supplier[]>([])
  const [masterBarangList, setMasterBarangList] = useState<Barang[]>([])

  const [loadingSatuan, setLoadingSatuan] = useState(false)
  const [loadingPabrik, setLoadingPabrik] = useState(false)
  const [loadingMerek, setLoadingMerek] = useState(false)
  const [loadingMasterSupplier, setLoadingMasterSupplier] = useState(false)
  const [loadingMasterBarang, setLoadingMasterBarang] = useState(false)

  const [barangKodeAsli, setBarangKodeAsli] = useState<{
    merekCode: string | null
    supplierCode: string | null
    satuanKode: string | null
  }>({ merekCode: null, supplierCode: null, satuanKode: null })

  // ── Editing state per entity ──
  const [editingSatuan, setEditingSatuan] = useState<Satuan | null>(null)
  const [editingPabrik, setEditingPabrik] = useState<Pabrik | null>(null)
  const [editingMerek, setEditingMerek] = useState<Merek | null>(null)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [editingBarang, setEditingBarang] = useState<Barang | null>(null)

  // ── Helpers buka form Edit dengan pre-fill ──
  const goToFormEditSatuan = (data: Satuan) => {
    setEditingSatuan(data)
    setSatuanForm({
      kode: data.kode,
      nama: data.nama,
      keterangan: data.keterangan || ""
    })
    setMasterTab("satuan")
    setMasterView("satuan", "form")
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
    setMasterTab("pabrik")
    setMasterView("pabrik", "form")
  }
  const goToFormEditMerek = (data: Merek) => {
    setEditingMerek(data)
    setMerekForm({
      kode: data.kode,
      nama: data.nama,
      pabrikId: data.pabrikId,
      storeId: data.storeId || selectedStoreId
    })
    setMasterTab("merek")
    setMasterView("merek", "form")
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
    setMasterTab("supplier")
    setMasterView("supplier", "form")
  }
  const goToFormEditBarang = (data: Barang) => {
    const matchedMerek = merekList.find((m) => m.kode === data.merekId)
    const matchedSupplier = masterSupplierList.find(
      (s) => s.id === data.supplierId
    )

    setEditingBarang(data)
    setBarangForm({
      kode: data.kode,
      nama: data.nama,
      barcode: data.barcode || "",
      jenis: data.jenis || "",
      satuanId: satuanList.find((s) => s.kode === data.satuanId)?.id || "",
      merekId: matchedMerek?.id || "",
      supplierId: matchedSupplier?.id || "",
      hargaBeli: String(data.hargaBeli),
      hargaJual: String(data.hargaJual),
      stokMinimum: String(data.stokMinimum),
      status: data.status,
      storeId: data.storeId || selectedStoreId
    })
    setBarangKodeAsli({
      merekCode: data.merekId || null,
      supplierCode: matchedSupplier?.kode || null,
      satuanKode: data.satuanId || null
    })
    setMasterTab("barang")
    setMasterView("barang", "form")
  }

  // ── Forms master ──
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
  const [searchMasterSupplier, setSearchMasterSupplier] = useState("")
  const [searchMasterBarang, setSearchMasterBarang] = useState("")

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
  const filteredMasterSupplier = masterSupplierList.filter(
    (s) =>
      s.kode.toLowerCase().includes(searchMasterSupplier.toLowerCase()) ||
      s.nama.toLowerCase().includes(searchMasterSupplier.toLowerCase())
  )
  const filteredMasterBarang = masterBarangList.filter(
    (s) =>
      s.kode.toLowerCase().includes(searchMasterBarang.toLowerCase()) ||
      s.nama.toLowerCase().includes(searchMasterBarang.toLowerCase())
  )

  // ══════════════════════════════════════════════════
  // STATE — STOK (Balance / Transaksi / Opname)
  // ══════════════════════════════════════════════════
  const [balanceList, setBalanceList] = useState<StokBalanceRow[]>([])
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [searchBalance, setSearchBalance] = useState("")

  const [txState, setTxState] = useState<Record<SubTabKey, TxSubState>>({
    penerimaan: emptyTxState(),
    pengeluaran: emptyTxState(),
    penyesuaian: emptyTxState(),
    "retur-penerimaan": emptyTxState(),
    "retur-pengeluaran": emptyTxState()
  })

  const [opnameViewMode, setOpnameViewMode] = useState<ViewMode>("list")
  const [opnameList, setOpnameList] = useState<
    {
      id: string
      noOpname: string
      tanggal: string
      status: string
      totalSelisih: number
      createdAt: string
    }[]
  >([])
  const [loadingOpname, setLoadingOpname] = useState(false)
  const [opnameForm, setOpnameForm] = useState<{
    tanggal: string
    keterangan: string
    rows: {
      barangId: string
      barangKode: string
      barangNama: string
      satuanNama: string
      stokSistem: number
      stokFisik: string
    }[]
  }>({
    tanggal: new Date().toISOString().slice(0, 10),
    keterangan: "",
    rows: []
  })

  const [saving, setSaving] = useState(false)

  // ── Delete / Snackbar (dipakai bersama Master Barang & Stok) ──
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    label: string
    note?: string
    onConfirm: () => void
  }>({
    open: false,
    label: "",
    onConfirm: () => {}
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    msg: string
    severity: "success" | "error"
  }>({
    open: false,
    msg: "",
    severity: "success"
  })
  const showSnackbar = (msg: string, severity: "success" | "error") =>
    setSnackbar({ open: true, msg, severity })
  const confirmDelete = (label: string, onConfirm: () => void, note?: string) =>
    setDeleteModal({ open: true, label, note, onConfirm })

  // ── Theme / palette ──
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

  const p: Palette = useMemo(
    () => ({
      bg: isDark ? "#0D0D0D" : "#f8fafc",
      bgPaper: isDark ? "#111111" : "#ffffff",
      border: isDark ? "#1f1f1f" : "#e2e8f0",
      textPrimary: isDark ? "#F5F5F0" : "#0f172a",
      textSecondary: isDark ? "#888888" : "#64748b",
      textMuted: isDark ? "#555555" : "#94a3b8",
      tableHeadBg: isDark ? "#111111" : "#f8fafc",
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
    height: 64
  }

  // ══════════════════════════════════════════════════
  // FETCHERS — MASTER BARANG
  // ══════════════════════════════════════════════════
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

  const fetchMerek = async (storeId?: string) => {
    const id = storeId ?? selectedStoreId
    setLoadingMerek(true)
    try {
      const params = id ? `?storeId=${id}` : ""
      const r = await fetch(`/api/master/merek${params}`)
      const d = await r.json()
      if (d.success) {
        setMerekList(
          d.data.map((item: any) => ({
            id: item.id,
            kode: item.merekCode,
            nama: item.merekName,
            pabrikId: item.pabrikCode || "",
            pabrikNama: item.pabrikNama || "",
            storeId: item.storeId
          }))
        )
      }
    } catch {
    } finally {
      setLoadingMerek(false)
    }
  }

  const fetchMasterSupplier = async (storeId?: string) => {
    const id = storeId ?? selectedStoreId
    setLoadingMasterSupplier(true)
    try {
      const params = id ? `?storeId=${id}` : ""
      const r = await fetch(`/api/master/supplier${params}`)
      const d = await r.json()
      if (d.success) {
        setMasterSupplierList(
          d.data.map((item: any) => ({
            id: item.id || item._id,
            kode: item.supplierCode,
            nama: item.supplierName,
            kontakPerson: item.picName || "",
            telepon: item.phone || "",
            email: item.email || "",
            kota: item.city || "",
            alamat: item.address || "",
            storeId: item.storeId
          }))
        )
      }
    } catch {
    } finally {
      setLoadingMasterSupplier(false)
    }
  }

  const fetchMasterBarang = async (storeId?: string) => {
    const id = storeId ?? selectedStoreId
    setLoadingMasterBarang(true)
    try {
      const params = id ? `?storeId=${id}` : ""
      const r = await fetch(`/api/master/barang${params}`)
      const d = await r.json()
      if (d.success) {
        setMasterBarangList(
          d.data.map((item: any) => ({
            id: item.id,
            kode: item.barangCode,
            nama: item.barangName,
            barcode: item.barcode || "",
            jenis: item.barangCategory || "",
            satuanId: item.kdSatuanBarang || "",
            satuanNama: item.kdSatuanBarang || "",
            merekId: item.merekCode || "",
            merekNama: item.merek?.merekName || "",
            supplierId: item.supplier?.id || item.supplierId || "",
            supplierNama: item.supplier?.supplierName || "",
            hargaBeli: item.hargaBeli ?? 0,
            hargaJual: item.price ?? 0,
            stokMinimum: item.stock ?? 0,
            status: item.status === "active" ? "aktif" : "nonaktif",
            createdAt: item.createdAt,
            storeId: item.storeId
          }))
        )
      }
    } catch {
    } finally {
      setLoadingMasterBarang(false)
    }
  }

  // ══════════════════════════════════════════════════
  // FETCHERS — STOK
  // ══════════════════════════════════════════════════
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

  const fetchBarang = async (storeId?: string) => {
    const id = storeId ?? selectedStoreId
    try {
      const params = id ? `?storeId=${id}` : ""
      const r = await fetch(`/api/master/barang${params}`)
      const d = await r.json()
      if (d.success) {
        setBarangList(
          d.data.map((item: any) => ({
            id: item.id,
            kode: item.barangCode,
            nama: item.barangName,
            satuanNama: item.kdSatuanBarang || ""
          }))
        )
      }
    } catch {}
  }

  const fetchSupplier = async (storeId?: string) => {
    const id = storeId ?? selectedStoreId
    try {
      const params = id ? `?storeId=${id}` : ""
      const r = await fetch(`/api/master/supplier${params}`)
      const d = await r.json()
      if (d.success) {
        setSupplierList(
          d.data.map((item: any) => ({
            id: item.id || item._id,
            kode: item.supplierCode,
            nama: item.supplierName
          }))
        )
      }
    } catch {}
  }

  const fetchBalance = async (storeId?: string) => {
    const id = storeId ?? selectedStoreId
    setLoadingBalance(true)
    try {
      const params = id ? `?storeId=${id}` : ""
      const r = await fetch(`/api/inventory/stok-balance${params}`)
      const d = await r.json()
      if (d.success) {
        setBalanceList(
          d.data.map((item: any) => ({
            id: item.id,
            barangId: item.barangCode,
            kode: item.barangCode,
            nama: item.barangName,
            satuan: item.satuanNama || "",
            stokMasuk: item.stokMasuk ?? 0,
            stokKeluar: item.stokKeluar ?? 0,
            stokAkhir: item.stokAkhir ?? 0,
            stokMinimum: item.stokMinimum ?? 0
          }))
        )
      }
    } catch {
    } finally {
      setLoadingBalance(false)
    }
  }

  const fetchTx = async (key: SubTabKey, storeId?: string) => {
    const id = storeId ?? selectedStoreId
    setTxState((s) => ({ ...s, [key]: { ...s[key], loading: true } }))
    try {
      const params = id ? `?storeId=${id}` : ""
      const r = await fetch(`${SUB_TAB_CONFIG[key].apiPath}${params}`)
      const d = await r.json()
      if (d.success) {
        setTxState((s) => ({
          ...s,
          [key]: { ...s[key], list: d.data, loading: false }
        }))
        return
      }
    } catch {}
    setTxState((s) => ({ ...s, [key]: { ...s[key], loading: false } }))
  }

  const fetchOpname = async (storeId?: string) => {
    const id = storeId ?? selectedStoreId
    setLoadingOpname(true)
    try {
      const params = id ? `?storeId=${id}` : ""
      const r = await fetch(`/api/inventory/opname${params}`)
      const d = await r.json()
      if (d.success) setOpnameList(d.data)
    } catch {
    } finally {
      setLoadingOpname(false)
    }
  }

  // ── Effects: fetch semua data (Master Barang + Stok) sekali di awal ──
  const initialFetchDone = useRef(false)

  useEffect(() => {
    fetchSatuan()
    fetchMyStores().then((storeId) => {
      if (storeId) {
        initialFetchDone.current = true
        fetchPabrik(storeId)
        fetchMerek(storeId)
        fetchMasterSupplier(storeId)
        fetchMasterBarang(storeId)
        fetchBarang(storeId)
        fetchSupplier(storeId)
        fetchBalance(storeId)
        fetchOpname(storeId)
        ;(Object.keys(SUB_TAB_CONFIG) as SubTabKey[]).forEach((k) =>
          fetchTx(k, storeId)
        )
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedStoreId) return
    if (initialFetchDone.current) {
      initialFetchDone.current = false
      return
    }
    fetchPabrik(selectedStoreId)
    fetchMerek(selectedStoreId)
    fetchMasterSupplier(selectedStoreId)
    fetchMasterBarang(selectedStoreId)
    fetchBarang(selectedStoreId)
    fetchSupplier(selectedStoreId)
    fetchBalance(selectedStoreId)
    fetchOpname(selectedStoreId)
    ;(Object.keys(SUB_TAB_CONFIG) as SubTabKey[]).forEach((k) =>
      fetchTx(k, selectedStoreId)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoreId])

  // ══════════════════════════════════════════════════
  // SAVE HANDLERS — MASTER BARANG
  // ══════════════════════════════════════════════════
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
      goToMasterList("satuan")
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
      goToMasterList("pabrik")
      fetchPabrik()
    } catch {
      showSnackbar("Gagal menyimpan pabrik", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveMerek = async () => {
    if (!merekForm.kode || !merekForm.nama || !selectedStoreId) {
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
          body: JSON.stringify({
            ...merekForm,
            storeId: selectedStoreId
          })
        }
      )
      if (!res.ok) throw new Error()
      showSnackbar(
        isEdit ? "Merek berhasil diperbarui" : "Merek berhasil disimpan",
        "success"
      )
      goToMasterList("merek")
      fetchMerek()
    } catch {
      showSnackbar("Gagal menyimpan merek", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSupplier = async () => {
    if (!supplierForm.kode || !supplierForm.nama || !selectedStoreId) {
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
          body: JSON.stringify({
            ...supplierForm,
            storeId: selectedStoreId
          })
        }
      )
      if (!res.ok) throw new Error()
      showSnackbar(
        isEdit ? "Supplier berhasil diperbarui" : "Supplier berhasil disimpan",
        "success"
      )
      goToMasterList("supplier")
      fetchMasterSupplier()
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
      !selectedStoreId
    ) {
      showSnackbar("Kode, Nama, Satuan, dan Toko wajib diisi", "error")
      return
    }
    setSaving(true)
    try {
      const isEdit = !!editingBarang

      const selectedMerek = merekList.find((m) => m.id === barangForm.merekId)
      const selectedSupplier = masterSupplierList.find(
        (s) => s.id === barangForm.supplierId
      )
      const selectedSatuan = satuanList.find(
        (s) => s.id === barangForm.satuanId
      )

      const res = await fetch(
        isEdit
          ? `/api/master/barang/${editingBarang!.id}`
          : "/api/master/barang",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kode: barangForm.kode,
            nama: barangForm.nama,
            barcode: barangForm.barcode,
            jenis: barangForm.jenis,
            kdSatuanBarang:
              selectedSatuan?.kode ||
              (isEdit ? barangKodeAsli.satuanKode : barangForm.satuanId),
            merekCode:
              selectedMerek?.kode || (isEdit ? barangKodeAsli.merekCode : null),
            supplierCode:
              selectedSupplier?.kode ||
              (isEdit ? barangKodeAsli.supplierCode : null),
            hargaBeli: Number(barangForm.hargaBeli),
            hargaJual: Number(barangForm.hargaJual),
            stokMinimum: Number(barangForm.stokMinimum),
            status: barangForm.status === "aktif" ? "active" : "inactive",
            storeId: selectedStoreId
          })
        }
      )
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Gagal")
      }
      showSnackbar(
        isEdit ? "Barang berhasil diperbarui" : "Barang berhasil disimpan",
        "success"
      )
      goToMasterList("barang")
      fetchMasterBarang()
      fetchBarang()
    } catch (e: any) {
      showSnackbar(e.message || "Gagal menyimpan barang", "error")
    } finally {
      setSaving(false)
    }
  }

  // ── Delete — MASTER BARANG ──
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
  const deleteMasterSupplier = (id: string, nama: string) =>
    confirmDelete(nama, async () => {
      setIsDeleting(true)
      try {
        await fetch(`/api/master/supplier/${id}`, { method: "DELETE" })
        setMasterSupplierList((prev) => prev.filter((s) => s.id !== id))
        showSnackbar("Supplier dihapus", "success")
        setDeleteModal((m) => ({ ...m, open: false }))
      } catch {
        showSnackbar("Gagal menghapus", "error")
      } finally {
        setIsDeleting(false)
      }
    })
  const deleteMasterBarang = (id: string, nama: string) =>
    confirmDelete(nama, async () => {
      setIsDeleting(true)
      try {
        await fetch(`/api/master/barang/${id}`, { method: "DELETE" })
        setMasterBarangList((prev) => prev.filter((s) => s.id !== id))
        showSnackbar("Barang dihapus", "success")
        setDeleteModal((m) => ({ ...m, open: false }))
      } catch {
        showSnackbar("Gagal menghapus", "error")
      } finally {
        setIsDeleting(false)
      }
    })

  // ══════════════════════════════════════════════════
  // HANDLERS — STOK (Transaksi / Opname)
  // ══════════════════════════════════════════════════
  const goToTxList = (key: SubTabKey) =>
    setTxState((s) => ({
      ...s,
      [key]: { ...s[key], viewMode: "list", editing: null, form: emptyForm() }
    }))

  const goToTxForm = (key: SubTabKey) =>
    setTxState((s) => ({ ...s, [key]: { ...s[key], viewMode: "form" } }))

  const goToTxEdit = (key: SubTabKey, data: TxHeader) => {
    setTxState((s) => ({
      ...s,
      [key]: {
        ...s[key],
        viewMode: "form",
        editing: data,
        form: {
          tanggal:
            data.tanggal?.slice(0, 10) || new Date().toISOString().slice(0, 10),
          partnerId: data.partnerId || "",
          alasan: data.alasan || "",
          keterangan: data.keterangan || "",
          items: data.items.map((it) => ({
            uid: nextUid(),
            barangId: it.barangId,
            barangKode: it.barangKode,
            barangNama: it.barangNama,
            satuanNama: it.satuanNama,
            qty: String(it.qty),
            keterangan: it.keterangan || ""
          }))
        }
      }
    }))
  }

  const addTxItemRow = (key: SubTabKey) =>
    setTxState((s) => ({
      ...s,
      [key]: {
        ...s[key],
        form: {
          ...s[key].form,
          items: [
            ...s[key].form.items,
            {
              uid: nextUid(),
              barangId: "",
              barangKode: "",
              barangNama: "",
              satuanNama: "",
              qty: "",
              keterangan: ""
            }
          ]
        }
      }
    }))

  const removeTxItemRow = (key: SubTabKey, uid: string) =>
    setTxState((s) => ({
      ...s,
      [key]: {
        ...s[key],
        form: {
          ...s[key].form,
          items: s[key].form.items.filter((r) => r.uid !== uid)
        }
      }
    }))

  const updateTxItemRow = (
    key: SubTabKey,
    uid: string,
    patch: Partial<TxItem>
  ) =>
    setTxState((s) => ({
      ...s,
      [key]: {
        ...s[key],
        form: {
          ...s[key].form,
          items: s[key].form.items.map((r) =>
            r.uid === uid ? { ...r, ...patch } : r
          )
        }
      }
    }))

  const setTxFormField = (key: SubTabKey, patch: Partial<TxSubState["form"]>) =>
    setTxState((s) => ({
      ...s,
      [key]: { ...s[key], form: { ...s[key].form, ...patch } }
    }))

  const handleSaveTx = async (key: SubTabKey) => {
    const cfg = SUB_TAB_CONFIG[key]
    const st = txState[key]
    const validItems = st.form.items.filter(
      (it) => it.barangId && Number(it.qty) > 0
    )

    if (!selectedStoreId)
      return showSnackbar("Pilih toko terlebih dahulu", "error")
    if (validItems.length === 0)
      return showSnackbar("Tambahkan minimal 1 barang dengan qty > 0", "error")
    if (cfg.showAlasan && !st.form.alasan)
      return showSnackbar("Alasan wajib dipilih", "error")

    setSaving(true)
    try {
      const isEdit = !!st.editing
      const res = await fetch(
        isEdit ? `${cfg.apiPath}/${st.editing!.id}` : cfg.apiPath,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tanggal: st.form.tanggal,
            partnerCode: st.form.partnerId || null,
            alasan: st.form.alasan || null,
            keterangan: st.form.keterangan,
            storeId: selectedStoreId,
            items: validItems.map((it) => ({
              barangCode: it.barangKode,
              qty: Number(it.qty),
              keterangan: it.keterangan
            }))
          })
        }
      )
      if (!res.ok) throw new Error()
      showSnackbar(
        isEdit
          ? `${cfg.label} berhasil diperbarui`
          : `${cfg.label} berhasil disimpan`,
        "success"
      )
      goToTxList(key)
      fetchTx(key)
      fetchBalance()
    } catch {
      showSnackbar(`Gagal menyimpan ${cfg.label.toLowerCase()}`, "error")
    } finally {
      setSaving(false)
    }
  }

  const deleteTx = (key: SubTabKey, id: string, label: string) =>
    confirmDelete(
      label,
      async () => {
        setIsDeleting(true)
        try {
          await fetch(`${SUB_TAB_CONFIG[key].apiPath}/${id}`, {
            method: "DELETE"
          })
          setTxState((s) => ({
            ...s,
            [key]: { ...s[key], list: s[key].list.filter((t) => t.id !== id) }
          }))
          showSnackbar("Transaksi dihapus", "success")
          setDeleteModal((m) => ({ ...m, open: false }))
          fetchBalance()
        } catch {
          showSnackbar("Gagal menghapus", "error")
        } finally {
          setIsDeleting(false)
        }
      },
      "Stok akan dihitung ulang."
    )

  // ── Opname helpers ──
  const goToOpnameForm = () => {
    setOpnameForm({
      tanggal: new Date().toISOString().slice(0, 10),
      keterangan: "",
      rows: balanceList.map((b) => ({
        barangId: b.barangId,
        barangKode: b.kode,
        barangNama: b.nama,
        satuanNama: b.satuan,
        stokSistem: b.stokAkhir,
        stokFisik: String(b.stokAkhir)
      }))
    })
    setOpnameViewMode("form")
  }

  const handleSaveOpname = async () => {
    if (!selectedStoreId)
      return showSnackbar("Pilih toko terlebih dahulu", "error")
    setSaving(true)
    try {
      const res = await fetch("/api/inventory/opname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal: opnameForm.tanggal,
          keterangan: opnameForm.keterangan,
          storeId: selectedStoreId,
          rows: opnameForm.rows.map((r) => ({
            barangCode: r.barangKode,
            stokSistem: r.stokSistem,
            stokFisik: Number(r.stokFisik)
          }))
        })
      })
      if (!res.ok) throw new Error()
      showSnackbar(
        "Stok opname berhasil disimpan, selisih otomatis jadi penyesuaian stok",
        "success"
      )
      setOpnameViewMode("list")
      fetchOpname()
      fetchBalance()
    } catch {
      showSnackbar("Gagal menyimpan stok opname", "error")
    } finally {
      setSaving(false)
    }
  }

  const filteredBalance = balanceList.filter(
    (b) =>
      b.kode.toLowerCase().includes(searchBalance.toLowerCase()) ||
      b.nama.toLowerCase().includes(searchBalance.toLowerCase())
  )

  // ══════════════════════════════════════════════════
  // RENDER — MASTER BARANG (sub-tab: Satuan / Pabrik / Merek / Supplier / Barang)
  // ══════════════════════════════════════════════════
  const renderMasterSatuan = () => {
    if (masterViewMode.satuan === "form")
      return (
        <Box>
          <FormPageHeader
            title={
              editingSatuan
                ? `Edit Satuan — ${editingSatuan.nama}`
                : "Tambah Satuan Barang"
            }
            onBack={() => goToMasterList("satuan")}
            onSave={handleSaveSatuan}
            saving={saving}
            saveLabel={editingSatuan ? "Simpan Perubahan" : "Simpan Satuan"}
            p={p}
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
          title="Daftar Satuan"
          count={filteredSatuan.length}
          onAdd={() => goToMasterForm("satuan")}
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

  const renderMasterPabrik = () => {
    if (masterViewMode.pabrik === "form")
      return (
        <Box>
          <FormPageHeader
            title={
              editingPabrik
                ? `Edit Pabrik — ${editingPabrik.nama}`
                : "Tambah Pabrik"
            }
            onBack={() => goToMasterList("pabrik")}
            onSave={handleSavePabrik}
            saving={saving}
            saveLabel={editingPabrik ? "Simpan Perubahan" : "Simpan Pabrik"}
            p={p}
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
          onAdd={() => goToMasterForm("pabrik")}
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

  const renderMasterMerek = () => {
    if (masterViewMode.merek === "form")
      return (
        <Box>
          <FormPageHeader
            title={
              editingMerek
                ? `Edit Merek — ${editingMerek.nama}`
                : "Tambah Merek"
            }
            onBack={() => goToMasterList("merek")}
            onSave={handleSaveMerek}
            saving={saving}
            saveLabel={editingMerek ? "Simpan Perubahan" : "Simpan Merek"}
            p={p}
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
                  onClick={() => goToMasterForm("pabrik")}
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
          onAdd={() => goToMasterForm("merek")}
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

  const renderMasterSupplier = () => {
    if (masterViewMode.supplier === "form")
      return (
        <Box>
          <FormPageHeader
            title={
              editingSupplier
                ? `Edit Supplier — ${editingSupplier.nama}`
                : "Tambah Supplier"
            }
            onBack={() => goToMasterList("supplier")}
            onSave={handleSaveSupplier}
            saving={saving}
            saveLabel={editingSupplier ? "Simpan Perubahan" : "Simpan Supplier"}
            p={p}
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
          count={filteredMasterSupplier.length}
          onAdd={() => goToMasterForm("supplier")}
          addLabel="Tambah Supplier"
          search={searchMasterSupplier}
          onSearch={setSearchMasterSupplier}
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
            {loadingMasterSupplier ? (
              <SkeletonRows cols={6} isDark={isDark} />
            ) : filteredMasterSupplier.length === 0 ? (
              <EmptyRow
                cols={6}
                text={
                  searchMasterSupplier
                    ? "Tidak ada hasil pencarian."
                    : "Belum ada data supplier."
                }
                p={p}
              />
            ) : (
              filteredMasterSupplier.map((s) => (
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
                      onDelete={() => deleteMasterSupplier(s.id, s.nama)}
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

  const renderMasterBarangTab = () => {
    if (masterViewMode.barang === "form")
      return (
        <Box>
          <FormPageHeader
            title={
              editingBarang
                ? `Edit Barang — ${editingBarang.nama}`
                : "Tambah Barang"
            }
            onBack={() => goToMasterList("barang")}
            onSave={handleSaveBarang}
            saving={saving}
            saveLabel={editingBarang ? "Simpan Perubahan" : "Simpan Barang"}
            p={p}
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
                  onClick={() => goToMasterForm("satuan")}
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
                  onClick={() => goToMasterForm("merek")}
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
                      {masterSupplierList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nama} ({s.kode})
                        </option>
                      ))}
                    </select>
                  </Field>
                </Box>
                <button
                  onClick={() => goToMasterForm("supplier")}
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
          count={filteredMasterBarang.length}
          onAdd={() => goToMasterForm("barang")}
          addLabel="Tambah Barang"
          search={searchMasterBarang}
          onSearch={setSearchMasterBarang}
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
            {loadingMasterBarang ? (
              <SkeletonRows cols={7} isDark={isDark} />
            ) : filteredMasterBarang.length === 0 ? (
              <EmptyRow
                cols={7}
                text={
                  searchMasterBarang
                    ? "Tidak ada hasil pencarian."
                    : "Belum ada data barang."
                }
                p={p}
              />
            ) : (
              filteredMasterBarang.map((b) => (
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
                      onDelete={() => deleteMasterBarang(b.id, b.nama)}
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

  // ── Master Barang: gabungan stat cards + sub-tab + konten ──
  const renderMasterBarang = () => (
    <Box>
      {/* Stat cards ringkas */}
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
            tab: "satuan" as MasterTabKey
          },
          {
            label: "Pabrik",
            value: pabrikList.length,
            color: "#0891b2",
            tab: "pabrik" as MasterTabKey
          },
          {
            label: "Merek",
            value: merekList.length,
            color: "#7c3aed",
            tab: "merek" as MasterTabKey
          },
          {
            label: "Supplier",
            value: masterSupplierList.length,
            color: "#d97706",
            tab: "supplier" as MasterTabKey
          },
          {
            label: "Total Barang",
            value: masterBarangList.length,
            color: "#16a34a",
            tab: "barang" as MasterTabKey
          }
        ].map((s) => (
          <Box
            key={s.label}
            onClick={() => {
              setMasterTab(s.tab)
              goToMasterList(s.tab)
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
                boxShadow: isDark ? "0 0 0 1px #1e3a8a" : "0 0 0 1px #b5d4f4"
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

      {/* Sub-tab row */}
      <Box
        sx={{
          display: "flex",
          gap: 0.5,
          mb: 2.5,
          overflowX: "auto",
          borderBottom: `1px solid ${p.border}`,
          pb: 0
        }}
      >
        {MASTER_TAB_LIST.map((tab) => {
          const isActive = masterTab === tab.key
          const isFormMode = masterViewMode[tab.key] === "form"
          return (
            <button
              key={tab.key}
              onClick={() => setMasterTab(tab.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                border: "none",
                borderBottom: isActive
                  ? "2px solid #1e3a8a"
                  : "2px solid transparent",
                background: "transparent",
                color: isActive
                  ? isDark
                    ? "#60a5fa"
                    : "#1e3a8a"
                  : p.textSecondary,
                fontSize: 12,
                fontWeight: isActive ? 700 : 600,
                fontFamily: "'Nunito', sans-serif",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
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
                  fontSize: 9,
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
                    width: 5,
                    height: 5,
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

      {masterTab === "satuan" && renderMasterSatuan()}
      {masterTab === "pabrik" && renderMasterPabrik()}
      {masterTab === "merek" && renderMasterMerek()}
      {masterTab === "supplier" && renderMasterSupplier()}
      {masterTab === "barang" && renderMasterBarangTab()}
    </Box>
  )

  // ══════════════════════════════════════════════════
  // RENDER: STOK BALANCE
  // ══════════════════════════════════════════════════
  const renderBalance = () => (
    <Box>
      <ListPageHeader
        title="Stok Balance"
        count={filteredBalance.length}
        search={searchBalance}
        onSearch={setSearchBalance}
        p={p}
        isDark={isDark}
      />
      <TableWrap p={p}>
        <thead>
          <tr>
            <Th p={p}>KODE</Th>
            <Th p={p}>NAMA BARANG</Th>
            <Th p={p}>SATUAN</Th>
            <Th p={p}>MASUK</Th>
            <Th p={p}>KELUAR</Th>
            <Th p={p}>STOK AKHIR</Th>
            <Th p={p}>MIN. STOK</Th>
          </tr>
        </thead>
        <tbody>
          {loadingBalance ? (
            <SkeletonRows cols={7} isDark={isDark} />
          ) : filteredBalance.length === 0 ? (
            <EmptyRow
              cols={7}
              text={
                searchBalance
                  ? "Tidak ada hasil pencarian."
                  : "Belum ada data stok."
              }
              p={p}
            />
          ) : (
            filteredBalance.map((b) => (
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
                  {b.satuan || "—"}
                </Td>
                <Td p={p} isDark={isDark} align="right">
                  {b.stokMasuk.toLocaleString("id-ID")}
                </Td>
                <Td p={p} isDark={isDark} align="right">
                  {b.stokKeluar.toLocaleString("id-ID")}
                </Td>
                <Td p={p} isDark={isDark} align="right">
                  <span
                    style={{
                      fontWeight: 800,
                      color:
                        b.stokAkhir <= b.stokMinimum ? "#ef4444" : p.textPrimary
                    }}
                  >
                    {b.stokAkhir.toLocaleString("id-ID")}
                  </span>
                </Td>
                <Td p={p} isDark={isDark} muted align="right">
                  {b.stokMinimum.toLocaleString("id-ID")}
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrap>
    </Box>
  )

  // ══════════════════════════════════════════════════
  // RENDER: TRANSAKSI (generik utk 5 sub-tab)
  // ══════════════════════════════════════════════════
  const renderTransaksi = () => {
    const cfg = SUB_TAB_CONFIG[subTab]
    const st = txState[subTab]

    const filteredList = st.list.filter(
      (t) =>
        t.noTransaksi?.toLowerCase().includes(st.search.toLowerCase()) ||
        t.partnerNama?.toLowerCase().includes(st.search.toLowerCase())
    )

    return (
      <Box>
        {/* Sub-tab row */}
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            mb: 2.5,
            overflowX: "auto",
            borderBottom: `1px solid ${p.border}`,
            pb: 0
          }}
        >
          {SUB_TAB_LIST.map((t) => {
            const active = subTab === t.key
            const isForm = txState[t.key].viewMode === "form"
            return (
              <button
                key={t.key}
                onClick={() => setSubTab(t.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  border: "none",
                  borderBottom: active
                    ? "2px solid #1e3a8a"
                    : "2px solid transparent",
                  background: "transparent",
                  color: active
                    ? isDark
                      ? "#60a5fa"
                      : "#1e3a8a"
                    : p.textSecondary,
                  fontSize: 12,
                  fontWeight: active ? 700 : 600,
                  fontFamily: "'Nunito', sans-serif",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                {t.label}
                {isForm && (
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#3b82f6"
                    }}
                  />
                )}
              </button>
            )
          })}
        </Box>

        {st.viewMode === "form" ? (
          <Box>
            <FormPageHeader
              title={
                st.editing
                  ? `Edit ${cfg.label} — ${st.editing.noTransaksi}`
                  : `Tambah ${cfg.label}`
              }
              helper={cfg.helperText}
              onBack={() => goToTxList(subTab)}
              onSave={() => handleSaveTx(subTab)}
              saving={saving}
              saveLabel={st.editing ? "Simpan Perubahan" : "Simpan"}
              p={p}
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2.5,
                mb: 3
              }}
            >
              <StoreSelector
                storeList={storeList}
                value={selectedStoreId}
                onChange={setSelectedStoreId}
                loading={loadingStores}
                p={p}
                isDark={isDark}
                inputStyle={inputStyle}
              />
              <Field label="Tanggal" required>
                <input
                  type="date"
                  style={inputStyle}
                  value={st.form.tanggal}
                  onChange={(e) =>
                    setTxFormField(subTab, { tanggal: e.target.value })
                  }
                />
              </Field>
              {cfg.partnerType === "supplier" && (
                <Field label={cfg.partnerLabel}>
                  <select
                    style={inputStyle}
                    value={st.form.partnerId}
                    onChange={(e) =>
                      setTxFormField(subTab, { partnerId: e.target.value })
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
              )}
              {cfg.partnerType === "tujuan" && (
                <Field label={cfg.partnerLabel}>
                  <input
                    style={inputStyle}
                    value={st.form.partnerId}
                    onChange={(e) =>
                      setTxFormField(subTab, { partnerId: e.target.value })
                    }
                    placeholder="Nama customer / cabang tujuan"
                  />
                </Field>
              )}
              {cfg.showAlasan && (
                <Field label="Alasan" required>
                  <select
                    style={inputStyle}
                    value={st.form.alasan}
                    onChange={(e) =>
                      setTxFormField(subTab, { alasan: e.target.value })
                    }
                  >
                    <option value="">— Pilih Alasan —</option>
                    {cfg.alasanOptions?.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Field label="Keterangan">
                  <textarea
                    style={textareaStyle}
                    value={st.form.keterangan}
                    onChange={(e) =>
                      setTxFormField(subTab, { keterangan: e.target.value })
                    }
                    placeholder="Catatan tambahan (opsional)"
                  />
                </Field>
              </Box>
            </Box>

            {/* Item barang */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.5
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: p.textPrimary,
                  fontFamily: "'Nunito', sans-serif"
                }}
              >
                DAFTAR BARANG
              </span>
              <button
                onClick={() => addTxItemRow(subTab)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
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
                <Icon d="M12 5v14M5 12h14" size={13} />
                Tambah Baris
              </button>
            </Box>
            <TableWrap p={p}>
              <thead>
                <tr>
                  <Th p={p}>BARANG</Th>
                  <Th p={p} w={90}>
                    SATUAN
                  </Th>
                  <Th p={p} w={110}>
                    QTY
                  </Th>
                  <Th p={p}>KETERANGAN</Th>
                  <Th p={p} w={50} />
                </tr>
              </thead>
              <tbody>
                {st.form.items.length === 0 ? (
                  <EmptyRow
                    cols={5}
                    text="Belum ada barang. Klik 'Tambah Baris'."
                    p={p}
                  />
                ) : (
                  st.form.items.map((row) => {
                    const selected = barangList.find(
                      (b) => b.id === row.barangId
                    )
                    return (
                      <tr key={row.uid}>
                        <Td p={p} isDark={isDark}>
                          <select
                            style={inputStyle}
                            value={row.barangId}
                            onChange={(e) => {
                              const b = barangList.find(
                                (x) => x.id === e.target.value
                              )
                              updateTxItemRow(subTab, row.uid, {
                                barangId: e.target.value,
                                barangKode: b?.kode || "",
                                barangNama: b?.nama || "",
                                satuanNama: b?.satuanNama || ""
                              })
                            }}
                          >
                            <option value="">— Pilih Barang —</option>
                            {barangList.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.kode} — {b.nama}
                              </option>
                            ))}
                          </select>
                        </Td>
                        <Td p={p} isDark={isDark} muted>
                          {selected?.satuanNama || "—"}
                        </Td>
                        <Td p={p} isDark={isDark}>
                          <input
                            type="number"
                            min={0}
                            style={inputStyle}
                            value={row.qty}
                            onChange={(e) =>
                              updateTxItemRow(subTab, row.uid, {
                                qty: e.target.value
                              })
                            }
                            placeholder="0"
                          />
                        </Td>
                        <Td p={p} isDark={isDark}>
                          <input
                            style={inputStyle}
                            value={row.keterangan}
                            onChange={(e) =>
                              updateTxItemRow(subTab, row.uid, {
                                keterangan: e.target.value
                              })
                            }
                            placeholder="opsional"
                          />
                        </Td>
                        <Td p={p} isDark={isDark}>
                          <IconButton
                            size="small"
                            onClick={() => removeTxItemRow(subTab, row.uid)}
                            sx={{
                              color: p.textMuted,
                              "&:hover": { color: "#ef4444" }
                            }}
                          >
                            <Icon d="M18 6L6 18M6 6l12 12" size={14} />
                          </IconButton>
                        </Td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </TableWrap>
          </Box>
        ) : (
          <Box>
            <ListPageHeader
              title={`Daftar ${cfg.label}`}
              count={filteredList.length}
              onAdd={() => goToTxForm(subTab)}
              addLabel={cfg.addLabel}
              search={st.search}
              onSearch={(v) =>
                setTxState((s) => ({
                  ...s,
                  [subTab]: { ...s[subTab], search: v }
                }))
              }
              p={p}
              isDark={isDark}
            />
            <TableWrap p={p}>
              <thead>
                <tr>
                  <Th p={p}>NO. TRANSAKSI</Th>
                  <Th p={p}>TANGGAL</Th>
                  {cfg.partnerType !== "none" && (
                    <Th p={p}>{cfg.partnerLabel.toUpperCase()}</Th>
                  )}
                  {cfg.showAlasan && <Th p={p}>ALASAN</Th>}
                  <Th p={p}>JML ITEM</Th>
                  <Th p={p}>STATUS</Th>
                  <Th p={p} w={80} />
                </tr>
              </thead>
              <tbody>
                {st.loading ? (
                  <SkeletonRows cols={7} isDark={isDark} />
                ) : filteredList.length === 0 ? (
                  <EmptyRow
                    cols={7}
                    text={
                      st.search
                        ? "Tidak ada hasil pencarian."
                        : `Belum ada data ${cfg.label.toLowerCase()}.`
                    }
                    p={p}
                  />
                ) : (
                  filteredList.map((t) => (
                    <tr key={t.id}>
                      <Td p={p} isDark={isDark}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: isDark ? "#60a5fa" : "#1e3a8a"
                          }}
                        >
                          {t.noTransaksi}
                        </span>
                      </Td>
                      <Td p={p} isDark={isDark} muted>
                        {t.tanggal?.slice(0, 10)}
                      </Td>
                      {cfg.partnerType !== "none" && (
                        <Td p={p} isDark={isDark} muted>
                          {t.partnerNama || "—"}
                        </Td>
                      )}
                      {cfg.showAlasan && (
                        <Td p={p} isDark={isDark} muted>
                          {t.alasan || "—"}
                        </Td>
                      )}
                      <Td p={p} isDark={isDark}>
                        {t.items?.length ?? 0}
                      </Td>
                      <Td p={p} isDark={isDark}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 10px",
                            borderRadius: 100,
                            background:
                              t.status === "selesai"
                                ? isDark
                                  ? "#0a2e1c"
                                  : "#f0fdf4"
                                : isDark
                                  ? "#1f1f1f"
                                  : "#f8fafc",
                            color:
                              t.status === "selesai"
                                ? isDark
                                  ? "#4ade80"
                                  : "#16a34a"
                                : isDark
                                  ? "#888"
                                  : "#64748b",
                            border: `1px solid ${t.status === "selesai" ? (isDark ? "#1a5c38" : "#bbf7d0") : isDark ? "#333" : "#e2e8f0"}`,
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: "'Nunito', sans-serif"
                          }}
                        >
                          {t.status === "selesai" ? "Selesai" : "Draft"}
                        </span>
                      </Td>
                      <Td p={p} isDark={isDark}>
                        <ActionBtns
                          onEdit={() => goToTxEdit(subTab, t)}
                          onDelete={() => deleteTx(subTab, t.id, t.noTransaksi)}
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
        )}
      </Box>
    )
  }

  // ══════════════════════════════════════════════════
  // RENDER: STOK OPNAME
  // ══════════════════════════════════════════════════
  const renderOpname = () => {
    if (opnameViewMode === "form")
      return (
        <Box>
          <FormPageHeader
            title="Sesi Stok Opname Baru"
            helper="Isi stok fisik hasil hitung gudang. Selisih dengan stok sistem otomatis dibuatkan penyesuaian stok."
            onBack={() => setOpnameViewMode("list")}
            onSave={handleSaveOpname}
            saving={saving}
            saveLabel="Simpan Opname"
            p={p}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2.5,
              mb: 3
            }}
          >
            <StoreSelector
              storeList={storeList}
              value={selectedStoreId}
              onChange={setSelectedStoreId}
              loading={loadingStores}
              p={p}
              isDark={isDark}
              inputStyle={inputStyle}
            />
            <Field label="Tanggal Opname" required>
              <input
                type="date"
                style={inputStyle}
                value={opnameForm.tanggal}
                onChange={(e) =>
                  setOpnameForm((f) => ({ ...f, tanggal: e.target.value }))
                }
              />
            </Field>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Field label="Keterangan">
                <textarea
                  style={textareaStyle}
                  value={opnameForm.keterangan}
                  onChange={(e) =>
                    setOpnameForm((f) => ({ ...f, keterangan: e.target.value }))
                  }
                  placeholder="Catatan sesi opname (opsional)"
                />
              </Field>
            </Box>
          </Box>
          <TableWrap p={p}>
            <thead>
              <tr>
                <Th p={p}>KODE</Th>
                <Th p={p}>NAMA BARANG</Th>
                <Th p={p} w={80}>
                  SATUAN
                </Th>
                <Th p={p} w={100}>
                  STOK SISTEM
                </Th>
                <Th p={p} w={120}>
                  STOK FISIK
                </Th>
                <Th p={p} w={100}>
                  SELISIH
                </Th>
              </tr>
            </thead>
            <tbody>
              {opnameForm.rows.length === 0 ? (
                <EmptyRow
                  cols={6}
                  text="Data stok belum tersedia untuk toko ini."
                  p={p}
                />
              ) : (
                opnameForm.rows.map((r, idx) => {
                  const selisih = Number(r.stokFisik || 0) - r.stokSistem
                  return (
                    <tr key={r.barangId}>
                      <Td p={p} isDark={isDark}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: isDark ? "#60a5fa" : "#1e3a8a"
                          }}
                        >
                          {r.barangKode}
                        </span>
                      </Td>
                      <Td p={p} isDark={isDark}>
                        {r.barangNama}
                      </Td>
                      <Td p={p} isDark={isDark} muted>
                        {r.satuanNama || "—"}
                      </Td>
                      <Td p={p} isDark={isDark} align="right">
                        {r.stokSistem.toLocaleString("id-ID")}
                      </Td>
                      <Td p={p} isDark={isDark}>
                        <input
                          type="number"
                          style={inputStyle}
                          value={r.stokFisik}
                          onChange={(e) =>
                            setOpnameForm((f) => ({
                              ...f,
                              rows: f.rows.map((row, i) =>
                                i === idx
                                  ? { ...row, stokFisik: e.target.value }
                                  : row
                              )
                            }))
                          }
                        />
                      </Td>
                      <Td p={p} isDark={isDark} align="right">
                        <span
                          style={{
                            fontWeight: 800,
                            color:
                              selisih === 0
                                ? p.textMuted
                                : selisih > 0
                                  ? "#16a34a"
                                  : "#ef4444"
                          }}
                        >
                          {selisih > 0 ? "+" : ""}
                          {selisih.toLocaleString("id-ID")}
                        </span>
                      </Td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </TableWrap>
        </Box>
      )

    return (
      <Box>
        <ListPageHeader
          title="Riwayat Stok Opname"
          count={opnameList.length}
          onAdd={goToOpnameForm}
          addLabel="Buat Opname Baru"
          search=""
          onSearch={() => {}}
          p={p}
          isDark={isDark}
        />
        <TableWrap p={p}>
          <thead>
            <tr>
              <Th p={p}>NO. OPNAME</Th>
              <Th p={p}>TANGGAL</Th>
              <Th p={p}>TOTAL SELISIH</Th>
              <Th p={p}>STATUS</Th>
            </tr>
          </thead>
          <tbody>
            {loadingOpname ? (
              <SkeletonRows cols={4} isDark={isDark} />
            ) : opnameList.length === 0 ? (
              <EmptyRow cols={4} text="Belum ada sesi stok opname." p={p} />
            ) : (
              opnameList.map((o) => (
                <tr key={o.id}>
                  <Td p={p} isDark={isDark}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: isDark ? "#60a5fa" : "#1e3a8a"
                      }}
                    >
                      {o.noOpname}
                    </span>
                  </Td>
                  <Td p={p} isDark={isDark} muted>
                    {o.tanggal?.slice(0, 10)}
                  </Td>
                  <Td p={p} isDark={isDark} align="right">
                    <span
                      style={{
                        fontWeight: 800,
                        color:
                          o.totalSelisih === 0
                            ? p.textMuted
                            : o.totalSelisih > 0
                              ? "#16a34a"
                              : "#ef4444"
                      }}
                    >
                      {o.totalSelisih > 0 ? "+" : ""}
                      {o.totalSelisih.toLocaleString("id-ID")}
                    </span>
                  </Td>
                  <Td p={p} isDark={isDark}>
                    {o.status}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableWrap>
      </Box>
    )
  }

  // ── MAIN TAB LIST — Master Barang ditaruh paling kiri (step 1) ──
  const MAIN_TAB_LIST: { key: MainTabKey; label: string; step: number }[] = [
    { key: "masterbarang", label: "Master Barang", step: 1 },
    { key: "balance", label: "Stok Balance", step: 2 },
    { key: "transaksi", label: "Transaksi", step: 3 },
    { key: "opname", label: "Stok Opname", step: 4 }
  ]

  const pageTitle = mainTab === "masterbarang" ? "Master Barang" : "Stok"

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
            title={pageTitle}
            showAddButton={false}
            onAddProduct={() => {}}
            notificationCount={0}
            p={p}
          />

          <Box
            sx={{ flex: 1, overflow: "auto", p: { xs: "12px", sm: "16px" } }}
          >
            {storeList.length > 1 && (
              <StoreSelector
                storeList={storeList}
                value={selectedStoreId}
                onChange={setSelectedStoreId}
                loading={loadingStores}
                p={p}
                isDark={isDark}
                inputStyle={inputStyle}
                standalone={true}
              />
            )}

            <Box
              sx={{
                border: `1px solid ${p.border}`,
                bgcolor: p.bgPaper,
                borderRadius: "8px",
                overflow: "hidden"
              }}
            >
              {/* MAIN TAB — Master Barang paling kiri, lalu Stok Balance / Transaksi / Opname */}
              <Box
                sx={{
                  borderBottom: `1px solid ${p.border}`,
                  bgcolor: p.tableHeadBg,
                  display: "flex",
                  alignItems: "stretch",
                  overflowX: "auto"
                }}
              >
                {MAIN_TAB_LIST.map((tab) => {
                  const isActive = mainTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setMainTab(tab.key)}
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
                        whiteSpace: "nowrap"
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

              {/* Content */}
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {mainTab === "masterbarang" && renderMasterBarang()}
                {mainTab === "balance" && renderBalance()}
                {mainTab === "transaksi" && renderTransaksi()}
                {mainTab === "opname" && renderOpname()}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <DeleteModal
        open={deleteModal.open}
        label={deleteModal.label}
        note={deleteModal.note}
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
