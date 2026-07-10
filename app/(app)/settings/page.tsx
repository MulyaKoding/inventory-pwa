"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Box,
  Drawer,
  ThemeProvider,
  createTheme,
  Snackbar,
  Alert,
  Modal,
  Skeleton,
  Chip,
  useMediaQuery
} from "@mui/material"
import Header from "../components/header/page"
import Sidebar from "../components/sidebar"
import { useTheme } from "../hooks/useTheme"
import LocationSelector, {
  LocationValue
} from "../registration/LocationSelector"
import Image from "next/image"
import { cn } from "../../lib/utils"

const DRAWER_WIDTH = 220

const STORE_TYPES = [
  "Retail / Toko Umum",
  "Warung / Minimarket",
  "Restoran / Kuliner",
  "Fashion & Pakaian",
  "Elektronik",
  "Otomotif",
  "Kesehatan & Kecantikan",
  "Peternakan & Pertanian",
  "Jasa & Layanan",
  "Lainnya"
]

const EMPTY_LOCATION: LocationValue = {
  provinsiKd: "",
  provinsiNama: "",
  kotaKd: "",
  kotaNama: "",
  kecamatanKd: "",
  kecamatanNama: "",
  kelurahanKd: "",
  kelurahanNama: "",
  kodePos: ""
}

type EditTab = "store" | "owner"

const EDIT_TABS: { id: EditTab; label: string }[] = [
  { id: "store", label: "Data Toko" },
  { id: "owner", label: "Data Pemilik" }
]

// ─── interfaces ───────────────────────────────────────────
interface StoreOwner {
  nik: string
  fullName: string
  birthDate: string
  address: string
  gender: string
  ktpImageUrl: string | null
  inputMethod?: string
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
  storeDistrict?: string
  storeVillage?: string
  storeProvince: string
  storePostalCode: string | null
  storeProvinsiKd?: string
  storeKotaKd?: string
  storeKecamatanKd?: string
  storeKelurahanKd?: string
  storeImageUrl?: string | null
  storeLat?: string | null
  storeLng?: string | null
  status: "active" | "inactive" | "suspended"
  owner: StoreOwner
  createdAt: string
  updatedAt: string
}

// Theme palette shape shared across sub-components. These are runtime hex
// values driven by isDark, so they are exposed to Tailwind via CSS
// variables (see `themeStyle` below) rather than interpolated class names.
interface Palette {
  [key: string]: string
  bg: string
  bgPaper: string
  border: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  tableHeadBg: string
  menuShadow: string
}

// Turns a palette object into inline CSS custom properties so Tailwind
// arbitrary-value classes like `bg-(--p-bg)` can reference them.
function paletteVars(p: Palette): React.CSSProperties {
  return {
    "--p-bg": p.bg,
    "--p-bgPaper": p.bgPaper,
    "--p-border": p.border,
    "--p-textPrimary": p.textPrimary,
    "--p-textSecondary": p.textSecondary,
    "--p-textMuted": p.textMuted,
    "--p-tableHeadBg": p.tableHeadBg,
    "--p-menuShadow": p.menuShadow
  } as React.CSSProperties
}

// ─── helpers ──────────────────────────────────────────────
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

// Same idea as paletteVars, scoped to a single status badge.
function statusVars(sc: ReturnType<typeof statusColor>): React.CSSProperties {
  return {
    "--sc-bg": sc.bg,
    "--sc-text": sc.text,
    "--sc-border": sc.border
  } as React.CSSProperties
}

const inputBase =
  "w-full rounded-md border bg-(--input-bg) px-3 py-2.5 font-nunito text-[13px] text-(--p-textPrimary) outline-none transition-colors box-border"

// ─── Field wrapper ────────────────────────────────────────
function Field({
  label,
  error,
  hint,
  children
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block font-nunito text-[11px] font-bold tracking-[0.04em] text-(--p-textMuted)">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 font-nunito text-[11px] text-(--p-textMuted)">
          {hint}
        </p>
      )}
      {error && (
        <p className="mt-1 font-nunito text-[11px] text-red-500">{error}</p>
      )}
    </div>
  )
}

