"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

/* ── DATA ── */
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/product" },
  { label: "About Us", href: "/#about" }
]

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
    color: "#087463",
    accent: "#0fbf9f",
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
          fill="#0fbf9f"
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
    color: "#065a4d",
    accent: "#34d399",
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
    color: "#087463",
    accent: "#6ee7b7",
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
    color: "#054d42",
    accent: "#a7f3d0",
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 8,
        width: "100%"
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 48,
            borderRadius: 10,
            background:
              i % 3 === 0
                ? "rgba(15,191,159,.25)"
                : i % 5 === 0
                  ? "rgba(8,116,99,.35)"
                  : "rgba(255,255,255,.07)",
            border: "1px solid rgba(255,255,255,.1)"
          }}
        />
      ))}
    </div>
  )
}

function VisualPulse() {
  return (
    <div
      style={{
        position: "relative",
        width: 160,
        height: 160,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: i * 50,
            height: i * 50,
            borderRadius: "50%",
            border: "1.5px solid rgba(52,211,153,.35)",
            animation: `expandRing 2.5s ease-out infinite`,
            animationDelay: `${(i - 1) * 0.75}s`
          }}
        />
      ))}
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #087463, #0fbf9f)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 28px rgba(15,191,159,.5)"
        }}
      >
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
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 7,
        height: 100,
        width: "100%"
      }}
    >
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            borderRadius: "5px 5px 0 0",
            background:
              i === 5
                ? "linear-gradient(180deg, #0fbf9f, #087463)"
                : "rgba(255,255,255,.14)",
            height: `${h}%`,
            position: "relative",
            overflow: "hidden"
          }}
        >
          {i === 5 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,.2), transparent)"
              }}
            />
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
    <div style={{ width: "100%" }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: i === 0 ? "#0fbf9f" : "rgba(255,255,255,.2)",
                flexShrink: 0,
                marginTop: 5
              }}
            />
            {i < items.length - 1 && (
              <div
                style={{
                  width: 1,
                  flex: 1,
                  background: "rgba(255,255,255,.08)",
                  marginTop: 3
                }}
              />
            )}
          </div>
          <div
            style={{
              flex: 1,
              background: "rgba(255,255,255,.06)",
              borderRadius: 8,
              padding: "7px 11px",
              border:
                i === 0
                  ? "1px solid rgba(15,191,159,.35)"
                  : "1px solid rgba(255,255,255,.06)",
              marginBottom: i < items.length - 1 ? 4 : 0
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: i === 0 ? "#0fbf9f" : "rgba(255,255,255,.6)",
                fontFamily: "'DM Mono', 'Consolas', monospace"
              }}
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
  const anim = dir === "right" ? "slideR" : "slideL"

  const renderVisual = (type: string) => {
    if (type === "grid") return <VisualGrid />
    if (type === "pulse") return <VisualPulse />
    if (type === "bars") return <VisualBars />
    return <VisualTimeline />
  }

  const CSS = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Plus Jakarta Sans', 'Segoe UI', Tahoma, system-ui, sans-serif;
      background: #f0faf7; color: #0f172a; overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    @keyframes navSlide   { from{opacity:0;transform:translateY(-100%)} to{opacity:1;transform:translateY(0)} }
    @keyframes menuIn     { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideR     { from{opacity:0;transform:translateX(55px) scale(.97)} to{opacity:1;transform:translateX(0) scale(1)} }
    @keyframes slideL     { from{opacity:0;transform:translateX(-55px) scale(.97)} to{opacity:1;transform:translateX(0) scale(1)} }
    @keyframes expandRing { 0%{transform:scale(.3);opacity:.7} 100%{transform:scale(1);opacity:0} }
    @keyframes floatY     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    @keyframes gridPan    { from{background-position:0 0} to{background-position:48px 48px} }
    @keyframes blink      { 0%,100%{opacity:1} 50%{opacity:.2} }
    @keyframes fillProg   { from{width:0%} to{width:100%} }
    @keyframes fadeUp     { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

    .anim-slideR { animation: slideR .5s cubic-bezier(.22,.68,0,1.15) both; }
    .anim-slideL { animation: slideL .5s cubic-bezier(.22,.68,0,1.15) both; }
    .anim-fadeUp { animation: fadeUp .6s ease both; }

    /* NAV */
    .nav {
      position:fixed; top:0; left:0; right:0; z-index:100;
      transition: background .3s, box-shadow .3s;
      animation: navSlide .4s ease forwards;
    }
    .nav.s {
      background: rgba(255,255,255,.95);
      backdrop-filter: blur(18px);
      box-shadow: 0 1px 0 rgba(0,0,0,.07), 0 4px 20px rgba(8,116,99,.07);
    }
    .nav-in {
      max-width:1200px; margin:0 auto;
      display:flex; align-items:center; justify-content:space-between;
      padding:0 32px; height:70px;
    }
    .logo { display:flex; align-items:center; gap:12px; text-decoration:none; }
    .logo-box {
      width:40px; height:40px; border-radius:10px;
      background:linear-gradient(135deg,#087463,#0fbf9f);
      display:flex; align-items:center; justify-content:center;
      box-shadow: 0 4px 14px rgba(8,116,99,.35);
    }
    .logo-lbl {
      color:#fff;
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      font-weight:800; font-size:11px; letter-spacing:.05em;
    }
    .logo-name {
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      font-weight:800; font-size:20px; letter-spacing:.07em; color:#0f172a;
    }
    .logo-em { color:#087463; font-style:normal; }

    .nav-links { display:flex; align-items:center; gap:2px; }
    .nl {
      padding:9px 20px; border-radius:8px; font-size:15px; font-weight:600;
      color:rgba(255,255,255,.83); text-decoration:none;
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      transition:color .2s, background .2s;
    }
    .nl:hover { color:#fff; background:rgba(255,255,255,.1); }
    .nl.on { color:#fff; font-weight:700; }
    .nav.s .nl { color:#475569; }
    .nav.s .nl:hover { color:#087463; background:rgba(8,116,99,.07); }
    .nav.s .nl.on { color:#087463; }

    .btn-l {
      height:42px; padding:0 22px; background:#fff; color:#087463;
      border:none; border-radius:10px; font-size:15px; font-weight:700;
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      cursor:pointer; text-decoration:none; display:flex; align-items:center;
      box-shadow:0 4px 12px rgba(0,0,0,.13); transition:all .2s;
    }
    .btn-l:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(0,0,0,.18); }
    .nav.s .btn-l { background:#087463; color:#fff; box-shadow:0 4px 12px rgba(8,116,99,.3); }
    .nav.s .btn-l:hover { background:#065a4d; }

    .hbg { display:none; flex-direction:column; gap:5px; cursor:pointer; padding:6px; background:none; border:none; }
    .hbg span { display:block; width:22px; height:2px; background:#fff; border-radius:2px; transition:all .3s; }
    .nav.s .hbg span { background:#0f172a; }
    .hbg.op span:nth-child(1){transform:rotate(45deg) translate(5px,5px)}
    .hbg.op span:nth-child(2){opacity:0}
    .hbg.op span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px)}

    .m-menu {
      display:none; position:absolute; top:70px; left:0; right:0;
      background:rgba(255,255,255,.97); backdrop-filter:blur(20px);
      border-bottom:1px solid rgba(8,116,99,.1); padding:12px 20px 20px;
      box-shadow:0 12px 32px rgba(0,0,0,.08);
      animation: menuIn .2s ease forwards;
    }
    .m-menu.op { display:block; }
    .m-nl {
      display:block; padding:13px 16px; border-radius:10px; font-size:15px; font-weight:600;
      color:#374151; text-decoration:none; margin-bottom:4px;
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      transition:all .2s; border:none; background:none; width:100%; text-align:left; cursor:pointer;
    }
    .m-nl:hover,.m-nl.on { color:#087463; background:rgba(8,116,99,.08); }
    .m-login {
      margin-top:12px; width:100%; height:48px; background:#087463; color:#fff;
      border:none; border-radius:10px; font-size:15px; font-weight:700; cursor:pointer;
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      text-decoration:none; display:flex; align-items:center; justify-content:center;
    }

    /* HERO */
    .hero {
      min-height:100vh; position:relative; overflow:hidden;
      display:flex; align-items:center; padding:100px 32px 72px;
      transition: background 1s ease;
    }
    .h-grid {
      position:absolute; inset:0;
      background-image:
        linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),
        linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);
      background-size:48px 48px; animation:gridPan 10s linear infinite; pointer-events:none;
    }
    .h-glow {
      position:absolute; top:-120px; right:-120px; width:480px; height:480px;
      border-radius:50%; background:radial-gradient(circle,rgba(15,191,159,.2) 0%,transparent 65%); pointer-events:none;
    }
    .h-in {
      max-width:1200px; margin:0 auto; width:100%;
      display:grid; grid-template-columns:1fr 1fr; gap:72px; align-items:center;
      position:relative; z-index:1;
    }

    .s-badge {
      display:inline-flex; align-items:center; gap:9px;
      background:rgba(255,255,255,.1); backdrop-filter:blur(8px);
      border:1px solid rgba(255,255,255,.18); border-radius:100px;
      padding:8px 20px; margin-bottom:20px;
    }
    .s-dot { width:7px; height:7px; border-radius:50%; background:#0fbf9f; animation:blink 1.4s ease-in-out infinite; flex-shrink:0; }
    .s-badge-txt {
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      font-size:12px; font-weight:700;
      color:rgba(255,255,255,.88); letter-spacing:.08em; text-transform:uppercase;
    }

    .s-tag {
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      font-size:12px; font-weight:700;
      color:rgba(255,255,255,.5); letter-spacing:.1em; text-transform:uppercase; margin-bottom:12px;
    }

    .s-title {
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      font-weight:800; font-size:64px; line-height:1.04;
      color:#fff; letter-spacing:-.02em; margin-bottom:20px;
    }
    .s-title em { font-style:normal; color:#0fbf9f; }

    .s-desc {
      color:rgba(255,255,255,.7); font-size:17px; line-height:1.75;
      margin-bottom:34px; max-width:440px;
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
    }

    .s-stats { display:flex; gap:12px; margin-bottom:34px; flex-wrap:wrap; }
    .s-stat {
      background:rgba(0,0,0,.22); backdrop-filter:blur(10px);
      border:1px solid rgba(255,255,255,.1); border-radius:14px; padding:16px 20px;
    }
    .s-stat-v {
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      font-weight:800; font-size:26px;
      color:#fff; line-height:1;
    }
    .s-stat-l {
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      font-size:10px; font-weight:600;
      color:rgba(255,255,255,.42); text-transform:uppercase; letter-spacing:.07em; margin-top:5px;
    }

    .s-cta { display:flex; gap:12px; flex-wrap:wrap; }
    .btn-p {
      height:52px; padding:0 30px; background:#fff; color:#087463;
      border:none; border-radius:12px; font-size:16px; font-weight:700; cursor:pointer;
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      text-decoration:none; display:inline-flex; align-items:center; gap:8px;
      box-shadow:0 8px 24px rgba(0,0,0,.16); transition:transform .2s, box-shadow .2s;
    }
    .btn-p:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(0,0,0,.22); }
    .btn-g {
      height:52px; padding:0 26px; background:rgba(255,255,255,.1); color:#fff;
      border:1.5px solid rgba(255,255,255,.25); border-radius:12px;
      font-size:16px; font-weight:600; cursor:pointer;
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      text-decoration:none; display:inline-flex; align-items:center;
      backdrop-filter:blur(8px); transition:background .2s;
    }
    .btn-g:hover { background:rgba(255,255,255,.18); }

    .tabs { display:flex; gap:8px; flex-wrap:wrap; margin-top:40px; }
    .tab {
      display:flex; align-items:center; gap:8px; padding:11px 22px; border-radius:100px;
      background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
      color:rgba(255,255,255,.65); font-size:14px; font-weight:600; cursor:pointer;
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif; transition:all .22s;
    }
    .tab:hover { background:rgba(255,255,255,.14); color:rgba(255,255,255,.9); }
    .tab.on { background:rgba(255,255,255,.17); color:#fff; border-color:rgba(255,255,255,.28); }
    .tab-n { font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif; font-size:11px; font-weight:700; opacity:.5; }

    .prog-wrap { display:flex; gap:6px; margin-top:14px; }
    .prog-bar { height:2px; border-radius:2px; flex:1; background:rgba(255,255,255,.13); overflow:hidden; }
    .prog-fill { height:100%; border-radius:2px; background:#0fbf9f; width:0%; }
    .prog-fill.go { animation:fillProg 4.5s linear forwards; }

    .dots { display:flex; align-items:center; gap:12px; margin-top:14px; }
    .dot-btn {
      width:8px; height:8px; border-radius:100px; background:rgba(255,255,255,.25);
      cursor:pointer; border:none; transition:width .4s cubic-bezier(.34,1.56,.64,1), background .3s;
    }
    .dot-btn.on { width:30px; background:#fff; }
    .next-b {
      background:rgba(255,255,255,.11); border:none; border-radius:8px; padding:8px 16px;
      color:rgba(255,255,255,.6); font-size:13px; font-weight:600; cursor:pointer;
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif; transition:all .2s;
    }
    .next-b:hover { background:rgba(255,255,255,.2); color:#fff; }

    /* Right card */
    .v-card {
      background:rgba(255,255,255,.07); backdrop-filter:blur(20px);
      border:1px solid rgba(255,255,255,.13); border-radius:24px;
      padding:36px; width:100%; max-width:380px;
      display:flex; flex-direction:column; align-items:center; gap:26px;
      box-shadow:0 24px 64px rgba(0,0,0,.28);
      animation: floatY 5s ease-in-out infinite;
    }
    .v-icon {
      width:96px; height:96px; border-radius:20px;
      background:rgba(255,255,255,.1);
      display:flex; align-items:center; justify-content:center; color:#fff;
    }
    .v-stat {
      width:100%; padding:14px 16px; background:rgba(0,0,0,.22);
      border-radius:12px; border:1px solid rgba(255,255,255,.08);
    }
    .v-stat-lbl {
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      font-size:10px; font-weight:700;
      color:rgba(255,255,255,.38); text-transform:uppercase; letter-spacing:.07em; margin-bottom:8px;
    }
    .v-stat-row { display:flex; gap:10px; }
    .v-stat-v {
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      font-weight:800; font-size:17px; color:#0fbf9f;
    }
    .v-stat-l {
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      font-size:9px; font-weight:600;
      color:rgba(255,255,255,.32); text-transform:uppercase; letter-spacing:.05em; margin-top:3px;
    }

    /* STRIP */
    .strip {
      background:#fff; border-top:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0; padding:26px 32px;
    }
    .strip-in {
      max-width:1200px; margin:0 auto;
      display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:center;
    }
    .s-item {
      display:flex; align-items:center; gap:7px; padding:8px 18px; border-radius:100px;
      background:#f0faf7; border:1px solid rgba(8,116,99,.15);
      font-size:14px; font-weight:600; color:#087463;
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
    }

    /* DETAIL SECTION */
    .det-sec { padding:100px 32px; background:#f0faf7; }
    .det-in { max-width:1200px; margin:0 auto; }
    .det-head { text-align:center; margin-bottom:60px; }
    .det-tag {
      display:inline-flex; align-items:center;
      background:rgba(8,116,99,.1); border-radius:100px; padding:5px 16px; margin-bottom:16px;
    }
    .det-tag span {
      color:#087463; font-size:12px; font-weight:700;
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      text-transform:uppercase; letter-spacing:.07em;
    }
    .det-h2 {
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      font-weight:800; font-size:42px; color:#0f172a;
      letter-spacing:-.02em; line-height:1.2; margin-bottom:14px;
    }
    .det-h2 em { font-style:normal; color:#087463; }
    .det-sub {
      color:#64748b; font-size:17px; line-height:1.65; max-width:520px; margin:0 auto;
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
    }
    .det-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; }
    .det-card {
      background:#fff; border:1.5px solid #e2e8f0; border-radius:20px; padding:36px;
      transition:border-color .25s, box-shadow .25s, transform .25s;
    }
    .det-card:hover { border-color:#087463; box-shadow:0 8px 32px rgba(8,116,99,.12); transform:translateY(-4px); }
    .det-ico {
      width:64px; height:64px; border-radius:16px; margin-bottom:20px;
      background:linear-gradient(135deg,rgba(8,116,99,.1),rgba(15,191,159,.1));
      display:flex; align-items:center; justify-content:center; color:#087463;
    }
    .det-badge {
      display:inline-block; font-size:11px; font-weight:700;
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      letter-spacing:.06em; text-transform:uppercase;
      color:#087463; background:rgba(8,116,99,.08); border-radius:100px;
      padding:4px 12px; margin-bottom:12px;
    }
    .det-title {
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      font-weight:800; font-size:22px; color:#0f172a; margin-bottom:10px;
    }
    .det-desc {
      color:#64748b; font-size:15px; line-height:1.7; margin-bottom:22px;
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
    }
    .det-stats { display:flex; gap:20px; flex-wrap:wrap; }
    .det-sv {
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      font-weight:800; font-size:20px; color:#087463;
    }
    .det-sl {
      font-size:10px; color:#94a3b8;
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      font-weight:600;
      text-transform:uppercase; letter-spacing:.06em; margin-top:3px;
    }

    /* CTA */
    .cta-sec { padding:0 32px 100px; }
    .cta-in {
      max-width:1200px; margin:0 auto;
      background:linear-gradient(145deg,#054d42,#087463,#0a9c84);
      border-radius:28px; padding:80px 64px; text-align:center; position:relative; overflow:hidden;
    }
    .cta-grid {
      position:absolute; inset:0;
      background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);
      background-size:40px 40px; pointer-events:none;
    }
    .cta-h2 {
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      font-weight:800; font-size:44px; color:#fff;
      letter-spacing:-.025em; margin-bottom:16px; position:relative; z-index:1;
    }
    .cta-h2 em { font-style:normal; color:#0fbf9f; }
    .cta-p {
      color:rgba(255,255,255,.7); font-size:17px; line-height:1.7;
      max-width:480px; margin:0 auto 36px; position:relative; z-index:1;
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
    }
    .cta-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; position:relative; z-index:1; }

    /* FOOTER */
    .footer {
      background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 50%,#1f1f1f 100%); padding:40px 32px; text-align:center;
    }
    .f-logo {
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      font-weight:800; font-size:22px; color:#fff; letter-spacing:.07em; margin-bottom:8px;
    }
    .f-logo em { font-style:normal; color:#0fbf9f; }
    .f-sub {
      color:rgba(255,255,255,.38); font-size:13px;
      font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;
      font-weight:500;
    }

    /* RESPONSIVE */
    @media(max-width:960px){
      .h-in{grid-template-columns:1fr;gap:48px}
      .right-wrap{order:-1;display:flex;justify-content:center}
      .det-grid{grid-template-columns:1fr}
      .cta-in{padding:56px 36px}
      .s-title{font-size:48px}
      .det-h2{font-size:34px}
      .cta-h2{font-size:34px}
    }
    @media(max-width:768px){
      .nav-links{display:none} .btn-l{display:none} .hbg{display:flex}
      .hero{padding:88px 20px 60px}
      .det-sec{padding:72px 20px}
      .cta-sec{padding:0 20px 72px}
      .strip{padding:20px}
      .nav-in{padding:0 20px}
      .tabs{display:none}
      .s-title{font-size:40px}
    }
    @media(max-width:480px){
      .s-cta{flex-direction:column}
      .btn-p,.btn-g{width:100%;justify-content:center}
      .cta-in{padding:40px 24px}
      .s-title{font-size:32px}
      .det-h2,.cta-h2{font-size:26px}
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* NAV */}
      <nav className={`nav${scrolled ? " s" : ""}`}>
        <div className="nav-in">
          <Link href="/" className="logo">
            <div className="logo-box">
              <span className="logo-lbl">INV</span>
            </div>
            <span className="logo-name">
              STOCK<em className="logo-em">R</em>
            </span>
          </Link>
          <div className="nav-links">
            {NAV_LINKS.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className={`nl${n.label === "Product" ? " on" : ""}`}
              >
                {n.label}
              </Link>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/login" className="btn-l">
              Login
            </Link>
            <button
              className={`hbg${menuOpen ? " op" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
        <div className={`m-menu${menuOpen ? " op" : ""}`}>
          {NAV_LINKS.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className={`m-nl${n.label === "Product" ? " on" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="m-login"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="hero"
        style={{
          background: `linear-gradient(160deg,#032e27 0%,${cur.color} 50%,#054d42 100%)`
        }}
      >
        <div className="h-grid" />
        <div className="h-glow" />
        <div className="h-in">
          {/* Left */}
          <div>
            <div
              key={`b-${active}`}
              className={`anim-${anim}`}
              style={{ animationDelay: "0s" }}
            >
              <div className="s-badge">
                <div className="s-dot" />
                <span className="s-badge-txt">{cur.badge}</span>
              </div>
            </div>
            <div
              key={`t-${active}`}
              className={`anim-${anim}`}
              style={{ animationDelay: ".07s" }}
            >
              <p className="s-tag">{cur.tagline}</p>
            </div>
            <div
              key={`h-${active}`}
              className={`anim-${anim}`}
              style={{ animationDelay: ".13s" }}
            >
              <h1 className="s-title">
                {cur.name.split(" ").map((w, i) =>
                  i === 0 ? (
                    <em key={i}>
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
              className={`anim-${anim}`}
              style={{ animationDelay: ".19s" }}
            >
              <p className="s-desc">{cur.desc}</p>
            </div>
            <div
              key={`s-${active}`}
              className={`anim-${anim}`}
              style={{ animationDelay: ".25s" }}
            >
              <div className="s-stats">
                {cur.stat.map((s, i) => (
                  <div key={i} className="s-stat">
                    <div className="s-stat-v">{s.v}</div>
                    <div className="s-stat-l">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div
              key={`c-${active}`}
              className={`anim-${anim}`}
              style={{ animationDelay: ".31s" }}
            >
              <div className="s-cta">
                <Link href="/register" className="btn-p">
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
                <Link href="/login" className="btn-g">
                  Lihat Demo
                </Link>
              </div>
            </div>

            <div className="tabs">
              {PRODUCTS.map((p, i) => (
                <button
                  key={i}
                  className={`tab${active === i ? " on" : ""}`}
                  onClick={() => {
                    goTo(i)
                    startTimer()
                  }}
                >
                  <span className="tab-n">0{i + 1}</span>
                  {p.name}
                </button>
              ))}
            </div>

            <div className="prog-wrap">
              {PRODUCTS.map((_, i) => (
                <div key={i} className="prog-bar">
                  <div
                    className={`prog-fill${active === i ? " go" : ""}`}
                    style={{ width: active === i ? undefined : "0%" }}
                  />
                </div>
              ))}
            </div>

            <div className="dots">
              {PRODUCTS.map((_, i) => (
                <button
                  key={i}
                  className={`dot-btn${active === i ? " on" : ""}`}
                  onClick={() => {
                    goTo(i)
                    startTimer()
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
              <button
                className="next-b"
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
          <div className="right-wrap">
            <div key={`card-${active}`} className={`v-card anim-${anim}`}>
              <div className="v-icon">{cur.icon}</div>
              {renderVisual(cur.visual)}
              <div className="v-stat">
                <div className="v-stat-lbl">Statistik Fitur</div>
                <div className="v-stat-row">
                  {cur.stat.map((s, i) => (
                    <div key={i} style={{ flex: 1 }}>
                      <div className="v-stat-v">{s.v}</div>
                      <div className="v-stat-l">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <div className="strip">
        <div className="strip-in">
          {FEATURES_MINI.map((f, i) => (
            <div key={i} className="s-item">
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DETAIL */}
      <section className="det-sec">
        <div className="det-in">
          <div className="det-head">
            <div className="det-tag">
              <span>Semua Fitur</span>
            </div>
            <h2 className="det-h2">
              Platform Lengkap untuk <em>Inventori</em> Kamu
            </h2>
            <p className="det-sub">
              Dari manajemen produk hingga laporan keuangan — semuanya ada dalam
              satu sistem terintegrasi.
            </p>
          </div>
          <div className="det-grid">
            {PRODUCTS.map((p, i) => (
              <div key={i} className="det-card">
                <div className="det-ico">{p.icon}</div>
                <span className="det-badge">{p.badge}</span>
                <h3 className="det-title">{p.name}</h3>
                <p className="det-desc">{p.desc}</p>
                <div className="det-stats">
                  {p.stat.map((s, j) => (
                    <div key={j}>
                      <div className="det-sv">{s.v}</div>
                      <div className="det-sl">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-sec">
        <div className="cta-in">
          <div className="cta-grid" />
          <h2 className="cta-h2">
            Siap Mulai Kelola Inventori <em>Lebih Cerdas?</em>
          </h2>
          <p className="cta-p">
            Bergabung dengan 500+ bisnis yang sudah menggunakan STOCKR untuk
            memantau stok dan meningkatkan efisiensi operasional.
          </p>
          <div className="cta-btns">
            <Link href="/register" className="btn-p">
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
            <Link href="/login" className="btn-g" style={{ color: "#fff" }}>
              Masuk ke Akun
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="f-logo">
          STOCK<em>R</em>
        </div>
        <div className="f-sub">© 2026 STOCKR · Inventory Management System</div>
      </footer>
    </>
  )
}
