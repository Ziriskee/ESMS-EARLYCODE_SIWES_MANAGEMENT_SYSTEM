import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const label =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="h-10 w-10 rounded-full border flex items-center justify-center transition-colors"
      style={{
        borderColor: "var(--border-subtle)",
        backgroundColor: "var(--bg-card)",
        color: "var(--text-primary)",
      }}
    >
      <Icon size={18} strokeWidth={1.75} />
    </button>
  );
}
