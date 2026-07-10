"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "../../lib/utils"

// ── Types ──────────────────────────────────────────────────────
type Step =
  | "account"
  | "otp"
  | "business"
  | "plan"
  | "agreement"
  | "payment"
  | "done"

const STEPS: { key: Step; label: string; short: string }[] = [
  { key: "account", label: "Akun", short: "01" },
  { key: "otp", label: "Verifikasi", short: "02" },
  { key: "business", label: "Bisnis", short: "03" },
  { key: "plan", label: "Paket", short: "04" },
  { key: "agreement", label: "Perjanjian", short: "05" },
  { key: "payment", label: "Pembayaran", short: "06" },
  { key: "done", label: "Selesai", short: "✓" }
]

// Steps shown in the left panel stepper (excluding otp & done)
const LEFT_STEPS = STEPS.filter((s) => !["otp", "done"].includes(s.key))

const PLAN_OPTIONS = [
  {
    id: "starter",
    name: "Starter",
    price: 99000,
    desc: "Hingga 500 produk & 3 pengguna",
    highlight: false,
    features: ["500 produk", "3 pengguna", "Laporan dasar", "Support email"]
  },
  {
    id: "growth",
    name: "Growth",
    price: 299000,
    desc: "Hingga 5.000 produk & 10 pengguna",
    highlight: true,
    features: [
      "5.000 produk",
      "10 pengguna",
      "Laporan lanjutan",
      "Support prioritas",
      "API akses"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 799000,
    desc: "Unlimited produk & pengguna",
    highlight: false,
    features: [
      "Unlimited produk",
      "Unlimited pengguna",
      "Custom laporan",
      "Dedicated support",
      "White-label",
      "SLA 99.9%"
    ]
  }
]

const BUSINESS_TYPES = [
  "Retail / Toko",
  "Distributor",
  "Manufaktur",
  "E-Commerce",
  "Restoran / F&B",
  "Jasa / Layanan",
  "Lainnya"
]

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID")
}

function getPasswordStrength(pw: string): number {
  if (!pw) return -1
  if (pw.length < 6) return 0
  if (pw.length < 8) return 1
  if (pw.length < 12) return 2
  return 3
}

// ── Shared Tailwind style tokens (grouped per surface, composed via cn()) ──
// Gradients / multi-stop backgrounds stay as inline `style` objects: Tailwind
// arbitrary-value classes can encode them, but that trades a one-line CSS
// value for a fragile underscore-escaped class string with no real benefit
// here since none of these values are dynamic at runtime.
const GRADIENTS = {
  brand: { backgroundImage: "linear-gradient(135deg, #1e3a8a, #3b82f6)" },
  brandBtn: {
    backgroundImage: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)"
  },
  hero: {
    backgroundImage:
      "linear-gradient(160deg, #060b1a 0%, #0c1733 30%, #0f2050 60%, #1e3a8a 100%)"
  },
  green: { backgroundImage: "linear-gradient(135deg, #22c55e, #16a34a)" },
  topbar: { backgroundImage: "linear-gradient(135deg, #060b1a, #1e3a8a)" }
} as const

const heroGridStyle: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)",
  backgroundSize: "48px 48px"
}

const selectArrowStyle: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center"
}

// Inputs
const inputWrapCls = "relative flex items-center"
const inputIconCls =
  "pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400"
const inputCls = ({
  noIcon = false,
  hasEye = false,
  invalid = false
}: { noIcon?: boolean; hasEye?: boolean; invalid?: boolean } = {}) =>
  cn(
    "h-12 w-full rounded-[10px] border-[1.5px] bg-slate-50 pl-[42px] pr-3.5 font-nunito text-sm font-semibold text-slate-900 outline-none transition-[border-color,box-shadow] placeholder:font-medium placeholder:text-slate-300 focus:border-brand-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,.12)]",
    noIcon && "pl-3.5",
    hasEye && "pr-11",
    invalid ? "border-red-500" : "border-slate-200"
  )
const selectCls =
  "h-12 w-full appearance-none rounded-[10px] border-[1.5px] border-slate-200 bg-slate-50 bg-no-repeat px-3.5 font-nunito text-sm font-semibold text-slate-900 outline-none transition-colors focus:border-brand-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,.12)]"
const textareaCls =
  "min-h-[76px] w-full resize-y rounded-[10px] border-[1.5px] border-slate-200 bg-slate-50 px-3.5 py-3 font-nunito text-sm font-semibold text-slate-900 outline-none transition-colors placeholder:font-medium placeholder:text-slate-300 focus:border-brand-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,.12)]"
const eyeBtnCls =
  "absolute right-3 flex cursor-pointer items-center border-none bg-transparent p-1 text-slate-400"
const hintCls = "mt-1 font-nunito text-[11px] font-semibold text-slate-400"
const lblCls = "mb-1.5 block font-nunito text-[13px] font-bold text-gray-700"
const fieldCls = "mb-3.5"
const fieldRowCls = "mb-3.5 grid grid-cols-1 gap-3 min-[901px]:grid-cols-2"

// Divider
const dividerCls = "mb-4 flex items-center gap-2.5"
const dividerLineCls = "h-px flex-1 bg-slate-200"
const dividerTextCls =
  "font-nunito text-[11px] font-bold tracking-[0.04em] text-slate-400"

// Section header
const sectionTitleCls =
  "mb-1 font-nunito text-2xl font-black tracking-[-0.02em] text-slate-900 max-[480px]:text-xl"
const sectionSubCls =
  "mb-[22px] font-nunito text-sm font-medium leading-[1.5] text-slate-500"

// Buttons
const btnRowCls = "mt-1.5 flex gap-2.5"
const btnCls =
  "flex h-12.5 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[10px] border-none font-nunito text-[15px] font-extrabold text-white shadow-[0_8px_24px_rgba(59,130,246,.28)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(59,130,246,.4)] disabled:cursor-not-allowed disabled:opacity-65"
const btnGhostCls =
  "h-12.5 flex-none cursor-pointer rounded-[10px] border-none bg-slate-100 px-5 font-nunito text-sm font-extrabold text-slate-600 transition-colors hover:bg-slate-200"
