"use client"

import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "../components/header/page"
import Sidebar from "../components/sidebar"
import { useTheme } from "../hooks/useTheme"
import MapLibreMap from "./MapLibreMap"
import LocationSelector, { LocationValue } from "./LocationSelector"
import { cn } from "../../lib/utils"

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
  storeImageUrl: string
}

type OCRStatus = "idle" | "scanning" | "success" | "error"
type ScanMode = "upload" | "webcam"
type GeoStatus = "idle" | "requesting" | "granted" | "denied" | "unsupported"
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

// ── Theme tokens (Tailwind class strings, computed from isDark) ──────────
type Tw = ReturnType<typeof getTw>
function getTw(isDark: boolean) {
  return {
    bg: isDark ? "bg-[#0D0D0D]" : "bg-[#f8fafc]",
    bgPaper: isDark ? "bg-[#111111]" : "bg-white",
    border: isDark ? "border-[#1f1f1f]" : "border-[#e2e8f0]",
    text: isDark ? "text-[#F5F5F0]" : "text-[#0f172a]",
    textSec: isDark ? "text-[#888888]" : "text-[#64748b]",
    textMuted: isDark ? "text-[#555555]" : "text-[#94a3b8]",
    panelBg: isDark ? "bg-[#0d1f3c]" : "bg-[#e6f1fb]",
    panelBg2: isDark ? "bg-[#0d1f3c]" : "bg-[#eff6ff]",
    panelBorder: isDark ? "border-brand-700" : "border-[#b5d4f4]",
    successBg: isDark ? "bg-[#0a2e1c]" : "bg-[#f0fdf4]",
    successBorder: isDark ? "border-[#1a5c38]" : "border-[#bbf7d0]",
    successText: isDark ? "text-[#4ade80]" : "text-[#16a34a]",
    errorBg: isDark ? "bg-[#2e1010]" : "bg-[#fef2f2]",
    errorBorder: isDark ? "border-[#5a1a1a]" : "border-[#fecaca]",
    warnBg: isDark ? "bg-[#2e1a10]" : "bg-[#fff7ed]",
    warnBorder: isDark ? "border-[#7c3a10]" : "border-[#fed7aa]",
    warnText: isDark ? "text-[#fdba74]" : "text-[#c2410c]",
    infoText: isDark ? "text-[#93c5fd]" : "text-brand-700"
  }
}

// ── Shared style helpers ──────────────────────────────────────────────
const inputCls = (isDark: boolean, hasError: boolean) =>
  cn(
    "box-border w-full rounded-md border px-3 py-2.5 font-nunito text-sm outline-none transition-colors",
    isDark ? "bg-[#111111] text-[#F5F5F0]" : "bg-white text-[#0f172a]",
    hasError
      ? "border-[#ef4444]"
      : isDark
        ? "border-[#1f1f1f]"
        : "border-[#e2e8f0]"
  )
const textareaCls = (isDark: boolean, hasError: boolean) =>
  cn(inputCls(isDark, hasError), "resize-y")
const btnPrimaryCls =
  "flex w-full items-center justify-center gap-2 rounded-md bg-brand-700 px-7 py-2.5 font-nunito text-sm font-bold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-80"
const btnGhostCls = (isDark: boolean) =>
  cn(
    "w-full rounded-md border bg-transparent px-5 py-2.5 font-nunito text-sm font-semibold cursor-pointer",
    isDark
      ? "border-[#1f1f1f] text-[#888888]"
      : "border-[#e2e8f0] text-[#64748b]"
  )
const spinCls =
  "h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-brand-700 border-t-transparent"

// ── Small shared components (top-level to avoid remount on parent render) ──
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
      <label className="mb-1.5 block font-nunito text-[12px] font-bold text-[#64748b]">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 font-nunito text-[11px] text-[#ef4444]">{error}</p>
      )}
    </div>
  )
}

function ModalShell({
  open,
  onClose,
  widthClass,
  tw,
  children
}: {
  open: boolean
  onClose: () => void
  widthClass?: string
  tw: Tw
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[10px] border sm:max-h-[85vh]",
          tw.bgPaper,
          tw.border,
          widthClass || "sm:w-130"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function ModalHeader({
  icon,
  title,
  subtitle,
  onClose,
  tw
}: {
  icon: string
  title: string
  subtitle: string
  onClose: () => void
  tw: Tw
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between border-b px-6 py-4",
        tw.border,
        tw.bg
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-7.5 w-7.5 items-center justify-center rounded-md border text-sm",
            tw.panelBg,
            tw.panelBorder
          )}
        >
          {icon}
        </div>
        <div>
          <p className={cn("m-0 font-nunito text-sm font-bold", tw.text)}>
            {title}
          </p>
          <p className={cn("m-0 font-nunito text-[11px]", tw.textMuted)}>
            {subtitle}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className={cn(
          "cursor-pointer border-none bg-transparent p-1 text-lg leading-none",
          tw.textMuted
        )}
      >
        ✕
      </button>
    </div>
  )
}

