export default function HomeSocialProof() {
  return (
    <div className="bg-white px-8 py-7 border-b border-slate-200">
      <div className="max-w-300 mx-auto flex items-center justify-between flex-wrap gap-6">
        <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">
          Dipercaya oleh
        </span>
        <div className="flex items-center">
          <div className="flex items-center">
            {["A", "B", "C", "D", "E"].map((l, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full border-2 border-white overflow-hidden -ml-2 first:ml-0 flex items-center justify-center text-xs font-extrabold text-slate-900"
                style={{
                  background: `linear-gradient(135deg, #475569 ${i * 20}%, #64748b)`
                }}
              >
                {l}
              </div>
            ))}
          </div>
          <span className="text-sm font-bold text-gray-700 ml-3">
            <em className="not-italic text-brand-700">500+</em> bisnis aktif
          </span>
        </div>
        <div className="hidden sm:block w-px h-8 bg-slate-200" />
        <div className="text-center">
          <div className="font-black text-xl text-slate-900">2M+</div>
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
            Produk Dikelola
          </div>
        </div>
        <div className="hidden sm:block w-px h-8 bg-slate-200" />
        <div className="text-center">
          <div className="font-black text-xl text-slate-900">99.9%</div>
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
            Uptime
          </div>
        </div>
        <div className="hidden sm:block w-px h-8 bg-slate-200" />
        <div className="text-center">
          <div className="font-black text-xl text-slate-900">4.9★</div>
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
            Rating Pengguna
          </div>
        </div>
      </div>
    </div>
  )
}
