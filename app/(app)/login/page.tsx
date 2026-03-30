"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Login gagal")
        return
      }

      router.push("/inventory")
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
        .lg-error { 
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
        .lg-root { display: flex; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; }

        /* ─── LEFT ─── */
        .lg-left {
          position: relative; width: 48%; min-height: 100vh;
          background: linear-gradient(145deg,#054d42 0%,#087463 40%,#0a9c84 80%,#0fbf9f 100%);
          overflow: hidden; display: flex; flex-direction: column;
          justify-content: space-between; padding: 48px;
        }
        .lg-overlay { position:absolute;inset:0;background:radial-gradient(ellipse at 30% 20%,rgba(255,255,255,.08) 0%,transparent 60%),radial-gradient(ellipse at 70% 80%,rgba(0,0,0,.15) 0%,transparent 60%);pointer-events:none; }
        .lg-c1 { position:absolute;top:-80px;right:-80px;width:320px;height:320px;border-radius:50%;border:1px solid rgba(255,255,255,.15);animation:floatL 7s ease-in-out infinite;pointer-events:none; }
        .lg-c2 { position:absolute;bottom:80px;left:-60px;width:240px;height:240px;border-radius:50%;border:1px solid rgba(255,255,255,.1);animation:floatR 9s ease-in-out infinite;pointer-events:none; }
        .lg-grid { position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:48px 48px;pointer-events:none; }

        .lg-brand { position:relative;z-index:1;display:flex;align-items:center;gap:16px; }
        .lg-brand-logo { width:48px;height:48px;background:rgba(255,255,255,.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.25);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
        .lg-brand-logo span { color:#fff;font-family:'DM Mono',monospace;font-weight:700;font-size:14px;letter-spacing:.05em; }
        .lg-brand-name { color:#fff;font-weight:800;font-size:18px;letter-spacing:.08em;line-height:1.2; }
        .lg-brand-tag { color:rgba(255,255,255,.6);font-size:12px;font-family:'DM Mono',monospace;letter-spacing:.03em;margin-top:2px; }

        .lg-stats { position:relative;z-index:1;display:flex;gap:28px;padding:20px 24px;background:rgba(0,0,0,.15);backdrop-filter:blur(12px);border-radius:12px;border:1px solid rgba(255,255,255,.1); }
        .lg-stat { display:flex;flex-direction:column;gap:4px; }
        .lg-stat-val { color:#fff;font-weight:800;font-size:20px;font-family:'DM Mono',monospace;letter-spacing:-.02em; }
        .lg-stat-lbl { color:rgba(255,255,255,.55);font-size:11px;font-family:'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase; }

        /* ─── RIGHT ─── */
        .lg-right { flex:1;display:flex;align-items:center;justify-content:center;padding:48px 32px;background:#fff;overflow-y:auto; }
        .lg-card { width:100%;max-width:400px;animation:fadeUp .5s ease forwards; }
        .lg-head { margin-bottom:36px;text-align:center; }
        .lg-head-logo { width:40px;height:40px;background:#087463;border-radius:8px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px; }
        .lg-head-logo span { color:#fff;font-family:'DM Mono',monospace;font-weight:700;font-size:12px;letter-spacing:.05em; }
        .lg-title { font-size:28px;font-weight:800;color:#0f172a;letter-spacing:-.03em;line-height:1.2;margin-bottom:8px; }
        .lg-subtitle { font-size:14px;color:#64748b;line-height:1.5; }

        .lg-field { margin-bottom:20px; }
        .lg-lbl { display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;letter-spacing:.01em; }
        .lg-lbl-row { display:flex;justify-content:space-between;align-items:center; }
        .lg-wrap { position:relative;display:flex;align-items:center; }
        .lg-icon { position:absolute;left:14px;width:16px;height:16px;pointer-events:none;z-index:1; }
        .lg-inp {
          width:100%;height:48px;padding:0 44px;
          border:1.5px solid #e2e8f0;border-radius:10px;
          font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;
          color:#0f172a;background:#f8fafc;outline:none;
          transition:border-color .2s,box-shadow .2s;
        }
        .lg-eye { position:absolute;right:14px;background:none;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center; }
        .lg-forgot { font-size:12px;color:#087463;text-decoration:none;font-weight:500; }

        .lg-btn {
          width:100%;height:50px;background:#087463;color:#fff;border:none;border-radius:10px;
          font-size:15px;font-weight:700;letter-spacing:.02em;cursor:pointer;
          transition:background .2s;margin-top:8px;
          display:flex;align-items:center;justify-content:center;gap:8px;
          font-family:'Plus Jakarta Sans',sans-serif;
        }
        .lg-btn:hover:not(:disabled) { background:#065a4d; }
        .lg-btn:disabled { opacity:.8;cursor:not-allowed; }

        .lg-dots { display:flex;gap:6px;align-items:center; }
        .lg-dot { width:7px;height:7px;border-radius:50%;background:#fff;animation:dotBounce 1s ease-in-out infinite;display:inline-block; }

        .lg-foot { text-align:center;margin-top:24px;font-size:13.5px;color:#64748b; }
        .lg-foot a { color:#087463;font-weight:600;text-decoration:none; }

        /* ─── MOBILE TOPBAR ─── */
        .lg-topbar {
          display: none;
          background: linear-gradient(135deg,#054d42 0%,#087463 100%);
          padding: 16px 20px;
          align-items: center;
          gap: 12px;
        }
        .lg-topbar-logo { width:34px;height:34px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
        .lg-topbar-logo span { color:#fff;font-family:'DM Mono',monospace;font-weight:700;font-size:11px;letter-spacing:.05em; }
        .lg-topbar-name { color:#fff;font-weight:800;font-size:15px;letter-spacing:.06em; }
        .lg-topbar-tag { color:rgba(255,255,255,.65);font-size:10px;font-family:'DM Mono',monospace; }

        /* ─── BREAKPOINTS ─── */
        @media (max-width: 768px) {
          .lg-root { flex-direction: column; }
          .lg-left { display: none; }
          .lg-topbar { display: flex; }
          .lg-right { padding: 32px 20px 48px; align-items: flex-start; }
          .lg-card { max-width: 100%; }
          .lg-title { font-size: 24px; }
          .lg-head { margin-bottom: 28px; }
        }

        @media (max-width: 480px) {
          .lg-right { padding: 24px 16px 40px; }
          .lg-head { margin-bottom: 22px; }
          .lg-title { font-size: 22px; }
          .lg-inp { height: 44px; font-size: 13px; }
          .lg-btn { height: 48px; font-size: 14px; }
          .lg-field { margin-bottom: 16px; }
          .lg-topbar { padding: 14px 16px; }
        }
      `}</style>

      <div className="lg-root">
        {/* Mobile topbar */}
        <div className="lg-topbar">
          <div className="lg-topbar-logo">
            <span>INV</span>
          </div>
          <div>
            <div className="lg-topbar-name">STOCKR</div>
            <div className="lg-topbar-tag">Inventory Management System</div>
          </div>
        </div>

        {/* LEFT — desktop only */}
        <div className="lg-left">
          <div className="lg-overlay" />
          <div className="lg-c1" />
          <div className="lg-c2" />
          <div className="lg-grid" />

          <div className="lg-brand">
            <div className="lg-brand-logo">
              <span>INV</span>
            </div>
            <div>
              <p className="lg-brand-name">STOCKR</p>
              <p className="lg-brand-tag">Inventory Management System</p>
            </div>
          </div>

          <div className="lg-stats">
            {[
              { l: "Products", v: "248" },
              { l: "Orders Today", v: "63" },
              { l: "Revenue", v: "Rp 48.2M" }
            ].map((s) => (
              <div key={s.l} className="lg-stat">
                <span className="lg-stat-val">{s.v}</span>
                <span className="lg-stat-lbl">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg-right">
          <div className="lg-card">
            <div className="lg-head">
              <div className="lg-head-logo">
                <span>INV</span>
              </div>
              <h1 className="lg-title">Halo!</h1>
              <p className="lg-subtitle">Silahkan masukkan data di bawah ini</p>
            </div>

            {/* Email */}
            <div className="lg-field">
              <label className="lg-lbl">Email</label>
              <div className="lg-wrap">
                <svg
                  className="lg-icon"
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
                  className="lg-inp"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>
            </div>

            {/* Password */}
            <div className="lg-field">
              <div className="lg-lbl-row">
                <label className="lg-lbl" style={{ marginBottom: 0 }}>
                  Password
                </label>
                <a href="#" className="lg-forgot">
                  Lupa password?
                </a>
              </div>
              <div className="lg-wrap" style={{ marginTop: "8px" }}>
                <svg
                  className="lg-icon"
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
                  className="lg-inp"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
                <button
                  type="button"
                  className="lg-eye"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </div>
            {error && <div className="lg-error">⚠️ {error}</div>}
            <button
              className="lg-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="lg-dots">
                  <span className="lg-dot" style={{ animationDelay: "0s" }} />
                  <span
                    className="lg-dot"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span className="lg-dot" style={{ animationDelay: "0.3s" }} />
                </span>
              ) : (
                "Masuk"
              )}
            </button>

            <p className="lg-foot">
              Belum punya akun? <Link href="/register">Daftar sekarang</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
