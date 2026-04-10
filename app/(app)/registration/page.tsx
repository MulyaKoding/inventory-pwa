"use client"

import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Box,
  Drawer,
  ThemeProvider,
  createTheme,
  Snackbar,
  Alert,
  Modal
} from "@mui/material"
import Header from "../components/header/page"
import Sidebar from "../components/sidebar"
import { useTheme } from "../hooks/useTheme"
import CanvasMap from "./CanvasMap"

const DRAWER_WIDTH = 220

interface OwnerData {
  nik: string
  fullName: string
  birthDate: string
  address: string
  gender: string
  ktpImageUrl: string
  inputMethod: "manual" | "ocr"
}

interface StoreData {
  storeName: string
  storeType: string
  storePhone: string
  storeEmail: string
  storeAddress: string
  storeCity: string
  storeProvince: string
  storePostalCode: string
  storeLat: string
  storeLng: string
  storeLocationLabel: string
}

type OCRStatus = "idle" | "scanning" | "success" | "error"
type ScanMode = "upload" | "webcam"
type GeoStatus = "idle" | "requesting" | "granted" | "denied" | "unsupported"

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

const PROVINCES = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Kepulauan Riau",
  "Jambi",
  "Bengkulu",
  "Sumatera Selatan",
  "Kepulauan Bangka Belitung",
  "Lampung",
  "Banten",
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Gorontalo",
  "Sulawesi Tengah",
  "Sulawesi Barat",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Maluku",
  "Maluku Utara",
  "Papua Barat",
  "Papua"
]

function Field({
  label,
  error,
  children
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 700,
          color: "#64748b",
          marginBottom: 6,
          fontFamily: "'Nunito', sans-serif"
        }}
      >
        {label}
      </label>
      {children}
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

