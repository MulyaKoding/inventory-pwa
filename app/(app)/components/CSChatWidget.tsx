"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "../../lib/utils"

interface CSChatWidgetProps {
  whatsappNumber?: string
  agentName?: string
  agentRole?: string
  greeting?: string
  offlineMessage?: string
  onlineHours?: string
}

// Keyframes Tailwind tidak punya bawaan — taruh sekali di sini, dipakai lewat
// arbitrary value: animate-[cs-pop-in_0.4s_...]. Kalau mau, pindahkan blok ini
// ke globals.css (di bawah @theme) supaya konsisten dengan animasi lain di app.
const KEYFRAMES = `
  @keyframes cs-pop-in {
    0%   { opacity:0; transform:scale(.72); }
    70%  { transform:scale(1.04); }
    100% { opacity:1; transform:scale(1); }
  }
  @keyframes cs-slide-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes cs-bubble-in {
    from { opacity:0; transform:translateX(12px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes cs-pulse {
    0%,100% { transform:scale(1); box-shadow:0 0 0 0 rgba(59,130,246,.4); }
    50%     { transform:scale(1.06); box-shadow:0 0 0 10px rgba(59,130,246,0); }
  }
  @keyframes cs-dot-blink {
    0%,80%,100% { transform:scale(0); opacity:.3; }
    40%         { transform:scale(1); opacity:1; }
  }
  @keyframes cs-sheet-in {
    from { transform:translateY(110%); }
    to   { transform:translateY(0); }
  }
  @keyframes cs-backdrop-in {
    from { opacity:0; }
    to   { opacity:1; }
  }
`

