"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { cn } from "../../lib/utils"

type Step = "request" | "otp" | "newpass" | "done"
type RequestForm = { phone: string }
type NewPassForm = { password: string; confirm: string }

const imageWa =
  "https://res.cloudinary.com/dp0dtct3v/image/upload/v1775458567/whatsapp_objiub.png"

const KEYFRAMES = `
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes dotBounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-5px); opacity: 1; } }
  @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  @keyframes checkPop { 0% { transform: scale(0) rotate(-20deg); opacity: 0; } 70% { transform: scale(1.15) rotate(3deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
`

const inputBase =
  "h-12 w-full rounded-[10px] border-[1.5px] border-slate-200 bg-slate-50 px-11 text-sm font-semibold text-slate-900 outline-none transition-[border-color,box-shadow] placeholder:font-medium placeholder:text-slate-300 focus:border-brand-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,.12)] max-[480px]:h-11"

// ── Shared micro-components ─────────────────────────────────────
function LoadingDots() {
  return (
    <span className="flex gap-1.25">
      <span
        className="h-1.5 w-1.5 animate-[dotBounce_1s_ease-in-out_infinite] rounded-full bg-white"
        style={{ animationDelay: "0s" }}
      />
      <span
        className="h-1.5 w-1.5 animate-[dotBounce_1s_ease-in-out_infinite] rounded-full bg-white"
        style={{ animationDelay: ".15s" }}
      />
      <span
        className="h-1.5 w-1.5 animate-[dotBounce_1s_ease-in-out_infinite] rounded-full bg-white"
        style={{ animationDelay: ".3s" }}
      />
    </span>
  )
}

function EyeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const len = password.length
  const level = len === 0 ? -1 : len < 6 ? 0 : len < 8 ? 1 : len < 12 ? 2 : 3
  const barColors = [
    "bg-red-500",
    "bg-amber-500",
    "bg-brand-500",
    "bg-green-500"
  ]
  const labels = ["", "🔴 Terlalu lemah", "🟡 Lemah", "🔵 Sedang", "🟢 Kuat"]
  return (
    <>
      <div className="mt-1.75 flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-0.75 flex-1 rounded-sm transition-colors duration-300",
              i <= level ? barColors[level] : "bg-slate-200"
            )}
          />
        ))}
      </div>
      <p className="mt-1.25 text-[11px] font-semibold text-slate-400">
        {level === -1 ? "Masukkan password" : labels[level + 1]}
      </p>
    </>
  )
}

function OtpInput({
  digits,
  refs,
  onChange,
  onKeyDown,
  onPaste
}: {
  digits: string[]
  refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  onChange: (i: number, v: string) => void
  onKeyDown: (i: number, e: React.KeyboardEvent) => void
  onPaste: (e: React.ClipboardEvent) => void
}) {
  return (
    <div className="flex justify-center gap-2.5 max-[480px]:gap-1.75">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          className={cn(
            "h-15 w-13 rounded-xl border-2 border-slate-200 bg-slate-50 text-center text-2xl font-black text-slate-900 caret-transparent outline-none transition-[border-color,box-shadow,transform] duration-150 focus:-translate-y-0.5 focus:border-brand-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,.15)]",
            "max-[480px]:h-13.5 max-[480px]:w-11 max-[480px]:rounded-[10px] max-[480px]:text-[22px]",
            digit && "border-brand-700 bg-blue-50"
          )}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => onChange(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          autoFocus={i === 0}
        />
      ))}
    </div>
  )
}

// ── Step Tracker (left panel) ───────────────────────────────────
const TRACK_STEPS = [
  { label: "NOMOR", n: "01" },
  { label: "OTP", n: "02" },
  { label: "PASSWORD", n: "03" }
]
const STEP_INDEX: Record<Step, number> = {
  request: 0,
  otp: 1,
  newpass: 2,
  done: 3
}