// ─── ImageModal ───────────────────────────────────────────
function ImageModal({
  open,
  onClose,
  onUploaded,
  title,
  icon,
  isDark,
  p
}: {
  open: boolean
  onClose: () => void
  onUploaded: (url: string, publicId: string) => void
  title: string
  icon: string
  isDark: boolean
  p: Palette
}) {
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle")
  const [error, setError] = useState("")
  const [preview, setPreview] = useState("")
  const isKtp = title.toLowerCase().includes("ktp")
  const apiEndpoint = isKtp ? "/api/upload/ktp" : "/api/upload/store-image"

  const upload = async (blob: Blob, mimeType: string) => {
    setStatus("uploading")
    setError("")
    try {
      const form = new FormData()
      form.append(
        isKtp ? "ktp" : "file",
        new File([blob], isKtp ? "ktp.jpg" : "store.jpg", { type: mimeType })
      )
      const res = await fetch(apiEndpoint, { method: "POST", body: form })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Gagal upload")

      onUploaded(result.url, result.publicId ?? "")
      setStatus("success")
      setTimeout(() => handleClose(), 1000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
      setStatus("error")
    }
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    await upload(file, file.type)
  }

  const handleClose = () => {
    onClose()
    setStatus("idle")
    setError("")
    setPreview("")
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        style={{ ...paletteVars(p), boxShadow: "var(--p-menuShadow)" }}
        className="absolute left-1/2 top-1/2 w-[95vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[10px] border border-(--p-border) bg-(--p-bgPaper) outline-none sm:w-120"
      >
        <div className="flex items-center justify-between border-b border-(--p-border) bg-(--p-bg) px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-7.5 w-7.5 items-center justify-center rounded-md border text-sm",
                isDark
                  ? "border-brand-700 bg-[#0d1f3c]"
                  : "border-[#b5d4f4] bg-[#e6f1fb]"
              )}
            >
              {icon}
            </div>
            <p className="m-0 font-nunito text-sm font-bold text-(--p-textPrimary)">
              {title}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="cursor-pointer border-none bg-transparent p-1 text-lg text-(--p-textMuted)"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <input
            type="file"
            id="img-upload"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            className="hidden"
          />
          {!preview ? (
            <div
              onClick={() =>
                status !== "uploading" &&
                document.getElementById("img-upload")?.click()
              }
              className={cn(
                "cursor-pointer rounded-lg border-[1.5px] border-dashed py-10 text-center transition-all",
                isDark
                  ? "border-brand-700 hover:bg-[#0d1f3c]"
                  : "border-[#b5d4f4] hover:bg-blue-50 hover:border-brand-700"
              )}
            >
              <p className="m-0 mb-1.5 text-[28px]">📎</p>
              <p className="m-0 font-nunito text-sm font-bold text-brand-700">
                Klik untuk pilih gambar
              </p>
              <p className="m-0 mt-1 font-nunito text-[11px] text-(--p-textMuted)">
                JPG, PNG, WEBP · Maks 5MB
              </p>
            </div>
          ) : (
            <Image
              src={preview}
              alt="Preview"
              width={440}
              height={220}
              className="max-h-55 w-full rounded-lg border border-(--p-border) object-cover"
            />
          )}
          {status === "uploading" && (
            <div
              className={cn(
                "mt-4 flex items-center gap-3 rounded-md border p-3",
                isDark
                  ? "border-brand-700 bg-[#0d1f3c]"
                  : "border-[#b5d4f4] bg-[#e6f1fb]"
              )}
            >
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
              <span className="font-nunito text-[13px] text-brand-700">
                Mengupload gambar...
              </span>
            </div>
          )}
          {status === "success" && (
            <div
              className={cn(
                "mt-4 flex items-center gap-3 rounded-md border p-3",
                isDark
                  ? "border-[#1a5c38] bg-[#0a2e1c]"
                  : "border-[#bbf7d0] bg-green-50"
              )}
            >
              <span className="text-base text-green-600">✓</span>
              <span
                className={cn(
                  "font-nunito text-[13px] font-semibold",
                  isDark ? "text-green-400" : "text-green-600"
                )}
              >
                Gambar berhasil diupload!
              </span>
            </div>
          )}
          {status === "error" && (
            <div
              className={cn(
                "mt-4 rounded-md border p-3",
                isDark
                  ? "border-[#5a1a1a] bg-[#2e1010]"
                  : "border-red-200 bg-red-50"
              )}
            >
              <p className="m-0 mb-2 font-nunito text-[13px] text-red-500">
                {error}
              </p>
              <button
                onClick={() => {
                  setStatus("idle")
                  setError("")
                  setPreview("")
                }}
                className="cursor-pointer rounded border border-red-500 bg-transparent px-3.5 py-1.5 font-nunito text-xs font-semibold text-red-500"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>
      </Box>
    </Modal>
  )
}

// ─── ImagePreviewModal ────────────────────────────────────
function ImagePreviewModal({
  open,
  onClose,
  imageUrl,
  title,
  isDark,
  p
}: {
  open: boolean
  onClose: () => void
  imageUrl: string | null
  title: string
  isDark: boolean
  p: Palette
}) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const posStart = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (open) {
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [open])

  const clampZoom = (z: number) => Math.min(Math.max(z, 1), 3)

  const applyZoom = (next: number) => {
    const clamped = clampZoom(next)
    setZoom(clamped)
    if (clamped === 1) setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
    e.preventDefault()
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    posStart.current = { ...position }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setPosition({
      x: posStart.current.x + dx,
      y: posStart.current.y + dy
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY < 0 ? 0.15 : -0.15
    applyZoom(zoom + delta)
  }

  const handleZoomIn = () => applyZoom(zoom + 0.25)
  const handleZoomOut = () => applyZoom(zoom - 0.25)

  if (!imageUrl) return null

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        style={{ ...paletteVars(p), boxShadow: "var(--p-menuShadow)" }}
        className="absolute left-1/2 top-[35%] flex h-130 max-h-130 w-[96vw] max-w-300 -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[10px] border border-(--p-border) bg-(--p-bgPaper) outline-none sm:w-[90vw] md:w-[80vw] lg:w-250"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-(--p-border) bg-(--p-bg) px-6 py-4">
          <p className="m-0 font-nunito text-sm font-bold text-(--p-textPrimary)">
            {title}
          </p>
          <button
            onClick={onClose}
            className="cursor-pointer border-none bg-transparent p-1 text-lg text-(--p-textMuted)"
          >
            ✕
          </button>
        </div>

        {/* Image area */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className={cn(
            "relative flex min-h-0 flex-1 select-none items-center justify-center overflow-hidden p-4",
            isDark ? "bg-[#0a0a0a]" : "bg-slate-100",
            zoom > 1
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-default"
          )}
        >
          <Image
            src={imageUrl}
            alt={title}
            width={1200}
            height={1200}
            draggable={false}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transition: isDragging ? "none" : "transform 0.15s"
            }}
            className="pointer-events-none h-auto max-h-full w-auto max-w-full object-contain"
          />

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              className="h-9 w-9 rounded-full border border-(--p-border) bg-(--p-bgPaper) text-lg font-bold text-(--p-textPrimary)"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              className="h-9 w-9 rounded-full border border-(--p-border) bg-(--p-bgPaper) text-lg font-bold text-(--p-textPrimary)"
            >
              −
            </button>
          </div>

          {/* Zoom indicator */}
          <div className="absolute bottom-4 left-4 rounded-md border border-(--p-border) bg-(--p-bgPaper) px-3 py-1">
            <span className="font-nunito text-xs font-bold text-(--p-textMuted)">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>
      </Box>
    </Modal>
  )
}

