"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import CSChatWidget from "../components/CSChatWidget"
import { cn } from "../../lib/utils"

/* ── DATA ── */
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Product", href: "product" },
  { label: "About Us", href: "about" }
]

const STATS = [
  { value: "248", label: "Total Produk", icon: "📦" },
  { value: "63", label: "Order Hari Ini", icon: "🛒" },
  { value: "Rp 48.2M", label: "Revenue Bulan Ini", icon: "💰" },
  { value: "12", label: "Kategori Aktif", icon: "🏷️" }
]

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
        <rect
          x="6"
          y="10"
          width="36"
          height="28"
          rx="4"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path d="M6 18h36" stroke="currentColor" strokeWidth="2.5" />
        <path
          d="M16 10v8M32 10v8"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <rect
          x="14"
          y="24"
          width="8"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M28 27h6M28 31h4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Manajemen Produk",
    desc: "Kelola ribuan SKU dengan mudah. Tambah, edit, dan atur kategori produk dalam satu dasbor terpadu."
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
        <path
          d="M8 36V20l16-12 16 12v16"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <rect
          x="18"
          y="26"
          width="12"
          height="10"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M14 22h4M30 22h4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle
          cx="38"
          cy="12"
          r="6"
          fill="#3b82f6"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M35.5 12l1.5 1.5 3-3"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Stok Real-Time",
    desc: "Pantau stok masuk dan keluar secara langsung. Dapatkan notifikasi saat stok hampir habis."
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
        <path
          d="M8 40V14l8-6h16l8 6v26"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M8 20h32" stroke="currentColor" strokeWidth="2" />
        <path
          d="M18 28v8M24 24v12M30 26v10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Laporan & Analitik",
    desc: "Grafik penjualan, tren produk terlaris, dan laporan keuangan dalam format yang mudah dipahami."
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
        <circle
          cx="24"
          cy="24"
          r="16"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d="M24 16v8l5 5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 10l4 4M38 10l-4 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Riwayat Transaksi",
    desc: "Lacak setiap transaksi dengan log terperinci. Mudah audit dan verifikasi kapan saja."
  }
]

const PRODUCTS = [
  {
    name: "Laptop ASUS VivoBook",
    sku: "LPT-001",
    stock: 24,
    status: "Aman",
    cat: "Elektronik"
  },
  {
    name: "Mouse Logitech MX",
    sku: "MSE-042",
    stock: 7,
    status: "Menipis",
    cat: "Aksesori"
  },
  {
    name: "Keyboard Mechanical",
    sku: "KBD-018",
    stock: 0,
    status: "Habis",
    cat: "Aksesori"
  },
  {
    name: "Monitor LG 24 inch",
    sku: "MNT-009",
    stock: 15,
    status: "Aman",
    cat: "Elektronik"
  },
  {
    name: "Headset Sony WH",
    sku: "HST-033",
    stock: 3,
    status: "Menipis",
    cat: "Audio"
  }
]

const IMG1 =
  "https://res.cloudinary.com/dp0dtct3v/image/upload/v1775017437/ic_sb_nra10b.jpg"
const IMG2 =
  "https://res.cloudinary.com/dp0dtct3v/image/upload/v1775017346/ic_bs_kh3emc.jpg"

/* ── STATUS STYLE MAP ── */
const STATUS_STYLES: Record<string, string> = {
  Aman: "text-blue-700 bg-blue-700/10",
  Menipis: "text-amber-500 bg-amber-500/10",
  Habis: "text-red-500 bg-red-500/10"
}

const STOCK_COLOR = (stock: number) =>
  stock === 0 ? "text-red-500" : stock < 8 ? "text-amber-500" : "text-brand-700"

/* ── REUSABLE PIECES ── */
function NavLinkDesktop({
  label,
  href,
  active,
  onClick
}: {
  label: string
  href: string
  active: boolean
  onClick: () => void
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "px-4.5 py-2 rounded-lg text-sm font-bold text-white/80 transition-colors",
        "hover:text-white hover:bg-white/10",
        active && "text-white"
      )}
    >
      {label}
    </a>
  )
}

