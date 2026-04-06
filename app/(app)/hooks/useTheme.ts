import { useState } from "react"

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark"
    }
    return false
  })

  const toggleTheme = () => {
    setIsDark((v) => {
      const next = !v
      localStorage.setItem("theme", next ? "dark" : "light")
      return next
    })
  }

  return { isDark, toggleTheme }
}
