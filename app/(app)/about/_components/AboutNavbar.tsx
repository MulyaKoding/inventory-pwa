"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "../../../lib/utils"
import { NAV_LINKS } from "../constants"

export default function AboutNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-100 transition-[background,box-shadow] duration-300 animate-nav-slide",
        scrolled &&
          "bg-[rgba(255,255,255,0.96)] backdrop-blur-[18px] shadow-[0_1px_0_rgba(0,0,0,0.06),0_4px_20px_rgba(0,0,0,0.08)]"
      )}
    >
      <div className="max-w-300 mx-auto flex items-center justify-between px-8 max-[768px]:px-5 h-17.5">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-10 h-10 rounded-[10px] bg-linear-to-br from-brand-700 to-brand-500 flex items-center justify-center shadow-[0_4px_14px_rgba(59,130,246,0.4)]">
            <span className="text-white font-extrabold text-[11px] tracking-[0.05em]">
              INV
            </span>
          </div>
          <span className="font-extrabold text-xl tracking-[0.07em] text-slate-900">
            STOCK<em className="not-italic text-brand-500">R</em>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className={cn(
                "px-5 py-2.25 rounded-lg text-[15px] no-underline transition-all duration-200 hover:text-slate-900 hover:bg-black/5",
                scrolled ? "text-slate-600" : "text-slate-700",
                n.label === "About Us"
                  ? cn("font-bold", scrolled ? "text-brand-400" : "text-slate-900")
                  : "font-semibold"
              )}
            >
              {n.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={cn(
              "h-10.5 px-5.5 rounded-[10px] text-[15px] font-bold no-underline flex items-center shadow-[0_4px_12px_rgba(0,0,0,0.13)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(0,0,0,0.18)] max-[768px]:hidden",
              scrolled
                ? "bg-brand-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)] hover:bg-[#2563eb]"
                : "bg-white text-brand-700"
            )}
          >
            Login
          </Link>
          <button
            className="hidden max-[768px]:flex flex-col gap-1.25 cursor-pointer p-1.5 bg-transparent border-none"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="menu"
          >
            <span
              className={cn(
                "block w-5.5 h-0.5 bg-white rounded-sm transition-all duration-300",
                menuOpen && "rotate-45 translate-x-1.25 translate-y-1.25"
              )}
            />
            <span
              className={cn(
                "block w-5.5 h-0.5 bg-white rounded-sm transition-all duration-300",
                menuOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block w-5.5 h-0.5 bg-white rounded-sm transition-all duration-300",
                menuOpen && "-rotate-45 translate-x-1.25 -translate-y-1.25"
              )}
            />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "hidden absolute top-17.5 inset-x-0 bg-white/97 backdrop-blur-[20px] border-b border-[rgba(59,130,246,0.1)] px-5 pt-3 pb-5 shadow-[0_12px_32px_rgba(0,0,0,0.08)] animate-menu-in",
          menuOpen && "block"
        )}
      >
        {NAV_LINKS.map((n) => (
          <Link
            key={n.label}
            href={n.href}
            className={cn(
              "block px-4 py-3.25 rounded-[10px] text-[15px] font-semibold no-underline mb-1 transition-all duration-200 hover:text-brand-700 hover:bg-[rgba(59,130,246,0.08)]",
              n.label === "About Us"
                ? "text-brand-700 bg-[rgba(59,130,246,0.08)]"
                : "text-gray-700"
            )}
            onClick={() => setMenuOpen(false)}
          >
            {n.label}
          </Link>
        ))}
        <Link
          href="/login"
          className="mt-3 w-full h-12 bg-brand-500 text-white rounded-[10px] text-[15px] font-bold cursor-pointer no-underline flex items-center justify-center"
          onClick={() => setMenuOpen(false)}
        >
          Login
        </Link>
      </div>
    </nav>
  )
}