function StoreCard({
  store,
  isDark,
  p,
  onEdit
}: {
  store: Store
  isDark: boolean
  p: Palette
  onEdit: () => void
}) {
  const sc = statusColor(store.status, isDark)
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-(--p-border) bg-(--p-bgPaper) p-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-base",
              isDark
                ? "border-brand-700 bg-[#0d1f3c]"
                : "border-[#b5d4f4] bg-[#e6f1fb]"
            )}
          >
            {store.storeImageUrl ? (
              <Image
                src={store.storeImageUrl}
                alt={store.storeName}
                width={36}
                height={36}
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              "🏪"
            )}
          </div>
          <div className="min-w-0">
            <p className="m-0 truncate font-nunito text-sm font-bold text-(--p-textPrimary)">
              {store.storeName}
            </p>
            <p
              className={cn(
                "m-0 font-nunito text-[11px] font-bold",
                isDark ? "text-blue-400" : "text-brand-700"
              )}
            >
              {store.storeId}
            </p>
          </div>
        </div>
        <span
          style={statusVars(sc)}
          className="inline-block shrink-0 whitespace-nowrap rounded-full border border-(--sc-border) bg-(--sc-bg) px-2.5 py-0.75 font-nunito text-[10px] font-bold text-(--sc-text)"
        >
          {sc.label}
        </span>
      </div>

      {/* Info grid 2x2 */}
      <div className="grid grid-cols-2 gap-2 rounded-md border border-(--p-border) bg-(--p-bg) p-3">
        {[
          { label: "Jenis", val: store.storeType },
          { label: "Telepon", val: store.storePhone },
          { label: "Pemilik", val: store.owner.fullName },
          { label: "Kota", val: `${store.storeCity}, ${store.storeProvince}` }
        ].map((item) => (
          <div key={item.label}>
            <p className="m-0 mb-px font-nunito text-[9px] font-bold tracking-[0.05em] text-(--p-textMuted)">
              {item.label.toUpperCase()}
            </p>
            <p className="m-0 truncate font-nunito text-xs font-semibold text-(--p-textPrimary)">
              {item.val}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="font-nunito text-[11px] text-(--p-textMuted)">
          {new Date(store.createdAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          })}
        </span>
        <button
          onClick={onEdit}
          className={cn(
            "flex items-center gap-1.25 rounded-md border px-3.5 py-1.5 font-nunito text-xs font-bold",
            isDark
              ? "border-brand-700 bg-[#0d1f3c] text-blue-400"
              : "border-[#b5d4f4] bg-[#e6f1fb] text-brand-700"
          )}
        >
          <svg
            width={12}
            height={12}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
      </div>
    </div>
  )
}