function TabSwitch({
  options,
  value,
  onChange,
  tw
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  tw: Tw
}) {
  return (
    <div
      className={cn(
        "mb-6 flex gap-1 rounded-md border p-0.5",
        tw.border,
        tw.bg
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 cursor-pointer rounded border px-2 py-1.5 font-nunito text-[12px] font-bold transition-all",
            value === o.value
              ? cn(tw.panelBorder, tw.panelBg, "text-brand-700")
              : cn("border-transparent bg-transparent", tw.textSec)
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function StatusBanner({
  status,
  loadingText,
  successText,
  error,
  onRetry,
  tw
}: {
  status: string
  loadingText: string
  successText: string
  error: string
  onRetry: () => void
  tw: Tw
}) {
  if (status === "uploading" || status === "scanning")
    return (
      <div
        className={cn(
          "mt-6 flex items-center gap-3 rounded-md border p-3",
          tw.panelBg,
          tw.panelBorder
        )}
      >
        <span className={spinCls} />
        <span className="font-nunito text-sm text-brand-700">
          {loadingText}
        </span>
      </div>
    )
  if (status === "success")
    return (
      <div
        className={cn(
          "mt-6 flex items-center gap-3 rounded-md border p-3",
          tw.successBg,
          tw.successBorder
        )}
      >
        <span className="text-base text-[#16a34a]">✓</span>
        <span
          className={cn("font-nunito text-sm font-semibold", tw.successText)}
        >
          {successText}
        </span>
      </div>
    )
  if (status === "error")
    return (
      <div
        className={cn("mt-6 rounded-md border p-3", tw.errorBg, tw.errorBorder)}
      >
        <p className="m-0 mb-2 font-nunito text-sm text-[#ef4444]">{error}</p>
        <button
          onClick={onRetry}
          className="cursor-pointer rounded border border-[#ef4444] bg-transparent px-3.5 py-1.5 font-nunito text-xs font-semibold text-[#ef4444]"
        >
          Coba Lagi
        </button>
      </div>
    )
  return null
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
    <div className="fixed bottom-5 right-5 z-60 animate-fade-up">
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

export default function RegistrationPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

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

  const [ktpModalOpen, setKtpModalOpen] = useState(false)
  const [scanMode, setScanMode] = useState<ScanMode>("upload")
  const [ocrStatus, setOcrStatus] = useState<OCRStatus>("idle")
  const [ocrError, setOcrError] = useState("")
  const [ktpPreview, setKtpPreview] = useState<string>("")
  const [webcamActive, setWebcamActive] = useState(false)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string>("")

  const [storeImgModalOpen, setStoreImgModalOpen] = useState(false)
  const [storeImgMode, setStoreImgMode] = useState<StoreImgMode>("upload")
  const [storeImgStatus, setStoreImgStatus] = useState<StoreImgStatus>("idle")
  const [storeImgError, setStoreImgError] = useState("")
  const [storeImgPreview, setStoreImgPreview] = useState<string>("")
  const [storeImgCamActive, setStoreImgCamActive] = useState(false)
  const [storeImgCameras, setStoreImgCameras] = useState<MediaDeviceInfo[]>([])
  const [storeImgSelectedCam, setStoreImgSelectedCam] = useState<string>("")

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
    storeImageUrl: ""
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

  const tw = useMemo(() => getTw(isDark), [isDark])

  // p kept for the Header/Sidebar prop contract (unchanged external components)
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
          title="Registrasi Toko"
          showAddButton={false}
          notificationCount={0}
          p={p}
        />

        <div className="flex-1 overflow-auto p-4">
          <div className="w-full">
            {submitSuccess ? (
              <div
                className={cn(
                  "rounded-lg border p-12 text-center",
                  tw.border,
                  tw.bgPaper
                )}
              >
                <div
                  className={cn(
                    "mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-lg border text-2xl",
                    tw.successBg,
                    tw.successBorder
                  )}
                >
                  ✓
                </div>
                <p
                  className={cn(
                    "m-0 mb-1.5 font-nunito text-base font-bold",
                    tw.text
                  )}
                >
                  Toko Berhasil Didaftarkan!
                </p>
                <p className={cn("m-0 font-nunito text-[13px]", tw.textMuted)}>
                  Mengalihkan ke dashboard...
                </p>
              </div>
            ) : (
              <>
                {/* Stepper */}
                <div
                  className={cn(
                    "mb-6 grid grid-cols-2 overflow-hidden rounded-lg border",
                    tw.border
                  )}
                >
                  {([1, 2] as const).map((s) => (
                    <div
                      key={s}
                      onClick={() => {
                        if (step > s) setStep(s as 1 | 2)
                      }}
                      className={cn(
                        "flex items-center justify-center gap-3 px-4 py-3 transition-colors sm:px-6",
                        s === 1 && cn("border-r", tw.border),
                        step === s
                          ? isDark
                            ? "bg-[#0d1f3c]"
                            : "bg-[#e6f1fb]"
                          : step > s
                            ? tw.successBg
                            : tw.bgPaper,
                        step > s ? "cursor-pointer" : "cursor-default"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full border-[1.5px]",
                          step === s
                            ? "border-brand-700 bg-brand-700"
                            : step > s
                              ? "border-[#16a34a] bg-[#16a34a]"
                              : cn(
                                  "border-transparent bg-transparent",
                                  tw.border
                                )
                        )}
                      >
                        <span
                          className={cn(
                            "font-nunito text-[11px] font-bold",
                            step >= s ? "text-white" : tw.textMuted
                          )}
                        >
                          {step > s ? "✓" : `0${s}`}
                        </span>
                      </div>
                      <div>
                        <p
                          className={cn(
                            "m-0 font-nunito text-[13px] font-bold",
                            step === s
                              ? tw.infoText
                              : step > s
                                ? "text-[#16a34a]"
                                : tw.textMuted
                          )}
                        >
                          {s === 1 ? "Data Toko" : "Data Pemilik"}
                        </p>
                        <p
                          className={cn(
                            "m-0 font-nunito text-[11px]",
                            tw.textMuted
                          )}
                        >
                          {s === 1
                            ? "Informasi toko Anda"
                            : "Data pemilik sesuai KTP"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form Card */}
                <div
                  className={cn(
                    "overflow-hidden rounded-lg border transition-colors",
                    tw.border,
                    tw.bgPaper
                  )}
                >
                  {/* Card Header */}
                  <div
                    className={cn(
                      "flex items-center gap-3 border-b px-4 py-4 sm:px-6",
                      tw.border,
                      tw.bg
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-[15px]",
                        tw.panelBg,
                        tw.panelBorder
                      )}
                    >
                      {step === 1 ? "🏪" : "👤"}
                    </div>
                    <div>
                      <p
                        className={cn(
                          "m-0 font-nunito text-sm font-bold",
                          tw.text
                        )}
                      >
                        {step === 1 ? "Informasi Toko" : "Data Pemilik Toko"}
                      </p>
                      <p
                        className={cn(
                          "m-0 font-nunito text-[11px]",
                          tw.textMuted
                        )}
                      >
                        {step === 1
                          ? "Lengkapi informasi toko Anda"
                          : "Data pemilik sesuai KTP"}
                      </p>
                    </div>
                  </div>

                  {/* ════ STEP 1 ════ */}
                  {step === 1 && (
                    <div className="p-4 sm:p-6">
                      {/* ── FOTO TOKO ── */}
                      <div
                        className={cn(
                          "mb-6 flex items-center gap-6 border-b pb-6",
                          tw.border
                        )}
                      >
                        <div className="relative shrink-0">
                          <div
                            onClick={() => setStoreImgModalOpen(true)}
                            className={cn(
                              "flex h-22.5 w-22.5 cursor-pointer items-center justify-center overflow-hidden rounded-full transition-all hover:scale-[1.04]",
                              storeData.storeImageUrl
                                ? "border-[3px] border-[#16a34a]"
                                : cn(
                                    "border-[2.5px] border-dashed",
                                    tw.panelBorder
                                  ),
                              isDark ? "bg-[#0d1f3c]" : "bg-[#eff6ff]"
                            )}
                          >
                            {storeData.storeImageUrl ? (
                              <img
                                src={storeData.storeImageUrl}
                                alt="Foto Toko"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <p className="m-0 font-nunito text-[9px] font-bold text-brand-700">
                                FOTO
                              </p>
                            )}
                          </div>
                          <div
                            onClick={() => setStoreImgModalOpen(true)}
                            className={cn(
                              "absolute bottom-0.5 right-0.5 flex h-6.5 w-6.5 cursor-pointer items-center justify-center rounded-full border-2 bg-brand-700 text-xs transition-colors hover:bg-[#2563eb]",
                              tw.bgPaper
                            )}
                          >
                            📷
                          </div>
                        </div>

                        <div className="flex-1">
                          <p
                            className={cn(
                              "m-0 mb-0.5 font-nunito text-[13px] font-bold",
                              tw.text
                            )}
                          >
                            Foto Toko
                            <span
                              className={cn(
                                "ml-1.5 font-nunito text-[11px] font-normal",
                                tw.textMuted
                              )}
                            >
                              (opsional)
                            </span>
                          </p>

                          {storeData.storeImageUrl ? (
                            <div className="mt-1 flex items-center gap-1">
                              <span className="text-[11px] text-[#16a34a]">
                                ✓
                              </span>
                              <span className="font-nunito text-[11px] font-semibold text-[#16a34a]">
                                Foto berhasil diupload
                              </span>
                            </div>
                          ) : (
                            <p
                              className={cn(
                                "m-0 mt-0.5 font-nunito text-[11px]",
                                tw.textMuted
                              )}
                            >
                              JPG, PNG, WEBP · Maks 5MB
                            </p>
                          )}

                          <div className="mt-1.5 flex gap-2">
                            <button
                              onClick={() => setStoreImgModalOpen(true)}
                              className={cn(
                                "cursor-pointer rounded-md border px-3.5 py-1.5 font-nunito text-xs font-bold text-brand-700",
                                tw.panelBorder,
                                tw.panelBg2
                              )}
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
                                className="cursor-pointer rounded-md border border-[#fecaca] bg-transparent px-3 py-1.5 font-nunito text-xs font-bold text-[#ef4444]"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3">
                        {/* Nama Toko + Peta */}
                        <div className="col-span-1 sm:col-span-2 md:col-span-3">
                          <Field
                            label="NAMA TOKO *"
                            error={storeErrors.storeName}
                          >
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Contoh: Toko Maju Jaya"
                                value={storeData.storeName}
                                onChange={(e) =>
                                  updateStore("storeName", e.target.value)
                                }
                                className={cn(
                                  inputCls(isDark, !!storeErrors.storeName),
                                  "flex-1"
                                )}
                              />
                              <button
                                type="button"
                                onClick={openMapModal}
                                className={cn(
                                  "flex h-10.5 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-3.5 font-nunito text-[13px] font-bold text-white transition-all",
                                  storeData.storeLat
                                    ? cn(
                                        "border-[#16a34a] bg-[linear-gradient(135deg,#15803d,#16a34a)] shadow-[0_4px_12px_rgba(22,163,74,.3)]"
                                      )
                                    : cn(
                                        tw.panelBorder,
                                        "bg-[linear-gradient(135deg,#1e3a8a,#2563eb)] shadow-[0_4px_12px_rgba(59,130,246,.25)]"
                                      )
                                )}
                              >
                                {storeData.storeLat ? "✓ Lokasi" : "Peta"}
                              </button>
                            </div>
                          </Field>
                          {storeData.storeLocationLabel && (
                            <div
                              className={cn(
                                "mt-2 flex items-center gap-1.5 rounded px-2.5 py-1.5",
                                tw.successBg,
                                "border",
                                tw.successBorder
                              )}
                            >
                              <span className="text-[11px]">📍</span>
                              <span
                                className={cn(
                                  "flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-nunito text-[11px] font-semibold",
                                  tw.successText
                                )}
                              >
                                {storeData.storeLocationLabel}
                              </span>
                              <button
                                onClick={() => {
                                  updateStore("storeLat", "")
                                  updateStore("storeLng", "")
                                  updateStore("storeLocationLabel", "")
                                }}
                                className={cn(
                                  "cursor-pointer border-none bg-transparent p-0 text-[13px] leading-none",
                                  tw.successText
                                )}
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>

                        <Field
                          label="JENIS TOKO *"
                          error={storeErrors.storeType}
                        >
                          <select
                            value={storeData.storeType}
                            onChange={(e) =>
                              updateStore("storeType", e.target.value)
                            }
                            className={inputCls(
                              isDark,
                              !!storeErrors.storeType
                            )}
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
                            className={inputCls(
                              isDark,
                              !!storeErrors.storePhone
                            )}
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
                            className={inputCls(isDark, false)}
                          />
                        </Field>

                        <div className="col-span-1 sm:col-span-2 md:col-span-3">
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
                              className={textareaCls(
                                isDark,
                                !!storeErrors.storeAddress
                              )}
                            />
                          </Field>
                        </div>
                      </div>

                      {/* Location Cascade */}
                      <div className={cn("mt-5 border-t pt-5", tw.border)}>
                        <div className="mb-4 flex items-center gap-2">
                          <div className="h-4 w-1 rounded bg-brand-700" />
                          <p
                            className={cn(
                              "m-0 font-nunito text-xs font-bold tracking-[0.04em]",
                              tw.textSec
                            )}
                          >
                            WILAYAH
                          </p>
                        </div>
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

                      <div
                        className={cn(
                          "mt-6 flex justify-end border-t pt-6",
                          tw.border
                        )}
                      >
                        <button
                          onClick={() => {
                            if (validateStep1()) setStep(2)
                          }}
                          className={btnPrimaryCls}
                        >
                          Lanjut ke Data Pemilik →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ════ STEP 2 ════ */}
                  {step === 2 && (
                    <div className="p-4 sm:p-6">
                      {ownerData.inputMethod === "ocr" && (
                        <div
                          className={cn(
                            "mb-5 flex items-center gap-2 rounded px-4 py-2",
                            tw.successBg,
                            "border",
                            tw.successBorder
                          )}
                        >
                          <span className="text-[13px] text-[#16a34a]">✓</span>
                          <span
                            className={cn(
                              "font-nunito text-xs font-semibold",
                              tw.successText
                            )}
                          >
                            Data terisi dari Scan KTP — harap verifikasi kembali
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3">
                        <div className="col-span-1 sm:col-span-2 md:col-span-3">
                          <Field label="NIK *" error={ownerErrors.nik}>
                            <div className="flex gap-2">
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
                                className={cn(
                                  inputCls(isDark, !!ownerErrors.nik),
                                  "flex-1"
                                )}
                              />
                              <button
                                onClick={() => setKtpModalOpen(true)}
                                className={cn(
                                  "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-4 font-nunito text-[13px] font-bold text-white",
                                  tw.panelBorder,
                                  "bg-brand-700 shadow-[0_4px_12px_rgba(59,130,246,.25)]"
                                )}
                              >
                                Scan KTP
                              </button>
                            </div>
                          </Field>
                        </div>

                        <div className="col-span-1 sm:col-span-2 md:col-span-3">
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
                              className={inputCls(
                                isDark,
                                !!ownerErrors.fullName
                              )}
                            />
                          </Field>
                        </div>

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
                            className={inputCls(
                              isDark,
                              !!ownerErrors.birthDate
                            )}
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
                            className={inputCls(isDark, !!ownerErrors.gender)}
                          >
                            <option value="">Pilih</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                          </select>
                        </Field>

                        <div className="col-span-1 sm:col-span-2 md:col-span-3">
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
                              className={textareaCls(
                                isDark,
                                !!ownerErrors.address
                              )}
                            />
                          </Field>
                        </div>
                      </div>

                      {/* ── TANDA TANGAN DIGITAL ── */}
                      <div className="col-span-1 mt-1 sm:col-span-2 md:col-span-3">
                        <Field label="TANDA TANGAN DIGITAL">
                          <div
                            className={cn(
                              "flex flex-wrap items-center gap-4 rounded-lg border p-4",
                              ownerData.signatureUrl
                                ? "border-[#16a34a]"
                                : tw.border,
                              isDark ? "bg-[#111111]" : "bg-[#fafafa]"
                            )}
                          >
                            {ownerData.signatureUrl ? (
                              <>
                                <div
                                  className={cn(
                                    "h-16 min-w-40 flex-1 overflow-hidden rounded-md border bg-white",
                                    tw.border
                                  )}
                                >
                                  <img
                                    src={ownerData.signatureUrl}
                                    alt="Tanda Tangan"
                                    className="h-full w-full object-contain"
                                  />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => setSignModalOpen(true)}
                                    className={cn(
                                      "cursor-pointer rounded-md border px-3.5 py-1.5 font-nunito text-xs font-bold text-brand-700",
                                      tw.panelBorder,
                                      tw.panelBg2
                                    )}
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
                                    className="cursor-pointer rounded-md border border-[#fecaca] bg-transparent px-3 py-1.5 font-nunito text-xs font-bold text-[#ef4444]"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="flex w-full items-center gap-4">
                                <div className="flex-1">
                                  <p
                                    className={cn(
                                      "m-0 mb-0.5 font-nunito text-[13px] font-bold",
                                      tw.text
                                    )}
                                  >
                                    Belum ada tanda tangan
                                    <span
                                      className={cn(
                                        "ml-1.5 font-nunito text-[11px] font-normal",
                                        tw.textMuted
                                      )}
                                    >
                                      (opsional)
                                    </span>
                                  </p>
                                  <p
                                    className={cn(
                                      "m-0 font-nunito text-[11px]",
                                      tw.textMuted
                                    )}
                                  >
                                    Gambar langsung atau upload foto tanda
                                    tangan
                                  </p>
                                </div>
                                <button
                                  onClick={() => setSignModalOpen(true)}
                                  className={cn(
                                    "shrink-0 cursor-pointer whitespace-nowrap rounded-md border px-4.5 py-1.5 font-nunito text-[13px] font-bold text-brand-700",
                                    tw.panelBorder,
                                    tw.panelBg2
                                  )}
                                >
                                  ✍️ Tanda Tangan
                                </button>
                              </div>
                            )}
                          </div>
                        </Field>
                      </div>

                      {submitError && (
                        <div
                          className={cn(
                            "mt-5 rounded p-3",
                            tw.errorBg,
                            "border",
                            tw.errorBorder
                          )}
                        >
                          <p className="m-0 font-nunito text-sm text-[#ef4444]">
                            {submitError}
                          </p>
                        </div>
                      )}

                      <div
                        className={cn(
                          "mt-6 flex flex-col-reverse justify-end gap-3 border-t pt-6 sm:flex-row",
                          tw.border
                        )}
                      >
                        <button
                          onClick={() => setStep(1)}
                          className={cn(
                            "w-full rounded-md border bg-transparent px-5 py-2.5 font-nunito text-sm font-semibold sm:w-auto",
                            tw.border,
                            tw.textSec
                          )}
                        >
                          ← Kembali
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className={cn(
                            "flex w-full items-center justify-center gap-2 rounded-md px-7 py-2.5 font-nunito text-sm font-bold text-white sm:w-auto",
                            isSubmitting
                              ? "cursor-not-allowed opacity-80"
                              : "cursor-pointer",
                            isSubmitting ? "bg-[#065a4d]" : "bg-brand-700"
                          )}
                        >
                          {isSubmitting && <span className={spinCls} />}
                          {isSubmitting ? "Mendaftarkan..." : "Daftarkan Toko"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          STORE IMAGE MODAL
      ════════════════════════════════════════ */}
      <ModalShell open={storeImgModalOpen} onClose={closeStoreImgModal} tw={tw}>
        <ModalHeader
          icon="🏪"
          title="Foto Toko"
          subtitle="Upload atau gunakan kamera"
          onClose={closeStoreImgModal}
          tw={tw}
        />
        <div className="flex-1 overflow-y-auto p-6">
          <TabSwitch
            options={[
              { value: "upload", label: "Upload File" },
              { value: "camera", label: "Kamera" }
            ]}
            value={storeImgMode}
            onChange={(m) => {
              setStoreImgMode(m as StoreImgMode)
              if (m === "upload") stopStoreImgCam()
            }}
            tw={tw}
          />

          {storeImgMode === "upload" && (
            <>
              <input
                ref={storeImgFileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleStoreImgFile}
                className="hidden"
              />
              {!storeImgPreview ? (
                <div
                  onClick={() =>
                    storeImgStatus !== "uploading" &&
                    storeImgFileRef.current?.click()
                  }
                  className={cn(
                    "rounded-lg border-[1.5px] border-dashed py-10 text-center transition-all hover:border-brand-700",
                    tw.panelBorder,
                    storeImgStatus === "uploading"
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  )}
                >
                  <p className="m-0 mb-1.5 text-[28px]">📎</p>
                  <p className="m-0 font-nunito text-sm font-bold text-brand-700">
                    Klik untuk pilih foto toko
                  </p>
                  <p
                    className={cn(
                      "m-0 mt-1 font-nunito text-[11px]",
                      tw.textMuted
                    )}
                  >
                    JPG, PNG, WEBP · Maks 5MB
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={storeImgPreview}
                    alt="Preview"
                    className={cn(
                      "max-h-55 w-full rounded-lg border object-cover",
                      tw.border
                    )}
                  />
                  {storeImgStatus !== "uploading" &&
                    storeImgStatus !== "success" && (
                      <button
                        onClick={() => {
                          setStoreImgPreview("")
                          setStoreImgStatus("idle")
                          setStoreImgError("")
                        }}
                        className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-none bg-black/50 text-xs text-white"
                      >
                        ✕
                      </button>
                    )}
                </div>
              )}
            </>
          )}

          {storeImgMode === "camera" && (
            <div>
              <div className="relative mb-3 aspect-4/3 min-h-55 overflow-hidden rounded-lg bg-black sm:aspect-video sm:min-h-0">
                <video
                  ref={storeImgVideoRef}
                  className="block h-full w-full object-cover"
                  playsInline
                  muted
                />
                <canvas ref={storeImgCanvasRef} className="hidden" />
                {!storeImgCamActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <p className="m-0 font-nunito text-xs text-[#888888]">
                      Kamera belum aktif
                    </p>
                    <button
                      onClick={() => startStoreImgCam()}
                      className="cursor-pointer rounded-md border-none bg-brand-700 px-5 py-2 font-nunito text-[13px] font-bold text-white"
                    >
                      Aktifkan Kamera
                    </button>
                  </div>
                )}
                {storeImgCamActive && (
                  <div className="pointer-events-none absolute inset-4 rounded border-2 border-blue-400/60" />
                )}
              </div>

              {storeImgCamActive && storeImgCameras.length > 1 && (
                <div className="mb-3">
                  <label
                    className={cn(
                      "mb-1 block font-nunito text-[11px] font-bold",
                      tw.textMuted
                    )}
                  >
                    Pilih Kamera
                  </label>
                  <select
                    value={storeImgSelectedCam}
                    onChange={(e) => {
                      setStoreImgSelectedCam(e.target.value)
                      startStoreImgCam(e.target.value)
                    }}
                    className={inputCls(isDark, false)}
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
                </div>
              )}

              {storeImgCamActive && (
                <div className="flex gap-2">
                  <button
                    onClick={captureStoreImgCam}
                    disabled={storeImgStatus === "uploading"}
                    className={cn(
                      "flex-1 cursor-pointer rounded-md border-none bg-brand-700 py-2.5 font-nunito text-[13px] font-bold text-white",
                      storeImgStatus === "uploading" && "opacity-60"
                    )}
                  >
                    📸 Ambil Foto
                  </button>
                  <button
                    onClick={stopStoreImgCam}
                    className={cn(
                      "cursor-pointer rounded-md border bg-transparent px-4 py-2.5 font-nunito text-[13px]",
                      tw.border,
                      tw.textSec
                    )}
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          )}

          <StatusBanner
            status={storeImgStatus}
            loadingText="Mengupload foto toko..."
            successText="Foto toko berhasil diupload! Menutup..."
            error={storeImgError}
            onRetry={() => {
              setStoreImgStatus("idle")
              setStoreImgError("")
              setStoreImgPreview("")
            }}
            tw={tw}
          />
        </div>
      </ModalShell>

      {/* ════════════════════════════════════════
          MAP MODAL
      ════════════════════════════════════════ */}
      <ModalShell
        open={mapModalOpen}
        onClose={closeMapModal}
        widthClass="h-[92vh] max-h-[92vh] sm:h-[88vh] sm:max-h-[88vh] sm:w-[580px]"
        tw={tw}
      >
        <ModalHeader
          icon="📍"
          title="Lokasi Toko"
          subtitle="Pin lokasi toko Anda di peta"
          onClose={closeMapModal}
          tw={tw}
        />
        <div className="flex h-0 flex-1 flex-col overflow-y-auto">
          {(geoStatus === "idle" || geoStatus === "requesting") && (
            <div
              className={cn(
                "mx-6 mt-5 rounded-lg border p-4",
                tw.panelBg2,
                tw.panelBorder
              )}
            >
              <p
                className={cn(
                  "m-0 mb-1 font-nunito text-[13px] font-bold",
                  tw.infoText
                )}
              >
                {geoStatus === "requesting"
                  ? "Meminta akses lokasi..."
                  : "Gunakan Lokasi Saat Ini"}
              </p>
              <p className={cn("m-0 mb-2.5 font-nunito text-xs", tw.textSec)}>
                {geoStatus === "requesting"
                  ? "Izinkan akses lokasi di browser Anda."
                  : "Klik tombol untuk mendeteksi lokasi otomatis."}
              </p>
              {geoStatus === "idle" && (
                <button
                  onClick={requestGeolocation}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border-none bg-brand-700 px-4 py-1.5 font-nunito text-xs font-bold text-white"
                >
                  Deteksi Lokasi Saya
                </button>
              )}
              {geoStatus === "requesting" && (
                <div className="inline-flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-700/30 border-t-brand-700" />
                  <span className="font-nunito text-xs text-brand-700">
                    Menunggu izin...
                  </span>
                </div>
              )}
            </div>
          )}
          {geoStatus === "granted" && (
            <div
              className={cn(
                "mx-6 mt-5 flex items-center gap-2 rounded-md px-4 py-2.5",
                tw.successBg,
                "border",
                tw.successBorder
              )}
            >
              <span className="text-[13px] text-[#16a34a]">✓</span>
              <span
                className={cn(
                  "font-nunito text-xs font-semibold",
                  tw.successText
                )}
              >
                Lokasi terdeteksi — pin sudah diletakkan di posisi Anda
              </span>
              <button
                onClick={requestGeolocation}
                className={cn(
                  "ml-auto cursor-pointer border-none bg-transparent p-0 font-nunito text-[11px] font-bold underline",
                  tw.successText
                )}
              >
                Refresh
              </button>
            </div>
          )}
          {geoStatus === "denied" && (
            <div
              className={cn(
                "mx-6 mt-5 flex items-center gap-2 rounded-md px-4 py-2.5",
                tw.warnBg,
                "border",
                tw.warnBorder
              )}
            >
              <span className="text-[13px]">⚠️</span>
              <span className={cn("font-nunito text-xs", tw.warnText)}>
                Akses lokasi ditolak. Gunakan search atau klik peta secara
                manual.
              </span>
            </div>
          )}

          <div className="px-6 pb-3 pt-5">
            <label
              className={cn(
                "mb-1.5 block font-nunito text-[11px] font-bold tracking-[0.04em]",
                tw.textMuted
              )}
            >
              CARI LOKASI
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nama toko, alamat, atau area..."
                value={mapQuery}
                onChange={(e) => setMapQuery(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !mapSearchLoading && searchLocation()
                }
                className={cn(inputCls(isDark, false), "flex-1")}
              />
              <button
                onClick={searchLocation}
                disabled={mapSearchLoading || mapQuery.trim().length < 3}
                className={cn(
                  "flex h-10.5 shrink-0 items-center gap-1.5 rounded-md border-none px-4 font-nunito text-[13px] font-bold text-white",
                  mapSearchLoading || mapQuery.trim().length < 3
                    ? "cursor-not-allowed bg-[#64748b]"
                    : "cursor-pointer bg-brand-700"
                )}
              >
                {mapSearchLoading && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {mapSearchLoading ? "Mencari..." : "Cari"}
              </button>
            </div>
            {mapSearchError && (
              <p className="m-0 mt-1.5 font-nunito text-xs text-[#ef4444]">
                {mapSearchError}
              </p>
            )}
            {mapLabel && !mapSearchError && (
              <p
                className={cn(
                  "m-0 mt-1.5 font-nunito text-xs font-semibold",
                  tw.successText
                )}
              >
                📍 {mapLabel}
              </p>
            )}
            <p className={cn("m-0 mt-1 font-nunito text-[11px]", tw.textMuted)}>
              Klik langsung pada peta untuk memindahkan pin lokasi.
            </p>
          </div>

          <div
            className={cn(
              "relative mx-6 h-75 shrink-0 overflow-hidden rounded-lg border sm:h-90",
              tw.border
            )}
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
          </div>

          {mapMarker && (
            <div
              className={cn(
                "mx-6 mb-4 mt-3 flex items-center justify-between rounded-md border px-4 py-2",
                tw.border,
                tw.bg
              )}
            >
              <div className="flex gap-4">
                <span className={cn("font-nunito text-[11px]", tw.textMuted)}>
                  <strong className={tw.textSec}>Lat:</strong>{" "}
                  {mapMarker[0].toFixed(6)}
                </span>
                <span className={cn("font-nunito text-[11px]", tw.textMuted)}>
                  <strong className={tw.textSec}>Lng:</strong>{" "}
                  {mapMarker[1].toFixed(6)}
                </span>
              </div>
              <a
                href={`https://www.google.com/maps?q=${mapMarker[0]},${mapMarker[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-nunito text-[11px] font-bold text-brand-700 no-underline"
              >
                Buka Google Maps ↗
              </a>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex shrink-0 justify-end gap-3 border-t px-6 py-4",
            tw.border,
            tw.bg
          )}
        >
          <button
            onClick={closeMapModal}
            className={cn(
              "cursor-pointer rounded-md border bg-transparent px-5 py-2.5 font-nunito text-[13px]",
              tw.border,
              tw.textSec
            )}
          >
            Batal
          </button>
          <button
            onClick={confirmLocation}
            disabled={!mapMarker}
            className={cn(
              "rounded-md border-none px-5.5 py-2.5 font-nunito text-[13px] font-bold text-white",
              mapMarker
                ? "cursor-pointer bg-brand-700"
                : "cursor-not-allowed bg-[#64748b]"
            )}
          >
            {mapMarker ? "Simpan Lokasi" : "Pilih Lokasi di Peta"}
          </button>
        </div>
      </ModalShell>

      {/* ════════════════════════════════════════
          KTP SCAN MODAL
      ════════════════════════════════════════ */}
      <ModalShell open={ktpModalOpen} onClose={closeKtpModal} tw={tw}>
        <ModalHeader
          icon="🪪"
          title="Scan KTP"
          subtitle="Upload atau gunakan kamera"
          onClose={closeKtpModal}
          tw={tw}
        />
        <div className="flex-1 overflow-y-auto p-6">
          <TabSwitch
            options={[
              { value: "upload", label: "Upload File" },
              { value: "webcam", label: "Kamera" }
            ]}
            value={scanMode}
            onChange={(m) => {
              setScanMode(m as ScanMode)
              if (m === "upload") stopWebcam()
            }}
            tw={tw}
          />

          {scanMode === "upload" && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              {!ktpPreview ? (
                <div
                  onClick={() =>
                    ocrStatus !== "scanning" && fileInputRef.current?.click()
                  }
                  className={cn(
                    "rounded-lg border-[1.5px] border-dashed py-10 text-center transition-all hover:border-brand-700",
                    tw.panelBorder,
                    ocrStatus === "scanning"
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  )}
                >
                  <p className="m-0 mb-1.5 text-[28px]">📎</p>
                  <p className="m-0 font-nunito text-sm font-bold text-brand-700">
                    Klik untuk pilih foto KTP
                  </p>
                  <p
                    className={cn(
                      "m-0 mt-1 font-nunito text-[11px]",
                      tw.textMuted
                    )}
                  >
                    JPG, PNG, WEBP · Maks 5MB
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={ktpPreview}
                    alt="KTP Preview"
                    className={cn(
                      "max-h-50 w-full rounded-lg border object-cover",
                      tw.border
                    )}
                  />
                  {ocrStatus !== "scanning" && ocrStatus !== "success" && (
                    <button
                      onClick={() => {
                        setKtpPreview("")
                        setOcrStatus("idle")
                        setOcrError("")
                      }}
                      className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-none bg-black/50 text-xs text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {scanMode === "webcam" && (
            <div>
              <div className="relative mb-3 aspect-4/3 min-h-55 overflow-hidden rounded-lg bg-black sm:aspect-video sm:min-h-0">
                <video
                  ref={videoRef}
                  className="block h-full w-full object-cover"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                {!webcamActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <p className="m-0 font-nunito text-xs text-[#888888]">
                      Kamera belum aktif
                    </p>
                    <button
                      onClick={() => startWebcam()}
                      className="cursor-pointer rounded-md border-none bg-brand-700 px-5 py-2 font-nunito text-[13px] font-bold text-white"
                    >
                      Aktifkan Kamera
                    </button>
                  </div>
                )}
                {webcamActive && (
                  <div className="pointer-events-none absolute inset-4 rounded border-2 border-[#087463]/60" />
                )}
              </div>
              {webcamActive && cameras.length > 1 && (
                <div className="mb-3">
                  <label
                    className={cn(
                      "mb-1 block font-nunito text-[11px] font-bold",
                      tw.textMuted
                    )}
                  >
                    Pilih Kamera
                  </label>
                  <select
                    value={selectedCameraId}
                    onChange={(e) => handleCameraChange(e.target.value)}
                    className={inputCls(isDark, false)}
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
                </div>
              )}
              {webcamActive && (
                <div className="flex gap-2">
                  <button
                    onClick={captureWebcam}
                    disabled={ocrStatus === "scanning"}
                    className={cn(
                      "flex-1 cursor-pointer rounded-md border-none bg-brand-700 py-2.5 font-nunito text-[13px] font-bold text-white",
                      ocrStatus === "scanning" && "opacity-60"
                    )}
                  >
                    📸 Ambil Foto
                  </button>
                  <button
                    onClick={stopWebcam}
                    className={cn(
                      "cursor-pointer rounded-md border bg-transparent px-4 py-2.5 font-nunito text-[13px]",
                      tw.border,
                      tw.textSec
                    )}
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          )}

          <StatusBanner
            status={ocrStatus}
            loadingText="Sedang membaca KTP..."
            successText="Data KTP berhasil dibaca! Menutup..."
            error={ocrError}
            onRetry={() => {
              setOcrStatus("idle")
              setOcrError("")
              setKtpPreview("")
            }}
            tw={tw}
          />
        </div>
      </ModalShell>

      {/* ════════════════════════════════════════
          SIGNATURE MODAL
      ════════════════════════════════════════ */}
      <ModalShell open={signModalOpen} onClose={closeSignModal} tw={tw}>
        <ModalHeader
          icon="✍️"
          title="Tanda Tangan Digital"
          subtitle="Gambar atau upload tanda tangan Anda"
          onClose={closeSignModal}
          tw={tw}
        />
        <div className="flex-1 overflow-y-auto p-6">
          <TabSwitch
            options={[
              { value: "draw", label: "Gambar" },
              { value: "type", label: "Ketik" },
              { value: "upload", label: "Upload" }
            ]}
            value={signMode}
            onChange={(m) => {
              setSignMode(m as "draw" | "upload" | "type")
              setSignPreview("")
              setSignTypedText("")
            }}
            tw={tw}
          />

          {signMode === "draw" && (
            <div>
              <p className={cn("m-0 mb-2 font-nunito text-xs", tw.textMuted)}>
                Gambar tanda tangan Anda di area bawah ini:
              </p>
              <div
                className={cn(
                  "touch-none overflow-hidden rounded-lg border-[1.5px] bg-white",
                  tw.panelBorder,
                  isDark && "bg-[#1a1a2e]"
                )}
                style={{ cursor: "crosshair" }}
              >
                <canvas
                  ref={signatureCanvasRef}
                  width={460}
                  height={180}
                  className="block h-45 w-full"
                  onMouseDown={startSign}
                  onMouseMove={drawSign}
                  onMouseUp={stopSign}
                  onMouseLeave={stopSign}
                  onTouchStart={startSignTouch}
                  onTouchMove={drawSignTouch}
                  onTouchEnd={stopSign}
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className={cn("m-0 font-nunito text-[11px]", tw.textMuted)}>
                  {hasSignature
                    ? "Klik Simpan untuk menyimpan tanda tangan"
                    : "Belum ada tanda tangan"}
                </p>
                <button
                  onClick={clearSignature}
                  className={cn(
                    "cursor-pointer rounded border bg-transparent px-3.5 py-1 font-nunito text-xs",
                    tw.border,
                    tw.textSec
                  )}
                >
                  Bersihkan
                </button>
              </div>
            </div>
          )}

          {signMode === "type" && (
            <div>
              <div className="mb-4">
                <label
                  className={cn(
                    "mb-1.5 block font-nunito text-[11px] font-bold tracking-[0.04em]",
                    tw.textMuted
                  )}
                >
                  PILIH GAYA FONT
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { font: "Great Vibes", label: "Great Vibes" },
                    { font: "Dancing Script", label: "Dancing Script" },
                    { font: "Pinyon Script", label: "Pinyon Script" },
                    { font: "Parisienne", label: "Parisienne" }
                  ].map(({ font, label }) => (
                    <div
                      key={font}
                      onClick={() => setSignFontFamily(font)}
                      className={cn(
                        "cursor-pointer rounded-md border px-3 py-2 text-center transition-all",
                        signFontFamily === font
                          ? cn(tw.panelBorder, tw.panelBg)
                          : cn(tw.border, tw.bgPaper)
                      )}
                    >
                      <p
                        className={cn("m-0 text-xl leading-tight", tw.text)}
                        style={{ fontFamily: `'${font}', cursive` }}
                      >
                        Tanda Tangan
                      </p>
                      <p
                        className={cn(
                          "m-0 mt-0.5 font-nunito text-[10px]",
                          tw.textMuted
                        )}
                      >
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4 flex items-center gap-3">
                <label
                  className={cn(
                    "whitespace-nowrap font-nunito text-[11px] font-bold",
                    tw.textMuted
                  )}
                >
                  UKURAN
                </label>
                <input
                  type="range"
                  min={24}
                  max={72}
                  value={signFontSize}
                  onChange={(e) => setSignFontSize(Number(e.target.value))}
                  className="flex-1"
                />
                <span
                  className={cn("min-w-8 font-nunito text-xs", tw.textMuted)}
                >
                  {signFontSize}px
                </span>
              </div>

              <p className={cn("m-0 mb-2 font-nunito text-xs", tw.textMuted)}>
                Ketik nama atau tanda tangan Anda:
              </p>
              <input
                type="text"
                placeholder="Nama Anda..."
                value={signTypedText}
                onChange={(e) => setSignTypedText(e.target.value)}
                maxLength={40}
                className={cn(inputCls(isDark, false), "mb-3")}
              />

              <div className="flex min-h-25 items-center justify-center overflow-hidden rounded-lg border-[0.5px] border-gray-200 bg-white p-4">
                {signTypedText.trim() ? (
                  <p
                    className="m-0 max-w-full wrap-break-word text-center text-[#111111]"
                    style={{
                      fontFamily: `'${signFontFamily}', cursive`,
                      fontSize: signFontSize
                    }}
                  >
                    {signTypedText}
                  </p>
                ) : (
                  <p
                    className={cn("m-0 font-nunito text-[13px]", tw.textMuted)}
                  >
                    Preview tanda tangan akan muncul di sini
                  </p>
                )}
              </div>
            </div>
          )}

          {signMode === "upload" && (
            <>
              <input
                ref={signFileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleSignFileUpload}
                className="hidden"
              />
              {!signPreview ? (
                <div
                  onClick={() =>
                    signUploadStatus !== "uploading" &&
                    signFileRef.current?.click()
                  }
                  className={cn(
                    "rounded-lg border-[1.5px] border-dashed py-10 text-center transition-all hover:border-brand-700",
                    tw.panelBorder,
                    signUploadStatus === "uploading"
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  )}
                >
                  <p className="m-0 mb-1.5 text-[28px]">✍️</p>
                  <p className="m-0 font-nunito text-sm font-bold text-brand-700">
                    Upload foto tanda tangan
                  </p>
                  <p
                    className={cn(
                      "m-0 mt-1 font-nunito text-[11px]",
                      tw.textMuted
                    )}
                  >
                    JPG, PNG, WEBP · Maks 5MB · Latar putih lebih baik
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={signPreview}
                    alt="Preview Tanda Tangan"
                    className={cn(
                      "max-h-45 w-full rounded-lg border bg-white object-contain",
                      tw.border
                    )}
                  />
                  {signUploadStatus !== "uploading" &&
                    signUploadStatus !== "success" && (
                      <button
                        onClick={() => {
                          setSignPreview("")
                          setSignUploadStatus("idle")
                          setSignError("")
                        }}
                        className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-none bg-black/50 text-xs text-white"
                      >
                        ✕
                      </button>
                    )}
                </div>
              )}
            </>
          )}

          <StatusBanner
            status={signUploadStatus}
            loadingText="Menyimpan tanda tangan..."
            successText="Tanda tangan berhasil disimpan! Menutup..."
            error={signError}
            onRetry={() => {
              setSignUploadStatus("idle")
              setSignError("")
              setSignPreview("")
            }}
            tw={tw}
          />
        </div>

        {(signMode === "draw" || signMode === "type") && (
          <div
            className={cn(
              "flex shrink-0 justify-end gap-3 border-t px-6 py-4",
              tw.border,
              tw.bg
            )}
          >
            <button
              onClick={closeSignModal}
              className={cn(
                "cursor-pointer rounded-md border bg-transparent px-5 py-2.5 font-nunito text-[13px]",
                tw.border,
                tw.textSec
              )}
            >
              Batal
            </button>
            <button
              onClick={signMode === "draw" ? saveSignature : saveTypedSignature}
              disabled={
                signMode === "draw"
                  ? !hasSignature || signUploadStatus === "uploading"
                  : !signTypedText.trim() || signUploadStatus === "uploading"
              }
              className={cn(
                "rounded-md border-none px-5.5 py-2.5 font-nunito text-[13px] font-bold text-white",
                (
                  signMode === "draw"
                    ? hasSignature && signUploadStatus !== "uploading"
                    : signTypedText.trim() && signUploadStatus !== "uploading"
                )
                  ? "cursor-pointer bg-brand-700"
                  : "cursor-not-allowed bg-[#64748b]"
              )}
            >
              Simpan Tanda Tangan
            </button>
          </div>
        )}
      </ModalShell>

      <Toast
        open={snackbar.open}
        msg={snackbar.msg}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </div>
  )
}
