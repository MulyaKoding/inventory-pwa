import React from "react"

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/product" },
  { label: "About Us", href: "/about" }
]

export const STATS = [
  { value: "248", label: "Total Produk", icon: "📦" },
  { value: "63", label: "Order Hari Ini", icon: "🛒" },
  { value: "Rp 48.2M", label: "Revenue Bulan Ini", icon: "💰" },
  { value: "12", label: "Kategori Aktif", icon: "🏷️" }
]

export const FEATURES = [
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
          fill="#64748b"
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

export const PRODUCTS = [
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

export const IMG1 =
  "https://res.cloudinary.com/dp0dtct3v/image/upload/v1775017437/ic_sb_nra10b.jpg"
export const IMG2 =
  "https://res.cloudinary.com/dp0dtct3v/image/upload/v1775017346/ic_bs_kh3emc.jpg"

export const STATUS_STYLES: Record<string, string> = {
  Aman: "text-blue-700 bg-blue-700/10",
  Menipis: "text-amber-500 bg-amber-500/10",
  Habis: "text-red-500 bg-red-500/10"
}

export const STOCK_COLOR = (stock: number) =>
  stock === 0 ? "text-red-500" : stock < 8 ? "text-amber-500" : "text-brand-700"
