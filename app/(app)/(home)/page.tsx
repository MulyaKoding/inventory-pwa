"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Product", href: "#product" },
  { label: "About Us", href: "#about" }
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
          fill="#0fbf9f"
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

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [activeNav, setActiveNav] = useState("Home")
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const statusColor = (s: string) =>
    s === "Aman" ? "#087463" : s === "Menipis" ? "#f59e0b" : "#ef4444"
  const statusBg = (s: string) =>
    s === "Aman"
      ? "rgba(8,116,99,.1)"
      : s === "Menipis"
        ? "rgba(245,158,11,.1)"
        : "rgba(239,68,68,.1)"

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f0faf7; color: #0f172a; overflow-x: hidden; }

        /* ── SLIDE-IN PAGE TRANSITIONS ── */
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes floatY {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-12px); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: .6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridPan {
          from { background-position: 0 0; }
          to   { background-position: 48px 48px; }
        }
        @keyframes navSlide {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mobileMenuIn {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── NAVBAR ── */
        .hm-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          transition: background .3s, box-shadow .3s, backdrop-filter .3s;
          animation: navSlide .5s ease forwards;
        }
        .hm-nav.scrolled {
          background: rgba(255,255,255,.92);
          backdrop-filter: blur(16px);
          box-shadow: 0 1px 0 rgba(0,0,0,.08), 0 4px 24px rgba(8,116,99,.06);
        }
        .hm-nav-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; height: 68px;
        }
        .hm-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .hm-logo-box {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #087463, #0fbf9f);
          border-radius: 9px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(8,116,99,.3);
        }
        .hm-logo-box span { color: #fff; font-family: 'DM Mono', monospace; font-weight: 700; font-size: 12px; letter-spacing: .05em; }
        .hm-logo-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; letter-spacing: .06em; color: #0f172a; }
        .hm-logo-dot { color: #087463; }

        .hm-nav-links { display: flex; align-items: center; gap: 4px; }
        .hm-nav-link {
        padding: 8px 18px; border-radius: 8px;
        font-size: 14px; font-weight: 600; color: rgba(255,255,255,.8);
        text-decoration: none; cursor: pointer;
        transition: color .2s, background .2s;
        border: none; background: none;
        }
        .hm-nav-link:hover { color: #fff; background: rgba(255,255,255,.1); }
        .hm-nav-link.active { color: #fff; background: none; }

        /* Saat scrolled — navbar putih, link jadi gelap */
        .hm-nav.scrolled .hm-nav-link { color: #475569; }
        .hm-nav.scrolled .hm-nav-link:hover { color: #087463; background: rgba(8,116,99,.07); }
        .hm-nav.scrolled .hm-nav-link.active { color: #087463; background: none; }

        .hm-nav-cta {
          display: flex; align-items: center; gap: 12px;
        }
        .hm-btn-login {
        height: 40px; padding: 0 22px;
        background: #fff; color: #087463;
        border: none; border-radius: 9px;
        font-size: 14px; font-weight: 700;
        font-family: 'Plus Jakarta Sans', sans-serif;
        cursor: pointer; text-decoration: none;
        display: flex; align-items: center;
        transition: background .2s, transform .15s, box-shadow .2s, color .2s;
        box-shadow: 0 4px 12px rgba(0,0,0,.15);
        }
        .hm-btn-login:hover { background: #f0faf7; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,.18); }

        /* Saat navbar sudah scroll (background putih), button balik ke hijau */
        .hm-nav.scrolled .hm-btn-login {
        background: #087463; color: #fff;
        box-shadow: 0 4px 12px rgba(8,116,99,.3);
        }
        .hm-nav.scrolled .hm-btn-login:hover { background: #065a4d; box-shadow: 0 6px 20px rgba(8,116,99,.35); }

        /* Hamburger */
        .hm-hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 6px; background: none; border: none; }
        .hm-hamburger span { display: block; width: 22px; height: 2px; background: #0f172a; border-radius: 2px; transition: all .3s; }
        .hm-hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .hm-hamburger.open span:nth-child(2) { opacity: 0; }
        .hm-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

        .hm-mobile-menu {
          display: none; position: absolute; top: 68px; left: 0; right: 0;
          background: rgba(255,255,255,.97); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(8,116,99,.1);
          padding: 12px 20px 20px;
          animation: mobileMenuIn .25s ease forwards;
          box-shadow: 0 12px 32px rgba(0,0,0,.08);
        }
        .hm-mobile-menu.open { display: block; }
        .hm-mobile-link {
          display: block; padding: 13px 16px; border-radius: 10px;
          font-size: 15px; font-weight: 600; color: #374151;
          text-decoration: none; margin-bottom: 4px;
          transition: color .2s, background .2s;
          border: none; background: none; width: 100%; text-align: left; cursor: pointer;
        }
        .hm-mobile-link:hover, .hm-mobile-link.active { color: #087463; background: rgba(8,116,99,.08); }
        .hm-mobile-login {
          display: block; margin-top: 12px; width: 100%; height: 48px;
          background: #087463; color: #fff; border: none; border-radius: 10px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; text-decoration: none;
          display: flex; align-items: center; justify-content: center;
        }

        /* ── HERO ── */
        .hm-hero {
          min-height: 100vh; position: relative; overflow: hidden;
          background: linear-gradient(160deg, #054d42 0%, #087463 45%, #0a9c84 75%, #0fbf9f 100%);
          display: flex; align-items: center; padding: 100px 32px 60px;
        }
        .hm-hero-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: gridPan 8s linear infinite;
          pointer-events: none;
        }
        .hm-hero-glow {
          position: absolute; top: -120px; right: -120px;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(15,191,159,.3) 0%, transparent 70%);
          pointer-events: none;
        }
        .hm-hero-glow2 {
          position: absolute; bottom: -80px; left: -80px;
          width: 380px; height: 380px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .hm-hero-inner {
          max-width: 1200px; margin: 0 auto; width: 100%;
          display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
          position: relative; z-index: 1;
        }
        .hm-hero-left { animation: slideInLeft .7s ease forwards; }
       @keyframes border-rotate {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
        }
        .hm-hero-tag {
        display: inline-flex; align-items: center; gap: 8px;
        background: rgba(255,255,255,.12); backdrop-filter: blur(8px);
        border-radius: 100px;
        padding: 7px 16px; margin-bottom: 24px;
        position: relative; overflow: hidden; isolation: isolate;
        }
        .hm-hero-tag::before {
          content: '';
          position: absolute; inset: -45px; border-radius: 80px;
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            transparent 80%,
            #c0c0c0 88%,
            #f0f0f0 92%,
            #c0c0c0 96%,
            transparent 100%
          );
          animation: border-rotate 2.4s linear infinite;
          z-index: -2;
        }
        .hm-hero-tag::after {
        content: '';
        position: absolute; inset: 1.5px; border-radius: 100px;
        background: rgba(5, 77, 66, 0.85); backdrop-filter: blur(8px);
        z-index: -1;
        }
        .hm-hero-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #0fbf9f; position: relative; }
        .hm-hero-tag-dot::after {
          content: ''; position: absolute; inset: -3px; border-radius: 50%;
          background: rgba(15,191,159,.4); animation: pulse-ring 1.5s ease-out infinite;
        }
        .hm-hero-tag span { color: rgba(255,255,255,.9); font-size: 12px; font-family: 'DM Mono', monospace; letter-spacing: .04em; }
        .hm-hero-h1 {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(36px, 5vw, 58px); line-height: 1.1;
          color: #fff; letter-spacing: -.02em; margin-bottom: 20px;
        }
        .hm-hero-h1 em { font-style: normal; color: #0fbf9f; }
        .hm-hero-desc { color: rgba(255,255,255,.75); font-size: 17px; line-height: 1.7; margin-bottom: 36px; max-width: 440px; }
        .hm-hero-btns { display: flex; gap: 14px; flex-wrap: wrap; }
        .hm-btn-primary {
          height: 52px; padding: 0 28px;
          background: #fff; color: #087463;
          border: none; border-radius: 12px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; text-decoration: none;
          display: inline-flex; align-items: center; gap: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,.15);
          transition: transform .2s, box-shadow .2s;
        }
        .hm-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,.2); }
        .hm-btn-ghost {
          height: 52px; padding: 0 28px;
          background: rgba(255,255,255,.12); color: #fff;
          border: 1.5px solid rgba(255,255,255,.3); border-radius: 12px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; text-decoration: none;
          display: inline-flex; align-items: center;
          backdrop-filter: blur(8px);
          transition: background .2s, border-color .2s;
        }
        .hm-btn-ghost:hover { background: rgba(255,255,255,.2); border-color: rgba(255,255,255,.5); }

        /* Hero stats */
        .hm-hero-stats {
          display: flex; gap: 20px; margin-top: 48px; flex-wrap: wrap;
        }
        .hm-hero-stat {
          background: rgba(0,0,0,.15); backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,.12); border-radius: 12px;
          padding: 14px 20px;
        }
        .hm-hero-stat-val { color: #fff; font-family: 'DM Mono', monospace; font-weight: 700; font-size: 22px; letter-spacing: -.02em; }
        .hm-hero-stat-lbl { color: rgba(255,255,255,.6); font-size: 11px; font-family: 'DM Mono', monospace; letter-spacing: .05em; text-transform: uppercase; margin-top: 3px; }

        /* Hero right — dashboard mockup */
        .hm-hero-right {
          animation: slideInRight .7s .15s ease both;
        }
        .hm-dashboard-card {
          background: rgba(255,255,255,.95); border-radius: 20px;
          box-shadow: 0 24px 64px rgba(0,0,0,.25), 0 0 0 1px rgba(255,255,255,.2);
          overflow: hidden; animation: floatY 5s ease-in-out infinite;
        }
        .hm-dash-header {
          background: linear-gradient(135deg, #054d42, #087463);
          padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;
        }
        .hm-dash-header-left { display: flex; align-items: center; gap: 10px; }
        .hm-dash-header-left span { color: #fff; font-weight: 700; font-size: 14px; font-family: 'Syne', sans-serif; letter-spacing: .04em; }
        .hm-dash-dots { display: flex; gap: 6px; }
        .hm-dash-dot { width: 10px; height: 10px; border-radius: 50%; }
        .hm-dash-body { padding: 16px 20px; }
        .hm-dash-mini-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 16px; }
        .hm-dash-mini-stat { background: #f0faf7; border-radius: 10px; padding: 10px 12px; }
        .hm-dash-mini-val { font-family: 'DM Mono', monospace; font-weight: 700; font-size: 16px; color: #087463; }
        .hm-dash-mini-lbl { font-size: 10px; color: #64748b; margin-top: 2px; font-family: 'DM Mono', monospace; text-transform: uppercase; letter-spacing: .04em; }
        .hm-dash-table-head { display: grid; grid-template-columns: 2fr 1fr 1fr; padding: 8px 10px; border-radius: 6px; background: #f8fafc; margin-bottom: 6px; }
        .hm-dash-table-head span { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; font-family: 'DM Mono', monospace; }
        .hm-dash-row { display: grid; grid-template-columns: 2fr 1fr 1fr; padding: 9px 10px; border-bottom: 1px solid #f1f5f9; align-items: center; }
        .hm-dash-row:last-child { border-bottom: none; }
        .hm-dash-prod { font-size: 12px; font-weight: 600; color: #0f172a; }
        .hm-dash-sku { font-size: 11px; color: #94a3b8; font-family: 'DM Mono', monospace; }
        .hm-dash-stock { font-size: 12px; font-weight: 700; font-family: 'DM Mono', monospace; }
        .hm-dash-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 100px; display: inline-block; }

        /* ── FEATURES SECTION ── */
        .hm-section { padding: 100px 32px; }
        .hm-section-inner { max-width: 1200px; margin: 0 auto; }
        .hm-section-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(8,116,99,.1); border-radius: 100px;
          padding: 5px 14px; margin-bottom: 16px;
        }
        .hm-section-tag span { color: #087463; font-size: 12px; font-weight: 700; font-family: 'DM Mono', monospace; letter-spacing: .04em; text-transform: uppercase; }
        .hm-section-title {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(28px, 4vw, 42px); color: #0f172a;
          letter-spacing: -.02em; line-height: 1.2; margin-bottom: 12px;
        }
        .hm-section-title em { font-style: normal; color: #087463; }
        .hm-section-sub { color: #64748b; font-size: 16px; line-height: 1.6; max-width: 500px; margin-bottom: 56px; }

        .hm-features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .hm-feat-card {
          background: #fff; border: 1.5px solid #e2e8f0; border-radius: 18px;
          padding: 32px; cursor: default;
          transition: border-color .25s, box-shadow .25s, transform .25s;
          animation: slideInUp .6s ease both;
        }
        .hm-feat-card:hover { border-color: #087463; box-shadow: 0 8px 32px rgba(8,116,99,.12); transform: translateY(-4px); }
        .hm-feat-icon {
          width: 64px; height: 64px; border-radius: 14px;
          background: linear-gradient(135deg, rgba(8,116,99,.1), rgba(15,191,159,.1));
          display: flex; align-items: center; justify-content: center;
          color: #087463; margin-bottom: 20px;
          transition: background .25s;
        }
        .hm-feat-card:hover .hm-feat-icon { background: linear-gradient(135deg, rgba(8,116,99,.2), rgba(15,191,159,.15)); }
        .hm-feat-title { font-weight: 800; font-size: 17px; color: #0f172a; margin-bottom: 8px; font-family: 'Syne', sans-serif; }
        .hm-feat-desc { color: #64748b; font-size: 14px; line-height: 1.65; }

        /* ── PRODUCT TABLE SECTION ── */
        .hm-product-section { padding: 0 32px 100px; }
        .hm-product-inner { max-width: 1200px; margin: 0 auto; }
        .hm-product-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .hm-table-wrap {
          background: #fff; border: 1.5px solid #e2e8f0; border-radius: 18px; overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,.04);
          animation: slideInUp .7s ease both;
        }
        .hm-table { width: 100%; border-collapse: collapse; }
        .hm-table thead { background: linear-gradient(135deg, #054d42, #087463); }
        .hm-table thead th {
          padding: 16px 20px; text-align: left;
          font-size: 11px; font-weight: 700; color: rgba(255,255,255,.8);
          font-family: 'DM Mono', monospace; letter-spacing: .07em; text-transform: uppercase;
        }
        .hm-table tbody tr { border-bottom: 1px solid #f1f5f9; transition: background .15s; }
        .hm-table tbody tr:last-child { border-bottom: none; }
        .hm-table tbody tr:hover { background: #f8fffe; }
        .hm-table tbody td { padding: 16px 20px; font-size: 14px; }
        .hm-td-name { font-weight: 700; color: #0f172a; }
        .hm-td-sku { font-size: 12px; color: #94a3b8; font-family: 'DM Mono', monospace; margin-top: 2px; }
        .hm-td-stock { font-family: 'DM Mono', monospace; font-weight: 700; font-size: 15px; color: #0f172a; }
        .hm-td-badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 100px; }

        /* ── ABOUT ── */
        .hm-about-section { padding: 0 32px 100px; }
        .hm-about-inner {
          max-width: 1200px; margin: 0 auto;
          background: linear-gradient(145deg, #054d42, #087463, #0a9c84);
          border-radius: 28px; padding: 72px 64px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
          position: relative; overflow: hidden;
        }
        .hm-about-grid-bg {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
          background-size: 40px 40px; pointer-events: none;
        }
        .hm-about-left { position: relative; z-index: 1; }
        .hm-about-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(26px,3.5vw,38px); color: #fff; letter-spacing: -.02em; margin-bottom: 16px; }
        .hm-about-desc { color: rgba(255,255,255,.75); font-size: 15px; line-height: 1.8; margin-bottom: 32px; }
        .hm-about-chips { display: flex; gap: 10px; flex-wrap: wrap; }
        .hm-about-chip { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2); border-radius: 100px; padding: 6px 16px; color: rgba(255,255,255,.85); font-size: 13px; font-weight: 600; }
        .hm-about-right { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .hm-about-card { background: rgba(0,0,0,.2); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,.12); border-radius: 16px; padding: 24px; }
        .hm-about-card-val { font-family: 'DM Mono', monospace; font-weight: 700; font-size: 28px; color: #fff; letter-spacing: -.03em; }
        .hm-about-card-lbl { color: rgba(255,255,255,.6); font-size: 12px; font-family: 'DM Mono', monospace; margin-top: 6px; letter-spacing: .04em; text-transform: uppercase; }

        /* ── FOOTER ── */
        .hm-footer { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1f1f1f 100%); padding: 40px 32px; text-align: center; }
        .hm-footer-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #fff; letter-spacing: .06em; margin-bottom: 8px; }
        .hm-footer-logo em { font-style: normal; color: #0fbf9f; }
        .hm-footer-sub { color: rgba(255,255,255,.5); font-size: 13px; font-family: 'DM Mono', monospace; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .hm-hero-inner { grid-template-columns: 1fr; gap: 48px; }
          .hm-hero-right { order: -1; }
          .hm-features-grid { grid-template-columns: 1fr; }
          .hm-about-inner { grid-template-columns: 1fr; gap: 40px; padding: 48px 36px; }
        }

        @media (max-width: 768px) {
          .hm-nav-links { display: none; }
          .hm-btn-login { display: none; }
          .hm-hamburger { display: flex; }
          .hm-hero { padding: 90px 20px 60px; }
          .hm-hero-stats { gap: 12px; }
          .hm-hero-stat { padding: 12px 14px; }
          .hm-hero-stat-val { font-size: 18px; }
          .hm-section { padding: 72px 20px; }
          .hm-product-section { padding: 0 20px 72px; }
          .hm-about-section { padding: 0 20px 72px; }
          .hm-about-inner { padding: 40px 28px; }
          .hm-nav-inner { padding: 0 20px; }
        }

        @media (max-width: 480px) {
          .hm-hero-btns { flex-direction: column; }
          .hm-btn-primary, .hm-btn-ghost { width: 100%; justify-content: center; }
          .hm-hero-stats { flex-direction: column; }
          .hm-hero-stat { width: 100%; }
          .hm-about-right { grid-template-columns: 1fr; }
          .hm-table thead th:nth-child(3),
          .hm-table tbody td:nth-child(3) { display: none; }
          .hm-section-title { font-size: 26px; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className={`hm-nav${scrolled ? " scrolled" : ""}`}>
        <div className="hm-nav-inner">
          <Link href="/home" className="hm-logo">
            <div className="hm-logo-box">
              <span>INV</span>
            </div>
            <span className="hm-logo-name">
              STOCK<em className="hm-logo-dot">R</em>
            </span>
          </Link>

          <div className="hm-nav-links">
            {NAV_LINKS.map((n) => (
              <a
                key={n.label}
                href={n.href}
                className={`hm-nav-link${activeNav === n.label ? " active" : ""}`}
                onClick={() => setActiveNav(n.label)}
              >
                {n.label}
              </a>
            ))}
          </div>

          <div className="hm-nav-cta">
            <Link href="/login" className="hm-btn-login">
              Login
            </Link>
            <button
              className={`hm-hamburger${menuOpen ? " open" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <div className={`hm-mobile-menu${menuOpen ? " open" : ""}`}>
          {NAV_LINKS.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className={`hm-mobile-link${activeNav === n.label ? " active" : ""}`}
              onClick={() => {
                setActiveNav(n.label)
                setMenuOpen(false)
              }}
            >
              {n.label}
            </a>
          ))}
          <Link
            href="/login"
            className="hm-mobile-login"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="hm-hero">
        <div className="hm-hero-grid" />
        <div className="hm-hero-glow" />
        <div className="hm-hero-glow2" />

        <div className="hm-hero-inner">
          <div className="hm-hero-left">
            <div className="hm-hero-tag">
              <div className="hm-hero-tag-dot" />
              <span>Sistem Manajemen Inventori</span>
            </div>
            <h1 className="hm-hero-h1">
              Kelola Stok Lebih
              <br />
              <em>Cerdas & Efisien</em>
            </h1>
            <p className="hm-hero-desc">
              STOCKR membantu bisnis kamu memantau stok, mengelola produk, dan
              melacak transaksi — semua dari satu platform yang mudah digunakan.
            </p>
            <div className="hm-hero-btns">
              <Link href="/register" className="hm-btn-primary">
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
              <a href="#product" className="hm-btn-ghost">
                Lihat Fitur
              </a>
            </div>

            <div className="hm-hero-stats">
              {STATS.map((s, i) => (
                <div
                  key={i}
                  className="hm-hero-stat"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="hm-hero-stat-val">{s.value}</div>
                  <div className="hm-hero-stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="hm-hero-right">
            <div className="hm-dashboard-card">
              <div className="hm-dash-header">
                <div className="hm-dash-header-left">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <span>Dasbor Inventori</span>
                </div>
                <div className="hm-dash-dots">
                  <div
                    className="hm-dash-dot"
                    style={{ background: "#ef4444" }}
                  />
                  <div
                    className="hm-dash-dot"
                    style={{ background: "#f59e0b" }}
                  />
                  <div
                    className="hm-dash-dot"
                    style={{ background: "#22c55e" }}
                  />
                </div>
              </div>
              <div className="hm-dash-body">
                <div className="hm-dash-mini-stats">
                  {[
                    { v: "248", l: "Produk" },
                    { v: "63", l: "Order" },
                    { v: "48.2M", l: "Revenue" }
                  ].map((s) => (
                    <div key={s.l} className="hm-dash-mini-stat">
                      <div className="hm-dash-mini-val">{s.v}</div>
                      <div className="hm-dash-mini-lbl">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="hm-dash-table-head">
                  <span>Produk</span>
                  <span>Stok</span>
                  <span>Status</span>
                </div>
                {PRODUCTS.slice(0, 4).map((p, i) => (
                  <div key={i} className="hm-dash-row">
                    <div>
                      <div className="hm-dash-prod">{p.name}</div>
                      <div className="hm-dash-sku">{p.sku}</div>
                    </div>
                    <div
                      className="hm-dash-stock"
                      style={{
                        color:
                          p.stock === 0
                            ? "#ef4444"
                            : p.stock < 8
                              ? "#f59e0b"
                              : "#087463"
                      }}
                    >
                      {p.stock}
                    </div>
                    <div>
                      <span
                        className="hm-dash-badge"
                        style={{
                          color: statusColor(p.status),
                          background: statusBg(p.status)
                        }}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        id="product"
        className="hm-section"
        style={{ background: "#f0faf7" }}
      >
        <div className="hm-section-inner">
          <div className="hm-section-tag">
            <span>Fitur Unggulan</span>
          </div>
          <h2 className="hm-section-title">
            Semua yang Kamu
            <br />
            <em>Butuhkan</em> Ada di Sini
          </h2>
          <p className="hm-section-sub">
            Platform lengkap untuk manajemen inventori bisnis kecil hingga
            menengah.
          </p>
          <div className="hm-features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="hm-feat-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="hm-feat-icon">{f.icon}</div>
                <h3 className="hm-feat-title">{f.title}</h3>
                <p className="hm-feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT TABLE ── */}
      <div className="hm-product-section">
        <div className="hm-product-inner">
          <div className="hm-product-header">
            <div>
              <div className="hm-section-tag">
                <span>Produk</span>
              </div>
              <h2 className="hm-section-title" style={{ marginBottom: 0 }}>
                Contoh Data <em>Inventori</em>
              </h2>
            </div>
            <Link
              href="/login"
              className="hm-btn-login"
              style={{
                height: 44,
                padding: "0 24px",
                fontSize: 14,
                borderRadius: 10
              }}
            >
              Kelola Sekarang →
            </Link>
          </div>
          <div className="hm-table-wrap">
            <table className="hm-table">
              <thead>
                <tr>
                  <th>Nama Produk</th>
                  <th>Kategori</th>
                  <th>Stok</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div className="hm-td-name">{p.name}</div>
                      <div className="hm-td-sku">{p.sku}</div>
                    </td>
                    <td
                      style={{
                        color: "#64748b",
                        fontSize: 13,
                        fontWeight: 500
                      }}
                    >
                      {p.cat}
                    </td>
                    <td>
                      <span
                        className="hm-td-stock"
                        style={{
                          color:
                            p.stock === 0
                              ? "#ef4444"
                              : p.stock < 8
                                ? "#f59e0b"
                                : "#087463"
                        }}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <span
                        className="hm-td-badge"
                        style={{
                          color: statusColor(p.status),
                          background: statusBg(p.status)
                        }}
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
      <section id="about" className="hm-about-section">
        <div className="hm-about-inner">
          <div className="hm-about-grid-bg" />
          <div className="hm-about-left">
            <div
              className="hm-section-tag"
              style={{ background: "rgba(255,255,255,.15)", marginBottom: 16 }}
            >
              <span style={{ color: "#fff" }}>Tentang Kami</span>
            </div>
            <h2 className="hm-about-title">
              Dibangun untuk Bisnis yang Terus Berkembang
            </h2>
            <p className="hm-about-desc">
              STOCKR lahir dari kebutuhan nyata para pebisnis Indonesia yang
              kesulitan memantau stok secara akurat. Kami menghadirkan solusi
              yang sederhana, cepat, dan dapat diandalkan.
            </p>
            <div className="hm-about-chips">
              {[
                "Mudah Digunakan",
                "Cloud-Based",
                "Realtime Sync",
                "Multi Pengguna"
              ].map((c) => (
                <span key={c} className="hm-about-chip">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="hm-about-right">
            {[
              { v: "500+", l: "Bisnis Aktif" },
              { v: "2M+", l: "Produk Dikelola" },
              { v: "99.9%", l: "Uptime" },
              { v: "24/7", l: "Support" }
            ].map((c) => (
              <div key={c.l} className="hm-about-card">
                <div className="hm-about-card-val">{c.v}</div>
                <div className="hm-about-card-lbl">{c.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="hm-footer">
        <div className="hm-footer-logo">
          STOCK<em>R</em>
        </div>
        <div className="hm-footer-sub">
          © 2026 STOCKR · Inventory Management System
        </div>
      </footer>
    </>
  )
}
