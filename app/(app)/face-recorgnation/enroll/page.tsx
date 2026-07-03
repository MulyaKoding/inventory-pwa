"use client"

import { useEffect, useRef, useState } from "react"
import * as faceapi from "face-api.js"
import { loadFaceApiModels } from "../faceApiLoader"

const DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions({
  inputSize: 512,
  scoreThreshold: 0.5
})

const MIN_DETECTION_SCORE = 0.8

const POSES = [
  { label: "Menghadap lurus ke kamera", instruction: "Lihat lurus ke kamera" },
  {
    label: "Menoleh sedikit ke kiri",
    instruction: "Tolehkan wajah sedikit ke kiri"
  },
  {
    label: "Menoleh sedikit ke kanan",
    instruction: "Tolehkan wajah sedikit ke kanan"
  },
  { label: "Menunduk sedikit", instruction: "Tundukkan kepala sedikit" },
  { label: "Mendongak sedikit", instruction: "Dongakkan kepala sedikit" }
]

export default function EnrollFacePage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null) // overlay live
  const captureCanvasRef = useRef<HTMLCanvasElement>(null)
  const liveDetectRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [modelsReady, setModelsReady] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [descriptors, setDescriptors] = useState<Float32Array[]>([])
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [poseIndex, setPoseIndex] = useState(0)
  const [status, setStatus] = useState("Memuat model...")
  const [saving, setSaving] = useState(false)
  const [liveScore, setLiveScore] = useState<number | null>(null)

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
    setPoseIndex(0)
    setDescriptors([])
    setStatus(`Pose 1/${POSES.length}: ${POSES[0].instruction}`)
    startLiveDetection()
  }

  const stopCamera = () => {
    if (liveDetectRef.current) clearInterval(liveDetectRef.current)
    const stream = videoRef.current?.srcObject as MediaStream | null
    stream?.getTracks().forEach((t) => t.stop())
    setCameraOn(false)
    setLiveScore(null)
    const ctx = canvasRef.current?.getContext("2d")
    if (canvasRef.current && ctx)
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  // Overlay live: gambar kotak wajah + skor confidence supaya user bisa lihat posisi
  const startLiveDetection = () => {
    liveDetectRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return
      const video = videoRef.current
      if (video.paused || video.ended || video.videoWidth === 0) return

      const detection = await faceapi.detectSingleFace(video, DETECTOR_OPTIONS)

      const canvas = canvasRef.current
      const displaySize = { width: video.videoWidth, height: video.videoHeight }
      faceapi.matchDimensions(canvas, displaySize)
      const ctx = canvas.getContext("2d")
      ctx?.clearRect(0, 0, canvas.width, canvas.height)

      if (detection) {
        const resized = faceapi.resizeResults(detection, displaySize)
        const box = resized.box
        const score = detection.score

        setLiveScore(score)

        if (ctx) {
          ctx.strokeStyle = score >= MIN_DETECTION_SCORE ? "#22c55e" : "#f59e0b"
          ctx.lineWidth = 3
          ctx.strokeRect(box.x, box.y, box.width, box.height)
          ctx.fillStyle = ctx.strokeStyle
          ctx.font = "bold 14px sans-serif"
          ctx.fillText(`${(score * 100).toFixed(0)}%`, box.x, box.y - 8)
        }
      } else {
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

  // Ambil 1 sampel untuk pose saat ini, validasi kualitasnya
  const captureCurrentPose = async () => {
    if (!videoRef.current || !cameraOn) return
    setCapturing(true)
    setStatus("Memindai...")

    type DetectionResult = faceapi.WithFaceDescriptor<
      faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
    >
    let bestDetection: DetectionResult | null = null

    // coba beberapa kali dalam 1.5 detik, ambil yang confidence-nya tertinggi
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

    // ambil foto snapshot cuma di pose pertama (menghadap depan)
    if (poseIndex === 0) {
      const blob = await snapshotPhoto()
      if (blob) {
        setPhotoBlob(blob)
        setPhotoPreview(URL.createObjectURL(blob))
      }
    }

    const nextIndex = poseIndex + 1
    if (nextIndex < POSES.length) {
      setPoseIndex(nextIndex)
      setStatus(
        `Pose ${nextIndex + 1}/${POSES.length}: ${POSES[nextIndex].instruction}`
      )
    } else {
      setStatus(
        `Semua ${POSES.length} pose berhasil direkam. Lengkapi data & simpan.`
      )
    }

    setCapturing(false)
  }

  const resetCapture = () => {
    setDescriptors([])
    setPoseIndex(0)
    setPhotoPreview(null)
    setPhotoBlob(null)
    if (cameraOn) setStatus(`Pose 1/${POSES.length}: ${POSES[0].instruction}`)
  }

  const handleSave = async () => {
    if (descriptors.length < POSES.length || !form.name) {
      setStatus("Lengkapi nama dan selesaikan semua pose wajah terlebih dahulu")
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

      // rata-ratakan semua descriptor dari berbagai pose jadi 1 vektor final
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
      resetCapture()
      setForm({ name: "", employeeCode: "", position: "", email: "" })
    } catch (err: any) {
      setStatus(err.message || "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  const allPosesDone = descriptors.length >= POSES.length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-md text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Daftar Wajah Karyawan
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {status}
        </p>
      </div>

      <div className="w-full max-w-md">
        {/* Progress pose */}
        {cameraOn && (
          <div className="mb-3 flex gap-1.5">
            {POSES.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < descriptors.length
                    ? "bg-emerald-500"
                    : i === poseIndex
                      ? "bg-blue-500"
                      : "bg-slate-200 dark:bg-slate-800"
                }`}
              />
            ))}
          </div>
        )}

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-900 shadow-lg ring-1 ring-slate-200 dark:ring-slate-800">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
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
          {cameraOn && liveScore !== null && (
            <div
              className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
                liveScore >= MIN_DETECTION_SCORE
                  ? "bg-emerald-500/90 text-white"
                  : "bg-amber-500/90 text-white"
              }`}
            >
              {liveScore >= MIN_DETECTION_SCORE
                ? "Siap diambil"
                : "Perbaiki posisi"}
            </div>
          )}
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Preview wajah"
              className="absolute bottom-3 right-3 h-16 w-16 rounded-lg object-cover ring-2 ring-emerald-500"
            />
          )}
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
          ) : allPosesDone ? (
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
                onClick={captureCurrentPose}
                disabled={capturing}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                {capturing ? "Memindai..." : `Rekam Pose ${poseIndex + 1}`}
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
            disabled={!allPosesDone || saving}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            {saving ? "Menyimpan..." : "Simpan Karyawan"}
          </button>
        </div>
      </div>
    </div>
  )
}
