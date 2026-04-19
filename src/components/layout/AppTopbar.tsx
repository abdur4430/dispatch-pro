"use client";
import { useSession } from "next-auth/react";
import { Bell, Sun, Moon, Search } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

export function AppTopbar({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { data: session } = useSession();
  const { theme, toggle } = useTheme();

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header
      className="h-14 border-b backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30 transition-colors"
      style={{ background: "var(--dp-topbar-bg)", borderColor: "var(--dp-border)" }}
    >
      <div>
        <h1 className="font-semibold text-base" style={{ color: "var(--dp-text)" }}>{title}</h1>
        {subtitle && <p className="text-xs" style={{ color: "var(--dp-text-muted)" }}>{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors"
          style={{ background: "var(--dp-input-bg)", borderColor: "var(--dp-border)", color: "var(--dp-text-muted)" }}
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search...</span>
          <span className="hidden sm:inline text-xs px-1 py-0.5 rounded" style={{ background: "var(--dp-surface)" }}>⌘K</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggle}
          className="relative p-2 rounded-lg transition-all hover:bg-[var(--dp-hover)]"
          style={{ color: "var(--dp-text-muted)" }}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg transition-all hover:bg-[var(--dp-hover)]"
          style={{ color: "var(--dp-text-muted)" }}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xs font-bold text-white shadow-lg">
          {initials}
        </div>
      </div>
    </header>
  );
}
