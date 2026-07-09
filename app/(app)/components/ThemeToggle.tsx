"use client"

import { cn } from "../../lib/utils"

export function ThemeToggle({
  isDark,
  onToggle
}: {
  isDark: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={cn(
        "relative flex h-7 w-14 shrink-0 items-center rounded-full border px-0.75 outline-none transition-colors duration-300",
        isDark
          ? "border-brand-700 bg-brand-900"
          : "border-slate-300 bg-slate-200"
      )}
    >
      {/* Sun kiri — muncul saat LIGHT mode */}
      <span
        className={cn(
          "pointer-events-none absolute left-1.75 flex items-center transition-opacity duration-300",
          isDark ? "opacity-0" : "opacity-60"
        )}
      >
        <svg
          width={11}
          height={11}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#64748b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </span>

      {/* Moon kanan — muncul saat DARK mode */}
      <span
        className={cn(
          "pointer-events-none absolute right-1.75 flex items-center transition-opacity duration-300",
          isDark ? "opacity-60" : "opacity-0"
        )}
      >
        <svg
          width={11}
          height={11}
          viewBox="0 0 24 24"
          fill="#60a5fa"
          stroke="none"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>

      {/* Knob */}
      <span
        className={cn(
          "pointer-events-none relative z-1 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full transition-transform duration-300",
          "ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isDark
            ? "translate-x-7 bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            : "translate-x-0 bg-brand-700 shadow-[0_1px_4px_rgba(0,0,0,0.25)]"
        )}
      >
        {isDark ? (
          // Dark mode aktif → icon moon di knob
          <svg
            width={11}
            height={11}
            viewBox="0 0 24 24"
            fill="#fff"
            stroke="none"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          // Light mode aktif → icon sun di knob
          <svg
            width={11}
            height={11}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </span>
    </button>
  )
}
