"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "../../lib/utils"

const TICKER_ITEMS = [
  "PRODUCTS: 248",
  "ORDERS TODAY: 63",
  "REVENUE: RP 48.2M",
  "ACTIVE USERS: 12",
  "LOW STOCK: 4"
]

const STATS = [
  { val: "248", lbl: "Products", chg: "+12 bulan ini" },
  { val: "63", lbl: "Orders Today", chg: "+8% vs kemarin" },
  { val: "48.2M", lbl: "Revenue", chg: "↑ Rp bulan ini" }
]

const FEATURES = [
  {
    label: "Manajemen produk",
    sub: "Multi-kategori & varian",
    path: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
  },
  {
    label: "Laporan real-time",
    sub: "Grafik & analitik mendalam",
    path: "M22 12 18 12 15 21 9 3 6 12 2 12"
  },
  {
    label: "Notifikasi stok",
    sub: "Alert otomatis stok menipis",
    paths: [
      "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9",
      "M13.73 21a2 2 0 0 1-3.46 0"
    ]
  }
]

// Reusable class fragments, kept as tokens so Tailwind classes stay readable
const inputBase =
  "h-[50px] w-full rounded-[10px] border-[1.5px] border-slate-200 bg-slate-50 px-[44px] font-nunito text-sm font-semibold text-slate-900 outline-none transition-colors placeholder:font-medium placeholder:text-slate-300 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"

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
    <div className="flex min-h-screen font-nunito">
      {/* Mobile topbar (only visible < md) */}
      <div
        className="flex cursor-pointer items-center gap-3 bg-[linear-gradient(135deg,#060b1a,#1e3a8a)] px-5 py-3.5 md:hidden"
        onClick={() => router.push("/")}
      >
        <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#1e3a8a,#3b82f6)]">
          <span className="text-[10px] font-black text-white">INV</span>
        </div>
        <div>
          <div className="text-[15px] font-black text-white">STOCKR</div>
          <div className="text-[10px] font-semibold text-white/40">
            Inventory Management System
          </div>
        </div>
      </div>

      {/* LEFT — dark showcase panel */}
      <div className="relative hidden min-h-screen w-[52%] flex-col overflow-hidden bg-[linear-gradient(160deg,#060b1a_0%,#0c1733_30%,#0f2050_60%,#1e3a8a_100%)] md:flex">
        {/* grid texture */}
        <div className="pointer-events-none absolute inset-0 animate-[gridPan_8s_linear_infinite] bg-size-[48px_48px] bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)]" />
        {/* glows */}
        <div className="pointer-events-none absolute -right-30 -top-30 h-125 w-125 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,.22)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-95 w-95 rounded-full bg-[radial-gradient(circle,rgba(30,58,138,.18)_0%,transparent_70%)]" />

        {/* ticker */}
        <div className="absolute inset-x-0 top-0 flex h-9 items-center overflow-hidden border-b border-white/8 bg-black/25 backdrop-blur-md">
          <div className="flex animate-[ticker_28s_linear_infinite] whitespace-nowrap">
            {[0, 1].map((i) => (
              <span key={i} className="flex">
                {TICKER_ITEMS.map((t, j) => (
                  <span
                    key={j}
                    className="inline-flex items-center gap-3.5 px-9 text-[11px] font-bold tracking-wide text-white/50"
                  >
                    <span className="h-1 w-1 rounded-full bg-blue-400" />
                    {t}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* brand */}
        <div
          className="relative z-2 flex cursor-pointer items-center gap-3 px-13 pt-13"
          onClick={() => router.push("/")}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] bg-[linear-gradient(135deg,#1e3a8a,#3b82f6)] shadow-[0_4px_12px_rgba(59,130,246,.35)]">
            <span className="text-[11px] font-black tracking-wide text-white">
              INV
            </span>
          </div>
          <div>
            <div className="text-lg font-black tracking-wide text-white">
              STOCKR
            </div>
            <div className="mt-0.5 text-[11px] font-semibold text-white/40">
              Inventory Management System
            </div>
          </div>
        </div>

        {/* hero */}
        <div className="relative z-2 flex-1 px-13 pt-13">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 backdrop-blur-md">
            <span className="relative h-1.5 w-1.5 rounded-full bg-blue-400 after:absolute after:-inset-0.75 after:animate-[pulseRing_1.8s_ease-out_infinite] after:rounded-full after:bg-blue-400/40 after:content-['']" />
            <span className="text-[11px] font-extrabold tracking-wide text-white/85">
              Live System
            </span>
          </div>

          <h1 className="mb-4 text-[clamp(30px,3vw,44px)] font-black leading-[1.1] tracking-tight text-white">
            Kontrol Inventori
            <br />
            <em className="not-italic text-blue-400">Lebih Cerdas</em>
          </h1>

          <p className="mb-9 max-w-90 text-sm font-medium leading-[1.7] text-white/60">
            Pantau stok, kelola pesanan, dan analisis pendapatan bisnis kamu
            dari satu dasbor yang powerful.
          </p>

          <div className="mb-8 grid grid-cols-3 gap-px overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.07]">
            {STATS.map((s) => (
              <div
                key={s.lbl}
                className="flex flex-col gap-1 bg-black/20 px-5 py-4.5 backdrop-blur-md transition-colors hover:bg-blue-500/15"
              >
                <span className="text-xl font-black tracking-tight text-white">
                  {s.val}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-white/40">
                  {s.lbl}
                </span>
                <span className="text-[11px] font-bold text-green-300">
                  {s.chg}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2.5">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3.5 rounded-[10px] border border-white/[0.07] bg-black/18 px-4 py-3.25 transition-colors hover:border-blue-400/30 hover:bg-blue-500/8"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="2"
                  >
                    {f.paths ? (
                      f.paths.map((d, i) => <path key={i} d={d} />)
                    ) : (
                      <path d={f.path} />
                    )}
                  </svg>
                </div>
                <div className="text-[13px] font-semibold text-white/55">
                  <strong className="font-extrabold text-white/85">
                    {f.label}
                  </strong>{" "}
                  — {f.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* bottom bar */}
        <div className="relative z-2 flex items-center justify-between border-t border-white/[0.07] px-13 py-6">
          <div className="flex items-center gap-2 text-xs font-bold text-white/35">
            <span className="h-1.75 w-1.75 rounded-full bg-green-500" />
            System online
          </div>
          <span className="text-[11px] font-bold text-white/20">
            v2.4.1 · 2026
          </span>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto bg-white px-10 py-12 md:px-10">
        <div className="w-full max-w-100 animate-[fadeUp_0.5s_ease_forwards]">
          <div className="mb-9">
            <h1 className="mb-1.5 text-[30px] font-black tracking-tight text-slate-900">
              Selamat Datang
            </h1>
            <p className="text-sm font-medium leading-relaxed text-slate-500">
              Masukkan email dan password untuk masuk.
            </p>
          </div>

          {/* Email */}
          <div className="mb-4.5">
            <label className="mb-2 flex items-center justify-between text-[13px] font-bold text-slate-700">
              Email
            </label>
            <div className="relative flex items-center">
              <svg
                className="pointer-events-none absolute left-3.5 z-1 h-4 w-4 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                className={inputBase}
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4.5">
            <label className="mb-2 flex items-center justify-between text-[13px] font-bold text-slate-700">
              Password
              <Link
                href="/reset-password"
                className="text-xs font-bold text-blue-900 transition-colors hover:text-blue-500"
              >
                Lupa password?
              </Link>
            </label>
            <div className="relative flex items-center">
              <svg
                className="pointer-events-none absolute left-3.5 z-1 h-4 w-4 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                className={inputBase}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3.5 flex items-center p-1 text-slate-400 transition-colors hover:text-slate-600"
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

          {error && (
            <div className="mb-4.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-center text-[13px] font-bold text-red-600">
              ⚠ {error}
            </div>
          )}

          <button
            className={cn(
              "mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-[10px]",
              "bg-[linear-gradient(135deg,#1e3a8a_0%,#3b82f6_100%)] text-[15px] font-extrabold tracking-wide text-white",
              "shadow-[0_8px_24px_rgba(59,130,246,.3)] transition-all",
              "hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(59,130,246,.4)]",
              "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70"
            )}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-1.25">
                <span className="h-1.5 w-1.5 animate-[dotBounce_1s_ease-in-out_infinite] rounded-full bg-white [animation-delay:0s]" />
                <span className="h-1.5 w-1.5 animate-[dotBounce_1s_ease-in-out_infinite] rounded-full bg-white [animation-delay:0.15s]" />
                <span className="h-1.5 w-1.5 animate-[dotBounce_1s_ease-in-out_infinite] rounded-full bg-white [animation-delay:0.3s]" />
              </span>
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
