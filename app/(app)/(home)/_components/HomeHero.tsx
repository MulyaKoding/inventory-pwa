import Link from "next/link"
import { STATS, IMG1, IMG2 } from "../constants"

export default function HomeHero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden min-h-screen flex items-center px-8 pt-25 pb-15 bg-[linear-gradient(160deg,#060b1a_0%,#0c1733_25%,#0f2050_50%,#0c1a3a_75%,#080d1f_100%)] text-white"
    >
      <div
        className="absolute inset-0 pointer-events-none animate-grid-pan"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px"
        }}
      />
      <div className="absolute -top-30 -right-30 w-125 h-125 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,.2)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-95 h-95 rounded-full bg-[radial-gradient(circle,rgba(30,58,138,.15)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-1 max-w-300 w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="animate-slide-in-left">
          <div className="relative isolate inline-flex items-center gap-2 rounded-full px-4 py-1.75 mb-6 overflow-hidden bg-white/8 border border-white/15 backdrop-blur-sm">
            <div className="relative w-1.5 h-1.5 rounded-full bg-brand-400">
              <div className="absolute -inset-0.75 rounded-full bg-brand-400/40 animate-pulse-ring" />
            </div>
            <span className="text-white/85 text-xs font-bold tracking-wide">
              Sistem Manajemen Inventori
            </span>
          </div>

          <h1 className="font-black text-[clamp(36px,5vw,58px)] leading-[1.1] text-white tracking-tight mb-5">
            Kelola Stok Lebih
            <br />
            <em className="not-italic text-brand-400">Cerdas &amp; Efisien</em>
          </h1>
          <p className="text-white/65 text-[17px] leading-[1.7] font-medium mb-9 max-w-110">
            STOCKR membantu bisnis kamu memantau stok, mengelola produk, dan
            melacak transaksi — semua dari satu platform yang mudah digunakan.
          </p>

          <div className="flex gap-3.5 flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 h-13 px-7 rounded-xl bg-brand-500 text-white text-[15px] font-extrabold no-underline shadow-[0_8px_24px_rgba(59,130,246,.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(59,130,246,.5)] hover:bg-[#2563eb]"
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
              className="inline-flex items-center h-13 px-7 rounded-xl border-[1.5px] border-white/20 bg-white/8 text-white text-[15px] font-extrabold no-underline backdrop-blur-sm transition-colors hover:bg-white/16 hover:border-white/40"
            >
              Lihat Fitur
            </a>
          </div>

          <div className="flex gap-5 mt-12 flex-wrap">
            {STATS.map((s, i) => (
              <div
                key={i}
                className="bg-black/35 backdrop-blur-md border border-white/8 rounded-xl px-5 py-3.5 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-white font-black text-[22px] tracking-tight">
                  {s.value}
                </div>
                <div className="text-white/45 text-[11px] font-semibold tracking-wide uppercase mt-0.75">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── IMAGE COLLAGE ── */}
        <div className="animate-slide-in-right">
          <div className="relative w-full h-120">
            <div className="absolute top-0 right-0 w-[78%] h-80 rounded-[20px] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,.6)] border border-white/10 animate-img-reveal group">
              <img
                src={IMG1}
                alt="Manajemen inventori"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 rounded-[20px] bg-[linear-gradient(135deg,rgba(30,58,138,.3)_0%,transparent_60%)]" />
            </div>

            <div className="absolute bottom-0 left-0 w-[58%] h-60 rounded-2xl overflow-hidden border-[3px] border-white/20 shadow-[0_16px_48px_rgba(0,0,0,.5)] animate-img-reveal group">
              <img
                src={IMG2}
                alt="Analisis stok"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,.3)_0%,transparent_60%)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
