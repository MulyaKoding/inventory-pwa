"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !loading) {
        handleSubmit(e as any)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [email, password, loading])

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
      const maxAge = 60 * 60 * 24 * 7
      document.cookie = `user_name=${encodeURIComponent(data.user.name)}; path=/; max-age=${maxAge}; SameSite=Lax`
      document.cookie = `user_role=${encodeURIComponent(data.user.role)}; path=/; max-age=${maxAge}; SameSite=Lax`
      router.push("/inventory")
    } catch {
      setError("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes gridPan {
          from { background-position: 0 0; }
          to { background-position: 48px 48px; }
        }

        .lg-root { display: flex; min-height: 100vh; font-family: 'Nunito', sans-serif; }

        /* ── LEFT ── */
        .lg-left {
          position: relative; width: 52%; min-height: 100vh;
          background: linear-gradient(160deg, #060b1a 0%, #0c1733 30%, #0f2050 60%, #1e3a8a 100%);
          display: flex; flex-direction: column; overflow: hidden;
        }
        .lg-left-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 48px 48px; animation: gridPan 8s linear infinite;
        }
        .lg-left-glow {
          position: absolute; top: -120px; right: -120px;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,.22) 0%, transparent 70%);
          pointer-events: none;
        }
        .lg-left-glow2 {
          position: absolute; bottom: -80px; left: -80px;
          width: 380px; height: 380px; border-radius: 50%;
          background: radial-gradient(circle, rgba(30,58,138,.18) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Ticker */
        .lg-ticker-wrap {
          position: absolute; top: 0; left: 0; right: 0;
          background: rgba(0,0,0,.25); backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(255,255,255,.08);
          height: 36px; overflow: hidden; display: flex; align-items: center;
        }
        .lg-ticker-track { display: flex; animation: ticker 28s linear infinite; white-space: nowrap; }
        .lg-ticker-item {
          display: inline-flex; align-items: center; gap: 14px; padding: 0 36px;
          font-family: 'Nunito', sans-serif; font-weight: 700;
          font-size: 11px; color: rgba(255,255,255,.5); letter-spacing: .06em;
        }
        .lg-ticker-dot { width: 4px; height: 4px; border-radius: 50%; background: #60a5fa; }

        /* Brand */
        .lg-brand-area {
          position: relative; z-index: 2; padding: 52px 52px 0;
          display: flex; align-items: center; gap: 12px; cursor: pointer;
        }
        .lg-brand-mark {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          border-radius: 9px; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 4px 12px rgba(59,130,246,.35);
        }
        .lg-brand-mark span { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 11px; color: #fff; letter-spacing: .05em; }
        .lg-brand-name { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 18px; color: #fff; letter-spacing: .06em; }
        .lg-brand-sub { font-size: 11px; color: rgba(255,255,255,.4); font-family: 'Nunito', sans-serif; font-weight: 600; margin-top: 2px; }

        /* Hero */
        .lg-hero { position: relative; z-index: 2; padding: 52px 52px 0; flex: 1; }
        .lg-hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,.08); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,.15); border-radius: 100px;
          padding: 6px 14px; margin-bottom: 24px;
        }
        .lg-hero-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #60a5fa; position: relative; }
        .lg-hero-tag-dot::after {
          content: ''; position: absolute; inset: -3px; border-radius: 50%;
          background: rgba(96,165,250,.4); animation: pulse-ring 1.8s ease-out infinite;
        }
        .lg-hero-tag-text { color: rgba(255,255,255,.85); font-size: 11px; font-family: 'Nunito', sans-serif; font-weight: 800; letter-spacing: .05em; }
        .lg-hero-title {
          font-family: 'Nunito', sans-serif; font-weight: 900;
          font-size: clamp(30px, 3vw, 44px); line-height: 1.1; letter-spacing: -.02em;
          color: #fff; margin-bottom: 16px;
        }
        .lg-hero-title em { font-style: normal; color: #60a5fa; }
        .lg-hero-desc {
          font-size: 14px; color: rgba(255,255,255,.6); line-height: 1.7;
          max-width: 360px; font-family: 'Nunito', sans-serif; font-weight: 500;
          margin-bottom: 36px;
        }

        /* Stats */
        .lg-stats-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.1); border-radius: 14px;
          overflow: hidden; margin-bottom: 32px;
        }
        .lg-stat-cell {
          background: rgba(0,0,0,.2); backdrop-filter: blur(8px);
          padding: 18px 20px; display: flex; flex-direction: column; gap: 4px;
          transition: background .2s;
        }
        .lg-stat-cell:hover { background: rgba(59,130,246,.15); }
        .lg-stat-val { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 20px; color: #fff; letter-spacing: -.02em; }
        .lg-stat-lbl { font-size: 10px; color: rgba(255,255,255,.4); font-family: 'Nunito', sans-serif; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
        .lg-stat-change { font-size: 11px; color: #86efac; font-family: 'Nunito', sans-serif; font-weight: 700; }

        /* Features */
        .lg-features { display: flex; flex-direction: column; gap: 10px; }
        .lg-feat {
          display: flex; align-items: center; gap: 14px; padding: 13px 16px;
          border-radius: 10px; border: 1px solid rgba(255,255,255,.07);
          background: rgba(0,0,0,.18); transition: border-color .2s, background .2s;
        }
        .lg-feat:hover { border-color: rgba(59,130,246,.3); background: rgba(59,130,246,.08); }
        .lg-feat-icon {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(59,130,246,.15);
        }
        .lg-feat-text { font-size: 13px; color: rgba(255,255,255,.55); font-family: 'Nunito', sans-serif; font-weight: 600; }
        .lg-feat-text strong { color: rgba(255,255,255,.85); font-weight: 800; }

        /* Bottom */
        .lg-bottom-bar {
          position: relative; z-index: 2; padding: 24px 52px;
          border-top: 1px solid rgba(255,255,255,.07);
          display: flex; align-items: center; justify-content: space-between;
        }
        .lg-bottom-trust { display: flex; align-items: center; gap: 8px; font-size: 12px; color: rgba(255,255,255,.35); font-family: 'Nunito', sans-serif; font-weight: 700; }
        .lg-bottom-trust-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; }
        .lg-bottom-version { font-size: 11px; color: rgba(255,255,255,.2); font-family: 'Nunito', sans-serif; font-weight: 700; }

        /* ── RIGHT — WHITE ── */
        .lg-right {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 48px 40px; background: #fff; overflow-y: auto;
        }
        .lg-card { width: 100%; max-width: 400px; animation: fadeUp .5s ease forwards; }

        .lg-form-head { margin-bottom: 36px; }
        .lg-form-logo {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px; box-shadow: 0 6px 20px rgba(59,130,246,.25);
        }
        .lg-form-logo span { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 12px; color: #fff; }
        .lg-form-title { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 30px; color: #0f172a; letter-spacing: -.02em; line-height: 1.2; margin-bottom: 6px; }
        .lg-form-sub { font-size: 14px; color: #64748b; font-family: 'Nunito', sans-serif; font-weight: 500; line-height: 1.5; }

        .lg-field { margin-bottom: 18px; }
        .lg-lbl { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 700; color: #374151; font-family: 'Nunito', sans-serif; margin-bottom: 8px; }
        .lg-forgot { color: #1e3a8a; text-decoration: none; font-size: 12px; font-weight: 700; transition: color .2s; }
        .lg-forgot:hover { color: #3b82f6; }

        .lg-inp-wrap { position: relative; display: flex; align-items: center; }
        .lg-inp-icon { position: absolute; left: 14px; width: 16px; height: 16px; pointer-events: none; z-index: 1; color: #94a3b8; }
        .lg-inp {
          width: 100%; height: 50px; padding: 0 44px;
          background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 600;
          color: #0f172a; outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
        }
        .lg-inp::placeholder { color: #cbd5e1; font-weight: 500; }
        .lg-inp:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
        .lg-inp-eye { position: absolute; right: 14px; background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; color: #94a3b8; transition: color .2s; }
        .lg-inp-eye:hover { color: #475569; }

        .lg-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; font-family: 'Nunito', sans-serif; margin-bottom: 18px; text-align: center; }

        .lg-btn {
          width: 100%; height: 52px;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: #fff; border: none; border-radius: 10px;
          font-size: 15px; font-weight: 800; letter-spacing: .02em; cursor: pointer;
          font-family: 'Nunito', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 8px 24px rgba(59,130,246,.3);
          transition: transform .2s, box-shadow .2s; margin-top: 8px;
        }
        .lg-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(59,130,246,.4); }
        .lg-btn:disabled { opacity: .7; cursor: not-allowed; }

        .lg-dots { display: flex; gap: 5px; align-items: center; }
        .lg-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; animation: dotBounce 1s ease-in-out infinite; }

        .lg-foot { text-align: center; margin-top: 24px; font-size: 13px; color: #64748b; font-family: 'Nunito', sans-serif; font-weight: 600; }
        .lg-foot a { color: #1e3a8a; text-decoration: none; font-weight: 800; }
        .lg-foot a:hover { color: #3b82f6; }

        /* Mobile */
        .lg-topbar { display: none; background: linear-gradient(135deg, #060b1a, #1e3a8a); padding: 14px 20px; align-items: center; gap: 12px; cursor: pointer; }
        .lg-topbar-mark { width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .lg-topbar-mark span { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 10px; color: #fff; }
        .lg-topbar-name { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 15px; color: #fff; }
        .lg-topbar-sub { font-size: 10px; color: rgba(255,255,255,.4); font-family: 'Nunito', sans-serif; font-weight: 600; }

        @media (max-width: 900px) {
          .lg-left { display: none; }
          .lg-topbar { display: flex; }
          .lg-root { flex-direction: column; }
          .lg-right { padding: 32px 20px 48px; align-items: flex-start; }
          .lg-card { max-width: 100%; }
        }
        @media (max-width: 480px) {
          .lg-right { padding: 24px 16px 40px; }
          .lg-form-title { font-size: 26px; }
          .lg-inp { height: 46px; }
          .lg-btn { height: 48px; }
        }
      `}</style>

      <div className="lg-root">
        <div className="lg-topbar" onClick={() => router.push("/")}>
          <div className="lg-topbar-mark">
            <span>INV</span>
          </div>
          <div>
            <div className="lg-topbar-name">STOCKR</div>
            <div className="lg-topbar-sub">Inventory Management System</div>
          </div>
        </div>

        {/* LEFT */}
        <div className="lg-left">
          <div className="lg-left-grid" />
          <div className="lg-left-glow" />
          <div className="lg-left-glow2" />
          <div className="lg-ticker-wrap">
            <div className="lg-ticker-track">
              {[...Array(2)].map((_, i) => (
                <span key={i}>
                  {[
                    "PRODUCTS: 248",
                    "ORDERS TODAY: 63",
                    "REVENUE: RP 48.2M",
                    "ACTIVE USERS: 12",
                    "LOW STOCK: 4"
                  ].map((t, j) => (
                    <span key={j} className="lg-ticker-item">
                      <span className="lg-ticker-dot" />
                      {t}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
          <div className="lg-brand-area" onClick={() => router.push("/")}>
            <div className="lg-brand-mark">
              <span>INV</span>
            </div>
            <div>
              <div className="lg-brand-name">STOCKR</div>
              <div className="lg-brand-sub">Inventory Management System</div>
            </div>
          </div>
          <div className="lg-hero">
            <div className="lg-hero-tag">
              <span className="lg-hero-tag-dot" />
              <span className="lg-hero-tag-text">Live System</span>
            </div>
            <h1 className="lg-hero-title">
              Kontrol Inventori
              <br />
              <em>Lebih Cerdas</em>
            </h1>
            <p className="lg-hero-desc">
              Pantau stok, kelola pesanan, dan analisis pendapatan bisnis kamu
              dari satu dasbor yang powerful.
            </p>
            <div className="lg-stats-grid">
              {[
                { val: "248", lbl: "Products", chg: "+12 bulan ini" },
                { val: "63", lbl: "Orders Today", chg: "+8% vs kemarin" },
                { val: "48.2M", lbl: "Revenue", chg: "↑ Rp bulan ini" }
              ].map((s) => (
                <div key={s.lbl} className="lg-stat-cell">
                  <span className="lg-stat-val">{s.val}</span>
                  <span className="lg-stat-lbl">{s.lbl}</span>
                  <span className="lg-stat-change">{s.chg}</span>
                </div>
              ))}
            </div>
            <div className="lg-features">
              {[
                {
                  label: "Manajemen produk",
                  sub: "Multi-kategori & varian",
                  svg: (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="2"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                  )
                },
                {
                  label: "Laporan real-time",
                  sub: "Grafik & analitik mendalam",
                  svg: (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="2"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  )
                },
                {
                  label: "Notifikasi stok",
                  sub: "Alert otomatis stok menipis",
                  svg: (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="2"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  )
                }
              ].map((f) => (
                <div key={f.label} className="lg-feat">
                  <div className="lg-feat-icon">{f.svg}</div>
                  <div className="lg-feat-text">
                    <strong>{f.label}</strong> — {f.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg-bottom-bar">
            <div className="lg-bottom-trust">
              <span className="lg-bottom-trust-dot" />
              System online
            </div>
            <span className="lg-bottom-version">v2.4.1 · 2026</span>
          </div>
        </div>

        {/* RIGHT — WHITE */}
        <div className="lg-right">
          <div className="lg-card">
            <div className="lg-form-head">
              <h1 className="lg-form-title">Selamat Datang</h1>
              <p className="lg-form-sub">
                Masukkan email dan password untuk masuk.
              </p>
            </div>
            <div className="lg-field">
              <label className="lg-lbl">Email</label>
              <div className="lg-inp-wrap">
                <svg
                  className="lg-inp-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  className="lg-inp"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="lg-field">
              <label className="lg-lbl">
                Password
                <a href="/reset-password" className="lg-forgot">
                  Lupa password?
                </a>
              </label>
              <div className="lg-inp-wrap">
                <svg
                  className="lg-inp-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  className="lg-inp"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="lg-inp-eye"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
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
              </div>
            </div>
            {error && <div className="lg-error">⚠ {error}</div>}
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
                "Masuk ke Dashboard"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
