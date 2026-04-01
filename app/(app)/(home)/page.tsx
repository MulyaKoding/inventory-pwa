"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import CSChatWidget from "../components/CSChatWidget"

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

const IMG1 =
  "https://res.cloudinary.com/dp0dtct3v/image/upload/v1775017346/ic_bs_kh3emc.jpg"
const IMG2 =
  "https://res.cloudinary.com/dp0dtct3v/image/upload/v1775017437/ic_sb_nra10b.jpg"

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
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Nunito', sans-serif; background: #f0faf7; color: #0f172a; overflow-x: hidden; }

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
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatY {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: .6; }
          100% { transform: scale(1.6); opacity: 0; }
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
        @keyframes border-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes imgReveal {
          from { opacity: 0; transform: scale(1.06); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmerSlide {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
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
        .hm-logo-box span { color: #fff; font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 12px; letter-spacing: .05em; }
        .hm-logo-name { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 18px; letter-spacing: .06em; color: #0f172a; }
        .hm-logo-dot { color: #087463; }

        .hm-nav-links { display: flex; align-items: center; gap: 4px; }
        .hm-nav-link {
          padding: 8px 18px; border-radius: 8px;
          font-size: 14px; font-weight: 700; color: rgba(255,255,255,.8);
          text-decoration: none; cursor: pointer;
          transition: color .2s, background .2s;
          border: none; background: none;
          font-family: 'Nunito', sans-serif;
        }
        .hm-nav-link:hover { color: #fff; background: rgba(255,255,255,.1); }
        .hm-nav-link.active { color: #fff; }
        .hm-nav.scrolled .hm-nav-link { color: #475569; }
        .hm-nav.scrolled .hm-nav-link:hover { color: #087463; background: rgba(8,116,99,.07); }
        .hm-nav.scrolled .hm-nav-link.active { color: #087463; }

        .hm-nav-cta { display: flex; align-items: center; gap: 12px; }
        .hm-btn-login {
          height: 40px; padding: 0 22px;
          background: #fff; color: #087463;
          border: none; border-radius: 9px;
          font-size: 14px; font-weight: 800;
          font-family: 'Nunito', sans-serif;
          cursor: pointer; text-decoration: none;
          display: flex; align-items: center;
          transition: background .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 4px 12px rgba(0,0,0,.15);
        }
        .hm-btn-login:hover { background: #f0faf7; transform: translateY(-1px); }
        .hm-nav.scrolled .hm-btn-login { background: #087463; color: #fff; box-shadow: 0 4px 12px rgba(8,116,99,.3); }
        .hm-nav.scrolled .hm-btn-login:hover { background: #065a4d; }

        .hm-hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 6px; background: none; border: none; }
        .hm-hamburger span { display: block; width: 22px; height: 2px; background: #fff; border-radius: 2px; transition: all .3s; }
        .hm-hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .hm-hamburger.open span:nth-child(2) { opacity: 0; }
        .hm-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
        .hm-nav.scrolled .hm-hamburger span { background: #0f172a; }

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
          font-size: 15px; font-weight: 700; color: #374151;
          text-decoration: none; margin-bottom: 4px;
          transition: color .2s, background .2s;
          border: none; background: none; width: 100%; text-align: left; cursor: pointer;
          font-family: 'Nunito', sans-serif;
        }
        .hm-mobile-link:hover, .hm-mobile-link.active { color: #087463; background: rgba(8,116,99,.08); }
        .hm-mobile-login {
          display: flex; margin-top: 12px; width: 100%; height: 48px;
          background: #087463; color: #fff; border: none; border-radius: 10px;
          font-size: 15px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif; text-decoration: none;
          align-items: center; justify-content: center;
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

        .hm-hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,.12); backdrop-filter: blur(8px);
          border-radius: 100px; padding: 7px 16px; margin-bottom: 24px;
          position: relative; overflow: hidden; isolation: isolate;
        }
        .hm-hero-tag::before {
          content: ''; position: absolute; inset: -45px; border-radius: 80px;
          background: conic-gradient(from 0deg, transparent 0%, transparent 80%, #c0c0c0 88%, #f0f0f0 92%, #c0c0c0 96%, transparent 100%);
          animation: border-rotate 2.4s linear infinite; z-index: -2;
        }
        .hm-hero-tag::after {
          content: ''; position: absolute; inset: 1.5px; border-radius: 100px;
          background: rgba(5,77,66,.85); backdrop-filter: blur(8px); z-index: -1;
        }
        .hm-hero-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #0fbf9f; position: relative; }
        .hm-hero-tag-dot::after {
          content: ''; position: absolute; inset: -3px; border-radius: 50%;
          background: rgba(15,191,159,.4); animation: pulse-ring 1.5s ease-out infinite;
        }
        .hm-hero-tag span { color: rgba(255,255,255,.9); font-size: 12px; font-family: 'Nunito', sans-serif; font-weight: 700; letter-spacing: .04em; }

        .hm-hero-h1 {
          font-family: 'Nunito', sans-serif; font-weight: 900;
          font-size: clamp(36px, 5vw, 58px); line-height: 1.1;
          color: #fff; letter-spacing: -.02em; margin-bottom: 20px;
        }
        .hm-hero-h1 em { font-style: normal; color: #0fbf9f; }
        .hm-hero-desc { color: rgba(255,255,255,.75); font-size: 17px; line-height: 1.7; margin-bottom: 36px; max-width: 440px; font-family: 'Nunito', sans-serif; font-weight: 500; }
        .hm-hero-btns { display: flex; gap: 14px; flex-wrap: wrap; }
        .hm-btn-primary {
          height: 52px; padding: 0 28px;
          background: #fff; color: #087463;
          border: none; border-radius: 12px;
          font-size: 15px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif; text-decoration: none;
          display: inline-flex; align-items: center; gap: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,.15);
          transition: transform .2s, box-shadow .2s;
        }
        .hm-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,.2); }
        .hm-btn-ghost {
          height: 52px; padding: 0 28px;
          background: rgba(255,255,255,.12); color: #fff;
          border: 1.5px solid rgba(255,255,255,.3); border-radius: 12px;
          font-size: 15px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif; text-decoration: none;
          display: inline-flex; align-items: center;
          backdrop-filter: blur(8px);
          transition: background .2s, border-color .2s;
        }
        .hm-btn-ghost:hover { background: rgba(255,255,255,.2); border-color: rgba(255,255,255,.5); }

        .hm-hero-stats { display: flex; gap: 20px; margin-top: 48px; flex-wrap: wrap; }
        .hm-hero-stat {
          background: rgba(0,0,0,.15); backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,.12); border-radius: 12px; padding: 14px 20px;
        }
        .hm-hero-stat-val { color: #fff; font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 22px; letter-spacing: -.02em; }
        .hm-hero-stat-lbl { color: rgba(255,255,255,.6); font-size: 11px; font-family: 'Nunito', sans-serif; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; margin-top: 3px; }

        /* ── HERO RIGHT — IMAGE COLLAGE ── */
        .hm-hero-right {
          animation: slideInRight .7s .15s ease both;
          position: relative;
        }
        .hm-hero-img-collage {
          position: relative; width: 100%; height: 480px;
        }
        .hm-hero-img-main {
          position: absolute; top: 0; right: 0;
          width: 78%; height: 320px; border-radius: 20px; overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,.35);
          animation: imgReveal .8s .2s ease both;
        }
        .hm-hero-img-main img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .6s ease;
        }
        .hm-hero-img-main:hover img { transform: scale(1.04); }
        .hm-hero-img-main::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(8,116,99,.2) 0%, transparent 60%);
          border-radius: 20px;
        }

        .hm-hero-img-secondary {
          position: absolute; bottom: 0; left: 0;
          width: 58%; height: 240px; border-radius: 16px; overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,.3);
          border: 3px solid rgba(255,255,255,.2);
          animation: imgReveal .8s .4s ease both;
        }
        .hm-hero-img-secondary img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .6s ease;
        }
        .hm-hero-img-secondary:hover img { transform: scale(1.04); }
        .hm-hero-img-secondary::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(5,77,66,.3) 0%, transparent 60%);
        }

        /* Floating badge on image */
        .hm-hero-img-badge {
          position: absolute; top: 20px; left: 20px; z-index: 10;
          background: rgba(255,255,255,.95); backdrop-filter: blur(12px);
          border-radius: 12px; padding: 10px 14px;
          box-shadow: 0 8px 24px rgba(0,0,0,.15);
          animation: floatY 4s ease-in-out infinite;
        }
        .hm-hero-img-badge-val { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 18px; color: #087463; }
        .hm-hero-img-badge-lbl { font-size: 10px; color: #64748b; font-family: 'Nunito', sans-serif; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; margin-top: 2px; }

        .hm-hero-img-badge2 {
          position: absolute; bottom: 56px; right: -16px; z-index: 10;
          background: linear-gradient(135deg, #087463, #0fbf9f);
          border-radius: 12px; padding: 10px 16px;
          box-shadow: 0 8px 24px rgba(8,116,99,.4);
          animation: floatY 4s .8s ease-in-out infinite;
        }
        .hm-hero-img-badge2-val { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 16px; color: #fff; }
        .hm-hero-img-badge2-lbl { font-size: 10px; color: rgba(255,255,255,.75); font-family: 'Nunito', sans-serif; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; margin-top: 2px; }

        /* Connector line decoration */
        .hm-hero-img-line {
          position: absolute; top: 50%; left: 56%; width: 60px; height: 2px;
          background: linear-gradient(90deg, rgba(255,255,255,.5), rgba(255,255,255,.1));
          transform: translateY(-50%) rotate(-15deg);
          pointer-events: none;
        }

        /* ── SOCIAL PROOF STRIP ── */
        .hm-proof-strip {
          background: #fff; padding: 28px 32px;
          border-bottom: 1px solid #e2e8f0;
        }
        .hm-proof-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 24px;
        }
        .hm-proof-label { font-size: 12px; font-family: 'Nunito', sans-serif; font-weight: 700; color: #94a3b8; letter-spacing: .06em; text-transform: uppercase; }
        .hm-proof-avatars { display: flex; align-items: center; gap: -8px; }
        .hm-proof-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          border: 2px solid #fff; overflow: hidden; margin-left: -8px;
          background: linear-gradient(135deg, #087463, #0fbf9f);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: #fff;
          font-family: 'Nunito', sans-serif;
        }
        .hm-proof-avatar:first-child { margin-left: 0; }
        .hm-proof-text { font-size: 13px; font-weight: 700; color: #374151; margin-left: 12px; font-family: 'Nunito', sans-serif; }
        .hm-proof-text em { font-style: normal; color: #087463; }
        .hm-proof-divider { width: 1px; height: 32px; background: #e2e8f0; }
        .hm-proof-stat { text-align: center; }
        .hm-proof-stat-val { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 20px; color: #0f172a; }
        .hm-proof-stat-lbl { font-size: 11px; color: #94a3b8; font-family: 'Nunito', sans-serif; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }

        /* ── PHOTO SECTION ── */
        .hm-photo-section { padding: 100px 32px; background: #fff; }
        .hm-photo-inner { max-width: 1200px; margin: 0 auto; }
        .hm-photo-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center;
        }
        .hm-photo-grid.reverse { direction: rtl; }
        .hm-photo-grid.reverse > * { direction: ltr; }
        .hm-photo-content { }
        .hm-photo-img-wrap {
          position: relative; border-radius: 24px; overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,.12);
          animation: slideInUp .6s ease both;
        }
        .hm-photo-img-wrap img {
          width: 100%; height: 380px; object-fit: cover; display: block;
          transition: transform .6s ease;
        }
        .hm-photo-img-wrap:hover img { transform: scale(1.03); }
        .hm-photo-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(8,116,99,.15) 0%, transparent 50%);
        }
        .hm-photo-img-corner {
          position: absolute; bottom: 20px; left: 20px;
          background: rgba(255,255,255,.95); backdrop-filter: blur(12px);
          border-radius: 12px; padding: 12px 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,.1);
        }
        .hm-photo-img-corner-val { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 20px; color: #087463; }
        .hm-photo-img-corner-lbl { font-size: 11px; color: #64748b; font-family: 'Nunito', sans-serif; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; margin-top: 2px; }

        .hm-photo-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(8,116,99,.1); border-radius: 100px;
          padding: 5px 14px; margin-bottom: 16px;
        }
        .hm-photo-tag span { color: #087463; font-size: 12px; font-weight: 800; font-family: 'Nunito', sans-serif; letter-spacing: .04em; text-transform: uppercase; }
        .hm-photo-title {
          font-family: 'Nunito', sans-serif; font-weight: 900;
          font-size: clamp(26px, 3.5vw, 38px); color: #0f172a;
          letter-spacing: -.02em; line-height: 1.2; margin-bottom: 16px;
        }
        .hm-photo-title em { font-style: normal; color: #087463; }
        .hm-photo-desc { color: #64748b; font-size: 15px; line-height: 1.75; margin-bottom: 28px; font-family: 'Nunito', sans-serif; font-weight: 500; }
        .hm-photo-list { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
        .hm-photo-list li {
          display: flex; align-items: flex-start; gap: 12px;
          font-size: 14px; color: #374151; line-height: 1.5;
          font-family: 'Nunito', sans-serif; font-weight: 600;
        }
        .hm-photo-list li::before {
          content: ''; width: 20px; height: 20px; border-radius: 50%;
          background: linear-gradient(135deg, #087463, #0fbf9f);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 2px;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 6l2.5 2.5L10 3' stroke='white' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: center;
          background-size: 20px, 12px;
        }

        .hm-photo-btn {
          display: inline-flex; align-items: center; gap: 8px;
          height: 48px; padding: 0 24px;
          background: #087463; color: #fff;
          border: none; border-radius: 12px;
          font-size: 14px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif; text-decoration: none;
          box-shadow: 0 8px 24px rgba(8,116,99,.3);
          transition: transform .2s, box-shadow .2s, background .2s;
        }
        .hm-photo-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(8,116,99,.4); background: #065a4d; }

        /* ── FEATURES SECTION ── */
        .hm-section { padding: 100px 32px; }
        .hm-section-inner { max-width: 1200px; margin: 0 auto; }
        .hm-section-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(8,116,99,.1); border-radius: 100px;
          padding: 5px 14px; margin-bottom: 16px;
        }
        .hm-section-tag span { color: #087463; font-size: 12px; font-weight: 800; font-family: 'Nunito', sans-serif; letter-spacing: .04em; text-transform: uppercase; }
        .hm-section-title {
          font-family: 'Nunito', sans-serif; font-weight: 900;
          font-size: clamp(28px, 4vw, 42px); color: #0f172a;
          letter-spacing: -.02em; line-height: 1.2; margin-bottom: 12px;
        }
        .hm-section-title em { font-style: normal; color: #087463; }
        .hm-section-sub { color: #64748b; font-size: 16px; line-height: 1.6; max-width: 500px; margin-bottom: 56px; font-family: 'Nunito', sans-serif; font-weight: 500; }

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
          color: #087463; margin-bottom: 20px; transition: background .25s;
        }
        .hm-feat-card:hover .hm-feat-icon { background: linear-gradient(135deg, rgba(8,116,99,.2), rgba(15,191,159,.15)); }
        .hm-feat-title { font-weight: 900; font-size: 17px; color: #0f172a; margin-bottom: 8px; font-family: 'Nunito', sans-serif; }
        .hm-feat-desc { color: #64748b; font-size: 14px; line-height: 1.65; font-family: 'Nunito', sans-serif; font-weight: 500; }

        /* ── PRODUCT TABLE SECTION ── */
        .hm-product-section { padding: 0 32px 100px; }
        .hm-product-inner { max-width: 1200px; margin: 0 auto; }
        .hm-product-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .hm-table-wrap {
          background: #fff; border: 1.5px solid #e2e8f0; border-radius: 18px; overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,.04); animation: slideInUp .7s ease both;
        }
        .hm-table { width: 100%; border-collapse: collapse; }
        .hm-table thead { background: linear-gradient(135deg, #054d42, #087463); }
        .hm-table thead th {
          padding: 16px 20px; text-align: left;
          font-size: 11px; font-weight: 800; color: rgba(255,255,255,.8);
          font-family: 'Nunito', sans-serif; letter-spacing: .07em; text-transform: uppercase;
        }
        .hm-table tbody tr { border-bottom: 1px solid #f1f5f9; transition: background .15s; }
        .hm-table tbody tr:last-child { border-bottom: none; }
        .hm-table tbody tr:hover { background: #f8fffe; }
        .hm-table tbody td { padding: 16px 20px; font-size: 14px; font-family: 'Nunito', sans-serif; }
        .hm-td-name { font-weight: 800; color: #0f172a; }
        .hm-td-sku { font-size: 12px; color: #94a3b8; font-family: 'Nunito', sans-serif; font-weight: 600; margin-top: 2px; }
        .hm-td-stock { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 15px; color: #0f172a; }
        .hm-td-badge { display: inline-block; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 100px; font-family: 'Nunito', sans-serif; }

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
        .hm-about-title { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: clamp(26px,3.5vw,38px); color: #fff; letter-spacing: -.02em; margin-bottom: 16px; }
        .hm-about-desc { color: rgba(255,255,255,.75); font-size: 15px; line-height: 1.8; margin-bottom: 32px; font-family: 'Nunito', sans-serif; font-weight: 500; }
        .hm-about-chips { display: flex; gap: 10px; flex-wrap: wrap; }
        .hm-about-chip { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2); border-radius: 100px; padding: 6px 16px; color: rgba(255,255,255,.85); font-size: 13px; font-weight: 700; font-family: 'Nunito', sans-serif; }
        .hm-about-right { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .hm-about-card { background: rgba(0,0,0,.2); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,.12); border-radius: 16px; padding: 24px; }
        .hm-about-card-val { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 28px; color: #fff; letter-spacing: -.03em; }
        .hm-about-card-lbl { color: rgba(255,255,255,.6); font-size: 12px; font-family: 'Nunito', sans-serif; font-weight: 700; margin-top: 6px; letter-spacing: .04em; text-transform: uppercase; }

        /* ── FOOTER ── */
        .hm-footer { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1f1f1f 100%); padding: 40px 32px; text-align: center; }
        .hm-footer-logo { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 22px; color: #fff; letter-spacing: .06em; margin-bottom: 8px; }
        .hm-footer-logo em { font-style: normal; color: #0fbf9f; }
        .hm-footer-sub { color: rgba(255,255,255,.5); font-size: 13px; font-family: 'Nunito', sans-serif; font-weight: 600; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .hm-hero-inner { grid-template-columns: 1fr; gap: 48px; }
          .hm-hero-right { order: -1; }
          .hm-hero-img-collage { height: 320px; }
          .hm-hero-img-main { width: 72%; height: 220px; }
          .hm-hero-img-secondary { width: 52%; height: 180px; }
          .hm-features-grid { grid-template-columns: 1fr; }
          .hm-about-inner { grid-template-columns: 1fr; gap: 40px; padding: 48px 36px; }
          .hm-photo-grid { grid-template-columns: 1fr; gap: 40px; }
          .hm-photo-grid.reverse { direction: ltr; }
        }
        @media (max-width: 768px) {
          .hm-nav-links { display: none; }
          .hm-btn-login { display: none; }
          .hm-hamburger { display: flex; }
          .hm-hero { padding: 90px 20px 60px; }
          .hm-hero-stats { gap: 12px; }
          .hm-proof-strip { padding: 20px; }
          .hm-proof-divider { display: none; }
          .hm-section { padding: 72px 20px; }
          .hm-product-section { padding: 0 20px 72px; }
          .hm-about-section { padding: 0 20px 72px; }
          .hm-about-inner { padding: 40px 28px; }
          .hm-photo-section { padding: 72px 20px; }
          .hm-nav-inner { padding: 0 20px; }
        }
        @media (max-width: 480px) {
          .hm-hero-btns { flex-direction: column; }
          .hm-btn-primary, .hm-btn-ghost { width: 100%; justify-content: center; }
          .hm-hero-stats { flex-direction: column; }
          .hm-hero-stat { width: 100%; }
          .hm-about-right { grid-template-columns: 1fr; }
          .hm-table thead th:nth-child(3), .hm-table tbody td:nth-child(3) { display: none; }
          .hm-section-title { font-size: 26px; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className={`hm-nav${scrolled ? " scrolled" : ""}`}>
        <div className="hm-nav-inner">
          <Link href="/" className="hm-logo">
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

          {/* ── IMAGE COLLAGE ── */}
          <div className="hm-hero-right">
            <div className="hm-hero-img-collage">
              <div className="hm-hero-img-main">
                <img src={IMG1} alt="Tim bisnis kolaborasi" />
              </div>
              <div className="hm-hero-img-secondary">
                <img src={IMG2} alt="Manajemen stok inventori" />
                <div className="hm-hero-img-badge">
                  <div className="hm-hero-img-badge-val">+48%</div>
                  <div className="hm-hero-img-badge-lbl">Efisiensi</div>
                </div>
              </div>
              <div className="hm-hero-img-badge2">
                <div className="hm-hero-img-badge2-val">500+</div>
                <div className="hm-hero-img-badge2-lbl">Bisnis Aktif</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF STRIP ── */}
      <div className="hm-proof-strip">
        <div className="hm-proof-inner">
          <span className="hm-proof-label">Dipercaya oleh</span>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="hm-proof-avatars">
              {["A", "B", "C", "D", "E"].map((l, i) => (
                <div
                  key={i}
                  className="hm-proof-avatar"
                  style={{
                    background: `linear-gradient(135deg, #087463 ${i * 20}%, #0fbf9f)`
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
            <span className="hm-proof-text">
              <em>500+</em> bisnis aktif
            </span>
          </div>
          <div className="hm-proof-divider" />
          <div className="hm-proof-stat">
            <div className="hm-proof-stat-val">2M+</div>
            <div className="hm-proof-stat-lbl">Produk Dikelola</div>
          </div>
          <div className="hm-proof-divider" />
          <div className="hm-proof-stat">
            <div className="hm-proof-stat-val">99.9%</div>
            <div className="hm-proof-stat-lbl">Uptime</div>
          </div>
          <div className="hm-proof-divider" />
          <div className="hm-proof-stat">
            <div className="hm-proof-stat-val">4.9★</div>
            <div className="hm-proof-stat-lbl">Rating Pengguna</div>
          </div>
        </div>
      </div>

      {/* ── PHOTO SECTION 1 — IMG1 ── */}
      <section className="hm-photo-section">
        <div className="hm-photo-inner">
          <div className="hm-photo-grid">
            <div className="hm-photo-img-wrap">
              <img src={IMG1} alt="Tim kolaborasi bisnis" />
              <div className="hm-photo-img-overlay" />
              <div className="hm-photo-img-corner">
                <div className="hm-photo-img-corner-val">10x</div>
                <div className="hm-photo-img-corner-lbl">Lebih Cepat</div>
              </div>
            </div>
            <div className="hm-photo-content" style={{ paddingLeft: 16 }}>
              <div className="hm-photo-tag">
                <span>Kolaborasi Tim</span>
              </div>
              <h2 className="hm-photo-title">
                Kerja Bareng Tim <em>Lebih Mudah</em>
              </h2>
              <p className="hm-photo-desc">
                STOCKR dirancang untuk tim yang berkembang. Multi-user,
                permission berbasis peran, dan aktivitas log real-time agar
                semua anggota tim tetap sinkron.
              </p>
              <ul className="hm-photo-list">
                <li>Akses multi-pengguna dengan level permission</li>
                <li>Notifikasi real-time untuk setiap perubahan stok</li>
                <li>Log aktivitas lengkap untuk audit trail</li>
                <li>Dashboard personal per departemen</li>
              </ul>
              <Link href="/register" className="hm-photo-btn">
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

      {/* ── PHOTO SECTION 2 — IMG2 ── */}
      <section className="hm-photo-section" style={{ background: "#f0faf7" }}>
        <div className="hm-photo-inner">
          <div className="hm-photo-grid reverse">
            <div className="hm-photo-content" style={{ paddingRight: 16 }}>
              <div className="hm-photo-tag">
                <span>Smart Analytics</span>
              </div>
              <h2 className="hm-photo-title">
                Data Driven, <em>Keputusan Lebih Tepat</em>
              </h2>
              <p className="hm-photo-desc">
                Laporan otomatis, grafik tren stok, dan insight produk terlaris
                membantu kamu mengambil keputusan bisnis berdasarkan data nyata,
                bukan intuisi.
              </p>
              <ul className="hm-photo-list">
                <li>Laporan stok harian, mingguan, dan bulanan</li>
                <li>Analisis produk terlaris & slow-moving</li>
                <li>Forecast kebutuhan stok otomatis</li>
                <li>Export laporan ke Excel & PDF</li>
              </ul>
              <Link href="/register" className="hm-photo-btn">
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
            <div className="hm-photo-img-wrap">
              <img src={IMG2} alt="Analytics dashboard inventori" />
              <div className="hm-photo-img-overlay" />
              <div className="hm-photo-img-corner">
                <div className="hm-photo-img-corner-val">Real-Time</div>
                <div className="hm-photo-img-corner-lbl">Analytics</div>
              </div>
            </div>
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
                borderRadius: 10,
                background: "#087463",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(8,116,99,.3)"
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
      <CSChatWidget />
    </>
  )
}
