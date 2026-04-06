// app/(reset-password)/page.tsx

"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

type Step = "request" | "otp" | "newpass" | "done"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("request")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [countdown, setCountdown] = useState(0)

  const imageWa =
    "https://res.cloudinary.com/dp0dtct3v/image/upload/v1775458567/whatsapp_objiub.png"

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

  const handleSendOTP = async () => {
    setError("")
    if (!phone) {
      setError("Masukkan nomor WhatsApp kamu")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      setStep("otp")
      startCountdown()
      setSuccess(`OTP dikirim ke WhatsApp ${phone}`)
    } catch {
      setError("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setError("")
    if (otp.length !== 6) {
      setError("Masukkan 6 digit OTP")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, "").replace(/^0/, "62"),
          otp
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      setStep("newpass")
      setSuccess("")
    } catch {
      setError("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setError("")
    if (password.length < 8) {
      setError("Password minimal 8 karakter")
      return
    }
    if (password !== confirm) {
      setError("Password tidak cocok")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      setStep("done")
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
        body: JSON.stringify({ phone })
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

  const pwStrength = (() => {
    const len = password.length
    if (len === 0) return -1
    if (len < 6) return 0
    if (len < 8) return 1
    if (len < 12) return 2
    return 3
  })()
  const strengthColors = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"]

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
        @keyframes checkPop { 0% { transform: scale(0) rotate(-20deg); opacity: 0; } 70% { transform: scale(1.15) rotate(3deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }

        .rp-root { display: flex; min-height: 100vh; font-family: 'Nunito', sans-serif; }

        /* LEFT */
        .rp-left {
          position: relative; width: 52%; min-height: 100vh;
          background: linear-gradient(160deg, #060b1a 0%, #0c1733 30%, #0f2050 60%, #1e3a8a 100%);
          display: flex; flex-direction: column; overflow: hidden;
        }
        .rp-left-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 48px 48px; animation: gridPan 8s linear infinite;
        }
        .rp-left-glow { position: absolute; top: -120px; right: -120px; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(59,130,246,.22) 0%, transparent 70%); pointer-events: none; }
        .rp-left-glow2 { position: absolute; bottom: -80px; left: -80px; width: 380px; height: 380px; border-radius: 50%; background: radial-gradient(circle, rgba(30,58,138,.18) 0%, transparent 70%); pointer-events: none; }

        .rp-ticker-wrap { position: absolute; top: 0; left: 0; right: 0; background: rgba(0,0,0,.25); backdrop-filter: blur(8px); border-bottom: 1px solid rgba(255,255,255,.08); height: 36px; overflow: hidden; display: flex; align-items: center; }
        .rp-ticker-track { display: flex; animation: ticker 28s linear infinite; white-space: nowrap; }
        .rp-ticker-item { display: inline-flex; align-items: center; gap: 14px; padding: 0 36px; font-weight: 700; font-size: 11px; color: rgba(255,255,255,.5); letter-spacing: .06em; }
        .rp-ticker-dot { width: 4px; height: 4px; border-radius: 50%; background: #60a5fa; }

        .rp-brand-area { position: relative; z-index: 2; padding: 52px 52px 0; display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .rp-brand-mark { width: 40px; height: 40px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(59,130,246,.35); }
        .rp-brand-mark span { font-weight: 900; font-size: 11px; color: #fff; }
        .rp-brand-name { font-weight: 900; font-size: 18px; color: #fff; letter-spacing: .06em; }
        .rp-brand-sub { font-size: 11px; color: rgba(255,255,255,.4); font-weight: 600; margin-top: 2px; }

        .rp-hero { position: relative; z-index: 2; padding: 40px 52px 0; flex: 1; }
        .rp-hero-tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.08); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.15); border-radius: 100px; padding: 6px 14px; margin-bottom: 24px; }
        .rp-hero-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; position: relative; }
        .rp-hero-tag-dot::after { content: ''; position: absolute; inset: -3px; border-radius: 50%; background: rgba(245,158,11,.4); animation: pulse-ring 1.8s ease-out infinite; }
        .rp-hero-tag-text { color: rgba(255,255,255,.85); font-size: 11px; font-weight: 800; letter-spacing: .05em; }
        .rp-hero-title { font-weight: 900; font-size: clamp(28px, 3vw, 40px); line-height: 1.1; letter-spacing: -.02em; color: #fff; margin-bottom: 14px; }
        .rp-hero-title em { font-style: normal; color: #60a5fa; }
        .rp-hero-desc { font-size: 14px; color: rgba(255,255,255,.6); line-height: 1.7; max-width: 360px; font-weight: 500; margin-bottom: 28px; }

        /* Security Tips */
        .rp-tips { display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }
        .rp-tip { display: flex; align-items: flex-start; gap: 12px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); border-radius: 10px; padding: 12px 14px; }
        .rp-tip-ico { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
        .rp-tip-text { font-size: 12px; color: rgba(255,255,255,.55); font-weight: 600; line-height: 1.5; }
        .rp-tip-text strong { color: rgba(255,255,255,.8); font-weight: 800; }

        /* Step tracker */
        .rp-tracker { display: flex; align-items: center; gap: 0; margin-bottom: 28px; }
        .rp-track-step { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .rp-track-circle {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 900; border: 2px solid rgba(255,255,255,.15);
          color: rgba(255,255,255,.3); background: transparent; transition: all .3s;
        }
        .rp-track-circle.active { border-color: #3b82f6; background: rgba(59,130,246,.2); color: #93c5fd; }
        .rp-track-circle.done { border-color: #22c55e; background: rgba(34,197,94,.2); color: #86efac; }
        .rp-track-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,.3); letter-spacing: .04em; }
        .rp-track-label.active { color: rgba(255,255,255,.7); }
        .rp-track-line { flex: 1; height: 1px; background: rgba(255,255,255,.1); margin: 0 4px; margin-bottom: 16px; }
        .rp-track-line.done { background: rgba(34,197,94,.4); }

        .rp-bottom-bar { position: relative; z-index: 2; padding: 22px 52px; border-top: 1px solid rgba(255,255,255,.07); display: flex; align-items: center; justify-content: space-between; }
        .rp-bottom-trust { display: flex; align-items: center; gap: 8px; font-size: 12px; color: rgba(255,255,255,.35); font-weight: 700; }
        .rp-bottom-trust-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; }
        .rp-bottom-version { font-size: 11px; color: rgba(255,255,255,.2); font-weight: 700; }

        /* RIGHT */
        .rp-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 40px; background: #fff; overflow-y: auto; }
        .rp-card { width: 100%; max-width: 400px; animation: fadeUp .5s ease forwards; }

        .rp-form-title { font-weight: 900; font-size: 30px; color: #0f172a; letter-spacing: -.02em; line-height: 1.2; margin-bottom: 6px; }
        .rp-form-sub { font-size: 14px; color: #64748b; font-weight: 500; line-height: 1.5; margin-bottom: 24px; }
        .rp-lbl { display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 7px; }
        .rp-field { margin-bottom: 14px; }
        .rp-inp-wrap { position: relative; display: flex; align-items: center; }
        .rp-inp-icon { position: absolute; left: 14px; width: 16px; height: 16px; pointer-events: none; z-index: 1; color: #94a3b8; }
        .rp-inp { width: 100%; height: 48px; padding: 0 44px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 600; color: #0f172a; outline: none; transition: border-color .2s, box-shadow .2s; }
        .rp-inp:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
        .rp-inp::placeholder { color: #cbd5e1; font-weight: 500; }
        .rp-inp-eye { position: absolute; right: 14px; background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; color: #94a3b8; }
        .rp-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; margin-bottom: 14px; text-align: center; }
        .rp-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; margin-bottom: 14px; text-align: center; }
        .rp-btn { width: 100%; height: 50px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 800; cursor: pointer; font-family: 'Nunito', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 8px 24px rgba(59,130,246,.3); transition: transform .2s; margin-top: 6px; }
        .rp-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(59,130,246,.4); }
        .rp-btn:disabled { opacity: .7; cursor: not-allowed; }
        .rp-dots { display: flex; gap: 5px; }
        .rp-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; animation: dotBounce 1s ease-in-out infinite; }
        .rp-strength { display: flex; gap: 4px; margin-top: 7px; }
        .rp-strength-bar { flex: 1; height: 3px; border-radius: 2px; background: #e2e8f0; transition: background .3s; }

        /* Done state */
        .rp-done-icon { width: 80px; height: 80px; background: linear-gradient(135deg, #16a34a, #22c55e); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 36px; animation: checkPop .5s ease forwards; box-shadow: 0 12px 32px rgba(34,197,94,.35); }

        /* Mobile topbar */
        .rp-topbar { display: none; background: linear-gradient(135deg, #060b1a, #1e3a8a); padding: 14px 20px; align-items: center; gap: 12px; cursor: pointer; }
        .rp-topbar-mark { width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rp-topbar-mark span { font-weight: 900; font-size: 10px; color: #fff; }
        .rp-topbar-name { font-weight: 900; font-size: 15px; color: #fff; }
        .rp-topbar-sub { font-size: 10px; color: rgba(255,255,255,.4); font-weight: 600; }

        @media (max-width: 900px) {
          .rp-left { display: none; }
          .rp-topbar { display: flex; }
          .rp-root { flex-direction: column; }
          .rp-right { padding: 32px 20px 48px; align-items: flex-start; }
          .rp-card { max-width: 100%; }
        }
        @media (max-width: 480px) {
          .rp-right { padding: 24px 16px 40px; }
          .rp-form-title { font-size: 24px; }
          .rp-inp { height: 44px; }
          .rp-btn { height: 46px; }
        }
      `}</style>

      <div className="rp-root">
        {/* Mobile topbar */}
        <div className="rp-topbar" onClick={() => router.push("/")}>
          <div className="rp-topbar-mark">
            <span>INV</span>
          </div>
          <div>
            <div className="rp-topbar-name">STOCKR</div>
            <div className="rp-topbar-sub">Inventory Management System</div>
          </div>
        </div>

        {/* LEFT PANEL */}
        <div className="rp-left">
          <div className="rp-left-grid" />
          <div className="rp-left-glow" />
          <div className="rp-left-glow2" />

          <div className="rp-ticker-wrap">
            <div className="rp-ticker-track">
              {[...Array(2)].map((_, i) => (
                <span key={i}>
                  {[
                    "RESET PASSWORD",
                    "VERIFIKASI WHATSAPP",
                    "DATA AMAN",
                    "PROSES CEPAT",
                    "GRATIS"
                  ].map((t, j) => (
                    <span key={j} className="rp-ticker-item">
                      <span className="rp-ticker-dot" />
                      {t}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          <div className="rp-brand-area" onClick={() => router.push("/")}>
            <div className="rp-brand-mark">
              <span>INV</span>
            </div>
            <div>
              <div className="rp-brand-name">STOCKR</div>
              <div className="rp-brand-sub">Inventory Management System</div>
            </div>
          </div>

          <div className="rp-hero">
            <div className="rp-hero-tag">
              <span className="rp-hero-tag-dot" />
              <span className="rp-hero-tag-text">Keamanan Akun</span>
            </div>
            <h1 className="rp-hero-title">
              Lupa Password?
              <br />
              <em>Atur Ulang Sekarang.</em>
            </h1>
            <p className="rp-hero-desc">
              Verifikasi identitas kamu melalui WhatsApp dan buat password baru
              yang aman dalam hitungan menit.
            </p>

            {/* Step tracker */}
            <div className="rp-tracker">
              {[
                { label: "NOMOR", n: "01" },
                { label: "OTP", n: "02" },
                { label: "PASSWORD", n: "03" }
              ].map((s, i) => {
                const stepIdx =
                  step === "request"
                    ? 0
                    : step === "otp"
                      ? 1
                      : step === "newpass"
                        ? 2
                        : 3
                const isDone = i < stepIdx
                const isActive = i === stepIdx
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flex: i < 2 ? "1" : undefined
                    }}
                  >
                    <div className="rp-track-step">
                      <div
                        className={`rp-track-circle ${isDone ? "done" : isActive ? "active" : ""}`}
                      >
                        {isDone ? "✓" : s.n}
                      </div>
                      <div
                        className={`rp-track-label ${isActive ? "active" : ""}`}
                      >
                        {s.label}
                      </div>
                    </div>
                    {i < 2 && (
                      <div
                        className={`rp-track-line ${isDone ? "done" : ""}`}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Security Tips */}
            <div className="rp-tips">
              {[
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
              ].map((t) => (
                <div key={t.title} className="rp-tip">
                  <span className="rp-tip-ico">{t.ico}</span>
                  <div
                    className="rp-tip-text"
                    dangerouslySetInnerHTML={{
                      __html: `<strong style="color:rgba(255,255,255,.8)">${t.title}</strong><br/>${t.desc}`
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rp-bottom-bar">
            <div className="rp-bottom-trust">
              <span className="rp-bottom-trust-dot" />
              Sistem keamanan terenkripsi
            </div>
            <span className="rp-bottom-version">v2.4.1 · 2026</span>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="rp-right">
          <div className="rp-card">
            {/* STEP 1: REQUEST */}
            {step === "request" && (
              <>
                <div style={{ marginBottom: 28 }}>
                  <h1 className="rp-form-title">Reset Password</h1>
                  <p className="rp-form-sub">
                    Masukkan nomor WhatsApp yang terdaftar. Kami akan
                    mengirimkan kode OTP untuk verifikasi.
                  </p>
                </div>

                {error && <div className="rp-error">⚠ {error}</div>}

                <div className="rp-field">
                  <label className="rp-lbl">Nomor WhatsApp Terdaftar</label>
                  <div className="rp-inp-wrap">
                    <svg
                      className="rp-inp-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <input
                      className="rp-inp"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
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
                    OTP akan dikirim ke nomor ini
                  </p>
                </div>

                <button
                  className="rp-btn"
                  onClick={handleSendOTP}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="rp-dots">
                      <span className="rp-dot" />
                      <span
                        className="rp-dot"
                        style={{ animationDelay: ".15s" }}
                      />
                      <span
                        className="rp-dot"
                        style={{ animationDelay: ".3s" }}
                      />
                    </span>
                  ) : (
                    "Kirim Kode OTP →"
                  )}
                </button>

                <p
                  style={{
                    textAlign: "center",
                    marginTop: 20,
                    fontSize: 13,
                    color: "#64748b",
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 600
                  }}
                >
                  Ingat password kamu?{" "}
                  <Link
                    href="/login"
                    style={{
                      color: "#1e3a8a",
                      textDecoration: "none",
                      fontWeight: 800
                    }}
                  >
                    Masuk di sini
                  </Link>
                </p>
              </>
            )}

            {/* STEP 2: OTP */}
            {step === "otp" && (
              <>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <Image
                    src={imageWa}
                    alt="WhatsApp"
                    width={64}
                    height={64}
                    priority
                    style={{
                      borderRadius: 16,
                      margin: "0 auto 16px",
                      display: "block",
                      objectFit: "contain"
                    }}
                    unoptimized={true}
                  />
                  <h1 className="rp-form-title" style={{ fontSize: 26 }}>
                    Verifikasi WhatsApp
                  </h1>
                  <p className="rp-form-sub">
                    Kode OTP dikirim ke
                    <br />
                    <strong style={{ color: "#0f172a" }}>
                      WhatsApp {phone}
                    </strong>
                  </p>
                </div>

                {error && <div className="rp-error">⚠ {error}</div>}
                {success && <div className="rp-success">✓ {success}</div>}

                <div className="rp-field">
                  <label
                    className="rp-lbl"
                    style={{ textAlign: "center", display: "block" }}
                  >
                    Masukkan 6 Digit OTP
                  </label>
                  <input
                    style={{
                      width: "100%",
                      height: 56,
                      padding: "0 16px",
                      background: "#f8fafc",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 10,
                      fontSize: 28,
                      fontWeight: 800,
                      textAlign: "center",
                      letterSpacing: "0.5em",
                      fontFamily: "'Nunito', sans-serif",
                      color: "#0f172a",
                      outline: "none"
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="······"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    autoFocus
                  />
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      color: "#94a3b8",
                      marginTop: 8,
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 600
                    }}
                  >
                    Berlaku 5 menit
                  </p>
                </div>

                <button
                  className="rp-btn"
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <span className="rp-dots">
                      <span className="rp-dot" />
                      <span
                        className="rp-dot"
                        style={{ animationDelay: ".15s" }}
                      />
                      <span
                        className="rp-dot"
                        style={{ animationDelay: ".3s" }}
                      />
                    </span>
                  ) : (
                    "Verifikasi Kode ✓"
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
                      setStep("request")
                      setError("")
                      setOtp("")
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

            {step === "newpass" && (
              <>
                <div style={{ marginBottom: 28 }}>
                  <h1 className="rp-form-title">Password Baru</h1>
                  <p className="rp-form-sub">
                    Nomor terverifikasi! Sekarang buat password baru yang kuat
                    untuk akun kamu.
                  </p>
                </div>

                {error && <div className="rp-error">⚠ {error}</div>}

                <div className="rp-field">
                  <label className="rp-lbl">Password Baru</label>
                  <div className="rp-inp-wrap">
                    <svg
                      className="rp-inp-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      className="rp-inp"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="rp-inp-eye"
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
                  <div className="rp-strength">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="rp-strength-bar"
                        style={{
                          background:
                            i <= pwStrength
                              ? strengthColors[pwStrength]
                              : undefined
                        }}
                      />
                    ))}
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
                    {pwStrength === -1
                      ? "Masukkan password"
                      : pwStrength === 0
                        ? "🔴 Terlalu lemah"
                        : pwStrength === 1
                          ? "🟡 Lemah"
                          : pwStrength === 2
                            ? "🔵 Sedang"
                            : "🟢 Kuat"}
                  </p>
                </div>

                <div className="rp-field">
                  <label className="rp-lbl">Konfirmasi Password</label>
                  <div className="rp-inp-wrap">
                    <svg
                      className="rp-inp-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <input
                      className="rp-inp"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Ulangi password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      style={{
                        borderColor:
                          confirm && password !== confirm
                            ? "#ef4444"
                            : undefined
                      }}
                    />
                    <button
                      type="button"
                      className="rp-inp-eye"
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
                  {confirm && password !== confirm && (
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

                <button
                  className="rp-btn"
                  onClick={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="rp-dots">
                      <span className="rp-dot" />
                      <span
                        className="rp-dot"
                        style={{ animationDelay: ".15s" }}
                      />
                      <span
                        className="rp-dot"
                        style={{ animationDelay: ".3s" }}
                      />
                    </span>
                  ) : (
                    "Simpan Password Baru ✓"
                  )}
                </button>
              </>
            )}

            {/* STEP 4: DONE */}
            {step === "done" && (
              <div style={{ textAlign: "center" }}>
                <div className="rp-done-icon">✓</div>
                <h1
                  className="rp-form-title"
                  style={{ fontSize: 28, marginBottom: 10 }}
                >
                  Password Berhasil Direset!
                </h1>
                <p className="rp-form-sub" style={{ marginBottom: 28 }}>
                  Password kamu telah berhasil diperbarui. Silakan masuk
                  menggunakan password baru kamu.
                </p>
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 10,
                    padding: "14px 16px",
                    marginBottom: 24,
                    fontSize: 13,
                    color: "#15803d",
                    fontWeight: 700,
                    fontFamily: "'Nunito', sans-serif"
                  }}
                >
                  ✓ Semua sesi lama telah dihapus demi keamanan akun kamu
                </div>
                <button
                  className="rp-btn"
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
