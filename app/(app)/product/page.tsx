"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import CSChatWidget from "../components/CSChatWidget"
import { cn } from "../../lib/utils"

/* ── DATA ── */
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/product" },
  { label: "About Us", href: "/about" }
]

const IMG_BG1 =
  "https://res.cloudinary.com/dp0dtct3v/image/upload/v1775018967/ic_bc_ymt1ze.jpg"
const IMG_BG2 =
  "https://res.cloudinary.com/dp0dtct3v/image/upload/v1775018967/ic_cb_esgcqk.jpg"

const PRODUCTS = [
  {
    id: 1,
    name: "Manajemen Produk",
    tagline: "Ribuan SKU, Satu Dasbor",
    desc: "Tambah, edit, dan kategorikan produk dalam hitungan detik. Sistem kami mendukung bulk import via CSV, barcode scanning, dan multi-varian produk tanpa batas.",
    badge: "Core Feature",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" width="80" height="80">
        <rect
          x="8"
          y="14"
          width="64"
          height="52"
          rx="8"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path d="M8 28h64" stroke="currentColor" strokeWidth="3" />
        <path
          d="M28 14v14M52 14v14"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <rect
          x="20"
          y="38"
          width="16"
          height="16"
          rx="3"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d="M44 44h16M44 52h10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    color: "#1e3a5f",
    accent: "#38bdf8",
    stat: [
      { v: "10K+", l: "SKU Didukung" },
      { v: "< 1s", l: "Load Time" },
      { v: "99%", l: "Akurasi Data" }
    ],
    visual: "grid"
  },
  {
    id: 2,
    name: "Stok Real-Time",
    tagline: "Pantau Setiap Pergerakan",
    desc: "Monitor stok masuk dan keluar secara langsung. Alert otomatis saat stok menipis, histori lengkap setiap mutasi, dan sinkronisasi lintas gudang dalam satu klik.",
    badge: "Live Sync",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" width="80" height="80">
        <path
          d="M14 64V32l26-18 26 18v32"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <rect
          x="28"
          y="42"
          width="24"
          height="22"
          rx="3"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d="M22 36h8M50 36h8"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx="60"
          cy="20"
          r="10"
          fill="#38bdf8"
          stroke="white"
          strokeWidth="2.5"
        />
        <path
          d="M56 20l2.5 2.5 5-5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    color: "#0f2744",
    accent: "#7dd3fc",
    stat: [
      { v: "< 1s", l: "Sync Speed" },
      { v: "24/7", l: "Monitoring" },
      { v: "0", l: "Downtime" }
    ],
    visual: "pulse"
  },
  {
    id: 3,
    name: "Laporan & Analitik",
    tagline: "Data Jadi Keputusan",
    desc: "Grafik penjualan interaktif, tren produk terlaris, dan laporan keuangan otomatis. Export ke PDF atau Excel kapan saja, dari mana saja.",
    badge: "Analytics",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" width="80" height="80">
        <path
          d="M14 66V26l12-10h28l12 10v40"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M14 34h52" stroke="currentColor" strokeWidth="2.5" />
        <path
          d="M30 44v18M40 38v24M50 42v22"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="30" cy="44" r="3" fill="currentColor" />
        <circle cx="40" cy="38" r="3" fill="currentColor" />
        <circle cx="50" cy="42" r="3" fill="currentColor" />
      </svg>
    ),
    color: "#162b50",
    accent: "#60a5fa",
    stat: [
      { v: "15+", l: "Tipe Laporan" },
      { v: "PDF/XLS", l: "Format Export" },
      { v: "Real-time", l: "Dashboard" }
    ],
    visual: "bars"
  },
  {
    id: 4,
    name: "Riwayat Transaksi",
    tagline: "Audit Trail Lengkap",
    desc: "Setiap transaksi tercatat dengan timestamp, user, dan detail perubahan. Filter berdasarkan tanggal, produk, atau kategori. Audit mudah, verifikasi cepat.",
    badge: "Audit Log",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" width="80" height="80">
        <circle cx="40" cy="40" r="26" stroke="currentColor" strokeWidth="3" />
        <path
          d="M40 24v16l8 8"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 18l6 6M62 18l-6 6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    color: "#0c1f3e",
    accent: "#93c5fd",
    stat: [
      { v: "∞", l: "History" },
      { v: "5s", l: "Filter Speed" },
      { v: "100%", l: "Log Coverage" }
    ],
    visual: "timeline"
  }
]