// ─── Edit Store Modal ─────────────────────────────────────
function EditStoreModal({
  store,
  open,
  onClose,
  onSaved,
  isDark,
  p
}: {
  store: Store | null
  open: boolean
  onClose: () => void
  onSaved: (updated: Store) => void
  isDark: boolean
  p: Palette
}) {
  const [activeTab, setActiveTab] = useState<EditTab>("store")
  const [isSaving, setIsSaving] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    msg: string
    severity: "success" | "error"
  }>({ open: false, msg: "", severity: "success" })

  // store fields
  const [storeName, setStoreName] = useState("")
  const [storeType, setStoreType] = useState("")
  const [storePhone, setStorePhone] = useState("")
  const [storeEmail, setStoreEmail] = useState("")
  const [storeAddress, setStoreAddress] = useState("")
  const [storeImageUrl, setStoreImageUrl] = useState("")
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION)
  const [locationErrors, setLocationErrors] = useState<
    Partial<Record<keyof LocationValue, string>>
  >({})
  const [storeErrors, setStoreErrors] = useState<Record<string, string>>({})
  const [imgModalOpen, setImgModalOpen] = useState(false)

  // owner fields
  const [ownerNik, setOwnerNik] = useState("")
  const [ownerFullName, setOwnerFullName] = useState("")
  const [ownerBirthDate, setOwnerBirthDate] = useState("")
  const [ownerAddress, setOwnerAddress] = useState("")
  const [ownerGender, setOwnerGender] = useState("")
  const [ownerKtpUrl, setOwnerKtpUrl] = useState("")
  const [ownerErrors, setOwnerErrors] = useState<Record<string, string>>({})
  const [ktpModalOpen, setKtpModalOpen] = useState(false)

  const [storeImagePublicId, setStoreImagePublicId] = useState("")
  const [ownerKtpPublicId, setOwnerKtpPublicId] = useState("")

  useEffect(() => {
    if (!store) return
    setStoreName(store.storeName || "")
    setStoreType(store.storeType || "")
    setStorePhone(store.storePhone || "")
    setStoreEmail(store.storeEmail || "")
    setStoreAddress(store.storeAddress || "")
    setStoreImageUrl(store.storeImageUrl || "")
    setLocation({
      provinsiKd: store.storeProvinsiKd || "",
      provinsiNama: store.storeProvince || "",
      kotaKd: store.storeKotaKd || "",
      kotaNama: store.storeCity || "",
      kecamatanKd: store.storeKecamatanKd || "",
      kecamatanNama: store.storeDistrict || "",
      kelurahanKd: store.storeKelurahanKd || "",
      kelurahanNama: store.storeVillage || "",
      kodePos: store.storePostalCode || ""
    })
    setOwnerNik(store.owner?.nik || "")
    setOwnerFullName(store.owner?.fullName || "")
    setOwnerBirthDate(store.owner?.birthDate || "")
    setOwnerAddress(store.owner?.address || "")
    setOwnerGender(store.owner?.gender || "")
    setOwnerKtpUrl(store.owner?.ktpImageUrl || "")
    setStoreErrors({})
    setOwnerErrors({})
    setLocationErrors({})
    setActiveTab("store")
  }, [store])

  // Replaces the old inline `inputStyle(hasError)` function. Static classes
  // live in `inputBase`; only the error border color is conditional.
  const fieldClass = (hasError: boolean) =>
    cn(inputBase, hasError ? "border-red-500" : "border-(--p-border)")

  const validateStore = () => {
    const errs: Record<string, string> = {}
    if (!storeName) errs.storeName = "Nama toko wajib diisi"
    if (!storeType) errs.storeType = "Jenis toko wajib dipilih"
    if (!storePhone) errs.storePhone = "Nomor telepon wajib diisi"
    if (!storeAddress) errs.storeAddress = "Alamat toko wajib diisi"
    const locErrs: Partial<Record<keyof LocationValue, string>> = {}
    if (!location.provinsiKd) locErrs.provinsiKd = "Provinsi wajib dipilih"
    if (!location.kotaKd) locErrs.kotaKd = "Kota wajib dipilih"
    if (!location.kecamatanKd) locErrs.kecamatanKd = "Kecamatan wajib dipilih"
    if (!location.kelurahanKd) locErrs.kelurahanKd = "Kelurahan wajib dipilih"
    setStoreErrors(errs)
    setLocationErrors(locErrs)
    return Object.keys(errs).length === 0 && Object.keys(locErrs).length === 0
  }

  const validateOwner = () => {
    const errs: Record<string, string> = {}
    if (!ownerNik) errs.nik = "NIK wajib diisi"
    else if (ownerNik.length !== 16 || !/^\d+$/.test(ownerNik))
      errs.nik = "NIK harus 16 digit angka"
    if (!ownerFullName) errs.fullName = "Nama lengkap wajib diisi"
    if (!ownerBirthDate) errs.birthDate = "Tanggal lahir wajib diisi"
    if (!ownerAddress) errs.address = "Alamat wajib diisi"
    if (!ownerGender) errs.gender = "Jenis kelamin wajib dipilih"
    setOwnerErrors(errs)
    return Object.keys(errs).length === 0
  }

  const saveStore = async () => {
    if (!store || !validateStore()) return
    setIsSaving(true)
    try {
      const payload = {
        storeName,
        storeType,
        storePhone,
        storeEmail,
        storeAddress,
        storeImageUrl,
        storeProvince: location.provinsiNama,
        storeCity: location.kotaNama,
        storeDistrict: location.kecamatanNama,
        storeVillage: location.kelurahanNama,
        storePostalCode: location.kodePos,
        storeProvinsiKd: location.provinsiKd,
        storeKotaKd: location.kotaKd,
        storeKecamatanKd: location.kecamatanKd,
        storeKelurahanKd: location.kelurahanKd
      }
      const res = await fetch(`/api/stores/${store.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan")
      onSaved({
        ...store,
        ...payload,
        storeCity: location.kotaNama,
        storeProvince: location.provinsiNama
      })
      setSnackbar({
        open: true,
        msg: "Data toko berhasil disimpan!",
        severity: "success"
      })
      setTimeout(() => onClose(), 1500)
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        msg: err instanceof Error ? err.message : "Terjadi kesalahan",
        severity: "error"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const saveOwner = async () => {
    if (!store || !validateOwner()) return
    setIsSaving(true)
    try {
      const payload = {
        owner: {
          nik: ownerNik,
          fullName: ownerFullName,
          birthDate: ownerBirthDate,
          address: ownerAddress,
          gender: ownerGender,
          ktpImageUrl: ownerKtpUrl
        }
      }
      const res = await fetch(`/api/stores/${store.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan")
      onSaved({ ...store, owner: { ...store.owner, ...payload.owner } })
      setSnackbar({
        open: true,
        msg: "Data pemilik berhasil disimpan!",
        severity: "success"
      })
      setTimeout(() => onClose(), 1500)
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        msg: err instanceof Error ? err.message : "Terjadi kesalahan",
        severity: "error"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const SectionHeader = ({ label }: { label: string }) => (
    <div className="mb-4 flex items-center gap-2">
      <div className="h-4 w-1 rounded-sm bg-brand-700" />
      <p className="m-0 font-nunito text-[11px] font-bold tracking-[0.05em] text-(--p-textSecondary)">
        {label}
      </p>
    </div>
  )

  if (!store) return null
  const sc = statusColor(store.status, isDark)

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          style={{ ...paletteVars(p), boxShadow: "var(--p-menuShadow)" }}
          className="absolute left-1/2 top-1/2 flex max-h-[92vh] w-[98vw] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-(--p-border) bg-(--p-bgPaper) outline-none sm:w-[90vw] md:w-175"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-(--p-border) bg-(--p-bg) px-6 py-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-base",
                  isDark
                    ? "border-brand-700 bg-[#0d1f3c]"
                    : "border-[#b5d4f4] bg-[#e6f1fb]"
                )}
              >
                🏪
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <p className="m-0 font-nunito text-[15px] font-extrabold text-(--p-textPrimary)">
                    {store.storeName}
                  </p>
                  <Chip
                    label={sc.label}
                    size="small"
                    style={statusVars(sc)}
                    className="h-5! border border-(--sc-border)! bg-(--sc-bg)! font-nunito text-[10px]! font-bold! text-(--sc-text)!"
                  />
                </div>
                <p
                  className={cn(
                    "m-0 font-nunito text-[11px] font-bold",
                    isDark ? "text-blue-400" : "text-brand-700"
                  )}
                >
                  {store.storeId}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer border-none bg-transparent p-1 text-xl leading-none text-(--p-textMuted)"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="grid shrink-0 grid-cols-2 border-b border-(--p-border)">
            {EDIT_TABS.map((tab, idx) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-2 px-6 py-3 transition-colors",
                  idx === 0 && "border-r border-(--p-border)",
                  activeTab === tab.id
                    ? isDark
                      ? "bg-[#0d1f3c]"
                      : "bg-[#e6f1fb]"
                    : "bg-(--p-bgPaper)"
                )}
              >
                <p
                  className={cn(
                    "m-0 font-nunito text-[13px] font-bold",
                    activeTab === tab.id
                      ? isDark
                        ? "text-blue-300"
                        : "text-brand-700"
                      : "text-(--p-textMuted)"
                  )}
                >
                  {tab.label}
                </p>
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* ══ TAB STORE ══ */}
            {activeTab === "store" && (
              <div className="flex flex-col gap-6">
                {/* Foto Toko */}
                <div className="border-b border-(--p-border) pb-6">
                  <SectionHeader label="FOTO TOKO" />
                  <div className="flex items-center gap-5">
                    <div
                      onClick={() => setImgModalOpen(true)}
                      className={cn(
                        "flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full transition-all hover:border-brand-700",
                        storeImageUrl
                          ? "border-[3px] border-green-600"
                          : cn(
                              "border-2 border-dashed",
                              isDark ? "border-brand-700" : "border-[#b5d4f4]"
                            ),
                        isDark ? "bg-[#0d1f3c]" : "bg-blue-50"
                      )}
                    >
                      {storeImageUrl ? (
                        <Image
                          src={storeImageUrl}
                          alt="Foto"
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span
                          className={cn(
                            "font-nunito text-[9px] font-bold",
                            isDark ? "text-blue-300" : "text-brand-700"
                          )}
                        >
                          FOTO
                        </span>
                      )}
                    </div>
                    <div>
                      {storeImageUrl && (
                        <p className="m-0 mb-1 font-nunito text-[11px] font-semibold text-green-600">
                          ✓ Foto tersedia
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setImgModalOpen(true)}
                          className={cn(
                            "cursor-pointer rounded-md border px-3 py-1.5 font-nunito text-xs font-bold text-brand-700",
                            isDark
                              ? "border-brand-700 bg-[#0d1f3c]"
                              : "border-[#b5d4f4] bg-blue-50"
                          )}
                        >
                          {storeImageUrl ? "Ganti Foto" : "Upload Foto"}
                        </button>
                        {storeImageUrl && (
                          <button
                            onClick={async () => {
                              if (storeImagePublicId) {
                                await fetch("/api/upload/delete", {
                                  method: "DELETE",
                                  headers: {
                                    "Content-Type": "application/json"
                                  },
                                  body: JSON.stringify({
                                    publicId: storeImagePublicId
                                  })
                                })
                              }
                              setStoreImageUrl("")
                              setStoreImagePublicId("")
                            }}
                            className="cursor-pointer rounded-md border border-red-200 bg-transparent px-3 py-1.5 font-nunito text-xs font-bold text-red-500"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informasi Umum */}
                <div className="border-b border-(--p-border) pb-6">
                  <SectionHeader label="INFORMASI UMUM" />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="NAMA TOKO *" error={storeErrors.storeName}>
                        <input
                          type="text"
                          placeholder="Nama toko"
                          value={storeName}
                          onChange={(e) => {
                            setStoreName(e.target.value)
                            setStoreErrors((prev) => ({
                              ...prev,
                              storeName: ""
                            }))
                          }}
                          className={fieldClass(!!storeErrors.storeName)}
                        />
                      </Field>
                    </div>
                    <Field label="JENIS TOKO *" error={storeErrors.storeType}>
                      <select
                        value={storeType}
                        onChange={(e) => {
                          setStoreType(e.target.value)
                          setStoreErrors((prev) => ({ ...prev, storeType: "" }))
                        }}
                        className={fieldClass(!!storeErrors.storeType)}
                      >
                        <option value="">Pilih jenis toko</option>
                        {STORE_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field
                      label="NOMOR TELEPON *"
                      error={storeErrors.storePhone}
                    >
                      <input
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={storePhone}
                        onChange={(e) => {
                          setStorePhone(e.target.value)
                          setStoreErrors((prev) => ({
                            ...prev,
                            storePhone: ""
                          }))
                        }}
                        className={fieldClass(!!storeErrors.storePhone)}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="EMAIL TOKO">
                        <input
                          type="email"
                          placeholder="email@toko.com (opsional)"
                          value={storeEmail}
                          onChange={(e) => setStoreEmail(e.target.value)}
                          className={fieldClass(false)}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field
                        label="ALAMAT TOKO *"
                        error={storeErrors.storeAddress}
                      >
                        <textarea
                          rows={2}
                          placeholder="Jalan, No, RT/RW"
                          value={storeAddress}
                          onChange={(e) => {
                            setStoreAddress(e.target.value)
                            setStoreErrors((prev) => ({
                              ...prev,
                              storeAddress: ""
                            }))
                          }}
                          className={cn(
                            fieldClass(!!storeErrors.storeAddress),
                            "resize-y"
                          )}
                        />
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Wilayah */}
                <div>
                  <SectionHeader label="WILAYAH" />
                  <LocationSelector
                    value={location}
                    onChange={(val) => {
                      setLocation(val)
                      setLocationErrors({})
                    }}
                    errors={locationErrors}
                    isDark={isDark}
                    p={p}
                  />
                </div>
              </div>
            )}

            {/* ══ TAB OWNER ══ */}
            {activeTab === "owner" && (
              <div className="flex flex-col gap-6">
                {/* Foto KTP */}
                <div className="border-b border-(--p-border) pb-6">
                  <SectionHeader label="FOTO KTP" />
                  <div className="flex flex-wrap items-start gap-6">
                    {ownerKtpUrl ? (
                      <div className="relative shrink-0">
                        <Image
                          src={ownerKtpUrl}
                          alt="KTP"
                          width={180}
                          height={113}
                          className="block h-28.25 w-45 rounded-lg border-2 border-green-600 object-cover"
                        />
                        <div className="absolute right-1.5 top-1.5 flex gap-1">
                          <div
                            onClick={() => setKtpModalOpen(true)}
                            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-brand-700 text-[11px]"
                          >
                            📷
                          </div>
                          <div
                            onClick={async () => {
                              if (ownerKtpPublicId) {
                                await fetch("/api/upload/delete", {
                                  method: "DELETE",
                                  headers: {
                                    "Content-Type": "application/json"
                                  },
                                  body: JSON.stringify({
                                    publicId: ownerKtpPublicId
                                  })
                                })
                              }
                              setOwnerKtpUrl("")
                              setOwnerKtpPublicId("")
                            }}
                            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-red-500 text-[11px]"
                          >
                            🗑️
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setKtpModalOpen(true)}
                        className={cn(
                          "flex h-28.25 w-45 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed hover:border-brand-700",
                          isDark
                            ? "border-brand-700 bg-[#0d1f3c]"
                            : "border-[#b5d4f4] bg-blue-50"
                        )}
                      >
                        <span className="text-[22px]">🪪</span>
                        <p className="m-0 font-nunito text-[11px] font-bold text-brand-700">
                          Upload KTP
                        </p>
                      </div>
                    )}
                    <div>
                      <button
                        onClick={() => setKtpModalOpen(true)}
                        className={cn(
                          "cursor-pointer rounded-md border px-3 py-1.5 font-nunito text-xs font-bold text-brand-700",
                          isDark
                            ? "border-brand-700 bg-[#0d1f3c]"
                            : "border-[#b5d4f4] bg-blue-50"
                        )}
                      >
                        {ownerKtpUrl ? "Ganti KTP" : "Upload KTP"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Data Diri */}
                <div>
                  <SectionHeader label="DATA DIRI PEMILIK" />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="NIK *" error={ownerErrors.nik}>
                        <input
                          type="text"
                          placeholder="16 digit NIK"
                          value={ownerNik}
                          maxLength={16}
                          onChange={(e) => {
                            setOwnerNik(e.target.value.replace(/\D/g, ""))
                            setOwnerErrors((prev) => ({ ...prev, nik: "" }))
                          }}
                          className={fieldClass(!!ownerErrors.nik)}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field
                        label="NAMA LENGKAP *"
                        error={ownerErrors.fullName}
                      >
                        <input
                          type="text"
                          placeholder="Sesuai KTP"
                          value={ownerFullName}
                          onChange={(e) => {
                            setOwnerFullName(e.target.value)
                            setOwnerErrors((prev) => ({
                              ...prev,
                              fullName: ""
                            }))
                          }}
                          className={fieldClass(!!ownerErrors.fullName)}
                        />
                      </Field>
                    </div>
                    <Field
                      label="TANGGAL LAHIR *"
                      error={ownerErrors.birthDate}
                      hint="Format: DD-MM-YYYY"
                    >
                      <input
                        type="text"
                        placeholder="DD-MM-YYYY"
                        value={ownerBirthDate}
                        onChange={(e) => {
                          setOwnerBirthDate(e.target.value)
                          setOwnerErrors((prev) => ({ ...prev, birthDate: "" }))
                        }}
                        className={fieldClass(!!ownerErrors.birthDate)}
                      />
                    </Field>
                    <Field label="JENIS KELAMIN *" error={ownerErrors.gender}>
                      <select
                        value={ownerGender}
                        onChange={(e) => {
                          setOwnerGender(e.target.value)
                          setOwnerErrors((prev) => ({ ...prev, gender: "" }))
                        }}
                        className={fieldClass(!!ownerErrors.gender)}
                      >
                        <option value="">Pilih</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field
                        label="ALAMAT SESUAI KTP *"
                        error={ownerErrors.address}
                      >
                        <textarea
                          rows={2}
                          placeholder="Alamat lengkap sesuai KTP"
                          value={ownerAddress}
                          onChange={(e) => {
                            setOwnerAddress(e.target.value)
                            setOwnerErrors((prev) => ({ ...prev, address: "" }))
                          }}
                          className={cn(
                            fieldClass(!!ownerErrors.address),
                            "resize-y"
                          )}
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 justify-end gap-3 border-t border-(--p-border) bg-(--p-bg) px-6 py-4">
            <button
              onClick={onClose}
              className="cursor-pointer rounded-md border border-(--p-border) bg-transparent px-5 py-2.5 font-nunito text-[13px] font-bold text-(--p-textSecondary)"
            >
              Batal
            </button>
            <button
              onClick={activeTab === "store" ? saveStore : saveOwner}
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 rounded-md border-none px-6 py-2.5 font-nunito text-[13px] font-bold text-white",
                isSaving
                  ? "cursor-not-allowed bg-slate-500 opacity-80"
                  : "cursor-pointer bg-brand-700"
              )}
            >
              {isSaving && (
                <div className="h-3.25 w-3.25 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {isSaving
                ? "Menyimpan..."
                : `Simpan ${activeTab === "store" ? "Data Toko" : "Data Pemilik"}`}
            </button>
          </div>
        </Box>
      </Modal>

      {/* Image Modals */}
      <ImageModal
        open={imgModalOpen}
        onClose={() => setImgModalOpen(false)}
        onUploaded={(url, publicId) => {
          setStoreImageUrl(url)
          setStoreImagePublicId(publicId)
        }}
        title="Ganti Foto Toko"
        icon="🏪"
        isDark={isDark}
        p={p}
      />
      <ImageModal
        open={ktpModalOpen}
        onClose={() => setKtpModalOpen(false)}
        onUploaded={(url, publicId) => {
          setOwnerKtpUrl(url)
          setOwnerKtpPublicId(publicId)
        }}
        title="Upload / Ganti Foto KTP"
        icon="🪪"
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
          className="font-nunito! text-[13px]!"
        >
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
export default function SettingsPage() {
  const router = useRouter()
  const { isDark, toggleTheme } = useTheme()
  const [previewImage, setPreviewImage] = useState<{
    url: string
    title: string
  } | null>(null)
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
        : "0 8px 32px rgba(0,0,0,0.12)"
    }),
    [isDark]
  )
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [editStore, setEditStore] = useState<Store | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    msg: string
    severity: "success" | "error"
  }>({ open: false, msg: "", severity: "success" })

  const drawerPaperSx = () => ({
    width: DRAWER_WIDTH,
    boxSizing: "border-box" as const,
    bgcolor: "transparent",
    border: "none",
    overflow: "hidden"
  })

  const fetchStores = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/stores")
      const data = await res.json()
      if (data.success) setStores(data.data)
      else throw new Error(data.error)
    } catch {
      setSnackbar({
        open: true,
        msg: "Gagal mengambil data toko",
        severity: "error"
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

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
        return matchSearch && matchStatus
      }),
    [stores, search, filterStatus]
  )

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

  const openEdit = (store: Store) => {
    setEditStore(store)
    setEditOpen(true)
  }

  const handleSaved = (updated: Store) => {
    setStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        style={paletteVars(p)}
        className="flex min-h-screen bg-(--p-bg) font-nunito transition-colors duration-300"
      >
        {/* Drawer Mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          className="block md:hidden"
          sx={{ "& .MuiDrawer-paper": drawerPaperSx() }}
        >
          <Sidebar isDark={isDark} T="0.3s ease" />
        </Drawer>
        {/* Drawer Desktop */}
        <Drawer
          variant="permanent"
          className="hidden shrink-0 md:block"
          sx={{ width: DRAWER_WIDTH, "& .MuiDrawer-paper": drawerPaperSx() }}
        >
          <Sidebar isDark={isDark} T="0.3s ease" />
        </Drawer>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onMenuClick={() => setMobileOpen(true)}
            title="Settings"
            showAddButton={false}
            notificationCount={0}
          />

          <div className="flex-1 overflow-auto p-3 sm:p-4">
            {/* Page Title */}
            <div className="mb-6">
              <p className="m-0 font-nunito text-lg font-extrabold text-(--p-textPrimary)">
                Pengaturan Toko
              </p>
              <p className="m-0 mt-0.5 font-nunito text-xs text-(--p-textMuted)">
                Kelola dan edit data semua toko yang terdaftar
              </p>
            </div>

            {/* Stat Cards */}
            <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:grid-cols-4 sm:gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  style={{ "--stat-color": s.color } as React.CSSProperties}
                  className="relative overflow-hidden rounded-lg border border-(--p-border) bg-(--p-bgPaper) p-3 before:absolute before:left-0 before:right-0 before:top-0 before:h-0.75 before:bg-(--stat-color) sm:p-4"
                >
                  <p className="m-0 mb-1 font-nunito text-[9px] font-bold tracking-[0.06em] text-(--p-textMuted)">
                    {s.label.toUpperCase()}
                  </p>
                  <p className="m-0 font-nunito text-[26px] font-black leading-none text-(--p-textPrimary)">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Main Card */}
            <div className="overflow-hidden rounded-lg border border-(--p-border) bg-(--p-bgPaper)">
              {/* Filter Bar */}
              <div className="border-b border-(--p-border) bg-(--p-bg) px-4 py-4 sm:px-6">
                <div className="relative mb-3">
                  <div className="pointer-events-none absolute left-2.5 top-1/2 z-10 flex -translate-y-1/2 text-(--p-textMuted)">
                    <svg
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Cari nama toko, ID, kota, pemilik..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={cn(inputBase, "border-(--p-border) py-2 pl-8")}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="min-w-0 flex-1 basis-32.5">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className={cn(inputBase, "border-(--p-border) py-2")}
                    >
                      <option value="all">Semua Status</option>
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <button
                    onClick={() => router.push("/registration")}
                    className="flex h-9.5 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border-none bg-linear-to-br from-brand-700 to-brand-500 px-3.5 font-nunito text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(59,130,246,.25)]"
                  >
                    <svg
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Tambah Toko
                  </button>
                </div>
              </div>

              {/* Mobile Card List */}
              {isMobile ? (
                <div className="flex flex-col gap-3 p-3">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-(--p-border) p-4"
                      >
                        {[100, 60, 80, 50].map((w, j) => (
                          <div
                            key={j}
                            style={{ width: `${w}%` }}
                            className={cn(
                              "mb-2.5 h-2.75 animate-pulse rounded",
                              isDark ? "bg-[#1f1f1f]" : "bg-slate-100"
                            )}
                          />
                        ))}
                      </div>
                    ))
                  ) : filtered.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="m-0 font-nunito text-sm text-(--p-textMuted)">
                        {search || filterStatus !== "all"
                          ? "Tidak ada toko yang sesuai filter"
                          : "Belum ada toko terdaftar"}
                      </p>
                    </div>
                  ) : (
                    filtered.map((store) => (
                      <StoreCard
                        key={store.id}
                        store={store}
                        isDark={isDark}
                        p={p}
                        onEdit={() => openEdit(store)}
                      />
                    ))
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse font-nunito">
                    <thead>
                      <tr className="border-b border-(--p-border) bg-(--p-tableHeadBg)">
                        {[
                          "ID TOKO",
                          "NAMA TOKO",
                          "JENIS",
                          "PEMILIK",
                          "KOTA",
                          "STATUS",
                          "TERDAFTAR",
                          "AKSI"
                        ].map((col) => (
                          <th
                            key={col}
                            className="whitespace-nowrap px-4 py-2.5 text-left text-[10px] font-bold tracking-[0.08em] text-(--p-textMuted)"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            {Array.from({ length: 8 }).map((_, j) => (
                              <td key={j} className="px-4 py-3.5">
                                <Skeleton
                                  variant="text"
                                  width={j === 1 ? "80%" : "60%"}
                                  height={14}
                                  className={
                                    isDark ? "bg-[#1f1f1f]!" : "bg-slate-100!"
                                  }
                                />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : filtered.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center">
                            <p className="m-0 font-nunito text-sm text-(--p-textMuted)">
                              {search || filterStatus !== "all"
                                ? "Tidak ada toko yang sesuai filter"
                                : "Belum ada toko terdaftar"}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filtered.map((store, idx) => {
                          const sc = statusColor(store.status, isDark)
                          const isEven = idx % 2 === 0
                          return (
                            <tr
                              key={store.id}
                              className={cn(
                                "border-b transition-colors",
                                isDark ? "border-[#111111]" : "border-slate-50",
                                isEven
                                  ? "bg-transparent"
                                  : isDark
                                    ? "bg-white/1"
                                    : "bg-black/1",
                                isDark
                                  ? "hover:bg-[#161616]"
                                  : "hover:bg-slate-50"
                              )}
                            >
                              <td className="px-4 py-3">
                                <span
                                  className={cn(
                                    "font-nunito text-[11px] font-bold",
                                    isDark ? "text-blue-400" : "text-brand-700"
                                  )}
                                >
                                  {store.storeId}
                                </span>
                              </td>
                              <td className="min-w-45 px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    onClick={() =>
                                      store.storeImageUrl &&
                                      setPreviewImage({
                                        url: store.storeImageUrl,
                                        title: store.storeName
                                      })
                                    }
                                    className={cn(
                                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-sm",
                                      isDark
                                        ? "border-brand-700 bg-[#0d1f3c]"
                                        : "border-[#b5d4f4] bg-[#e6f1fb]",
                                      store.storeImageUrl
                                        ? "cursor-pointer"
                                        : "cursor-default"
                                    )}
                                  >
                                    {store.storeImageUrl ? (
                                      <Image
                                        src={store.storeImageUrl}
                                        alt={store.storeName}
                                        width={32}
                                        height={32}
                                        className="h-full w-full rounded-md object-cover"
                                      />
                                    ) : (
                                      "🏪"
                                    )}
                                  </div>
                                  <div>
                                    <p className="m-0 font-nunito text-[13px] font-bold text-(--p-textPrimary)">
                                      {store.storeName}
                                    </p>
                                    {store.storeEmail && (
                                      <p className="m-0 font-nunito text-[11px] text-(--p-textMuted)">
                                        {store.storeEmail}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-nunito text-xs text-(--p-textSecondary)">
                                  {store.storeType}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <p className="m-0 font-nunito text-[13px] font-semibold text-(--p-textPrimary)">
                                  {store.owner.fullName}
                                </p>
                                <p className="m-0 font-nunito text-[10px] text-(--p-textMuted)">
                                  NIK: {store.owner.nik.slice(0, 6)}••••••••••
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="m-0 font-nunito text-xs text-(--p-textPrimary)">
                                  {store.storeCity}
                                </p>
                                <p className="m-0 font-nunito text-[10px] text-(--p-textMuted)">
                                  {store.storeProvince}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  style={statusVars(sc)}
                                  className="inline-block rounded-full border border-(--sc-border) bg-(--sc-bg) px-2.5 py-0.75 font-nunito text-[11px] font-bold text-(--sc-text)"
                                >
                                  {sc.label}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-nunito text-[11px] text-(--p-textMuted)">
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
                                <button
                                  onClick={() => openEdit(store)}
                                  className={cn(
                                    "flex items-center gap-1.25 whitespace-nowrap rounded-md border px-3.5 py-1.5 font-nunito text-xs font-bold",
                                    isDark
                                      ? "border-brand-700 bg-[#0d1f3c] text-blue-400"
                                      : "border-[#b5d4f4] bg-[#e6f1fb] text-brand-700"
                                  )}
                                >
                                  <svg
                                    width={12}
                                    height={12}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                  Edit
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer count */}
              {!loading && filtered.length > 0 && (
                <div className="border-t border-(--p-border) bg-(--p-tableHeadBg) px-6 py-3">
                  <span className="font-nunito text-xs text-(--p-textMuted)">
                    Menampilkan{" "}
                    <strong className="text-(--p-textSecondary)">
                      {filtered.length}
                    </strong>{" "}
                    dari{" "}
                    <strong className="text-(--p-textSecondary)">
                      {stores.length}
                    </strong>{" "}
                    toko
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Box>

      {/* Edit Modal */}
      <EditStoreModal
        store={editStore}
        open={editOpen}
        onClose={() => {
          setEditOpen(false)
          setEditStore(null)
        }}
        onSaved={handleSaved}
        isDark={isDark}
        p={p}
      />

      {/* Image Preview Modal */}
      <ImagePreviewModal
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage?.url ?? null}
        title={previewImage?.title ?? "Preview"}
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
          className="font-nunito! text-[13px]!"
        >
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  )
}
