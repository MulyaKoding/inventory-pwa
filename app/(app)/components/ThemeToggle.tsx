"use client"

import { Box, Tooltip } from "@mui/material"

const MoonIcon = ({
  size = 18,
  color = "currentColor"
}: {
  size?: number
  color?: string
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    stroke="none"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const SunIcon = ({
  size = 18,
  color = "currentColor"
}: {
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
)

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
      style={{
        width: 56,
        height: 28,
        backgroundColor: isDark ? "#0c1733" : "#e2e8f0",
        border: isDark ? "1px solid #1e3a8a" : "1px solid #cbd5e1",
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        padding: "0 3px",
        cursor: "pointer",
        position: "relative",
        transition: "background-color 0.3s ease",
        outline: "none",
        flexShrink: 0
      }}
    >
      {/* Moon kiri — dark mode */}
      <span
        style={{
          position: "absolute",
          left: 7,
          opacity: isDark ? 0.6 : 0,
          transition: "opacity 0.3s",
          display: "flex",
          alignItems: "center",
          pointerEvents: "none"
        }}
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

      {/* Sun kanan — light mode */}
      <span
        style={{
          position: "absolute",
          right: 7,
          opacity: isDark ? 0 : 0.6,
          transition: "opacity 0.3s",
          display: "flex",
          alignItems: "center",
          pointerEvents: "none"
        }}
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

      {/* Knob */}
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          backgroundColor: isDark ? "#3b82f6" : "#1e3a8a",
          transform: isDark ? "translateX(28px)" : "translateX(0px)",
          transition:
            "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: isDark
            ? "0 0 8px rgba(59,130,246,0.5)"
            : "0 1px 4px rgba(0,0,0,0.25)",
          pointerEvents: "none",
          zIndex: 1
        }}
      >
        {isDark ? (
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
        ) : (
          <svg
            width={11}
            height={11}
            viewBox="0 0 24 24"
            fill="#93c5fd"
            stroke="none"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </span>
    </button>
  )
}
