import Link from "next/link"
import { IMG1 } from "../constants"

export default function HomeTeamSection() {
  return (
    <section className="px-8 py-25 bg-[#080d1a] text-white border-t border-white/10">
      <div className="max-w-300 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 items-center">
          <div className="relative rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,.5)] border border-white/10 animate-slide-in-up group">
            <img
              src={IMG1}
              alt="Manajemen inventori"
              className="w-full h-95 object-cover block transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(30,58,138,.3)_0%,transparent_50%)]" />
            <div className="absolute bottom-5 left-5 bg-[#0f172a]/90 border border-white/10 backdrop-blur-md rounded-xl px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,.5)]">
              <div className="font-black text-xl text-brand-400">10x</div>
              <div className="text-[11px] text-white/50 font-bold uppercase tracking-wide mt-0.5">
                Lebih Cepat
              </div>
            </div>
          </div>
          <div className="md:pl-4">
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.25 mb-4 bg-brand-500/15 border border-white/10">
              <span className="text-brand-400 text-xs font-extrabold tracking-wide uppercase">
                Kolaborasi Tim
              </span>
            </div>
            <h2 className="font-black text-[clamp(26px,3.5vw,38px)] text-white tracking-tight leading-tight mb-4">
              Kerja Bareng Tim{" "}
              <em className="not-italic text-brand-400">Lebih Mudah</em>
            </h2>
            <p className="text-white/60 text-[15px] leading-[1.75] font-medium mb-7">
              STOCKR dirancang untuk tim yang berkembang. Multi-user, permission
              berbasis peran, dan aktivitas log real-time agar semua anggota tim
              tetap sinkron.
            </p>
            <ul className="flex flex-col gap-3 mb-8 list-none">
              {[
                "Akses multi-pengguna dengan level permission",
                "Notifikasi real-time untuk setiap perubahan stok",
                "Log aktivitas lengkap untuk audit trail",
                "Dashboard personal per departemen"
              ].map((li) => (
                <li
                  key={li}
                  className="flex items-start gap-3 text-sm text-white/80 leading-normal font-semibold"
                >
                  <span
                    className="w-5 h-5 rounded-full shrink-0 mt-0.5 bg-no-repeat bg-center"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 6l2.5 2.5L10 3' stroke='white' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E'), linear-gradient(135deg, #1e3a5f, #2563eb)"
                    }}
                  />
                  {li}
                </li>
              ))}
            </ul>
            <Link
              href="/registration"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-brand-500 text-white text-sm font-extrabold no-underline shadow-[0_8px_24px_rgba(59,130,246,.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(59,130,246,.5)] hover:bg-[#2563eb]"
            >
              Coba Sekarang
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
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
