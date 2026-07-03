"use client"

import { useEffect, useRef, useState } from "react"
import * as faceapi from "face-api.js"
import { loadFaceApiModels } from "../faceApiLoader"

export default function EnrollFacePage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const captureCanvasRef = useRef<HTMLCanvasElement>(null)

  const [modelsReady, setModelsReady] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [descriptor, setDescriptor] = useState<number[] | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [status, setStatus] = useState("Memuat model...")
  const [saving, setSaving] = useState(false)

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
    setStatus("Kamera aktif, posisikan wajah di tengah")
  }

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null
    stream?.getTracks().forEach((t) => t.stop())
    setCameraOn(false)
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

  const captureFace = async () => {
    if (!videoRef.current || !cameraOn) return
    setCapturing(true)
    setStatus("Mengambil sampel wajah, tetap di depan kamera...")

    const samples: Float32Array[] = []

    for (let i = 0; i < 5; i++) {
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (detection) samples.push(detection.descriptor)
      await new Promise((r) => setTimeout(r, 250))
    }

    if (samples.length === 0) {
      setStatus(
        "Wajah tidak terdeteksi, coba lagi dengan pencahayaan lebih baik"
      )
      setCapturing(false)
      return
    }

    const avg = new Array(128).fill(0)
    samples.forEach((desc) => desc.forEach((val, i) => (avg[i] += val)))
    const finalDescriptor = avg.map((v) => v / samples.length)

    const blob = await snapshotPhoto()
    if (blob) {
      setPhotoBlob(blob)
      setPhotoPreview(URL.createObjectURL(blob))
    }

    setDescriptor(finalDescriptor)
    setStatus(
      `Berhasil ambil ${samples.length} sampel wajah. Silakan lengkapi data & simpan.`
    )
    setCapturing(false)
  }

  const handleSave = async () => {
    if (!descriptor || !form.name) {
      setStatus("Lengkapi nama dan ambil wajah terlebih dahulu")
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

      setStatus("Menyimpan data karyawan...")
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, faceDescriptor: descriptor, photoUrl })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      setStatus(`Karyawan "${form.name}" berhasil didaftarkan`)
      setDescriptor(null)
      setPhotoBlob(null)
      setPhotoPreview(null)
      setForm({ name: "", employeeCode: "", position: "", email: "" })
    } catch (err: any) {
      setStatus(err.message || "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

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
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-900 shadow-lg ring-1 ring-slate-200 dark:ring-slate-800">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`h-full w-full object-cover ${cameraOn ? "opacity-100" : "opacity-0"}`}
          />
          {!cameraOn && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
              Kamera belum aktif
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
          ) : (
            <>
              <button
                onClick={captureFace}
                disabled={capturing}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                {capturing ? "Memindai..." : "Ambil Wajah"}
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
            disabled={!descriptor || saving}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            {saving ? "Menyimpan..." : "Simpan Karyawan"}
          </button>
        </div>
      </div>
    </div>
  )
}
