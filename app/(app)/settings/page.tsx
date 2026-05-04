"use client"

import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import {
  Box,
  Drawer,
  ThemeProvider,
  createTheme,
  Snackbar,
  Alert,
  Modal,
  Skeleton
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

type SettingsTab = "store" | "owner"

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: "store", label: "Data Toko", icon: "🏪" },
  { id: "owner", label: "Data Pemilik", icon: "👤" }
]

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

function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  isDeleting,
  isDark,
  p
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  isDeleting: boolean
  isDark: boolean
  p: Record<string, string>
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
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
            py: 2.5,
            borderBottom: `1px solid ${p.border}`,
            bgcolor: p.bg,
            display: "flex",
            alignItems: "center",
            gap: 1.5
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              bgcolor: isDark ? "#2e1010" : "#fef2f2",
              border: `1px solid ${isDark ? "#5a1a1a" : "#fecaca"}`,
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15
            }}
          >
            🗑️
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
        <Box sx={{ p: 3 }}>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 13,
              color: p.textSecondary,
              fontFamily: "'Nunito', sans-serif",
              lineHeight: 1.6
            }}
          >
            {description}
          </p>
          <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              disabled={isDeleting}
              style={{
                padding: "8px 18px",
                border: `1px solid ${p.border}`,
                borderRadius: 6,
                background: "transparent",
                color: p.textSecondary,
                fontSize: 13,
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
                padding: "8px 18px",
                border: "none",
                borderRadius: 6,
                background: "#ef4444",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                cursor: isDeleting ? "not-allowed" : "pointer",
                opacity: isDeleting ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              {isDeleting && (
                <span
                  style={{
                    width: 12,
                    height: 12,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.8s linear infinite"
                  }}
                />
              )}
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

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
  onUploaded: (url: string) => void
  title: string
  icon: string
  isDark: boolean
  p: Record<string, string>
}) {
  type ImgMode = "upload" | "camera"
  type ImgStatus = "idle" | "uploading" | "success" | "error"

  const [mode, setMode] = useState<ImgMode>("upload")
  const [status, setStatus] = useState<ImgStatus>("idle")
  const [error, setError] = useState("")
  const [preview, setPreview] = useState("")
  const [camActive, setCamActive] = useState(false)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCam, setSelectedCam] = useState("")

  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const isKtp = title.toLowerCase().includes("ktp")
  const apiEndpoint = isKtp ? "/api/upload/ktp" : "/api/upload/store-image"

  const stopCam = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCamActive(false)
  }, [])

  const startCam = async (deviceId?: string) => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: 1280, height: 720 }
          : { facingMode: "environment", width: 1280, height: 720 }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () =>
          videoRef.current?.play().catch(() => {})
      }
      const devices = await navigator.mediaDevices.enumerateDevices()
      setCameras(devices.filter((d) => d.kind === "videoinput"))
      setSelectedCam(stream.getVideoTracks()[0].getSettings().deviceId || "")
      setCamActive(true)
    } catch {
      setError("Tidak dapat mengakses kamera.")
    }
  }

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
      if (!res.ok) throw new Error(result.error || "Gagal upload gambar")
      onUploaded(result.url)
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

  const capture = async () => {
    if (!videoRef.current || !canvasRef.current) return
    const v = videoRef.current,
      c = canvasRef.current
    c.width = v.videoWidth
    c.height = v.videoHeight
    c.getContext("2d")?.drawImage(v, 0, 0)
    c.toBlob(
      async (blob) => {
        if (!blob) return
        stopCam()
        setPreview(c.toDataURL("image/jpeg"))
        await upload(blob, "image/jpeg")
      },
      "image/jpeg",
      0.9
    )
  }

  const handleClose = () => {
    stopCam()
    onClose()
    setStatus("idle")
    setError("")
    setPreview("")
    setMode("upload")
    setCameras([])
    setSelectedCam("")
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: { xs: "95vw", sm: 520 },
          maxHeight: { xs: "90vh", sm: "85vh" },
          bgcolor: p.bgPaper,
          border: `1px solid ${p.border}`,
          borderRadius: "10px",
          boxShadow: p.menuShadow,
          outline: "none",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column"
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
            justifyContent: "space-between",
            flexShrink: 0
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
                {title}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: p.textMuted,
                  fontFamily: "'Nunito', sans-serif"
                }}
              >
                Upload atau gunakan kamera
              </p>
            </Box>
          </Box>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: p.textMuted,
              fontSize: 18,
              lineHeight: 1,
              padding: 4
            }}
          >
            ✕
          </button>
        </Box>

        <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              p: 0.5,
              bgcolor: p.bg,
              border: `1px solid ${p.border}`,
              borderRadius: "6px",
              mb: 3
            }}
          >
            {(["upload", "camera"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m)
                  if (m === "upload") stopCam()
                }}
                style={{
                  flex: 1,
                  padding: "7px 12px",
                  border: `1px solid ${mode === m ? (isDark ? "#1e3a8a" : "#b5d4f4") : "transparent"}`,
                  borderRadius: "4px",
                  background:
                    mode === m
                      ? isDark
                        ? "#0d1f3c"
                        : "#e6f1fb"
                      : "transparent",
                  color: mode === m ? "#1e3a8a" : p.textSecondary,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'Nunito', sans-serif",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {m === "upload" ? "📎 Upload File" : "📷 Kamera"}
              </button>
            ))}
          </Box>

          {mode === "upload" && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFile}
                style={{ display: "none" }}
              />
              {!preview ? (
                <Box
                  onClick={() =>
                    status !== "uploading" && fileRef.current?.click()
                  }
                  sx={{
                    border: `1.5px dashed ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                    borderRadius: "8px",
                    py: 5,
                    textAlign: "center",
                    cursor: status === "uploading" ? "not-allowed" : "pointer",
                    opacity: status === "uploading" ? 0.5 : 1,
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
                <Box sx={{ position: "relative" }}>
                  <Image
                    src={preview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      border: `1px solid ${p.border}`,
                      maxHeight: 220,
                      objectFit: "cover"
                    }}
                  />
                  {status !== "uploading" && status !== "success" && (
                    <button
                      onClick={() => {
                        setPreview("")
                        setStatus("idle")
                        setError("")
                      }}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "rgba(0,0,0,0.5)",
                        border: "none",
                        borderRadius: "50%",
                        width: 28,
                        height: 28,
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 12
                      }}
                    >
                      ✕
                    </button>
                  )}
                </Box>
              )}
            </>
          )}

          {mode === "camera" && (
            <Box>
              <Box
                sx={{
                  position: "relative",
                  bgcolor: "#000",
                  borderRadius: "8px",
                  overflow: "hidden",
                  aspectRatio: { xs: "4/3", sm: "16/9" },
                  minHeight: { xs: 220, sm: "auto" },
                  mb: 1.5
                }}
              >
                <video
                  ref={videoRef}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block"
                  }}
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                {!camActive && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1
                    }}
                  >
                    <p
                      style={{
                        color: "#888",
                        fontSize: 12,
                        fontFamily: "'Nunito', sans-serif",
                        margin: 0
                      }}
                    >
                      Kamera belum aktif
                    </p>
                    <button
                      onClick={() => startCam()}
                      style={{
                        background: "#1e3a8a",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "8px 20px",
                        fontSize: 13,
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      Aktifkan Kamera
                    </button>
                  </Box>
                )}
                {camActive && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 16,
                      border: "2px solid rgba(59,130,246,0.6)",
                      borderRadius: "4px",
                      pointerEvents: "none"
                    }}
                  />
                )}
              </Box>
              {camActive && cameras.length > 1 && (
                <Box sx={{ mb: 1.5 }}>
                  <select
                    value={selectedCam}
                    onChange={(e) => {
                      setSelectedCam(e.target.value)
                      startCam(e.target.value)
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: `1px solid ${p.border}`,
                      background: isDark ? "#111" : "#fff",
                      color: p.textPrimary,
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 13,
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    {cameras.map((cam, idx) => (
                      <option key={cam.deviceId} value={cam.deviceId}>
                        {cam.label ||
                          (idx === 0
                            ? "Kamera Belakang"
                            : idx === 1
                              ? "Kamera Depan"
                              : `Kamera ${idx + 1}`)}
                      </option>
                    ))}
                  </select>
                </Box>
              )}
              {camActive && (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <button
                    onClick={capture}
                    disabled={status === "uploading"}
                    style={{
                      flex: 1,
                      background: "#1e3a8a",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "9px",
                      fontSize: 13,
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 700,
                      cursor: "pointer",
                      opacity: status === "uploading" ? 0.6 : 1
                    }}
                  >
                    📸 Ambil Foto
                  </button>
                  <button
                    onClick={stopCam}
                    style={{
                      padding: "9px 16px",
                      border: `1px solid ${p.border}`,
                      borderRadius: 6,
                      background: "transparent",
                      color: p.textSecondary,
                      fontSize: 13,
                      fontFamily: "'Nunito', sans-serif",
                      cursor: "pointer"
                    }}
                  >
                    Batal
                  </button>
                </Box>
              )}
            </Box>
          )}

          {status === "uploading" && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mt: 2.5,
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
                  animation: "spin 0.8s linear infinite",
                  flexShrink: 0
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
                mt: 2.5,
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
                mt: 2.5,
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

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<SettingsTab>("store")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    msg: string
    severity: "success" | "error"
  }>({ open: false, msg: "", severity: "success" })

  const [storeId, setStoreId] = useState("")
  const [storeName, setStoreName] = useState("")
  const [storeType, setStoreType] = useState("")
  const [storePhone, setStorePhone] = useState("")
  const [storeEmail, setStoreEmail] = useState("")
  const [storeAddress, setStoreAddress] = useState("")
  const [storeImageUrl, setStoreImageUrl] = useState("")
  const [storeLat, setStoreLat] = useState("")
  const [storeLng, setStoreLng] = useState("")
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION)
  const [locationErrors, setLocationErrors] = useState<
    Partial<Record<keyof LocationValue, string>>
  >({})
  const [storeErrors, setStoreErrors] = useState<Record<string, string>>({})

  const [ownerNik, setOwnerNik] = useState("")
  const [ownerFullName, setOwnerFullName] = useState("")
  const [ownerBirthDate, setOwnerBirthDate] = useState("")
  const [ownerAddress, setOwnerAddress] = useState("")
  const [ownerGender, setOwnerGender] = useState("")
  const [ownerKtpUrl, setOwnerKtpUrl] = useState("")
  const [ownerErrors, setOwnerErrors] = useState<Record<string, string>>({})

  const [storeImgModalOpen, setStoreImgModalOpen] = useState(false)
  const [ktpModalOpen, setKtpModalOpen] = useState(false)
  const [deleteStoreImgOpen, setDeleteStoreImgOpen] = useState(false)
  const [deleteKtpOpen, setDeleteKtpOpen] = useState(false)
  const [isDeletingStoreImg, setIsDeletingStoreImg] = useState(false)
  const [isDeletingKtp, setIsDeletingKtp] = useState(false)

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
      menuShadow: isDark
        ? "0 8px 32px rgba(0,0,0,0.8)"
        : "0 8px 32px rgba(0,0,0,0.12)"
    }),
    [isDark]
  )

  const T = "0.3s ease"

  // ── Same drawerPaperSx as registration page ──────────────
  const drawerPaperSx = () => ({
    width: DRAWER_WIDTH,
    boxSizing: "border-box" as const,
    bgcolor: "transparent",
    border: "none",
    overflow: "hidden"
  })

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "10px 12px",
    borderRadius: 6,
    border: `1px solid ${hasError ? "#ef4444" : p.border}`,
    background: isDark ? "#111" : "#fff",
    color: p.textPrimary,
    fontFamily: "'Nunito', sans-serif",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s"
  })

  const spinnerSx = {
    width: 14,
    height: 14,
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    "@keyframes spin": {
      from: { transform: "rotate(0deg)" },
      to: { transform: "rotate(360deg)" }
    }
  }

  // ── LOAD ─────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/stores/my")
        if (!res.ok) throw new Error("Gagal mengambil data toko")
        const data = await res.json()
        const s = data.store

        setStoreId(s.storeId || "")
        setStoreName(s.storeName || "")
        setStoreType(s.storeType || "")
        setStorePhone(s.storePhone || "")
        setStoreEmail(s.storeEmail || "")
        setStoreAddress(s.storeAddress || "")
        setStoreImageUrl(s.storeImageUrl || "")
        setStoreLat(s.storeLat || "")
        setStoreLng(s.storeLng || "")
        setLocation({
          provinsiKd: s.storeProvinsiKd || "",
          provinsiNama: s.storeProvince || "",
          kotaKd: s.storeKotaKd || "",
          kotaNama: s.storeCity || "",
          kecamatanKd: s.storeKecamatanKd || "",
          kecamatanNama: s.storeDistrict || "",
          kelurahanKd: s.storeKelurahanKd || "",
          kelurahanNama: s.storeVillage || "",
          kodePos: s.storePostalCode || ""
        })

        const o = s.owner || {}
        setOwnerNik(o.nik || "")
        setOwnerFullName(o.fullName || "")
        setOwnerBirthDate(o.birthDate || "")
        setOwnerAddress(o.address || "")
        setOwnerGender(o.gender || "")
        setOwnerKtpUrl(o.ktpImageUrl || "")
      } catch {
        setSnackbar({
          open: true,
          msg: "Gagal memuat data toko.",
          severity: "error"
        })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // ── VALIDATE ─────────────────────────────────────────────
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

  // ── SAVE STORE ───────────────────────────────────────────
  const saveStore = async () => {
    if (!validateStore()) return
    setIsSaving(true)
    try {
      const payload = {
        storeName,
        storeType,
        storePhone,
        storeEmail,
        storeAddress,
        storeImageUrl,
        storeLat,
        storeLng,
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
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan")
      setSnackbar({
        open: true,
        msg: "✅ Data toko berhasil disimpan!",
        severity: "success"
      })
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

  // ── SAVE OWNER ───────────────────────────────────────────
  const saveOwner = async () => {
    if (!validateOwner()) return
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
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan")
      setSnackbar({
        open: true,
        msg: "✅ Data pemilik berhasil disimpan!",
        severity: "success"
      })
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

  // ── DELETE IMAGE ─────────────────────────────────────────
  const extractPublicId = (url: string) => {
    const parts = url.split("/upload/")
    if (parts.length < 2) return null
    return parts[1].replace(/^v\d+\//, "").replace(/\.[^/.]+$/, "")
  }

  const deleteCloudinaryImage = async (url: string) => {
    const publicId = extractPublicId(url)
    if (!publicId) return
    const res = await fetch("/api/upload/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId })
    })
    if (!res.ok) {
      const r = await res.json()
      throw new Error(r.error || "Gagal menghapus dari Cloudinary")
    }
  }

  const handleDeleteStoreImg = async () => {
    setIsDeletingStoreImg(true)
    try {
      if (storeImageUrl) await deleteCloudinaryImage(storeImageUrl)
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeImageUrl: "" })
      })
      if (!res.ok) throw new Error("Gagal update data toko")
      setStoreImageUrl("")
      setDeleteStoreImgOpen(false)
      setSnackbar({
        open: true,
        msg: "🗑️ Foto toko berhasil dihapus!",
        severity: "success"
      })
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        msg: err instanceof Error ? err.message : "Terjadi kesalahan",
        severity: "error"
      })
    } finally {
      setIsDeletingStoreImg(false)
    }
  }

  const handleDeleteKtp = async () => {
    setIsDeletingKtp(true)
    try {
      if (ownerKtpUrl) await deleteCloudinaryImage(ownerKtpUrl)
      const payload = {
        owner: {
          nik: ownerNik,
          fullName: ownerFullName,
          birthDate: ownerBirthDate,
          address: ownerAddress,
          gender: ownerGender,
          ktpImageUrl: ""
        }
      }
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error("Gagal update data pemilik")
      setOwnerKtpUrl("")
      setDeleteKtpOpen(false)
      setSnackbar({
        open: true,
        msg: "🗑️ Foto KTP berhasil dihapus!",
        severity: "success"
      })
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        msg: err instanceof Error ? err.message : "Terjadi kesalahan",
        severity: "error"
      })
    } finally {
      setIsDeletingKtp(false)
    }
  }

  const SectionHeader = ({ label }: { label: string }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
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

  const renderSkeleton = () => (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          mb: 3,
          pb: 3,
          borderBottom: `1px solid ${p.border}`
        }}
      >
        <Skeleton
          variant="circular"
          width={90}
          height={90}
          sx={{ bgcolor: isDark ? "#1f1f1f" : "#e2e8f0", flexShrink: 0 }}
        />
        <Box sx={{ flex: 1 }}>
          <Skeleton
            variant="text"
            width="60%"
            height={20}
            sx={{ bgcolor: isDark ? "#1f1f1f" : "#e2e8f0", mb: 1 }}
          />
          <Skeleton
            variant="text"
            width="40%"
            height={14}
            sx={{ bgcolor: isDark ? "#1f1f1f" : "#e2e8f0", mb: 1.5 }}
          />
          <Skeleton
            variant="rounded"
            width={100}
            height={30}
            sx={{ bgcolor: isDark ? "#1f1f1f" : "#e2e8f0" }}
          />
        </Box>
      </Box>
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ mb: 2.5 }}>
          <Skeleton
            variant="text"
            width={80}
            height={14}
            sx={{ bgcolor: isDark ? "#1f1f1f" : "#e2e8f0", mb: 1 }}
          />
          <Skeleton
            variant="rounded"
            width="100%"
            height={42}
            sx={{ bgcolor: isDark ? "#1f1f1f" : "#e2e8f0" }}
          />
        </Box>
      ))}
    </Box>
  )

  return (
    <ThemeProvider theme={theme}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* ── Root: identical pattern to registration page ── */}
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

        {/* Main — identical to registration page */}
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
            title="Pengaturan"
            showAddButton={false}
            notificationCount={0}
            p={p}
          />

          <Box sx={{ flex: 1, overflow: "auto", p: "16px" }}>
            <Box sx={{ width: "100%" }}>
              {/* Page title */}
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
                  Kelola informasi toko dan data pemilik Anda
                  {storeId && (
                    <span
                      style={{
                        marginLeft: 8,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: isDark ? "#0d1f3c" : "#e6f1fb",
                        color: "#1e3a8a",
                        fontWeight: 700,
                        fontSize: 11
                      }}
                    >
                      ID: {storeId}
                    </span>
                  )}
                </p>
              </Box>

              {/* Tab Nav */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  mb: 3,
                  border: `1px solid ${p.border}`,
                  borderRadius: "8px",
                  overflow: "hidden"
                }}
              >
                {TABS.map((tab, idx) => (
                  <Box
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1.5,
                      px: { xs: 2, sm: 3 },
                      py: 1.5,
                      borderRight: idx === 0 ? `1px solid ${p.border}` : "none",
                      bgcolor:
                        activeTab === tab.id
                          ? isDark
                            ? "#0d1f3c"
                            : "#e6f1fb"
                          : p.bgPaper,
                      transition: `background-color ${T}`,
                      cursor: "pointer"
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{tab.icon}</span>
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

              {/* Form Card */}
              <Box
                sx={{
                  border: `1px solid ${p.border}`,
                  bgcolor: p.bgPaper,
                  borderRadius: "8px",
                  overflow: "hidden",
                  transition: `background-color ${T}, border-color ${T}`
                }}
              >
                {/* Card Header */}
                <Box
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: 2,
                    borderBottom: `1px solid ${p.border}`,
                    bgcolor: p.bg,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5
                  }}
                >
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
                    {activeTab === "store" ? "🏪" : "👤"}
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
                      {activeTab === "store"
                        ? "Informasi Toko"
                        : "Data Pemilik Toko"}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: p.textMuted,
                        fontFamily: "'Nunito', sans-serif"
                      }}
                    >
                      {activeTab === "store"
                        ? "Edit dan perbarui informasi toko Anda"
                        : "Edit data pemilik sesuai KTP"}
                    </p>
                  </Box>
                </Box>

                {isLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    {/* ════ TAB: STORE ════ */}
                    {activeTab === "store" && (
                      <Box sx={{ p: { xs: 2, sm: 3 } }}>
                        {/* FOTO TOKO */}
                        <Box
                          sx={{
                            mb: 3,
                            pb: 3,
                            borderBottom: `1px solid ${p.border}`
                          }}
                        >
                          <SectionHeader label="FOTO TOKO" />
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 3
                            }}
                          >
                            <Box sx={{ position: "relative", flexShrink: 0 }}>
                              <Box
                                onClick={() => setStoreImgModalOpen(true)}
                                sx={{
                                  width: 90,
                                  height: 90,
                                  borderRadius: "50%",
                                  border: storeImageUrl
                                    ? `3px solid #16a34a`
                                    : `2.5px dashed ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                                  overflow: "hidden",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: isDark ? "#0d1f3c" : "#eff6ff",
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    borderColor: "#1e3a8a",
                                    transform: "scale(1.04)"
                                  }
                                }}
                              >
                                {storeImageUrl ? (
                                  <Image
                                    src={storeImageUrl}
                                    alt="Foto Toko"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover"
                                    }}
                                  />
                                ) : (
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: 9,
                                      color: isDark ? "#93c5fd" : "#1e3a8a",
                                      fontFamily: "'Nunito', sans-serif",
                                      fontWeight: 700
                                    }}
                                  >
                                    FOTO
                                  </p>
                                )}
                              </Box>
                              <Box
                                onClick={() => setStoreImgModalOpen(true)}
                                sx={{
                                  position: "absolute",
                                  bottom: 2,
                                  right: 2,
                                  width: 26,
                                  height: 26,
                                  borderRadius: "50%",
                                  bgcolor: "#1e3a8a",
                                  border: `2px solid ${p.bgPaper}`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  fontSize: 12,
                                  "&:hover": { bgcolor: "#2563eb" },
                                  transition: "all 0.2s"
                                }}
                              >
                                📷
                              </Box>
                            </Box>

                            <Box sx={{ flex: 1 }}>
                              <p
                                style={{
                                  margin: "0 0 2px",
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: p.textPrimary,
                                  fontFamily: "'Nunito', sans-serif"
                                }}
                              >
                                Foto Toko
                                <span
                                  style={{
                                    marginLeft: 6,
                                    fontSize: 11,
                                    fontWeight: 400,
                                    color: p.textMuted
                                  }}
                                >
                                  (opsional)
                                </span>
                              </p>
                              {storeImageUrl ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mt: 0.5
                                  }}
                                >
                                  <span
                                    style={{ fontSize: 11, color: "#16a34a" }}
                                  >
                                    ✓
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      color: "#16a34a",
                                      fontFamily: "'Nunito', sans-serif",
                                      fontWeight: 600
                                    }}
                                  >
                                    Foto tersedia
                                  </span>
                                </Box>
                              ) : (
                                <p
                                  style={{
                                    margin: "2px 0 0",
                                    fontSize: 11,
                                    color: p.textMuted,
                                    fontFamily: "'Nunito', sans-serif"
                                  }}
                                >
                                  JPG, PNG, WEBP · Maks 5MB
                                </p>
                              )}
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  mt: 1.5,
                                  flexWrap: "wrap"
                                }}
                              >
                                <button
                                  onClick={() => setStoreImgModalOpen(true)}
                                  style={{
                                    padding: "5px 14px",
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
                                    onClick={() => setDeleteStoreImgOpen(true)}
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
                                    🗑️ Hapus
                                  </button>
                                )}
                              </Box>
                              {storeImageUrl && (
                                <a
                                  href={storeImageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    marginTop: 8,
                                    fontSize: 11,
                                    color: "#1e3a8a",
                                    fontFamily: "'Nunito', sans-serif",
                                    textDecoration: "none",
                                    fontWeight: 600
                                  }}
                                >
                                  🔗 Lihat foto ↗
                                </a>
                              )}
                            </Box>
                          </Box>
                        </Box>

                        {/* INFORMASI UMUM */}
                        <Box
                          sx={{
                            mb: 3,
                            pb: 3,
                            borderBottom: `1px solid ${p.border}`
                          }}
                        >
                          <SectionHeader label="INFORMASI UMUM" />
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: {
                                xs: "1fr",
                                sm: "1fr 1fr",
                                md: "1fr 1fr 1fr"
                              },
                              gap: { xs: 2, sm: 2.5 }
                            }}
                          >
                            <Box
                              sx={{
                                gridColumn: {
                                  xs: "1",
                                  sm: "span 2",
                                  md: "span 3"
                                }
                              }}
                            >
                              <Field
                                label="NAMA TOKO *"
                                error={storeErrors.storeName}
                              >
                                <input
                                  type="text"
                                  placeholder="Nama toko Anda"
                                  value={storeName}
                                  onChange={(e) => {
                                    setStoreName(e.target.value)
                                    setStoreErrors((p) => ({
                                      ...p,
                                      storeName: ""
                                    }))
                                  }}
                                  style={inputStyle(!!storeErrors.storeName)}
                                />
                              </Field>
                            </Box>
                            <Field
                              label="JENIS TOKO *"
                              error={storeErrors.storeType}
                            >
                              <select
                                value={storeType}
                                onChange={(e) => {
                                  setStoreType(e.target.value)
                                  setStoreErrors((p) => ({
                                    ...p,
                                    storeType: ""
                                  }))
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
                                  setStoreErrors((p) => ({
                                    ...p,
                                    storePhone: ""
                                  }))
                                }}
                                style={inputStyle(!!storeErrors.storePhone)}
                              />
                            </Field>
                            <Field label="EMAIL TOKO">
                              <input
                                type="email"
                                placeholder="email@toko.com (opsional)"
                                value={storeEmail}
                                onChange={(e) => setStoreEmail(e.target.value)}
                                style={inputStyle(false)}
                              />
                            </Field>
                            <Box
                              sx={{
                                gridColumn: {
                                  xs: "1",
                                  sm: "span 2",
                                  md: "span 3"
                                }
                              }}
                            >
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
                                    setStoreErrors((p) => ({
                                      ...p,
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

                        {/* KOORDINAT */}
                        {(storeLat || storeLng) && (
                          <Box
                            sx={{
                              mb: 3,
                              pb: 3,
                              borderBottom: `1px solid ${p.border}`
                            }}
                          >
                            <SectionHeader label="KOORDINAT LOKASI" />
                            <Box
                              sx={{
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                                alignItems: "center"
                              }}
                            >
                              <Box sx={{ display: "flex", gap: 2 }}>
                                <Box
                                  sx={{
                                    px: 2,
                                    py: 1,
                                    bgcolor: p.bg,
                                    border: `1px solid ${p.border}`,
                                    borderRadius: "6px"
                                  }}
                                >
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: 10,
                                      color: p.textMuted,
                                      fontFamily: "'Nunito', sans-serif"
                                    }}
                                  >
                                    LAT
                                  </p>
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: 13,
                                      fontWeight: 700,
                                      color: p.textPrimary,
                                      fontFamily: "'Nunito', sans-serif"
                                    }}
                                  >
                                    {parseFloat(storeLat).toFixed(6)}
                                  </p>
                                </Box>
                                <Box
                                  sx={{
                                    px: 2,
                                    py: 1,
                                    bgcolor: p.bg,
                                    border: `1px solid ${p.border}`,
                                    borderRadius: "6px"
                                  }}
                                >
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: 10,
                                      color: p.textMuted,
                                      fontFamily: "'Nunito', sans-serif"
                                    }}
                                  >
                                    LNG
                                  </p>
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: 13,
                                      fontWeight: 700,
                                      color: p.textPrimary,
                                      fontFamily: "'Nunito', sans-serif"
                                    }}
                                  >
                                    {parseFloat(storeLng).toFixed(6)}
                                  </p>
                                </Box>
                              </Box>
                              <a
                                href={`https://www.google.com/maps?q=${storeLat},${storeLng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: 12,
                                  color: "#1e3a8a",
                                  fontFamily: "'Nunito', sans-serif",
                                  textDecoration: "none",
                                  fontWeight: 700
                                }}
                              >
                                🗺️ Buka Google Maps ↗
                              </a>
                            </Box>
                          </Box>
                        )}

                        {/* WILAYAH */}
                        <Box
                          sx={{
                            mb: 3,
                            pb: 3,
                            borderBottom: `1px solid ${p.border}`
                          }}
                        >
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

                        {/* Save */}
                        <Box
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          <button
                            onClick={saveStore}
                            disabled={isSaving}
                            style={{
                              background: isSaving ? "#64748b" : "#1e3a8a",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                              padding: "10px 28px",
                              fontSize: 14,
                              fontWeight: 700,
                              fontFamily: "'Nunito', sans-serif",
                              cursor: isSaving ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              opacity: isSaving ? 0.8 : 1,
                              width: "100%"
                            }}
                          >
                            {isSaving && <Box sx={spinnerSx} />}
                            {isSaving ? "Menyimpan..." : "💾 Simpan Perubahan"}
                          </button>
                        </Box>
                      </Box>
                    )}

                    {/* ════ TAB: OWNER ════ */}
                    {activeTab === "owner" && (
                      <Box sx={{ p: { xs: 2, sm: 3 } }}>
                        {/* FOTO KTP */}
                        <Box
                          sx={{
                            mb: 3,
                            pb: 3,
                            borderBottom: `1px solid ${p.border}`
                          }}
                        >
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
                                  style={{
                                    width: 200,
                                    height: 125,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                    border: `2px solid #16a34a`,
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
                                      width: 26,
                                      height: 26,
                                      bgcolor: "#1e3a8a",
                                      borderRadius: "50%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      fontSize: 12,
                                      "&:hover": { bgcolor: "#2563eb" }
                                    }}
                                  >
                                    📷
                                  </Box>
                                  <Box
                                    onClick={() => setDeleteKtpOpen(true)}
                                    sx={{
                                      width: 26,
                                      height: 26,
                                      bgcolor: "#ef4444",
                                      borderRadius: "50%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      fontSize: 12,
                                      "&:hover": { bgcolor: "#dc2626" }
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
                                  width: 200,
                                  height: 125,
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
                                  "&:hover": { borderColor: "#1e3a8a" },
                                  transition: "all 0.2s"
                                }}
                              >
                                <span style={{ fontSize: 24 }}>🪪</span>
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
                            <Box sx={{ flex: 1, minWidth: 180 }}>
                              <p
                                style={{
                                  margin: "0 0 4px",
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: p.textPrimary,
                                  fontFamily: "'Nunito', sans-serif"
                                }}
                              >
                                Foto KTP Pemilik
                              </p>
                              <p
                                style={{
                                  margin: "0 0 12px",
                                  fontSize: 11,
                                  color: p.textMuted,
                                  fontFamily: "'Nunito', sans-serif"
                                }}
                              >
                                {ownerKtpUrl
                                  ? "KTP tersimpan di Cloudinary"
                                  : "Belum ada foto KTP."}
                              </p>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  flexWrap: "wrap"
                                }}
                              >
                                <button
                                  onClick={() => setKtpModalOpen(true)}
                                  style={{
                                    padding: "5px 14px",
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
                                  {ownerKtpUrl
                                    ? "🔄 Ganti KTP"
                                    : "📎 Upload KTP"}
                                </button>
                                {ownerKtpUrl && (
                                  <>
                                    <button
                                      onClick={() => setDeleteKtpOpen(true)}
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
                                      🗑️ Hapus
                                    </button>
                                    <a
                                      href={ownerKtpUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                        padding: "5px 12px",
                                        border: `1px solid ${p.border}`,
                                        borderRadius: 6,
                                        fontSize: 12,
                                        color: p.textSecondary,
                                        fontFamily: "'Nunito', sans-serif",
                                        textDecoration: "none",
                                        fontWeight: 600
                                      }}
                                    >
                                      🔗 Lihat ↗
                                    </a>
                                  </>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Box>

                        {/* DATA DIRI */}
                        <Box
                          sx={{
                            mb: 3,
                            pb: 3,
                            borderBottom: `1px solid ${p.border}`
                          }}
                        >
                          <SectionHeader label="DATA DIRI PEMILIK" />
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: {
                                xs: "1fr",
                                sm: "1fr 1fr",
                                md: "1fr 1fr 1fr"
                              },
                              gap: { xs: 2, sm: 2.5 }
                            }}
                          >
                            <Box
                              sx={{
                                gridColumn: {
                                  xs: "1",
                                  sm: "span 2",
                                  md: "span 3"
                                }
                              }}
                            >
                              <Field label="NIK *" error={ownerErrors.nik}>
                                <input
                                  type="text"
                                  placeholder="16 digit NIK"
                                  value={ownerNik}
                                  onChange={(e) => {
                                    setOwnerNik(
                                      e.target.value.replace(/\D/g, "")
                                    )
                                    setOwnerErrors((p) => ({ ...p, nik: "" }))
                                  }}
                                  maxLength={16}
                                  style={inputStyle(!!ownerErrors.nik)}
                                />
                              </Field>
                            </Box>
                            <Box
                              sx={{
                                gridColumn: {
                                  xs: "1",
                                  sm: "span 2",
                                  md: "span 3"
                                }
                              }}
                            >
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
                                    setOwnerErrors((p) => ({
                                      ...p,
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
                                  setOwnerErrors((p) => ({
                                    ...p,
                                    birthDate: ""
                                  }))
                                }}
                                style={inputStyle(!!ownerErrors.birthDate)}
                              />
                            </Field>
                            <Field
                              label="JENIS KELAMIN *"
                              error={ownerErrors.gender}
                            >
                              <select
                                value={ownerGender}
                                onChange={(e) => {
                                  setOwnerGender(e.target.value)
                                  setOwnerErrors((p) => ({ ...p, gender: "" }))
                                }}
                                style={inputStyle(!!ownerErrors.gender)}
                              >
                                <option value="">Pilih</option>
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                              </select>
                            </Field>
                            <Box
                              sx={{
                                gridColumn: {
                                  xs: "1",
                                  sm: "span 2",
                                  md: "span 3"
                                }
                              }}
                            >
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
                                    setOwnerErrors((p) => ({
                                      ...p,
                                      address: ""
                                    }))
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

                        {/* Save */}
                        <Box
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          <button
                            onClick={saveOwner}
                            disabled={isSaving}
                            style={{
                              background: isSaving ? "#64748b" : "#1e3a8a",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                              padding: "10px 28px",
                              fontSize: 14,
                              fontWeight: 700,
                              fontFamily: "'Nunito', sans-serif",
                              cursor: isSaving ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              opacity: isSaving ? 0.8 : 1,
                              width: "100%"
                            }}
                          >
                            {isSaving && <Box sx={spinnerSx} />}
                            {isSaving
                              ? "Menyimpan..."
                              : "💾 Simpan Data Pemilik"}
                          </button>
                        </Box>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* MODALS */}
      <ImageModal
        open={storeImgModalOpen}
        onClose={() => setStoreImgModalOpen(false)}
        onUploaded={(url) => setStoreImageUrl(url)}
        title="Ganti Foto Toko"
        icon="🏪"
        isDark={isDark}
        p={p}
      />
      <ImageModal
        open={ktpModalOpen}
        onClose={() => setKtpModalOpen(false)}
        onUploaded={(url) => setOwnerKtpUrl(url)}
        title="Upload / Ganti Foto KTP"
        icon="🪪"
        isDark={isDark}
        p={p}
      />
      <DeleteConfirmModal
        open={deleteStoreImgOpen}
        onClose={() => setDeleteStoreImgOpen(false)}
        onConfirm={handleDeleteStoreImg}
        title="Hapus Foto Toko"
        description="Foto toko akan dihapus permanen dari Cloudinary. Yakin?"
        isDeleting={isDeletingStoreImg}
        isDark={isDark}
        p={p}
      />
      <DeleteConfirmModal
        open={deleteKtpOpen}
        onClose={() => setDeleteKtpOpen(false)}
        onConfirm={handleDeleteKtp}
        title="Hapus Foto KTP"
        description="Foto KTP akan dihapus permanen dari Cloudinary. Yakin?"
        isDeleting={isDeletingKtp}
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
