export default function AboutContact() {
  return (
    <section
      id="contact"
      className="px-8 pb-25 max-[768px]:px-5 max-[768px]:pb-18"
    >
      <div className="max-w-300 mx-auto bg-[linear-gradient(145deg,#f8fafc,#f1f5f9,#cbd5e1)] rounded-[28px] px-16 py-18 max-[960px]:px-9 max-[960px]:py-12 grid grid-cols-1 md:grid-cols-2 gap-16 max-[960px]:gap-10 items-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-size-[40px_40px]" />

        <div className="relative z-1">
          <div className="inline-flex items-center gap-2 bg-black/5 rounded-full px-3.5 py-1.25 mb-4">
            <span className="text-brand-300 text-xs font-bold uppercase tracking-[0.05em]">
              Hubungi Kami
            </span>
          </div>
          <h2 className="font-extrabold text-[clamp(26px,3.5vw,38px)] text-slate-900 tracking-[-0.02em] mb-3.5">
            Ada Pertanyaan?
            <br />
            Kami Siap <em className="not-italic text-brand-400">Membantu</em>
          </h2>
          <p className="text-slate-600 text-[15px] leading-[1.75] mb-2">
            Tim kami siap membantu kamu memulai atau menjawab pertanyaan seputar
            STOCKR. Jangan ragu untuk menghubungi kami.
          </p>
          <p className="text-slate-500 text-[13px] leading-[1.75] mt-2">
            Jam operasional: Senin – Jumat, 08.00 – 17.00 WIB
          </p>
        </div>

        <div className="relative z-1 flex flex-col gap-3.5">
          {/* WhatsApp */}
          <a
            href="https://wa.me/6285218789439"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white/40 backdrop-blur-md border border-slate-300 rounded-2xl px-6 py-5 no-underline transition-[background,border-color,transform] duration-200 hover:bg-black/32 hover:border-slate-400 hover:translate-x-1"
          >
            <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
                  fill="#94a3b8"
                />
                <path
                  d="M12 2C6.477 2 2 6.477 2 12c0 1.89.524 3.656 1.435 5.163L2 22l4.978-1.405A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
                  stroke="rgba(255,255,255,.35)"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.07em] mb-1">
                WhatsApp
              </div>
              <div className="text-slate-900 font-bold text-base">
                +62 852-1878-9439
              </div>
            </div>
            <div className="ml-auto text-slate-400">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          {/* Phone */}
          <a
            href="tel:+6285218789439"
            className="flex items-center gap-4 bg-white/40 backdrop-blur-md border border-slate-300 rounded-2xl px-6 py-5 no-underline transition-[background,border-color,transform] duration-200 hover:bg-black/32 hover:border-slate-400 hover:translate-x-1"
          >
            <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center shrink-0">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.07em] mb-1">
                Telepon
              </div>
              <div className="text-slate-900 font-bold text-base">
                +62 852-1878-9439
              </div>
            </div>
            <div className="ml-auto text-slate-400">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:hello@stockr.id"
            className="flex items-center gap-4 bg-white/40 backdrop-blur-md border border-slate-300 rounded-2xl px-6 py-5 no-underline transition-[background,border-color,transform] duration-200 hover:bg-black/32 hover:border-slate-400 hover:translate-x-1"
          >
            <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center shrink-0">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.07em] mb-1">
                Email
              </div>
              <div className="text-slate-900 font-bold text-base">
                hello@stockr.id
              </div>
            </div>
            <div className="ml-auto text-slate-400">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
}
