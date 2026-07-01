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
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 700,
          color: "#64748b",
          marginBottom: 6,
          fontFamily: "'Nunito', sans-serif",
          letterSpacing: "0.04em"
        }}
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p
          style={{
            fontSize: 11,
            color: "#94a3b8",
            marginTop: 4,
            fontFamily: "'Nunito', sans-serif"
          }}
        >
          {hint}
        </p>
      )}
      {error && (
        <p
          style={{
            fontSize: 11,
            color: "#ef4444",
            marginTop: 4,
            fontFamily: "'Nunito', sans-serif"
          }}
        >
          {error}
        </p>
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
  p: {
    [key: string]: string
    border: string
    textPrimary: string
    textMuted: string
    bgPaper: string
    bg: string
    menuShadow: string
  }
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
      const result = await res.json() // ✅ sekali saja
      if (!res.ok) throw new Error(result.error || "Gagal upload")

      onUploaded(result.url, result.publicId ?? "") // ✅ pakai result langsung
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
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: { xs: "95vw", sm: 480 },
          bgcolor: p.bgPaper,
          border: `1px solid ${p.border}`,
          borderRadius: "10px",
          boxShadow: p.menuShadow,
          outline: "none",
          overflow: "hidden"
        }}
      >
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: `1px solid ${p.border}`,
            bgcolor: p.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                bgcolor: isDark ? "#0d1f3c" : "#e6f1fb",
                border: `1px solid ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14
              }}
            >
              {icon}
            </Box>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                color: p.textPrimary,
                fontFamily: "'Nunito', sans-serif"
              }}
            >
              {title}
            </p>
          </Box>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: p.textMuted,
              fontSize: 18,
              padding: 4
            }}
          >
            ✕
          </button>
        </Box>
        <Box sx={{ p: 3 }}>
          <input
            type="file"
            id="img-upload"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            style={{ display: "none" }}
          />
          {!preview ? (
            <Box
              onClick={() =>
                status !== "uploading" &&
                document.getElementById("img-upload")?.click()
              }
              sx={{
                border: `1.5px dashed ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                borderRadius: "8px",
                py: 5,
                textAlign: "center",
                cursor: "pointer",
                "&:hover": {
                  borderColor: "#1e3a8a",
                  bgcolor: isDark ? "#0d1f3c" : "#eff6ff"
                },
                transition: "all 0.2s"
              }}
            >
              <p style={{ margin: "0 0 6px", fontSize: 28 }}>📎</p>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "#1e3a8a",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700
                }}
              >
                Klik untuk pilih gambar
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 11,
                  color: p.textMuted,
                  fontFamily: "'Nunito', sans-serif"
                }}
              >
                JPG, PNG, WEBP · Maks 5MB
              </p>
            </Box>
          ) : (
            <Image
              src={preview}
              alt="Preview"
              width={440}
              height={220}
              style={{
                width: "100%",
                borderRadius: 8,
                border: `1px solid ${p.border}`,
                maxHeight: 220,
                objectFit: "cover"
              }}
            />
          )}
          {status === "uploading" && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mt: 2,
                p: 1.5,
                bgcolor: isDark ? "#0d1f3c" : "#e6f1fb",
                border: `1px solid ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                borderRadius: "6px"
              }}
            >
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  border: "2px solid #1e3a8a",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite"
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  color: "#1e3a8a",
                  fontFamily: "'Nunito', sans-serif"
                }}
              >
                Mengupload gambar...
              </span>
            </Box>
          )}
          {status === "success" && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mt: 2,
                p: 1.5,
                bgcolor: isDark ? "#0a2e1c" : "#f0fdf4",
                border: `1px solid ${isDark ? "#1a5c38" : "#bbf7d0"}`,
                borderRadius: "6px"
              }}
            >
              <span style={{ color: "#16a34a", fontSize: 16 }}>✓</span>
              <span
                style={{
                  fontSize: 13,
                  color: isDark ? "#4ade80" : "#16a34a",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 600
                }}
              >
                Gambar berhasil diupload!
              </span>
            </Box>
          )}
          {status === "error" && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                bgcolor: isDark ? "#2e1010" : "#fef2f2",
                border: `1px solid ${isDark ? "#5a1a1a" : "#fecaca"}`,
                borderRadius: "6px"
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: 13,
                  color: "#ef4444",
                  fontFamily: "'Nunito', sans-serif"
                }}
              >
                {error}
              </p>
              <button
                onClick={() => {
                  setStatus("idle")
                  setError("")
                  setPreview("")
                }}
                style={{
                  padding: "6px 14px",
                  border: "1px solid #ef4444",
                  borderRadius: 4,
                  background: "transparent",
                  color: "#ef4444",
                  fontSize: 12,
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Coba Lagi
              </button>
            </Box>
          )}
        </Box>
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
  p: {
    [key: string]: string
    border: string
    textPrimary: string
    textMuted: string
    bgPaper: string
    bg: string
    menuShadow: string
  }
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
        sx={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: { xs: "96vw", sm: "90vw", md: "80vw", lg: 1000 },
          height: 520,
          maxWidth: 1200,
          maxHeight: 520,
          display: "flex",
          flexDirection: "column",
          bgcolor: p.bgPaper,
          border: `1px solid ${p.border}`,
          borderRadius: "10px",
          boxShadow: p.menuShadow,
          outline: "none",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: `1px solid ${p.border}`,
            bgcolor: p.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0
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
            {title}
          </p>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: p.textMuted,
              fontSize: 18,
              padding: 4
            }}
          >
            ✕
          </button>
        </Box>

        {/* Image area */}
        <Box
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          sx={{
            flex: 1,
            position: "relative",
            bgcolor: isDark ? "#0a0a0a" : "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            minHeight: 0,
            p: 2,
            cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
            userSelect: "none"
          }}
        >
          <Image
            src={imageUrl}
            alt={title}
            width={1200}
            height={1200}
            draggable={false}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transition: isDragging ? "none" : "transform 0.15s",
              pointerEvents: "none"
            }}
          />

          {/* Zoom controls */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
              display: "flex",
              flexDirection: "column",
              gap: 1
            }}
          >
            <button
              onClick={handleZoomIn}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: `1px solid ${p.border}`,
                background: p.bgPaper,
                color: p.textPrimary,
                cursor: "pointer",
                fontSize: 18,
                fontWeight: 700
              }}
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: `1px solid ${p.border}`,
                background: p.bgPaper,
                color: p.textPrimary,
                cursor: "pointer",
                fontSize: 18,
                fontWeight: 700
              }}
            >
              −
            </button>
          </Box>

          {/* Zoom indicator */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: 16,
              px: 1.5,
              py: 0.5,
              borderRadius: "6px",
              bgcolor: p.bgPaper,
              border: `1px solid ${p.border}`
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: p.textMuted,
                fontFamily: "'Nunito', sans-serif"
              }}
            >
              {Math.round(zoom * 100)}%
            </span>
          </Box>
        </Box>
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
  p: Record<string, string>
  onEdit: () => void
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
            {store.storeImageUrl ? (
              <Image
                src={store.storeImageUrl}
                alt={store.storeName}
                width={36}
                height={36}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 6
                }}
              />
            ) : (
              "🏪"
            )}
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
        <button
          onClick={onEdit}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 14px",
            border: `1px solid ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
            borderRadius: 6,
            background: isDark ? "#0d1f3c" : "#e6f1fb",
            color: isDark ? "#60a5fa" : "#1e3a8a",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Nunito', sans-serif",
            cursor: "pointer"
          }}
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
      </Box>
    </Box>
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
  p: {
    bg: string
    bgPaper: string
    border: string
    textPrimary: string
    textSecondary: string
    textMuted: string
    tableHeadBg: string
    menuShadow: string
  }
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

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "9px 12px",
    borderRadius: 6,
    border: `1px solid ${hasError ? "#ef4444" : p.border}`,
    background: isDark ? "#111" : "#fff",
    color: p.textPrimary,
    fontFamily: "'Nunito', sans-serif",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s"
  })

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
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <Box sx={{ width: 4, height: 16, bgcolor: "#1e3a8a", borderRadius: 2 }} />
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 700,
          color: p.textSecondary,
          fontFamily: "'Nunito', sans-serif",
          letterSpacing: "0.05em"
        }}
      >
        {label}
      </p>
    </Box>
  )

  if (!store) return null
  const sc = statusColor(store.status, isDark)

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "98vw", sm: "90vw", md: 700 },
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
            bgcolor: p.bgPaper,
            border: `1px solid ${p.border}`,
            borderRadius: "12px",
            boxShadow: p.menuShadow,
            outline: "none",
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: `1px solid ${p.border}`,
              bgcolor: p.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: isDark ? "#0d1f3c" : "#e6f1fb",
                  border: `1px solid ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  flexShrink: 0
                }}
              >
                🏪
              </Box>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15,
                      fontWeight: 800,
                      color: p.textPrimary,
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  >
                    {store.storeName}
                  </p>
                  <Chip
                    label={sc.label}
                    size="small"
                    sx={{
                      bgcolor: sc.bg,
                      color: sc.text,
                      border: `1px solid ${sc.border}`,
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      height: 20
                    }}
                  />
                </Box>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: isDark ? "#60a5fa" : "#1e3a8a",
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700
                  }}
                >
                  {store.storeId}
                </p>
              </Box>
            </Box>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: p.textMuted,
                fontSize: 20,
                padding: 4,
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </Box>

          {/* Tabs */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              borderBottom: `1px solid ${p.border}`,
              flexShrink: 0
            }}
          >
            {EDIT_TABS.map((tab, idx) => (
              <Box
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  px: 3,
                  py: 1.5,
                  borderRight: idx === 0 ? `1px solid ${p.border}` : "none",
                  bgcolor:
                    activeTab === tab.id
                      ? isDark
                        ? "#0d1f3c"
                        : "#e6f1fb"
                      : p.bgPaper,
                  cursor: "pointer",
                  transition: "background-color 0.2s"
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "'Nunito', sans-serif",
                    color:
                      activeTab === tab.id
                        ? isDark
                          ? "#93c5fd"
                          : "#1e3a8a"
                        : p.textMuted
                  }}
                >
                  {tab.label}
                </p>
              </Box>
            ))}
          </Box>

          {/* Body */}
          <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, sm: 3 } }}>
            {/* ══ TAB STORE ══ */}
            {activeTab === "store" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Foto Toko */}
                <Box sx={{ pb: 3, borderBottom: `1px solid ${p.border}` }}>
                  <SectionHeader label="FOTO TOKO" />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                    <Box
                      onClick={() => setImgModalOpen(true)}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        border: storeImageUrl
                          ? "3px solid #16a34a"
                          : `2px dashed ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                        overflow: "hidden",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: isDark ? "#0d1f3c" : "#eff6ff",
                        flexShrink: 0,
                        "&:hover": { borderColor: "#1e3a8a" },
                        transition: "all 0.2s"
                      }}
                    >
                      {storeImageUrl ? (
                        <Image
                          src={storeImageUrl}
                          alt="Foto"
                          width={80}
                          height={80}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            fontSize: 9,
                            color: isDark ? "#93c5fd" : "#1e3a8a",
                            fontFamily: "'Nunito', sans-serif",
                            fontWeight: 700
                          }}
                        >
                          FOTO
                        </span>
                      )}
                    </Box>
                    <Box>
                      {storeImageUrl && (
                        <p
                          style={{
                            margin: "0 0 4px",
                            fontSize: 11,
                            color: "#16a34a",
                            fontFamily: "'Nunito', sans-serif",
                            fontWeight: 600
                          }}
                        >
                          ✓ Foto tersedia
                        </p>
                      )}
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <button
                          onClick={() => setImgModalOpen(true)}
                          style={{
                            padding: "5px 12px",
                            border: `1px solid ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                            borderRadius: 6,
                            background: isDark ? "#0d1f3c" : "#eff6ff",
                            color: "#1e3a8a",
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: "'Nunito', sans-serif",
                            cursor: "pointer"
                          }}
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
                            style={{
                              padding: "5px 12px",
                              border: "1px solid #fecaca",
                              borderRadius: 6,
                              background: "transparent",
                              color: "#ef4444",
                              fontSize: 12,
                              fontWeight: 700,
                              fontFamily: "'Nunito', sans-serif",
                              cursor: "pointer"
                            }}
                          >
                            Hapus
                          </button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Informasi Umum */}
                <Box sx={{ pb: 3, borderBottom: `1px solid ${p.border}` }}>
                  <SectionHeader label="INFORMASI UMUM" />
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2
                    }}
                  >
                    <Box sx={{ gridColumn: { xs: "1", sm: "span 2" } }}>
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
                          style={inputStyle(!!storeErrors.storeName)}
                        />
                      </Field>
                    </Box>
                    <Field label="JENIS TOKO *" error={storeErrors.storeType}>
                      <select
                        value={storeType}
                        onChange={(e) => {
                          setStoreType(e.target.value)
                          setStoreErrors((prev) => ({ ...prev, storeType: "" }))
                        }}
                        style={inputStyle(!!storeErrors.storeType)}
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
                        style={inputStyle(!!storeErrors.storePhone)}
                      />
                    </Field>
                    <Box sx={{ gridColumn: { xs: "1", sm: "span 2" } }}>
                      <Field label="EMAIL TOKO">
                        <input
                          type="email"
                          placeholder="email@toko.com (opsional)"
                          value={storeEmail}
                          onChange={(e) => setStoreEmail(e.target.value)}
                          style={inputStyle(false)}
                        />
                      </Field>
                    </Box>
                    <Box sx={{ gridColumn: { xs: "1", sm: "span 2" } }}>
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
                          style={{
                            ...inputStyle(!!storeErrors.storeAddress),
                            resize: "vertical"
                          }}
                        />
                      </Field>
                    </Box>
                  </Box>
                </Box>

                {/* Wilayah */}
                <Box>
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
                </Box>
              </Box>
            )}

            {/* ══ TAB OWNER ══ */}
            {activeTab === "owner" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Foto KTP */}
                <Box sx={{ pb: 3, borderBottom: `1px solid ${p.border}` }}>
                  <SectionHeader label="FOTO KTP" />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 3,
                      flexWrap: "wrap"
                    }}
                  >
                    {ownerKtpUrl ? (
                      <Box sx={{ position: "relative", flexShrink: 0 }}>
                        <Image
                          src={ownerKtpUrl}
                          alt="KTP"
                          width={180}
                          height={113}
                          style={{
                            width: 180,
                            height: 113,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "2px solid #16a34a",
                            display: "block"
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            display: "flex",
                            gap: 0.5
                          }}
                        >
                          <Box
                            onClick={() => setKtpModalOpen(true)}
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: "#1e3a8a",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              fontSize: 11
                            }}
                          >
                            📷
                          </Box>
                          <Box
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
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: "#ef4444",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              fontSize: 11
                            }}
                          >
                            🗑️
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        onClick={() => setKtpModalOpen(true)}
                        sx={{
                          width: 180,
                          height: 113,
                          border: `2px dashed ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                          borderRadius: "8px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                          cursor: "pointer",
                          bgcolor: isDark ? "#0d1f3c" : "#eff6ff",
                          flexShrink: 0,
                          "&:hover": { borderColor: "#1e3a8a" }
                        }}
                      >
                        <span style={{ fontSize: 22 }}>🪪</span>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 11,
                            color: "#1e3a8a",
                            fontFamily: "'Nunito', sans-serif",
                            fontWeight: 700
                          }}
                        >
                          Upload KTP
                        </p>
                      </Box>
                    )}
                    <Box>
                      <button
                        onClick={() => setKtpModalOpen(true)}
                        style={{
                          padding: "5px 12px",
                          border: `1px solid ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                          borderRadius: 6,
                          background: isDark ? "#0d1f3c" : "#eff6ff",
                          color: "#1e3a8a",
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: "'Nunito', sans-serif",
                          cursor: "pointer"
                        }}
                      >
                        {ownerKtpUrl ? "Ganti KTP" : "Upload KTP"}
                      </button>
                    </Box>
                  </Box>
                </Box>

                {/* Data Diri */}
                <Box>
                  <SectionHeader label="DATA DIRI PEMILIK" />
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2
                    }}
                  >
                    <Box sx={{ gridColumn: { xs: "1", sm: "span 2" } }}>
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
                          style={inputStyle(!!ownerErrors.nik)}
                        />
                      </Field>
                    </Box>
                    <Box sx={{ gridColumn: { xs: "1", sm: "span 2" } }}>
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
                          style={inputStyle(!!ownerErrors.fullName)}
                        />
                      </Field>
                    </Box>
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
                        style={inputStyle(!!ownerErrors.birthDate)}
                      />
                    </Field>
                    <Field label="JENIS KELAMIN *" error={ownerErrors.gender}>
                      <select
                        value={ownerGender}
                        onChange={(e) => {
                          setOwnerGender(e.target.value)
                          setOwnerErrors((prev) => ({ ...prev, gender: "" }))
                        }}
                        style={inputStyle(!!ownerErrors.gender)}
                      >
                        <option value="">Pilih</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </Field>
                    <Box sx={{ gridColumn: { xs: "1", sm: "span 2" } }}>
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
                          style={{
                            ...inputStyle(!!ownerErrors.address),
                            resize: "vertical"
                          }}
                        />
                      </Field>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderTop: `1px solid ${p.border}`,
              bgcolor: p.bg,
              display: "flex",
              gap: 1.5,
              justifyContent: "flex-end",
              flexShrink: 0
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "9px 20px",
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
              onClick={activeTab === "store" ? saveStore : saveOwner}
              disabled={isSaving}
              style={{
                padding: "9px 24px",
                border: "none",
                borderRadius: 6,
                background: isSaving ? "#64748b" : "#1e3a8a",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                cursor: isSaving ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: isSaving ? 0.8 : 1
              }}
            >
              {isSaving && (
                <Box
                  sx={{
                    width: 13,
                    height: 13,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                  }}
                />
              )}
              {isSaving
                ? "Menyimpan..."
                : `Simpan ${activeTab === "store" ? "Data Toko" : "Data Pemilik"}`}
            </button>
          </Box>
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
          sx={{ fontFamily: "'Nunito', sans-serif", fontSize: 13 }}
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

  const p = useMemo(
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

  const T = "0.3s ease"

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
    boxSizing: "border-box"
  }

  return (
    <ThemeProvider theme={theme}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: p.bg,
          fontFamily: "'Nunito', sans-serif",
          transition: `background-color ${T}`
        }}
      >
        {/* Drawer Mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": drawerPaperSx()
          }}
        >
          <Sidebar isDark={isDark} T={T} />
        </Drawer>
        {/* Drawer Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": drawerPaperSx()
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
            title="Settings"
            showAddButton={false}
            notificationCount={0}
          />

          <Box
            sx={{ flex: 1, overflow: "auto", p: { xs: "12px", sm: "16px" } }}
          >
            {/* Page Title */}
            <Box sx={{ mb: 3 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 800,
                  color: p.textPrimary,
                  fontFamily: "'Nunito', sans-serif"
                }}
              >
                Pengaturan Toko
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 12,
                  color: p.textMuted,
                  fontFamily: "'Nunito', sans-serif"
                }}
              >
                Kelola dan edit data semua toko yang terdaftar
              </p>
            </Box>

            {/* Stat Cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2,1fr)",
                  sm: "repeat(4,1fr)"
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
                      fontSize: 26,
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

            {/* Main Card */}
            <Box
              sx={{
                border: `1px solid ${p.border}`,
                bgcolor: p.bgPaper,
                borderRadius: "8px",
                overflow: "hidden"
              }}
            >
              {/* Filter Bar */}
              <Box
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: 2,
                  borderBottom: `1px solid ${p.border}`,
                  bgcolor: p.bg
                }}
              >
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
                  </Box>
                  <input
                    type="text"
                    placeholder="Cari nama toko, ID, kota, pemilik..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 32 }}
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Box sx={{ flex: "1 1 130px", minWidth: 0 }}>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="all">Semua Status</option>
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </Box>
                  <button
                    onClick={() => router.push("/registration")}
                    style={{
                      display: "flex",
                      alignItems: "center",
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
                </Box>
              </Box>

              {/* Mobile Card List */}
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
                  ) : filtered.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: "center" }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14,
                          color: p.textMuted,
                          fontFamily: "'Nunito', sans-serif"
                        }}
                      >
                        {search || filterStatus !== "all"
                          ? "Tidak ada toko yang sesuai filter"
                          : "Belum ada toko terdaftar"}
                      </p>
                    </Box>
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
                </Box>
              ) : (
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
                            style={{
                              padding: "10px 16px",
                              textAlign: "left",
                              fontSize: 10,
                              fontWeight: 700,
                              color: p.textMuted,
                              letterSpacing: "0.08em",
                              whiteSpace: "nowrap"
                            }}
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
                              <td key={j} style={{ padding: "14px 16px" }}>
                                <Skeleton
                                  variant="text"
                                  width={j === 1 ? "80%" : "60%"}
                                  height={14}
                                  sx={{
                                    bgcolor: isDark ? "#1f1f1f" : "#f1f5f9"
                                  }}
                                />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : filtered.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
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
                                    onClick={() =>
                                      store.storeImageUrl &&
                                      setPreviewImage({
                                        url: store.storeImageUrl,
                                        title: store.storeName
                                      })
                                    }
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
                                      flexShrink: 0,
                                      cursor: store.storeImageUrl
                                        ? "pointer"
                                        : "default"
                                    }}
                                  >
                                    {store.storeImageUrl ? (
                                      <Image
                                        src={store.storeImageUrl}
                                        alt={store.storeName}
                                        width={32}
                                        height={32}
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                          borderRadius: 6
                                        }}
                                      />
                                    ) : (
                                      "🏪"
                                    )}
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
                                <button
                                  onClick={() => openEdit(store)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                    padding: "6px 14px",
                                    border: `1px solid ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                                    borderRadius: 6,
                                    background: isDark ? "#0d1f3c" : "#e6f1fb",
                                    color: isDark ? "#60a5fa" : "#1e3a8a",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: "'Nunito', sans-serif",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap"
                                  }}
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
                </Box>
              )}

              {/* Footer count */}
              {!loading && filtered.length > 0 && (
                <Box
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderTop: `1px solid ${p.border}`,
                    bgcolor: p.tableHeadBg
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: p.textMuted,
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  >
                    Menampilkan{" "}
                    <strong style={{ color: p.textSecondary }}>
                      {filtered.length}
                    </strong>{" "}
                    dari{" "}
                    <strong style={{ color: p.textSecondary }}>
                      {stores.length}
                    </strong>{" "}
                    toko
                  </span>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
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
          sx={{ fontFamily: "'Nunito', sans-serif", fontSize: 13 }}
        >
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  )
}
