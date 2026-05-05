import { createContext, useCallback, useContext, useEffect, useState } from "react"

export type Theme = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

interface ThemeContextValue {
  /** The user's stored preference, including "system" (follow OS) */
  theme: Theme

  /** The theme actually applied to the document — always concrete */
  resolvedTheme: ResolvedTheme

  /** Toggle between light and dark (persists to localStorage) */
  toggleTheme: () => void

  /** Explicitly set a theme — pass "system" to follow OS */
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = "ui-theme"
const ThemeContext = createContext<ThemeContextValue | null>(null)
const isBrowser = typeof window !== "undefined"

/**
 * Returns the OS color scheme preference.
 * Falls back to "light" on the server — the injected script handles the real
 * value before hydration, so this only affects the SSR render pass.
 */
function getSystemTheme(): ResolvedTheme {
  if (!isBrowser) return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

/**
 * Reads the persisted theme from localStorage.
 * Returns defaultTheme on the server (no storage available).
 */
function getStoredTheme(defaultTheme: Theme): Theme {
  if (!isBrowser) return defaultTheme
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "dark" || stored === "light" || stored === "system") return stored
    return defaultTheme
  } catch {
    return defaultTheme
  }
}

/**
 * Applies the resolved theme to the document root.
 * No-op on the server — only ever called inside useEffect.
 */
function applyTheme(theme: ResolvedTheme) {
  if (!isBrowser) return
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(theme)
  root.style.colorScheme = theme
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: React.ReactNode
  /**
   * Fallback theme used when no value is stored in localStorage yet.
   * Priority: localStorage → defaultTheme → "system".
   * Defaults to "system" (follows OS).
   */
  defaultTheme?: Theme
}

export function ThemeProvider({ children, defaultTheme = "system" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme(defaultTheme))
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme

  // Sync resolved theme → DOM whenever it changes
  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  // Watch for system preference changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light")
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      console.warn("Unable to set theme!")
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>")
  return ctx
}
