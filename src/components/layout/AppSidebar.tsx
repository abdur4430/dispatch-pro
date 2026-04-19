"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Truck, Users, UserCircle, Navigation, Building2,
  Settings, LogOut, Zap, Phone, Globe, BookOpen, ChevronDown, ChevronRight
} from "lucide-react";
import { useState } from "react";

const mainNav = [
  { href: "/dashboard",  icon: LayoutDashboard, label: "Dashboard" },
  { href: "/trucks",     icon: Truck,            label: "Fleet" },
  { href: "/drivers",    icon: UserCircle,        label: "Drivers" },
  { href: "/clients",    icon: Users,             label: "Clients" },
  { href: "/dispatch",   icon: Navigation,        label: "Dispatch" },
  { href: "/dialer",     icon: Phone,             label: "Dialer", badge: "NEW" },
  { href: "/market",     icon: Globe,             label: "Market", badge: "NEW" },
];

const guideNav = [
  { href: "/guides/trucks",   label: "Truck Types Guide" },
  { href: "/guides/clients",  label: "Client Playbook" },
  { href: "/guides/outreach", label: "Outreach Guide" },
];

const bottomNav = [
  { href: "/company",  icon: Building2, label: "Company" },
  { href: "/settings", icon: Settings,  label: "Settings" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [guidesOpen, setGuidesOpen] = useState(pathname.startsWith("/guides"));

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-60 flex flex-col z-40 border-r transition-colors"
      style={{ background: "var(--dp-sidebar-bg)", borderColor: "var(--dp-border)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: "var(--dp-border)" }}>
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-bold tracking-tight" style={{ color: "var(--dp-text)" }}>Dispatch</span>
          <span className="font-bold text-brand-400">Pro</span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {mainNav.map(({ href, icon: Icon, label, badge }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-brand-600/20 text-brand-400 border border-brand-600/30"
                  : "hover:bg-[var(--dp-hover)]"
              )}
              style={active ? {} : { color: "var(--dp-text-muted)" }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-600/30 text-brand-400">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Guides collapsible */}
        <div>
          <button
            onClick={() => setGuidesOpen(!guidesOpen)}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium transition-all hover:bg-[var(--dp-hover)]"
            style={{ color: "var(--dp-text-muted)" }}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">Guides</span>
            {guidesOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          {guidesOpen && (
            <div className="ml-7 mt-0.5 space-y-0.5">
              {guideNav.map(({ href, label }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "block px-3 py-2 rounded-lg text-xs font-medium transition-all",
                      active ? "text-brand-400 bg-brand-600/10" : "hover:bg-[var(--dp-hover)]"
                    )}
                    style={active ? {} : { color: "var(--dp-text-faint)" }}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Nav */}
      <div className="px-3 py-2 border-t space-y-0.5" style={{ borderColor: "var(--dp-border)" }}>
        {bottomNav.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active ? "bg-brand-600/20 text-brand-400 border border-brand-600/30" : "hover:bg-[var(--dp-hover)]"
              )}
              style={active ? {} : { color: "var(--dp-text-muted)" }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-steel-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
