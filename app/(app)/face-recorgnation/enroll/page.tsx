"use client"

import { useEffect, useRef, useState } from "react"
import * as faceapi from "face-api.js"
import { loadFaceApiModels } from "../faceApiLoader"

const DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions({
  inputSize: 416,
  scoreThreshold: 0.2
})

const MIN_DETECTION_SCORE = 0.35
const TOTAL_STEPS = 3

export default function EnrollFacePage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const captureCanvasRef = useRef<HTMLCanvasElement>(null)
  const liveDetectRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scoreHistoryRef = useRef<number[]>([])

  const [modelsReady, setModelsReady] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [descriptors, setDescriptors] = useState<Float32Array[]>([])
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [status, setStatus] = useState("Memuat model...")
  const [saving, setSaving] = useState(false)
  const [liveScore, setLiveScore] = useState<number | null>(null)
  const [toast, setToast] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (type: "success" | "error", message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToast({ type, message })
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000)
  }

  const [form, setForm] = useState({
    name: "",
    employeeCode: "",
    position: "",
    email: ""
  })

  useEffect(() => {
    ;(async () => {
      try {
        await loadFaceApiModels()
        setModelsReady(true)
        setStatus("Model siap")
      } catch {
        setStatus("Gagal memuat model")
      }
    })()
    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    })
    if (videoRef.current) videoRef.current.srcObject = stream
    setCameraOn(true)
    setDescriptors([])
    setStatus("Posisikan wajah di dalam bingkai")
    startLiveDetection()
  }

  const stopCamera = () => {
    if (liveDetectRef.current) clearInterval(liveDetectRef.current)
    const stream = videoRef.current?.srcObject as MediaStream | null
    stream?.getTracks().forEach((t) => t.stop())
    setCameraOn(false)
    setLiveScore(null)
    scoreHistoryRef.current = []
  }

  // Live detection cuma untuk hitung skor confidence (smoothed), tidak perlu gambar kotak lagi
  const startLiveDetection = () => {
    liveDetectRef.current = setInterval(async () => {
      if (!videoRef.current) return
      const video = videoRef.current
      if (video.paused || video.ended || video.videoWidth === 0) return

      const detection = await faceapi.detectSingleFace(video, DETECTOR_OPTIONS)

      if (detection) {
        const rawScore = detection.score
        scoreHistoryRef.current.push(rawScore)
        if (scoreHistoryRef.current.length > 4) scoreHistoryRef.current.shift()
        const smoothedScore =
          scoreHistoryRef.current.reduce((a, b) => a + b, 0) /
          scoreHistoryRef.current.length
        setLiveScore(smoothedScore)
      } else {
        scoreHistoryRef.current = []
        setLiveScore(null)
      }
    }, 200)
  }

  const snapshotPhoto = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = videoRef.current
      const canvas = captureCanvasRef.current
      if (!video || !canvas) return resolve(null)

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9)
    })
  }

  const captureStep = async () => {
    if (!videoRef.current || !cameraOn) return
    setCapturing(true)
    setStatus("Memindai...")

    type DetectionResult = faceapi.WithFaceDescriptor<
      faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
    >
    let bestDetection: DetectionResult | null = null

    for (let i = 0; i < 6; i++) {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, DETECTOR_OPTIONS)
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (
        detection &&
        (!bestDetection ||
          detection.detection.score > bestDetection.detection.score)
      ) {
        bestDetection = detection
      }
      await new Promise((r) => setTimeout(r, 200))
    }

    if (!bestDetection || bestDetection.detection.score < MIN_DETECTION_SCORE) {
      setStatus(
        `Kualitas deteksi kurang (${bestDetection ? (bestDetection.detection.score * 100).toFixed(0) : 0}%). Perbaiki pencahayaan & posisi, coba lagi.`
      )
      setCapturing(false)
      return
    }

    const newDescriptors = [...descriptors, bestDetection.descriptor]
    setDescriptors(newDescriptors)

    if (newDescriptors.length === 1) {
      const blob = await snapshotPhoto()
      if (blob) {
        setPhotoBlob(blob)
        setPhotoPreview(URL.createObjectURL(blob))
      }
    }

    if (newDescriptors.length < TOTAL_STEPS) {
      setStatus(
        `Bagus! ${newDescriptors.length}/${TOTAL_STEPS} berhasil. Tetap di posisi, ambil lagi.`
      )
    } else {
      setStatus(`Semua ${TOTAL_STEPS} langkah selesai. Lengkapi data & simpan.`)
    }

    setCapturing(false)
  }

  const resetCapture = () => {
    setDescriptors([])
    setPhotoPreview(null)
    setPhotoBlob(null)
    if (cameraOn) setStatus("Posisikan wajah di dalam bingkai")
  }

  const handleSave = async () => {
    if (descriptors.length < TOTAL_STEPS || !form.name) {
      setStatus(
        "Lengkapi nama dan selesaikan semua langkah wajah terlebih dahulu"
      )
      showToast(
        "error",
        "Lengkapi nama dan selesaikan semua langkah wajah terlebih dahulu"
      )
      return
    }
    setSaving(true)
    try {
      let photoUrl: string | undefined
      if (photoBlob) {
        setStatus("Mengupload foto...")
        const fd = new FormData()
        fd.append("file", photoBlob, `${form.name.replace(/\s+/g, "-")}.jpg`)

        const uploadRes = await fetch("/api/upload/employee", {
          method: "POST",
          body: fd
        })
        const uploadJson = await uploadRes.json()
        if (!uploadRes.ok)
          throw new Error(uploadJson.error || "Gagal upload foto")
        photoUrl = uploadJson.url
      }

      const avg = new Array(128).fill(0)
      descriptors.forEach((desc) => desc.forEach((val, i) => (avg[i] += val)))
      const finalDescriptor = avg.map((v) => v / descriptors.length)

      setStatus("Menyimpan data karyawan...")
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          faceDescriptor: finalDescriptor,
          photoUrl
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      setStatus(`Karyawan "${form.name}" berhasil didaftarkan`)
      showToast("success", `Karyawan "${form.name}" berhasil didaftarkan!`)
      resetCapture()
      setForm({ name: "", employeeCode: "", position: "", email: "" })
      stopCamera()
    } catch (err: any) {
      const msg = err.message || "Gagal menyimpan data karyawan"
      setStatus(msg)
      showToast("error", msg)
    } finally {
      setSaving(false)
    }
  }

  const allStepsDone = descriptors.length >= TOTAL_STEPS
  const isReady = liveScore !== null && liveScore >= MIN_DETECTION_SCORE

  // Hitung 3 segmen busur lingkaran (masing-masing 120 derajat, dengan sedikit gap)
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const gap = 6 // gap antar segmen dalam derajat
  const segmentAngle = 360 / TOTAL_STEPS - gap
  const segments = Array.from({ length: TOTAL_STEPS }, (_, i) => {
    const startAngle = i * (360 / TOTAL_STEPS) - 90 + gap / 2
    return { index: i, startAngle, sweepAngle: segmentAngle }
  })

  const describeArc = (
    cx: number,
    cy: number,
    r: number,
    startDeg: number,
    sweepDeg: number,
    ryFactor = 1,
    rxFactor = 1
  ) => {
    const rx = r * rxFactor
    const ry = r * ryFactor
    const startRad = (startDeg * Math.PI) / 180
    const endRad = ((startDeg + sweepDeg) * Math.PI) / 180
    const x1 = cx + rx * Math.cos(startRad)
    const y1 = cy + ry * Math.sin(startRad)
    const x2 = cx + rx * Math.cos(endRad)
    const y2 = cy + ry * Math.sin(endRad)
    const largeArc = sweepDeg > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${rx} ${ry} 0 ${largeArc} 1 ${x2} ${y2}`
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center px-4 py-6 sm:py-10">
      {/* Toast notifikasi */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 z-50 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm sm:w-auto sm:max-w-md rounded-xl px-4 py-3 shadow-lg flex items-start gap-3 animate-[toast-in_0.25s_ease-out] ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 flex-shrink-0 mt-0.5"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 flex-shrink-0 mt-0.5"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.938.938 0 100-1.875.938.938 0 000 1.875z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className="flex-shrink-0 text-white/80 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L10.94 12l-5.72 5.72a.75.75 0 101.06 1.06L12 13.06l5.72 5.72a.75.75 0 101.06-1.06L13.06 12l5.72-5.72a.75.75 0 00-1.06-1.06L12 10.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      )}

      <div className="w-full max-w-md text-center mb-6">
        <div className="relative w-full flex flex-col items-center py-4">
          {/* Wrapper oval berisi video + ring progress mengelilinginya */}
          <div
            className="relative w-full max-w-[400px]"
            style={{ aspectRatio: "260 / 300" }}
          >
            {/* SVG ring progress, melingkar DI LUAR bentuk oval video */}
            {cameraOn && (
              <svg
                viewBox="0 0 280 360"
                className="pointer-events-none absolute inset-0 h-full w-full"
              >
                {segments.map((seg) => {
                  const done = seg.index < descriptors.length
                  return (
                    <path
                      key={seg.index}
                      d={describeArc(
                        140,
                        180,
                        158,
                        seg.startAngle,
                        seg.sweepAngle,
                        170 / 130,
                        1
                      )}
                      fill="none"
                      stroke={done ? "#22c55e" : "rgba(148,163,184,0.35)"}
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  )
                })}
              </svg>
            )}

            {/* Video dipotong jadi bentuk oval, seperti cermin */}
            <div
              className={`absolute inset-0 m-[18px] overflow-hidden bg-slate-900 shadow-lg ring-4 transition-colors ${
                isReady ? "ring-emerald-500" : "ring-slate-700"
              }`}
              style={{ borderRadius: "50%" }}
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`h-full w-full object-cover ${cameraOn ? "opacity-100" : "opacity-0"}`}
              />

              {!cameraOn && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs text-center px-6">
                  Kamera belum aktif
                </div>
              )}
            </div>

            {cameraOn && liveScore !== null && (
              <div
                className={`absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                  isReady
                    ? "bg-emerald-500/90 text-white"
                    : "bg-amber-500/90 text-white"
                }`}
              >
                {isReady ? "Siap diambil" : "Perbaiki posisi"}
              </div>
            )}

            <div className="absolute top-2 right-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900/70 text-white">
              {descriptors.length}/{TOTAL_STEPS}
            </div>

            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview wajah"
                className="absolute bottom-2 right-2 h-14 w-14 rounded-full object-cover ring-2 ring-emerald-500"
              />
            )}
          </div>
        </div>

        <canvas ref={captureCanvasRef} className="hidden" />

        <div className="mt-4 flex gap-2">
          {!cameraOn ? (
            <button
              onClick={startCamera}
              disabled={!modelsReady}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              Nyalakan Kamera
            </button>
          ) : allStepsDone ? (
            <>
              <button
                onClick={resetCapture}
                className="flex-1 rounded-xl bg-slate-200 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Ulangi Rekam
              </button>
              <button
                onClick={stopCamera}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white"
              >
                Matikan
              </button>
            </>
          ) : (
            <>
              <button
                onClick={captureStep}
                disabled={capturing}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                {capturing
                  ? "Memindai..."
                  : `Ambil (${descriptors.length}/${TOTAL_STEPS})`}
              </button>
              <button
                onClick={stopCamera}
                className="rounded-xl bg-slate-200 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Matikan
              </button>
            </>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Nama karyawan
            </label>
            <input
              placeholder="Contoh: Budi Santoso"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Kode karyawan <span className="text-slate-400">(opsional)</span>
            </label>
            <input
              placeholder="Contoh: EMP-001"
              value={form.employeeCode}
              onChange={(e) =>
                setForm({ ...form, employeeCode: e.target.value })
              }
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Jabatan <span className="text-slate-400">(opsional)</span>
            </label>
            <input
              placeholder="Contoh: Staff Gudang"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Email <span className="text-slate-400">(opsional)</span>
            </label>
            <input
              type="email"
              placeholder="Contoh: budi@perusahaan.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!allStepsDone || saving}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            {saving ? "Menyimpan..." : "Simpan Karyawan"}
          </button>
        </div>
      </div>
    </div>
  )
}