const dotsCls = "flex items-center gap-1.25"
const dotCls = "h-1.5 w-1.5 animate-dot-bounce rounded-full bg-white"

// OTP
const otpWrapCls = "my-1 mb-2 flex justify-center gap-2.5 max-[480px]:gap-[7px]"
const otpBoxCls = (filled: boolean) =>
  cn(
    "h-15 w-[52px] rounded-xl border-2 bg-slate-50 text-center font-nunito text-[26px] font-black text-slate-900 caret-transparent outline-none transition-[border-color,box-shadow,transform] duration-150 focus:-translate-y-0.5 focus:border-brand-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,.15)] max-[480px]:h-13.5 max-[480px]:w-11 max-[480px]:rounded-[10px] max-[480px]:text-[22px]",
    filled ? "border-brand-700 bg-blue-50" : "border-slate-200"
  )

// Plan cards
const planCls = (highlight: boolean, selected: boolean) =>
  cn(
    "relative cursor-pointer overflow-hidden rounded-xl border-2 p-3.5 transition-all hover:border-blue-300",
    selected
      ? "border-brand-500 bg-blue-50"
      : highlight
        ? "border-brand-700"
        : "border-slate-200"
  )
const planBadgeCls =
  "absolute right-3 top-3 rounded-full px-2.5 py-0.5 font-nunito text-[10px] font-extrabold tracking-[0.04em] text-white"
const planTopCls = "mb-1.5 flex items-center gap-2.5"
const planRadioCls = (selected: boolean) =>
  cn(
    "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-all",
    selected ? "border-brand-500 bg-brand-500" : "border-slate-300"
  )
const planRadioDotCls = (selected: boolean) =>
  cn(
    "h-2 w-2 rounded-full bg-white transition-opacity",
    selected ? "opacity-100" : "opacity-0"
  )
const planNameCls = "font-nunito text-sm font-black text-slate-900"
const planPriceCls =
  "ml-auto pr-[50px] font-nunito text-sm font-black text-brand-700"
const planDescCls =
  "mb-1.75 pl-7 font-nunito text-xs font-semibold text-slate-500"
const planFeatsCls = "flex flex-wrap gap-1.5 pl-7"
const planFeatCls =
  "rounded-full bg-brand-500/10 px-2 py-0.5 font-nunito text-[10px] font-bold text-blue-800"

// Agreement
const agreementBoxCls =
  "mb-3.5 max-h-[220px] overflow-y-auto rounded-xl border-[1.5px] border-slate-200 bg-slate-50 p-[18px] font-nunito text-[13px] font-medium leading-[1.8] text-gray-700"
const checkboxRowCls =
  "mb-1 flex cursor-pointer items-start gap-2.5 rounded-[10px] border border-sky-200 bg-sky-50 px-3.5 py-3"
const checkboxCls = (checked: boolean) =>
  cn(
    "mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-2 border-sky-500 bg-white transition-all",
    checked && "bg-sky-500"
  )
const checkboxLabelCls =
  "font-nunito text-[13px] font-bold leading-[1.5] text-sky-900"

// Summary
const summaryCls =
  "mb-4.5 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 p-3.5"
const summaryRowCls = (isLast: boolean) =>
  cn(
    "flex justify-between border-b border-slate-100 py-[5px] font-nunito text-[13px] font-semibold text-slate-600",
    isLast && "border-b-0 pt-2 font-nunito text-sm font-black text-slate-900"
  )

// QRIS / Payment
const qrisWrapCls = "flex flex-col items-center gap-3.5 py-4"
const qrisAppsCls = "flex flex-wrap justify-center gap-1.5"
const qrisAppCls =
  "rounded-full bg-slate-100 px-2.5 py-[3px] font-nunito text-[11px] font-extrabold text-slate-600"
const spinnerCls =
  "h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"

// Done
const doneWrapCls = "flex flex-col items-center py-4 text-center"
const doneCheckCls =
  "mb-4.5 flex h-[76px] w-[76px] animate-check-pop items-center justify-center rounded-full shadow-[0_12px_32px_rgba(34,197,94,.3)]"

// Feedback banners
const errorCls =
  "mb-3.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-center font-nunito text-[13px] font-bold text-red-600"
const successCls =
  "mb-3.5 rounded-lg border border-green-200 bg-green-50 px-3.5 py-2.5 text-center font-nunito text-[13px] font-bold text-green-600"

// ── Sub-components ─────────────────────────────────────────────

function LoadingDots() {
  return (
    <span className={dotsCls}>
      <span className={dotCls} style={{ animationDelay: "0s" }} />
      <span className={dotCls} style={{ animationDelay: "0.15s" }} />
      <span className={dotCls} style={{ animationDelay: "0.3s" }} />
    </span>
  )
}

function EyeToggle({
  show,
  onToggle
}: {
  show: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className={eyeBtnCls}
      onClick={onToggle}
      tabIndex={-1}
    >
      {show ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
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
      )}
    </button>
  )
}

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password)
  const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"]
  const labels = ["Lemah", "Cukup", "Kuat", "Sangat Kuat"]
  return (
    <div className="mt-1.75">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: i <= strength ? colors[strength] : "#e2e8f0"
            }}
            className="h-0.75 flex-1 rounded-sm transition-colors duration-300"
          />
        ))}
      </div>
      {password && (
        <p
          style={{ color: colors[strength] }}
          className="mt-1 font-nunito text-[11px] font-bold"
        >
          {labels[strength]}
        </p>
      )}
    </div>
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
    <div className={otpWrapCls}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          className={otpBoxCls(!!digit)}
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

