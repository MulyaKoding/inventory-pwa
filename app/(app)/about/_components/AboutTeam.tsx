import { TEAM } from "../constants"

export default function AboutTeam() {
  return (
    <section className="px-8 pt-0 pb-25 max-[768px]:px-5 bg-white">
      <div className="max-w-300 mx-auto">
        <div className="inline-flex items-center gap-2 bg-[rgba(59,130,246,0.1)] rounded-full px-3.5 py-1.25 mb-3.5 mt-3">
          <span className="text-brand-700 text-xs font-bold uppercase tracking-[0.05em]">
            Tim Kami
          </span>
        </div>
        <h2 className="font-extrabold text-[clamp(28px,4vw,42px)] text-[#0f172a] tracking-[-0.02em] leading-[1.2] mb-3">
          Orang-Orang di Balik{" "}
          <em className="not-italic text-brand-700">STOCKR</em>
        </h2>
        <p className="text-[#64748b] text-base leading-[1.65] max-w-125 mb-14">
          Tim kecil dengan semangat besar untuk transformasi digital bisnis
          Indonesia.
        </p>

        <div className="grid grid-cols-4 max-[960px]:grid-cols-2 max-[480px]:grid-cols-1 gap-5">
          {TEAM.map((m, i) => (
            <div
              key={i}
              className="bg-white border-[1.5px] border-[#e2e8f0] rounded-[18px] px-5.5 py-7 text-center transition-[border-color,box-shadow,transform] duration-250 hover:border-brand-500 hover:shadow-[0_8px_32px_rgba(59,130,246,0.12)] hover:-translate-y-1 animate-slide-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className="w-18 h-18 rounded-2xl mx-auto mb-4 flex items-center justify-center font-extrabold text-lg text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
                style={{
                  background: `linear-gradient(135deg, ${m.color}, #3b82f6)`
                }}
              >
                {m.initials}
              </div>
              <div className="font-extrabold text-[15px] text-[#0f172a] mb-1">
                {m.name}
              </div>
              <div className="text-[11px] font-bold text-brand-500 uppercase tracking-[0.05em] mb-3">
                {m.role}
              </div>
              <p className="text-[#64748b] text-[13px] leading-[1.6]">
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
