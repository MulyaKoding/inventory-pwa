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
import MapLibreMap from "./MapLibreMap"
import LocationSelector, { LocationValue } from "./LocationSelector"

const DRAWER_WIDTH = 220

interface OwnerData {
  nik: string
  fullName: string
  birthDate: string
  address: string
  gender: string
  ktpImageUrl: string
  signatureUrl: string
  inputMethod: "manual" | "ocr"
}

interface StoreData {
  storeName: string
  storeType: string
  storePhone: string
  storeEmail: string
  storeAddress: string
  storeLat: string
  storeLng: string
  storeLocationLabel: string
  storeImageUrl: string // ← BARU
}

type OCRStatus = "idle" | "scanning" | "success" | "error"
type ScanMode = "upload" | "webcam"
type GeoStatus = "idle" | "requesting" | "granted" | "denied" | "unsupported"
// ← BARU: status upload gambar toko
type StoreImgStatus = "idle" | "uploading" | "success" | "error"
type StoreImgMode = "upload" | "camera"

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

  // ← BARU: refs untuk gambar toko
  const storeImgFileRef = useRef<HTMLInputElement>(null)
  const storeImgVideoRef = useRef<HTMLVideoElement>(null)
  const storeImgCanvasRef = useRef<HTMLCanvasElement>(null)
  const storeImgStreamRef = useRef<MediaStream | null>(null)

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

  // ← BARU: Store Image Modal state
  const [storeImgModalOpen, setStoreImgModalOpen] = useState(false)
  const [storeImgMode, setStoreImgMode] = useState<StoreImgMode>("upload")
  const [storeImgStatus, setStoreImgStatus] = useState<StoreImgStatus>("idle")
  const [storeImgError, setStoreImgError] = useState("")
  const [storeImgPreview, setStoreImgPreview] = useState<string>("")
  const [storeImgCamActive, setStoreImgCamActive] = useState(false)
  const [storeImgCameras, setStoreImgCameras] = useState<MediaDeviceInfo[]>([])
  const [storeImgSelectedCam, setStoreImgSelectedCam] = useState<string>("")

  // MAP Modal
  const [mapModalOpen, setMapModalOpen] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    -6.2088, 106.8456
  ])
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
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signModalOpen, setSignModalOpen] = useState(false)
  const [signUploadStatus, setSignUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle")
  const [signError, setSignError] = useState("")
  const [hasSignature, setHasSignature] = useState(false)
  const [signMode, setSignMode] = useState<"draw" | "upload" | "type">("draw")
  const signFileRef = useRef<HTMLInputElement>(null)
  const [signPreview, setSignPreview] = useState("")
  const [signTypedText, setSignTypedText] = useState("")
  const [signFontFamily, setSignFontFamily] = useState("Great Vibes")
  const [signFontSize, setSignFontSize] = useState(42)

  const [storeData, setStoreData] = useState<StoreData>({
    storeName: "",
    storeType: "",
    storePhone: "",
    storeEmail: "",
    storeAddress: "",
    storeLat: "",
    storeLng: "",
    storeLocationLabel: "",
    storeImageUrl: "" // ← BARU
  })

  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION)
  const [locationErrors, setLocationErrors] = useState<
    Partial<Record<keyof LocationValue, string>>
  >({})

  const [ownerData, setOwnerData] = useState<OwnerData>({
    nik: "",
    fullName: "",
    birthDate: "",
    address: "",
    gender: "",
    ktpImageUrl: "",
    signatureUrl: "",
    inputMethod: "manual"
  })
  const [storeErrors, setStoreErrors] = useState<Partial<StoreData>>({})
  const [ownerErrors, setOwnerErrors] = useState<Partial<OwnerData>>({})

  useEffect(() => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href =
      "https://fonts.googleapis.com/css2?family=Great+Vibes&family=Dancing+Script:wght@700&family=Pinyon+Script&family=Parisienne&display=swap"
    document.head.appendChild(link)
  }, [])

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

  const deleteFromCloudinary = async (url: string) => {
    if (!url) return
    try {
      await fetch("/api/upload/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url })
      })
    } catch {}
  }

  const validateStep1 = () => {
    const errors: Partial<StoreData> = {}
    if (!storeData.storeName) errors.storeName = "Nama toko wajib diisi"
    if (!storeData.storeType) errors.storeType = "Jenis toko wajib dipilih"
    if (!storeData.storePhone) errors.storePhone = "Nomor telepon wajib diisi"
    if (!storeData.storeAddress) errors.storeAddress = "Alamat toko wajib diisi"

    const locErrors: Partial<Record<keyof LocationValue, string>> = {}
    if (!location.provinsiKd) locErrors.provinsiKd = "Provinsi wajib dipilih"
    if (!location.kotaKd) locErrors.kotaKd = "Kota wajib dipilih"
    if (!location.kecamatanKd) locErrors.kecamatanKd = "Kecamatan wajib dipilih"
    if (!location.kelurahanKd) locErrors.kelurahanKd = "Kelurahan wajib dipilih"

    setStoreErrors(errors)
    setLocationErrors(locErrors)
    return (
      Object.keys(errors).length === 0 && Object.keys(locErrors).length === 0
    )
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

  // ════════════════════════════════════════
  // STORE IMAGE — upload to Cloudinary
  // ════════════════════════════════════════
  const stopStoreImgCam = useCallback(() => {
    if (storeImgStreamRef.current) {
      storeImgStreamRef.current.getTracks().forEach((t) => t.stop())
      storeImgStreamRef.current = null
    }
    setStoreImgCamActive(false)
  }, [])

  const startStoreImgCam = async (deviceId?: string) => {
    try {
      if (storeImgStreamRef.current) {
        storeImgStreamRef.current.getTracks().forEach((t) => t.stop())
        storeImgStreamRef.current = null
      }
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: 1280, height: 720 }
          : { facingMode: "environment", width: 1280, height: 720 }
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      storeImgStreamRef.current = stream
      if (storeImgVideoRef.current) {
        storeImgVideoRef.current.srcObject = stream
        storeImgVideoRef.current.onloadedmetadata = () => {
          storeImgVideoRef.current
            ?.play()
            .catch((e) => console.warn("play:", e))
        }
      }
      const devices = await navigator.mediaDevices.enumerateDevices()
      setStoreImgCameras(devices.filter((d) => d.kind === "videoinput"))
      setStoreImgSelectedCam(
        stream.getVideoTracks()[0].getSettings().deviceId || ""
      )
      setStoreImgCamActive(true)
    } catch {
      setStoreImgError("Tidak dapat mengakses kamera.")
    }
  }

  const uploadStoreImage = async (blob: Blob, mimeType: string) => {
    setStoreImgStatus("uploading")
    setStoreImgError("")
    try {
      const form = new FormData()
      form.append("file", new File([blob], "store.jpg", { type: mimeType }))
      const res = await fetch("/api/upload/store-image", {
        method: "POST",
        body: form
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Gagal upload gambar")
      updateStore("storeImageUrl", result.url)
      setStoreImgStatus("success")
      setSnackbar({
        open: true,
        msg: "Gambar toko berhasil diupload!",
        severity: "success"
      })
      setTimeout(() => closeStoreImgModal(), 1000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan"
      setStoreImgError(msg)
      setStoreImgStatus("error")
    }
  }

  const handleStoreImgFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setStoreImgPreview(URL.createObjectURL(file))
    await uploadStoreImage(file, file.type)
  }

  const captureStoreImgCam = async () => {
    if (!storeImgVideoRef.current || !storeImgCanvasRef.current) return
    const video = storeImgVideoRef.current
    const canvas = storeImgCanvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")?.drawImage(video, 0, 0)
    canvas.toBlob(
      async (blob) => {
        if (!blob) return
        stopStoreImgCam()
        setStoreImgPreview(canvas.toDataURL("image/jpeg"))
        await uploadStoreImage(blob, "image/jpeg")
      },
      "image/jpeg",
      0.9
    )
  }

  const closeStoreImgModal = () => {
    stopStoreImgCam()
    setStoreImgModalOpen(false)
    setStoreImgStatus("idle")
    setStoreImgError("")
    setStoreImgPreview("")
    setStoreImgMode("upload")
    setStoreImgCameras([])
    setStoreImgSelectedCam("")
  }

  // ════════════════════════════════════════
  // MAP
  // ════════════════════════════════════════
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

  const openMapModal = () => {
    const q = [
      storeData.storeName,
      storeData.storeAddress,
      location.kotaNama,
      location.provinsiNama
    ]
      .filter(Boolean)
      .join(", ")
    setMapQuery(q)
    setMapSearchError("")
    if (storeData.storeLat && storeData.storeLng) {
      setMapCenter([
        parseFloat(storeData.storeLat),
        parseFloat(storeData.storeLng)
      ])
      setMapMarker([
        parseFloat(storeData.storeLat),
        parseFloat(storeData.storeLng)
      ])
      setMapLabel(storeData.storeLocationLabel)
    } else {
      setMapMarker(null)
      setMapLabel("")
    }
    setMapModalOpen(true)
    if (geoStatus === "idle" && !storeData.storeLat)
      setTimeout(() => requestGeolocation(), 400)
  }

  const closeMapModal = () => {
    setMapModalOpen(false)
    setMapSearchError("")
  }

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

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setMapMarker([lat, lng])
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

  const confirmLocation = () => {
    if (!mapMarker) return
    updateStore("storeLat", String(mapMarker[0]))
    updateStore("storeLng", String(mapMarker[1]))
    updateStore("storeLocationLabel", mapLabel)
    if (mapLabel && !storeData.storeAddress)
      updateStore("storeAddress", mapLabel)
    setSnackbar({
      open: true,
      msg: "📍 Lokasi toko berhasil disimpan!",
      severity: "success"
    })
    closeMapModal()
  }

  // ════════════════════════════════════════
  // KTP WEBCAM
  // ════════════════════════════════════════
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
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .catch((err) => console.warn("play() error:", err))
        }
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
      setOwnerData((prev) => ({
        ...prev,
        nik: data.nik || "",
        fullName: data.fullName || "",
        birthDate: data.birthDate || "",
        address: data.address || "",
        gender: data.gender || "",
        ktpImageUrl,
        inputMethod: "ocr"
      }))
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

  // ════════════════════════════════════════
  // SIGNATURE
  // ════════════════════════════════════════
  const getSignCtx = () => signatureCanvasRef.current?.getContext("2d") ?? null

  const startSign = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    const ctx = getSignCtx()!
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    setIsDrawing(true)
  }

  const drawSign = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = signatureCanvasRef.current!
    const ctx = getSignCtx()!
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.strokeStyle = isDark ? "#e2e8f0" : "#0f172a"
    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()
    setHasSignature(true)
  }

  const startSignTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = signatureCanvasRef.current!
    const ctx = getSignCtx()!
    const rect = canvas.getBoundingClientRect()
    const t = e.touches[0]
    ctx.beginPath()
    ctx.moveTo(t.clientX - rect.left, t.clientY - rect.top)
    setIsDrawing(true)
  }

  const drawSignTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = signatureCanvasRef.current!
    const ctx = getSignCtx()!
    const rect = canvas.getBoundingClientRect()
    const t = e.touches[0]
    ctx.lineTo(t.clientX - rect.left, t.clientY - rect.top)
    ctx.strokeStyle = isDark ? "#e2e8f0" : "#0f172a"
    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()
    setHasSignature(true)
  }

  const stopSign = () => setIsDrawing(false)

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    getSignCtx()?.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const uploadSignatureBlob = async (blob: Blob) => {
    setSignUploadStatus("uploading")
    setSignError("")
    try {
      const form = new FormData()
      form.append(
        "file",
        new File([blob], "signature.png", { type: "image/png" })
      )
      const res = await fetch("/api/upload/signature", {
        method: "POST",
        body: form
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Gagal upload tanda tangan")
      updateOwner("signatureUrl", result.url)
      setSignUploadStatus("success")
      setSnackbar({
        open: true,
        msg: "Tanda tangan berhasil disimpan!",
        severity: "success"
      })
      setTimeout(() => closeSignModal(), 1000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan"
      setSignError(msg)
      setSignUploadStatus("error")
    }
  }

  const renderTypedSignatureToCanvas = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      // Buat SVG dengan font embed via Google Fonts URL
      const fontUrl = `https://fonts.googleapis.com/css2?family=${signFontFamily.replace(/ /g, "+")}:wght@400&display=swap`

      const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="200">
        <defs>
          <style>
            @import url('${fontUrl}');
          </style>
        </defs>
        <rect width="800" height="200" fill="white"/>
        <text
          x="400"
          y="120"
          font-family="'${signFontFamily}', cursive"
          font-size="${signFontSize * 2}"
          fill="#111111"
          text-anchor="middle"
          dominant-baseline="middle"
        >${signTypedText}</text>
      </svg>
    `

      const blob = new Blob([svgContent], { type: "image/svg+xml" })
      resolve(blob)
    })
  }

  const saveSignature = () => {
    const canvas = signatureCanvasRef.current
    if (!canvas || !hasSignature) return
    canvas.toBlob(async (blob) => {
      if (!blob) return
      await uploadSignatureBlob(blob)
    }, "image/png")
  }

  const saveTypedSignature = async () => {
    if (!signTypedText.trim()) return
    setSignUploadStatus("uploading")
    setSignError("")

    try {
      const res = await fetch("/api/upload/signature-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: signTypedText,
          fontFamily: signFontFamily,
          fontSize: signFontSize * 2
        })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Gagal upload tanda tangan")
      updateOwner("signatureUrl", result.url)
      setSignUploadStatus("success")
      setSnackbar({
        open: true,
        msg: "Tanda tangan berhasil disimpan!",
        severity: "success"
      })
      setTimeout(() => closeSignModal(), 1000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan"
      setSignError(msg)
      setSignUploadStatus("error")
    }
  }

  const handleSignFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSignPreview(URL.createObjectURL(file))
    await uploadSignatureBlob(file)
  }

  const closeSignModal = () => {
    setSignModalOpen(false)
    setSignUploadStatus("idle")
    setSignError("")
    setSignPreview("")
    setSignMode("draw")
    setSignTypedText("")
    setSignFontFamily("Great Vibes")
    setSignFontSize(42)
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return
    setIsSubmitting(true)
    setSubmitError("")
    try {
      const payload = {
        ...storeData,
        storeProvince: location.provinsiNama,
        storeCity: location.kotaNama,
        storeDistrict: location.kecamatanNama,
        storeVillage: location.kelurahanNama,
        storePostalCode: location.kodePos,
        storeProvinsiKd: location.provinsiKd,
        storeKotaKd: location.kotaKd,
        storeKecamatanKd: location.kecamatanKd,
        storeKelurahanKd: location.kelurahanKd,
        owner: ownerData
      }
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Gagal mendaftarkan toko")
      setSnackbar({
        open: true,
        msg: "Toko berhasil didaftarkan!",
        severity: "success"
      })
      setSubmitSuccess(true)
      setTimeout(() => router.push("/list-toko"), 2000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan"
      setSubmitError(msg)
      setSnackbar({ open: true, msg, severity: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

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
            title="Registrasi Toko"
            showAddButton={false}
            notificationCount={0}
            p={p}
          />

          <Box sx={{ flex: 1, overflow: "auto", p: "16px" }}>
            <Box sx={{ width: "100%" }}>
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

                    {/* ════ STEP 1 ════ */}
                    {step === 1 && (
                      <Box sx={{ p: { xs: 2, sm: 3 } }}>
                        {/* ── FOTO TOKO ── */}
                        <Box
                          sx={{
                            mb: 3,
                            pb: 3,
                            borderBottom: `1px solid ${p.border}`,
                            display: "flex",
                            alignItems: "center",
                            gap: 3
                          }}
                        >
                          {/* Avatar Lingkaran */}
                          <Box sx={{ position: "relative", flexShrink: 0 }}>
                            <Box
                              onClick={() => setStoreImgModalOpen(true)}
                              sx={{
                                width: 90,
                                height: 90,
                                borderRadius: "50%",
                                border: storeData.storeImageUrl
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
                                  bgcolor: isDark ? "#0d1f3c" : "#dbeafe",
                                  transform: "scale(1.04)"
                                }
                              }}
                            >
                              {storeData.storeImageUrl ? (
                                <img
                                  src={storeData.storeImageUrl}
                                  alt="Foto Toko"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover"
                                  }}
                                />
                              ) : (
                                <Box sx={{ textAlign: "center" }}>
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
                                </Box>
                              )}
                            </Box>
                            {/* Tombol kamera kecil di pojok */}
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

                          {/* Teks di sebelah kanan avatar */}
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

                            {storeData.storeImageUrl ? (
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
                                  Foto berhasil diupload
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

                            <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
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
                                {storeData.storeImageUrl
                                  ? "Ganti Foto"
                                  : "Upload Foto"}
                              </button>
                              {storeData.storeImageUrl && (
                                <button
                                  onClick={async () => {
                                    await deleteFromCloudinary(
                                      storeData.storeImageUrl
                                    )
                                    updateStore("storeImageUrl", "")
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
                          {/* Nama Toko + Peta */}
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
                                placeholder="Jalan, No, RT/RW"
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
                        </Box>

                        {/* Location Cascade */}
                        <Box
                          sx={{
                            mt: 2.5,
                            pt: 2.5,
                            borderTop: `1px solid ${p.border}`
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 2
                            }}
                          >
                            <Box
                              sx={{
                                width: 4,
                                height: 16,
                                bgcolor: "#1e3a8a",
                                borderRadius: 2
                              }}
                            />
                            <p
                              style={{
                                margin: 0,
                                fontSize: 12,
                                fontWeight: 700,
                                color: p.textSecondary,
                                fontFamily: "'Nunito', sans-serif",
                                letterSpacing: "0.04em"
                              }}
                            >
                              WILAYAH
                            </p>
                          </Box>
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

                    {/* ════ STEP 2 ════ */}
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
                                  Scan KTP
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

                        {/* ── TANDA TANGAN DIGITAL ── */}
                        <Box
                          sx={{
                            gridColumn: { xs: "1", sm: "span 2", md: "span 3" },
                            mt: 1
                          }}
                        >
                          <Field label="TANDA TANGAN DIGITAL">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                p: 2,
                                border: `1px solid ${ownerData.signatureUrl ? "#16a34a" : p.border}`,
                                borderRadius: "8px",
                                bgcolor: isDark ? "#111" : "#fafafa",
                                flexWrap: "wrap"
                              }}
                            >
                              {ownerData.signatureUrl ? (
                                <>
                                  <Box
                                    sx={{
                                      flex: 1,
                                      minWidth: 160,
                                      bgcolor: "#fff",
                                      border: `1px solid ${p.border}`,
                                      borderRadius: "6px",
                                      overflow: "hidden",
                                      height: 64
                                    }}
                                  >
                                    <img
                                      src={ownerData.signatureUrl}
                                      alt="Tanda Tangan"
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain"
                                      }}
                                    />
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 1,
                                      flexWrap: "wrap"
                                    }}
                                  >
                                    <button
                                      onClick={() => setSignModalOpen(true)}
                                      style={{
                                        padding: "6px 14px",
                                        border: `1px solid ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                                        borderRadius: 6,
                                        background: isDark
                                          ? "#0d1f3c"
                                          : "#eff6ff",
                                        color: "#1e3a8a",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        fontFamily: "'Nunito', sans-serif",
                                        cursor: "pointer"
                                      }}
                                    >
                                      Ubah
                                    </button>
                                    <button
                                      onClick={async () => {
                                        await deleteFromCloudinary(
                                          ownerData.signatureUrl
                                        )
                                        updateOwner("signatureUrl", "")
                                      }}
                                      style={{
                                        padding: "6px 12px",
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
                                  </Box>
                                </>
                              ) : (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    width: "100%"
                                  }}
                                >
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
                                      Belum ada tanda tangan
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
                                    <p
                                      style={{
                                        margin: 0,
                                        fontSize: 11,
                                        color: p.textMuted,
                                        fontFamily: "'Nunito', sans-serif"
                                      }}
                                    >
                                      Gambar langsung atau upload foto tanda
                                      tangan
                                    </p>
                                  </Box>
                                  <button
                                    onClick={() => setSignModalOpen(true)}
                                    style={{
                                      padding: "7px 18px",
                                      border: `1px solid ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                                      borderRadius: 6,
                                      background: isDark
                                        ? "#0d1f3c"
                                        : "#eff6ff",
                                      color: "#1e3a8a",
                                      fontSize: 13,
                                      fontWeight: 700,
                                      fontFamily: "'Nunito', sans-serif",
                                      cursor: "pointer",
                                      whiteSpace: "nowrap"
                                    }}
                                  >
                                    ✍️ Tanda Tangan
                                  </button>
                                </Box>
                              )}
                            </Box>
                          </Field>
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

      {/* ════════════════════════════════════════
          STORE IMAGE MODAL
      ════════════════════════════════════════ */}
      <Modal open={storeImgModalOpen} onClose={closeStoreImgModal}>
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
                  Foto Toko
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
              onClick={closeStoreImgModal}
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
            {/* Tab */}
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
                    setStoreImgMode(m)
                    if (m === "upload") stopStoreImgCam()
                  }}
                  style={{
                    flex: 1,
                    padding: "7px 12px",
                    border: `1px solid ${storeImgMode === m ? (isDark ? "#1e3a8a" : "#b5d4f4") : "transparent"}`,
                    borderRadius: "4px",
                    background:
                      storeImgMode === m
                        ? isDark
                          ? "#0d1f3c"
                          : "#e6f1fb"
                        : "transparent",
                    color: storeImgMode === m ? "#1e3a8a" : p.textSecondary,
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "'Nunito', sans-serif",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {m === "upload" ? "Upload File" : "Kamera"}
                </button>
              ))}
            </Box>

            {/* Upload Mode */}
            {storeImgMode === "upload" && (
              <>
                <input
                  ref={storeImgFileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleStoreImgFile}
                  style={{ display: "none" }}
                />
                {!storeImgPreview ? (
                  <Box
                    onClick={() =>
                      storeImgStatus !== "uploading" &&
                      storeImgFileRef.current?.click()
                    }
                    sx={{
                      border: `1.5px dashed ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                      borderRadius: "8px",
                      py: 5,
                      textAlign: "center",
                      cursor:
                        storeImgStatus === "uploading"
                          ? "not-allowed"
                          : "pointer",
                      opacity: storeImgStatus === "uploading" ? 0.5 : 1,
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
                      Klik untuk pilih foto toko
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
                      src={storeImgPreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        border: `1px solid ${p.border}`,
                        maxHeight: 220,
                        objectFit: "cover"
                      }}
                    />
                    {storeImgStatus !== "uploading" &&
                      storeImgStatus !== "success" && (
                        <button
                          onClick={() => {
                            setStoreImgPreview("")
                            setStoreImgStatus("idle")
                            setStoreImgError("")
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

            {/* Camera Mode */}
            {storeImgMode === "camera" && (
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
                    ref={storeImgVideoRef}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block"
                    }}
                    playsInline
                    muted
                  />
                  <canvas ref={storeImgCanvasRef} style={{ display: "none" }} />
                  {!storeImgCamActive && (
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
                        onClick={() => startStoreImgCam()}
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
                  {storeImgCamActive && (
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

                {storeImgCamActive && storeImgCameras.length > 1 && (
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
                      value={storeImgSelectedCam}
                      onChange={(e) => {
                        setStoreImgSelectedCam(e.target.value)
                        startStoreImgCam(e.target.value)
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
                        fontWeight: 600,
                        outline: "none",
                        cursor: "pointer"
                      }}
                    >
                      {storeImgCameras.map((cam, idx) => (
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

                {storeImgCamActive && (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <button
                      onClick={captureStoreImgCam}
                      disabled={storeImgStatus === "uploading"}
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
                        opacity: storeImgStatus === "uploading" ? 0.6 : 1
                      }}
                    >
                      📸 Ambil Foto
                    </button>
                    <button
                      onClick={stopStoreImgCam}
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

            {/* Status banners */}
            {storeImgStatus === "uploading" && (
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
                  Mengupload foto toko...
                </span>
              </Box>
            )}
            {storeImgStatus === "success" && (
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
                  Foto toko berhasil diupload! Menutup...
                </span>
              </Box>
            )}
            {storeImgStatus === "error" && (
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
                  {storeImgError}
                </p>
                <button
                  onClick={() => {
                    setStoreImgStatus("idle")
                    setStoreImgError("")
                    setStoreImgPreview("")
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

      {/* MAP MODAL — tidak berubah */}
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
            {geoStatus === "idle" || geoStatus === "requesting" ? (
              <Box
                sx={{
                  mx: 3,
                  mt: 2.5,
                  p: 2,
                  bgcolor: isDark ? "#0d1f3c" : "#eff6ff",
                  border: `1px solid ${isDark ? "#1e3a8a" : "#bfdbfe"}`,
                  borderRadius: "8px"
                }}
              >
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
                    ? "Izinkan akses lokasi di browser Anda."
                    : "Klik tombol untuk mendeteksi lokasi otomatis."}
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
            ) : null}

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
                    height: 42
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
              <MapLibreMap
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

            {mapMarker && (
              <Box
                sx={{
                  mx: 3,
                  mt: 1.5,
                  mb: 2,
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
                cursor: mapMarker ? "pointer" : "not-allowed"
              }}
            >
              {mapMarker ? "Simpan Lokasi" : "Pilih Lokasi di Peta"}
            </button>
          </Box>
        </Box>
      </Modal>

      {/* KTP SCAN MODAL — tidak berubah */}
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
                  {sm === "upload" ? "Upload File" : "Kamera"}
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

      {/* ════════════════════════════════════════
    SIGNATURE MODAL
════════════════════════════════════════ */}
      <Modal open={signModalOpen} onClose={closeSignModal}>
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
                ✍️
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
                  Tanda Tangan Digital
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: p.textMuted,
                    fontFamily: "'Nunito', sans-serif"
                  }}
                >
                  Gambar atau upload tanda tangan Anda
                </p>
              </Box>
            </Box>
            <button
              onClick={closeSignModal}
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
            {/* Tab */}
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
              {(["draw", "type", "upload"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setSignMode(m)
                    setSignPreview("")
                    setSignTypedText("")
                  }}
                  style={{
                    flex: 1,
                    padding: "7px 8px",
                    border: `1px solid ${signMode === m ? (isDark ? "#1e3a8a" : "#b5d4f4") : "transparent"}`,
                    borderRadius: "4px",
                    background:
                      signMode === m
                        ? isDark
                          ? "#0d1f3c"
                          : "#e6f1fb"
                        : "transparent",
                    color: signMode === m ? "#1e3a8a" : p.textSecondary,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "'Nunito', sans-serif",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {m === "draw" ? "Gambar" : m === "type" ? "Ketik" : "Upload"}
                </button>
              ))}
            </Box>

            {/* Draw Mode */}
            {signMode === "draw" && (
              <Box>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: 12,
                    color: p.textMuted,
                    fontFamily: "'Nunito', sans-serif"
                  }}
                >
                  Gambar tanda tangan Anda di area bawah ini:
                </p>
                <Box
                  sx={{
                    border: `1.5px solid ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                    borderRadius: "8px",
                    overflow: "hidden",
                    bgcolor: isDark ? "#1a1a2e" : "#ffffff",
                    cursor: "crosshair",
                    touchAction: "none"
                  }}
                >
                  <canvas
                    ref={signatureCanvasRef}
                    width={460}
                    height={180}
                    style={{ display: "block", width: "100%", height: 180 }}
                    onMouseDown={startSign}
                    onMouseMove={drawSign}
                    onMouseUp={stopSign}
                    onMouseLeave={stopSign}
                    onTouchStart={startSignTouch}
                    onTouchMove={drawSignTouch}
                    onTouchEnd={stopSign}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1.5,
                    alignItems: "center"
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: p.textMuted,
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  >
                    {hasSignature
                      ? "Klik Simpan untuk menyimpan tanda tangan"
                      : "Belum ada tanda tangan"}
                  </p>
                  <button
                    onClick={clearSignature}
                    style={{
                      padding: "5px 14px",
                      border: `1px solid ${p.border}`,
                      borderRadius: 5,
                      background: "transparent",
                      color: p.textSecondary,
                      fontSize: 12,
                      fontFamily: "'Nunito', sans-serif",
                      cursor: "pointer"
                    }}
                  >
                    Bersihkan
                  </button>
                </Box>
              </Box>
            )}

            {/* Type Mode */}
            {signMode === "type" && (
              <Box>
                {/* Font Selector */}
                <Box sx={{ mb: 2 }}>
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
                    PILIH GAYA FONT
                  </label>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 1
                    }}
                  >
                    {[
                      { font: "Great Vibes", label: "Great Vibes" },
                      { font: "Dancing Script", label: "Dancing Script" },
                      { font: "Pinyon Script", label: "Pinyon Script" },
                      { font: "Parisienne", label: "Parisienne" }
                    ].map(({ font, label }) => (
                      <Box
                        key={font}
                        onClick={() => setSignFontFamily(font)}
                        sx={{
                          p: "8px 12px",
                          border: `1px solid ${signFontFamily === font ? (isDark ? "#1e3a8a" : "#b5d4f4") : p.border}`,
                          borderRadius: "6px",
                          bgcolor:
                            signFontFamily === font
                              ? isDark
                                ? "#0d1f3c"
                                : "#e6f1fb"
                              : p.bgPaper,
                          cursor: "pointer",
                          textAlign: "center",
                          transition: "all 0.2s"
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: 20,
                            fontFamily: `'${font}', cursive`,
                            color: p.textPrimary,
                            lineHeight: 1.3
                          }}
                        >
                          Tanda Tangan
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 10,
                            color: p.textMuted,
                            fontFamily: "'Nunito', sans-serif"
                          }}
                        >
                          {label}
                        </p>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Font Size */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 2
                  }}
                >
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: p.textMuted,
                      fontFamily: "'Nunito', sans-serif",
                      whiteSpace: "nowrap"
                    }}
                  >
                    UKURAN
                  </label>
                  <input
                    type="range"
                    min={24}
                    max={72}
                    value={signFontSize}
                    onChange={(e) => setSignFontSize(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      color: p.textMuted,
                      fontFamily: "'Nunito', sans-serif",
                      minWidth: 32
                    }}
                  >
                    {signFontSize}px
                  </span>
                </Box>

                {/* Text Input */}
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: 12,
                    color: p.textMuted,
                    fontFamily: "'Nunito', sans-serif"
                  }}
                >
                  Ketik nama atau tanda tangan Anda:
                </p>
                <input
                  type="text"
                  placeholder="Nama Anda..."
                  value={signTypedText}
                  onChange={(e) => setSignTypedText(e.target.value)}
                  maxLength={40}
                  style={{ ...inputStyle(false), marginBottom: 12 }}
                />

                {/* Preview */}
                <Box
                  sx={{
                    minHeight: 100,
                    border: `0.5px solid ${p.border}`,
                    borderRadius: "8px",
                    bgcolor: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2,
                    overflow: "hidden"
                  }}
                >
                  {signTypedText.trim() ? (
                    <p
                      style={{
                        margin: 0,
                        fontFamily: `'${signFontFamily}', cursive`,
                        fontSize: signFontSize,
                        color: "#111111",
                        textAlign: "center",
                        wordBreak: "break-word",
                        maxWidth: "100%"
                      }}
                    >
                      {signTypedText}
                    </p>
                  ) : (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: p.textMuted,
                        fontFamily: "'Nunito', sans-serif"
                      }}
                    >
                      Preview tanda tangan akan muncul di sini
                    </p>
                  )}
                </Box>
              </Box>
            )}

            {/* Upload Mode */}
            {signMode === "upload" && (
              <>
                <input
                  ref={signFileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleSignFileUpload}
                  style={{ display: "none" }}
                />
                {!signPreview ? (
                  <Box
                    onClick={() =>
                      signUploadStatus !== "uploading" &&
                      signFileRef.current?.click()
                    }
                    sx={{
                      border: `1.5px dashed ${isDark ? "#1e3a8a" : "#b5d4f4"}`,
                      borderRadius: "8px",
                      py: 5,
                      textAlign: "center",
                      cursor:
                        signUploadStatus === "uploading"
                          ? "not-allowed"
                          : "pointer",
                      opacity: signUploadStatus === "uploading" ? 0.5 : 1,
                      "&:hover": {
                        borderColor: "#1e3a8a",
                        bgcolor: isDark ? "#0d1f3c" : "#eff6ff"
                      },
                      transition: "all 0.2s"
                    }}
                  >
                    <p style={{ margin: "0 0 6px", fontSize: 28 }}>✍️</p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: "#1e3a8a",
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 700
                      }}
                    >
                      Upload foto tanda tangan
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 11,
                        color: p.textMuted,
                        fontFamily: "'Nunito', sans-serif"
                      }}
                    >
                      JPG, PNG, WEBP · Maks 5MB · Latar putih lebih baik
                    </p>
                  </Box>
                ) : (
                  <Box sx={{ position: "relative" }}>
                    <img
                      src={signPreview}
                      alt="Preview Tanda Tangan"
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        border: `1px solid ${p.border}`,
                        maxHeight: 180,
                        objectFit: "contain",
                        background: "#fff"
                      }}
                    />
                    {signUploadStatus !== "uploading" &&
                      signUploadStatus !== "success" && (
                        <button
                          onClick={() => {
                            setSignPreview("")
                            setSignUploadStatus("idle")
                            setSignError("")
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

            {/* Status banners */}
            {signUploadStatus === "uploading" && (
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
                  Menyimpan tanda tangan...
                </span>
              </Box>
            )}
            {signUploadStatus === "success" && (
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
                  Tanda tangan berhasil disimpan! Menutup...
                </span>
              </Box>
            )}
            {signUploadStatus === "error" && (
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
                  {signError}
                </p>
                <button
                  onClick={() => {
                    setSignUploadStatus("idle")
                    setSignError("")
                    setSignPreview("")
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

          {/* Footer */}
          {(signMode === "draw" || signMode === "type") && (
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
                onClick={closeSignModal}
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
                onClick={
                  signMode === "draw" ? saveSignature : saveTypedSignature
                }
                disabled={
                  signMode === "draw"
                    ? !hasSignature || signUploadStatus === "uploading"
                    : !signTypedText.trim() || signUploadStatus === "uploading"
                }
                style={{
                  padding: "9px 22px",
                  border: "none",
                  borderRadius: 6,
                  background: (
                    signMode === "draw"
                      ? hasSignature && signUploadStatus !== "uploading"
                      : signTypedText.trim() && signUploadStatus !== "uploading"
                  )
                    ? "#1e3a8a"
                    : "#64748b",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'Nunito', sans-serif",
                  cursor: (
                    signMode === "draw"
                      ? hasSignature && signUploadStatus !== "uploading"
                      : signTypedText.trim() && signUploadStatus !== "uploading"
                  )
                    ? "pointer"
                    : "not-allowed"
                }}
              >
                Simpan Tanda Tangan
              </button>
            </Box>
          )}
        </Box>
      </Modal>

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
