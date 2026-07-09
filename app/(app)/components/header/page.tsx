"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { ThemeToggle } from "../ThemeToggle"
import { cn } from "../../../lib/utils"

// ── ICONS ─────────────────────────────────────────────────────────────────────
const Icon = ({
  d,
  size = 20,
  color = "currentColor",
  className
}: {
  d: string
  size?: number
  color?: string
  className?: string
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
    className={className}
  >
    <path d={d} />
  </svg>
)

interface HeaderProps {
  isDark: boolean
  onToggleTheme: () => void
  onMenuClick: () => void
  onAddProduct?: () => void
  title?: string
  breadcrumb?: string
  showAddButton?: boolean
  notificationCount?: number
  p?: Record<string, string>
}

// ── COOKIE HELPER ──────────────────────────────────────────────────────────────
function getCookie(name: string): string {
  if (typeof document === "undefined") return ""
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split("=")[1]) : ""
}

// ── HEADER ────────────────────────────────────────────────────────────────────
export default function Header({
  isDark,
  onToggleTheme,
  onMenuClick,
  onAddProduct,
  title = "Product Inventory",
  showAddButton = true,
  notificationCount = 0,
  p = {}
}: HeaderProps) {
  const router = useRouter()

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Read user info from client-readable cookies set on login
  const [userName, setUserName] = useState("User")
  const [userRole, setUserRole] = useState("Member")

  useEffect(() => {
    const name = getCookie("user_name")
    const role = getCookie("user_role")
    if (name) setUserName(name)
    if (role) setUserRole(role)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [menuOpen])

  // Initial letter for avatar
  const avatarLetter = userName.charAt(0).toUpperCase()

  const handleUserMenuClose = () => setMenuOpen(false)

  const handleLogout = async () => {
    handleUserMenuClose()

    // 1. Hit server route to clear httpOnly token cookie
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})

    // 2. Clear client-readable cookies (user_name, user_role)
    const past = "Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = `user_name=; expires=${past}; path=/`
    document.cookie = `user_role=; expires=${past}; path=/`

    // 3. Clear any remaining localStorage / sessionStorage
    try {
      localStorage.clear()
    } catch {}
    try {
      sessionStorage.clear()
    } catch {}

    // 4. Redirect to login
    router.push("/login")
  }

  return (
    <div
      className="flex items-center justify-between gap-2 border-b px-4 py-3 transition-colors duration-300 md:px-8 md:py-4"
      style={{ borderColor: p.border, backgroundColor: p.sidebarBg }}
    >
      {/* Left — Hamburger + Title */}
      <div className="flex min-w-0 items-center gap-2 md:gap-4">
        <button
          onClick={onMenuClick}
          className="flex shrink-0 items-center justify-center rounded-md p-2 md:hidden"
          style={{ color: p.textSecondary }}
        >
          <Icon d="M3 12h18M3 6h18M3 18h18" size={20} color={p.textSecondary} />
        </button>

        <div className="min-w-0">
          <p
            className="truncate whitespace-nowrap text-[15px] font-extrabold tracking-tight md:text-xl"
            style={{ color: p.textPrimary }}
          >
            {title}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-1 md:gap-2">
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

        {/* Notifications */}
        <button
          title="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-md"
          style={{ color: p.textSecondary }}
        >
          <Icon
            d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
            size={18}
            color={p.textSecondary}
          />
          {notificationCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Add Product */}
        {showAddButton && onAddProduct && (
          <button
            onClick={onAddProduct}
            className="flex min-w-9 items-center gap-1.5 rounded-md bg-[#087463] px-1.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#065a4d] sm:min-w-0 md:px-2"
          >
            <Icon d="M12 5v14M5 12h14" size={14} color="#fff" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        )}

        {/* ── USER AVATAR BUTTON ── */}
        <div className="relative">
          <button
            ref={triggerRef}
            title="Account"
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded font-mono text-xs font-bold text-white transition-colors",
              "bg-[#FF6B35] hover:bg-[#e55f2d]",
              menuOpen
                ? "border-[1.5px] border-[#087463]"
                : "border-[1.5px] border-transparent"
            )}
          >
            {avatarLetter}
          </button>

          {/* ── USER DROPDOWN ── */}
          {menuOpen && (
            <div
              ref={menuRef}
              className={cn(
                "absolute right-0 top-full z-50 mt-2 min-w-50 overflow-visible rounded-md border font-mono",
                isDark ? "bg-[#141414]" : "bg-white",
                isDark
                  ? "shadow-[0_8px_32px_rgba(0,0,0,0.7)]"
                  : "shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
              )}
              style={{ borderColor: p.border }}
            >
              {/* little pointer triangle */}
              <div
                className="absolute -top-1.5 right-3 h-3 w-3 rotate-45 border-l-0 border-t-0"
                style={{
                  backgroundColor: isDark ? "#141414" : "#fff",
                  borderColor: p.border,
                  borderStyle: "solid",
                  borderWidth: 1
                }}
              />

              {/* User info */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded bg-[#FF6B35] text-[13px] font-bold text-white">
                    {avatarLetter}
                  </div>
                  <div>
                    <p
                      className="text-[13px] font-bold leading-tight"
                      style={{ color: p.textPrimary }}
                    >
                      {userName.length > 18
                        ? userName.slice(0, 18) + "…"
                        : userName}
                    </p>
                    <p
                      className="text-[10px] capitalize"
                      style={{ color: p.textMuted }}
                    >
                      {userRole}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="my-0.5 h-px"
                style={{ backgroundColor: p.border }}
              />

              {/* Profile */}
              <button
                onClick={handleUserMenuClose}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-[13px] transition-colors"
                style={{ color: p.textSecondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = p.hoverBg
                  e.currentTarget.style.color = p.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.color = p.textSecondary
                }}
              >
                <Icon
                  d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                  size={15}
                  color={p.textMuted}
                />
                Profile
              </button>

              {/* Settings */}
              <button
                onClick={handleUserMenuClose}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-[13px] transition-colors"
                style={{ color: p.textSecondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = p.hoverBg
                  e.currentTarget.style.color = p.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.color = p.textSecondary
                }}
              >
                <Icon
                  d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a7.1 7.1 0 0 0 .1-1v-2a7.1 7.1 0 0 0-.1-1l2.2-1.6a.5.5 0 0 0 .1-.6l-2-3.5a.5.5 0 0 0-.6-.2l-2.6 1a6.8 6.8 0 0 0-1.7-1l-.4-2.7A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.5.4l-.4 2.8a6.8 6.8 0 0 0-1.7 1l-2.6-1a.5.5 0 0 0-.6.2L2.2 8.9a.5.5 0 0 0 .1.6L4.5 11a7.1 7.1 0 0 0-.1 1v2a7.1 7.1 0 0 0 .1 1L2.3 16.6a.5.5 0 0 0-.1.6l2 3.5a.5.5 0 0 0 .6.2l2.6-1a6.8 6.8 0 0 0 1.7 1l.4 2.7a.5.5 0 0 0 .5.4h4a.5.5 0 0 0 .5-.4l.4-2.7a6.8 6.8 0 0 0 1.7-1l2.6 1a.5.5 0 0 0 .6-.2l2-3.5a.5.5 0 0 0-.1-.6z"
                  size={15}
                  color={p.textMuted}
                />
                Settings
              </button>

              <div
                className="my-0.5 h-px"
                style={{ backgroundColor: p.border }}
              />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2 text-left text-[13px] font-medium text-red-500 transition-colors",
                  isDark
                    ? "hover:bg-[#2e1010] hover:text-red-600"
                    : "hover:bg-red-50 hover:text-red-600"
                )}
              >
                <Icon
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                  size={15}
                  color="#ef4444"
                />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
