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
    <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
      <Box
        onClick={onToggle}
        role="button"
        sx={{
          width: 56,
          height: 28,
          bgcolor: isDark ? "#1a1a1a" : "#e2e8f0",
          border: isDark ? "1px solid #2a2a2a" : "1px solid #cbd5e1",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          px: "3px",
          cursor: "pointer",
          position: "relative",
          transition: "background-color 0.3s ease",
          userSelect: "none",
          "&:hover": { opacity: 0.85 }
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 7,
            opacity: isDark ? 0.5 : 0,
            transition: "opacity 0.3s",
            display: "flex",
            alignItems: "center",
            pointerEvents: "none"
          }}
        >
          <MoonIcon size={11} color="#94a3b8" />
        </Box>
        <Box
          sx={{
            position: "absolute",
            right: 7,
            opacity: isDark ? 0 : 0.6,
            transition: "opacity 0.3s",
            display: "flex",
            alignItems: "center",
            pointerEvents: "none"
          }}
        >
          <SunIcon size={11} color="#64748b" />
        </Box>
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            bgcolor: isDark ? "#087463" : "#1e293b",
            transform: isDark ? "translateX(28px)" : "translateX(0px)",
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isDark
              ? "0 0 8px rgba(232,255,71,0.4)"
              : "0 1px 4px rgba(0,0,0,0.25)",
            zIndex: 1,
            pointerEvents: "none"
          }}
        >
          {isDark ? (
            <MoonIcon size={11} color="#0D0D0D" />
          ) : (
            <SunIcon size={11} color="#087463" />
          )}
        </Box>
      </Box>
    </Tooltip>
  )
}
