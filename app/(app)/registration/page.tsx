"use client"

import { useState, useRef, useCallback, useMemo } from "react"
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
}

type OCRStatus = "idle" | "scanning" | "success" | "error"
type ScanMode = "upload" | "webcam"

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

  const [isDark, setIsDark] = useState(false)
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

  // KTP Modal state
  const [ktpModalOpen, setKtpModalOpen] = useState(false)
  const [scanMode, setScanMode] = useState<ScanMode>("upload")
  const [ocrStatus, setOcrStatus] = useState<OCRStatus>("idle")
  const [ocrError, setOcrError] = useState("")
  const [ktpPreview, setKtpPreview] = useState<string>("")
  const [webcamActive, setWebcamActive] = useState(false)

  const [storeData, setStoreData] = useState<StoreData>({
    storeName: "",
    storeType: "",
    storePhone: "",
    storeEmail: "",
    storeAddress: "",
    storeCity: "",
    storeProvince: "",
    storePostalCode: ""
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
      sidebarBg: isDark ? "#0D0D0D" : "#ffffff",
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

  const drawerPaperSx = (pt: boolean) => ({
    width: DRAWER_WIDTH,
    boxSizing: "border-box" as const,
    bgcolor: p.sidebarBg,
    borderRight: `1px solid ${p.border}`,
    pt: pt ? 1 : 0,
    transition: `background-color ${T}, border-color ${T}`
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

  // ── Webcam ──
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setWebcamActive(true)
    } catch {
      setOcrError("Tidak dapat mengakses kamera.")
    }
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
      // Baca arrayBuffer SEKALI di awal, simpan ke variable
      // Ini penting karena blob/file stream hanya bisa dibaca sekali
      const arrayBuffer = await blob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      // ── Step 1: OCR ──
      const blob1 = new Blob([uint8Array], { type: mimeType })
      const ocrForm = new FormData()
      ocrForm.append("ktp", new File([blob1], "ktp.jpg", { type: mimeType }))
      const ocrRes = await fetch("/api/ocr", { method: "POST", body: ocrForm })
      const ocrResult = await ocrRes.json()
      if (!ocrRes.ok) throw new Error(ocrResult.error || "Gagal memproses KTP")

      // ── Step 2: Upload ke Cloudinary ──
      // Buat blob baru dari uint8Array yang sama — tidak bergantung pada blob asli
      const blob2 = new Blob([uint8Array], { type: mimeType })
      const uploadForm = new FormData()
      uploadForm.append(
        "file",
        new File([blob2], "ktp.jpg", { type: mimeType })
      )
      const uploadRes = await fetch("/api/upload/ktp", {
        method: "POST",
        body: uploadForm
      })
      const uploadResult = await uploadRes.json()

      const ktpImageUrl = uploadRes.ok ? uploadResult.url : ""
      if (!uploadRes.ok) {
        console.warn(
          "Upload KTP gagal:",
          uploadResult.error,
          uploadResult.detail
        )
      }

      // ── Step 3: Set data owner ──
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
            "& .MuiDrawer-paper": drawerPaperSx(false)
          }}
        >
          <Sidebar p={p} isDark={isDark} T={T} />
        </Drawer>

        {/* Sidebar Desktop */}
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
            onToggleTheme={() => setIsDark((v) => !v)}
            onMenuClick={() => setMobileOpen(true)}
            title="Registrasi Toko"
            breadcrumb="STOCKR / REGISTRASI TOKO"
            showAddButton={false}
            notificationCount={0}
            p={p}
          />

          <Box sx={{ flex: 1, overflow: "auto", p: "16px" }}>
            <Box sx={{ width: "100%" }}>
              {/* Success */}
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
                  {/* Stepper */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 0,
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

                    {/* ── STEP 1 ── */}
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
                                placeholder="Contoh: Toko Maju Jaya"
                                value={storeData.storeName}
                                onChange={(e) =>
                                  updateStore("storeName", e.target.value)
                                }
                                style={inputStyle(!!storeErrors.storeName)}
                              />
                            </Field>
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

                    {/* ── STEP 2 ── */}
                    {step === 2 && (
                      <Box sx={{ p: { xs: 2, sm: 3 } }}>
                        {/* OCR success badge */}
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
                          {/* NIK + Scan Button */}
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
                                      "linear-gradient(135deg, #1e3a8a 0%, #1e3a8a 100%)",
                                    boxShadow:
                                      "0 4px 12px rgba(59,130,246,.25)",
                                    color: "#fff",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    fontFamily: "'Nunito', sans-serif",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    transition: "all 0.2s",
                                    flexShrink: 0
                                  }}
                                >
                                  🪪 Scan KTP
                                </button>
                              </Box>
                            </Field>
                          </Box>

                          {/* Nama Lengkap */}
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
                            {isSubmitting && (
                              <Box
                                sx={{
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
                                }}
                              />
                            )}
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

      {/* ══════════════════════════════════════════════
          KTP SCAN MODAL
      ══════════════════════════════════════════════ */}
      <Modal open={ktpModalOpen} onClose={closeKtpModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95vw", sm: 520 },
            bgcolor: p.bgPaper,
            border: `1px solid ${p.border}`,
            borderRadius: "10px",
            boxShadow: p.menuShadow,
            outline: "none",
            overflow: "hidden"
          }}
        >
          {/* Modal Header */}
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

          <Box sx={{ p: 3 }}>
            {/* Tab: Upload / Webcam */}
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

            {/* Upload mode */}
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

            {/* Webcam mode */}
            {scanMode === "webcam" && (
              <Box>
                <Box
                  sx={{
                    position: "relative",
                    bgcolor: "#000",
                    borderRadius: "8px",
                    overflow: "hidden",
                    aspectRatio: "16/9",
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
                        onClick={startWebcam}
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

            {/* Status: scanning */}
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

            {/* Status: success */}
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

            {/* Status: error */}
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
                    border: `1px solid #ef4444`,
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
