import React from "react"

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/product" },
  { label: "About Us", href: "/about" }
]

export const TEAM = [
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

export const TIMELINE = [
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

export const VALUES = [
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