export default function CSChatWidget({
  whatsappNumber = "6285218789439",
  agentName = "STOCKR Support",
  agentRole = "Customer Success",
  greeting = "Halo! Ada yang bisa kami bantu? 👋",
  offlineMessage = "Kami sedang offline, tapi kamu bisa tinggalkan pesan dan kami akan balas secepatnya!",
  onlineHours = "Senin – Jumat, 08.00 – 17.00 WIB"
}: CSChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"form" | "sent">("form")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<{
    name?: string
    phone?: string
    message?: string
  }>({})
  const [showBubble, setShowBubble] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  const [pos, setPos] = useState({ x: 28, y: 28 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragged, setDragged] = useState(false)
  const dragStart = useRef<{
    mouseX: number
    mouseY: number
    posX: number
    posY: number
  } | null>(null)
  const fabRef = useRef<HTMLButtonElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setShowBubble(true), 3000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (showBubble) {
      const t = setTimeout(() => setShowBubble(false), 8000)
      return () => clearTimeout(t)
    }
  }, [showBubble])

  useEffect(() => {
    const now = new Date()
    const day = now.getDay()
    const hour = now.getHours()
    setIsOnline(day >= 1 && day <= 5 && hour >= 8 && hour < 17)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      setDragged(false)
      dragStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        posX: pos.x,
        posY: pos.y
      }
      setIsDragging(true)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [pos]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !dragStart.current) return
      const dx = e.clientX - dragStart.current.mouseX
      const dy = e.clientY - dragStart.current.mouseY
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) setDragged(true)
      const newX = Math.max(8, dragStart.current.posX - dx)
      const newY = Math.max(8, dragStart.current.posY - dy)
      const vw = window.innerWidth
      const vh = window.innerHeight
      const FAB_SIZE = 72
      setPos({
        x: Math.min(newX, vw - FAB_SIZE),
        y: Math.min(newY, vh - FAB_SIZE)
      })
    },
    [isDragging]
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(false)
      dragStart.current = null
      if (!dragged) {
        setOpen((v) => !v)
        setShowBubble(false)
      }
    },
    [dragged]
  )

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 600

  const PANEL_WIDTH = 390
  const PANEL_HEIGHT = 520
  const FAB_W = 58
  const FAB_H = 58
  const GAP = 10
  const MARGIN = 8

  const vwNow = typeof window !== "undefined" ? window.innerWidth : 1440
  const vhNow = typeof window !== "undefined" ? window.innerHeight : 900

  const fabLeftEdge = vwNow - pos.x - FAB_W
  const fabTopEdge = vhNow - pos.y - FAB_H

  const openRight = pos.x + PANEL_WIDTH > vwNow - MARGIN
  const horizStyle: React.CSSProperties = openRight
    ? { left: Math.max(MARGIN, fabLeftEdge) }
    : { right: pos.x }

  const openDown = fabTopEdge - GAP - PANEL_HEIGHT < MARGIN
  const vertStyle: React.CSSProperties = openDown
    ? { top: Math.max(MARGIN, fabTopEdge + FAB_H + GAP) }
    : { bottom: pos.y + FAB_H + GAP }

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9998,
    ...horizStyle,
    ...vertStyle
  }

  const bubbleStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9998,
    ...horizStyle,
    ...vertStyle
  }

  const transformOrigin = isMobile
    ? "bottom center"
    : `${openDown ? "top" : "bottom"} ${openRight ? "left" : "right"}`

  const validate = () => {
    const err: typeof errors = {}
    if (!name.trim()) err.name = "Nama wajib diisi"
    if (!phone.trim()) err.phone = "Nomor HP wajib diisi"
    else if (!/^[0-9+\-\s]{8,15}$/.test(phone.trim()))
      err.phone = "Nomor HP tidak valid"
    if (!message.trim()) err.message = "Pesan wajib diisi"
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const text = encodeURIComponent(
      `Halo STOCKR! 👋\n\nNama: ${name}\nNo. HP: ${phone}\n\nPesan:\n${message}`
    )
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank")
    setStep("sent")
  }

  const handleReset = () => {
    setStep("form")
    setName("")
    setPhone("")
    setMessage("")
    setErrors({})
  }

  const inputBase =
    "box-border h-10.5 w-full rounded-[10px] border-[1.5px] border-slate-200 bg-white px-3.5 font-nunito text-sm font-semibold text-slate-900 outline-none transition-[border-color,box-shadow] focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,.12)]"

  const panelInner = (
    <>
      {/* ── HEADER ── */}
      <div className="relative overflow-hidden bg-linear-to-br from-brand-900 to-brand-700 px-5 pb-4 pt-5">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-size-[28px_28px]" />

        <div className="relative z-10 mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-500 to-brand-400 text-base font-extrabold text-white shadow-[0_4px_12px_rgba(0,0,0,.2)]">
              CS
            </div>
            <div>
              <div className="font-nunito text-[15px] font-extrabold leading-tight text-white">
                {agentName}
              </div>
              <div className="mt-0.5 font-nunito text-xs font-semibold text-white/60">
                {agentRole}
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/75 transition-colors hover:bg-white/20 hover:text-white"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative z-10 flex items-center gap-1.75">
          <div
            className={cn(
              "h-1.75 w-1.75 shrink-0 rounded-full",
              isOnline
                ? "bg-emerald-400 shadow-[0_0_0_2px_rgba(52,211,153,.3)]"
                : "bg-red-400"
            )}
          />
          <span className="font-nunito text-xs font-semibold text-white/75">
            {isOnline
              ? "Online sekarang · Biasanya balas dalam 5 menit"
              : "Offline"}
          </span>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="p-5">
        {step === "form" ? (
          <>
            <div className="mb-4.5 animate-[cs-slide-up_0.4s_ease_both] rounded-2xl border-l-[3px] border-brand-500 bg-blue-50 px-4 py-3.5">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex items-center gap-1 py-0.5">
                  <span className="h-1.5 w-1.5 animate-[cs-dot-blink_1.2s_ease-in-out_infinite] rounded-full bg-brand-500" />
                  <span
                    className="h-1.5 w-1.5 animate-[cs-dot-blink_1.2s_ease-in-out_infinite] rounded-full bg-brand-500"
                    style={{ animationDelay: ".2s" }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-[cs-dot-blink_1.2s_ease-in-out_infinite] rounded-full bg-brand-500"
                    style={{ animationDelay: ".4s" }}
                  />
                </div>
                <span className="font-nunito text-[11px] font-semibold text-slate-400">
                  STOCKR Support
                </span>
              </div>
              <div className="font-nunito text-sm font-semibold leading-relaxed text-gray-700">
                {greeting}
              </div>
              {!isOnline && (
                <div className="mt-1.5 font-nunito text-xs leading-relaxed text-slate-500">
                  {offlineMessage}
                </div>
              )}
            </div>

            <div
              className="mb-3.5 animate-[cs-slide-up_0.4s_ease_both]"
              style={{ animationDelay: ".05s" }}
            >
              <label className="mb-1.25 block font-nunito text-xs font-bold uppercase tracking-wide text-gray-700">
                Nama Kamu *
              </label>
              <input
                className={cn(inputBase, errors.name && "border-red-500")}
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setErrors((p) => ({ ...p, name: undefined }))
                }}
              />
              {errors.name && (
                <div className="mt-1 font-nunito text-[11px] font-semibold text-red-500">
                  ⚠ {errors.name}
                </div>
              )}
            </div>

            <div
              className="mb-3.5 animate-[cs-slide-up_0.4s_ease_both]"
              style={{ animationDelay: ".1s" }}
            >
              <label className="mb-1.25 block font-nunito text-xs font-bold uppercase tracking-wide text-gray-700">
                Nomor HP *
              </label>
              <input
                className={cn(inputBase, errors.phone && "border-red-500")}
                placeholder="Contoh: 08123456789"
                value={phone}
                type="tel"
                onChange={(e) => {
                  setPhone(e.target.value)
                  setErrors((p) => ({ ...p, phone: undefined }))
                }}
              />
              {errors.phone && (
                <div className="mt-1 font-nunito text-[11px] font-semibold text-red-500">
                  ⚠ {errors.phone}
                </div>
              )}
            </div>

            <div
              className="mb-3.5 animate-[cs-slide-up_0.4s_ease_both]"
              style={{ animationDelay: ".15s" }}
            >
              <label className="mb-1.25 block font-nunito text-xs font-bold uppercase tracking-wide text-gray-700">
                Pesan *
              </label>
              <textarea
                className={cn(
                  "box-border min-h-20 w-full resize-none rounded-[10px] border-[1.5px] border-slate-200 bg-white px-3.5 py-2.5 font-nunito text-sm font-semibold leading-relaxed text-slate-900 outline-none transition-[border-color,box-shadow] focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,.12)]",
                  errors.message && "border-red-500"
                )}
                placeholder="Tulis pertanyaan atau kebutuhanmu di sini..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  setErrors((p) => ({ ...p, message: undefined }))
                }}
              />
              {errors.message && (
                <div className="mt-1 font-nunito text-[11px] font-semibold text-red-500">
                  ⚠ {errors.message}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              className="mt-1 flex h-11.5 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-br from-brand-700 to-brand-500 font-nunito text-[15px] font-extrabold text-white shadow-[0_4px_16px_rgba(59,130,246,.35)] transition-transform hover:-translate-y-px hover:shadow-[0_6px_22px_rgba(59,130,246,.45)] active:scale-[0.98]"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.89.524 3.656 1.435 5.163L2 22l4.978-1.405A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
              Chat via WhatsApp
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span className="font-nunito text-[11px] font-semibold text-slate-400">
                {onlineHours}
              </span>
            </div>
          </>
        ) : (
          <div className="animate-[cs-slide-up_0.4s_ease_both] px-0 pb-1 pt-2 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,rgba(30,58,138,.08),rgba(59,130,246,.15))]">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="mb-2 font-nunito text-[17px] font-extrabold text-slate-900">
              Pesan Terkirim! 🎉
            </div>
            <div className="mb-5 font-nunito text-[13px] leading-relaxed text-slate-500">
              WhatsApp sudah terbuka. Tim kami akan segera merespons pesanmu,{" "}
              <strong>{name}</strong>!
            </div>
            <button
              onClick={handleReset}
              className="h-10.5 w-full rounded-[10px] border-[1.5px] border-slate-200 bg-white font-nunito text-sm font-bold text-brand-700 transition-colors hover:border-brand-500 hover:bg-blue-50"
            >
              ← Kirim Pesan Lain
            </button>
          </div>
        )}
      </div>
    </>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {open && isMobile && (
        <div
          className="fixed inset-0 z-9997 animate-[cs-backdrop-in_0.25s_ease_forwards] bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {open &&
        (isMobile ? (
          <div
            ref={wrapRef}
            className="fixed inset-x-0 bottom-0 z-9998 animate-[cs-sheet-in_0.38s_cubic-bezier(0.32,0,0.15,1)_forwards] pb-[env(safe-area-inset-bottom,0px)]"
          >
            <div className="mx-auto mb-2 mt-2.5 h-1.25 w-11 rounded-full bg-black/15" />
            <div className="w-full max-h-[88vh] overflow-y-auto rounded-t-[20px] bg-white shadow-[0_24px_64px_rgba(0,0,0,.18),0_0_0_1px_rgba(0,0,0,.06)]">
              {panelInner}
            </div>
          </div>
        ) : (
          <div ref={wrapRef} style={panelStyle}>
            <div
              className="w-97.5 animate-[cs-pop-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards] overflow-hidden rounded-[20px] bg-white shadow-[0_24px_64px_rgba(0,0,0,.18),0_0_0_1px_rgba(0,0,0,.06)]"
              style={{ transformOrigin }}
            >
              {panelInner}
            </div>
          </div>
        ))}

      {!open && showBubble && (
        <div style={bubbleStyle}>
          <div className="relative max-w-55 animate-[cs-bubble-in_0.35s_ease_forwards] rounded-2xl bg-white p-3 px-4 shadow-[0_8px_28px_rgba(0,0,0,.12),0_0_0_1px_rgba(0,0,0,.05)] after:absolute after:-bottom-2 after:right-5 after:h-0 after:w-0 after:border-l-8 after:border-r-8 after:border-t-8 after:border-l-transparent after:border-r-transparent after:border-t-white after:content-['']">
            <button
              onClick={() => setShowBubble(false)}
              className="absolute right-2 top-2 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-100 text-[10px] text-slate-400 transition-colors hover:bg-slate-200"
            >
              ✕
            </button>
            <div className="font-nunito text-[13px] font-bold leading-relaxed text-slate-900">
              Ada yang bisa kami bantu? 👋
            </div>
            <div className="mt-0.75 font-nunito text-[11px] font-semibold text-slate-400">
              Klik untuk chat dengan CS kami
            </div>
          </div>
        </div>
      )}

      <div
        className="fixed z-9999 inline-flex flex-col items-end"
        style={{ bottom: pos.y, right: pos.x }}
      >
        <button
          ref={fabRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          aria-label="Chat with support"
          className={cn(
            "relative flex h-14.5 w-14.5 select-none touch-none items-center justify-center rounded-[18px] bg-linear-to-br from-brand-700 to-brand-500 shadow-[0_8px_24px_rgba(59,130,246,.5)] transition-[box-shadow,border-radius,transform]",
            isDragging
              ? "scale-[1.08] cursor-grabbing rounded-[14px] shadow-[0_16px_40px_rgba(59,130,246,.65)]"
              : "cursor-grab animate-[cs-pulse_2.4s_ease-in-out_infinite] hover:animate-none hover:shadow-[0_12px_32px_rgba(59,130,246,.6)]"
          )}
        >
          {open ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.89.524 3.656 1.435 5.163L2 22l4.978-1.405A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
          )}
          {!open && (
            <div className="pointer-events-none absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border-[2.5px] border-white bg-red-500 text-[10px] font-extrabold text-white">
              1
            </div>
          )}
        </button>
      </div>
    </>
  )
}
