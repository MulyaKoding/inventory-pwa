import Link from "next/link"
import { cn } from "../../../lib/utils"
import { PRODUCTS, STATUS_STYLES, STOCK_COLOR } from "../constants"

export default function HomeProductTable() {
  return (
    <div className="px-8 pb-25 bg-[#070d19] text-white">
      <div className="max-w-300 mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.25 mb-4 bg-brand-500/15 border border-white/10">
              <span className="text-brand-400 text-xs font-extrabold tracking-wide uppercase">
                Produk
              </span>
            </div>
            <h2 className="font-black text-[clamp(28px,4vw,42px)] text-white tracking-tight leading-tight">
              Contoh Data{" "}
              <em className="not-italic text-brand-400">Inventori</em>
            </h2>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center h-11 px-6 rounded-[10px] text-sm font-extrabold no-underline bg-brand-500 text-white shadow-[0_4px_12px_rgba(59,130,246,.4)] hover:bg-[#2563eb]"
          >
            Kelola Sekarang →
          </Link>
        </div>

        <div className="bg-[#0f172a] border border-white/10 rounded-[18px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,.5)] animate-slide-in-up">
          <table className="w-full border-collapse">
            <thead className="bg-[#0b1329] border-b border-white/10">
              <tr>
                <th className="text-left px-5 py-4 text-[11px] font-extrabold text-white/50 tracking-widest uppercase">
                  Nama Produk
                </th>
                <th className="text-left px-5 py-4 text-[11px] font-extrabold text-white/50 tracking-widest uppercase">
                  Kategori
                </th>
                <th className="text-left px-5 py-4 text-[11px] font-extrabold text-white/50 tracking-widest uppercase">
                  Stok
                </th>
                <th className="text-left px-5 py-4 text-[11px] font-extrabold text-white/50 tracking-widest uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((p, i) => (
                <tr
                  key={i}
                  className="border-b border-white/5 last:border-none transition-colors hover:bg-white/5"
                >
                  <td className="px-5 py-4 text-sm">
                    <div className="font-extrabold text-white">{p.name}</div>
                    <div className="text-xs text-white/40 font-semibold mt-0.5">
                      {p.sku}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-white/60 font-medium">
                    {p.cat}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span
                      className={cn(
                        "font-black text-[15px]",
                        STOCK_COLOR(p.stock)
                      )}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span
                      className={cn(
                        "inline-block text-[11px] font-extrabold px-3 py-1 rounded-full",
                        STATUS_STYLES[p.status]
                      )}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