export default function RegistrationPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const { isDark, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    msg: string
    severity: "success" | "error"
  }>({ open: false, msg: "", severity: "success" })

  // KTP Modal
  const [ktpModalOpen, setKtpModalOpen] = useState(false)
  const [scanMode, setScanMode] = useState<ScanMode>("upload")
  const [ocrStatus, setOcrStatus] = useState<OCRStatus>("idle")
  const [ocrError, setOcrError] = useState("")
  const [ktpPreview, setKtpPreview] = useState<string>("")
  const [webcamActive, setWebcamActive] = useState(false)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string>("")

  // ── MAP Modal state ─────────────────────────────────────────────────────────
  const [mapModalOpen, setMapModalOpen] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    -6.2088, 106.8456
  ]) // default Jakarta
  const [mapMarker, setMapMarker] = useState<[number, number] | null>(null)
  const [mapLabel, setMapLabel] = useState("")
  const [mapQuery, setMapQuery] = useState("")
  const [mapSearchLoading, setMapSearchLoading] = useState(false)
  const [mapSearchError, setMapSearchError] = useState("")
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle")
  const [geoLoading, setGeoLoading] = useState(false)
  const [markerSource, setMarkerSource] = useState<
    "geo" | "search" | "click" | null
  >(null)
  // ────────────────────────────────────────────────────────────────────────────

  const [storeData, setStoreData] = useState<StoreData>({
    storeName: "",
    storeType: "",
    storePhone: "",
    storeEmail: "",
    storeAddress: "",
    storeCity: "",
    storeProvince: "",
    storePostalCode: "",
    storeLat: "",
    storeLng: "",
    storeLocationLabel: ""
  })
  const [ownerData, setOwnerData] = useState<OwnerData>({
    nik: "",
    fullName: "",
    birthDate: "",
    address: "",
    gender: "",
    ktpImageUrl: "",
    inputMethod: "manual"
  })
  const [storeErrors, setStoreErrors] = useState<Partial<StoreData>>({})
  const [ownerErrors, setOwnerErrors] = useState<Partial<OwnerData>>({})

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

  const updateStore = (field: keyof StoreData, value: string) => {
    setStoreData((prev) => ({ ...prev, [field]: value }))
    setStoreErrors((prev) => ({ ...prev, [field]: "" }))
  }
  const updateOwner = (field: keyof OwnerData, value: string) => {
    setOwnerData((prev) => ({ ...prev, [field]: value }))
    setOwnerErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const validateStep1 = () => {
    const errors: Partial<StoreData> = {}
    if (!storeData.storeName) errors.storeName = "Nama toko wajib diisi"
    if (!storeData.storeType) errors.storeType = "Jenis toko wajib dipilih"
    if (!storeData.storePhone) errors.storePhone = "Nomor telepon wajib diisi"
    if (!storeData.storeAddress) errors.storeAddress = "Alamat toko wajib diisi"
    if (!storeData.storeCity) errors.storeCity = "Kota wajib diisi"
    if (!storeData.storeProvince)
      errors.storeProvince = "Provinsi wajib dipilih"
    setStoreErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = () => {
    const errors: Partial<OwnerData> = {}
    if (!ownerData.nik) errors.nik = "NIK wajib diisi"
    else if (ownerData.nik.length !== 16 || !/^\d+$/.test(ownerData.nik))
      errors.nik = "NIK harus 16 digit angka"
    if (!ownerData.fullName) errors.fullName = "Nama lengkap wajib diisi"
    if (!ownerData.birthDate) errors.birthDate = "Tanggal lahir wajib diisi"
    if (!ownerData.address) errors.address = "Alamat wajib diisi"
    if (!ownerData.gender) errors.gender = "Jenis kelamin wajib dipilih"
    setOwnerErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ── MAP: Geolokasi browser ──────────────────────────────────────────────────
  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("unsupported")
      return
    }
    setGeoLoading(true)
    setGeoStatus("requesting")
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setMapCenter([lat, lng])
        setMapMarker([lat, lng])
        setGeoStatus("granted")
        setGeoLoading(false)
        // Reverse geocode via Nominatim (gratis, tanpa API key)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "id" } }
          )
          const data = await res.json()
          setMapLabel(
            data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
          )
        } catch {
          setMapLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
        }
      },
      (err) => {
        setGeoStatus(err.code === 1 ? "denied" : "idle")
        setGeoLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // ── MAP: Buka modal ─────────────────────────────────────────────────────────
  const openMapModal = () => {
    // Isi query dari data toko yang sudah diisi
    const q = [
      storeData.storeName,
      storeData.storeAddress,
      storeData.storeCity,
      storeData.storeProvince
    ]
      .filter(Boolean)
      .join(", ")
    setMapQuery(q)
    setMapSearchError("")

    // Kalau sudah ada lokasi tersimpan, pakai itu
    if (storeData.storeLat && storeData.storeLng) {
      const lat = parseFloat(storeData.storeLat)
      const lng = parseFloat(storeData.storeLng)
      setMapCenter([lat, lng])
      setMapMarker([lat, lng])
      setMapLabel(storeData.storeLocationLabel)
    } else {
      setMapMarker(null)
      setMapLabel("")
    }

    setMapModalOpen(true)

    // Otomatis minta geolokasi kalau belum pernah
    if (geoStatus === "idle" && !storeData.storeLat) {
      setTimeout(() => requestGeolocation(), 400)
    }
  }

  const closeMapModal = () => {
    setMapModalOpen(false)
    setMapSearchError("")
  }

  // ── MAP: Search via OpenAI (/api/location) ──────────────────────────────────
  const searchLocation = async () => {
    const q = mapQuery.trim()
    if (q.length < 3) return
    setMapSearchLoading(true)
    setMapSearchError("")
    try {
      const res = await fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q })
      })
      const data = await res.json()
      if (!res.ok || !data.found)
        throw new Error(data.error || "Lokasi tidak ditemukan")
      const coords: [number, number] = [data.lat, data.lng]
      setMapCenter(coords)
      setMapMarker(coords)
      setMapLabel(data.label)
    } catch (e: unknown) {
      setMapSearchError(e instanceof Error ? e.message : "Gagal mencari lokasi")
    } finally {
      setMapSearchLoading(false)
    }
  }

  // ── MAP: Klik peta untuk pindah marker ─────────────────────────────────────
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setMapMarker([lat, lng])
    // Reverse geocode
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "id" } }
      )
      const data = await res.json()
      setMapLabel(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`)
    } catch {
      setMapLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
    }
  }, [])

  // ── MAP: Simpan lokasi ──────────────────────────────────────────────────────
  const confirmLocation = () => {
    if (!mapMarker) return
    updateStore("storeLat", String(mapMarker[0]))
    updateStore("storeLng", String(mapMarker[1]))
    updateStore("storeLocationLabel", mapLabel)

    // ── Auto-fill alamat toko dari label lokasi maps ──
    if (mapLabel && !storeData.storeAddress) {
      updateStore("storeAddress", mapLabel)
    }

    setSnackbar({
      open: true,
      msg: "📍 Lokasi toko berhasil disimpan!",
      severity: "success"
    })
    closeMapModal()
  }

  // ── Webcam ──────────────────────────────────────────────────────────────────
  const startWebcam = async (deviceId?: string) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: 1280, height: 720 }
          : { facingMode: "environment", width: 1280, height: 720 }
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      const devices = await navigator.mediaDevices.enumerateDevices()
      setCameras(devices.filter((d) => d.kind === "videoinput"))
      setSelectedCameraId(
        stream.getVideoTracks()[0].getSettings().deviceId || ""
      )
      setWebcamActive(true)
    } catch {
      setOcrError("Tidak dapat mengakses kamera.")
    }
  }

  const handleCameraChange = async (deviceId: string) => {
    setSelectedCameraId(deviceId)
    await startWebcam(deviceId)
  }

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setWebcamActive(false)
  }, [])

  const closeKtpModal = () => {
    stopWebcam()
    setKtpModalOpen(false)
    setOcrStatus("idle")
    setOcrError("")
    setKtpPreview("")
    setScanMode("upload")
    setCameras([])
    setSelectedCameraId("")
  }

  const captureWebcam = async () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")?.drawImage(video, 0, 0)
    canvas.toBlob(
      async (blob) => {
        if (!blob) return
        stopWebcam()
        setKtpPreview(canvas.toDataURL("image/jpeg"))
        await processOCR(blob, "image/jpeg")
      },
      "image/jpeg",
      0.9
    )
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setKtpPreview(URL.createObjectURL(file))
    await processOCR(file, file.type)
  }

  const processOCR = async (blob: Blob, mimeType: string) => {
    setOcrStatus("scanning")
    setOcrError("")
    try {
      const arrayBuffer = await blob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      const ocrForm = new FormData()
      ocrForm.append(
        "ktp",
        new File([new Blob([uint8Array], { type: mimeType })], "ktp.jpg", {
          type: mimeType
        })
      )
      const ocrRes = await fetch("/api/ocr", { method: "POST", body: ocrForm })
      const ocrResult = await ocrRes.json()
      if (!ocrRes.ok) throw new Error(ocrResult.error || "Gagal memproses KTP")
      const uploadForm = new FormData()
      uploadForm.append(
        "file",
        new File([new Blob([uint8Array], { type: mimeType })], "ktp.jpg", {
          type: mimeType
        })
      )
      const uploadRes = await fetch("/api/upload/ktp", {
        method: "POST",
        body: uploadForm
      })
      const uploadResult = await uploadRes.json()
      const ktpImageUrl = uploadRes.ok ? uploadResult.url : ""
      const { data } = ocrResult
      setOwnerData({
        nik: data.nik || "",
        fullName: data.fullName || "",
        birthDate: data.birthDate || "",
        address: data.address || "",
        gender: data.gender || "",
        ktpImageUrl,
        inputMethod: "ocr"
      })
      setOwnerErrors({})
      setOcrStatus("success")
      setSnackbar({
        open: true,
        msg: ktpImageUrl
          ? "Data KTP berhasil terdeteksi & disimpan!"
          : "Data KTP terdeteksi (gagal upload gambar)",
        severity: ktpImageUrl ? "success" : "error"
      })
      setTimeout(() => closeKtpModal(), 1200)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan"
      setOcrError(msg)
      setOcrStatus("error")
    }
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return
    setIsSubmitting(true)
    setSubmitError("")
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...storeData, owner: ownerData })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Gagal mendaftarkan toko")
      setSnackbar({
        open: true,
        msg: "Toko berhasil didaftarkan!",
        severity: "success"
      })
      setSubmitSuccess(true)
      setTimeout(() => router.push("/dashboard"), 2000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan"
      setSubmitError(msg)
      setSnackbar({ open: true, msg, severity: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Spinner style helper
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
        {/* Sidebar Mobile */}
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

        {/* Sidebar Desktop */}
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

        {/* Main */}
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
            title="Registrasi Toko"
            showAddButton={false}
            notificationCount={0}
            p={p}
          />

          <Box sx={{ flex: 1, overflow: "auto", p: "16px" }}>
            <Box sx={{ width: "100%" }}>
              {/* ── Success ── */}
              {submitSuccess ? (
                <Box
                  sx={{
                    border: `1px solid ${p.border}`,
                    bgcolor: p.bgPaper,
                    borderRadius: "8px",
                    p: 6,
                    textAlign: "center"
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: isDark ? "#0a2e1c" : "#f0fdf4",
                      border: `1px solid ${isDark ? "#1a5c38" : "#bbf7d0"}`,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3,
                      fontSize: 24
                    }}
                  >
                    ✓
                  </Box>
                  <p
                    style={{
                      color: p.textPrimary,
                      fontWeight: 700,
                      fontSize: 16,
                      margin: "0 0 6px",
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  >
                    Toko Berhasil Didaftarkan!
                  </p>
                  <p
                    style={{
                      color: p.textMuted,
                      fontSize: 13,
                      margin: 0,
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  >
                    Mengalihkan ke dashboard...
                  </p>
                </Box>
              ) : (
                <>
                  {/* ── Stepper ── */}
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
                    {([1, 2] as const).map((s) => (
                      <Box
                        key={s}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1.5,
                          px: { xs: 2, sm: 3 },
                          py: 1.5,
                          borderRight:
                            s === 1 ? `1px solid ${p.border}` : "none",
                          bgcolor:
                            step === s
                              ? isDark
                                ? "#0d1f3c"
                                : "#e6f1fb"
                              : step > s
                                ? isDark
                                  ? "#0a2e1c"
                                  : "#f0fdf4"
                                : p.bgPaper,
                          transition: `background-color ${T}`,
                          cursor: step > s ? "pointer" : "default"
                        }}
                        onClick={() => {
                          if (step > s) setStep(s as 1 | 2)
                        }}
                      >
                        <Box
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            border: `1.5px solid ${step === s ? "#1e3a8a" : step > s ? "#16a34a" : p.border}`,
                            bgcolor:
                              step === s
                                ? "#1e3a8a"
                                : step > s
                                  ? "#16a34a"
                                  : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              fontFamily: "'Nunito', sans-serif",
                              color: step >= s ? "#fff" : p.textMuted
                            }}
                          >
                            {step > s ? "✓" : `0${s}`}
                          </span>
                        </Box>
                        <Box>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 13,
                              fontWeight: 700,
                              fontFamily: "'Nunito', sans-serif",
                              color:
                                step === s
                                  ? isDark
                                    ? "#93c5fd"
                                    : "#1e3a8a"
                                  : step > s
                                    ? "#16a34a"
                                    : p.textMuted
                            }}
                          >
                            {s === 1 ? "Data Toko" : "Data Pemilik"}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 11,
                              fontFamily: "'Nunito', sans-serif",
                              color: p.textMuted
                            }}
                          >
                            {s === 1
                              ? "Informasi toko Anda"
                              : "Data pemilik sesuai KTP"}
                          </p>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* ── Form Card ── */}
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
                        {step === 1 ? "🏪" : "👤"}
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
                          {step === 1 ? "Informasi Toko" : "Data Pemilik Toko"}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 11,
                            color: p.textMuted,
                            fontFamily: "'Nunito', sans-serif"
                          }}
                        >
                          {step === 1
                            ? "Lengkapi informasi toko Anda"
                            : "Data pemilik sesuai KTP"}
                        </p>
                      </Box>
                    </Box>

                    {/* ════════ STEP 1 ════════ */}
                    {step === 1 && (
                      <Box sx={{ p: { xs: 2, sm: 3 } }}>
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
                          {/* NAMA TOKO + tombol 🗺️ Peta */}
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
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <input
                                  type="text"
                                  placeholder="Contoh: Toko Maju Jaya"
                                  value={storeData.storeName}
                                  onChange={(e) =>
                                    updateStore("storeName", e.target.value)
                                  }
                                  style={{
                                    ...inputStyle(!!storeErrors.storeName),
                                    flex: 1
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={openMapModal}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "0 14px",
                                    flexShrink: 0,
                                    border: `1px solid ${storeData.storeLat ? "#16a34a" : isDark ? "#1e3a8a" : "#b5d4f4"}`,
                                    borderRadius: 6,
                                    background: storeData.storeLat
                                      ? "linear-gradient(135deg,#15803d,#16a34a)"
                                      : "linear-gradient(135deg,#1e3a8a,#2563eb)",
                                    boxShadow: storeData.storeLat
                                      ? "0 4px 12px rgba(22,163,74,.3)"
                                      : "0 4px 12px rgba(59,130,246,.25)",
                                    color: "#fff",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    fontFamily: "'Nunito', sans-serif",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    height: 42,
                                    transition: "all 0.25s"
                                  }}
                                >
                                  {storeData.storeLat ? "✓ Lokasi" : "Peta"}
                                </button>
                              </Box>
                            </Field>

                            {/* Badge lokasi tersimpan */}
                            {storeData.storeLocationLabel && (
                              <Box
                                sx={{
                                  mt: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.75,
                                  px: 1.5,
                                  py: 0.75,
                                  bgcolor: isDark ? "#0a2e1c" : "#f0fdf4",
                                  border: `1px solid ${isDark ? "#1a5c38" : "#bbf7d0"}`,
                                  borderRadius: "4px"
                                }}
                              >
                                <span style={{ fontSize: 11 }}>📍</span>
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: isDark ? "#4ade80" : "#16a34a",
                                    fontFamily: "'Nunito', sans-serif",
                                    fontWeight: 600,
                                    flex: 1,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                  }}
                                >
                                  {storeData.storeLocationLabel}
                                </span>
                                <button
                                  onClick={() => {
                                    updateStore("storeLat", "")
                                    updateStore("storeLng", "")
                                    updateStore("storeLocationLabel", "")
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: isDark ? "#4ade80" : "#16a34a",
                                    fontSize: 13,
                                    padding: 0,
                                    lineHeight: 1
                                  }}
                                >
                                  ✕
                                </button>
                              </Box>
                            )}
                          </Box>

                          <Field
                            label="JENIS TOKO *"
                            error={storeErrors.storeType}
                          >
                            <select
                              value={storeData.storeType}
                              onChange={(e) =>
                                updateStore("storeType", e.target.value)
                              }
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
                              value={storeData.storePhone}
                              onChange={(e) =>
                                updateStore("storePhone", e.target.value)
                              }
                              style={inputStyle(!!storeErrors.storePhone)}
                            />
                          </Field>

                          <Field label="EMAIL TOKO">
                            <input
                              type="email"
                              placeholder="email@toko.com (opsional)"
                              value={storeData.storeEmail}
                              onChange={(e) =>
                                updateStore("storeEmail", e.target.value)
                              }
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
                                placeholder="Jalan, No, RT/RW, Kelurahan, Kecamatan"
                                value={storeData.storeAddress}
                                onChange={(e) =>
                                  updateStore("storeAddress", e.target.value)
                                }
                                style={{
                                  ...inputStyle(!!storeErrors.storeAddress),
                                  resize: "vertical"
                                }}
                              />
                            </Field>
                          </Box>

                          <Field label="KOTA *" error={storeErrors.storeCity}>
                            <input
                              type="text"
                              placeholder="Nama kota"
                              value={storeData.storeCity}
                              onChange={(e) =>
                                updateStore("storeCity", e.target.value)
                              }
                              style={inputStyle(!!storeErrors.storeCity)}
                            />
                          </Field>

                          <Field
                            label="PROVINSI *"
                            error={storeErrors.storeProvince}
                          >
                            <select
                              value={storeData.storeProvince}
                              onChange={(e) =>
                                updateStore("storeProvince", e.target.value)
                              }
                              style={inputStyle(!!storeErrors.storeProvince)}
                            >
                              <option value="">Pilih provinsi</option>
                              {PROVINCES.map((prov) => (
                                <option key={prov} value={prov}>
                                  {prov}
                                </option>
                              ))}
                            </select>
                          </Field>

                          <Field label="KODE POS">
                            <input
                              type="text"
                              placeholder="Opsional"
                              maxLength={5}
                              value={storeData.storePostalCode}
                              onChange={(e) =>
                                updateStore("storePostalCode", e.target.value)
                              }
                              style={inputStyle(false)}
                            />
                          </Field>
                        </Box>

                        <Box
                          sx={{
                            mt: 3,
                            pt: 3,
                            borderTop: `1px solid ${p.border}`,
                            display: "flex",
                            justifyContent: "flex-end"
                          }}
                        >
                          <button
                            onClick={() => {
                              if (validateStep1()) setStep(2)
                            }}
                            style={{
                              background: "#1e3a8a",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                              padding: "10px 28px",
                              fontSize: 14,
                              fontWeight: 700,
                              fontFamily: "'Nunito', sans-serif",
                              cursor: "pointer",
                              width: "100%"
                            }}
                          >
                            Lanjut ke Data Pemilik →
                          </button>
                        </Box>
                      </Box>
                    )}

                    {/* ════════ STEP 2 ════════ */}
                    {step === 2 && (
                      <Box sx={{ p: { xs: 2, sm: 3 } }}>
                        {ownerData.inputMethod === "ocr" && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              px: 2,
                              py: 1,
                              mb: 2.5,
                              bgcolor: isDark ? "#0a2e1c" : "#f0fdf4",
                              border: `1px solid ${isDark ? "#1a5c38" : "#bbf7d0"}`,
                              borderRadius: "4px"
                            }}
                          >
                            <span style={{ color: "#16a34a", fontSize: 13 }}>
                              ✓
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                color: isDark ? "#4ade80" : "#16a34a",
                                fontFamily: "'Nunito', sans-serif",
                                fontWeight: 600
                              }}
                            >
                              Data terisi dari Scan KTP — harap verifikasi
                              kembali
                            </span>
                          </Box>
                        )}

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
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <input
                                  type="text"
                                  placeholder="16 digit NIK"
                                  value={ownerData.nik}
                                  onChange={(e) =>
                                    updateOwner(
                                      "nik",
                                      e.target.value.replace(/\D/g, "")
                                    )
                                  }
                                  maxLength={16}
                                  style={{
                                    ...inputStyle(!!ownerErrors.nik),
                                    flex: 1
                                  }}
                                />
                                <button
                                  onClick={() => setKtpModalOpen(true)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "0 16px",
                                    border: `1px solid ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                                    borderRadius: 6,
                                    background:
                                      "linear-gradient(135deg,#1e3a8a,#1e3a8a)",
                                    boxShadow:
                                      "0 4px 12px rgba(59,130,246,.25)",
                                    color: "#fff",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    fontFamily: "'Nunito', sans-serif",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0
                                  }}
                                >
                                  🪪 Scan KTP
                                </button>
                              </Box>
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
                                value={ownerData.fullName}
                                onChange={(e) =>
                                  updateOwner("fullName", e.target.value)
                                }
                                style={inputStyle(!!ownerErrors.fullName)}
                              />
                            </Field>
                          </Box>

                          <Field
                            label="TANGGAL LAHIR *"
                            error={ownerErrors.birthDate}
                          >
                            <input
                              type="text"
                              placeholder="DD-MM-YYYY"
                              value={ownerData.birthDate}
                              onChange={(e) =>
                                updateOwner("birthDate", e.target.value)
                              }
                              style={inputStyle(!!ownerErrors.birthDate)}
                            />
                          </Field>

                          <Field
                            label="JENIS KELAMIN *"
                            error={ownerErrors.gender}
                          >
                            <select
                              value={ownerData.gender}
                              onChange={(e) =>
                                updateOwner("gender", e.target.value)
                              }
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
                                value={ownerData.address}
                                onChange={(e) =>
                                  updateOwner("address", e.target.value)
                                }
                                style={{
                                  ...inputStyle(!!ownerErrors.address),
                                  resize: "vertical"
                                }}
                              />
                            </Field>
                          </Box>
                        </Box>

                        {submitError && (
                          <Box
                            sx={{
                              mt: 2.5,
                              p: 1.5,
                              bgcolor: isDark ? "#2e1010" : "#fef2f2",
                              border: `1px solid ${isDark ? "#5a1a1a" : "#fecaca"}`,
                              borderRadius: "4px"
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontSize: 13,
                                color: "#ef4444",
                                fontFamily: "'Nunito', sans-serif"
                              }}
                            >
                              {submitError}
                            </p>
                          </Box>
                        )}

                        <Box
                          sx={{
                            mt: 3,
                            pt: 3,
                            borderTop: `1px solid ${p.border}`,
                            display: "flex",
                            flexDirection: { xs: "column-reverse", sm: "row" },
                            gap: 1.5,
                            justifyContent: "flex-end"
                          }}
                        >
                          <button
                            onClick={() => setStep(1)}
                            style={{
                              padding: "10px 20px",
                              border: `1px solid ${p.border}`,
                              borderRadius: 6,
                              background: "transparent",
                              color: p.textSecondary,
                              fontSize: 14,
                              fontFamily: "'Nunito', sans-serif",
                              fontWeight: 600,
                              cursor: "pointer",
                              width: "100%"
                            }}
                          >
                            ← Kembali
                          </button>
                          <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            style={{
                              padding: "10px 28px",
                              border: "none",
                              borderRadius: 6,
                              background: isSubmitting ? "#065a4d" : "#1e3a8a",
                              color: "#fff",
                              fontSize: 14,
                              fontWeight: 700,
                              fontFamily: "'Nunito', sans-serif",
                              cursor: isSubmitting ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                              opacity: isSubmitting ? 0.8 : 1,
                              width: "100%"
                            }}
                          >
                            {isSubmitting && <Box sx={spinnerSx} />}
                            {isSubmitting
                              ? "Mendaftarkan..."
                              : "Daftarkan Toko"}
                          </button>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════════════════════
          MAP MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal open={mapModalOpen} onClose={closeMapModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: { xs: "96vw", sm: 580 },
            height: { xs: "92vh", sm: "88vh" },
            maxHeight: { xs: "92vh", sm: "88vh" },
            bgcolor: p.bgPaper,
            border: `1px solid ${p.border}`,
            borderRadius: "12px",
            boxShadow: p.menuShadow,
            outline: "none",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
                  Lokasi Toko
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: p.textMuted,
                    fontFamily: "'Nunito', sans-serif"
                  }}
                >
                  Pin lokasi toko Anda di peta
                </p>
              </Box>
            </Box>
            <button
              onClick={closeMapModal}
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

          {/* Scrollable body */}
          <Box
            sx={{
              flex: "1 1 0",
              height: 0,
              minHeight: 0,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* ── Geo permission banner ── */}
            {geoStatus === "idle" || geoStatus === "requesting" ? (
              <Box
                sx={{
                  mx: 3,
                  mt: 2.5,
                  p: 2,
                  bgcolor: isDark ? "#0d1f3c" : "#eff6ff",
                  border: `1px solid ${isDark ? "#1e3a8a" : "#bfdbfe"}`,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5
                }}
              >
                <Box>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: 13,
                      fontWeight: 700,
                      color: isDark ? "#93c5fd" : "#1e3a8a",
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  >
                    {geoStatus === "requesting"
                      ? "Meminta akses lokasi..."
                      : "Gunakan Lokasi Saat Ini"}
                  </p>
                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: 12,
                      color: p.textSecondary,
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  >
                    {geoStatus === "requesting"
                      ? "Izinkan akses lokasi di browser Anda untuk menampilkan posisi toko saat ini."
                      : "Klik tombol di bawah untuk mendeteksi lokasi toko secara otomatis."}
                  </p>
                  {geoStatus === "idle" && (
                    <button
                      onClick={requestGeolocation}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 16px",
                        border: "none",
                        borderRadius: 6,
                        background: "#1e3a8a",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "'Nunito', sans-serif",
                        cursor: "pointer"
                      }}
                    >
                      Deteksi Lokasi Saya
                    </button>
                  )}
                  {geoStatus === "requesting" && (
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1
                      }}
                    >
                      <Box
                        sx={{
                          ...spinnerSx,
                          border: "2px solid rgba(30,58,138,0.3)",
                          borderTopColor: "#1e3a8a"
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          color: "#1e3a8a",
                          fontFamily: "'Nunito', sans-serif"
                        }}
                      >
                        Menunggu izin...
                      </span>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : geoStatus === "granted" ? (
              <Box
                sx={{
                  mx: 3,
                  mt: 2.5,
                  px: 2,
                  py: 1.25,
                  bgcolor: isDark ? "#0a2e1c" : "#f0fdf4",
                  border: `1px solid ${isDark ? "#1a5c38" : "#bbf7d0"}`,
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <span style={{ fontSize: 13, color: "#16a34a" }}>✓</span>
                <span
                  style={{
                    fontSize: 12,
                    color: isDark ? "#4ade80" : "#16a34a",
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 600
                  }}
                >
                  Lokasi terdeteksi — pin sudah diletakkan di posisi Anda
                </span>
                <button
                  onClick={requestGeolocation}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    color: isDark ? "#4ade80" : "#16a34a",
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    textDecoration: "underline",
                    padding: 0
                  }}
                >
                  Refresh
                </button>
              </Box>
            ) : geoStatus === "denied" ? (
              <Box
                sx={{
                  mx: 3,
                  mt: 2.5,
                  px: 2,
                  py: 1.25,
                  bgcolor: isDark ? "#2e1a10" : "#fff7ed",
                  border: `1px solid ${isDark ? "#7c3a10" : "#fed7aa"}`,
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <span style={{ fontSize: 13 }}>⚠️</span>
                <span
                  style={{
                    fontSize: 12,
                    color: isDark ? "#fdba74" : "#c2410c",
                    fontFamily: "'Nunito', sans-serif"
                  }}
                >
                  Akses lokasi ditolak. Gunakan search atau klik peta secara
                  manual.
                </span>
              </Box>
            ) : geoStatus === "unsupported" ? (
              <Box
                sx={{
                  mx: 3,
                  mt: 2.5,
                  px: 2,
                  py: 1.25,
                  bgcolor: isDark ? "#1a1a1a" : "#f8fafc",
                  border: `1px solid ${p.border}`,
                  borderRadius: "6px"
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: p.textMuted,
                    fontFamily: "'Nunito', sans-serif"
                  }}
                >
                  Browser tidak mendukung geolokasi. Gunakan search di bawah.
                </span>
              </Box>
            ) : null}

            {/* ── Search bar ── */}
            <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  color: p.textMuted,
                  marginBottom: 6,
                  fontFamily: "'Nunito', sans-serif",
                  letterSpacing: "0.04em"
                }}
              >
                CARI LOKASI
              </label>
              <Box sx={{ display: "flex", gap: 1 }}>
                <input
                  type="text"
                  placeholder="Nama toko, alamat, atau area..."
                  value={mapQuery}
                  onChange={(e) => setMapQuery(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !mapSearchLoading && searchLocation()
                  }
                  style={{ ...inputStyle(false), flex: 1 }}
                />
                <button
                  onClick={searchLocation}
                  disabled={mapSearchLoading || mapQuery.trim().length < 3}
                  style={{
                    padding: "0 16px",
                    border: "none",
                    borderRadius: 6,
                    background:
                      mapSearchLoading || mapQuery.trim().length < 3
                        ? "#64748b"
                        : "#1e3a8a",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "'Nunito', sans-serif",
                    cursor:
                      mapSearchLoading || mapQuery.trim().length < 3
                        ? "not-allowed"
                        : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexShrink: 0,
                    height: 42,
                    transition: "background 0.2s"
                  }}
                >
                  {mapSearchLoading ? <Box sx={{ ...spinnerSx }} /> : <></>}
                  {mapSearchLoading ? "Mencari..." : "Cari"}
                </button>
              </Box>
              {mapSearchError && (
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 12,
                    color: "#ef4444",
                    fontFamily: "'Nunito', sans-serif"
                  }}
                >
                  {mapSearchError}
                </p>
              )}
              {mapLabel && !mapSearchError && (
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 12,
                    color: isDark ? "#4ade80" : "#16a34a",
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 600
                  }}
                >
                  📍 {mapLabel}
                </p>
              )}
              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: 11,
                  color: p.textMuted,
                  fontFamily: "'Nunito', sans-serif"
                }}
              >
                Klik langsung pada peta untuk memindahkan pin lokasi.
              </p>
            </Box>

            {/* ── Leaflet Map ── */}
            <Box
              sx={{
                mx: 3,
                mb: 0,
                height: { xs: 300, sm: 360 },
                flexShrink: 0,
                border: `1px solid ${p.border}`,
                borderRadius: "8px",
                overflow: "hidden",
                position: "relative"
              }}
            >
              <CanvasMap
                center={mapCenter}
                marker={mapMarker}
                markerLabel={mapLabel}
                isDark={isDark}
                onMapClick={handleMapClick}
                onRequestGeo={requestGeolocation}
                isGeoLoading={geoLoading}
                markerSource={markerSource}
              />
            </Box>

            {/* Footer dengan koordinat */}
            {mapMarker && (
              <Box
                sx={{
                  mx: 3,
                  mt: 1.5,
                  px: 2,
                  py: 1,
                  bgcolor: p.bg,
                  border: `1px solid ${p.border}`,
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <Box sx={{ display: "flex", gap: 2 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: p.textMuted,
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  >
                    <strong style={{ color: p.textSecondary }}>Lat:</strong>{" "}
                    {mapMarker[0].toFixed(6)}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: p.textMuted,
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  >
                    <strong style={{ color: p.textSecondary }}>Lng:</strong>{" "}
                    {mapMarker[1].toFixed(6)}
                  </span>
                </Box>
                <a
                  href={`https://www.google.com/maps?q=${mapMarker[0]},${mapMarker[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 11,
                    color: "#1e3a8a",
                    fontFamily: "'Nunito', sans-serif",
                    textDecoration: "none",
                    fontWeight: 700
                  }}
                >
                  Buka Google Maps ↗
                </a>
              </Box>
            )}
          </Box>

          {/* Footer tombol */}
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
              onClick={closeMapModal}
              style={{
                padding: "9px 20px",
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
              onClick={confirmLocation}
              disabled={!mapMarker}
              style={{
                padding: "9px 22px",
                border: "none",
                borderRadius: 6,
                background: mapMarker ? "#1e3a8a" : "#64748b",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                cursor: mapMarker ? "pointer" : "not-allowed",
                transition: "background 0.2s"
              }}
            >
              {mapMarker ? "Simpan Lokasi" : "Pilih Lokasi di Peta"}
            </button>
          </Box>
        </Box>
      </Modal>

      {/* ══════════════════════════════════════════════
          KTP SCAN MODAL
      ══════════════════════════════════════════════ */}
      <Modal open={ktpModalOpen} onClose={closeKtpModal}>
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
                🪪
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
                  Scan KTP
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
              onClick={closeKtpModal}
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
              {(["upload", "webcam"] as const).map((sm) => (
                <button
                  key={sm}
                  onClick={() => {
                    setScanMode(sm)
                    if (sm === "upload") stopWebcam()
                  }}
                  style={{
                    flex: 1,
                    padding: "7px 12px",
                    border: `1px solid ${scanMode === sm ? (isDark ? "#1e3a8a" : "#b5d4f4") : "transparent"}`,
                    borderRadius: "4px",
                    background:
                      scanMode === sm
                        ? isDark
                          ? "#0d1f3c"
                          : "#e6f1fb"
                        : "transparent",
                    color: scanMode === sm ? "#1e3a8a" : p.textSecondary,
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "'Nunito', sans-serif",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {sm === "upload" ? "📎 Upload File" : "📷 Kamera"}
                </button>
              ))}
            </Box>

            {scanMode === "upload" && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                {!ktpPreview ? (
                  <Box
                    onClick={() =>
                      ocrStatus !== "scanning" && fileInputRef.current?.click()
                    }
                    sx={{
                      border: `1.5px dashed ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                      borderRadius: "8px",
                      py: 5,
                      textAlign: "center",
                      cursor:
                        ocrStatus === "scanning" ? "not-allowed" : "pointer",
                      opacity: ocrStatus === "scanning" ? 0.5 : 1,
                      "&:hover": {
                        borderColor: "#1e3a8a",
                        bgcolor: isDark ? "#0d1f3c" : "#f0fdf9"
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
                      Klik untuk pilih foto KTP
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
                    <img
                      src={ktpPreview}
                      alt="KTP Preview"
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        border: `1px solid ${p.border}`,
                        maxHeight: 200,
                        objectFit: "cover"
                      }}
                    />
                    {ocrStatus !== "scanning" && ocrStatus !== "success" && (
                      <button
                        onClick={() => {
                          setKtpPreview("")
                          setOcrStatus("idle")
                          setOcrError("")
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

            {scanMode === "webcam" && (
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
                  {!webcamActive && (
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
                        onClick={() => startWebcam()}
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
                  {webcamActive && (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 16,
                        border: "2px solid rgba(8,116,99,0.6)",
                        borderRadius: "4px",
                        pointerEvents: "none"
                      }}
                    />
                  )}
                </Box>

                {webcamActive && cameras.length > 1 && (
                  <Box sx={{ mb: 1.5 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 11,
                        fontWeight: 700,
                        color: p.textMuted,
                        marginBottom: 5,
                        fontFamily: "'Nunito', sans-serif"
                      }}
                    >
                      Pilih Kamera
                    </label>
                    <select
                      value={selectedCameraId}
                      onChange={(e) => handleCameraChange(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: `1px solid ${p.border}`,
                        background: isDark ? "#111" : "#fff",
                        color: p.textPrimary,
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
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

                {webcamActive && (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <button
                      onClick={captureWebcam}
                      disabled={ocrStatus === "scanning"}
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
                        opacity: ocrStatus === "scanning" ? 0.6 : 1
                      }}
                    >
                      📸 Ambil Foto
                    </button>
                    <button
                      onClick={stopWebcam}
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

            {ocrStatus === "scanning" && (
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
                    "@keyframes spin": {
                      from: { transform: "rotate(0deg)" },
                      to: { transform: "rotate(360deg)" }
                    },
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
                  Sedang membaca KTP...
                </span>
              </Box>
            )}
            {ocrStatus === "success" && (
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
                  Data KTP berhasil dibaca! Menutup...
                </span>
              </Box>
            )}
            {ocrStatus === "error" && (
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
                  {ocrError}
                </p>
                <button
                  onClick={() => {
                    setOcrStatus("idle")
                    setOcrError("")
                    setKtpPreview("")
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
