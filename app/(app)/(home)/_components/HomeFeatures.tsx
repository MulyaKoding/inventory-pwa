import { FEATURES } from "../constants"

export default function HomeFeatures() {
  return (
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
  )
}
