"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "../../../lib/utils"
import { NAV_LINKS } from "../constants"

function NavLinkDesktop({
  label,
  href,
  active,
  onClick
}: {
  label: string
  href: string
  active: boolean
  onClick: () => void
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "px-4.5 py-2 rounded-lg text-sm font-bold text-slate-600 transition-colors",
        "hover:text-slate-900 hover:bg-black/5",
        active && "text-slate-900"
      )}
    >
      {label}
    </a>
  )
}

function NavLinkMobile({
  label,
  href,
  active,
  onClick
}: {
  label: string
  href: string
  active: boolean
  onClick: () => void
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "block w-full text-left px-4 py-3.25 mb-1 rounded-[10px] text-[15px] font-bold text-gray-700 transition-colors",
        "hover:text-brand-700 hover:bg-brand-500/8",
        active && "text-brand-700 bg-brand-500/8"
      )}
    >
      {label}
    </a>
  )
}

export default function HomeNavbar() {
  const [activeNav, setActiveNav] = useState("Home")
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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
          "bg-[rgba(255,255,255,.96)] backdrop-blur-[18px] shadow-[0_1px_0_rgba(0,0,0,.06),0_4px_20px_rgba(0,0,0,.08)]"
      )}
    >
      <div className="max-w-300 mx-auto flex items-center justify-between px-8 h-17">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-9.5 h-9.5 rounded-[9px] bg-linear-to-br from-brand-700 to-brand-500 flex items-center justify-center shadow-[0_4px_12px_rgba(59,130,246,.35)]">
            <span className="text-white font-black text-xs tracking-wide">
              INV
            </span>
          </div>
          <span className="font-black text-lg tracking-wide text-slate-900">
            STOCK<em className="not-italic text-brand-500">R</em>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((n) => (
            <NavLinkDesktop
              key={n.label}
              label={n.label}
              href={n.href}
              active={activeNav === n.label}
              onClick={() => setActiveNav(n.label)}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={cn(
              "hidden md:inline-flex items-center h-10 px-5.5 rounded-[9px] text-sm font-extrabold no-underline transition-all",
              "shadow-[0_4px_12px_rgba(0,0,0,.15)]",
              scrolled
                ? "bg-brand-500 text-white shadow-[0_4px_12px_rgba(59,130,246,.4)] hover:bg-brand-600"
                : "bg-white text-brand-700 hover:bg-blue-50 hover:-translate-y-px"
            )}
          >
            Login
          </Link>
          <button
            className="md:hidden flex flex-col gap-1.25 p-1.5 bg-transparent border-0"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span
              className={cn(
                "block w-5.5 h-0.5 rounded bg-white transition-all",
                menuOpen && "translate-x-1.25 translate-y-1.25 rotate-45"
              )}
            />
            <span
              className={cn(
                "block w-5.5 h-0.5 rounded bg-white transition-all",
                menuOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block w-5.5 h-0.5 rounded bg-white transition-all",
                menuOpen && "translate-x-1.25 -translate-y-1.25 -rotate-45"
              )}
            />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute inset-x-0 top-17 bg-white/97 backdrop-blur-xl border-b border-brand-500/10 px-5 pt-3 pb-5 shadow-[0_12px_32px_rgba(0,0,0,.08)] animate-menu-in">
          {NAV_LINKS.map((n) => (
            <NavLinkMobile
              key={n.label}
              label={n.label}
              href={n.href}
              active={activeNav === n.label}
              onClick={() => {
                setActiveNav(n.label)
                setMenuOpen(false)
              }}
            />
          ))}
          <Link
            href="/login"
            className="flex items-center justify-center mt-3 w-full h-12 bg-brand-500 text-white rounded-[10px] text-[15px] font-extrabold no-underline"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  )
}
