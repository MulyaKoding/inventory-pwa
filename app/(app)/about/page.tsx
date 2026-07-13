"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import CSChatWidget from "../components/CSChatWidget"
import { cn } from "../../lib/utils"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/product" },
  { label: "About Us", href: "/about" }
]

const TEAM = [
  {
    name: "Rahmat Mulya Simanjuntak",
    role: "Founder & CEO",
    initials: "RM",
    color: "#1e3a8a",
    desc: "Berpengalaman 8 tahun di bidang supply chain dan pengembangan sistem ERP untuk UKM Indonesia."
  },
  {
    name: "Siti Rahayu",
    role: "Lead Developer",
    initials: "SR",
    color: "#1d4ed8",
    desc: "Full-stack engineer dengan spesialisasi di sistem inventori real-time dan integrasi marketplace."
  },
  {
    name: "Budi Santoso",
    role: "Product Designer",
    initials: "BS",
    color: "#2563eb",
    desc: "UX/UI designer yang fokus pada kemudahan penggunaan sistem manajemen untuk bisnis lokal."
  },
  {
    name: "Dewi Lestari",
    role: "Customer Success",
    initials: "DL",
    color: "#0c1a3a",
    desc: "Membantu ratusan bisnis beralih dari pencatatan manual ke sistem digital dengan lancar."
  },
  {
    name: "Sinta Dwi",
    role: "UI UX Designer",
    initials: "SD",
    color: "#1d4ed8",
    desc: "Membantu ratusan bisnis beralih dari pencatatan manual ke sistem digital dengan lancar."
  },
  {
    name: "Budi Setiawan",
    role: "Frontend Engineer",
    initials: "BS",
    color: "#1d4ed8",
    desc: "Membantu ratusan bisnis beralih dari pencatatan manual ke sistem digital dengan lancar."
  },
  {
    name: "Setiawan Bimo",
    role: "Backend Engineer",
    initials: "SB",
    color: "#2563eb",
    desc: "Membantu ratusan bisnis beralih dari pencatatan manual ke sistem digital dengan lancar."
  },
  {
    name: "Nanda Pratiwi",
    role: "Business Analyst",
    initials: "NP",
    color: "#0c1a3a",
    desc: "Membantu ratusan bisnis beralih dari pencatatan manual ke sistem digital dengan lancar."
  }
]

const TIMELINE = [
  {
    year: "2022",
    title: "Ide Lahir",
    desc: "STOCKR dimulai dari frustrasi nyata: pemilik toko yang masih catat stok di buku tulis."
  },
  {
    year: "2023",
    title: "Versi Beta",
    desc: "Diluncurkan ke 50 pengguna awal. Feedback luar biasa mendorong kami untuk terus berkembang."
  },
  {
    year: "2024",
    title: "Skalabilitas",
    desc: "Sistem diperbarui untuk mendukung multi-gudang dan integrasi dengan marketplace populer."
  },
  {
    year: "2025",
    title: "500+ Bisnis",
    desc: "Lebih dari 500 bisnis aktif mempercayakan manajemen inventori mereka kepada STOCKR."
  },
  {
    year: "2026",
    title: "Masa Depan",
    desc: "AI-powered forecasting dan otomatisasi pemesanan stok hadir untuk pengguna STOCKR."
  }
]

const VALUES = [
  {
    icon: (
      <svg viewBox="0 0 48 48" width="28" height="28" fill="none">
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d="M16 24l6 6 10-10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Kepercayaan",
    desc: "Data bisnis kamu aman dan akurat. Kami tidak pernah berkompromi soal integritas data."
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" width="28" height="28" fill="none">
        <path
          d="M24 8v6M24 34v6M8 24h6M34 24h6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx="24"
          cy="24"
          r="10"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <circle cx="24" cy="24" r="3" fill="currentColor" />
      </svg>
    ),
    title: "Kesederhanaan",
    desc: "Sistem powerful tidak harus rumit. Kami rancang STOCKR agar bisa dipakai siapa saja."
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" width="28" height="28" fill="none">
        <path
          d="M10 38V24l14-16 14 16v14"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M18 38v-8h12v8"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle
          cx="36"
          cy="14"
          r="6"
          fill="#3b82f6"
          stroke="white"
          strokeWidth="2"
        />
        <path
          d="M33.5 14l1.5 1.5 3-3"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Pertumbuhan",
    desc: "Kami tumbuh bersama bisnis kamu. Fitur kami berkembang sesuai kebutuhan nyata pengguna."
  }
]

