import Link from "next/link"
import { IMG1 } from "../constants"

export default function HomeTeamSection() {
  return (
    <section className="px-8 py-25 bg-white">
      <div className="max-w-300 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 items-center">
          <div className="relative rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,.12)] animate-slide-in-up group">
            <img
              src={IMG1}
              alt="Manajemen inventori"
              className="w-full h-95 object-cover block transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(30,58,138,.15)_0%,transparent_50%)]" />
            <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,.1)]">
              <div className="font-black text-xl text-brand-700">10x</div>
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">
                Lebih Cepat
              </div>
            </div>
          </div>
          <div className="md:pl-4">
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.25 mb-4 bg-brand-500/10">
              <span className="text-brand-700 text-xs font-extrabold tracking-wide uppercase">
                Kolaborasi Tim
              </span>
            </div>
            <h2 className="font-black text-[clamp(26px,3.5vw,38px)] text-slate-900 tracking-tight leading-tight mb-4">
              Kerja Bareng Tim{" "}
              <em className="not-italic text-brand-700">Lebih Mudah</em>
            </h2>
            <p className="text-slate-500 text-[15px] leading-[1.75] font-medium mb-7">
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
                  className="flex items-start gap-3 text-sm text-gray-700 leading-normal font-semibold"
                >
                  <span
                    className="w-5 h-5 rounded-full shrink-0 mt-0.5 bg-linear-to-br from-brand-700 to-brand-500 bg-no-repeat bg-center"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 6l2.5 2.5L10 3' stroke='white' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E'), linear-gradient(135deg, #475569, #64748b)"
                    }}
                  />
                  {li}
                </li>
              ))}
            </ul>
            <Link
              href="/registration"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-brand-500 text-white text-sm font-extrabold no-underline shadow-[0_8px_24px_rgba(59,130,246,.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(59,130,246,.45)] hover:bg-brand-600"
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
