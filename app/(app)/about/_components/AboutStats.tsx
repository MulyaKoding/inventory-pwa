import { cn } from "../../../lib/utils"

export default function AboutStats() {
  return (
    <div className="bg-white border-y border-[#e2e8f0]">
      <div className="max-w-300 mx-auto grid grid-cols-4 max-[960px]:grid-cols-2">
        {[
          { v: "500+", l: "Bisnis Aktif" },
          { v: "2M+", l: "Produk Dikelola" },
          { v: "99.9%", l: "Uptime" },
          { v: "2022", l: "Tahun Berdiri" }
        ].map((s, i) => (
          <div
            key={i}
            className={cn(
              "px-8 py-9 border-r border-[#e2e8f0] animate-[countUp_0.6s_ease_both] last:border-r-0",
              i === 1 && "max-[960px]:border-r-0"
            )}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="font-extrabold text-[38px] text-brand-700 tracking-[-0.03em] leading-none">
              {s.v}
            </div>
            <div className="text-[#64748b] text-[13px] font-semibold mt-1.5 uppercase tracking-[0.05em]">
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
