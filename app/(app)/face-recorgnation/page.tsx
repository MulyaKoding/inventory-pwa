"use client"

import { useEffect, useRef, useState } from "react"
import * as faceapi from "face-api.js"
import { loadFaceApiModels } from "./faceApiLoader"

type EmployeeData = {
  id: string
  name: string
  position?: string
  employeeCode: string
  faceDescriptor: number[]
}

const DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions({
  inputSize: 410,
  scoreThreshold: 0.2
})

const MATCH_THRESHOLD = 0.45 // makin kecil makin ketat
const MIN_DETECTION_SCORE = 0.45 // minimal kualitas deteksi wajah
const CONSECUTIVE_MATCHES_NEEDED = 3 // harus cocok 3x berturut sebelum submit

export default function FaceAttendancePage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastMatchRef = useRef<{ id: string; time: number } | null>(null)
  const consecutiveRef = useRef<{ label: string; count: number }>({
    label: "",
    count: 0
  })

  const [modelsReady, setModelsReady] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [status, setStatus] = useState("Memuat model...")
  const [matcher, setMatcher] = useState<faceapi.FaceMatcher | null>(null)
  const [result, setResult] = useState<{
    name: string
    type: "clock_in" | "clock_out" | "already_done"
    message?: string
  } | null>(null)

  // 1. Load model + data karyawan
  useEffect(() => {
    ;(async () => {
      try {
        await loadFaceApiModels()

        const res = await fetch("/api/employees")
        const json = await res.json()
        const employees: EmployeeData[] = json.data || []

        if (employees.length === 0) {
          setStatus("Belum ada karyawan terdaftar. Silakan daftar wajah dulu.")
          setModelsReady(true)
          return
        }

        const labeled = employees.map(
          (emp) =>
            new faceapi.LabeledFaceDescriptors(emp.id, [
              new Float32Array(emp.faceDescriptor)
            ])
        )
        setMatcher(new faceapi.FaceMatcher(labeled, MATCH_THRESHOLD))
        ;(window as any).__employees = employees

        setModelsReady(true)
        setStatus("Siap untuk absen")
      } catch (err) {
        console.error(err)
        setStatus("Gagal memuat data")
      }
    })()

    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraOn(true)
      setResult(null)
      consecutiveRef.current = { label: "", count: 0 }
    } catch (err) {
      console.error(err)
      setStatus("Tidak bisa mengakses kamera")
    }
  }

  const stopCamera = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraOn(false)
    consecutiveRef.current = { label: "", count: 0 }

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const submitAttendance = async (employeeId: string, score: number) => {
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, matchScore: score })
      })
      const json = await res.json()
      const employees: EmployeeData[] = (window as any).__employees || []
      const emp = employees.find((e) => e.id === employeeId)

      setResult({
        name: emp?.name || "Karyawan",
        type: json.type,
        message: json.message
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleVideoPlay = () => {
    if (!modelsReady || !matcher) return

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return

      const detection = await faceapi
        .detectSingleFace(videoRef.current, DETECTOR_OPTIONS)
        .withFaceLandmarks()
        .withFaceDescriptor()

      const canvas = canvasRef.current
      const video = videoRef.current
      const displaySize = { width: video.videoWidth, height: video.videoHeight }
      faceapi.matchDimensions(canvas, displaySize)
      const ctx = canvas.getContext("2d")
      ctx?.clearRect(0, 0, canvas.width, canvas.height)

      if (!detection) {
        setStatus("Posisikan wajah di tengah kamera")
        consecutiveRef.current = { label: "", count: 0 }
        return
      }

      // Tolak deteksi berkualitas rendah (blur, miring ekstrem, dsb)
      if (detection.detection.score < MIN_DETECTION_SCORE) {
        setStatus("Perbaiki posisi wajah / pencahayaan")
        consecutiveRef.current = { label: "", count: 0 }
        return
      }

      const resized = faceapi.resizeResults(detection, displaySize)
      faceapi.draw.drawDetections(canvas, resized)

      const match = matcher.findBestMatch(detection.descriptor)

      if (match.label === "unknown") {
        setStatus("Wajah tidak dikenali")
        consecutiveRef.current = { label: "", count: 0 }
        return
      }

      const score = 1 - match.distance

      // Hitung berapa kali berturut-turut wajah yang sama terdeteksi
      if (consecutiveRef.current.label === match.label) {
        consecutiveRef.current.count += 1
      } else {
        consecutiveRef.current = { label: match.label, count: 1 }
      }

      setStatus(
        `Wajah dikenali (${(score * 100).toFixed(0)}% cocok) — memverifikasi ${consecutiveRef.current.count}/${CONSECUTIVE_MATCHES_NEEDED}`
      )

      if (consecutiveRef.current.count < CONSECUTIVE_MATCHES_NEEDED) return

      // Cegah submit berulang untuk orang yang sama dalam 5 detik
      const now = Date.now()
      const last = lastMatchRef.current
      if (last && last.id === match.label && now - last.time < 5000) return

      lastMatchRef.current = { id: match.label, time: now }
      consecutiveRef.current = { label: "", count: 0 }
      submitAttendance(match.label, score)
    }, 400)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-2xl text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Absensi Wajah
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {status}
        </p>
      </div>

      {result && (
        <div
          className={`w-full max-w-2xl mb-4 rounded-xl px-4 py-3 text-sm font-medium ${
            result.type === "clock_in"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : result.type === "clock_out"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
          }`}
        >
          {result.type === "clock_in" && `✓ ${result.name} — Clock In berhasil`}
          {result.type === "clock_out" &&
            `✓ ${result.name} — Clock Out berhasil`}
          {result.type === "already_done" &&
            `${result.name} — ${result.message}`}
        </div>
      )}

      <div className="w-full max-w-2xl">
        <div className="relative aspect-[4/3] sm:aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 shadow-lg ring-1 ring-slate-200 dark:ring-slate-800">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onPlay={handleVideoPlay}
            className={`h-full w-full object-cover ${cameraOn ? "opacity-100" : "opacity-0"}`}
          />
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
          {!cameraOn && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
              Kamera belum aktif
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={startCamera}
            disabled={!modelsReady || cameraOn}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            Mulai Absen
          </button>
          <button
            onClick={stopCamera}
            disabled={!cameraOn}
            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  )
}
