"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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

// ── Sub-components ─────────────────────────────────────────────

function LoadingDots() {
  return (
    <span className="fm-dots">
      <span className="fm-dot" style={{ animationDelay: "0s" }} />
      <span className="fm-dot" style={{ animationDelay: "0.15s" }} />
      <span className="fm-dot" style={{ animationDelay: "0.3s" }} />
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
      className="fm-eye-btn"
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
    <div style={{ marginTop: 7 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i <= strength ? colors[strength] : "#e2e8f0",
              transition: "background .3s"
            }}
          />
        ))}
      </div>
      {password && (
        <p
          style={{
            fontSize: 11,
            color: colors[strength],
            marginTop: 4,
            fontWeight: 700
          }}
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
    <div className="fm-otp-wrap">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          className={`fm-otp-box${digit ? " filled" : ""}`}
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

  const stepIndex = STEPS.findIndex((s) => s.key === step)
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp    { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dotBounce { 0%,80%,100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-5px); opacity: 1; } }
        @keyframes pulse-ring{ 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.7); opacity: 0; } }
        @keyframes gridPan   { from { background-position: 0 0; } to { background-position: 48px 48px; } }
        @keyframes ticker    { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes checkPop  { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slideIn   { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

        .fm-root { display: flex; min-height: 100vh; font-family: 'Nunito', sans-serif; }

        /* ── LEFT ── */
        .fm-left {
          position: relative; width: 52%; min-height: 100vh;
          background: linear-gradient(160deg, #060b1a 0%, #0c1733 30%, #0f2050 60%, #1e3a8a 100%);
          display: flex; flex-direction: column; overflow: hidden;
        }
        .fm-left-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 48px 48px; animation: gridPan 8s linear infinite;
        }
        .fm-left-glow  { position: absolute; top: -120px; right: -120px; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(59,130,246,.22) 0%, transparent 70%); pointer-events: none; }
        .fm-left-glow2 { position: absolute; bottom: -80px; left: -80px; width: 380px; height: 380px; border-radius: 50%; background: radial-gradient(circle, rgba(30,58,138,.18) 0%, transparent 70%); pointer-events: none; }

        /* Ticker */
        .fm-ticker-wrap  { position: absolute; top: 0; left: 0; right: 0; background: rgba(0,0,0,.25); backdrop-filter: blur(8px); border-bottom: 1px solid rgba(255,255,255,.08); height: 36px; overflow: hidden; display: flex; align-items: center; }
        .fm-ticker-track { display: flex; animation: ticker 30s linear infinite; white-space: nowrap; }
        .fm-ticker-item  { display: inline-flex; align-items: center; gap: 14px; padding: 0 36px; font-weight: 700; font-size: 11px; color: rgba(255,255,255,.5); letter-spacing: .06em; }
        .fm-ticker-dot   { width: 4px; height: 4px; border-radius: 50%; background: #60a5fa; }

        /* Brand */
        .fm-brand-area { position: relative; z-index: 2; padding: 52px 52px 0; display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .fm-brand-mark { width: 40px; height: 40px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(59,130,246,.35); }
        .fm-brand-mark span { font-weight: 900; font-size: 11px; color: #fff; letter-spacing: .05em; }
        .fm-brand-name { font-weight: 900; font-size: 18px; color: #fff; letter-spacing: .06em; }
        .fm-brand-sub  { font-size: 11px; color: rgba(255,255,255,.4); font-weight: 600; margin-top: 2px; }

        /* Hero */
        .fm-hero      { position: relative; z-index: 2; padding: 36px 52px 0; flex: 1; }
        .fm-hero-tag  { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.08); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.15); border-radius: 100px; padding: 6px 14px; margin-bottom: 20px; }
        .fm-hero-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #60a5fa; position: relative; }
        .fm-hero-tag-dot::after { content: ''; position: absolute; inset: -3px; border-radius: 50%; background: rgba(96,165,250,.4); animation: pulse-ring 1.8s ease-out infinite; }
        .fm-hero-tag-text { color: rgba(255,255,255,.85); font-size: 11px; font-weight: 800; letter-spacing: .05em; }
        .fm-hero-title { font-weight: 900; font-size: clamp(24px, 2.6vw, 36px); line-height: 1.15; letter-spacing: -.02em; color: #fff; margin-bottom: 10px; }
        .fm-hero-title em { font-style: normal; color: #60a5fa; }
        .fm-hero-desc  { font-size: 13px; color: rgba(255,255,255,.55); line-height: 1.7; max-width: 340px; font-weight: 500; margin-bottom: 24px; }

        /* Step visual */
        .fm-step-visual { display: flex; flex-direction: column; gap: 0; margin-bottom: 24px; }
        .fm-step-v-item { display: flex; align-items: flex-start; gap: 14px; position: relative; }
        .fm-step-v-item:not(:last-child)::after { content: ''; position: absolute; left: 13px; top: 28px; width: 2px; height: calc(100% + 4px); background: rgba(255,255,255,.1); }
        .fm-step-v-item.v-active::after { background: rgba(96,165,250,.3); }
        .fm-step-v-circle { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; border: 2px solid rgba(255,255,255,.15); color: rgba(255,255,255,.3); background: rgba(0,0,0,.2); margin-top: 2px; transition: all .3s; }
        .fm-step-v-circle.v-active { border-color: #60a5fa; color: #60a5fa; background: rgba(96,165,250,.1); }
        .fm-step-v-circle.v-done   { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,.1); }
        .fm-step-v-label { padding: 5px 0 10px; }
        .fm-step-v-title { font-size: 13px; font-weight: 800; color: rgba(255,255,255,.35); transition: color .3s; }
        .fm-step-v-title.v-active { color: rgba(255,255,255,.92); }
        .fm-step-v-title.v-done   { color: rgba(255,255,255,.5); }
        .fm-step-v-sub  { font-size: 11px; color: rgba(255,255,255,.22); font-weight: 600; margin-top: 2px; }

        /* Benefits */
        .fm-benefits { display: flex; flex-direction: column; gap: 8px; }
        .fm-benefit  { display: flex; align-items: center; gap: 10px; font-size: 12px; color: rgba(255,255,255,.4); font-weight: 600; }
        .fm-benefit-ico { width: 20px; height: 20px; border-radius: 50%; background: rgba(34,197,94,.15); border: 1px solid rgba(34,197,94,.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        .fm-bottom-bar { position: relative; z-index: 2; padding: 20px 52px; border-top: 1px solid rgba(255,255,255,.07); display: flex; align-items: center; justify-content: space-between; }
        .fm-bottom-trust { display: flex; align-items: center; gap: 8px; font-size: 12px; color: rgba(255,255,255,.35); font-weight: 700; }
        .fm-bottom-trust-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; }
        .fm-bottom-version { font-size: 11px; color: rgba(255,255,255,.2); font-weight: 700; }

        /* ── RIGHT ── */
        .fm-right { flex: 1; display: flex; align-items: flex-start; justify-content: center; padding: 44px 40px 60px; background: #fff; overflow-y: auto; min-height: 100vh; }
        .fm-card  { width: 100%; max-width: 480px; animation: fadeUp .4s ease forwards; }

        /* Progress bar */
        .fm-progress { display: flex; gap: 5px; margin-bottom: 28px; }
        .fm-progress-step { flex: 1; height: 4px; border-radius: 2px; background: #e2e8f0; transition: background .4s; }
        .fm-progress-step.ps-done   { background: #22c55e; }
        .fm-progress-step.ps-active { background: #3b82f6; }

        /* Section header */
        .fm-section-title { font-weight: 900; font-size: 24px; color: #0f172a; letter-spacing: -.02em; margin-bottom: 4px; }
        .fm-section-sub   { font-size: 14px; color: #64748b; font-weight: 500; margin-bottom: 22px; line-height: 1.5; }

        /* Divider */
        .fm-divider { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .fm-divider-line { flex: 1; height: 1px; background: #e2e8f0; }
        .fm-divider-text { font-size: 11px; color: #94a3b8; font-weight: 700; letter-spacing: .04em; }

        /* Fields */
        .fm-field     { margin-bottom: 14px; }
        .fm-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        .fm-lbl { display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 7px; }
        .fm-lbl span { color: #ef4444; }
        .fm-inp-wrap { position: relative; display: flex; align-items: center; }
        .fm-inp-icon { position: absolute; left: 14px; width: 16px; height: 16px; pointer-events: none; color: #94a3b8; }
        .fm-inp {
          width: 100%; height: 48px; padding: 0 14px 0 42px;
          background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 600;
          color: #0f172a; outline: none; transition: border-color .2s, box-shadow .2s;
        }
        .fm-inp.no-icon  { padding-left: 14px; }
        .fm-inp.has-eye  { padding-right: 44px; }
        .fm-inp:focus    { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
        .fm-inp.invalid  { border-color: #ef4444; }
        .fm-inp::placeholder { color: #cbd5e1; font-weight: 500; }
        .fm-eye-btn { position: absolute; right: 12px; background: none; border: none; cursor: pointer; padding: 4px; color: #94a3b8; display: flex; align-items: center; }
        .fm-sel {
          width: 100%; height: 48px; padding: 0 14px;
          background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 600;
          color: #0f172a; outline: none; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center;
          transition: border-color .2s;
        }
        .fm-sel:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.12); background-color: #fff; }
        .fm-textarea {
          width: 100%; padding: 12px 14px; min-height: 76px;
          background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 600;
          color: #0f172a; outline: none; resize: vertical; transition: border-color .2s;
        }
        .fm-textarea:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
        .fm-textarea::placeholder { color: #cbd5e1; font-weight: 500; }
        .fm-hint { font-size: 11px; color: #94a3b8; font-weight: 600; margin-top: 4px; }

        /* OTP */
        .fm-otp-wrap { display: flex; gap: 10px; justify-content: center; margin: 4px 0 8px; }
        .fm-otp-box {
          width: 52px; height: 60px; background: #f8fafc; border: 2px solid #e2e8f0;
          border-radius: 12px; font-size: 26px; font-weight: 900; text-align: center;
          font-family: 'Nunito', sans-serif; color: #0f172a; outline: none;
          transition: border-color .2s, box-shadow .2s, transform .15s; caret-color: transparent;
        }
        .fm-otp-box:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 4px rgba(59,130,246,.15); transform: translateY(-2px); }
        .fm-otp-box.filled { border-color: #1e3a8a; background: #eff6ff; }

        /* WA badge */
        .fm-wa-badge { display: flex; align-items: center; gap: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 14px; margin-bottom: 20px; }
        .fm-wa-ico { width: 36px; height: 36px; border-radius: 8px; background: #25d366; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        /* Plan cards */
        .fm-plans { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .fm-plan { border: 2px solid #e2e8f0; border-radius: 12px; padding: 14px; cursor: pointer; transition: all .2s; position: relative; overflow: hidden; }
        .fm-plan:hover { border-color: #93c5fd; }
        .fm-plan.selected { border-color: #3b82f6; background: #eff6ff; }
        .fm-plan.highlight-card { border-color: #1e3a8a; }
        .fm-plan-badge { position: absolute; top: 12px; right: 12px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: #fff; font-size: 10px; font-weight: 800; padding: 2px 10px; border-radius: 100px; letter-spacing: .04em; }
        .fm-plan-top { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
        .fm-plan-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #cbd5e1; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .2s; }
        .fm-plan.selected .fm-plan-radio { border-color: #3b82f6; background: #3b82f6; }
        .fm-plan-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; opacity: 0; transition: opacity .2s; }
        .fm-plan.selected .fm-plan-radio-dot { opacity: 1; }
        .fm-plan-name  { font-weight: 900; font-size: 14px; color: #0f172a; }
        .fm-plan-price { font-weight: 900; font-size: 14px; color: #1e3a8a; margin-left: auto; padding-right: 50px; }
        .fm-plan-desc  { font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 7px; padding-left: 28px; }
        .fm-plan-feats { display: flex; flex-wrap: wrap; gap: 5px; padding-left: 28px; }
        .fm-plan-feat  { font-size: 10px; background: rgba(59,130,246,.08); color: #1e40af; font-weight: 700; padding: 2px 8px; border-radius: 100px; }

        /* Agreement */
        .fm-agreement-box { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 18px; max-height: 220px; overflow-y: auto; margin-bottom: 14px; font-size: 13px; color: #374151; line-height: 1.8; font-weight: 500; }
        .fm-agreement-box h4 { font-weight: 900; font-size: 13px; color: #0f172a; margin-bottom: 8px; }
        .fm-agreement-box ol { padding-left: 16px; }
        .fm-agreement-box li { margin-bottom: 5px; }
        .fm-checkbox-row { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; cursor: pointer; margin-bottom: 4px; }
        .fm-checkbox { width: 20px; height: 20px; border: 2px solid #0ea5e9; border-radius: 5px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #fff; transition: all .2s; margin-top: 1px; }
        .fm-checkbox.checked { background: #0ea5e9; border-color: #0ea5e9; }
        .fm-checkbox-label { font-size: 13px; color: #0c4a6e; font-weight: 700; line-height: 1.5; }

        /* Summary */
        .fm-summary { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 18px; }
        .fm-summary-row { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: #475569; padding: 5px 0; border-bottom: 1px solid #f1f5f9; }
        .fm-summary-row:last-child { border-bottom: none; font-weight: 900; font-size: 14px; color: #0f172a; padding-top: 8px; }

        /* QRIS / Payment */
        .fm-qris-wrap { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 16px 0; }
        .fm-qris-apps { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
        .fm-qris-app  { font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 100px; background: #f1f5f9; color: #475569; }
        .fm-spinner { width: 44px; height: 44px; border: 4px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }

        /* Done */
        .fm-done-wrap { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 16px 0; }
        .fm-done-check { width: 76px; height: 76px; border-radius: 50%; background: linear-gradient(135deg, #22c55e, #16a34a); display: flex; align-items: center; justify-content: center; margin-bottom: 18px; animation: checkPop .5s ease forwards; box-shadow: 0 12px 32px rgba(34,197,94,.3); }

        /* Feedback */
        .fm-error   { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; margin-bottom: 14px; text-align: center; }
        .fm-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; margin-bottom: 14px; text-align: center; }

        /* Buttons */
        .fm-btn-row { display: flex; gap: 10px; margin-top: 6px; }
        .fm-btn {
          flex: 1; height: 50px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 800;
          cursor: pointer; font-family: 'Nunito', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 8px 24px rgba(59,130,246,.28); transition: transform .2s, box-shadow .2s;
        }
        .fm-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(59,130,246,.4); }
        .fm-btn:disabled { opacity: .65; cursor: not-allowed; }
        .fm-btn-ghost {
          flex: 0 0 auto; height: 50px; padding: 0 20px;
          background: #f1f5f9; color: #475569; border: none; border-radius: 10px;
          font-size: 14px; font-weight: 800; cursor: pointer; font-family: 'Nunito', sans-serif;
          transition: background .2s;
        }
        .fm-btn-ghost:hover { background: #e2e8f0; }
        .fm-dots { display: flex; gap: 5px; align-items: center; }
        .fm-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; animation: dotBounce 1s ease-in-out infinite; }

        /* Mobile topbar */
        .fm-topbar { display: none; background: linear-gradient(135deg, #060b1a, #1e3a8a); padding: 14px 20px; align-items: center; gap: 12px; cursor: pointer; }
        .fm-topbar-mark { width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .fm-topbar-mark span { font-weight: 900; font-size: 10px; color: #fff; }
        .fm-topbar-name { font-weight: 900; font-size: 15px; color: #fff; }
        .fm-topbar-sub  { font-size: 10px; color: rgba(255,255,255,.4); font-weight: 600; }

        @media (max-width: 900px) {
          .fm-left { display: none; }
          .fm-topbar { display: flex; }
          .fm-root { flex-direction: column; }
          .fm-right { padding: 28px 20px 48px; }
          .fm-card { max-width: 100%; }
          .fm-field-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .fm-right { padding: 20px 16px 40px; }
          .fm-section-title { font-size: 20px; }
          .fm-otp-box { width: 44px; height: 54px; font-size: 22px; border-radius: 10px; }
          .fm-otp-wrap { gap: 7px; }
        }
      `}</style>

      <div className="fm-root">
        {/* Mobile topbar */}
        <div className="fm-topbar" onClick={() => router.push("/")}>
          <div className="fm-topbar-mark">
            <span>INV</span>
          </div>
          <div>
            <div className="fm-topbar-name">STOCKR</div>
            <div className="fm-topbar-sub">Inventory Management System</div>
          </div>
        </div>

        {/* ── LEFT PANEL ── */}
        <div className="fm-left">
          <div className="fm-left-grid" />
          <div className="fm-left-glow" />
          <div className="fm-left-glow2" />

          <div className="fm-ticker-wrap">
            <div className="fm-ticker-track">
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
                    <span key={j} className="fm-ticker-item">
                      <span className="fm-ticker-dot" />
                      {t}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          <div className="fm-brand-area" onClick={() => router.push("/")}>
            <div className="fm-brand-mark">
              <span>INV</span>
            </div>
            <div>
              <div className="fm-brand-name">STOCKR</div>
              <div className="fm-brand-sub">Inventory Management System</div>
            </div>
          </div>

          <div className="fm-hero">
            <div className="fm-hero-tag">
              <span className="fm-hero-tag-dot" />
              <span className="fm-hero-tag-text">Program Mitra 2026</span>
            </div>
            <h1 className="fm-hero-title">
              Bergabung sebagai
              <br />
              <em>Mitra STOCKR</em>
            </h1>
            <p className="fm-hero-desc">
              Daftar akun, lengkapi data bisnis, dan dapatkan akses penuh ke
              platform inventori terdepan.
            </p>

            {/* Step visual — only main steps (no otp) */}
            <div className="fm-step-visual">
              {LEFT_STEPS.map((s, i) => {
                const isActive =
                  s.key === step || (s.key === "account" && step === "otp")
                const isDone =
                  leftStepIndex > i ||
                  (step === "otp" && i < 0) ||
                  ([
                    "business",
                    "plan",
                    "agreement",
                    "payment",
                    "done"
                  ].includes(step) &&
                    s.key === "account") ||
                  (["plan", "agreement", "payment", "done"].includes(step) &&
                    s.key === "business") ||
                  (["agreement", "payment", "done"].includes(step) &&
                    s.key === "plan") ||
                  (["payment", "done"].includes(step) &&
                    s.key === "agreement") ||
                  (step === "done" && s.key === "payment")

                return (
                  <div
                    key={s.key}
                    className={`fm-step-v-item${isActive ? " v-active" : ""}`}
                  >
                    <div
                      className={`fm-step-v-circle${isDone ? " v-done" : isActive ? " v-active" : ""}`}
                    >
                      {isDone ? "✓" : s.short}
                    </div>
                    <div className="fm-step-v-label">
                      <div
                        className={`fm-step-v-title${isDone ? " v-done" : isActive ? " v-active" : ""}`}
                      >
                        {s.label}
                      </div>
                      <div className="fm-step-v-sub">{leftStepMeta[s.key]}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="fm-benefits">
              {[
                "Aktivasi instan setelah pembayaran",
                "Dukungan onboarding dedikasi",
                "SLA & garansi uptime 99.9%"
              ].map((b) => (
                <div key={b} className="fm-benefit">
                  <div className="fm-benefit-ico">
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

          <div className="fm-bottom-bar">
            <div className="fm-bottom-trust">
              <span className="fm-bottom-trust-dot" />
              Pembayaran aman via DOKU
            </div>
            <span className="fm-bottom-version">v2.4.1 · 2026</span>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="fm-right">
          <div className="fm-card">
            {/* Progress bar */}
            {step !== "done" && (
              <div className="fm-progress">
                {progressSteps
                  .filter((s) => s !== "done")
                  .map((s, i) => (
                    <div
                      key={s}
                      className={`fm-progress-step ${i < progressIndex ? "ps-done" : i === progressIndex ? "ps-active" : ""}`}
                    />
                  ))}
              </div>
            )}

            {success && step !== "otp" && (
              <div className="fm-success">✓ {success}</div>
            )}

            {/* ═══════════════════════════════════════════
                STEP 1: ACCOUNT + PIC
            ════════════════════════════════════════════ */}
            {step === "account" && (
              <>
                <div className="fm-section-title">Buat Akun & Data PIC</div>
                <div className="fm-section-sub">
                  Isi informasi akun dan Person In Charge yang bertanggung jawab
                  atas kemitraan.
                </div>

                {/* Account section */}
                <div className="fm-divider">
                  <div className="fm-divider-line" />
                  <span className="fm-divider-text">INFORMASI AKUN</span>
                  <div className="fm-divider-line" />
                </div>

                <div className="fm-field">
                  <label className="fm-lbl">
                    Nama Lengkap <span>*</span>
                  </label>
                  <div className="fm-inp-wrap">
                    <svg
                      className="fm-inp-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      className="fm-inp"
                      type="text"
                      placeholder="Nama lengkap kamu"
                      value={form.name}
                      onChange={handleChange("name")}
                    />
                  </div>
                </div>

                <div className="fm-field-row">
                  <div>
                    <label className="fm-lbl">
                      Email <span>*</span>
                    </label>
                    <div className="fm-inp-wrap">
                      <svg
                        className="fm-inp-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <input
                        className="fm-inp"
                        type="email"
                        placeholder="email@perusahaan.com"
                        value={form.email}
                        onChange={handleChange("email")}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="fm-lbl">
                      WhatsApp <span>*</span>
                    </label>
                    <div className="fm-inp-wrap">
                      <svg
                        className="fm-inp-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <input
                        className="fm-inp"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={form.phone}
                        onChange={handleChange("phone")}
                      />
                    </div>
                    <p className="fm-hint">OTP akan dikirim ke nomor ini</p>
                  </div>
                </div>

                <div className="fm-field-row">
                  <div>
                    <label className="fm-lbl">
                      Password <span>*</span>
                    </label>
                    <div className="fm-inp-wrap">
                      <svg
                        className="fm-inp-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <input
                        className="fm-inp has-eye"
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
                    <label className="fm-lbl">
                      Konfirmasi <span>*</span>
                    </label>
                    <div className="fm-inp-wrap">
                      <svg
                        className="fm-inp-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <input
                        className="fm-inp has-eye"
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
                <div className="fm-divider" style={{ marginTop: 6 }}>
                  <div className="fm-divider-line" />
                  <span className="fm-divider-text">DATA PIC</span>
                  <div className="fm-divider-line" />
                </div>

                <div className="fm-field-row">
                  <div>
                    <label className="fm-lbl">
                      Jabatan <span>*</span>
                    </label>
                    <div className="fm-inp-wrap">
                      <svg
                        className="fm-inp-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <rect x="2" y="7" width="20" height="14" rx="2" />
                        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                      </svg>
                      <input
                        className="fm-inp"
                        type="text"
                        placeholder="Direktur / Manager"
                        value={form.pic_position}
                        onChange={handleChange("pic_position")}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="fm-lbl">No. KTP</label>
                    <div className="fm-inp-wrap">
                      <svg
                        className="fm-inp-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                      <input
                        className="fm-inp"
                        type="text"
                        placeholder="16 digit NIK"
                        maxLength={16}
                        value={form.pic_ktp}
                        onChange={handleChange("pic_ktp")}
                      />
                    </div>
                  </div>
                </div>

                <div className="fm-btn-row">
                  <button
                    className="fm-btn"
                    onClick={handleSendOtp}
                    disabled={loading}
                  >
                    {loading ? <LoadingDots /> : "Kirim OTP WhatsApp →"}
                  </button>
                </div>
                <p
                  style={{
                    textAlign: "center",
                    marginTop: 14,
                    fontSize: 13,
                    color: "#94a3b8",
                    fontWeight: 600
                  }}
                >
                  Sudah punya akun?{" "}
                  <Link
                    href="/login"
                    style={{
                      color: "#1e3a8a",
                      fontWeight: 800,
                      textDecoration: "none"
                    }}
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
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 14,
                      background: "#25d366",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 14px"
                    }}
                  >
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.570-.347z" />
                      <path d="M11.997 0C5.373 0 0 5.373 0 12c0 2.115.554 4.098 1.523 5.82L0 24l6.335-1.508A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.624 0 11.997 0zm.003 21.818a9.818 9.818 0 0 1-5.002-1.366l-.359-.213-3.72.886.92-3.636-.234-.373A9.818 9.818 0 1 1 12 21.818z" />
                    </svg>
                  </div>
                  <div className="fm-section-title" style={{ fontSize: 22 }}>
                    Verifikasi WhatsApp
                  </div>
                  <div className="fm-section-sub">
                    Kode OTP dikirim ke
                    <br />
                    <strong style={{ color: "#0f172a" }}>
                      WhatsApp {form.phone}
                    </strong>
                  </div>
                </div>

                {error && <div className="fm-error">⚠ {error}</div>}
                {success && <div className="fm-success">✓ {success}</div>}

                <div className="fm-field">
                  <label
                    className="fm-lbl"
                    style={{ textAlign: "center", display: "block" }}
                  >
                    Masukkan 6 Digit OTP
                  </label>
                  <OtpInput
                    digits={otpDigits}
                    refs={otpRefs}
                    onChange={handleOtpChange}
                    onKeyDown={handleOtpKeyDown}
                    onPaste={handleOtpPaste}
                  />
                  <p className="fm-hint" style={{ textAlign: "center" }}>
                    Berlaku 5 menit
                  </p>
                </div>

                <button
                  className="fm-btn"
                  style={{ width: "100%" }}
                  onClick={handleVerifyOtp}
                  disabled={loading || otpValue.length !== 6}
                >
                  {loading ? <LoadingDots /> : "Verifikasi & Lanjut →"}
                </button>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 14,
                    fontSize: 13,
                    fontWeight: 700
                  }}
                >
                  <button
                    onClick={() => {
                      setStep("account")
                      setError("")
                      setSuccess("")
                      setOtpDigits(Array(6).fill(""))
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  >
                    ← Ganti nomor
                  </button>
                  <button
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || loading}
                    style={{
                      background: "none",
                      border: "none",
                      color: countdown > 0 ? "#94a3b8" : "#1e3a8a",
                      cursor: countdown > 0 ? "not-allowed" : "pointer",
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "'Nunito', sans-serif"
                    }}
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
                <div className="fm-section-title">Data Bisnis</div>
                <div className="fm-section-sub">
                  Informasi perusahaan yang akan menjadi mitra STOCKR.
                </div>

                <div className="fm-field">
                  <label className="fm-lbl">
                    Nama Perusahaan <span>*</span>
                  </label>
                  <div className="fm-inp-wrap">
                    <svg
                      className="fm-inp-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <input
                      className="fm-inp"
                      type="text"
                      placeholder="PT / CV / UD nama perusahaan"
                      value={form.company_name}
                      onChange={handleChange("company_name")}
                    />
                  </div>
                </div>

                <div className="fm-field-row">
                  <div>
                    <label className="fm-lbl">
                      Jenis Bisnis <span>*</span>
                    </label>
                    <select
                      className="fm-sel"
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
                    <label className="fm-lbl">NPWP</label>
                    <div className="fm-inp-wrap">
                      <svg
                        className="fm-inp-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <input
                        className="fm-inp"
                        type="text"
                        placeholder="00.000.000.0-000.000"
                        value={form.company_npwp}
                        onChange={handleChange("company_npwp")}
                      />
                    </div>
                  </div>
                </div>

                <div className="fm-field">
                  <label className="fm-lbl">
                    Alamat Perusahaan <span>*</span>
                  </label>
                  <textarea
                    className="fm-textarea"
                    placeholder="Jalan, nomor, RT/RW, kelurahan, kecamatan..."
                    value={form.company_address}
                    onChange={handleChange("company_address")}
                  />
                </div>

                <div className="fm-field-row">
                  <div>
                    <label className="fm-lbl">
                      Kota <span>*</span>
                    </label>
                    <input
                      className="fm-inp no-icon"
                      type="text"
                      placeholder="Jakarta"
                      value={form.company_city}
                      onChange={handleChange("company_city")}
                    />
                  </div>
                  <div>
                    <label className="fm-lbl">Provinsi</label>
                    <input
                      className="fm-inp no-icon"
                      type="text"
                      placeholder="DKI Jakarta"
                      value={form.company_province}
                      onChange={handleChange("company_province")}
                    />
                  </div>
                </div>

                <div className="fm-field-row">
                  <div>
                    <label className="fm-lbl">Kode Pos</label>
                    <input
                      className="fm-inp no-icon"
                      type="text"
                      placeholder="12345"
                      maxLength={5}
                      value={form.company_postal}
                      onChange={handleChange("company_postal")}
                    />
                  </div>
                  <div>
                    <label className="fm-lbl">Jumlah Karyawan</label>
                    <select
                      className="fm-sel"
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

                <div className="fm-btn-row">
                  <button
                    className="fm-btn-ghost"
                    onClick={() => {
                      setStep("account")
                      setError("")
                      setSuccess("")
                    }}
                  >
                    ← Kembali
                  </button>
                  <button className="fm-btn" onClick={handleBusinessNext}>
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
                <div className="fm-section-title">Pilih Paket</div>
                <div className="fm-section-sub">
                  Pilih paket yang sesuai dengan kebutuhan bisnis kamu.
                </div>

                <div className="fm-plans">
                  {PLAN_OPTIONS.map((p) => (
                    <div
                      key={p.id}
                      className={`fm-plan${p.highlight ? " highlight-card" : ""}${selectedPlan === p.id ? " selected" : ""}`}
                      onClick={() => setSelectedPlan(p.id)}
                    >
                      {p.highlight && (
                        <span className="fm-plan-badge">POPULER</span>
                      )}
                      <div className="fm-plan-top">
                        <div className="fm-plan-radio">
                          <div className="fm-plan-radio-dot" />
                        </div>
                        <span className="fm-plan-name">{p.name}</span>
                        <span className="fm-plan-price">
                          {formatRp(p.price)}
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "#94a3b8"
                            }}
                          >
                            /bln
                          </span>
                        </span>
                      </div>
                      <div className="fm-plan-desc">{p.desc}</div>
                      <div className="fm-plan-feats">
                        {p.features.map((f) => (
                          <span key={f} className="fm-plan-feat">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="fm-btn-row">
                  <button
                    className="fm-btn-ghost"
                    onClick={() => {
                      setStep("business")
                      setError("")
                    }}
                  >
                    ← Kembali
                  </button>
                  <button className="fm-btn" onClick={handlePlanNext}>
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
                <div className="fm-section-title">Perjanjian Kerjasama</div>
                <div className="fm-section-sub">
                  Baca dan setujui syarat kemitraan STOCKR sebelum melanjutkan
                  ke pembayaran.
                </div>

                <div className="fm-agreement-box">
                  <h4>PERJANJIAN KERJASAMA MITRA STOCKR</h4>
                  <p>
                    Perjanjian ini dibuat antara{" "}
                    <strong>PT Stockr Teknologi Indonesia</strong>{" "}
                    ("Perusahaan") dan Mitra yang telah mengisi formulir
                    pendaftaran ini ("Mitra"), bersama-sama disebut sebagai
                    "Para Pihak".
                  </p>
                  <ol>
                    <li>
                      <strong>Lingkup Kerjasama.</strong> Perusahaan memberikan
                      akses platform STOCKR kepada Mitra sesuai paket yang
                      dipilih, untuk keperluan manajemen inventori dan
                      operasional bisnis internal Mitra.
                    </li>
                    <li>
                      <strong>Masa Berlaku.</strong> Perjanjian ini berlaku
                      selama 12 (dua belas) bulan sejak tanggal aktivasi dan
                      dapat diperpanjang secara otomatis kecuali salah satu
                      pihak menyatakan penghentian minimal 30 hari sebelum
                      berakhirnya masa berlaku.
                    </li>
                    <li>
                      <strong>Pembayaran.</strong> Mitra wajib membayar biaya
                      langganan sesuai paket yang dipilih. Pembayaran dilakukan
                      di muka setiap bulan melalui metode yang disediakan oleh
                      Perusahaan.
                    </li>
                    <li>
                      <strong>Kerahasiaan Data.</strong> Para Pihak sepakat
                      untuk menjaga kerahasiaan data dan informasi yang
                      diperoleh selama pelaksanaan kerjasama ini.
                    </li>
                    <li>
                      <strong>Hak & Kewajiban Mitra.</strong> Mitra berhak
                      mendapatkan dukungan teknis sesuai paket, pembaruan fitur,
                      dan akses ke dokumentasi. Mitra berkewajiban menggunakan
                      platform sesuai ketentuan penggunaan yang berlaku.
                    </li>
                    <li>
                      <strong>Penghentian Layanan.</strong> Perusahaan berhak
                      menghentikan layanan jika Mitra melanggar ketentuan
                      penggunaan, gagal melakukan pembayaran dalam 7 hari kerja,
                      atau terbukti melakukan tindakan yang merugikan pihak
                      lain.
                    </li>
                    <li>
                      <strong>Hukum yang Berlaku.</strong> Perjanjian ini tunduk
                      pada hukum Republik Indonesia. Setiap sengketa
                      diselesaikan melalui musyawarah atau jalur hukum yang
                      berlaku.
                    </li>
                  </ol>
                </div>

                <div className="fm-summary">
                  <div className="fm-summary-row">
                    <span>Mitra</span>
                    <span>{form.company_name || "—"}</span>
                  </div>
                  <div className="fm-summary-row">
                    <span>PIC</span>
                    <span>{form.name || "—"}</span>
                  </div>
                  <div className="fm-summary-row">
                    <span>Paket</span>
                    <span>{plan.name}</span>
                  </div>
                  <div className="fm-summary-row">
                    <span>Total Pembayaran</span>
                    <span>{formatRp(plan.price)}/bulan</span>
                  </div>
                </div>

                <div
                  className="fm-checkbox-row"
                  onClick={() => setAgreed((v) => !v)}
                >
                  <div className={`fm-checkbox${agreed ? " checked" : ""}`}>
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
                  <span className="fm-checkbox-label">
                    Saya telah membaca dan menyetujui{" "}
                    <strong>Perjanjian Kerjasama Mitra STOCKR</strong> di atas
                    dan bertanggung jawab atas kebenaran data yang diberikan.
                  </span>
                </div>

                <div className="fm-btn-row" style={{ marginTop: 14 }}>
                  <button
                    className="fm-btn-ghost"
                    onClick={() => {
                      setStep("plan")
                      setError("")
                    }}
                  >
                    ← Kembali
                  </button>
                  <button
                    className="fm-btn"
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
                <div className="fm-section-title">Pembayaran</div>
                <div className="fm-section-sub">
                  Selesaikan pembayaran untuk mengaktifkan akun mitra kamu.
                </div>

                <div className="fm-summary" style={{ marginBottom: 18 }}>
                  <div className="fm-summary-row">
                    <span>Paket</span>
                    <span>{plan.name}</span>
                  </div>
                  <div className="fm-summary-row">
                    <span>Total</span>
                    <span style={{ color: "#1e3a8a" }}>
                      {formatRp(plan.price)}
                    </span>
                  </div>
                </div>

                {qrisLoading ? (
                  <div className="fm-qris-wrap">
                    <div className="fm-spinner" />
                    <p
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                        fontWeight: 600
                      }}
                    >
                      Membuat sesi pembayaran...
                    </p>
                  </div>
                ) : paymentStatus === "failed" ? (
                  <div>
                    <div className="fm-error">
                      Pembayaran gagal atau kedaluwarsa. Silakan coba lagi.
                    </div>
                    <button
                      className="fm-btn"
                      style={{ width: "100%" }}
                      onClick={handleRetryPayment}
                    >
                      Buat Pembayaran Baru
                    </button>
                  </div>
                ) : paymentStatus === "paid" ? (
                  <div
                    className="fm-success"
                    style={{ fontSize: 15, padding: 20, textAlign: "center" }}
                  >
                    ✓ Pembayaran diterima! Menyelesaikan pendaftaran...
                    <div
                      className="fm-spinner"
                      style={{
                        margin: "12px auto 0",
                        borderTopColor: "#16a34a"
                      }}
                    />
                  </div>
                ) : qrisUrl ? (
                  <div className="fm-qris-wrap">
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 14,
                        background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 24px rgba(59,130,246,.28)"
                      }}
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
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: 16,
                          color: "#0f172a",
                          marginBottom: 4
                        }}
                      >
                        Lanjutkan Pembayaran
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                          fontWeight: 500,
                          lineHeight: 1.6
                        }}
                      >
                        Klik tombol di bawah untuk membuka halaman pembayaran
                        DOKU.
                        <br />
                        Pilih metode: Virtual Account, OVO, GoPay, ShopeePay,
                        dll.
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "#fef9ec",
                        border: "1px solid #fde68a",
                        borderRadius: 8,
                        padding: "8px 14px"
                      }}
                    >
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
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#d97706"
                        }}
                      >
                        Link berlaku 15 menit · Status diperbarui otomatis
                      </span>
                    </div>
                    <a
                      href={qrisUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: "100%",
                        height: 50,
                        background:
                          "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                        color: "#fff",
                        borderRadius: 10,
                        fontSize: 15,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        textDecoration: "none",
                        boxShadow: "0 8px 24px rgba(59,130,246,.28)"
                      }}
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
                        style={{
                          width: "100%",
                          height: 44,
                          background: "#f0fdf4",
                          border: "2px dashed #22c55e",
                          borderRadius: 10,
                          color: "#16a34a",
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: "pointer",
                          fontFamily: "'Nunito', sans-serif"
                        }}
                      >
                        Pembayaran Sukses
                      </button>
                    )}
                    <div style={{ width: "100%" }}>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#94a3b8",
                          fontWeight: 700,
                          textAlign: "center",
                          marginBottom: 7
                        }}
                      >
                        METODE PEMBAYARAN TERSEDIA
                      </div>
                      <div className="fm-qris-apps">
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
                          <span key={a} className="fm-qris-app">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="fm-qris-wrap">
                    <div className="fm-spinner" />
                    <p
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                        fontWeight: 600
                      }}
                    >
                      Memuat...
                    </p>
                  </div>
                )}

                <div
                  style={{
                    marginTop: 16,
                    textAlign: "center",
                    fontSize: 12,
                    color: "#94a3b8",
                    fontWeight: 600
                  }}
                >
                  Pembayaran diproses secara aman oleh{" "}
                  <span style={{ color: "#1e3a8a", fontWeight: 800 }}>
                    DOKU
                  </span>{" "}
                  · Terenkripsi & berlisensi Bank Indonesia
                </div>

                <div className="fm-btn-row" style={{ marginTop: 14 }}>
                  <button
                    className="fm-btn-ghost"
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
              <div className="fm-done-wrap">
                <div className="fm-done-check">
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
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 24,
                    color: "#0f172a",
                    marginBottom: 8
                  }}
                >
                  Pendaftaran Berhasil!
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#64748b",
                    fontWeight: 500,
                    lineHeight: 1.7,
                    maxWidth: 320,
                    marginBottom: 26
                  }}
                >
                  Selamat!{" "}
                  <strong style={{ color: "#0f172a" }}>
                    {form.company_name}
                  </strong>{" "}
                  kini resmi menjadi mitra STOCKR. Tim kami akan menghubungi
                  kamu di{" "}
                  <strong style={{ color: "#0f172a" }}>{form.email}</strong>{" "}
                  dalam 1×24 jam untuk proses onboarding.
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    width: "100%"
                  }}
                >
                  <button
                    className="fm-btn"
                    style={{ width: "100%", height: 54, fontSize: 16 }}
                    onClick={() => router.push("/login")}
                  >
                    Masuk ke Dashboard
                  </button>
                  <button
                    className="fm-btn-ghost"
                    style={{
                      width: "100%",
                      height: 48,
                      fontSize: 14,
                      flex: "none"
                    }}
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
    </>
  )
}
