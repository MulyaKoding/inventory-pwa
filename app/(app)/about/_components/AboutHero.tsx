import Link from "next/link"

export default function AboutHero() {
  return (
    <section className="min-h-[80vh] relative overflow-hidden bg-[linear-gradient(160deg,#060b1a_0%,#0c1733_25%,#0f2050_50%,#0c1a3a_75%,#080d1f_100%)] text-white flex items-center px-8 pt-30 pb-20 max-[768px]:px-5 max-[768px]:pt-25 max-[768px]:pb-15">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[48px_48px] animate-grid-pan" />
      <div className="absolute -top-20 -right-20 w-125 h-125 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.2)_0%,transparent_65%)] pointer-events-none" />
      <div className="absolute -bottom-15 -left-15 w-85 h-85 rounded-full bg-[radial-gradient(circle,rgba(30,58,138,0.15)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-300 mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-18 max-[960px]:gap-12 items-center relative z-1">
        <div className="animate-slide-in-left">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.75 mb-6 relative overflow-hidden border border-white/15 bg-white/8 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-400 relative shrink-0 after:content-[''] after:absolute after:-inset-0.75 after:rounded-full after:bg-[rgba(96,165,250,0.4)] after:animate-pulse-ring" />
            <span className="text-white/85 text-xs tracking-[0.04em]">
              Tentang STOCKR
            </span>
          </div>

          <h1 className="font-extrabold text-[clamp(36px,5vw,56px)] leading-[1.1] text-white tracking-[-0.02em] mb-5">
            Kami Hadir untuk
            <br />
            <em className="not-italic text-brand-400">Bisnis Indonesia</em>
          </h1>
          <p className="text-white/65 text-[17px] leading-[1.75] mb-9 max-w-115">
            STOCKR lahir dari satu misi sederhana: membantu pebisnis Indonesia
            kelola stok dengan mudah, akurat, dan efisien — tanpa ribet, tanpa
            buku catatan.
          </p>

          <div className="flex gap-3 flex-wrap">
            <Link
              href="/register"
              className="h-13 px-7 bg-brand-500 text-white border-none rounded-xl text-[15px] font-bold cursor-pointer no-underline inline-flex items-center gap-2 shadow-[0_8px_24px_rgba(59,130,246,0.4)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(59,130,246,0.5)] hover:bg-[#2563eb]"
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
              className="h-13 px-7 bg-white/8 text-white border-[1.5px] border-white/20 rounded-xl text-[15px] font-bold cursor-pointer no-underline inline-flex items-center backdrop-blur-sm transition-colors duration-200 hover:bg-white/16"
            >
              Hubungi Kami
            </a>
          </div>
        </div>

        {/* Mission floating card */}
        <div className="order-first md:order-0 animate-[slideInRight_0.7s_ease_0.1s_both]">
          <div className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-3xl p-9 animate-float-y shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3.5">
              Misi Kami
            </div>
            <p className="text-[17px] text-white leading-[1.7] font-semibold mb-6">
              Menghadirkan{" "}
              <em className="not-italic text-brand-400">
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
                  className="bg-white/8 border border-white/15 rounded-full px-3.5 py-1.25 text-white/80 text-xs font-semibold"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
