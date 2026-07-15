"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "../components/header/page"
import Sidebar from "../components/sidebar"
import { useTheme } from "../hooks/useTheme"
import { cn } from "../../lib/utils"

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

// ── Theme tokens (Tailwind class strings, computed from isDark) ──────────
type Tw = ReturnType<typeof getTw>
function getTw(isDark: boolean) {
  return {
    bg: isDark ? "bg-[#0D0D0D]" : "bg-[#f8fafc]",
    bgPaper: isDark ? "bg-[#111111]" : "bg-white",
    border: isDark ? "border-[#1f1f1f]" : "border-[#e2e8f0]",
    borderRow: isDark ? "border-[#111111]" : "border-[#f8fafc]",
    text: isDark ? "text-[#F5F5F0]" : "text-[#0f172a]",
    textSec: isDark ? "text-[#888888]" : "text-[#64748b]",
    textMuted: isDark ? "text-[#555555]" : "text-[#94a3b8]",
    panelBg: isDark ? "bg-[#0d1f3c]" : "bg-[#e6f1fb]",
    panelBorder: isDark ? "border-[#1e3a8a]" : "border-[#b5d4f4]",
    infoText: isDark ? "text-[#60a5fa]" : "text-[#1e3a8a]",
    tableHeadBg: isDark ? "bg-[#111111]" : "bg-[#f8fafc]",
    errorBg: isDark ? "bg-[#2e1010]" : "bg-[#fef2f2]",
    errorBorder: isDark ? "border-[#5a1a1a]" : "border-[#fecaca]",
    skeleton: isDark ? "bg-[#1f1f1f]" : "bg-[#f1f5f9]",
    rowHover: isDark ? "hover:bg-[#161616]" : "hover:bg-[#f8fafc]",
    rowOdd: isDark ? "odd:bg-white/[0.02]" : "odd:bg-black/[0.02]",
    shadow: isDark
      ? "shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
      : "shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
  }
}

function statusColor(status: string, isDark: boolean) {
  if (status === "active")
    return {
      bg: isDark ? "bg-[#0a2e1c]" : "bg-[#f0fdf4]",
      text: isDark ? "text-[#4ade80]" : "text-[#16a34a]",
      border: isDark ? "border-[#1a5c38]" : "border-[#bbf7d0]",
      label: "Aktif"
    }
  if (status === "inactive")
    return {
      bg: isDark ? "bg-[#1f1f1f]" : "bg-[#f8fafc]",
      text: isDark ? "text-[#888888]" : "text-[#64748b]",
      border: isDark ? "border-[#333333]" : "border-[#e2e8f0]",
      label: "Nonaktif"
    }
  return {
    bg: isDark ? "bg-[#2e1010]" : "bg-[#fef2f2]",
    text: isDark ? "text-[#f87171]" : "text-[#dc2626]",
    border: isDark ? "border-[#5a1a1a]" : "border-[#fecaca]",
    label: "Suspended"
  }
}

// ── Shared bits ─────────────────────────────────────────────────────────
function DetailRow({
  label,
  value,
  tw
}: {
  label: string
  value: string
  tw: Tw
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 border-b py-2.5 last:border-b-0 sm:flex-row sm:gap-4",
        tw.border
      )}
    >
      <div className="w-full shrink-0 sm:w-35">
        <span
          className={cn(
            "font-nunito text-[10px] font-bold tracking-[0.05em]",
            tw.textMuted
          )}
        >
          {label}
        </span>
      </div>
      <span
        className={cn("flex-1 font-nunito text-[13px] font-semibold", tw.text)}
      >
        {value || "-"}
      </span>
    </div>
  )
}

function Toast({
  open,
  msg,
  severity,
  onClose
}: {
  open: boolean
  msg: string
  severity: "success" | "error"
  onClose: () => void
}) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed bottom-5 right-5 z-60">
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border px-4 py-3 font-nunito text-[13px] font-semibold shadow-lg",
          severity === "success"
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-red-200 bg-red-50 text-red-700"
        )}
      >
        <span>{severity === "success" ? "✓" : "⚠"}</span>
        {msg}
        <button
          onClick={onClose}
          className="ml-1 cursor-pointer border-none bg-transparent text-current"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// ── Store Detail Modal ─────────────────────────────────────────────────────
