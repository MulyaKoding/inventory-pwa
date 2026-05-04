"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

type Step = "form" | "otp"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("form")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: ""
  })
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""))
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || loading) return
      if (step === "form") {
        handleSendOTP(e as any)
      } else if (step === "otp" && otpDigits.join("").length === 6) {
        handleVerifyAndRegister(e as any)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [step, loading, form, otpDigits])

  const imageWa =
    "https://res.cloudinary.com/dp0dtct3v/image/upload/v1775458567/whatsapp_objiub.png"

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1)
    const newDigits = [...otpDigits]
    newDigits[index] = digit
    setOtpDigits(newDigits)
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
    const newDigits = Array(6).fill("")
    pasted.split("").forEach((char, i) => {
      newDigits[i] = char
    })
    setOtpDigits(newDigits)
    const nextEmpty = Math.min(pasted.length, 5)
    otpRefs.current[nextEmpty]?.focus()
  }

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

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

  const handleSendOTP = async (e: React.MouseEvent) => {
    e.preventDefault()
    setError("")
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("Semua field wajib diisi")
      return
    }
    if (form.password !== form.confirm) {
      setError("Password tidak cocok")
      return
    }
    if (form.password.length < 8) {
      setError("Password minimal 8 karakter")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      setStep("otp")
      startCountdown()
      setSuccess(`OTP dikirim ke WhatsApp ${form.phone}`)
    } catch {
      setError("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndRegister = async (e: React.MouseEvent) => {
    e.preventDefault()
    setError("")
    const otp = otpDigits.join("")
    if (otp.length !== 6) {
      setError("Masukkan 6 digit OTP")
      return
    }
    setLoading(true)
    try {
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, otp })
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) {
        setError(verifyData.error)
        return
      }
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
        setError(regData.error)
        return
      }
      setSuccess("Registrasi berhasil! Mengarahkan ke login...")
      setTimeout(() => router.push("/login"), 1500)
    } catch {
      setError("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dotBounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-5px); opacity: 1; } }
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.7); opacity: 0; } }
        @keyframes gridPan { from { background-position: 0 0; } to { background-position: 48px 48px; } }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        .rg-root { display: flex; min-height: 100vh; font-family: 'Nunito', sans-serif; }

        /* ── LEFT — sama persis dengan login ── */
        .rg-left {
          position: relative; width: 52%; min-height: 100vh;
          background: linear-gradient(160deg, #060b1a 0%, #0c1733 30%, #0f2050 60%, #1e3a8a 100%);
          display: flex; flex-direction: column; overflow: hidden;
        }
        .rg-left-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 48px 48px; animation: gridPan 8s linear infinite;
        }
        .rg-left-glow { position: absolute; top: -120px; right: -120px; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(59,130,246,.22) 0%, transparent 70%); pointer-events: none; }
        .rg-left-glow2 { position: absolute; bottom: -80px; left: -80px; width: 380px; height: 380px; border-radius: 50%; background: radial-gradient(circle, rgba(30,58,138,.18) 0%, transparent 70%); pointer-events: none; }
        .rg-ticker-wrap { position: absolute; top: 0; left: 0; right: 0; background: rgba(0,0,0,.25); backdrop-filter: blur(8px); border-bottom: 1px solid rgba(255,255,255,.08); height: 36px; overflow: hidden; display: flex; align-items: center; }
        .rg-ticker-track { display: flex; animation: ticker 28s linear infinite; white-space: nowrap; }
        .rg-ticker-item { display: inline-flex; align-items: center; gap: 14px; padding: 0 36px; font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 11px; color: rgba(255,255,255,.5); letter-spacing: .06em; }
        .rg-ticker-dot { width: 4px; height: 4px; border-radius: 50%; background: #60a5fa; }
        .rg-brand-area { position: relative; z-index: 2; padding: 52px 52px 0; display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .rg-brand-mark { width: 40px; height: 40px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(59,130,246,.35); }
        .rg-brand-mark span { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 11px; color: #fff; }
        .rg-brand-name { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 18px; color: #fff; letter-spacing: .06em; }
        .rg-brand-sub { font-size: 11px; color: rgba(255,255,255,.4); font-family: 'Nunito', sans-serif; font-weight: 600; margin-top: 2px; }
        .rg-hero { position: relative; z-index: 2; padding: 40px 52px 0; flex: 1; }
        .rg-hero-tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.08); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.15); border-radius: 100px; padding: 6px 14px; margin-bottom: 24px; }
        .rg-hero-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #60a5fa; position: relative; }
        .rg-hero-tag-dot::after { content: ''; position: absolute; inset: -3px; border-radius: 50%; background: rgba(96,165,250,.4); animation: pulse-ring 1.8s ease-out infinite; }
        .rg-hero-tag-text { color: rgba(255,255,255,.85); font-size: 11px; font-family: 'Nunito', sans-serif; font-weight: 800; letter-spacing: .05em; }
        .rg-hero-title { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: clamp(28px, 3vw, 40px); line-height: 1.1; letter-spacing: -.02em; color: #fff; margin-bottom: 14px; }
        .rg-hero-title em { font-style: normal; color: #60a5fa; }
        .rg-hero-desc { font-size: 14px; color: rgba(255,255,255,.6); line-height: 1.7; max-width: 360px; font-family: 'Nunito', sans-serif; font-weight: 500; margin-bottom: 28px; }
        /* Visual mock */
        .rg-visual { border: 1px solid rgba(255,255,255,.1); border-radius: 14px; overflow: hidden; background: rgba(0,0,0,.2); margin-bottom: 24px; }
        .rg-visual-header { padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,.07); display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,.15); }
        .rg-visual-dot { width: 8px; height: 8px; border-radius: 50%; }
        .rg-visual-title { font-size: 11px; color: rgba(255,255,255,.3); font-family: 'Nunito', sans-serif; font-weight: 700; margin-left: 4px; }
        .rg-visual-body { padding: 12px; display: flex; flex-direction: column; gap: 7px; }
        .rg-visual-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 12px; background: rgba(255,255,255,.04); border-radius: 8px; border: 1px solid rgba(255,255,255,.06); }
        .rg-visual-row-left { display: flex; align-items: center; gap: 10px; }
        .rg-visual-row-ico { width: 26px; height: 26px; border-radius: 6px; background: rgba(255,255,255,.06); display: flex; align-items: center; justify-content: center; font-size: 13px; }
        .rg-visual-row-name { font-size: 12px; color: rgba(255,255,255,.65); font-family: 'Nunito', sans-serif; font-weight: 700; }
        .rg-visual-row-stock { font-size: 10px; color: rgba(255,255,255,.25); font-family: 'Nunito', sans-serif; font-weight: 600; }
        .rg-visual-badge { font-size: 10px; font-family: 'Nunito', sans-serif; font-weight: 800; padding: 2px 9px; border-radius: 100px; }
        .rg-visual-badge.ok { background: rgba(29,78,216,.15); color: #93c5fd; }
        .rg-visual-badge.warn { background: rgba(245,158,11,.12); color: #fde68a; }
        .rg-visual-badge.low { background: rgba(239,68,68,.12); color: #fca5a5; }
        /* Steps */
        .rg-steps { display: flex; flex-direction: column; gap: 10px; }
        .rg-step { display: flex; align-items: flex-start; gap: 14px; }
        .rg-step-num { width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0; background: rgba(59,130,246,.15); border: 1px solid rgba(59,130,246,.3); display: flex; align-items: center; justify-content: center; font-size: 11px; font-family: 'Nunito', sans-serif; font-weight: 900; color: #93c5fd; margin-top: 2px; }
        .rg-step-text { font-size: 13px; color: rgba(255,255,255,.5); font-family: 'Nunito', sans-serif; font-weight: 600; line-height: 1.5; }
        .rg-step-text strong { color: rgba(255,255,255,.8); font-weight: 800; }
        .rg-bottom-bar { position: relative; z-index: 2; padding: 22px 52px; border-top: 1px solid rgba(255,255,255,.07); display: flex; align-items: center; justify-content: space-between; }
        .rg-bottom-trust { display: flex; align-items: center; gap: 8px; font-size: 12px; color: rgba(255,255,255,.35); font-family: 'Nunito', sans-serif; font-weight: 700; }
        .rg-bottom-trust-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; }
        .rg-bottom-version { font-size: 11px; color: rgba(255,255,255,.2); font-family: 'Nunito', sans-serif; font-weight: 700; }
        /* ── RIGHT ── */
        .rg-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 40px; background: #fff; overflow-y: auto; }
        .rg-card { width: 100%; max-width: 400px; animation: fadeUp .5s ease forwards; }
        .rg-form-title { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 30px; color: #0f172a; letter-spacing: -.02em; line-height: 1.2; margin-bottom: 6px; }
        .rg-form-sub { font-size: 14px; color: #64748b; font-family: 'Nunito', sans-serif; font-weight: 500; line-height: 1.5; margin-bottom: 24px; }
        .rg-lbl { display: block; font-size: 13px; font-weight: 700; color: #374151; font-family: 'Nunito', sans-serif; margin-bottom: 7px; }
        .rg-field { margin-bottom: 14px; }
        .rg-inp-wrap { position: relative; display: flex; align-items: center; }
        .rg-inp-icon { position: absolute; left: 14px; width: 16px; height: 16px; pointer-events: none; z-index: 1; color: #94a3b8; }
        .rg-inp { width: 100%; height: 48px; padding: 0 44px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 600; color: #0f172a; outline: none; transition: border-color .2s, box-shadow .2s; }
        .rg-inp:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
        .rg-inp::placeholder { color: #cbd5e1; font-weight: 500; }
        .rg-inp-eye { position: absolute; right: 14px; background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; color: #94a3b8; }
        .rg-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; font-family: 'Nunito', sans-serif; margin-bottom: 14px; text-align: center; }
        .rg-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; font-family: 'Nunito', sans-serif; margin-bottom: 14px; text-align: center; }
        .rg-btn { width: 100%; height: 50px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 800; cursor: pointer; font-family: 'Nunito', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 8px 24px rgba(59,130,246,.3); transition: transform .2s; margin-top: 6px; }
        .rg-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(59,130,246,.4); }
        .rg-btn:disabled { opacity: .7; cursor: not-allowed; }
        .rg-dots { display: flex; gap: 5px; }
        .rg-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; animation: dotBounce 1s ease-in-out infinite; }
        .rg-foot { text-align: center; margin-top: 20px; font-size: 13px; color: #64748b; font-family: 'Nunito', sans-serif; font-weight: 600; }
        .rg-foot a { color: #1e3a8a; text-decoration: none; font-weight: 800; }
        .rg-strength { display: flex; gap: 4px; margin-top: 7px; }
        .rg-strength-bar { flex: 1; height: 3px; border-radius: 2px; background: #e2e8f0; transition: background .3s; }
        /* Mobile */
        .rg-topbar { display: none; background: linear-gradient(135deg, #060b1a, #1e3a8a); padding: 14px 20px; align-items: center; gap: 12px; cursor: pointer; }
        .rg-topbar-mark { width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rg-topbar-mark span { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 10px; color: #fff; }
        .rg-topbar-name { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 15px; color: #fff; }
        .rg-topbar-sub { font-size: 10px; color: rgba(255,255,255,.4); font-family: 'Nunito', sans-serif; font-weight: 600; }

        @media (max-width: 900px) {
          .rg-left { display: none; }
          .rg-topbar { display: flex; }
          .rg-root { flex-direction: column; }
          .rg-right { padding: 32px 20px 48px; align-items: flex-start; }
          .rg-card { max-width: 100%; }
        }
        @media (max-width: 480px) {
          .rg-right { padding: 24px 16px 40px; }
          .rg-form-title { font-size: 24px; }
          .rg-inp { height: 44px; }
          .rg-btn { height: 46px; }
        }
        .otp-box-wrap { display: flex; gap: 10px; justify-content: center; }
        .otp-box {
          width: 52px; height: 60px;
          background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px;
          font-size: 26px; font-weight: 900; text-align: center;
          font-family: 'Nunito', sans-serif; color: #0f172a;
          outline: none; transition: border-color .2s, box-shadow .2s, transform .15s;
          caret-color: transparent;
        }
        .otp-box:focus {
          border-color: #3b82f6; background: #fff;
          box-shadow: 0 0 0 4px rgba(59,130,246,.15);
          transform: translateY(-2px);
        }
        .otp-box.filled { border-color: #1e3a8a; background: #eff6ff; }
        @media (max-width: 480px) {
          .otp-box { width: 44px; height: 54px; font-size: 22px; border-radius: 10px; }
          .otp-box-wrap { gap: 7px; }
        }
      `}</style>
      <div className="rg-root">
        {/* Mobile topbar */}
        <div className="rg-topbar" onClick={() => router.push("/")}>
          <div className="rg-topbar-mark">
            <span>INV</span>
          </div>
          <div>
            <div className="rg-topbar-name">STOCKR</div>
            <div className="rg-topbar-sub">Inventory Management System</div>
          </div>
        </div>

        {/* ── LEFT PANEL ── */}
        <div className="rg-left">
          <div className="rg-left-grid" />
          <div className="rg-left-glow" />
          <div className="rg-left-glow2" />

          {/* Ticker */}
          <div className="rg-ticker-wrap">
            <div className="rg-ticker-track">
              {[...Array(2)].map((_, i) => (
                <span key={i}>
                  {[
                    "DAFTAR GRATIS",
                    "TANPA KARTU KREDIT",
                    "OTP WHATSAPP",
                    "DATA AMAN",
                    "MULAI 2 MENIT"
                  ].map((t, j) => (
                    <span key={j} className="rg-ticker-item">
                      <span className="rg-ticker-dot" />
                      {t}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div className="rg-brand-area" onClick={() => router.push("/")}>
            <div className="rg-brand-mark">
              <span>INV</span>
            </div>
            <div>
              <div className="rg-brand-name">STOCKR</div>
              <div className="rg-brand-sub">Inventory Management System</div>
            </div>
          </div>

          {/* Hero */}
          <div className="rg-hero">
            <div className="rg-hero-tag">
              <span className="rg-hero-tag-dot" />
              <span className="rg-hero-tag-text">Gratis Selamanya</span>
            </div>
            <h1 className="rg-hero-title">
              Mulai Kelola
              <br />
              <em>Inventori Kamu.</em>
            </h1>
            <p className="rg-hero-desc">
              Buat akun gratis dan langsung akses semua fitur manajemen stok,
              pesanan, dan laporan bisnis.
            </p>

            {/* Visual mock */}
            <div className="rg-visual">
              <div className="rg-visual-header">
                <span
                  className="rg-visual-dot"
                  style={{ background: "#ef4444" }}
                />
                <span
                  className="rg-visual-dot"
                  style={{ background: "#f59e0b" }}
                />
                <span
                  className="rg-visual-dot"
                  style={{ background: "#22c55e" }}
                />
                <span className="rg-visual-title">stockr / inventory</span>
              </div>
              <div className="rg-visual-body">
                {[
                  {
                    ico: "📦",
                    name: "Kaos Polos Putih",
                    stock: "124 pcs",
                    status: "ok",
                    badge: "In Stock"
                  },
                  {
                    ico: "👟",
                    name: "Sepatu Running X9",
                    stock: "8 pcs",
                    status: "warn",
                    badge: "Low Stock"
                  },
                  {
                    ico: "🎒",
                    name: "Tas Ransel Urban",
                    stock: "0 pcs",
                    status: "low",
                    badge: "Habis"
                  }
                ].map((r) => (
                  <div key={r.name} className="rg-visual-row">
                    <div className="rg-visual-row-left">
                      <div className="rg-visual-row-ico">{r.ico}</div>
                      <div>
                        <div className="rg-visual-row-name">{r.name}</div>
                        <div className="rg-visual-row-stock">{r.stock}</div>
                      </div>
                    </div>
                    <span className={`rg-visual-badge ${r.status}`}>
                      {r.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="rg-steps">
              {[
                {
                  n: "01",
                  t: (
                    <>
                      <strong>Daftar gratis</strong> dalam 2 menit
                    </>
                  )
                },
                {
                  n: "02",
                  t: (
                    <>
                      Verifikasi via <strong>WhatsApp OTP</strong>
                    </>
                  )
                },
                {
                  n: "03",
                  t: (
                    <>
                      <strong>Monitor & analisis</strong> dari dasbor
                    </>
                  )
                }
              ].map((s) => (
                <div key={s.n} className="rg-step">
                  <div className="rg-step-num">{s.n}</div>
                  <div className="rg-step-text">{s.t}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rg-bottom-bar">
            <div className="rg-bottom-trust">
              <span className="rg-bottom-trust-dot" />
              Gratis, tanpa kartu kredit
            </div>
            <span className="rg-bottom-version">v2.4.1 · 2026</span>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="rg-right">
          <div className="rg-card">
            {/* STEP: FORM */}
            {step === "form" && (
              <>
                <div style={{ marginBottom: 28 }}>
                  <h1 className="rg-form-title">Buat Akun</h1>
                  <p className="rg-form-sub">
                    Isi data di bawah untuk mulai menggunakan platform.
                  </p>
                </div>

                <div className="rg-field">
                  <label className="rg-lbl">Nama Lengkap</label>
                  <div className="rg-inp-wrap">
                    <svg
                      className="rg-inp-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      className="rg-inp"
                      type="text"
                      placeholder="Nama kamu"
                      value={form.name}
                      onChange={handleChange("name")}
                    />
                  </div>
                </div>

                <div className="rg-field">
                  <label className="rg-lbl">Email</label>
                  <div className="rg-inp-wrap">
                    <svg
                      className="rg-inp-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      className="rg-inp"
                      type="email"
                      placeholder="nama@email.com"
                      value={form.email}
                      onChange={handleChange("email")}
                    />
                  </div>
                </div>

                <div className="rg-field">
                  <label className="rg-lbl">Nomor WhatsApp</label>
                  <div className="rg-inp-wrap">
                    <svg
                      className="rg-inp-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <input
                      className="rg-inp"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={form.phone}
                      onChange={handleChange("phone")}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: "#94a3b8",
                      marginTop: 5,
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 600
                    }}
                  >
                    OTP akan dikirim ke WhatsApp ini
                  </p>
                </div>

                <div className="rg-field">
                  <label className="rg-lbl">Password</label>
                  <div className="rg-inp-wrap">
                    <svg
                      className="rg-inp-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      className="rg-inp"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 karakter"
                      value={form.password}
                      onChange={handleChange("password")}
                    />
                    <button
                      type="button"
                      className="rg-inp-eye"
                      onClick={() => setShowPassword((v) => !v)}
                    >
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
                    </button>
                  </div>
                  <div className="rg-strength">
                    {[0, 1, 2, 3].map((i) => {
                      const len = form.password.length
                      const active =
                        len === 0
                          ? -1
                          : len < 6
                            ? 0
                            : len < 8
                              ? 1
                              : len < 12
                                ? 2
                                : 3
                      const colors = [
                        "#ef4444",
                        "#f59e0b",
                        "#3b82f6",
                        "#22c55e"
                      ]
                      return (
                        <div
                          key={i}
                          className="rg-strength-bar"
                          style={{
                            background: i <= active ? colors[active] : undefined
                          }}
                        />
                      )
                    })}
                  </div>
                </div>

                <div className="rg-field">
                  <label className="rg-lbl">Konfirmasi Password</label>
                  <div className="rg-inp-wrap">
                    <svg
                      className="rg-inp-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <input
                      className="rg-inp"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Ulangi password"
                      value={form.confirm}
                      onChange={handleChange("confirm")}
                      style={{
                        borderColor:
                          form.confirm && form.password !== form.confirm
                            ? "#ef4444"
                            : undefined
                      }}
                    />
                    <button
                      type="button"
                      className="rg-inp-eye"
                      onClick={() => setShowConfirm((v) => !v)}
                    >
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
                    </button>
                  </div>
                  {form.confirm && form.password !== form.confirm && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "#dc2626",
                        marginTop: 5,
                        fontWeight: 700,
                        fontFamily: "'Nunito', sans-serif"
                      }}
                    >
                      Password tidak cocok
                    </p>
                  )}
                </div>

                {error && <div className="rg-error">⚠ {error}</div>}

                <button
                  className="rg-btn"
                  onClick={handleSendOTP}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="rg-dots">
                      <span
                        className="rg-dot"
                        style={{ animationDelay: "0s" }}
                      />
                      <span
                        className="rg-dot"
                        style={{ animationDelay: "0.15s" }}
                      />
                      <span
                        className="rg-dot"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </span>
                  ) : (
                    "Kirim Kode OTP →"
                  )}
                </button>

                <p className="rg-foot">
                  Sudah punya akun? <Link href="/login">Masuk di sini</Link>
                </p>
                <p
                  style={{
                    textAlign: "center",
                    marginTop: 10,
                    fontSize: 12,
                    color: "#94a3b8",
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 600
                  }}
                >
                  Dengan mendaftar kamu menyetujui{" "}
                  <a
                    href="#"
                    style={{ color: "#1e3a8a", textDecoration: "none" }}
                  >
                    Syarat & Ketentuan
                  </a>
                </p>
              </>
            )}

            {/* STEP: OTP */}
            {step === "otp" && (
              <>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <Image
                    src={imageWa}
                    alt="ic_whatsapp"
                    height={64}
                    width={64}
                    priority={true}
                    style={{
                      borderRadius: 16,
                      margin: "0 auto 16px",
                      display: "block",
                      objectFit: "contain"
                    }}
                  />
                  <h1 className="rg-form-title" style={{ fontSize: 26 }}>
                    Verifikasi WhatsApp
                  </h1>
                  <p className="rg-form-sub">
                    Kode OTP dikirim ke
                    <br />
                    <strong style={{ color: "#0f172a" }}>
                      WhatsApp {form.phone}
                    </strong>
                  </p>
                </div>

                {error && <div className="rg-error">⚠ {error}</div>}
                {success && <div className="rg-success">✓ {success}</div>}

                <div className="rg-field">
                  <label
                    className="rg-lbl"
                    style={{ textAlign: "center", display: "block" }}
                  >
                    Masukkan 6 Digit OTP
                  </label>
                  <div className="otp-box-wrap">
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          otpRefs.current[i] = el
                        }}
                        className={`otp-box${digit ? " filled" : ""}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={handleOtpPaste}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      color: "#94a3b8",
                      marginTop: 10,
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 600
                    }}
                  >
                    Berlaku 5 menit
                  </p>
                </div>

                <button
                  className="rg-btn"
                  onClick={handleVerifyAndRegister}
                  disabled={loading || otpDigits.join("").length !== 6}
                >
                  {loading ? (
                    <span className="rg-dots">
                      <span className="rg-dot" />
                      <span
                        className="rg-dot"
                        style={{ animationDelay: "0.15s" }}
                      />
                      <span
                        className="rg-dot"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </span>
                  ) : (
                    "Verifikasi & Daftar ✓"
                  )}
                </button>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 16,
                    fontSize: 13,
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700
                  }}
                >
                  <button
                    onClick={() => {
                      setStep("form")
                      setError("")
                      setOtpDigits(Array(6).fill(""))
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                      fontSize: 13,
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 700
                    }}
                  >
                    ← Ganti nomor
                  </button>
                  <button
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || loading}
                    style={{
                      background: "none",
                      border: "none",
                      color: countdown > 0 ? "#94a3b8" : "#1e3a8a",
                      cursor: countdown > 0 ? "not-allowed" : "pointer",
                      fontSize: 13,
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 700
                    }}
                  >
                    {countdown > 0
                      ? `Kirim ulang (${countdown}s)`
                      : "Kirim ulang OTP"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
