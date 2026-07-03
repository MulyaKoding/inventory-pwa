"use client"

import { useEffect, useRef, useState } from "react"
import * as faceapi from "face-api.js"
import { loadFaceApiModels } from "./faceApiLoader"

export default function FaceRecognitionPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [modelsReady, setModelsReady] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [faceCount, setFaceCount] = useState(0)
  const [status, setStatus] = useState("Memuat model...")

  // 1. Load model saat komponen mount
  useEffect(() => {
    ;(async () => {
      try {
        await loadFaceApiModels()
        setModelsReady(true)
        setStatus("Model siap")
      } catch (err) {
        console.error(err)
        setStatus("Gagal memuat model")
      }
    })()

    return () => {
      stopCamera()
    }
  }, [])

  // 2. Start webcam
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
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraOn(true)
    } catch (err) {
      console.error(err)
      setStatus("Tidak bisa mengakses kamera")
    }
  }

  const stopCamera = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setIsDetecting(false)
    setCameraOn(false)
    setFaceCount(0)
    setStatus("Kamera dimatikan")

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  // 3. Deteksi wajah secara realtime
  const handleVideoPlay = () => {
    if (!modelsReady) return
    setIsDetecting(true)

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return
      if (videoRef.current.paused || videoRef.current.ended) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        return
      }

      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptors()

      const video = videoRef.current
      const canvas = canvasRef.current
      const displaySize = { width: video.videoWidth, height: video.videoHeight }

      faceapi.matchDimensions(canvas, displaySize)
      const resized = faceapi.resizeResults(detections, displaySize)

      const ctx = canvas.getContext("2d")
      ctx?.clearRect(0, 0, canvas.width, canvas.height)

      faceapi.draw.drawDetections(canvas, resized)
      faceapi.draw.drawFaceLandmarks(canvas, resized)
      faceapi.draw.drawFaceExpressions(canvas, resized)

      setFaceCount(detections.length)
      setStatus(detections.length > 0 ? "Wajah terdeteksi" : "Mencari wajah...")
    }, 300)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center px-4 py-6 sm:py-10">
      {/* Header */}
      <div className="w-full max-w-2xl text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Face Recognition
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Deteksi wajah secara real-time menggunakan face-api.js
        </p>
      </div>

      {/* Status bar */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              !modelsReady
                ? "bg-amber-400 animate-pulse"
                : cameraOn
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-slate-300 dark:bg-slate-600"
            }`}
          />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {status}
          </span>
        </div>

        {cameraOn && (
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              faceCount > 0
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {faceCount} wajah
          </span>
        )}
      </div>

      {/* Video card */}
      <div className="w-full max-w-2xl">
        <div className="relative aspect-[4/3] sm:aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 shadow-lg ring-1 ring-slate-200 dark:ring-slate-800">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onPlay={handleVideoPlay}
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              cameraOn ? "opacity-100" : "opacity-0"
            }`}
          />
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />

          {/* Empty state overlay */}
          {!cameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="h-12 w-12 sm:h-14 sm:w-14"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              <p className="text-xs sm:text-sm">
                {modelsReady
                  ? "Kamera belum aktif"
                  : "Menyiapkan model deteksi..."}
              </p>
            </div>
          )}

          {/* Loading spinner while models load */}
          {!modelsReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-500 border-t-white" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={startCamera}
            disabled={!modelsReady || cameraOn}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 6.06L16.5 9.5v5l3.44 3.44a.75.75 0 001.28-.53V6.59a.75.75 0 00-1.28-.53z" />
            </svg>
            Start Camera
          </button>
          <button
            onClick={stopCamera}
            disabled={!cameraOn}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z"
                clipRule="evenodd"
              />
            </svg>
            Stop Camera
          </button>
        </div>
      </div>
    </div>
  )
}
