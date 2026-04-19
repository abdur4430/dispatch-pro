"use client";
import Link from "next/link";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Truck, Users, Target, ChevronRight, BookOpen } from "lucide-react";

const GUIDES = [
  {
    href: "/guides/trucks",
    icon: Truck,
    color: "text-brand-400",
    bg: "bg-brand-500/10",
    border: "border-brand-500/20",
    title: "Truck Types Guide",
    desc: "Which equipment for which freight — payload, dimensions, rates, CDL requirements, and top brokers for every truck type.",
    items: ["12+ equipment types covered", "Rate ranges per mile", "CDL requirements", "Top brokers per equipment"],
  },
  {
    href: "/guides/clients",
    icon: Users,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    title: "Client Playbook",
    desc: "How to onboard, invoice, retain, and grow shipper accounts — from first call to long-term dedicated lanes.",
    items: ["Onboarding checklist", "Billing & collections", "Freight factoring options", "Retention strategies"],
  },
  {
    href: "/guides/outreach",
    icon: Target,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    title: "Outreach Playbook",
    desc: "Proven scripts, email templates, objection handling, and a 30-day action plan for landing new trucking company accounts.",
    items: ["Cold call scripts", "8 prospecting sources", "3 email templates", "Objection handling guide"],
  },
];

export default function GuidesPage() {
  return (
    <div style={{ background: "var(--dp-bg)", minHeight: "100vh" }}>
      <AppTopbar title="Guides" subtitle="Reference playbooks for dispatchers" />
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--dp-text)" }}>Dispatcher Knowledge Base</h2>
            <p className="text-sm" style={{ color: "var(--dp-text-muted)" }}>Industry guides built for working dispatchers</p>
          </div>
        </div>
        {GUIDES.map(({ href, icon: Icon, color, bg, border, title, desc, items }) => (
          <Link
            key={href}
            href={href}
            className={`block rounded-2xl border p-6 hover:border-brand-600/40 transition-all group`}
            style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-lg ${color}`}>{title}</h3>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: "var(--dp-text-faint)" }} />
                </div>
                <p className="text-sm mt-1 mb-3" style={{ color: "var(--dp-text-muted)" }}>{desc}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <span key={item} className={`text-xs px-2 py-1 rounded-md border ${bg} ${color} ${border}`}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
