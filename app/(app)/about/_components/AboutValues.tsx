import { VALUES, TIMELINE } from "../constants"

export default function AboutValues() {
  return (
    <section className="px-8 py-25 max-[768px]:px-5 max-[768px]:py-18 bg-[#060b1a] text-white">
      <div className="max-w-300 mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-white/10 rounded-full px-3.5 py-1.25 mb-3.5 mt-3">
          <span className="text-brand-400 text-xs font-bold uppercase tracking-[0.05em]">
            Nilai Kami
          </span>
        </div>
        <h2 className="font-extrabold text-[clamp(28px,4vw,42px)] text-white tracking-[-0.02em] leading-[1.2] mb-3">
          Prinsip yang Membentuk{" "}
          <em className="not-italic text-brand-400">STOCKR</em>
        </h2>
        <p className="text-white/60 text-base leading-[1.65] max-w-125 mb-14">
          Setiap keputusan produk kami berakar dari tiga nilai utama ini.
        </p>

        <div className="grid grid-cols-3 max-[960px]:grid-cols-1 gap-5 mb-18">
          {VALUES.map((v, i) => (
            <div
              key={i}
              className="bg-[#0f172a] border border-white/10 rounded-[18px] p-7.5 transition-[border-color,box-shadow,transform] duration-250 hover:border-brand-400 hover:shadow-[0_8px_32px_rgba(59,130,246,0.2)] hover:-translate-y-1"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-brand-500/15 flex items-center justify-center text-brand-400 mb-4.5">
                {v.icon}
              </div>
              <h3 className="font-extrabold text-[17px] text-white mb-2">
                {v.title}
              </h3>
              <p className="text-white/60 text-sm leading-[1.65]">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-white/10 rounded-full px-3.5 py-1.25 mb-3.5 mt-3">
          <span className="text-brand-400 text-xs font-bold uppercase tracking-[0.05em]">
            Perjalanan Kami
          </span>
        </div>
        <h2 className="font-extrabold text-[clamp(28px,4vw,42px)] text-white tracking-[-0.02em] leading-[1.2] mb-3">
          Dari Ide ke <em className="not-italic text-brand-400">Kenyataan</em>
        </h2>
        <p className="text-white/60 text-base leading-[1.65] max-w-125 mb-14">
          Perjalanan STOCKR membangun solusi inventori terpercaya untuk
          Indonesia.
        </p>

        <div className="relative">
          <div className="absolute left-20 max-[768px]:left-15 top-0 bottom-0 w-[1.5px] bg-linear-to-b from-brand-500 to-white/10" />
          {TIMELINE.map((t, i) => (
            <div
              key={i}
              className="flex gap-8 items-start mb-9 relative animate-[slideInLeft_0.6s_ease_both]"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="w-20 max-[768px]:w-15 shrink-0 text-right pr-5 pt-1 font-bold text-sm max-[768px]:text-xs text-brand-400">
                {t.year}
              </div>
              <div className="relative z-1 shrink-0 flex items-center justify-center mt-1">
                <div className="w-3 h-3 rounded-full bg-brand-400 shadow-[0_0_0_4px_rgba(59,130,246,0.3)]" />
              </div>
              <div className="flex-1 bg-[#0f172a] border border-white/10 rounded-2xl px-6 py-5 transition-[border-color,box-shadow] duration-250 hover:border-brand-400 hover:shadow-[0_4px_20px_rgba(59,130,246,0.2)]">
                <div className="font-extrabold text-base text-white mb-1.25">
                  {t.title}
                </div>
                <div className="text-white/60 text-sm leading-[1.6]">
                  {t.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
