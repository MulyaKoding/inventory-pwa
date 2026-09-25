export default function HomeSocialProof() {
  return (
    <div className="bg-[#080d1a] px-8 py-7 border-y border-white/10 text-white">
      <div className="max-w-300 mx-auto flex items-center justify-between flex-wrap gap-6">
        <span className="text-xs font-bold text-white/45 tracking-wide uppercase">
          Dipercaya oleh
        </span>
        <div className="flex items-center">
          <div className="flex items-center">
            {["A", "B", "C", "D", "E"].map((l, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full border-2 border-[#080d1a] overflow-hidden -ml-2 first:ml-0 flex items-center justify-center text-xs font-extrabold text-white"
                style={{
                  background: `linear-gradient(135deg, #1e3a5f ${i * 20}%, #2563eb)`
                }}
              >
                {l}
              </div>
            ))}
          </div>
          <span className="text-sm font-bold text-white/80 ml-3">
            <em className="not-italic text-brand-400">500+</em> bisnis aktif
          </span>
        </div>
        <div className="hidden sm:block w-px h-8 bg-white/10" />
        <div className="text-center">
          <div className="font-black text-xl text-white">2M+</div>
          <div className="text-[11px] text-white/45 font-bold uppercase tracking-wide">
            Produk Dikelola
          </div>
        </div>
        <div className="hidden sm:block w-px h-8 bg-white/10" />
        <div className="text-center">
          <div className="font-black text-xl text-white">99.9%</div>
          <div className="text-[11px] text-white/45 font-bold uppercase tracking-wide">
            Uptime
          </div>
        </div>
        <div className="hidden sm:block w-px h-8 bg-white/10" />
        <div className="text-center">
          <div className="font-black text-xl text-white">4.9★</div>
          <div className="text-[11px] text-white/45 font-bold uppercase tracking-wide">
            Rating Pengguna
          </div>
        </div>
      </div>
    </div>
  )
}