function NavLinkMobile({
  label,
  href,
  active,
  onClick
}: {
  label: string
  href: string
  active: boolean
  onClick: () => void
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "block w-full text-left px-4 py-3.25 mb-1 rounded-[10px] text-[15px] font-bold text-gray-700 transition-colors",
        "hover:text-brand-700 hover:bg-brand-500/8",
        active && "text-brand-700 bg-brand-500/8"
      )}
    >
      {label}
    </a>
  )
}

export default function HomePage() {
  const [activeNav, setActiveNav] = useState("Home")
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav
        className={cn(
          "fixed inset-x-0 top-0 z-100 transition-[background,box-shadow] duration-300 animate-nav-slide",
          scrolled &&
            "bg-[rgba(8,12,24,.96)] backdrop-blur-[18px] shadow-[0_1px_0_rgba(255,255,255,.06),0_4px_20px_rgba(0,0,0,.4)]"
        )}
      >
        <div className="max-w-300 mx-auto flex items-center justify-between px-8 h-17">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="w-9.5 h-9.5 rounded-[9px] bg-linear-to-br from-brand-700 to-brand-500 flex items-center justify-center shadow-[0_4px_12px_rgba(59,130,246,.35)]">
              <span className="text-white font-black text-xs tracking-wide">
                INV
              </span>
            </div>
            <span className="font-black text-lg tracking-wide text-white">
              STOCK<em className="not-italic text-brand-500">R</em>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((n) => (
              <NavLinkDesktop
                key={n.label}
                label={n.label}
                href={n.href}
                active={activeNav === n.label}
                onClick={() => setActiveNav(n.label)}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={cn(
                "hidden md:inline-flex items-center h-10 px-5.5 rounded-[9px] text-sm font-extrabold no-underline transition-all",
                "shadow-[0_4px_12px_rgba(0,0,0,.15)]",
                scrolled
                  ? "bg-brand-500 text-white shadow-[0_4px_12px_rgba(59,130,246,.4)] hover:bg-brand-600"
                  : "bg-white text-brand-700 hover:bg-blue-50 hover:-translate-y-px"
              )}
            >
              Login
            </Link>
            <button
              className="md:hidden flex flex-col gap-1.25 p-1.5 bg-transparent border-0"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span
                className={cn(
                  "block w-5.5 h-0.5 rounded bg-white transition-all",
                  menuOpen && "translate-x-1.25 translate-y-1.25 rotate-45"
                )}
              />
              <span
                className={cn(
                  "block w-5.5 h-0.5 rounded bg-white transition-all",
                  menuOpen && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "block w-5.5 h-0.5 rounded bg-white transition-all",
                  menuOpen && "translate-x-1.25 -translate-y-1.25 -rotate-45"
                )}
              />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden absolute inset-x-0 top-17 bg-white/97 backdrop-blur-xl border-b border-brand-500/10 px-5 pt-3 pb-5 shadow-[0_12px_32px_rgba(0,0,0,.08)] animate-menu-in">
            {NAV_LINKS.map((n) => (
              <NavLinkMobile
                key={n.label}
                label={n.label}
                href={n.href}
                active={activeNav === n.label}
                onClick={() => {
                  setActiveNav(n.label)
                  setMenuOpen(false)
                }}
              />
            ))}
            <Link
              href="/login"
              className="flex items-center justify-center mt-3 w-full h-12 bg-brand-500 text-white rounded-[10px] text-[15px] font-extrabold no-underline"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section
        id="home"
        className="relative overflow-hidden min-h-screen flex items-center px-8 pt-25 pb-15 bg-[linear-gradient(160deg,#060b1a_0%,#0c1733_30%,#0f2050_60%,#1e3a8a_100%)]"
      >
        <div
          className="absolute inset-0 pointer-events-none animate-grid-pan"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)",
            backgroundSize: "48px 48px"
          }}
        />
        <div className="absolute -top-30 -right-30 w-125 h-125 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,.25)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-95 h-95 rounded-full bg-[radial-gradient(circle,rgba(30,58,138,.2)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-1 max-w-300 w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="animate-slide-in-left">
            <div className="relative isolate inline-flex items-center gap-2 rounded-full px-4 py-1.75 mb-6 overflow-hidden bg-white/8 backdrop-blur-sm">
              <div className="absolute -inset-11.25 rounded-[80px] -z-20 animate-border-rotate bg-[conic-gradient(from_0deg,transparent_0%,transparent_80%,#60a5fa_88%,#93c5fd_92%,#60a5fa_96%,transparent_100%)]" />
              <div className="absolute inset-[1.5px] rounded-full -z-10 bg-[rgba(8,14,36,.85)] backdrop-blur-sm" />
              <div className="relative w-1.5 h-1.5 rounded-full bg-brand-400">
                <div className="absolute -inset-0.75 rounded-full bg-brand-400/40 animate-pulse-ring" />
              </div>
              <span className="text-white/90 text-xs font-bold tracking-wide">
                Sistem Manajemen Inventori
              </span>
            </div>

            <h1 className="font-black text-[clamp(36px,5vw,58px)] leading-[1.1] text-white tracking-tight mb-5">
              Kelola Stok Lebih
              <br />
              <em className="not-italic text-brand-400">
                Cerdas &amp; Efisien
              </em>
            </h1>
            <p className="text-white/70 text-[17px] leading-[1.7] font-medium mb-9 max-w-110">
              STOCKR membantu bisnis kamu memantau stok, mengelola produk, dan
              melacak transaksi — semua dari satu platform yang mudah digunakan.
            </p>

            <div className="flex gap-3.5 flex-wrap">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 h-13 px-7 rounded-xl bg-brand-500 text-white text-[15px] font-extrabold no-underline shadow-[0_8px_24px_rgba(59,130,246,.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(59,130,246,.5)] hover:bg-brand-600"
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
                Mulai Gratis
              </Link>
              <a
                href="#product"
                className="inline-flex items-center h-13 px-7 rounded-xl bg-white/8 text-white text-[15px] font-extrabold no-underline border-[1.5px] border-white/20 backdrop-blur-sm transition-colors hover:bg-white/16 hover:border-white/40"
              >
                Lihat Fitur
              </a>
            </div>

            <div className="flex gap-5 mt-12 flex-wrap">
              {STATS.map((s, i) => (
                <div
                  key={i}
                  className="bg-black/25 backdrop-blur-md border border-white/8 rounded-xl px-5 py-3.5 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="text-white font-black text-[22px] tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-white/50 text-[11px] font-semibold tracking-wide uppercase mt-0.75">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── IMAGE COLLAGE ── */}
          <div className="animate-slide-in-right">
            <div className="relative w-full h-120">
              <div className="absolute top-0 right-0 w-[78%] h-80 rounded-[20px] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,.4)] animate-img-reveal group">
                <img
                  src={IMG1}
                  alt="Manajemen inventori"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 rounded-[20px] bg-[linear-gradient(135deg,rgba(30,58,138,.25)_0%,transparent_60%)]" />
              </div>

              <div className="absolute bottom-0 left-0 w-[58%] h-60 rounded-2xl overflow-hidden border-[3px] border-white/15 shadow-[0_16px_48px_rgba(0,0,0,.35)] animate-img-reveal group">
                <img
                  src={IMG2}
                  alt="Tim bisnis kolaborasi"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,14,60,.3)_0%,transparent_60%)]" />
                <div className="absolute top-5 left-5 z-10 bg-white/95 backdrop-blur-md rounded-xl px-3.5 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,.18)] animate-float-y">
                  <div className="font-black text-lg text-brand-700">+48%</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">
                    Efisiensi
                  </div>
                </div>
              </div>

              <div
                className="absolute bottom-14 -right-4 z-10 rounded-xl px-4 py-2.5 shadow-[0_8px_24px_rgba(59,130,246,.45)] bg-linear-to-br from-brand-700 to-brand-500 animate-float-y"
                style={{ animationDelay: "0.8s" }}
              >
                <div className="font-black text-base text-white">500+</div>
                <div className="text-[10px] text-white/75 font-bold uppercase tracking-wide mt-0.5">
                  Bisnis Aktif
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF STRIP ── */}
      <div className="bg-white px-8 py-7 border-b border-slate-200">
        <div className="max-w-300 mx-auto flex items-center justify-between flex-wrap gap-6">
          <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">
            Dipercaya oleh
          </span>
          <div className="flex items-center">
            <div className="flex items-center">
              {["A", "B", "C", "D", "E"].map((l, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-white overflow-hidden -ml-2 first:ml-0 flex items-center justify-center text-xs font-extrabold text-white"
                  style={{
                    background: `linear-gradient(135deg, #1e3a8a ${i * 20}%, #3b82f6)`
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
            <span className="text-sm font-bold text-gray-700 ml-3">
              <em className="not-italic text-brand-700">500+</em> bisnis aktif
            </span>
          </div>
          <div className="hidden sm:block w-px h-8 bg-slate-200" />
          <div className="text-center">
            <div className="font-black text-xl text-slate-900">2M+</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
              Produk Dikelola
            </div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-slate-200" />
          <div className="text-center">
            <div className="font-black text-xl text-slate-900">99.9%</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
              Uptime
            </div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-slate-200" />
          <div className="text-center">
            <div className="font-black text-xl text-slate-900">4.9★</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
              Rating Pengguna
            </div>
          </div>
        </div>
      </div>

      {/* ── PHOTO SECTION 1 ── */}
      <section className="px-8 py-25 bg-white">
        <div className="max-w-300 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,.12)] animate-slide-in-up group">
              <img
                src={IMG1}
                alt="Manajemen inventori"
                className="w-full h-95 object-cover block transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(30,58,138,.15)_0%,transparent_50%)]" />
              <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,.1)]">
                <div className="font-black text-xl text-brand-700">10x</div>
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">
                  Lebih Cepat
                </div>
              </div>
            </div>
            <div className="md:pl-4">
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.25 mb-4 bg-brand-500/10">
                <span className="text-brand-700 text-xs font-extrabold tracking-wide uppercase">
                  Kolaborasi Tim
                </span>
              </div>
              <h2 className="font-black text-[clamp(26px,3.5vw,38px)] text-slate-900 tracking-tight leading-tight mb-4">
                Kerja Bareng Tim{" "}
                <em className="not-italic text-brand-700">Lebih Mudah</em>
              </h2>
              <p className="text-slate-500 text-[15px] leading-[1.75] font-medium mb-7">
                STOCKR dirancang untuk tim yang berkembang. Multi-user,
                permission berbasis peran, dan aktivitas log real-time agar
                semua anggota tim tetap sinkron.
              </p>
              <ul className="flex flex-col gap-3 mb-8 list-none">
                {[
                  "Akses multi-pengguna dengan level permission",
                  "Notifikasi real-time untuk setiap perubahan stok",
                  "Log aktivitas lengkap untuk audit trail",
                  "Dashboard personal per departemen"
                ].map((li) => (
                  <li
                    key={li}
                    className="flex items-start gap-3 text-sm text-gray-700 leading-normal font-semibold"
                  >
                    <span
                      className="w-5 h-5 rounded-full shrink-0 mt-0.5 bg-linear-to-br from-brand-700 to-brand-500 bg-no-repeat bg-center"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 6l2.5 2.5L10 3' stroke='white' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E'), linear-gradient(135deg, #1e3a8a, #3b82f6)"
                      }}
                    />
                    {li}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-brand-500 text-white text-sm font-extrabold no-underline shadow-[0_8px_24px_rgba(59,130,246,.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(59,130,246,.45)] hover:bg-brand-600"
              >
                Coba Sekarang
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
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="product" className="px-8 py-25 bg-bg-app">
        <div className="max-w-300 mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.25 mb-4 bg-brand-500/10">
            <span className="text-brand-700 text-xs font-extrabold tracking-wide uppercase">
              Fitur Unggulan
            </span>
          </div>
          <h2 className="font-black text-[clamp(28px,4vw,42px)] text-slate-900 tracking-tight leading-tight mb-3">
            Semua yang Kamu
            <br />
            <em className="not-italic text-brand-700">Butuhkan</em> Ada di Sini
          </h2>
          <p className="text-slate-500 text-base leading-relaxed max-w-125 mb-14 font-medium">
            Platform lengkap untuk manajemen inventori bisnis kecil hingga
            menengah.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-white border-[1.5px] border-slate-200 rounded-[18px] p-8 cursor-default transition-all duration-250 animate-slide-in-up hover:border-brand-500 hover:shadow-[0_8px_32px_rgba(59,130,246,.12)] hover:-translate-y-1 group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-[14px] flex items-center justify-center text-brand-700 mb-5 transition-colors bg-linear-to-br from-brand-700/8 to-brand-500/12 group-hover:from-brand-700/15 group-hover:to-brand-500/20">
                  {f.icon}
                </div>
                <h3 className="font-black text-[17px] text-slate-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-slate-500 text-sm leading-[1.65] font-medium">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHOTO SECTION 2 ── */}
      <section className="px-8 py-25 bg-bg-app">
        <div className="max-w-300 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 items-center [direction:ltr]">
            <div className="md:order-2 md:pl-4">
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.25 mb-4 bg-brand-500/10">
                <span className="text-brand-700 text-xs font-extrabold tracking-wide uppercase">
                  Smart Analytics
                </span>
              </div>
              <h2 className="font-black text-[clamp(26px,3.5vw,38px)] text-slate-900 tracking-tight leading-tight mb-4">
                Data Driven,{" "}
                <em className="not-italic text-brand-700">
                  Keputusan Lebih Tepat
                </em>
              </h2>
              <p className="text-slate-500 text-[15px] leading-[1.75] font-medium mb-7">
                Laporan otomatis, grafik tren stok, dan insight produk terlaris
                membantu kamu mengambil keputusan bisnis berdasarkan data nyata,
                bukan intuisi.
              </p>
              <ul className="flex flex-col gap-3 mb-8 list-none">
                {[
                  "Laporan stok harian, mingguan, dan bulanan",
                  "Analisis produk terlaris & slow-moving",
                  "Forecast kebutuhan stok otomatis",
                  "Export laporan ke Excel & PDF"
                ].map((li) => (
                  <li
                    key={li}
                    className="flex items-start gap-3 text-sm text-gray-700 leading-normal font-semibold"
                  >
                    <span
                      className="w-5 h-5 rounded-full shrink-0 mt-0.5 bg-no-repeat bg-center"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 6l2.5 2.5L10 3' stroke='white' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E'), linear-gradient(135deg, #1e3a8a, #3b82f6)"
                      }}
                    />
                    {li}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-brand-500 text-white text-sm font-extrabold no-underline shadow-[0_8px_24px_rgba(59,130,246,.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(59,130,246,.45)] hover:bg-brand-600"
              >
                Lihat Demo
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
              </Link>
            </div>
            <div className="md:order-1 relative rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,.12)] animate-slide-in-up group">
              <img
                src={IMG2}
                alt="Analytics dashboard inventori"
                className="w-full h-95 object-cover block transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(30,58,138,.15)_0%,transparent_50%)]" />
              <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,.1)]">
                <div className="font-black text-xl text-brand-700">
                  Real-Time
                </div>
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">
                  Analytics
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT TABLE ── */}
      <div className="px-8 pb-25">
        <div className="max-w-300 mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.25 mb-4 bg-brand-500/10">
                <span className="text-brand-700 text-xs font-extrabold tracking-wide uppercase">
                  Produk
                </span>
              </div>
              <h2 className="font-black text-[clamp(28px,4vw,42px)] text-slate-900 tracking-tight leading-tight">
                Contoh Data{" "}
                <em className="not-italic text-brand-700">Inventori</em>
              </h2>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center h-11 px-6 rounded-[10px] text-sm font-extrabold no-underline bg-brand-500 text-white shadow-[0_4px_12px_rgba(59,130,246,.35)]"
            >
              Kelola Sekarang →
            </Link>
          </div>

          <div className="bg-white border-[1.5px] border-slate-200 rounded-[18px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,.04)] animate-slide-in-up">
            <table className="w-full border-collapse">
              <thead className="bg-linear-to-br from-brand-900 to-brand-700">
                <tr>
                  <th className="text-left px-5 py-4 text-[11px] font-extrabold text-white/80 tracking-widest uppercase">
                    Nama Produk
                  </th>
                  <th className="text-left px-5 py-4 text-[11px] font-extrabold text-white/80 tracking-widest uppercase">
                    Kategori
                  </th>
                  <th className="text-left px-5 py-4 text-[11px] font-extrabold text-white/80 tracking-widest uppercase">
                    Stok
                  </th>
                  <th className="text-left px-5 py-4 text-[11px] font-extrabold text-white/80 tracking-widest uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map((p, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-100 last:border-none transition-colors hover:bg-[#f8faff]"
                  >
                    <td className="px-5 py-4 text-sm">
                      <div className="font-extrabold text-slate-900">
                        {p.name}
                      </div>
                      <div className="text-xs text-slate-400 font-semibold mt-0.5">
                        {p.sku}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-slate-500 font-medium">
                      {p.cat}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span
                        className={cn(
                          "font-black text-[15px]",
                          STOCK_COLOR(p.stock)
                        )}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span
                        className={cn(
                          "inline-block text-[11px] font-extrabold px-3 py-1 rounded-full",
                          STATUS_STYLES[p.status]
                        )}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section id="about" className="px-8 pb-25">
        <div className="relative overflow-hidden max-w-300 mx-auto rounded-[28px] px-9 md:px-16 py-14 md:py-18 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center bg-[linear-gradient(145deg,#060b1a,#0c1733,#1e3a8a)]">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }}
          />
          <div className="relative z-1">
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.25 mb-4 bg-white/12">
              <span className="text-brand-300 text-xs font-extrabold tracking-wide uppercase">
                Tentang Kami
              </span>
            </div>
            <h2 className="font-black text-[clamp(26px,3.5vw,38px)] text-white tracking-tight mb-4">
              Dibangun untuk Bisnis yang Terus Berkembang
            </h2>
            <p className="text-white/70 text-[15px] leading-[1.8] font-medium mb-8">
              STOCKR lahir dari kebutuhan nyata para pebisnis Indonesia yang
              kesulitan memantau stok secara akurat. Kami menghadirkan solusi
              yang sederhana, cepat, dan dapat diandalkan.
            </p>
            <div className="flex gap-2.5 flex-wrap">
              {[
                "Mudah Digunakan",
                "Cloud-Based",
                "Realtime Sync",
                "Multi Pengguna"
              ].map((c) => (
                <span
                  key={c}
                  className="bg-white/10 border border-white/18 rounded-full px-4 py-1.5 text-white/85 text-[13px] font-bold"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="relative z-1 grid grid-cols-2 gap-4">
            {[
              { v: "500+", l: "Bisnis Aktif" },
              { v: "2M+", l: "Produk Dikelola" },
              { v: "99.9%", l: "Uptime" },
              { v: "24/7", l: "Support" }
            ].map((c) => (
              <div
                key={c.l}
                className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6"
              >
                <div className="font-black text-[28px] text-white tracking-tight">
                  {c.v}
                </div>
                <div className="text-white/50 text-xs font-bold mt-1.5 tracking-wide uppercase">
                  {c.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-8 py-10 text-center bg-[linear-gradient(135deg,#050a14_0%,#0c1733_50%,#080d1f_100%)]">
        <div className="font-black text-[22px] text-white tracking-wide mb-2">
          STOCK<em className="not-italic text-brand-400">R</em>
        </div>
        <div className="text-white/35 text-[13px] font-semibold">
          © 2026 STOCKR · Inventory Management System
        </div>
      </footer>
      <CSChatWidget />
    </>
  )
}
