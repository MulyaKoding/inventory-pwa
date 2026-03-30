"use client"

import { useState } from "react"
import Link from "next/link"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError("Password tidak cocok")
      return
    }
    if (form.password.length < 8) {
      setError("Password minimal 8 karakter")
      return
    }

    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Registrasi gagal")
        return
      }

      setSuccess("Registrasi berhasil! Mengarahkan ke halaman login...")
      setTimeout(() => {
        window.location.href = "/login"
      }, 1500)
    } catch (err) {
      setError("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }
  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#087463"
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(8,116,99,0.12)"
  }
  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#e2e8f0"
    e.currentTarget.style.boxShadow = "none"
  }

  const EyeOpen = () => (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="#94a3b8"
      strokeWidth="1.8"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
  const EyeOff = () => (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="#94a3b8"
      strokeWidth="1.8"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatL {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(3deg); }
        }
        @keyframes floatR {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(12px) rotate(-2deg); }
        }

        .rg-root { display: flex; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; }
        .rg-error { 
          background:#fef2f2;
          border:1px solid #fecaca;
          color:#dc2626;
          padding:10px 14px;
          border-radius:8px;
          font-size:13px;
          font-weight:500;
          margin-bottom:16px;
          text-align:center;
        }
        .rg-success { 
          background:#f0fdf4;
          border:1px solid #bbf7d0;
          color:#16a34a;
          padding:10px 14px;
          border-radius:8px;
          font-size:13px;
          font-weight:500;
          margin-bottom:16px;
          text-align:center;
        }
        /* ─── LEFT ─── */
        .rg-left {
          position: relative; width: 48%; min-height: 100vh;
          background: linear-gradient(145deg,#054d42 0%,#087463 40%,#0a9c84 80%,#0fbf9f 100%);
          overflow: hidden; display: flex; flex-direction: column;
          justify-content: space-between; padding: 48px;
        }
        .rg-overlay { position:absolute;inset:0;background:radial-gradient(ellipse at 30% 20%,rgba(255,255,255,.08) 0%,transparent 60%),radial-gradient(ellipse at 70% 80%,rgba(0,0,0,.15) 0%,transparent 60%);pointer-events:none; }
        .rg-c1 { position:absolute;top:-80px;right:-80px;width:320px;height:320px;border-radius:50%;border:1px solid rgba(255,255,255,.15);animation:floatL 7s ease-in-out infinite;pointer-events:none; }
        .rg-c2 { position:absolute;bottom:80px;left:-60px;width:240px;height:240px;border-radius:50%;border:1px solid rgba(255,255,255,.1);animation:floatR 9s ease-in-out infinite;pointer-events:none; }
        .rg-grid { position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:48px 48px;pointer-events:none; }

        .rg-brand { position:relative;z-index:1;display:flex;align-items:center;gap:16px; }
        .rg-brand-logo { width:48px;height:48px;background:rgba(255,255,255,.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.25);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
        .rg-brand-logo span { color:#fff;font-family:'DM Mono',monospace;font-weight:700;font-size:14px;letter-spacing:.05em; }
        .rg-brand-name { color:#fff;font-weight:800;font-size:18px;letter-spacing:.08em;line-height:1.2; }
        .rg-brand-tag { color:rgba(255,255,255,.6);font-size:12px;font-family:'DM Mono',monospace;letter-spacing:.03em;margin-top:2px; }

        .rg-center { position:relative;z-index:1;display:flex;flex-direction:column;gap:14px; }
        .rg-center-title { color:#fff;font-size:22px;font-weight:800;letter-spacing:-.02em;line-height:1.25; }
        .rg-center-desc { color:rgba(255,255,255,.65);font-size:13px;line-height:1.7;max-width:300px; }
        .rg-features { display:flex;flex-direction:column;gap:10px;margin-top:4px; }
        .rg-feat { display:flex;align-items:center;gap:10px; }
        .rg-feat-dot { width:6px;height:6px;border-radius:50%;background:#0fbf9f;flex-shrink:0; }
        .rg-feat-text { color:rgba(255,255,255,.75);font-size:13px;font-family:'DM Mono',monospace; }

        .rg-stats { position:relative;z-index:1;display:flex;gap:28px;padding:20px 24px;background:rgba(0,0,0,.15);backdrop-filter:blur(12px);border-radius:12px;border:1px solid rgba(255,255,255,.1); }
        .rg-stat { display:flex;flex-direction:column;gap:4px; }
        .rg-stat-val { color:#fff;font-weight:800;font-size:18px;font-family:'DM Mono',monospace;letter-spacing:-.02em; }
        .rg-stat-lbl { color:rgba(255,255,255,.55);font-size:10px;font-family:'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase; }

        /* ─── RIGHT ─── */
        .rg-right { flex:1;display:flex;align-items:center;justify-content:center;padding:48px 32px;background:#fff;overflow-y:auto; }
        .rg-card { width:100%;max-width:400px;animation:fadeUp .5s ease forwards; }
        .rg-head { margin-bottom:28px;text-align:center; }
        .rg-head-logo { width:40px;height:40px;background:#087463;border-radius:8px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px; }
        .rg-head-logo span { color:#fff;font-family:'DM Mono',monospace;font-weight:700;font-size:12px;letter-spacing:.05em; }
        .rg-title { font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-.03em;line-height:1.2;margin-bottom:6px; }
        .rg-subtitle { font-size:13.5px;color:#64748b;line-height:1.5; }

        .rg-field { margin-bottom:14px; }
        .rg-lbl { display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:7px;letter-spacing:.01em; }
        .rg-wrap { position:relative;display:flex;align-items:center; }
        .rg-icon { position:absolute;left:14px;width:16px;height:16px;pointer-events:none;z-index:1; }
        .rg-inp {
          width:100%;height:46px;padding:0 44px;
          border:1.5px solid #e2e8f0;border-radius:10px;
          font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;
          color:#0f172a;background:#f8fafc;outline:none;
          transition:border-color .2s,box-shadow .2s;
        }
        .rg-eye { position:absolute;right:14px;background:none;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center; }
        .rg-err { color:#ef4444;font-size:11.5px;margin-top:5px;font-weight:500; }

        .rg-btn {
          width:100%;height:50px;background:#087463;color:#fff;border:none;border-radius:10px;
          font-size:15px;font-weight:700;letter-spacing:.02em;cursor:pointer;
          transition:background .2s;margin-top:8px;
          display:flex;align-items:center;justify-content:center;gap:8px;
          font-family:'Plus Jakarta Sans',sans-serif;
        }
        .rg-btn:hover:not(:disabled) { background:#065a4d; }
        .rg-btn:disabled { opacity:.8;cursor:not-allowed; }

        .rg-dots { display:flex;gap:6px;align-items:center; }
        .rg-dot { width:7px;height:7px;border-radius:50%;background:#fff;animation:dotBounce 1s ease-in-out infinite;display:inline-block; }

        .rg-foot { text-align:center;margin-top:20px;font-size:13.5px;color:#64748b; }
        .rg-foot a { color:#087463;font-weight:600;text-decoration:none; }

        /* ─── MOBILE TOPBAR (hidden on desktop) ─── */
        .rg-topbar {
          display:none;
          background:linear-gradient(135deg,#054d42 0%,#087463 100%);
          padding:16px 20px;
          align-items:center;
          gap:12px;
        }
        .rg-topbar-logo { width:34px;height:34px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
        .rg-topbar-logo span { color:#fff;font-family:'DM Mono',monospace;font-weight:700;font-size:11px;letter-spacing:.05em; }
        .rg-topbar-name { color:#fff;font-weight:800;font-size:15px;letter-spacing:.06em; }
        .rg-topbar-tag { color:rgba(255,255,255,.65);font-size:10px;font-family:'DM Mono',monospace; }

        /* ─── BREAKPOINTS ─── */
        @media (max-width: 768px) {
          .rg-root { flex-direction: column; }
          .rg-left { display: none; }
          .rg-topbar { display: flex; }
          .rg-right { padding: 28px 20px 48px; align-items: flex-start; }
          .rg-card { max-width: 100%; }
          .rg-title { font-size: 22px; }
        }

        @media (max-width: 480px) {
          .rg-right { padding: 24px 16px 40px; }
          .rg-head { margin-bottom: 20px; }
          .rg-title { font-size: 20px; }
          .rg-inp { height: 44px; font-size: 13px; }
          .rg-btn { height: 48px; font-size: 14px; }
          .rg-field { margin-bottom: 12px; }
          .rg-topbar { padding: 14px 16px; }
        }
      `}</style>

      <div className="rg-root">
        {/* Mobile top bar */}
        <div className="rg-topbar">
          <div className="rg-topbar-logo">
            <span>INV</span>
          </div>
          <div>
            <div className="rg-topbar-name">STOCKR</div>
            <div className="rg-topbar-tag">Inventory Management System</div>
          </div>
        </div>

        {/* LEFT — desktop only */}
        <div className="rg-left">
          <div className="rg-overlay" />
          <div className="rg-c1" />
          <div className="rg-c2" />
          <div className="rg-grid" />

          <div className="rg-brand">
            <div className="rg-brand-logo">
              <span>INV</span>
            </div>
            <div>
              <p className="rg-brand-name">STOCKR</p>
              <p className="rg-brand-tag">Inventory Management System</p>
            </div>
          </div>

          <div className="rg-center">
            <svg viewBox="0 0 120 120" width="72" height="72" fill="none">
              <rect
                x="10"
                y="30"
                width="100"
                height="70"
                rx="8"
                fill="rgba(255,255,255,0.12)"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
              />
              <rect
                x="25"
                y="20"
                width="70"
                height="20"
                rx="6"
                fill="rgba(255,255,255,0.18)"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
              />
              <line
                x1="25"
                y1="55"
                x2="95"
                y2="55"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.5"
              />
              <line
                x1="25"
                y1="70"
                x2="75"
                y2="70"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1.5"
              />
              <line
                x1="25"
                y1="83"
                x2="60"
                y2="83"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1.5"
              />
              <circle
                cx="88"
                cy="88"
                r="18"
                fill="rgba(15,191,159,0.3)"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
              />
              <path
                d="M80 88 L86 94 L96 82"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="rg-center-title">Mulai Kelola Inventori</h2>
            <p className="rg-center-desc">
              Buat akun gratis dan mulai pantau stok, pesanan, dan pendapatan
              bisnis kamu dari satu dasbor.
            </p>
            <div className="rg-features">
              {[
                "Manajemen produk & kategori",
                "Laporan penjualan real-time",
                "Notifikasi stok menipis"
              ].map((f) => (
                <div key={f} className="rg-feat">
                  <div className="rg-feat-dot" />
                  <span className="rg-feat-text">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rg-stats">
            {[
              { l: "Products", v: "248" },
              { l: "Orders Today", v: "63" },
              { l: "Revenue", v: "Rp 48.2M" }
            ].map((s) => (
              <div key={s.l} className="rg-stat">
                <span className="rg-stat-val">{s.v}</span>
                <span className="rg-stat-lbl">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="rg-right">
          <div className="rg-card">
            <div className="rg-head">
              <div className="rg-head-logo">
                <span>INV</span>
              </div>
              <h1 className="rg-title">Buat Akun Baru</h1>
              <p className="rg-subtitle">
                Isi data berikut untuk mulai menggunakan STOCKR
              </p>
            </div>

            {/* Name */}
            <div className="rg-field">
              <label className="rg-lbl">Nama Lengkap</label>
              <div className="rg-wrap">
                <svg
                  className="rg-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.8"
                >
                  <path
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                    stroke="#94a3b8"
                  />
                  <circle cx="12" cy="7" r="4" stroke="#94a3b8" />
                </svg>
                <input
                  className="rg-inp"
                  type="text"
                  placeholder="Nama kamu"
                  value={form.name}
                  onChange={handleChange("name")}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>
            </div>

            {/* Email */}
            <div className="rg-field">
              <label className="rg-lbl">Email</label>
              <div className="rg-wrap">
                <svg
                  className="rg-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.8"
                >
                  <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke="#94a3b8"
                  />
                  <polyline points="22,6 12,13 2,6" stroke="#94a3b8" />
                </svg>
                <input
                  className="rg-inp"
                  type="email"
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={handleChange("email")}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>
            </div>

            {/* Password */}
            <div className="rg-field">
              <label className="rg-lbl">Password</label>
              <div className="rg-wrap">
                <svg
                  className="rg-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.8"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                    stroke="#94a3b8"
                  />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#94a3b8" />
                </svg>
                <input
                  className="rg-inp"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 karakter"
                  value={form.password}
                  onChange={handleChange("password")}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
                <button
                  type="button"
                  className="rg-eye"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div className="rg-field">
              <label className="rg-lbl">Konfirmasi Password</label>
              <div className="rg-wrap">
                <svg
                  className="rg-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.8"
                >
                  <path
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    stroke="#94a3b8"
                  />
                </svg>
                <input
                  className="rg-inp"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Ulangi password"
                  value={form.confirm}
                  onChange={handleChange("confirm")}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  style={{
                    borderColor:
                      form.confirm && form.password !== form.confirm
                        ? "#ef4444"
                        : undefined
                  }}
                />
                <button
                  type="button"
                  className="rg-eye"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p className="rg-err">Password tidak cocok</p>
              )}
            </div>
            {error && <div className="rg-error">⚠️ {error}</div>}
            {success && <div className="rg-success">✅ {success}</div>}
            <button
              className="rg-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="rg-dots">
                  <span className="rg-dot" style={{ animationDelay: "0s" }} />
                  <span
                    className="rg-dot"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span className="rg-dot" style={{ animationDelay: "0.3s" }} />
                </span>
              ) : (
                "Daftar Sekarang"
              )}
            </button>

            <p className="rg-foot">
              Sudah punya akun? <Link href="/login">Masuk di sini</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
