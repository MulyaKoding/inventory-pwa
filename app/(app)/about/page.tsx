"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import CSChatWidget from "../components/CSChatWidget"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/product" },
  { label: "About Us", href: "/#about" }
]

const TEAM = [
  {
    name: "Arif Nugroho",
    role: "Founder & CEO",
    initials: "AN",
    color: "#087463",
    desc: "Berpengalaman 8 tahun di bidang supply chain dan pengembangan sistem ERP untuk UKM Indonesia."
  },
  {
    name: "Siti Rahayu",
    role: "Lead Developer",
    initials: "SR",
    color: "#065a4d",
    desc: "Full-stack engineer dengan spesialisasi di sistem inventori real-time dan integrasi marketplace."
  },
  {
    name: "Budi Santoso",
    role: "Product Designer",
    initials: "BS",
    color: "#0a9c84",
    desc: "UX/UI designer yang fokus pada kemudahan penggunaan sistem manajemen untuk bisnis lokal."
  },
  {
    name: "Dewi Lestari",
    role: "Customer Success",
    initials: "DL",
    color: "#054d42",
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
          fill="#0fbf9f"
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

export default function AboutPage() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Nunito', sans-serif;
      background: #f0faf7; color: #0f172a; overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

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

    /* NAV */
    .nav {
      position:fixed; top:0; left:0; right:0; z-index:100;
      transition:background .3s,box-shadow .3s;
      animation:navSlide .4s ease forwards;
    }
    .nav.s {
      background:rgba(255,255,255,.95); backdrop-filter:blur(18px);
      box-shadow:0 1px 0 rgba(0,0,0,.07),0 4px 20px rgba(8,116,99,.07);
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
      box-shadow:0 4px 14px rgba(8,116,99,.35);
    }
    .logo-lbl { color:#fff; font-weight:800; font-size:11px; letter-spacing:.05em; }
    .logo-name { font-family:'Nunito',sans-serif; font-weight:800; font-size:20px; letter-spacing:.07em; color:#0f172a; }
    .logo-em { color:#087463; font-style:normal; }

    .nav-links { display:flex; align-items:center; gap:2px; }
    .nl {
      padding:9px 20px; border-radius:8px; font-size:15px; font-weight:600;
      color:rgba(255,255,255,.83); text-decoration:none; transition:all .2s;
    }
    .nl:hover { color:#fff; background:rgba(255,255,255,.1); }
    .nl.on { color:#fff; font-weight:700; }
    .nav.s .nl { color:#475569; }
    .nav.s .nl:hover { color:#087463; background:rgba(8,116,99,.07); }
    .nav.s .nl.on { color:#087463; }

    .btn-l {
      height:42px; padding:0 22px; background:#fff; color:#087463;
      border:none; border-radius:10px; font-size:15px; font-weight:700;
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
      animation:menuIn .2s ease forwards;
    }
    .m-menu.op { display:block; }
    .m-nl {
      display:block; padding:13px 16px; border-radius:10px; font-size:15px; font-weight:600;
      color:#374151; text-decoration:none; margin-bottom:4px; transition:all .2s;
      border:none; background:none; width:100%; text-align:left; cursor:pointer;
    }
    .m-nl:hover,.m-nl.on { color:#087463; background:rgba(8,116,99,.08); }
    .m-login {
      margin-top:12px; width:100%; height:48px; background:#087463; color:#fff;
      border:none; border-radius:10px; font-size:15px; font-weight:700; cursor:pointer;
      text-decoration:none; display:flex; align-items:center; justify-content:center;
    }

    /* HERO */
    .hero {
      min-height:80vh; position:relative; overflow:hidden;
      background:linear-gradient(160deg,#032e27 0%,#087463 50%,#0a9c84 100%);
      display:flex; align-items:center; padding:120px 32px 80px;
    }
    .h-grid {
      position:absolute; inset:0;
      background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),
                       linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);
      background-size:48px 48px; animation:gridPan 10s linear infinite; pointer-events:none;
    }
    .h-glow {
      position:absolute; top:-80px; right:-80px; width:500px; height:500px;
      border-radius:50%; background:radial-gradient(circle,rgba(15,191,159,.22) 0%,transparent 65%); pointer-events:none;
    }
    .h-glow2 {
      position:absolute; bottom:-60px; left:-60px; width:340px; height:340px;
      border-radius:50%; background:radial-gradient(circle,rgba(255,255,255,.05) 0%,transparent 70%); pointer-events:none;
    }
    .hero-in {
      max-width:1200px; margin:0 auto; width:100%;
      display:grid; grid-template-columns:1fr 1fr; gap:72px; align-items:center;
      position:relative; z-index:1;
    }
    .hero-left { animation:slideInLeft .7s ease forwards; }
    .hero-right { animation:slideInRight .7s .1s ease both; }

    .hero-tag {
      display:inline-flex; align-items:center; gap:8px;
      background:rgba(255,255,255,.12); backdrop-filter:blur(8px);
      border-radius:100px; padding:7px 16px; margin-bottom:24px;
      position:relative; overflow:hidden; isolation:isolate;
    }
    .hero-tag::before {
      content:''; position:absolute; inset:-45px; border-radius:80px;
      background:conic-gradient(from 0deg,transparent 0%,transparent 80%,#c0c0c0 88%,#f0f0f0 92%,#c0c0c0 96%,transparent 100%);
      animation:border-rotate 2.4s linear infinite; z-index:-2;
    }
    .hero-tag::after {
      content:''; position:absolute; inset:1.5px; border-radius:100px;
      background:rgba(5,77,66,.85); backdrop-filter:blur(8px); z-index:-1;
    }
    .tag-dot { width:6px; height:6px; border-radius:50%; background:#0fbf9f; position:relative; flex-shrink:0; }
    .tag-dot::after {
      content:''; position:absolute; inset:-3px; border-radius:50%;
      background:rgba(15,191,159,.4); animation:pulse-ring 1.5s ease-out infinite;
    }
    .hero-tag span { color:rgba(255,255,255,.9); font-size:12px; font-family:'Nunito',sans-serif; letter-spacing:.04em; }

    .hero-h1 {
      font-family:'Nunito',sans-serif; font-weight:800;
      font-size:clamp(36px,5vw,56px); line-height:1.1;
      color:#fff; letter-spacing:-.02em; margin-bottom:20px;
    }
    .hero-h1 em { font-style:normal; color:#0fbf9f; }
    .hero-desc { color:rgba(255,255,255,.75); font-size:17px; line-height:1.75; margin-bottom:36px; max-width:460px; }

    /* Mission card floating */
    .mission-float {
      background:rgba(255,255,255,.08); backdrop-filter:blur(20px);
      border:1px solid rgba(255,255,255,.14); border-radius:24px;
      padding:36px; animation:floatY 5s ease-in-out infinite;
      box-shadow:0 24px 64px rgba(0,0,0,.28);
    }
    .mission-lbl {
      font-family:'Nunito',sans-serif; font-size:10px; font-weight:700;
      color:rgba(255,255,255,.45); text-transform:uppercase; letter-spacing:.1em; margin-bottom:14px;
    }
    .mission-text {
      font-size:17px; color:#fff; line-height:1.7; font-weight:600; margin-bottom:24px;
    }
    .mission-text em { font-style:normal; color:#0fbf9f; }
    .mission-chips { display:flex; gap:8px; flex-wrap:wrap; }
    .m-chip {
      background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.18);
      border-radius:100px; padding:5px 14px;
      color:rgba(255,255,255,.8); font-size:12px; font-weight:600;
    }

    /* STATS STRIP */
    .stats-strip { background:#fff; border-top:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0; padding:0; }
    .stats-strip-in {
      max-width:1200px; margin:0 auto;
      display:grid; grid-template-columns:repeat(4,1fr);
    }
    .stat-block {
      padding:36px 32px; border-right:1px solid #e2e8f0;
      animation:countUp .6s ease both;
    }
    .stat-block:last-child { border-right:none; }
    .stat-block-v {
      font-family:'Nunito',sans-serif; font-weight:800; font-size:38px;
      color:#087463; letter-spacing:-.03em; line-height:1;
    }
    .stat-block-l {
      color:#64748b; font-size:13px; font-weight:600; margin-top:6px;
      font-family:'Nunito',sans-serif; text-transform:uppercase; letter-spacing:.05em;
    }

    /* SECTION */
    .sec { padding:100px 32px; }
    .sec-in { max-width:1200px; margin:0 auto; }
    .sec-tag {
      display:inline-flex; align-items:center; gap:8px;
      background:rgba(8,116,99,.1); border-radius:100px; padding:5px 14px; margin-bottom:14px; margin-top:12px;
    }
    .sec-tag span { color:#087463; font-size:12px; font-weight:700; font-family:'Nunito',sans-serif; text-transform:uppercase; letter-spacing:.05em; }
    .sec-h2 {
      font-family:'Nunito',sans-serif; font-weight:800;
      font-size:clamp(28px,4vw,42px); color:#0f172a;
      letter-spacing:-.02em; line-height:1.2; margin-bottom:12px;
    }
    .sec-h2 em { font-style:normal; color:#087463; }
    .sec-sub { color:#64748b; font-size:16px; line-height:1.65; max-width:500px; margin-bottom:56px; }

    /* VALUES */
    .values-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:72px; }
    .val-card {
      background:#fff; border:1.5px solid #e2e8f0; border-radius:18px; padding:30px;
      transition:border-color .25s,box-shadow .25s,transform .25s;
    }
    .val-card:hover { border-color:#087463; box-shadow:0 8px 32px rgba(8,116,99,.12); transform:translateY(-4px); }
    .val-ico {
      width:56px; height:56px; border-radius:12px;
      background:linear-gradient(135deg,rgba(8,116,99,.1),rgba(15,191,159,.1));
      display:flex; align-items:center; justify-content:center; color:#087463; margin-bottom:18px;
    }
    .val-title { font-family:'Nunito',sans-serif; font-weight:800; font-size:17px; color:#0f172a; margin-bottom:8px; }
    .val-desc { color:#64748b; font-size:14px; line-height:1.65; }

    /* TIMELINE */
    .timeline-wrap { position:relative; }
    .timeline-line {
      position:absolute; left:80px; top:0; bottom:0; width:1.5px;
      background:linear-gradient(180deg,#087463,rgba(8,116,99,.1));
    }
    .tl-item {
      display:flex; gap:32px; align-items:flex-start; margin-bottom:36px; position:relative;
      animation:slideInLeft .6s ease both;
    }
    .tl-year {
      width:80px; flex-shrink:0; text-align:right; padding-right:20px; padding-top:4px;
      font-family:'Nunito',sans-serif; font-weight:700; font-size:14px; color:#087463;
    }
    .tl-dot-wrap {
      position:relative; z-index:1; flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
      margin-top:4px;
    }
    .tl-dot {
      width:12px; height:12px; border-radius:50%; background:#087463;
      box-shadow:0 0 0 4px rgba(8,116,99,.15);
    }
    .tl-content {
      flex:1; background:#fff; border:1.5px solid #e2e8f0; border-radius:16px;
      padding:20px 24px; transition:border-color .25s,box-shadow .25s;
    }
    .tl-content:hover { border-color:#087463; box-shadow:0 4px 20px rgba(8,116,99,.1); }
    .tl-title { font-weight:800; font-size:16px; color:#0f172a; margin-bottom:5px; font-family:'Nunito',sans-serif; }
    .tl-desc { color:#64748b; font-size:14px; line-height:1.6; }

    /* TEAM */
    .team-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
    .team-card {
      background:#fff; border:1.5px solid #e2e8f0; border-radius:18px;
      padding:28px 22px; text-align:center;
      transition:border-color .25s,box-shadow .25s,transform .25s;
      animation:slideInUp .6s ease both;
    }
    .team-card:hover { border-color:#087463; box-shadow:0 8px 32px rgba(8,116,99,.12); transform:translateY(-4px); }
    .team-avatar {
      width:72px; height:72px; border-radius:18px; margin:0 auto 16px;
      display:flex; align-items:center; justify-content:center;
      font-weight:800; font-size:18px; color:#fff; font-family:'Nunito',sans-serif;
      box-shadow:0 4px 16px rgba(0,0,0,.15);
    }
    .team-name { font-family:'Nunito',sans-serif; font-weight:800; font-size:15px; color:#0f172a; margin-bottom:4px; }
    .team-role {
      font-family:'Nunito',sans-serif; font-size:11px; font-weight:700;
      color:#087463; text-transform:uppercase; letter-spacing:.05em; margin-bottom:12px;
    }
    .team-desc { color:#64748b; font-size:13px; line-height:1.6; }

    /* CONTACT */
    .contact-sec {
      padding:0 32px 100px;
    }
    .contact-in {
      max-width:1200px; margin:0 auto;
      background:linear-gradient(145deg,#054d42,#087463,#0a9c84);
      border-radius:28px; padding:72px 64px;
      display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center;
      position:relative; overflow:hidden;
    }
    .contact-grid-bg {
      position:absolute; inset:0;
      background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),
                       linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);
      background-size:40px 40px; pointer-events:none;
    }
    .contact-left { position:relative; z-index:1; }
    .contact-h2 {
      font-family:'Nunito',sans-serif; font-weight:800;
      font-size:clamp(26px,3.5vw,38px); color:#fff;
      letter-spacing:-.02em; margin-bottom:14px;
    }
    .contact-h2 em { font-style:normal; color:#0fbf9f; }
    .contact-desc { color:rgba(255,255,255,.75); font-size:15px; line-height:1.75; margin-bottom:8px; }
    .contact-right { position:relative; z-index:1; display:flex; flex-direction:column; gap:14px; }
    .contact-item {
      display:flex; align-items:center; gap:16px;
      background:rgba(0,0,0,.2); backdrop-filter:blur(12px);
      border:1px solid rgba(255,255,255,.12); border-radius:16px; padding:20px 24px;
      text-decoration:none; transition:background .2s,border-color .2s,transform .15s;
    }
    .contact-item:hover { background:rgba(0,0,0,.32); border-color:rgba(255,255,255,.25); transform:translateX(4px); }
    .contact-ico {
      width:48px; height:48px; border-radius:12px;
      background:rgba(255,255,255,.12); display:flex; align-items:center; justify-content:center;
      flex-shrink:0;
    }
    .contact-label {
      font-family:'Nunito',sans-serif; font-size:10px; font-weight:700;
      color:rgba(255,255,255,.45); text-transform:uppercase; letter-spacing:.07em; margin-bottom:4px;
    }
    .contact-val { color:#fff; font-weight:700; font-size:16px; }

    /* FOOTER */
    .footer {
      background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 50%,#1f1f1f 100%);
      padding:40px 32px; text-align:center;
    }
    .f-logo { font-family:'Nunito',sans-serif; font-weight:800; font-size:22px; color:#fff; letter-spacing:.07em; margin-bottom:8px; }
    .f-logo em { font-style:normal; color:#0fbf9f; }
    .f-sub { color:rgba(255,255,255,.38); font-size:13px; font-family:'Nunito',sans-serif; font-weight:500; }

    /* RESPONSIVE */
    @media(max-width:960px){
      .hero-in { grid-template-columns:1fr; gap:48px; }
      .hero-right { order:-1; }
      .team-grid { grid-template-columns:repeat(2,1fr); }
      .stats-strip-in { grid-template-columns:repeat(2,1fr); }
      .stat-block:nth-child(2) { border-right:none; }
      .contact-in { grid-template-columns:1fr; gap:40px; padding:48px 36px; }
      .values-grid { grid-template-columns:1fr; }
    }
    @media(max-width:768px){
      .nav-links { display:none; } .btn-l { display:none; } .hbg { display:flex; }
      .hero { padding:100px 20px 60px; }
      .sec { padding:72px 20px; }
      .contact-sec { padding:0 20px 72px; }
      .nav-in { padding:0 20px; }
      .timeline-line { left:60px; }
      .tl-year { width:60px; font-size:12px; }
    }
    @media(max-width:480px){
      .team-grid { grid-template-columns:1fr; }
      .stats-strip-in { grid-template-columns:repeat(2,1fr); }
      .contact-in { padding:36px 24px; }
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
                className={`nl${n.label === "About Us" ? " on" : ""}`}
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
              className={`m-nl${n.label === "About Us" ? " on" : ""}`}
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
      <section className="hero">
        <div className="h-grid" />
        <div className="h-glow" />
        <div className="h-glow2" />
        <div className="hero-in">
          <div className="hero-left">
            <div className="hero-tag">
              <div className="tag-dot" />
              <span>Tentang STOCKR</span>
            </div>
            <h1 className="hero-h1">
              Kami Hadir untuk
              <br />
              <em>Bisnis Indonesia</em>
            </h1>
            <p className="hero-desc">
              STOCKR lahir dari satu misi sederhana: membantu pebisnis Indonesia
              kelola stok dengan mudah, akurat, dan efisien — tanpa ribet, tanpa
              buku catatan.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link
                href="/register"
                style={{
                  height: 52,
                  padding: "0 28px",
                  background: "#fff",
                  color: "#087463",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 8px 24px rgba(0,0,0,.15)",
                  transition: "transform .2s,box-shadow .2s"
                }}
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
                style={{
                  height: 52,
                  padding: "0 28px",
                  background: "rgba(255,255,255,.12)",
                  color: "#fff",
                  border: "1.5px solid rgba(255,255,255,.3)",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  backdropFilter: "blur(8px)"
                }}
              >
                Hubungi Kami
              </a>
            </div>
          </div>

          {/* Mission floating card */}
          <div className="hero-right">
            <div className="mission-float">
              <div className="mission-lbl">Misi Kami</div>
              <p className="mission-text">
                Menghadirkan <em>teknologi inventori kelas dunia</em> yang bisa
                diakses oleh setiap pelaku usaha di Indonesia — dari warung
                hingga warehouse.
              </p>
              <div className="mission-chips">
                {[
                  "Mudah Digunakan",
                  "Cloud-Based",
                  "Realtime Sync",
                  "Multi Pengguna",
                  "Data Aman"
                ].map((c) => (
                  <span key={c} className="m-chip">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <div className="stats-strip">
        <div className="stats-strip-in">
          {[
            { v: "500+", l: "Bisnis Aktif" },
            { v: "2M+", l: "Produk Dikelola" },
            { v: "99.9%", l: "Uptime" },
            { v: "2022", l: "Tahun Berdiri" }
          ].map((s, i) => (
            <div
              key={i}
              className="stat-block"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="stat-block-v">{s.v}</div>
              <div className="stat-block-l">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* VALUES & STORY */}
      <section className="sec" style={{ background: "#f0faf7" }}>
        <div className="sec-in">
          <div className="sec-tag">
            <span>Nilai Kami</span>
          </div>
          <h2 className="sec-h2">
            Prinsip yang Membentuk <em>STOCKR</em>
          </h2>
          <p className="sec-sub">
            Setiap keputusan produk kami berakar dari tiga nilai utama ini.
          </p>
          <div className="values-grid">
            {VALUES.map((v, i) => (
              <div
                key={i}
                className="val-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="val-ico">{v.icon}</div>
                <h3 className="val-title">{v.title}</h3>
                <p className="val-desc">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="sec-tag">
            <span>Perjalanan Kami</span>
          </div>
          <h2 className="sec-h2" style={{ marginBottom: 12 }}>
            Dari Ide ke <em>Kenyataan</em>
          </h2>
          <p className="sec-sub">
            Perjalanan STOCKR membangun solusi inventori terpercaya untuk
            Indonesia.
          </p>
          <div className="timeline-wrap">
            <div className="timeline-line" />
            {TIMELINE.map((t, i) => (
              <div
                key={i}
                className="tl-item"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="tl-year">{t.year}</div>
                <div className="tl-dot-wrap">
                  <div className="tl-dot" />
                </div>
                <div className="tl-content">
                  <div className="tl-title">{t.title}</div>
                  <div className="tl-desc">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section
        className="sec"
        style={{ background: "#fff", paddingTop: 0, paddingBottom: 100 }}
      >
        <div className="sec-in">
          <div className="sec-tag">
            <span>Tim Kami</span>
          </div>
          <h2 className="sec-h2">
            Orang-Orang di Balik <em>STOCKR</em>
          </h2>
          <p className="sec-sub">
            Tim kecil dengan semangat besar untuk transformasi digital bisnis
            Indonesia.
          </p>
          <div className="team-grid">
            {TEAM.map((m, i) => (
              <div
                key={i}
                className="team-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className="team-avatar"
                  style={{
                    background: `linear-gradient(135deg, ${m.color}, #0fbf9f)`
                  }}
                >
                  {m.initials}
                </div>
                <div className="team-name">{m.name}</div>
                <div className="team-role">{m.role}</div>
                <p className="team-desc">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="contact-sec">
        <div className="contact-in">
          <div className="contact-grid-bg" />
          <div className="contact-left">
            <div
              className="sec-tag"
              style={{ background: "rgba(255,255,255,.15)", marginBottom: 16 }}
            >
              <span style={{ color: "#fff" }}>Hubungi Kami</span>
            </div>
            <h2 className="contact-h2">
              Ada Pertanyaan?
              <br />
              Kami Siap <em>Membantu</em>
            </h2>
            <p className="contact-desc">
              Tim kami siap membantu kamu memulai atau menjawab pertanyaan
              seputar STOCKR. Jangan ragu untuk menghubungi kami.
            </p>
            <p
              className="contact-desc"
              style={{
                color: "rgba(255,255,255,.5)",
                fontSize: 13,
                marginTop: 8
              }}
            >
              Jam operasional: Senin – Jumat, 08.00 – 17.00 WIB
            </p>
          </div>
          <div className="contact-right">
            {/* WhatsApp */}
            <a
              href="https://wa.me/6285218789439"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-item"
            >
              <div className="contact-ico">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
                    fill="#0fbf9f"
                  />
                  <path
                    d="M12 2C6.477 2 2 6.477 2 12c0 1.89.524 3.656 1.435 5.163L2 22l4.978-1.405A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
                    stroke="rgba(255,255,255,.4)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </div>
              <div>
                <div className="contact-label">WhatsApp</div>
                <div className="contact-val">+62 852-1878-9439</div>
              </div>
              <div
                style={{ marginLeft: "auto", color: "rgba(255,255,255,.35)" }}
              >
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
            <a href="tel:+6285218789439" className="contact-item">
              <div className="contact-ico">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0fbf9f"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <div>
                <div className="contact-label">Telepon</div>
                <div className="contact-val">+62 852-1878-9439</div>
              </div>
              <div
                style={{ marginLeft: "auto", color: "rgba(255,255,255,.35)" }}
              >
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
            <a href="mailto:hello@stockr.id" className="contact-item">
              <div className="contact-ico">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0fbf9f"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <div className="contact-label">Email</div>
                <div className="contact-val">hello@stockr.id</div>
              </div>
              <div
                style={{ marginLeft: "auto", color: "rgba(255,255,255,.35)" }}
              >
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
      <footer className="footer">
        <div className="f-logo">
          STOCK<em>R</em>
        </div>
        <div className="f-sub">© 2026 STOCKR · Inventory Management System</div>
      </footer>
      <CSChatWidget />
    </>
  )
}