// Global bits that Tailwind can't express through className alone:
// the Nunito import, the base font-family/scroll-behavior, and the
// custom @keyframes referenced below via `animate-[name_...]` utilities.
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
  html { scroll-behavior: smooth; }
  body { font-family: 'Nunito', sans-serif; -webkit-font-smoothing: antialiased; }

  @keyframes navSlide   { from{opacity:0;transform:translateY(-100%)} to{opacity:1;transform:translateY(0)} }
  @keyframes menuIn     { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideInLeft  { from{opacity:0;transform:translateX(-50px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideInRight { from{opacity:0;transform:translateX(50px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideInUp    { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
  @keyframes gridPan      { from{background-position:0 0} to{background-position:48px 48px} }
  @keyframes floatY       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes pulse-ring   { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.7);opacity:0} }
  @keyframes border-rotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes countUp      { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`

export default function AboutPage() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      <div className="bg-[#f0f6ff] text-[#0f172a] overflow-x-hidden">
        {/* NAV */}
        <nav
          className={cn(
            "fixed inset-x-0 top-0 z-[100] transition-[background,box-shadow] duration-300 animate-[navSlide_0.4s_ease_forwards]",
            scrolled &&
              "bg-[rgba(8,12,24,0.96)] backdrop-blur-[18px] shadow-[0_1px_0_rgba(255,255,255,0.06),0_4px_20px_rgba(0,0,0,0.4)]"
          )}
        >
          <div className="max-w-[1200px] mx-auto flex items-center justify-between px-8 max-[768px]:px-5 h-[70px]">
            <Link href="/" className="flex items-center gap-3 no-underline">
              <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] flex items-center justify-center shadow-[0_4px_14px_rgba(59,130,246,0.4)]">
                <span className="text-white font-extrabold text-[11px] tracking-[0.05em]">
                  INV
                </span>
              </div>
              <span className="font-extrabold text-xl tracking-[0.07em] text-white">
                STOCK<em className="not-italic text-[#3b82f6]">R</em>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-[2px]">
              {NAV_LINKS.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  className={cn(
                    "px-5 py-[9px] rounded-lg text-[15px] no-underline transition-all duration-200 hover:text-white hover:bg-white/10",
                    scrolled ? "text-white/75" : "text-white/[.83]",
                    n.label === "About Us"
                      ? cn(
                          "font-bold",
                          scrolled ? "text-[#60a5fa]" : "text-white"
                        )
                      : "font-semibold"
                  )}
                >
                  {n.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className={cn(
                  "h-[42px] px-[22px] rounded-[10px] text-[15px] font-bold no-underline flex items-center shadow-[0_4px_12px_rgba(0,0,0,0.13)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(0,0,0,0.18)] max-[768px]:hidden",
                  scrolled
                    ? "bg-[#3b82f6] text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)] hover:bg-[#2563eb]"
                    : "bg-white text-[#1e3a8a]"
                )}
              >
                Login
              </Link>
              <button
                className="hidden max-[768px]:flex flex-col gap-[5px] cursor-pointer p-1.5 bg-transparent border-none"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="menu"
              >
                <span
                  className={cn(
                    "block w-[22px] h-0.5 bg-white rounded-sm transition-all duration-300",
                    menuOpen && "rotate-45 translate-x-[5px] translate-y-[5px]"
                  )}
                />
                <span
                  className={cn(
                    "block w-[22px] h-0.5 bg-white rounded-sm transition-all duration-300",
                    menuOpen && "opacity-0"
                  )}
                />
                <span
                  className={cn(
                    "block w-[22px] h-0.5 bg-white rounded-sm transition-all duration-300",
                    menuOpen &&
                      "-rotate-45 translate-x-[5px] -translate-y-[5px]"
                  )}
                />
              </button>
            </div>
          </div>

          <div
            className={cn(
              "hidden absolute top-[70px] inset-x-0 bg-white/[.97] backdrop-blur-[20px] border-b border-[rgba(59,130,246,0.1)] px-5 pt-3 pb-5 shadow-[0_12px_32px_rgba(0,0,0,0.08)] animate-[menuIn_0.2s_ease_forwards]",
              menuOpen && "block"
            )}
          >
            {NAV_LINKS.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className={cn(
                  "block px-4 py-[13px] rounded-[10px] text-[15px] font-semibold no-underline mb-1 transition-all duration-200 hover:text-[#1e3a8a] hover:bg-[rgba(59,130,246,0.08)]",
                  n.label === "About Us"
                    ? "text-[#1e3a8a] bg-[rgba(59,130,246,0.08)]"
                    : "text-gray-700"
                )}
                onClick={() => setMenuOpen(false)}
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="mt-3 w-full h-12 bg-[#3b82f6] text-white rounded-[10px] text-[15px] font-bold cursor-pointer no-underline flex items-center justify-center"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="min-h-[80vh] relative overflow-hidden bg-[linear-gradient(160deg,#060b1a_0%,#0c1733_30%,#0f2050_60%,#1e3a8a_100%)] flex items-center px-8 pt-[120px] pb-20 max-[768px]:px-5 max-[768px]:pt-[100px] max-[768px]:pb-[60px]">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:48px_48px] animate-[gridPan_10s_linear_infinite]" />
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.2)_0%,transparent_65%)] pointer-events-none" />
          <div className="absolute -bottom-[60px] -left-[60px] w-[340px] h-[340px] rounded-full bg-[radial-gradient(circle,rgba(30,58,138,0.15)_0%,transparent_70%)] pointer-events-none" />

          <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-[72px] max-[960px]:gap-12 items-center relative z-[1]">
            <div className="animate-[slideInLeft_0.7s_ease_forwards]">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-[7px] mb-6 relative overflow-hidden isolate bg-white/[.08] backdrop-blur-[8px] before:content-[''] before:absolute before:-inset-[45px] before:rounded-[80px] before:bg-[conic-gradient(from_0deg,transparent_0%,transparent_80%,#60a5fa_88%,#93c5fd_92%,#60a5fa_96%,transparent_100%)] before:animate-[border-rotate_2.4s_linear_infinite] before:z-[-2] after:content-[''] after:absolute after:inset-[1.5px] after:rounded-full after:bg-[rgba(8,14,36,0.85)] after:backdrop-blur-[8px] after:z-[-1]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] relative flex-shrink-0 after:content-[''] after:absolute after:-inset-[3px] after:rounded-full after:bg-[rgba(96,165,250,0.4)] after:animate-[pulse-ring_1.5s_ease-out_infinite]" />
                <span className="text-white/90 text-xs tracking-[0.04em]">
                  Tentang STOCKR
                </span>
              </div>

              <h1 className="font-extrabold text-[clamp(36px,5vw,56px)] leading-[1.1] text-white tracking-[-0.02em] mb-5">
                Kami Hadir untuk
                <br />
                <em className="not-italic text-[#60a5fa]">Bisnis Indonesia</em>
              </h1>
              <p className="text-white/70 text-[17px] leading-[1.75] mb-9 max-w-[460px]">
                STOCKR lahir dari satu misi sederhana: membantu pebisnis
                Indonesia kelola stok dengan mudah, akurat, dan efisien — tanpa
                ribet, tanpa buku catatan.
              </p>

              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/register"
                  className="h-[52px] px-7 bg-[#3b82f6] text-white border-none rounded-xl text-[15px] font-bold cursor-pointer no-underline inline-flex items-center gap-2 shadow-[0_8px_24px_rgba(59,130,246,0.4)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(59,130,246,0.5)]"
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
                  href="#contact"
                  className="h-[52px] px-7 bg-white/[.08] text-white border-[1.5px] border-white/20 rounded-xl text-[15px] font-bold cursor-pointer no-underline inline-flex items-center backdrop-blur-[8px] transition-colors duration-200 hover:bg-white/[.14]"
                >
                  Hubungi Kami
                </a>
              </div>
            </div>

            {/* Mission floating card */}
            <div className="order-first md:order-none animate-[slideInRight_0.7s_ease_0.1s_both]">
              <div className="bg-white/5 backdrop-blur-[20px] border border-white/[.12] rounded-3xl p-9 animate-[floatY_5s_ease-in-out_infinite] shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em] mb-3.5">
                  Misi Kami
                </div>
                <p className="text-[17px] text-white leading-[1.7] font-semibold mb-6">
                  Menghadirkan{" "}
                  <em className="not-italic text-[#60a5fa]">
                    teknologi inventori kelas dunia
                  </em>{" "}
                  yang bisa diakses oleh setiap pelaku usaha di Indonesia — dari
                  warung hingga warehouse.
                </p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    "Mudah Digunakan",
                    "Cloud-Based",
                    "Realtime Sync",
                    "Multi Pengguna",
                    "Data Aman"
                  ].map((c) => (
                    <span
                      key={c}
                      className="bg-white/[.08] border border-white/[.15] rounded-full px-3.5 py-[5px] text-white/80 text-xs font-semibold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS STRIP */}
        <div className="bg-white border-y border-[#e2e8f0]">
          <div className="max-w-[1200px] mx-auto grid grid-cols-4 max-[960px]:grid-cols-2">
            {[
              { v: "500+", l: "Bisnis Aktif" },
              { v: "2M+", l: "Produk Dikelola" },
              { v: "99.9%", l: "Uptime" },
              { v: "2022", l: "Tahun Berdiri" }
            ].map((s, i) => (
              <div
                key={i}
                className={cn(
                  "px-8 py-9 border-r border-[#e2e8f0] animate-[countUp_0.6s_ease_both] last:border-r-0",
                  i === 1 && "max-[960px]:border-r-0"
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="font-extrabold text-[38px] text-[#1e3a8a] tracking-[-0.03em] leading-none">
                  {s.v}
                </div>
                <div className="text-[#64748b] text-[13px] font-semibold mt-1.5 uppercase tracking-[0.05em]">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VALUES & STORY */}
        <section className="px-8 py-[100px] max-[768px]:px-5 max-[768px]:py-[72px] bg-[#f0f6ff]">
          <div className="max-w-[1200px] mx-auto">
            <div className="inline-flex items-center gap-2 bg-[rgba(59,130,246,0.1)] rounded-full px-3.5 py-[5px] mb-3.5 mt-3">
              <span className="text-[#1e3a8a] text-xs font-bold uppercase tracking-[0.05em]">
                Nilai Kami
              </span>
            </div>
            <h2 className="font-extrabold text-[clamp(28px,4vw,42px)] text-[#0f172a] tracking-[-0.02em] leading-[1.2] mb-3">
              Prinsip yang Membentuk{" "}
              <em className="not-italic text-[#1e3a8a]">STOCKR</em>
            </h2>
            <p className="text-[#64748b] text-base leading-[1.65] max-w-[500px] mb-14">
              Setiap keputusan produk kami berakar dari tiga nilai utama ini.
            </p>

            <div className="grid grid-cols-3 max-[960px]:grid-cols-1 gap-5 mb-[72px]">
              {VALUES.map((v, i) => (
                <div
                  key={i}
                  className="bg-white border-[1.5px] border-[#e2e8f0] rounded-[18px] p-[30px] transition-[border-color,box-shadow,transform] duration-[250ms] hover:border-[#3b82f6] hover:shadow-[0_8px_32px_rgba(59,130,246,0.12)] hover:-translate-y-1"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[rgba(30,58,138,0.08)] to-[rgba(59,130,246,0.12)] flex items-center justify-center text-[#1e3a8a] mb-[18px]">
                    {v.icon}
                  </div>
                  <h3 className="font-extrabold text-[17px] text-[#0f172a] mb-2">
                    {v.title}
                  </h3>
                  <p className="text-[#64748b] text-sm leading-[1.65]">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="inline-flex items-center gap-2 bg-[rgba(59,130,246,0.1)] rounded-full px-3.5 py-[5px] mb-3.5 mt-3">
              <span className="text-[#1e3a8a] text-xs font-bold uppercase tracking-[0.05em]">
                Perjalanan Kami
              </span>
            </div>
            <h2 className="font-extrabold text-[clamp(28px,4vw,42px)] text-[#0f172a] tracking-[-0.02em] leading-[1.2] mb-3">
              Dari Ide ke{" "}
              <em className="not-italic text-[#1e3a8a]">Kenyataan</em>
            </h2>
            <p className="text-[#64748b] text-base leading-[1.65] max-w-[500px] mb-14">
              Perjalanan STOCKR membangun solusi inventori terpercaya untuk
              Indonesia.
            </p>

            <div className="relative">
              <div className="absolute left-20 max-[768px]:left-[60px] top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-[#3b82f6] to-[rgba(59,130,246,0.1)]" />
              {TIMELINE.map((t, i) => (
                <div
                  key={i}
                  className="flex gap-8 items-start mb-9 relative animate-[slideInLeft_0.6s_ease_both]"
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  <div className="w-20 max-[768px]:w-[60px] flex-shrink-0 text-right pr-5 pt-1 font-bold text-sm max-[768px]:text-xs text-[#3b82f6]">
                    {t.year}
                  </div>
                  <div className="relative z-[1] flex-shrink-0 flex items-center justify-center mt-1">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6] shadow-[0_0_0_4px_rgba(59,130,246,0.15)]" />
                  </div>
                  <div className="flex-1 bg-white border-[1.5px] border-[#e2e8f0] rounded-2xl px-6 py-5 transition-[border-color,box-shadow] duration-[250ms] hover:border-[#3b82f6] hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)]">
                    <div className="font-extrabold text-base text-[#0f172a] mb-[5px]">
                      {t.title}
                    </div>
                    <div className="text-[#64748b] text-sm leading-[1.6]">
                      {t.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TEAM */}
        <section className="px-8 pt-0 pb-[100px] max-[768px]:px-5 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <div className="inline-flex items-center gap-2 bg-[rgba(59,130,246,0.1)] rounded-full px-3.5 py-[5px] mb-3.5 mt-3">
              <span className="text-[#1e3a8a] text-xs font-bold uppercase tracking-[0.05em]">
                Tim Kami
              </span>
            </div>
            <h2 className="font-extrabold text-[clamp(28px,4vw,42px)] text-[#0f172a] tracking-[-0.02em] leading-[1.2] mb-3">
              Orang-Orang di Balik{" "}
              <em className="not-italic text-[#1e3a8a]">STOCKR</em>
            </h2>
            <p className="text-[#64748b] text-base leading-[1.65] max-w-[500px] mb-14">
              Tim kecil dengan semangat besar untuk transformasi digital bisnis
              Indonesia.
            </p>

            <div className="grid grid-cols-4 max-[960px]:grid-cols-2 max-[480px]:grid-cols-1 gap-5">
              {TEAM.map((m, i) => (
                <div
                  key={i}
                  className="bg-white border-[1.5px] border-[#e2e8f0] rounded-[18px] px-[22px] py-7 text-center transition-[border-color,box-shadow,transform] duration-[250ms] hover:border-[#3b82f6] hover:shadow-[0_8px_32px_rgba(59,130,246,0.12)] hover:-translate-y-1 animate-[slideInUp_0.6s_ease_both]"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div
                    className="w-[72px] h-[72px] rounded-2xl mx-auto mb-4 flex items-center justify-center font-extrabold text-lg text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
                    style={{
                      background: `linear-gradient(135deg, ${m.color}, #3b82f6)`
                    }}
                  >
                    {m.initials}
                  </div>
                  <div className="font-extrabold text-[15px] text-[#0f172a] mb-1">
                    {m.name}
                  </div>
                  <div className="text-[11px] font-bold text-[#3b82f6] uppercase tracking-[0.05em] mb-3">
                    {m.role}
                  </div>
                  <p className="text-[#64748b] text-[13px] leading-[1.6]">
                    {m.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section
          id="contact"
          className="px-8 pb-[100px] max-[768px]:px-5 max-[768px]:pb-[72px]"
        >
          <div className="max-w-[1200px] mx-auto bg-[linear-gradient(145deg,#060b1a,#0c1733,#1e3a8a)] rounded-[28px] px-16 py-[72px] max-[960px]:px-9 max-[960px]:py-12 grid grid-cols-1 md:grid-cols-2 gap-16 max-[960px]:gap-10 items-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:40px_40px]" />

            <div className="relative z-[1]">
              <div className="inline-flex items-center gap-2 bg-white/[.12] rounded-full px-3.5 py-[5px] mb-4">
                <span className="text-[#93c5fd] text-xs font-bold uppercase tracking-[0.05em]">
                  Hubungi Kami
                </span>
              </div>
              <h2 className="font-extrabold text-[clamp(26px,3.5vw,38px)] text-white tracking-[-0.02em] mb-3.5">
                Ada Pertanyaan?
                <br />
                Kami Siap{" "}
                <em className="not-italic text-[#60a5fa]">Membantu</em>
              </h2>
              <p className="text-white/70 text-[15px] leading-[1.75] mb-2">
                Tim kami siap membantu kamu memulai atau menjawab pertanyaan
                seputar STOCKR. Jangan ragu untuk menghubungi kami.
              </p>
              <p className="text-white/45 text-[13px] leading-[1.75] mt-2">
                Jam operasional: Senin – Jumat, 08.00 – 17.00 WIB
              </p>
            </div>

            <div className="relative z-[1] flex flex-col gap-3.5">
              {/* WhatsApp */}
              <a
                href="https://wa.me/6285218789439"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-black/20 backdrop-blur-[12px] border border-white/10 rounded-2xl px-6 py-5 no-underline transition-[background,border-color,transform] duration-200 hover:bg-black/[.32] hover:border-white/[.22] hover:translate-x-1"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
                      fill="#60a5fa"
                    />
                    <path
                      d="M12 2C6.477 2 2 6.477 2 12c0 1.89.524 3.656 1.435 5.163L2 22l4.978-1.405A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
                      stroke="rgba(255,255,255,.35)"
                      strokeWidth="1.5"
                      fill="none"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.07em] mb-1">
                    WhatsApp
                  </div>
                  <div className="text-white font-bold text-base">
                    +62 852-1878-9439
                  </div>
                </div>
                <div className="ml-auto text-white/30">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:+6285218789439"
                className="flex items-center gap-4 bg-black/20 backdrop-blur-[12px] border border-white/10 rounded-2xl px-6 py-5 no-underline transition-[background,border-color,transform] duration-200 hover:bg-black/[.32] hover:border-white/[.22] hover:translate-x-1"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.07em] mb-1">
                    Telepon
                  </div>
                  <div className="text-white font-bold text-base">
                    +62 852-1878-9439
                  </div>
                </div>
                <div className="ml-auto text-white/30">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:hello@stockr.id"
                className="flex items-center gap-4 bg-black/20 backdrop-blur-[12px] border border-white/10 rounded-2xl px-6 py-5 no-underline transition-[background,border-color,transform] duration-200 hover:bg-black/[.32] hover:border-white/[.22] hover:translate-x-1"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.07em] mb-1">
                    Email
                  </div>
                  <div className="text-white font-bold text-base">
                    hello@stockr.id
                  </div>
                </div>
                <div className="ml-auto text-white/30">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-[linear-gradient(135deg,#050a14_0%,#0c1733_50%,#080d1f_100%)] px-8 py-10 text-center">
          <div className="font-extrabold text-[22px] text-white tracking-[0.07em] mb-2">
            STOCK<em className="not-italic text-[#60a5fa]">R</em>
          </div>
          <div className="text-white/30 text-[13px] font-medium">
            © 2026 STOCKR · Inventory Management System
          </div>
        </footer>
        <CSChatWidget />
      </div>
    </>
  )
}