// ── Main Page ──────────────────────────────────────────────────
export default function FormMitraPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>("account")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Account fields
  const [form, setForm] = useState({
    // account
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    pic_position: "",
    pic_ktp: "",
    // business
    company_name: "",
    company_type: "",
    company_npwp: "",
    company_address: "",
    company_city: "",
    company_province: "",
    company_postal: "",
    employee_count: ""
  })

  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // OTP
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""))
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const [countdown, setCountdown] = useState(0)
  const otpValue = otpDigits.join("")

  // Plan
  const [selectedPlan, setSelectedPlan] = useState("growth")
  const plan = PLAN_OPTIONS.find((p) => p.id === selectedPlan)!

  // Agreement
  const [agreed, setAgreed] = useState(false)

  // Payment
  const [qrisLoading, setQrisLoading] = useState(false)
  const [qrisUrl, setQrisUrl] = useState("")
  const [paymentId, setPaymentId] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "paid" | "failed"
  >("pending")

  // Map step to left-panel stepper index (account=0, business=1, plan=2, agreement=3, payment=4)
  const leftStepIndex = LEFT_STEPS.findIndex((s) => s.key === step)

  const handleChange =
    (field: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  // ── Countdown ──
  const startCountdown = () => {
    setCountdown(60)
    const iv = setInterval(() => {
      setCountdown((v) => {
        if (v <= 1) {
          clearInterval(iv)
          return 0
        }
        return v - 1
      })
    }, 1000)
  }

  // ── Enter key for OTP ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || loading || step !== "otp") return
      if (otpValue.length === 6) handleVerifyOtp()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [step, loading, otpValue])

  // ── Poll payment status ──
  useEffect(() => {
    if (step !== "payment" || !paymentId) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/mitra/payment-status?id=${paymentId}`)
        const data = await res.json()
        if (data.status === "paid") {
          setPaymentStatus("paid")
          clearInterval(interval)
          handleSubmitMitra()
        } else if (data.status === "failed") {
          setPaymentStatus("failed")
          clearInterval(interval)
        }
      } catch {}
    }, 3000)
    return () => clearInterval(interval)
  }, [step, paymentId])

  // ── Step 1: Send OTP ──
  const handleSendOtp = async () => {
    setError("")
    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.confirm ||
      !form.pic_position
    ) {
      setError("Semua field wajib diisi")
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Format email tidak valid")
      return
    }
    if (!/^08[0-9]{8,12}$/.test(form.phone)) {
      setError("Format nomor tidak valid (contoh: 081234567890)")
      return
    }
    if (form.password.length < 8) {
      setError("Password minimal 8 karakter")
      return
    }
    if (form.password !== form.confirm) {
      setError("Password tidak cocok")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone })
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Gagal mengirim OTP")
        return
      }
      setStep("otp")
      startCountdown()
      setSuccess(`Kode OTP dikirim ke WhatsApp ${form.phone}`)
    } catch {
      setError("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Verify OTP → Create Account ──
  const handleVerifyOtp = async () => {
    setError("")
    setLoading(true)
    try {
      // Verify OTP
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, otp: otpValue })
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) {
        setError(verifyData.error || "OTP tidak valid")
        return
      }

      // Register account
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        })
      })
      const regData = await regRes.json()
      if (!regRes.ok) {
        setError(regData.error || "Gagal membuat akun")
        return
      }

      setSuccess("Akun berhasil dibuat! Lanjut lengkapi data bisnis.")
      setStep("business")
    } catch {
      setError("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone })
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error)
        return
      }
      startCountdown()
      setSuccess("OTP baru telah dikirim")
    } catch {
      setError("Gagal kirim ulang OTP")
    } finally {
      setLoading(false)
    }
  }

  // ── Step 3: Business → Step 4: Plan ──
  const handleBusinessNext = () => {
    setError("")
    if (
      !form.company_name ||
      !form.company_type ||
      !form.company_address ||
      !form.company_city
    ) {
      setError("Semua field wajib diisi")
      return
    }
    setStep("plan")
  }

  // ── Step 4: Plan → Step 5: Agreement ──
  const handlePlanNext = () => {
    setError("")
    setStep("agreement")
  }

  // ── Step 5: Agreement → Step 6: Payment ──
  const handleAgreementNext = () => {
    setError("")
    if (!agreed) {
      setError("Kamu harus menyetujui perjanjian kerjasama")
      return
    }
    setStep("payment")
    handleCreatePayment()
  }

  // ── Payment ──
  const handleCreatePayment = async () => {
    setQrisLoading(true)
    try {
      const res = await fetch("/api/mitra/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          amount: plan.price,
          pic_name: form.name,
          pic_email: form.email,
          pic_phone: form.phone,
          company_name: form.company_name
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Gagal membuat pembayaran")
        return
      }
      setQrisUrl(data.qris_url)
      setPaymentId(data.payment_id)
    } catch {
      setError("Terjadi kesalahan saat membuat pembayaran")
    } finally {
      setQrisLoading(false)
    }
  }

  const handleSubmitMitra = async () => {
    setLoading(true)
    try {
      await fetch("/api/mitra/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pic_name: form.name,
          pic_email: form.email,
          pic_phone: form.phone,
          pic_position: form.pic_position,
          pic_ktp: form.pic_ktp,
          company_name: form.company_name,
          company_type: form.company_type,
          company_npwp: form.company_npwp,
          company_address: form.company_address,
          company_city: form.company_city,
          company_province: form.company_province,
          company_postal: form.company_postal,
          employee_count: form.employee_count,
          plan: selectedPlan,
          payment_id: paymentId
        })
      })
      setStep("done")
    } catch {
      setError("Gagal menyimpan data mitra")
    } finally {
      setLoading(false)
    }
  }

  const handleRetryPayment = () => {
    setPaymentStatus("pending")
    setQrisUrl("")
    setPaymentId("")
    handleCreatePayment()
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

  // Left panel step labels & descriptions
  const leftStepMeta: Record<string, string> = {
    account: "Buat akun & verifikasi WA",
    business: "Info perusahaan & lokasi",
    plan: "Pilih paket yang sesuai",
    agreement: "Review & setujui MoU",
    payment: "Bayar via DOKU"
  }

  // Progress bar: map to 6 logical steps (account+otp = 1)
  const progressSteps = [
    "account",
    "business",
    "plan",
    "agreement",
    "payment",
    "done"
  ]
  const progressIndex = step === "otp" ? 0 : progressSteps.indexOf(step)

  return (
    <div className="flex min-h-screen font-nunito">
      {/* Mobile topbar */}
      <div
        style={GRADIENTS.topbar}
        className="flex cursor-pointer items-center gap-3 px-5 py-3.5 min-[901px]:hidden"
        onClick={() => router.push("/")}
      >
        <div
          style={GRADIENTS.brand}
          className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg"
        >
          <span className="font-nunito text-[10px] font-black text-white">
            INV
          </span>
        </div>
        <div>
          <div className="font-nunito text-[15px] font-black text-white">
            STOCKR
          </div>
          <div className="font-nunito text-[10px] font-semibold text-white/40">
            Inventory Management System
          </div>
        </div>
      </div>

      {/* ── LEFT PANEL ── */}
      <div
        style={GRADIENTS.hero}
        className="relative hidden min-h-screen w-[52%] flex-col overflow-hidden min-[901px]:flex"
      >
        <div
          style={heroGridStyle}
          className="pointer-events-none absolute inset-0 animate-grid-pan"
        />
        <div
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(59,130,246,.22) 0%, transparent 70%)"
          }}
          className="pointer-events-none absolute -right-30 -top-30 h-125 w-125 rounded-full"
        />
        <div
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(30,58,138,.18) 0%, transparent 70%)"
          }}
          className="pointer-events-none absolute -bottom-20 -left-20 h-95 w-95 rounded-full"
        />

        {/* Ticker */}
        <div className="absolute inset-x-0 top-0 flex h-9 items-center overflow-hidden border-b border-white/8 bg-black/25 backdrop-blur-sm">
          <div className="flex animate-ticker whitespace-nowrap">
            {[0, 1].map((i) => (
              <span key={i}>
                {[
                  "DAFTAR MITRA 2026",
                  "QRIS PAYMENT",
                  "OTP WHATSAPP",
                  "AKTIVASI INSTAN",
                  "DEDICATED SUPPORT",
                  "GROW YOUR BUSINESS"
                ].map((t, j) => (
                  <span
                    key={j}
                    className="inline-flex items-center gap-3.5 px-9 font-nunito text-[11px] font-bold tracking-[0.06em] text-white/50"
                  >
                    <span className="h-1 w-1 rounded-full bg-blue-400" />
                    {t}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <div
          className="relative z-2 flex cursor-pointer items-center gap-3 px-13 pt-13"
          onClick={() => router.push("/")}
        >
          <div
            style={GRADIENTS.brand}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] shadow-[0_4px_12px_rgba(59,130,246,.35)]"
          >
            <span className="font-nunito text-[11px] font-black tracking-[0.05em] text-white">
              INV
            </span>
          </div>
          <div>
            <div className="font-nunito text-lg font-black tracking-[0.06em] text-white">
              STOCKR
            </div>
            <div className="mt-0.5 font-nunito text-[11px] font-semibold text-white/40">
              Inventory Management System
            </div>
          </div>
        </div>

        <div className="relative z-2 flex-1 px-13 pt-9">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 backdrop-blur-sm">
            <span className="relative h-1.5 w-1.5 rounded-full bg-blue-400 after:absolute after:-inset-0.75 after:animate-pulse-ring after:rounded-full after:bg-blue-400/40 after:content-['']" />
            <span className="font-nunito text-[11px] font-extrabold tracking-[0.05em] text-white/85">
              Program Mitra 2026
            </span>
          </div>
          <h1 className="mb-2.5 font-nunito text-[clamp(24px,2.6vw,36px)] font-black leading-[1.15] tracking-[-0.02em] text-white">
            Bergabung sebagai
            <br />
            <em className="not-italic text-blue-400">Mitra STOCKR</em>
          </h1>
          <p className="mb-6 max-w-85 font-nunito text-[13px] font-medium leading-[1.7] text-white/55">
            Daftar akun, lengkapi data bisnis, dan dapatkan akses penuh ke
            platform inventori terdepan.
          </p>

          {/* Step visual — only main steps (no otp) */}
          <div className="mb-6 flex flex-col">
            {LEFT_STEPS.map((s, i) => {
              const isActive =
                s.key === step || (s.key === "account" && step === "otp")
              const isDone =
                leftStepIndex > i ||
                (step === "otp" && i < 0) ||
                (["business", "plan", "agreement", "payment", "done"].includes(
                  step
                ) &&
                  s.key === "account") ||
                (["plan", "agreement", "payment", "done"].includes(step) &&
                  s.key === "business") ||
                (["agreement", "payment", "done"].includes(step) &&
                  s.key === "plan") ||
                (["payment", "done"].includes(step) && s.key === "agreement") ||
                (step === "done" && s.key === "payment")

              return (
                <div key={s.key} className="relative flex items-start gap-3.5">
                  {i < LEFT_STEPS.length - 1 && (
                    <span
                      className={cn(
                        "absolute left-3.25 top-7 h-[calc(100%+4px)] w-0.5",
                        isActive ? "bg-blue-400/30" : "bg-white/10"
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 font-nunito text-[11px] font-black transition-all",
                      isDone
                        ? "border-green-500 bg-green-500/10 text-green-500"
                        : isActive
                          ? "border-blue-400 bg-blue-400/10 text-blue-400"
                          : "border-white/15 bg-black/20 text-white/30"
                    )}
                  >
                    {isDone ? "✓" : s.short}
                  </div>
                  <div className="pb-2.5 pt-1.25">
                    <div
                      className={cn(
                        "font-nunito text-[13px] font-extrabold transition-colors",
                        isDone
                          ? "text-white/50"
                          : isActive
                            ? "text-white/90"
                            : "text-white/35"
                      )}
                    >
                      {s.label}
                    </div>
                    <div className="mt-0.5 font-nunito text-[11px] font-semibold text-white/22">
                      {leftStepMeta[s.key]}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-col gap-2">
            {[
              "Aktivasi instan setelah pembayaran",
              "Dukungan onboarding dedikasi",
              "SLA & garansi uptime 99.9%"
            ].map((b) => (
              <div
                key={b}
                className="flex items-center gap-2.5 font-nunito text-xs font-semibold text-white/40"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-green-500/30 bg-green-500/15">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                {b}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-2 flex items-center justify-between border-t border-white/[0.07] px-13 py-5">
          <div className="flex items-center gap-2 font-nunito text-xs font-bold text-white/35">
            <span className="h-1.75 w-1.75 rounded-full bg-green-500" />
            Pembayaran aman via DOKU
          </div>
          <span className="font-nunito text-[11px] font-bold text-white/20">
            v2.4.1 · 2026
          </span>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex min-h-screen flex-1 items-start justify-center overflow-y-auto bg-white px-10 pb-15 pt-11 max-[900px]:px-5 max-[900px]:pb-12 max-[900px]:pt-7 max-[480px]:px-4 max-[480px]:pb-10 max-[480px]:pt-5">
        <div className="w-full max-w-120 animate-fade-up">
          {/* Progress bar */}
          {step !== "done" && (
            <div className="mb-7 flex gap-1.25">
              {progressSteps
                .filter((s) => s !== "done")
                .map((s, i) => (
                  <div
                    key={s}
                    className={cn(
                      "h-1 flex-1 rounded-sm transition-colors duration-400",
                      i < progressIndex
                        ? "bg-green-500"
                        : i === progressIndex
                          ? "bg-blue-500"
                          : "bg-slate-200"
                    )}
                  />
                ))}
            </div>
          )}

          {success && step !== "otp" && (
            <div className={successCls}>✓ {success}</div>
          )}

          {/* ═══════════════════════════════════════════
              STEP 1: ACCOUNT + PIC
          ════════════════════════════════════════════ */}
          {step === "account" && (
            <>
              <div className={sectionTitleCls}>Buat Akun & Data PIC</div>
              <div className={sectionSubCls}>
                Isi informasi akun dan Person In Charge yang bertanggung jawab
                atas kemitraan.
              </div>

              {/* Account section */}
              <div className={dividerCls}>
                <div className={dividerLineCls} />
                <span className={dividerTextCls}>INFORMASI AKUN</span>
                <div className={dividerLineCls} />
              </div>

              <div className={fieldCls}>
                <label className={lblCls}>
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className={inputWrapCls}>
                  <svg
                    className={inputIconCls}
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    className={inputCls()}
                    type="text"
                    placeholder="Nama lengkap kamu"
                    value={form.name}
                    onChange={handleChange("name")}
                  />
                </div>
              </div>

              <div className={fieldRowCls}>
                <div>
                  <label className={lblCls}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className={inputWrapCls}>
                    <svg
                      className={inputIconCls}
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      className={inputCls()}
                      type="email"
                      placeholder="email@perusahaan.com"
                      value={form.email}
                      onChange={handleChange("email")}
                    />
                  </div>
                </div>
                <div>
                  <label className={lblCls}>
                    WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className={inputWrapCls}>
                    <svg
                      className={inputIconCls}
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <input
                      className={inputCls()}
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={form.phone}
                      onChange={handleChange("phone")}
                    />
                  </div>
                  <p className={hintCls}>OTP akan dikirim ke nomor ini</p>
                </div>
              </div>

              <div className={fieldRowCls}>
                <div>
                  <label className={lblCls}>
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className={inputWrapCls}>
                    <svg
                      className={inputIconCls}
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      className={inputCls({ hasEye: true })}
                      type={showPw ? "text" : "password"}
                      placeholder="Min. 8 karakter"
                      value={form.password}
                      onChange={handleChange("password")}
                    />
                    <EyeToggle
                      show={showPw}
                      onToggle={() => setShowPw((v) => !v)}
                    />
                  </div>
                  <PasswordStrengthBar password={form.password} />
                </div>
                <div>
                  <label className={lblCls}>
                    Konfirmasi <span className="text-red-500">*</span>
                  </label>
                  <div className={inputWrapCls}>
                    <svg
                      className={inputIconCls}
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <input
                      className={inputCls({ hasEye: true })}
                      type={showConfirm ? "text" : "password"}
                      placeholder="Ulangi password"
                      value={form.confirm}
                      onChange={handleChange("confirm")}
                    />
                    <EyeToggle
                      show={showConfirm}
                      onToggle={() => setShowConfirm((v) => !v)}
                    />
                  </div>
                </div>
              </div>

              {/* PIC section */}
              <div className={cn(dividerCls, "mt-1.5")}>
                <div className={dividerLineCls} />
                <span className={dividerTextCls}>DATA PIC</span>
                <div className={dividerLineCls} />
              </div>

              <div className={fieldRowCls}>
                <div>
                  <label className={lblCls}>
                    Jabatan <span className="text-red-500">*</span>
                  </label>
                  <div className={inputWrapCls}>
                    <svg
                      className={inputIconCls}
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    </svg>
                    <input
                      className={inputCls()}
                      type="text"
                      placeholder="Direktur / Manager"
                      value={form.pic_position}
                      onChange={handleChange("pic_position")}
                    />
                  </div>
                </div>
                <div>
                  <label className={lblCls}>No. KTP</label>
                  <div className={inputWrapCls}>
                    <svg
                      className={inputIconCls}
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    <input
                      className={inputCls()}
                      type="text"
                      placeholder="16 digit NIK"
                      maxLength={16}
                      value={form.pic_ktp}
                      onChange={handleChange("pic_ktp")}
                    />
                  </div>
                </div>
              </div>

              <div className={btnRowCls}>
                <button
                  style={GRADIENTS.brandBtn}
                  className={btnCls}
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? <LoadingDots /> : "Kirim OTP WhatsApp →"}
                </button>
              </div>
              <p className="mt-3.5 text-center font-nunito text-[13px] font-semibold text-slate-400">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="font-nunito font-extrabold text-brand-700 no-underline"
                >
                  Masuk di sini
                </Link>
              </p>
            </>
          )}

          {/* ═══════════════════════════════════════════
              STEP 2: OTP
          ════════════════════════════════════════════ */}
          {step === "otp" && (
            <>
              <div className="mb-5 text-center">
                <div className="mx-auto mb-3.5 flex h-15 w-15 items-center justify-center rounded-[14px] bg-[#25d366]">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.570-.347z" />
                    <path d="M11.997 0C5.373 0 0 5.373 0 12c0 2.115.554 4.098 1.523 5.82L0 24l6.335-1.508A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.624 0 11.997 0zm.003 21.818a9.818 9.818 0 0 1-5.002-1.366l-.359-.213-3.72.886.92-3.636-.234-.373A9.818 9.818 0 1 1 12 21.818z" />
                  </svg>
                </div>
                <div className={cn(sectionTitleCls, "text-[22px]")}>
                  Verifikasi WhatsApp
                </div>
                <div className={sectionSubCls}>
                  Kode OTP dikirim ke
                  <br />
                  <strong className="text-slate-900">
                    WhatsApp {form.phone}
                  </strong>
                </div>
              </div>

              {error && <div className={errorCls}>⚠ {error}</div>}
              {success && <div className={successCls}>✓ {success}</div>}

              <div className={fieldCls}>
                <label className={cn(lblCls, "block text-center")}>
                  Masukkan 6 Digit OTP
                </label>
                <OtpInput
                  digits={otpDigits}
                  refs={otpRefs}
                  onChange={handleOtpChange}
                  onKeyDown={handleOtpKeyDown}
                  onPaste={handleOtpPaste}
                />
                <p className={cn(hintCls, "text-center")}>Berlaku 5 menit</p>
              </div>

              <button
                style={GRADIENTS.brandBtn}
                className={cn(btnCls, "w-full")}
                onClick={handleVerifyOtp}
                disabled={loading || otpValue.length !== 6}
              >
                {loading ? <LoadingDots /> : "Verifikasi & Lanjut →"}
              </button>

              <div className="mt-3.5 flex justify-between font-nunito text-[13px] font-bold">
                <button
                  onClick={() => {
                    setStep("account")
                    setError("")
                    setSuccess("")
                    setOtpDigits(Array(6).fill(""))
                  }}
                  className="cursor-pointer border-none bg-transparent font-nunito text-[13px] font-bold text-slate-500"
                >
                  ← Ganti nomor
                </button>
                <button
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || loading}
                  className={cn(
                    "border-none bg-transparent font-nunito text-[13px] font-bold",
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

          {/* ═══════════════════════════════════════════
              STEP 3: BUSINESS
          ════════════════════════════════════════════ */}
          {step === "business" && (
            <>
              <div className={sectionTitleCls}>Data Bisnis</div>
              <div className={sectionSubCls}>
                Informasi perusahaan yang akan menjadi mitra STOCKR.
              </div>

              <div className={fieldCls}>
                <label className={lblCls}>
                  Nama Perusahaan <span className="text-red-500">*</span>
                </label>
                <div className={inputWrapCls}>
                  <svg
                    className={inputIconCls}
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <input
                    className={inputCls()}
                    type="text"
                    placeholder="PT / CV / UD nama perusahaan"
                    value={form.company_name}
                    onChange={handleChange("company_name")}
                  />
                </div>
              </div>

              <div className={fieldRowCls}>
                <div>
                  <label className={lblCls}>
                    Jenis Bisnis <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={selectCls}
                    style={selectArrowStyle}
                    value={form.company_type}
                    onChange={handleChange("company_type")}
                  >
                    <option value="">Pilih jenis bisnis</option>
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={lblCls}>NPWP</label>
                  <div className={inputWrapCls}>
                    <svg
                      className={inputIconCls}
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <input
                      className={inputCls()}
                      type="text"
                      placeholder="00.000.000.0-000.000"
                      value={form.company_npwp}
                      onChange={handleChange("company_npwp")}
                    />
                  </div>
                </div>
              </div>

              <div className={fieldCls}>
                <label className={lblCls}>
                  Alamat Perusahaan <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={textareaCls}
                  placeholder="Jalan, nomor, RT/RW, kelurahan, kecamatan..."
                  value={form.company_address}
                  onChange={handleChange("company_address")}
                />
              </div>

              <div className={fieldRowCls}>
                <div>
                  <label className={lblCls}>
                    Kota <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={inputCls({ noIcon: true })}
                    type="text"
                    placeholder="Jakarta"
                    value={form.company_city}
                    onChange={handleChange("company_city")}
                  />
                </div>
                <div>
                  <label className={lblCls}>Provinsi</label>
                  <input
                    className={inputCls({ noIcon: true })}
                    type="text"
                    placeholder="DKI Jakarta"
                    value={form.company_province}
                    onChange={handleChange("company_province")}
                  />
                </div>
              </div>

              <div className={fieldRowCls}>
                <div>
                  <label className={lblCls}>Kode Pos</label>
                  <input
                    className={inputCls({ noIcon: true })}
                    type="text"
                    placeholder="12345"
                    maxLength={5}
                    value={form.company_postal}
                    onChange={handleChange("company_postal")}
                  />
                </div>
                <div>
                  <label className={lblCls}>Jumlah Karyawan</label>
                  <select
                    className={selectCls}
                    style={selectArrowStyle}
                    value={form.employee_count}
                    onChange={handleChange("employee_count")}
                  >
                    <option value="">Pilih range</option>
                    <option>1–10</option>
                    <option>11–50</option>
                    <option>51–200</option>
                    <option>201–500</option>
                    <option>500+</option>
                  </select>
                </div>
              </div>

              <div className={btnRowCls}>
                <button
                  className={btnGhostCls}
                  onClick={() => {
                    setStep("account")
                    setError("")
                    setSuccess("")
                  }}
                >
                  ← Kembali
                </button>
                <button
                  style={GRADIENTS.brandBtn}
                  className={btnCls}
                  onClick={handleBusinessNext}
                >
                  Lanjut — Pilih Paket →
                </button>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════
              STEP 4: PLAN
          ════════════════════════════════════════════ */}
          {step === "plan" && (
            <>
              <div className={sectionTitleCls}>Pilih Paket</div>
              <div className={sectionSubCls}>
                Pilih paket yang sesuai dengan kebutuhan bisnis kamu.
              </div>

              <div className="mb-5 flex flex-col gap-2.5">
                {PLAN_OPTIONS.map((p) => (
                  <div
                    key={p.id}
                    className={planCls(p.highlight, selectedPlan === p.id)}
                    onClick={() => setSelectedPlan(p.id)}
                  >
                    {p.highlight && (
                      <span style={GRADIENTS.brandBtn} className={planBadgeCls}>
                        POPULER
                      </span>
                    )}
                    <div className={planTopCls}>
                      <div className={planRadioCls(selectedPlan === p.id)}>
                        <div
                          className={planRadioDotCls(selectedPlan === p.id)}
                        />
                      </div>
                      <span className={planNameCls}>{p.name}</span>
                      <span className={planPriceCls}>
                        {formatRp(p.price)}
                        <span className="font-nunito text-[10px] font-semibold text-slate-400">
                          /bln
                        </span>
                      </span>
                    </div>
                    <div className={planDescCls}>{p.desc}</div>
                    <div className={planFeatsCls}>
                      {p.features.map((f) => (
                        <span key={f} className={planFeatCls}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className={btnRowCls}>
                <button
                  className={btnGhostCls}
                  onClick={() => {
                    setStep("business")
                    setError("")
                  }}
                >
                  ← Kembali
                </button>
                <button
                  style={GRADIENTS.brandBtn}
                  className={btnCls}
                  onClick={handlePlanNext}
                >
                  Lanjut — Perjanjian →
                </button>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════
              STEP 5: AGREEMENT
          ════════════════════════════════════════════ */}
          {step === "agreement" && (
            <>
              <div className={sectionTitleCls}>Perjanjian Kerjasama</div>
              <div className={sectionSubCls}>
                Baca dan setujui syarat kemitraan STOCKR sebelum melanjutkan ke
                pembayaran.
              </div>

              <div className={agreementBoxCls}>
                <h4 className="mb-2 font-nunito text-[13px] font-black text-slate-900">
                  PERJANJIAN KERJASAMA MITRA STOCKR
                </h4>
                <p>
                  Perjanjian ini dibuat antara{" "}
                  <strong>PT Stockr Teknologi Indonesia</strong> ("Perusahaan")
                  dan Mitra yang telah mengisi formulir pendaftaran ini
                  ("Mitra"), bersama-sama disebut sebagai "Para Pihak".
                </p>
                <ol className="pl-4">
                  <li className="mb-1.25">
                    <strong>Lingkup Kerjasama.</strong> Perusahaan memberikan
                    akses platform STOCKR kepada Mitra sesuai paket yang
                    dipilih, untuk keperluan manajemen inventori dan operasional
                    bisnis internal Mitra.
                  </li>
                  <li className="mb-1.25">
                    <strong>Masa Berlaku.</strong> Perjanjian ini berlaku selama
                    12 (dua belas) bulan sejak tanggal aktivasi dan dapat
                    diperpanjang secara otomatis kecuali salah satu pihak
                    menyatakan penghentian minimal 30 hari sebelum berakhirnya
                    masa berlaku.
                  </li>
                  <li className="mb-1.25">
                    <strong>Pembayaran.</strong> Mitra wajib membayar biaya
                    langganan sesuai paket yang dipilih. Pembayaran dilakukan di
                    muka setiap bulan melalui metode yang disediakan oleh
                    Perusahaan.
                  </li>
                  <li className="mb-1.25">
                    <strong>Kerahasiaan Data.</strong> Para Pihak sepakat untuk
                    menjaga kerahasiaan data dan informasi yang diperoleh selama
                    pelaksanaan kerjasama ini.
                  </li>
                  <li className="mb-1.25">
                    <strong>Hak & Kewajiban Mitra.</strong> Mitra berhak
                    mendapatkan dukungan teknis sesuai paket, pembaruan fitur,
                    dan akses ke dokumentasi. Mitra berkewajiban menggunakan
                    platform sesuai ketentuan penggunaan yang berlaku.
                  </li>
                  <li className="mb-1.25">
                    <strong>Penghentian Layanan.</strong> Perusahaan berhak
                    menghentikan layanan jika Mitra melanggar ketentuan
                    penggunaan, gagal melakukan pembayaran dalam 7 hari kerja,
                    atau terbukti melakukan tindakan yang merugikan pihak lain.
                  </li>
                  <li className="mb-1.25">
                    <strong>Hukum yang Berlaku.</strong> Perjanjian ini tunduk
                    pada hukum Republik Indonesia. Setiap sengketa diselesaikan
                    melalui musyawarah atau jalur hukum yang berlaku.
                  </li>
                </ol>
              </div>

              <div className={summaryCls}>
                <div className={summaryRowCls(false)}>
                  <span>Mitra</span>
                  <span>{form.company_name || "—"}</span>
                </div>
                <div className={summaryRowCls(false)}>
                  <span>PIC</span>
                  <span>{form.name || "—"}</span>
                </div>
                <div className={summaryRowCls(false)}>
                  <span>Paket</span>
                  <span>{plan.name}</span>
                </div>
                <div className={summaryRowCls(true)}>
                  <span>Total Pembayaran</span>
                  <span>{formatRp(plan.price)}/bulan</span>
                </div>
              </div>

              <div
                className={checkboxRowCls}
                onClick={() => setAgreed((v) => !v)}
              >
                <div className={checkboxCls(agreed)}>
                  {agreed && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className={checkboxLabelCls}>
                  Saya telah membaca dan menyetujui{" "}
                  <strong>Perjanjian Kerjasama Mitra STOCKR</strong> di atas dan
                  bertanggung jawab atas kebenaran data yang diberikan.
                </span>
              </div>

              <div className={cn(btnRowCls, "mt-3.5")}>
                <button
                  className={btnGhostCls}
                  onClick={() => {
                    setStep("plan")
                    setError("")
                  }}
                >
                  ← Kembali
                </button>
                <button
                  style={GRADIENTS.brandBtn}
                  className={btnCls}
                  onClick={handleAgreementNext}
                  disabled={!agreed}
                >
                  Lanjut ke Pembayaran →
                </button>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════
              STEP 6: PAYMENT
          ════════════════════════════════════════════ */}
          {step === "payment" && (
            <>
              <div className={sectionTitleCls}>Pembayaran</div>
              <div className={sectionSubCls}>
                Selesaikan pembayaran untuk mengaktifkan akun mitra kamu.
              </div>

              <div className={cn(summaryCls, "mb-4.5")}>
                <div className={summaryRowCls(false)}>
                  <span>Paket</span>
                  <span>{plan.name}</span>
                </div>
                <div className={summaryRowCls(true)}>
                  <span>Total</span>
                  <span className="text-brand-700">{formatRp(plan.price)}</span>
                </div>
              </div>

              {qrisLoading ? (
                <div className={qrisWrapCls}>
                  <div className={spinnerCls} />
                  <p className="font-nunito text-[13px] font-semibold text-slate-500">
                    Membuat sesi pembayaran...
                  </p>
                </div>
              ) : paymentStatus === "failed" ? (
                <div>
                  <div className={errorCls}>
                    Pembayaran gagal atau kedaluwarsa. Silakan coba lagi.
                  </div>
                  <button
                    style={GRADIENTS.brandBtn}
                    className={cn(btnCls, "w-full")}
                    onClick={handleRetryPayment}
                  >
                    Buat Pembayaran Baru
                  </button>
                </div>
              ) : paymentStatus === "paid" ? (
                <div className={cn(successCls, "p-5 text-[15px]")}>
                  ✓ Pembayaran diterima! Menyelesaikan pendaftaran...
                  <div
                    className={cn(
                      spinnerCls,
                      "mx-auto mt-3 border-t-green-600"
                    )}
                  />
                </div>
              ) : qrisUrl ? (
                <div className={qrisWrapCls}>
                  <div
                    style={GRADIENTS.brandBtn}
                    className="flex h-15 w-15 items-center justify-center rounded-[14px] shadow-[0_8px_24px_rgba(59,130,246,.28)]"
                  >
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                    >
                      <rect x="1" y="4" width="22" height="16" rx="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="mb-1 font-nunito text-base font-black text-slate-900">
                      Lanjutkan Pembayaran
                    </div>
                    <div className="font-nunito text-[13px] font-medium leading-[1.6] text-slate-500">
                      Klik tombol di bawah untuk membuka halaman pembayaran
                      DOKU.
                      <br />
                      Pilih metode: Virtual Account, OVO, GoPay, ShopeePay, dll.
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-[#fef9ec] px-3.5 py-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="font-nunito text-xs font-bold text-amber-600">
                      Link berlaku 15 menit · Status diperbarui otomatis
                    </span>
                  </div>
                  <a
                    href={qrisUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={GRADIENTS.brandBtn}
                    className="flex h-12.5 w-full items-center justify-center gap-2 rounded-[10px] font-nunito text-[15px] font-extrabold text-white no-underline shadow-[0_8px_24px_rgba(59,130,246,.28)]"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2.5"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Bayar Sekarang — {formatRp(plan.price)}
                  </a>
                  {process.env.NODE_ENV !== "production" && (
                    <button
                      onClick={async () => {
                        const res = await fetch(
                          "/api/mitra/mock-payment-success",
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ invoiceNumber: paymentId })
                          }
                        )
                        if (res.ok) setPaymentStatus("paid")
                      }}
                      className="h-11 w-full cursor-pointer rounded-[10px] border-2 border-dashed border-green-500 bg-green-50 font-nunito text-[13px] font-extrabold text-green-600"
                    >
                      Pembayaran Sukses
                    </button>
                  )}
                  <div className="w-full">
                    <div className="mb-1.75 text-center font-nunito text-[11px] font-bold text-slate-400">
                      METODE PEMBAYARAN TERSEDIA
                    </div>
                    <div className={qrisAppsCls}>
                      {[
                        "BCA VA",
                        "Mandiri VA",
                        "BNI VA",
                        "BRI VA",
                        "OVO",
                        "ShopeePay",
                        "GoPay",
                        "DANA",
                        "LinkAja",
                        "Indomaret",
                        "Alfamart"
                      ].map((a) => (
                        <span key={a} className={qrisAppCls}>
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={qrisWrapCls}>
                  <div className={spinnerCls} />
                  <p className="font-nunito text-[13px] font-semibold text-slate-500">
                    Memuat...
                  </p>
                </div>
              )}

              <div className="mt-4 text-center font-nunito text-xs font-semibold text-slate-400">
                Pembayaran diproses secara aman oleh{" "}
                <span className="font-nunito font-extrabold text-brand-700">
                  DOKU
                </span>{" "}
                · Terenkripsi & berlisensi Bank Indonesia
              </div>

              <div className={cn(btnRowCls, "mt-3.5")}>
                <button
                  className={btnGhostCls}
                  onClick={() => {
                    setStep("agreement")
                    setError("")
                    setQrisUrl("")
                    setPaymentId("")
                  }}
                >
                  ← Kembali
                </button>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════
              DONE
          ════════════════════════════════════════════ */}
          {step === "done" && (
            <div className={doneWrapCls}>
              <div style={GRADIENTS.green} className={doneCheckCls}>
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="mb-2 font-nunito text-2xl font-black text-slate-900">
                Pendaftaran Berhasil!
              </div>
              <div className="mb-6.5 max-w-[320px] font-nunito text-sm font-medium leading-[1.7] text-slate-500">
                Selamat!{" "}
                <strong className="text-slate-900">{form.company_name}</strong>{" "}
                kini resmi menjadi mitra STOCKR. Tim kami akan menghubungi kamu
                di <strong className="text-slate-900">{form.email}</strong>{" "}
                dalam 1×24 jam untuk proses onboarding.
              </div>
              <div className="flex w-full flex-col gap-3">
                <button
                  style={GRADIENTS.brandBtn}
                  className={cn(btnCls, "h-13.5 w-full text-base")}
                  onClick={() => router.push("/login")}
                >
                  Masuk ke Dashboard
                </button>
                <button
                  className={cn(btnGhostCls, "h-12 w-full flex-none text-sm")}
                  onClick={() => router.push("/")}
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