function StepTracker({ step }: { step: Step }) {
  const idx = STEP_INDEX[step]
  return (
    <div className="mb-7 flex items-center">
      {TRACK_STEPS.map((s, i) => (
        <div key={i} className={cn("flex items-center", i < 2 && "flex-1")}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/15 bg-transparent text-[11px] font-black text-white/30 transition-all duration-300",
                i < idx && "border-green-500 bg-green-500/20 text-green-300",
                i === idx && "border-brand-500 bg-brand-500/20 text-brand-300"
              )}
            >
              {i < idx ? "✓" : s.n}
            </div>
            <div
              className={cn(
                "text-[10px] font-bold tracking-[.04em] text-white/30",
                i === idx && "text-white/70"
              )}
            >
              {s.label}
            </div>
          </div>
          {i < 2 && (
            <div
              className={cn(
                "mx-1 mb-4 h-px flex-1 bg-white/10",
                i < idx && "bg-green-500/40"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Left Panel ──────────────────────────────────────────────────
const TICKERS = [
  "RESET PASSWORD",
  "VERIFIKASI WHATSAPP",
  "DATA AMAN",
  "PROSES CEPAT",
  "GRATIS"
]
const TIPS = [
  {
    ico: "🔐",
    title: "Password Kuat",
    desc: "Gunakan kombinasi <strong>huruf, angka, dan simbol</strong> minimal 8 karakter"
  },
  {
    ico: "📵",
    title: "Jangan Bagikan OTP",
    desc: "Kode OTP bersifat <strong>rahasia</strong> dan hanya untuk kamu"
  },
  {
    ico: "⏱️",
    title: "OTP Berlaku 5 Menit",
    desc: "Segera masukkan kode sebelum <strong>kedaluwarsa</strong>"
  }
]

function LeftPanel({
  step,
  onLogoClick
}: {
  step: Step
  onLogoClick: () => void
}) {
  return (
    <div className="relative flex min-h-screen w-[52%] flex-col overflow-hidden bg-[linear-gradient(160deg,var(--color-brand-950)_0%,var(--color-brand-900)_30%,var(--color-brand-800)_60%,var(--color-brand-700)_100%)] max-[900px]:hidden">
      <div className="pointer-events-none absolute inset-0 animate-[gridPan_8s_linear_infinite] bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-size-[48px_48px]" />
      <div className="pointer-events-none absolute -right-30 -top-30 h-125 w-125 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,.22)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-95 w-95 rounded-full bg-[radial-gradient(circle,rgba(30,58,138,.18)_0%,transparent_70%)]" />

      <div className="absolute inset-x-0 top-0 flex h-9 items-center overflow-hidden border-b border-white/8 bg-black/sm">
        <div className="flex animate-[ticker_28s_linear_infinite] whitespace-nowrap">
          {[0, 1].map((i) => (
            <span key={i}>
              {TICKERS.map((t, j) => (
                <span
                  key={j}
                  className="inline-flex items-center gap-3.5 px-9 text-[11px] font-bold tracking-[.06em] text-white/50"
                >
                  <span className="h-1 w-1 rounded-full bg-brand-400" />
                  {t}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div
        className="relative z-2 flex cursor-pointer items-center gap-3 px-13 pt-13"
        onClick={onLogoClick}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] bg-linear-to-br from-brand-700 to-brand-500 shadow-[0_4px_12px_rgba(59,130,246,.35)]">
          <span className="text-[11px] font-black text-white">INV</span>
        </div>
        <div>
          <div className="text-lg font-black tracking-[.06em] text-white">
            STOCKR
          </div>
          <div className="mt-0.5 text-[11px] font-semibold text-white/40">
            Inventory Management System
          </div>
        </div>
      </div>

      <div className="relative z-2 flex-1 px-13 pt-10">
        <div className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 backdrop-blur-sm">
          <span className="relative h-1.5 w-1.5 rounded-full bg-amber-500 after:absolute after:-inset-0.75 after:animate-[pulse-ring_1.8s_ease-out_infinite] after:rounded-full after:bg-amber-500/40 after:content-['']" />
          <span className="text-[11px] font-extrabold tracking-[.05em] text-white/85">
            Keamanan Akun
          </span>
        </div>
        <h1 className="mb-3.5 text-[clamp(28px,3vw,40px)] font-black leading-[1.1] tracking-[-.02em] text-white">
          Lupa Password?
          <br />
          <em className="text-brand-400 not-italic">Atur Ulang Sekarang.</em>
        </h1>
        <p className="mb-7 max-w-90 text-sm font-medium leading-[1.7] text-white/60">
          Verifikasi identitas kamu melalui WhatsApp dan buat password baru yang
          aman dalam hitungan menit.
        </p>
        <StepTracker step={step} />
        <div className="mb-7 flex flex-col gap-3">
          {TIPS.map((t) => (
            <div
              key={t.title}
              className="flex items-start gap-3 rounded-[10px] border border-white/[.07] bg-white/4 px-3.5 py-3"
            >
              <span className="mt-px shrink-0 text-lg">{t.ico}</span>
              <div
                className="text-xs font-semibold leading-relaxed text-white/55"
                dangerouslySetInnerHTML={{
                  __html: `<strong style="color:rgba(255,255,255,.8)">${t.title}</strong><br/>${t.desc}`
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-2 flex items-center justify-between border-t border-white/[.07] px-13 py-5.5">
        <div className="flex items-center gap-2 text-xs font-bold text-white/35">
          <span className="h-1.75 w-1.75 rounded-full bg-green-500" />
          Sistem keamanan terenkripsi
        </div>
        <span className="text-[11px] font-bold text-white/20">
          v2.4.1 · 2026
        </span>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────
export default function ResetPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("request")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""))
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")
  const [serverSuccess, setServerSuccess] = useState("")
  const [countdown, setCountdown] = useState(0)

  const otpValue = otpDigits.join("")

  // ── Forms ──
  const requestForm = useForm<RequestForm>({ mode: "onBlur" })
  const newPassForm = useForm<NewPassForm>({ mode: "onBlur" })
  const passwordWatch = newPassForm.watch("password", "")
  const phoneValue = requestForm.watch("phone", "")

  // ── Countdown ──
  const startCountdown = () => {
    setCountdown(60)
    const interval = setInterval(() => {
      setCountdown((v) => {
        if (v <= 1) {
          clearInterval(interval)
          return 0
        }
        return v - 1
      })
    }, 1000)
  }

  // ── API helpers ──
  const apiFetch = async (url: string, body: object) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    return { res, data: await res.json() }
  }

  // ── Step handlers ──
  const onRequestSubmit = async ({ phone }: RequestForm) => {
    setServerError("")
    setLoading(true)
    try {
      const { res, data } = await apiFetch("/api/auth/send-otp", { phone })
      if (!res.ok) {
        setServerError(data.error)
        return
      }
      setStep("otp")
      startCountdown()
      setServerSuccess(`OTP dikirim ke WhatsApp ${phone}`)
    } catch {
      setServerError("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setServerError("")
    setLoading(true)
    try {
      const { res, data } = await apiFetch("/api/auth/verify-otp", {
        phone: phoneValue.replace(/\D/g, "").replace(/^0/, "62"),
        otp: otpValue
      })
      if (!res.ok) {
        setServerError(data.error)
        return
      }
      setStep("newpass")
      setServerSuccess("")
    } catch {
      setServerError("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  const onNewPassSubmit = async ({ password }: NewPassForm) => {
    setServerError("")
    setLoading(true)
    try {
      const { res, data } = await apiFetch("/api/auth/reset-password", {
        phone: phoneValue,
        password
      })
      if (!res.ok) {
        setServerError(data.error)
        return
      }
      setStep("done")
    } catch {
      setServerError("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    setServerError("")
    setLoading(true)
    try {
      const { res, data } = await apiFetch("/api/auth/send-otp", {
        phone: phoneValue
      })
      if (!res.ok) {
        setServerError(data.error)
        return
      }
      startCountdown()
      setServerSuccess("OTP baru telah dikirim")
    } catch {
      setServerError("Gagal kirim ulang OTP")
    } finally {
      setLoading(false)
    }
  }

  // ── OTP helpers ──
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...otpDigits]
    next[index] = digit
    setOtpDigits(next)
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0)
      otpRefs.current[index - 1]?.focus()
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
    const next = Array(6).fill("")
    pasted.split("").forEach((c, i) => {
      next[i] = c
    })
    setOtpDigits(next)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      <div className="flex min-h-screen font-nunito max-[900px]:flex-col">
        {/* Mobile topbar */}
        <div
          className="hidden cursor-pointer items-center gap-3 bg-linear-to-br from-brand-950 to-brand-700 px-5 py-3.5 max-[900px]:flex"
          onClick={() => router.push("/")}
        >
          <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-brand-700 to-brand-500">
            <span className="text-[10px] font-black text-white">INV</span>
          </div>
          <div>
            <div className="text-[15px] font-black text-white">STOCKR</div>
            <div className="text-[10px] font-semibold text-white/40">
              Inventory Management System
            </div>
          </div>
        </div>

        <LeftPanel step={step} onLogoClick={() => router.push("/")} />

        {/* ── RIGHT PANEL ── */}
        <div className="flex flex-1 items-center justify-center overflow-y-auto bg-white px-10 py-12 max-[900px]:items-start max-[900px]:px-5 max-[900px]:pb-12 max-[900px]:pt-8 max-[480px]:px-4 max-[480px]:pb-10 max-[480px]:pt-6">
          <div className="w-full max-w-100 animate-[fadeUp_0.5s_ease_forwards] max-[900px]:max-w-full">
            {/* STEP 1: REQUEST */}
            {step === "request" && (
              <>
                <div className="mb-7">
                  <h1 className="mb-1.5 text-[30px] font-black tracking-[-.02em] text-slate-900 max-[480px]:text-2xl">
                    Reset Password
                  </h1>
                  <p className="mb-6 text-sm font-medium leading-normal text-slate-500">
                    Masukkan nomor WhatsApp yang terdaftar. Kami akan
                    mengirimkan kode OTP untuk verifikasi.
                  </p>
                </div>
                {serverError && (
                  <div className="mb-3.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-center text-[13px] font-bold text-red-600">
                    ⚠ {serverError}
                  </div>
                )}
                <form
                  onSubmit={requestForm.handleSubmit(onRequestSubmit)}
                  noValidate
                >
                  <div className="mb-3.5">
                    <label className="mb-1.75 block text-[13px] font-bold text-gray-700">
                      Nomor WhatsApp Terdaftar
                    </label>
                    <div className="relative flex items-center">
                      <svg
                        className="pointer-events-none absolute left-3.5 z-1 h-4 w-4 text-slate-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <input
                        className={cn(
                          inputBase,
                          requestForm.formState.errors.phone && "border-red-500"
                        )}
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        {...requestForm.register("phone", {
                          required: "Nomor WhatsApp wajib diisi",
                          pattern: {
                            value: /^08[0-9]{8,12}$/,
                            message:
                              "Format nomor tidak valid (contoh: 081234567890)"
                          }
                        })}
                      />
                    </div>
                    {requestForm.formState.errors.phone ? (
                      <p className="mt-1.25 text-xs font-bold text-red-600">
                        {requestForm.formState.errors.phone.message}
                      </p>
                    ) : (
                      <p className="mt-1.25 text-[11px] font-semibold text-slate-400">
                        OTP akan dikirim ke nomor ini
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="mt-1.5 flex h-12.5 w-full items-center justify-center gap-2 rounded-[10px] bg-linear-to-br from-brand-700 to-brand-500 text-[15px] font-extrabold text-white shadow-[0_8px_24px_rgba(59,130,246,.3)] transition-transform enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_12px_32px_rgba(59,130,246,.4)] disabled:cursor-not-allowed disabled:opacity-70 max-[480px]:h-11.5"
                    disabled={loading}
                  >
                    {loading ? <LoadingDots /> : "Kirim Kode OTP →"}
                  </button>
                </form>
                <p className="mt-5 text-center text-[13px] font-semibold text-slate-500">
                  Ingat password kamu?{" "}
                  <Link
                    href="/login"
                    className="font-extrabold text-brand-700 no-underline"
                  >
                    Masuk di sini
                  </Link>
                </p>
              </>
            )}

            {/* STEP 2: OTP */}
            {step === "otp" && (
              <>
                <div className="mb-6 text-center">
                  <Image
                    src={imageWa}
                    alt="WhatsApp"
                    width={64}
                    height={64}
                    priority
                    unoptimized
                    className="mx-auto mb-4 block rounded-2xl object-contain"
                  />
                  <h1 className="mb-1.5 text-[26px] font-black tracking-[-.02em] text-slate-900">
                    Verifikasi WhatsApp
                  </h1>
                  <p className="text-sm font-medium leading-normal text-slate-500">
                    Kode OTP dikirim ke
                    <br />
                    <strong className="text-slate-900">
                      WhatsApp {phoneValue}
                    </strong>
                  </p>
                </div>
                {serverError && (
                  <div className="mb-3.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-center text-[13px] font-bold text-red-600">
                    ⚠ {serverError}
                  </div>
                )}
                {serverSuccess && (
                  <div className="mb-3.5 rounded-lg border border-green-200 bg-green-50 px-3.5 py-2.5 text-center text-[13px] font-bold text-green-600">
                    ✓ {serverSuccess}
                  </div>
                )}
                <div className="mb-3.5">
                  <label className="mb-1.75 block text-center text-[13px] font-bold text-gray-700">
                    Masukkan 6 Digit OTP
                  </label>
                  <OtpInput
                    digits={otpDigits}
                    refs={otpRefs}
                    onChange={handleOtpChange}
                    onKeyDown={handleOtpKeyDown}
                    onPaste={handleOtpPaste}
                  />
                  <p className="mt-2.5 text-center text-xs font-semibold text-slate-400">
                    Berlaku 5 menit
                  </p>
                </div>
                <button
                  className="flex h-12.5 w-full items-center justify-center gap-2 rounded-[10px] bg-linear-to-br from-brand-700 to-brand-500 text-[15px] font-extrabold text-white shadow-[0_8px_24px_rgba(59,130,246,.3)] transition-transform enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_12px_32px_rgba(59,130,246,.4)] disabled:cursor-not-allowed disabled:opacity-70 max-[480px]:h-11.5"
                  onClick={handleVerifyOTP}
                  disabled={loading || otpValue.length !== 6}
                >
                  {loading ? <LoadingDots /> : "Verifikasi Kode ✓"}
                </button>
                <div className="mt-4 flex justify-between text-[13px] font-bold">
                  <button
                    onClick={() => {
                      setStep("request")
                      setServerError("")
                      setOtpDigits(Array(6).fill(""))
                    }}
                    className="border-none bg-transparent text-[13px] font-bold text-slate-500"
                  >
                    ← Ganti nomor
                  </button>
                  <button
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || loading}
                    className={cn(
                      "border-none bg-transparent text-[13px] font-bold",
                      countdown > 0
                        ? "cursor-not-allowed text-slate-400"
                        : "cursor-pointer text-brand-700"
                    )}
                  >
                    {countdown > 0
                      ? `Kirim ulang (${countdown}s)`
                      : "Kirim ulang OTP"}
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: NEW PASSWORD */}
            {step === "newpass" && (
              <>
                <div className="mb-7">
                  <h1 className="mb-1.5 text-[30px] font-black tracking-[-.02em] text-slate-900 max-[480px]:text-2xl">
                    Password Baru
                  </h1>
                  <p className="mb-6 text-sm font-medium leading-normal text-slate-500">
                    Nomor terverifikasi! Sekarang buat password baru yang kuat
                    untuk akun kamu.
                  </p>
                </div>
                {serverError && (
                  <div className="mb-3.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-center text-[13px] font-bold text-red-600">
                    ⚠ {serverError}
                  </div>
                )}
                <form
                  onSubmit={newPassForm.handleSubmit(onNewPassSubmit)}
                  noValidate
                >
                  {/* Password */}
                  <div className="mb-3.5">
                    <label className="mb-1.75 block text-[13px] font-bold text-gray-700">
                      Password Baru
                    </label>
                    <div className="relative flex items-center">
                      <svg
                        className="pointer-events-none absolute left-3.5 z-1 h-4 w-4 text-slate-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <rect
                          x="3"
                          y="11"
                          width="18"
                          height="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <input
                        className={cn(
                          inputBase,
                          "pr-11",
                          newPassForm.formState.errors.password &&
                            "border-red-500"
                        )}
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 karakter"
                        {...newPassForm.register("password", {
                          required: "Password wajib diisi",
                          minLength: {
                            value: 8,
                            message: "Password minimal 8 karakter"
                          }
                        })}
                      />
                      <button
                        type="button"
                        className="absolute right-3.5 flex items-center border-none bg-transparent p-1 text-slate-400"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        <EyeIcon />
                      </button>
                    </div>
                    <PasswordStrength password={passwordWatch} />
                    {newPassForm.formState.errors.password && (
                      <p className="mt-1.25 text-xs font-bold text-red-600">
                        {newPassForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  {/* Confirm */}
                  <div className="mb-3.5">
                    <label className="mb-1.75 block text-[13px] font-bold text-gray-700">
                      Konfirmasi Password
                    </label>
                    <div className="relative flex items-center">
                      <svg
                        className="pointer-events-none absolute left-3.5 z-1 h-4 w-4 text-slate-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <input
                        className={cn(
                          inputBase,
                          "pr-11",
                          newPassForm.formState.errors.confirm &&
                            "border-red-500"
                        )}
                        type={showConfirm ? "text" : "password"}
                        placeholder="Ulangi password"
                        {...newPassForm.register("confirm", {
                          required: "Konfirmasi password wajib diisi",
                          validate: (v) =>
                            v === passwordWatch || "Password tidak cocok"
                        })}
                      />
                      <button
                        type="button"
                        className="absolute right-3.5 flex items-center border-none bg-transparent p-1 text-slate-400"
                        onClick={() => setShowConfirm((v) => !v)}
                      >
                        <EyeIcon />
                      </button>
                    </div>
                    {newPassForm.formState.errors.confirm && (
                      <p className="mt-1.25 text-xs font-bold text-red-600">
                        {newPassForm.formState.errors.confirm.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="mt-1.5 flex h-12.5 w-full items-center justify-center gap-2 rounded-[10px] bg-linear-to-br from-brand-700 to-brand-500 text-[15px] font-extrabold text-white shadow-[0_8px_24px_rgba(59,130,246,.3)] transition-transform enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_12px_32px_rgba(59,130,246,.4)] disabled:cursor-not-allowed disabled:opacity-70 max-[480px]:h-11.5"
                    disabled={loading}
                  >
                    {loading ? <LoadingDots /> : "Simpan Password Baru ✓"}
                  </button>
                </form>
              </>
            )}

            {/* STEP 4: DONE */}
            {step === "done" && (
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 animate-[checkPop_0.5s_ease_forwards] items-center justify-center rounded-full bg-linear-to-br from-green-600 to-green-500 text-4xl shadow-[0_12px_32px_rgba(34,197,94,.35)]">
                  ✓
                </div>
                <h1 className="mb-2.5 text-[28px] font-black tracking-[-.02em] text-slate-900">
                  Password Berhasil Direset!
                </h1>
                <p className="mb-7 text-sm font-medium leading-normal text-slate-500">
                  Password kamu telah berhasil diperbarui. Silakan masuk
                  menggunakan password baru kamu.
                </p>
                <div className="mb-6 rounded-[10px] border border-green-200 bg-green-50 px-3.5 py-3 text-[13px] font-bold text-green-700">
                  Semua sesi lama telah dihapus demi keamanan akun kamu
                </div>
                <button
                  className="flex h-12.5 w-full items-center justify-center gap-2 rounded-[10px] bg-linear-to-br from-brand-700 to-brand-500 text-[15px] font-extrabold text-white shadow-[0_8px_24px_rgba(59,130,246,.3)] transition-transform enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_12px_32px_rgba(59,130,246,.4)]"
                  onClick={() => router.push("/login")}
                >
                  Masuk Sekarang →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