function StoreDetailModal({
  store,
  open,
  onClose,
  isDark,
  tw
}: {
  store: Store | null
  open: boolean
  onClose: () => void
  isDark: boolean
  tw: Tw
}) {
  if (!open || !store) return null
  const sc = statusColor(store.status, isDark)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[10px] border sm:w-145",
          tw.bgPaper,
          tw.border,
          tw.shadow
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={cn(
            "sticky top-0 z-10 flex items-center justify-between border-b px-4 py-4 sm:px-6",
            tw.border,
            tw.bg
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-[15px]",
                tw.panelBg,
                tw.panelBorder
              )}
            >
              🏪
            </div>
            <div>
              <p className={cn("m-0 font-nunito text-sm font-bold", tw.text)}>
                Detail Toko
              </p>
              <p className={cn("m-0 font-nunito text-[11px]", tw.textMuted)}>
                {store.storeId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 font-nunito text-[11px] font-bold",
                sc.bg,
                sc.text,
                sc.border
              )}
            >
              {sc.label}
            </span>
            <button
              onClick={onClose}
              className={cn(
                "cursor-pointer rounded border-none bg-transparent p-1",
                tw.textMuted
              )}
            >
              <Icon d="M18 6 6 18M6 6l12 12" size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 sm:p-6">
          <p
            className={cn(
              "m-0 mb-2.5 font-nunito text-[11px] font-bold tracking-[0.08em]",
              tw.infoText
            )}
          >
            INFORMASI TOKO
          </p>
          <div className={cn("mb-6 rounded-md border px-4", tw.bg, tw.border)}>
            <DetailRow label="NAMA TOKO" value={store.storeName} tw={tw} />
            <DetailRow label="JENIS TOKO" value={store.storeType} tw={tw} />
            <DetailRow label="TELEPON" value={store.storePhone} tw={tw} />
            <DetailRow label="EMAIL" value={store.storeEmail || "-"} tw={tw} />
            <DetailRow label="ALAMAT" value={store.storeAddress} tw={tw} />
            <DetailRow
              label="KOTA / PROVINSI"
              value={`${store.storeCity}, ${store.storeProvince}`}
              tw={tw}
            />
            <DetailRow
              label="KODE POS"
              value={store.storePostalCode || "-"}
              tw={tw}
            />
          </div>

          <p
            className={cn(
              "m-0 mb-2.5 font-nunito text-[11px] font-bold tracking-[0.08em]",
              tw.infoText
            )}
          >
            DATA PEMILIK
          </p>
          <div className={cn("mb-6 rounded-md border px-4", tw.bg, tw.border)}>
            <DetailRow
              label="NAMA LENGKAP"
              value={store.owner.fullName}
              tw={tw}
            />
            <DetailRow label="NIK" value={store.owner.nik} tw={tw} />
            <DetailRow
              label="TANGGAL LAHIR"
              value={store.owner.birthDate}
              tw={tw}
            />
            <DetailRow
              label="JENIS KELAMIN"
              value={store.owner.gender}
              tw={tw}
            />
            <DetailRow label="ALAMAT KTP" value={store.owner.address} tw={tw} />
            <DetailRow
              label="INPUT METHOD"
              value={
                store.owner.inputMethod === "ocr" ? "Scan KTP (OCR)" : "Manual"
              }
              tw={tw}
            />
          </div>

          <div
            className={cn(
              "grid grid-cols-2 gap-4 rounded-md border p-4",
              tw.bg,
              tw.border
            )}
          >
            {[
              { label: "TERDAFTAR", val: store.createdAt },
              { label: "TERAKHIR UPDATE", val: store.updatedAt }
            ].map((m) => (
              <div key={m.label}>
                <p
                  className={cn(
                    "m-0 mb-0.5 font-nunito text-[10px] font-bold",
                    tw.textMuted
                  )}
                >
                  {m.label}
                </p>
                <p
                  className={cn(
                    "m-0 font-nunito text-xs font-semibold",
                    tw.text
                  )}
                >
                  {new Date(m.val).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Delete Modal ───────────────────────────────────────────────────────────
function DeleteModal({
  store,
  open,
  onClose,
  onConfirm,
  tw,
  isDeleting
}: {
  store: Store | null
  open: boolean
  onClose: () => void
  onConfirm: () => void
  tw: Tw
  isDeleting: boolean
}) {
  if (!open || !store) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full overflow-hidden rounded-[10px] border sm:w-105",
          tw.bgPaper,
          tw.border,
          tw.shadow
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn("border-b px-6 py-4", tw.border, tw.bg)}>
          <p className={cn("m-0 font-nunito text-sm font-bold", tw.text)}>
            Hapus Toko
          </p>
        </div>
        <div className="p-6">
          <div
            className={cn(
              "mb-6 rounded-md border p-4",
              tw.errorBg,
              tw.errorBorder
            )}
          >
            <p className="m-0 font-nunito text-[13px] leading-relaxed text-[#ef4444]">
              Yakin ingin menghapus toko{" "}
              <strong>&ldquo;{store.storeName}&rdquo;</strong>? Tindakan ini
              tidak dapat dibatalkan.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={cn(
                "flex-1 cursor-pointer rounded-md border bg-transparent py-2.5 font-nunito text-[13px] font-bold",
                tw.border,
                tw.textSec
              )}
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className={cn(
                "flex-1 rounded-md border-none py-2.5 font-nunito text-[13px] font-bold text-white",
                isDeleting
                  ? "cursor-not-allowed bg-[#b91c1c] opacity-70"
                  : "cursor-pointer bg-[#dc2626]"
              )}
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Mobile Store Card ──────────────────────────────────────────────────────
function StoreCard({
  store,
  isDark,
  tw,
  onDetail,
  onDelete
}: {
  store: Store
  isDark: boolean
  tw: Tw
  onDetail: () => void
  onDelete: () => void
}) {
  const sc = statusColor(store.status, isDark)
  return (
    <div
      className={cn(
        "flex flex-col gap-3.5 rounded-lg border p-4",
        tw.border,
        tw.bgPaper
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-base",
              tw.panelBg,
              tw.panelBorder
            )}
          >
            🏪
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                "m-0 overflow-hidden text-ellipsis whitespace-nowrap font-nunito text-sm font-bold",
                tw.text
              )}
            >
              {store.storeName}
            </p>
            <p
              className={cn(
                "m-0 font-nunito text-[11px] font-bold",
                tw.infoText
              )}
            >
              {store.storeId}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-nunito text-[10px] font-bold",
            sc.bg,
            sc.text,
            sc.border
          )}
        >
          {sc.label}
        </span>
      </div>

      {/* Info grid 2x2 */}
      <div
        className={cn(
          "grid grid-cols-2 gap-2.5 rounded-md border p-3.5",
          tw.bg,
          tw.border
        )}
      >
        {[
          { label: "Jenis", val: store.storeType },
          { label: "Telepon", val: store.storePhone },
          { label: "Pemilik", val: store.owner.fullName },
          { label: "Kota", val: `${store.storeCity}, ${store.storeProvince}` }
        ].map((item) => (
          <div key={item.label}>
            <p
              className={cn(
                "m-0 mb-0.5 font-nunito text-[9px] font-bold tracking-[0.05em]",
                tw.textMuted
              )}
            >
              {item.label.toUpperCase()}
            </p>
            <p
              className={cn(
                "m-0 overflow-hidden text-ellipsis whitespace-nowrap font-nunito text-xs font-semibold",
                tw.text
              )}
            >
              {item.val}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className={cn("font-nunito text-[11px]", tw.textMuted)}>
          {new Date(store.createdAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          })}
        </span>
        <div className="flex gap-2">
          <button
            onClick={onDetail}
            className={cn(
              "flex cursor-pointer items-center gap-1 rounded border px-3 py-1.5 font-nunito text-xs font-bold",
              tw.panelBorder,
              tw.panelBg,
              tw.infoText
            )}
          >
            <Icon
              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
              size={12}
            />
            Detail
          </button>
          <button
            onClick={onDelete}
            className={cn(
              "flex cursor-pointer items-center gap-1 rounded border px-3 py-1.5 font-nunito text-xs font-bold text-[#ef4444]",
              tw.errorBorder,
              tw.errorBg
            )}
          >
            <Icon
              d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
              size={12}
            />
            Hapus
          </button>
        </div>
      </div>
    </div>
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

  const tw = useMemo(() => getTw(isDark), [isDark])

  // p kept for the Header/Sidebar prop contract (unchanged external components)
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

  const inputCls = cn(
    "box-border w-full rounded-md border px-3 py-2 font-nunito text-[13px] outline-none",
    isDark ? "bg-[#111111] text-[#F5F5F0]" : "bg-white text-[#0f172a]",
    tw.border
  )

  const openDetail = (store: Store) => {
    setSelectedStore(store)
    setDetailOpen(true)
  }
  const openDeleteConfirm = (store: Store) => {
    setDeleteStore(store)
    setDeleteOpen(true)
  }

  return (
    <div
      className={cn("flex min-h-screen font-nunito transition-colors", tw.bg)}
      style={{ transitionDuration: T }}
    >
      {/* Mobile sidebar (off-canvas) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-55 overflow-hidden">
            <Sidebar isDark={isDark} T={T} />
          </div>
        </div>
      )}

      {/* Desktop sidebar (permanent) */}
      <div className="hidden w-55 shrink-0 overflow-hidden md:block">
        <Sidebar isDark={isDark} T={T} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onMenuClick={() => setMobileOpen(true)}
          title="List Toko"
          showAddButton={false}
          onAddProduct={() => router.push("/registration")}
          notificationCount={0}
          p={p}
        />

        <div className="flex-1 overflow-auto p-3 sm:p-4">
          {/* Stat Cards — 2 kolom di mobile, 4 di desktop */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:grid-cols-4 sm:gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className={cn(
                  "relative overflow-hidden rounded-lg border p-3 sm:p-4",
                  tw.border,
                  tw.bgPaper
                )}
              >
                <div
                  className="absolute inset-x-0 top-0 h-0.75"
                  style={{ backgroundColor: s.color }}
                />
                <p
                  className={cn(
                    "m-0 mb-1 font-nunito text-[9px] font-bold tracking-[0.06em]",
                    tw.textMuted
                  )}
                >
                  {s.label.toUpperCase()}
                </p>
                <p
                  className={cn(
                    "m-0 font-nunito text-[22px] font-black leading-none sm:text-[28px]",
                    tw.text
                  )}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Main card */}
          <div
            className={cn(
              "overflow-hidden rounded-lg border",
              tw.border,
              tw.bgPaper
            )}
          >
            {/* Filter bar */}
            <div className={cn("border-b px-4 py-4 sm:px-6", tw.border, tw.bg)}>
              {/* Search — full width */}
              <div className="relative mb-3">
                <div
                  className={cn(
                    "pointer-events-none absolute left-2.5 top-1/2 z-10 flex -translate-y-1/2",
                    tw.textMuted
                  )}
                >
                  <Icon
                    d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0"
                    size={14}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Cari nama toko, ID, kota, pemilik..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className={cn(inputCls, "pl-8")}
                />
              </div>

              {/* Filters + button row */}
              <div className="flex flex-wrap gap-2">
                <div className="min-w-0 flex-[1_1_110px]">
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value)
                      setPage(1)
                    }}
                    className={inputCls}
                  >
                    <option value="all">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="min-w-0 flex-[1_1_130px]">
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value)
                      setPage(1)
                    }}
                    className={inputCls}
                  >
                    <option value="all">Semua Jenis</option>
                    {storeTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => router.push("/registration")}
                  className="flex h-9.5 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border-none bg-[linear-gradient(135deg,#1e3a8a_0%,#3b82f6_100%)] px-3.5 font-nunito text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(59,130,246,.25)]"
                >
                  <Icon d="M12 5v14M5 12h14" size={14} color="#fff" />
                  <span className="sm:hidden">Tambah</span>
                  <span className="hidden sm:inline">Tambah Toko</span>
                </button>
              </div>
            </div>

            {/* ── MOBILE: Card List ── */}
            <div className="flex flex-col gap-3 p-3 md:hidden">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn("rounded-lg border p-4", tw.border)}
                  >
                    {[100, 60, 80, 50].map((w, j) => (
                      <div
                        key={j}
                        className={cn(
                          "mb-1.5 h-2.75 animate-pulse rounded",
                          tw.skeleton
                        )}
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                ))
              ) : paginated.length === 0 ? (
                <div className="py-12 text-center">
                  <p
                    className={cn("m-0 mb-3 font-nunito text-sm", tw.textMuted)}
                  >
                    {search || filterStatus !== "all" || filterType !== "all"
                      ? "Tidak ada toko yang sesuai filter"
                      : "Belum ada toko terdaftar"}
                  </p>
                  {!search &&
                    filterStatus === "all" &&
                    filterType === "all" && (
                      <button
                        onClick={() => router.push("/registration")}
                        className="cursor-pointer rounded-md border-none bg-[linear-gradient(135deg,#1e3a8a_0%,#3b82f6_100%)] px-5 py-2 font-nunito text-[13px] font-bold text-white"
                      >
                        + Daftarkan Toko Pertama
                      </button>
                    )}
                </div>
              ) : (
                paginated.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    isDark={isDark}
                    tw={tw}
                    onDetail={() => openDetail(store)}
                    onDelete={() => openDeleteConfirm(store)}
                  />
                ))
              )}
            </div>

            {/* ── DESKTOP: Table ── */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse font-nunito">
                <thead>
                  <tr className={cn("border-b", tw.tableHeadBg, tw.border)}>
                    {[
                      { label: "ID TOKO", w: "w-30" },
                      { label: "NAMA TOKO", w: "" },
                      { label: "JENIS", w: "w-40" },
                      { label: "PEMILIK", w: "w-40" },
                      { label: "KOTA", w: "w-32.5" },
                      { label: "TELEPON", w: "w-35" },
                      { label: "STATUS", w: "w-25" },
                      { label: "TERDAFTAR", w: "w-30" },
                      { label: "", w: "w-20" }
                    ].map((col) => (
                      <th
                        key={col.label}
                        className={cn(
                          "whitespace-nowrap px-4 py-2.5 text-left text-[10px] font-bold tracking-[0.08em]",
                          tw.textMuted,
                          col.w
                        )}
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
                          <td key={j} className="px-4 py-3.5">
                            <div
                              className={cn(
                                "h-3 animate-pulse rounded",
                                tw.skeleton,
                                j === 1 ? "w-4/5" : "w-3/5"
                              )}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center">
                        <p
                          className={cn(
                            "m-0 font-nunito text-sm",
                            tw.textMuted
                          )}
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
                              className="mt-3 cursor-pointer rounded-md border-none bg-[linear-gradient(135deg,#1e3a8a_0%,#3b82f6_100%)] px-5 py-2 font-nunito text-[13px] font-bold text-white"
                            >
                              + Daftarkan Toko Pertama
                            </button>
                          )}
                      </td>
                    </tr>
                  ) : (
                    paginated.map((store) => {
                      const sc = statusColor(store.status, isDark)
                      return (
                        <tr
                          key={store.id}
                          className={cn(
                            "border-b transition-colors",
                            tw.borderRow,
                            tw.rowOdd,
                            tw.rowHover
                          )}
                        >
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "font-nunito text-[11px] font-bold",
                                tw.infoText
                              )}
                            >
                              {store.storeId}
                            </span>
                          </td>
                          <td className="min-w-45 px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-sm",
                                  tw.panelBg,
                                  tw.panelBorder
                                )}
                              >
                                🏪
                              </div>
                              <div>
                                <p
                                  className={cn(
                                    "m-0 font-nunito text-[13px] font-bold",
                                    tw.text
                                  )}
                                >
                                  {store.storeName}
                                </p>
                                {store.storeEmail && (
                                  <p
                                    className={cn(
                                      "m-0 font-nunito text-[11px]",
                                      tw.textMuted
                                    )}
                                  >
                                    {store.storeEmail}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn("font-nunito text-xs", tw.textSec)}
                            >
                              {store.storeType}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p
                              className={cn(
                                "m-0 font-nunito text-[13px] font-semibold",
                                tw.text
                              )}
                            >
                              {store.owner.fullName}
                            </p>
                            <p
                              className={cn(
                                "m-0 font-nunito text-[10px]",
                                tw.textMuted
                              )}
                            >
                              NIK: {store.owner.nik.slice(0, 6)}••••••••••
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p
                              className={cn("m-0 font-nunito text-xs", tw.text)}
                            >
                              {store.storeCity}
                            </p>
                            <p
                              className={cn(
                                "m-0 font-nunito text-[10px]",
                                tw.textMuted
                              )}
                            >
                              {store.storeProvince}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn("font-nunito text-xs", tw.textSec)}
                            >
                              {store.storePhone}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 font-nunito text-[11px] font-bold",
                                sc.bg,
                                sc.text,
                                sc.border
                              )}
                            >
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "font-nunito text-[11px]",
                                tw.textMuted
                              )}
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
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                title="Lihat detail"
                                onClick={() => openDetail(store)}
                                className={cn(
                                  "cursor-pointer rounded p-1.5 transition-colors",
                                  tw.textMuted,
                                  isDark
                                    ? "hover:bg-[#0d1f3c] hover:text-text-brand-400"
                                    : "hover:bg-[#e6f1fb] hover:text-brand-700"
                                )}
                              >
                                <Icon
                                  d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
                                  size={15}
                                />
                              </button>
                              <button
                                title="Hapus toko"
                                onClick={() => openDeleteConfirm(store)}
                                className={cn(
                                  "cursor-pointer rounded p-1.5 transition-colors",
                                  tw.textMuted,
                                  isDark
                                    ? "hover:bg-[#2e1010] hover:text-[#ef4444]"
                                    : "hover:bg-[#fef2f2] hover:text-[#ef4444]"
                                )}
                              >
                                <Icon
                                  d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
                                  size={15}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && filtered.length > 0 && (
              <div
                className={cn(
                  "flex flex-wrap items-center justify-between gap-2 border-t px-4 py-4 sm:px-6",
                  tw.border,
                  tw.tableHeadBg
                )}
              >
                <span className={cn("font-nunito text-xs", tw.textMuted)}>
                  <strong className={tw.textSec}>
                    {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, filtered.length)}
                  </strong>{" "}
                  dari <strong className={tw.textSec}>{filtered.length}</strong>{" "}
                  toko
                </span>
                <div className="flex gap-1">
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
                      action: () => setPage((v) => Math.min(totalPages, v + 1)),
                      disabled: page === totalPages,
                      active: false
                    }
                  ].map((btn, i) => (
                    <button
                      key={i}
                      onClick={btn.action}
                      disabled={btn.disabled}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md border font-nunito text-[13px] font-bold",
                        btn.active ? tw.panelBorder : tw.border,
                        btn.active ? tw.panelBg : "bg-transparent",
                        btn.disabled
                          ? cn(tw.textMuted, "cursor-not-allowed")
                          : btn.active
                            ? cn(tw.infoText, "cursor-pointer")
                            : cn(tw.textSec, "cursor-pointer")
                      )}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <StoreDetailModal
        store={selectedStore}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false)
          setSelectedStore(null)
        }}
        isDark={isDark}
        tw={tw}
      />
      <DeleteModal
        store={deleteStore}
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false)
          setDeleteStore(null)
        }}
        onConfirm={handleDelete}
        tw={tw}
        isDeleting={isDeleting}
      />

      <Toast
        open={snackbar.open}
        msg={snackbar.msg}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </div>
  )
}
