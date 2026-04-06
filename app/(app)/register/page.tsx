"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Step = "form" | "otp" | "done"

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
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [countdown, setCountdown] = useState(0)

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

  // STEP 1: Submit form → kirim OTP
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

  // STEP 2: Verifikasi OTP → register
  const handleVerifyAndRegister = async (e: React.MouseEvent) => {
    e.preventDefault()
    setError("")

    if (otp.length !== 6) {
      setError("Masukkan 6 digit OTP")
      return
    }

    setLoading(true)
    try {
      // Verifikasi OTP
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

      // Register user
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

  // Styles sama seperti sebelumnya, tambah style OTP
  const otpInputStyle: React.CSSProperties = {
    width: "100%",
    height: 48,
    padding: "0 16px",
    background: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 24,
    fontWeight: 800,
    textAlign: "center",
    letterSpacing: "0.5em",
    fontFamily: "'Nunito', sans-serif",
    color: "#0f172a",
    outline: "none"
  }

  return (
    <>
      <style>{`
        /* ... semua style lama kamu tetap sama ... */
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dotBounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-5px); opacity: 1; } }
        .rg-root { display: flex; min-height: 100vh; font-family: 'Nunito', sans-serif; }
        .rg-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; background: #fff; overflow-y: auto; }
        .rg-card { width: 100%; max-width: 400px; animation: fadeUp .5s ease forwards; }
        .rg-form-title { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 28px; color: #0f172a; letter-spacing: -.02em; line-height: 1.2; margin-bottom: 6px; }
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
        .rg-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .rg-btn:disabled { opacity: .7; cursor: not-allowed; }
        .rg-dots { display: flex; gap: 5px; }
        .rg-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; animation: dotBounce 1s ease-in-out infinite; }
        .rg-foot { text-align: center; margin-top: 20px; font-size: 13px; color: #64748b; font-family: 'Nunito', sans-serif; font-weight: 600; }
        .rg-foot a { color: #1e3a8a; text-decoration: none; font-weight: 800; }
        .rg-strength { display: flex; gap: 4px; margin-top: 7px; }
        .rg-strength-bar { flex: 1; height: 3px; border-radius: 2px; background: #e2e8f0; transition: background .3s; }
        @media (max-width: 900px) { .rg-right { padding: 32px 20px 48px; } }
      `}</style>

      <div className="rg-root">
        <div className="rg-right">
          <div className="rg-card">
            {/* ── STEP: FORM ── */}
            {step === "form" && (
              <>
                <div className="rg-form-head" style={{ marginBottom: 24 }}>
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

                {/* Field HP baru */}
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
              </>
            )}

            {/* ── STEP: OTP ── */}
            {step === "otp" && (
              <>
                {/* Ikon WA */}
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      background: "linear-gradient(135deg,#25D366,#128C7E)",
                      borderRadius: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      fontSize: 30
                    }}
                  >
                    💬
                  </div>
                  <h1 className="rg-form-title" style={{ fontSize: 24 }}>
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
                  <input
                    style={otpInputStyle}
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
                  className="rg-btn"
                  onClick={handleVerifyAndRegister}
                  disabled={loading || otp.length !== 6}
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
                    "Verifikasi & Daftar"
                  )}
                </button>

                {/* Resend + back */}
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
          </div>
        </div>
      </div>
    </>
  )
}