const FEATURES_MINI = [
  { icon: "⚡", label: "Import CSV Bulk" },
  { icon: "📱", label: "Mobile Friendly" },
  { icon: "🔒", label: "Data Encrypted" },
  { icon: "🔔", label: "Smart Alert" },
  { icon: "👥", label: "Multi User" },
  { icon: "☁️", label: "Cloud Backup" }
]

/* ── VISUALS ── */
function VisualGrid() {
  return (
    <div className="grid w-full grid-cols-4 gap-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-12 rounded-[10px] border border-white/10",
            i % 3 === 0
              ? "bg-[#38bdf8]/25"
              : i % 5 === 0
                ? "bg-[#1e3a5f]/45"
                : "bg-white/7"
          )}
        />
      ))}
    </div>
  )
}

function VisualPulse() {
  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border-[1.5px] border-brand-400/35 animate-[expandRing_2.5s_ease-out_infinite]"
          style={{
            width: i * 50,
            height: i * 50,
            animationDelay: `${(i - 1) * 0.75}s`
          }}
        />
      ))}
      <div className="flex h-12.5 w-12.5 items-center justify-center rounded-full bg-linear-to-br from-brand-700 to-brand-500 shadow-[0_0_28px_rgba(59,130,246,.5)]">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </div>
    </div>
  )
}

function VisualBars() {
  const heights = [40, 70, 55, 85, 65, 90, 75]
  return (
    <div className="flex h-25 w-full items-end gap-1.75">
      {heights.map((h, i) => (
        <div
          key={i}
          className={cn(
            "relative flex-1 overflow-hidden rounded-t-[5px]",
            i === 5
              ? "bg-linear-to-b from-brand-400 to-[#1d4ed8]"
              : "bg-white/14"
          )}
          style={{ height: `${h}%` }}
        >
          {i === 5 && (
            <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent" />
          )}
        </div>
      ))}
    </div>
  )
}

