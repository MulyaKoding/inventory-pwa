export default function HomeAboutSection() {
  return (
    <section id="about" className="px-8 pb-25">
      <div className="relative overflow-hidden max-w-300 mx-auto rounded-[28px] px-9 md:px-16 py-14 md:py-18 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center bg-[linear-gradient(145deg,#f8fafc,#f1f5f9,#cbd5e1)]">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
        <div className="relative z-1">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.25 mb-4 bg-black/5">
            <span className="text-brand-300 text-xs font-extrabold tracking-wide uppercase">
              Tentang Kami
            </span>
          </div>
          <h2 className="font-black text-[clamp(26px,3.5vw,38px)] text-slate-900 tracking-tight mb-4">
            Dibangun untuk Bisnis yang Terus Berkembang
          </h2>
          <p className="text-slate-600 text-[15px] leading-[1.8] font-medium mb-8">
            STOCKR lahir dari kebutuhan nyata para pebisnis Indonesia yang
            kesulitan memantau stok secara akurat. Kami menghadirkan solusi yang
            sederhana, cepat, dan dapat diandalkan.
          </p>
          <div className="flex gap-2.5 flex-wrap">
            {[
              "Mudah Digunakan",
              "Cloud-Based",
              "Realtime Sync",
              "Multi Pengguna"
            ].map((c) => (
              <span
                key={c}
                className="bg-black/5 border border-slate-300 rounded-full px-4 py-1.5 text-slate-700 text-[13px] font-bold"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="relative z-1 grid grid-cols-2 gap-4">
          {[
            { v: "500+", l: "Bisnis Aktif" },
            { v: "2M+", l: "Produk Dikelola" },
            { v: "99.9%", l: "Uptime" },
            { v: "24/7", l: "Support" }
          ].map((c) => (
            <div
              key={c.l}
              className="bg-white/40 backdrop-blur-md border border-slate-300 rounded-2xl p-6"
            >
              <div className="font-black text-[28px] text-slate-900 tracking-tight">
                {c.v}
              </div>
              <div className="text-slate-500 text-xs font-bold mt-1.5 tracking-wide uppercase">
                {c.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
