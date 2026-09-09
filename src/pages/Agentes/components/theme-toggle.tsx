"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui-shadcn/button"
import { useTheme } from "@/hooks/useTheme"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Activar modo día" : "Activar modo noche"}
      className="border-theme-border bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-bg-tertiary"
    >
      {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  )
}
