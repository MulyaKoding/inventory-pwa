"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "../../../lib/utils"

const Icon = ({
  d,
  size = 16,
  color = "currentColor"
}: {
  d: string
  size?: number
  color?: string
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
)

export const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
    href: "/dashboard"
  },
  {
    label: "Inventory",
    icon: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 3H8L6 7h12z",
    href: "/inventory"
  },
  {
    label: "Master Barang",
    icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4",
    href: "/master-barang"
  },
  {
    label: "Registrasi Toko",
    icon: "M3 3v18h18M18 9l-5 5-4-4-4 4",
    href: "/registration"
  },
  {
    label: "Daftar Toko",
    icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
    href: "/list-toko"
  },
  {
    label: "Settings",
    icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a7.1 7.1 0 0 0 .1-1v-2a7.1 7.1 0 0 0-.1-1l2.2-1.6a.5.5 0 0 0 .1-.6l-2-3.5a.5.5 0 0 0-.6-.2l-2.6 1a6.8 6.8 0 0 0-1.7-1l-.4-2.7A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.5.4l-.4 2.8a6.8 6.8 0 0 0-1.7 1l-2.6-1a.5.5 0 0 0-.6.2L2.2 8.9a.5.5 0 0 0 .1.6L4.5 11a7.1 7.1 0 0 0-.1 1v2a7.1 7.1 0 0 0 .1 1L2.3 16.6a.5.5 0 0 0-.1.6l2 3.5a.5.5 0 0 0 .6.2l2.6-1a6.8 6.8 0 0 0 1.7 1l.4 2.7a.5.5 0 0 0 .5.4h4a.5.5 0 0 0 .5-.4l.4-2.7a6.8 6.8 0 0 0 1.7-1l2.6 1a.5.5 0 0 0 .6-.2l2-3.5a.5.5 0 0 0-.1-.6z",
    href: "/settings"
  }
]

interface SidebarProps {
  isDark?: boolean
  T?: string
}

export default function Sidebar({ T = "0.3s ease" }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [userName, setUserName] = useState("User")
  const [userRole, setUserRole] = useState("Member")

  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return ""
      const match = document.cookie
        .split("; ")
        .find((r) => r.startsWith(`${name}=`))
      return match ? decodeURIComponent(match.split("=")[1]) : ""
    }
    const name = getCookie("user_name")
    const role = getCookie("user_role")
    if (name) setUserName(name)
    if (role) setUserRole(role)
  }, [])

  const avatarLetter = userName.charAt(0).toUpperCase()

  return (
    <div className="relative flex h-full flex-col overflow-hidden border-r border-white/8 bg-[linear-gradient(160deg,var(--color-brand-950)_0%,var(--color-brand-900)_40%,var(--color-brand-800)_70%,var(--color-brand-700)_100%)]">
      {/* faint grid overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-sice[40px_40px]" />
      {/* glow blob */}
      <div className="pointer-events-none absolute -right-14 -top-14 z-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,.25)_0%,transparent_70%)]" />

      {/* ── LOGO ── */}
      <div className="relative z-10 flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-brand-700 to-brand-500 shadow-[0_4px_12px_rgba(59,130,246,.4)]">
          <span className="font-nunito text-[11px] font-black tracking-wide text-white">
            INV
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-nunito text-[15px] font-black leading-tight tracking-wide text-white truncate">
            STOCKR
          </p>
          <p className="font-nunito text-[10px] font-semibold text-white/40 truncate">
            Inventory Management
          </p>
        </div>
      </div>

      <div className="mb-1 h-px bg-white/8" />

      {/* ── NAV ── */}
      <nav className="relative z-10 flex-1 space-y-1 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex w-full items-center gap-0 rounded-lg border px-3 py-2 text-left",
                isActive
                  ? "border-brand-500/40 bg-brand-500/20 hover:bg-brand-500/25"
                  : "border-transparent hover:border-white/10 hover:bg-white/[.07]"
              )}
              style={{ transition: `all ${T}` }}
            >
              <span className="flex w-8 shrink-0 items-center justify-center">
                <Icon
                  d={item.icon}
                  size={16}
                  color={isActive ? "#60a5fa" : "rgba(255,255,255,.4)"}
                />
              </span>
              <span
                className={cn(
                  "font-nunito flex-1 text-[13px]",
                  isActive
                    ? "font-extrabold text-white"
                    : "font-semibold text-white/55"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
              )}
            </button>
          )
        })}
      </nav>

      {/* ── USER ── */}
      <div className="relative z-10 border-t border-white/8 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF6B35] text-xs font-extrabold text-white shadow-[0_2px_8px_rgba(255,107,53,.4)]">
            {avatarLetter}
          </div>
          <div className="min-w-0">
            <p className="font-nunito truncate text-xs font-bold text-white">
              {userName.length > 14 ? userName.slice(0, 14) + "…" : userName}
            </p>
            <p className="font-nunito text-[10px] font-semibold capitalize text-white/35">
              {userRole}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