function VisualTimeline() {
  const items = [
    "Order #1042 · Masuk 50 pcs",
    "Order #1041 · Keluar 12 pcs",
    "Order #1040 · Update stok",
    "Order #1039 · Masuk 100 pcs"
  ]
  return (
    <div className="w-full">
      {items.map((item, i) => (
        <div key={i} className="mb-2 flex gap-2.5">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "mt-1.25 h-2 w-2 shrink-0 rounded-full",
                i === 0 ? "bg-brand-400" : "bg-white/20"
              )}
            />
            {i < items.length - 1 && (
              <div className="mt-0.75 w-px flex-1 bg-white/8" />
            )}
          </div>
          <div
            className={cn(
              "flex-1 rounded-lg border bg-white/6 px-2.75 py-1.75",
              i === 0 ? "border-brand-400/35" : "border-white/6",
              i < items.length - 1 && "mb-1"
            )}
          >
            <span
              className={cn(
                "text-[11px]",
                i === 0 ? "text-brand-400" : "text-white/60"
              )}
            >
              {item}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── PAGE ── */
export default function ProductPage() {
  const [active, setActive] = useState(0)
  const [dir, setDir] = useState<"right" | "left">("right")
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = (idx: number, direction?: "left" | "right") => {
    if (idx === active) return
    setDir(direction ?? (idx > active ? "right" : "left"))
    setActive(idx)
  }

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setDir("right")
      setActive((a) => (a + 1) % PRODUCTS.length)
    }, 4500)
  }

  useEffect(() => {
    startTimer()
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  const cur = PRODUCTS[active]
  const slideAnim =
    dir === "right"
      ? "animate-[slideR_.5s_cubic-bezier(.22,.68,0,1.15)_both]"
      : "animate-[slideL_.5s_cubic-bezier(.22,.68,0,1.15)_both]"

  const renderVisual = (type: string) => {
    if (type === "grid") return <VisualGrid />
    if (type === "pulse") return <VisualPulse />
    if (type === "bars") return <VisualBars />
    return <VisualTimeline />
  }

  return (
    <div className="font-['Nunito',sans-serif] text-[#0f172a]">
      {/* Keyframes only — Tailwind utility classes can't declare @keyframes on their own */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        /* navSlide, menuIn, floatY already exist as animate-nav-slide / animate-menu-in / animate-float-y in the Tailwind theme, so they're not redeclared here */
        @keyframes slideR     { from{opacity:0;transform:translateX(55px) scale(.97)} to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes slideL     { from{opacity:0;transform:translateX(-55px) scale(.97)} to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes expandRing { 0%{transform:scale(.3);opacity:.7} 100%{transform:scale(1);opacity:0} }
        @keyframes gridPan    { from{background-position:0 0} to{background-position:48px 48px} }
        @keyframes blink      { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes fillProg   { from{width:0%} to{width:100%} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes kenBurns   { 0%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.08) translate(-1%,1%)} 100%{transform:scale(1) translate(0,0)} }
      `
        }}
      />

      {/* NAV */}
      <nav
        className={cn(
          "fixed left-0 right-0 top-0 z-100 transition-all duration-300 animate-nav-slide",
          scrolled &&
            "bg-[rgba(8,12,24,.96)] shadow-[0_1px_0_rgba(255,255,255,.06),0_4px_20px_rgba(0,0,0,.4)] backdrop-blur-[18px]"
        )}
      >
        <div className="mx-auto flex h-17.5 max-w-300 items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-linear-to-br from-brand-700 to-brand-500 shadow-[0_4px_14px_rgba(59,130,246,.4)]">
              <span className="text-[11px] font-black tracking-[.05em] text-white">
                INV
              </span>
            </div>
            <span
              className={cn(
                "text-xl font-black tracking-[.07em]",
                scrolled ? "text-slate-100" : "text-white"
              )}
            >
              STOCK<em className="not-italic text-brand-400">R</em>
            </span>
          </Link>

          <div className="hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.map((n) => {
              const isActive = n.label === "Product"
              return (
                <Link
                  key={n.label}
                  href={n.href}
                  className={cn(
                    "rounded-lg px-5 py-2.25 text-[15px] font-bold no-underline transition-colors duration-200",
                    scrolled
                      ? "text-white/65 hover:bg-white/10 hover:text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white",
                    isActive &&
                      (scrolled
                        ? "text-brand-400 font-extrabold"
                        : "font-extrabold text-white")
                  )}
                >
                  {n.label}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={cn(
                "hidden h-10.5 items-center rounded-[10px] px-5.5 text-[15px] font-extrabold no-underline backdrop-blur-sm transition-all duration-200 md:flex",
                scrolled
                  ? "border border-transparent bg-brand-500 text-white shadow-[0_4px_12px_rgba(59,130,246,.4)] hover:bg-[#2563eb]"
                  : "border border-white/20 bg-white/12 text-white hover:-translate-y-px hover:bg-white/20"
              )}
            >
              Login
            </Link>
            <button
              className="flex flex-col gap-1.25 border-none bg-transparent p-1.5 md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="menu"
            >
              <span
                className={cn(
                  "block h-0.5 w-5.5 rounded-sm bg-white transition-all duration-300",
                  menuOpen && "translate-x-1.25 translate-y-1.25 rotate-45"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5.5 rounded-sm bg-white transition-all duration-300",
                  menuOpen && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5.5 rounded-sm bg-white transition-all duration-300",
                  menuOpen && "translate-x-1.25 -translate-y-1.25 -rotate-45"
                )}
              />
            </button>
          </div>
        </div>

        <div
          className={cn(
            "absolute inset-x-0 top-17.5 hidden border-b border-white/8 bg-[rgba(8,12,24,.97)] px-5 pb-5 pt-3 shadow-[0_12px_32px_rgba(0,0,0,.4)] backdrop-blur-[20px]",
            menuOpen && "block animate-menu-in"
          )}
        >
          {NAV_LINKS.map((n) => {
            const isActive = n.label === "Product"
            return (
              <Link
                key={n.label}
                href={n.href}
                className={cn(
                  "mb-1 block rounded-[10px] px-4 py-3.25 text-[15px] font-bold no-underline transition-all duration-200",
                  isActive
                    ? "bg-brand-500/10 text-brand-400"
                    : "text-white/70 hover:bg-brand-500/10 hover:text-brand-400"
                )}
                onClick={() => setMenuOpen(false)}
              >
                {n.label}
              </Link>
            )
          })}
          <Link
            href="/login"
            className="mt-3 flex h-12 w-full items-center justify-center rounded-[10px] bg-brand-500 text-[15px] font-extrabold text-white no-underline"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative flex min-h-screen items-center overflow-hidden px-5 pb-15 pt-22 md:px-8 md:pb-18 md:pt-25">
        {/* Background: 2 images + overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={IMG_BG1}
            alt=""
            aria-hidden="true"
            className="absolute right-0 top-0 h-[60%] w-[55%] object-cover opacity-[.22] animate-[kenBurns_18s_ease-in-out_infinite]"
          />
          <img
            src={IMG_BG2}
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-[55%] w-1/2 object-cover opacity-[.16] animate-[kenBurns_22s_ease-in-out_infinite_reverse]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(30,58,138,.18) 0%, transparent 60%), radial-gradient(ellipse 70% 60% at 20% 80%, rgba(15,23,42,.3) 0%, transparent 60%), linear-gradient(160deg, #060b1a 0%, #0c1733 25%, #0f2050 50%, #0c1a3a 75%, #080d1f 100%)"
            }}
          />
        </div>

        {/* Grid texture & glows */}
        <div
          className="absolute inset-0 z-1 pointer-events-none animate-[gridPan_12s_linear_infinite] bg-size-[52px_52px]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)"
          }}
        />
        <div className="pointer-events-none absolute -right-20 -top-20 z-1 h-130 w-130 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,.15)_0%,transparent_65%)]" />
        <div className="pointer-events-none absolute -bottom-15 -left-15 z-1 h-100 w-100 rounded-full bg-[radial-gradient(circle,rgba(30,58,138,.12)_0%,transparent_65%)]" />

        <div className="relative z-2 mx-auto grid w-full max-w-300 grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-18">
          {/* Left */}
          <div>
            <div key={`b-${active}`} className={slideAnim}>
              <div className="mb-5 inline-flex items-center gap-2.25 rounded-full border border-white/15 bg-white/8 px-5 py-2 backdrop-blur-sm">
                <div className="h-1.75 w-1.75 shrink-0 rounded-full bg-brand-400 animate-[blink_1.4s_ease-in-out_infinite]" />
                <span className="text-[12px] font-extrabold uppercase tracking-[.08em] text-white/85">
                  {cur.badge}
                </span>
              </div>
            </div>
            <div
              key={`t-${active}`}
              className={cn(slideAnim, "[animation-delay:.07s]")}
            >
              <p className="mb-3 text-[12px] font-bold uppercase tracking-widest text-white/45">
                {cur.tagline}
              </p>
            </div>
            <div
              key={`h-${active}`}
              className={cn(slideAnim, "[animation-delay:.13s]")}
            >
              <h1 className="mb-5 text-[32px] font-black leading-[1.04] tracking-[-.02em] text-white sm:text-[40px] md:text-[48px] lg:text-[64px]">
                {cur.name.split(" ").map((w, i) =>
                  i === 0 ? (
                    <em key={i} className="not-italic text-brand-400">
                      {w}
                      <br />
                    </em>
                  ) : (
                    <span key={i}>{w} </span>
                  )
                )}
              </h1>
            </div>
            <div
              key={`d-${active}`}
              className={cn(slideAnim, "[animation-delay:.19s]")}
            >
              <p className="mb-8.5 max-w-110 text-[17px] font-medium leading-[1.75] text-white/65">
                {cur.desc}
              </p>
            </div>
            <div
              key={`s-${active}`}
              className={cn(slideAnim, "[animation-delay:.25s]")}
            >
              <div className="mb-8.5 flex flex-wrap gap-3">
                {cur.stat.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/8 bg-black/35 px-5 py-4 backdrop-blur-md"
                  >
                    <div className="text-2xl font-black leading-none text-white sm:text-[26px]">
                      {s.v}
                    </div>
                    <div className="mt-1.25 text-[10px] font-bold uppercase tracking-[.07em] text-white/38">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              key={`c-${active}`}
              className={cn(slideAnim, "[animation-delay:.31s]")}
            >
              <div className="flex flex-wrap gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-7.5 text-base font-extrabold text-white no-underline shadow-[0_8px_28px_rgba(59,130,246,.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2563eb] hover:shadow-[0_12px_36px_rgba(59,130,246,.5)] sm:w-auto"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Coba Sekarang
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-13 w-full items-center justify-center rounded-xl border-[1.5px] border-white/20 bg-white/8 px-6.5 text-base font-bold text-white no-underline backdrop-blur-sm transition-colors duration-200 hover:bg-white/16 sm:w-auto"
                >
                  Lihat Demo
                </Link>
              </div>
            </div>

            <div className="mt-10 hidden flex-wrap gap-2 md:flex">
              {PRODUCTS.map((p, i) => (
                <button
                  key={i}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-5.5 py-2.75 text-sm font-bold transition-all duration-220",
                    active === i
                      ? "border-brand-500/35 bg-brand-500/20 text-brand-300"
                      : "border-white/10 bg-white/6 text-white/55 hover:bg-white/12 hover:text-white/85"
                  )}
                  onClick={() => {
                    goTo(i)
                    startTimer()
                  }}
                >
                  <span className="text-[11px] font-bold opacity-50">
                    0{i + 1}
                  </span>
                  {p.name}
                </button>
              ))}
            </div>

            <div className="mt-3.5 flex gap-1.5">
              {PRODUCTS.map((_, i) => (
                <div
                  key={i}
                  className="h-0.5 flex-1 overflow-hidden rounded-sm bg-white/10"
                >
                  <div
                    className={cn(
                      "h-full rounded-sm bg-brand-500",
                      active === i
                        ? "w-0 animate-[fillProg_4.5s_linear_forwards]"
                        : "w-0"
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="mt-3.5 flex items-center gap-3">
              {PRODUCTS.map((_, i) => (
                <button
                  key={i}
                  className={cn(
                    "h-2 rounded-full bg-white/20 transition-all duration-400 ease-[cubic-bezier(.34,1.56,.64,1)]",
                    active === i ? "w-7.5 bg-brand-400" : "w-2"
                  )}
                  onClick={() => {
                    goTo(i)
                    startTimer()
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
              <button
                className="rounded-lg bg-white/8 px-4 py-2 text-[13px] font-bold text-white/50 transition-all duration-200 hover:bg-white/15 hover:text-white"
                onClick={() => {
                  goTo((active + 1) % PRODUCTS.length, "right")
                  startTimer()
                }}
              >
                Next →
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="order-first flex justify-center lg:order-0">
            <div
              key={`card-${active}`}
              className={cn(
                slideAnim,
                "flex w-full max-w-95 flex-col items-center gap-6.5 rounded-3xl border border-white/10 bg-white/5 p-9 shadow-[0_24px_64px_rgba(0,0,0,.5)] backdrop-blur-[20px] animate-float-y"
              )}
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-[20px] bg-brand-500/12 text-brand-300">
                {cur.icon}
              </div>
              {renderVisual(cur.visual)}
              <div className="w-full rounded-xl border border-white/7 bg-black/30 px-4 py-3.5">
                <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[.07em] text-white/30">
                  Statistik Fitur
                </div>
                <div className="flex gap-2.5">
                  {cur.stat.map((s, i) => (
                    <div key={i} className="flex-1">
                      <div className="text-[17px] font-black text-brand-400">
                        {s.v}
                      </div>
                      <div className="mt-0.75 text-[9px] font-bold uppercase tracking-[.05em] text-white/28">
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <div className="border-y border-slate-200 bg-white px-5 py-6.5 md:px-8">
        <div className="mx-auto flex max-w-300 flex-wrap items-center justify-center gap-2.5">
          {FEATURES_MINI.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-1.75 rounded-full border border-[#087463]/15 bg-[#f0faf7] px-4.5 py-2 text-sm font-bold text-[#087463]"
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DETAIL */}
      <section className="bg-[#f0faf7] px-5 py-18 md:px-8 md:py-25">
        <div className="mx-auto max-w-300">
          <div className="mb-15 text-center">
            <div className="mb-4 inline-flex items-center rounded-full bg-[#087463]/10 px-4 py-1.25">
              <span className="text-[12px] font-extrabold uppercase tracking-[.07em] text-[#087463]">
                Semua Fitur
              </span>
            </div>
            <h2 className="mb-3.5 text-[26px] font-black leading-[1.2] tracking-[-.02em] text-[#0f172a] sm:text-[34px] md:text-[42px]">
              Platform Lengkap untuk{" "}
              <em className="not-italic text-[#087463]">Inventori</em> Kamu
            </h2>
            <p className="mx-auto max-w-130 text-[17px] font-medium leading-[1.65] text-slate-500">
              Dari manajemen produk hingga laporan keuangan — semuanya ada dalam
              satu sistem terintegrasi.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {PRODUCTS.map((p, i) => (
              <div
                key={i}
                className="rounded-[20px] border-[1.5px] border-slate-200 bg-white p-9 transition-all duration-250 hover:-translate-y-1 hover:border-[#087463] hover:shadow-[0_8px_32px_rgba(8,116,99,.12)]"
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-[#087463]/10 to-[#0fbf9f]/10 text-[#087463]">
                  {p.icon}
                </div>
                <span className="mb-3 inline-block rounded-full bg-[#087463]/8 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[.06em] text-[#087463]">
                  {p.badge}
                </span>
                <h3 className="mb-2.5 text-[22px] font-black text-[#0f172a]">
                  {p.name}
                </h3>
                <p className="mb-5.5 text-[15px] font-medium leading-[1.7] text-slate-500">
                  {p.desc}
                </p>
                <div className="flex flex-wrap gap-5">
                  {p.stat.map((s, j) => (
                    <div key={j}>
                      <div className="text-xl font-black text-[#087463]">
                        {s.v}
                      </div>
                      <div className="mt-0.75 text-[10px] font-bold uppercase tracking-[.06em] text-slate-400">
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="px-5 pb-18 md:px-8 md:pb-25">
        <div className="relative mx-auto max-w-300 overflow-hidden rounded-[28px] bg-linear-to-br from-brand-950 via-brand-900 to-brand-700 px-6 py-10 text-center sm:px-9 md:px-16 md:py-20">
          <div
            className="pointer-events-none absolute inset-0 bg-size-[40px_40px]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)"
            }}
          />
          <div className="pointer-events-none absolute -right-20 -top-20 h-100 w-100 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,.2)_0%,transparent_65%)]" />
          <h2 className="relative z-1 mb-4 text-[26px] font-black tracking-[-.025em] text-white sm:text-[34px] md:text-[44px]">
            Siap Mulai Kelola Inventori{" "}
            <em className="not-italic text-brand-400">Lebih Cerdas?</em>
          </h2>
          <p className="relative z-1 mx-auto mb-9 max-w-120 text-[17px] font-medium leading-[1.7] text-white/65">
            Bergabung dengan 500+ bisnis yang sudah menggunakan STOCKR untuk
            memantau stok dan meningkatkan efisiensi operasional.
          </p>
          <div className="relative z-1 flex flex-wrap justify-center gap-3.5">
            <Link
              href="/login"
              className="inline-flex h-13 items-center gap-2 rounded-xl bg-white px-7.5 text-base font-black text-brand-700 no-underline shadow-[0_8px_28px_rgba(0,0,0,.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,.4)]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Mulai Gratis Sekarang
            </Link>
            <Link
              href="/login"
              className="inline-flex h-13 items-center rounded-xl border-[1.5px] border-white/20 bg-white/8 px-6.5 text-base font-bold text-white no-underline backdrop-blur-sm transition-colors duration-200 hover:bg-white/16"
            >
              Masuk ke Akun
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-linear-to-br from-[#050a14] via-brand-900 to-[#080d1f] px-5 py-10 text-center md:px-8">
        <div className="mb-2 text-xl font-black tracking-[.07em] text-white">
          STOCK<em className="not-italic text-brand-400">R</em>
        </div>
        <div className="text-[13px] font-semibold text-white/30">
          © 2026 STOCKR · Inventory Management System
        </div>
      </footer>
      <CSChatWidget />
    </div>
  )
}
