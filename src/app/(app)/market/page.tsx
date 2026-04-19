"use client";
import { useState, useEffect } from "react";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Card } from "@/components/ui/card";
import {
  Globe, Search, Truck, MapPin, DollarSign, Calendar, Phone, ExternalLink,
  Briefcase, Newspaper, ChevronRight, AlertCircle, CheckCircle, XCircle, RefreshCw, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "loads" | "jobs" | "carriers" | "news";

const EQUIPMENT_COLORS: Record<string, string> = {
  "Dry Van": "text-blue-400 bg-blue-500/10",
  "Reefer": "text-cyan-400 bg-cyan-500/10",
  "Flatbed": "text-orange-400 bg-orange-500/10",
  "Step Deck": "text-yellow-400 bg-yellow-500/10",
};

const SAFETY_COLORS: Record<string, string> = {
  Satisfactory: "text-green-400",
  Conditional: "text-yellow-400",
  Unsatisfactory: "text-red-400",
};

export default function MarketPage() {
  const [tab, setTab] = useState<Tab>("loads");
  const [loads, setLoads] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [carriers, setCarriers] = useState<any[]>([]);
  const [carrierQuery, setCarrierQuery] = useState("");
  const [carrierType, setCarrierType] = useState<"name" | "dot" | "mc">("name");
  const [loadingCarriers, setLoadingCarriers] = useState(false);
  const [equipFilter, setEquipFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  async function fetchData(type: string, setState: (d: any[]) => void) {
    try {
      const res = await fetch(`/api/crawl?type=${type}`);
      const json = await res.json();
      setState(json.data ?? []);
    } catch {}
  }

  useEffect(() => {
    fetchData("loads", setLoads);
    fetchData("jobs", setJobs);
    fetchData("news", setNews);
  }, []);

  async function refresh() {
    setRefreshing(true);
    await fetchData(tab === "loads" ? "loads" : tab === "jobs" ? "jobs" : "news",
      tab === "loads" ? setLoads : tab === "jobs" ? setJobs : setNews);
    setTimeout(() => setRefreshing(false), 800);
  }

  async function searchCarriers() {
    if (!carrierQuery.trim()) return;
    setLoadingCarriers(true);
    try {
      const res = await fetch(`/api/fmcsa?q=${encodeURIComponent(carrierQuery)}&type=${carrierType}`);
      const json = await res.json();
      setCarriers(json.results ?? []);
    } catch {}
    setLoadingCarriers(false);
  }

  const equipments = ["All", "Dry Van", "Reefer", "Flatbed", "Step Deck"];
  const filteredLoads = equipFilter === "All" ? loads : loads.filter((l) => l.equipment === equipFilter);

  return (
    <div style={{ background: "var(--dp-bg)", minHeight: "100vh" }}>
      <AppTopbar
        title="Market"
        subtitle="Live loads · Carrier lookup · Jobs · Industry news"
      />

      <div className="p-6 space-y-6">
        {/* Tab Bar */}
        <div className="flex items-center gap-1 p-1 rounded-xl border w-fit" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
          {([
            { key: "loads", label: "Load Board", icon: Truck },
            { key: "jobs", label: "Driver Jobs", icon: Briefcase },
            { key: "carriers", label: "Carrier Lookup", icon: Globe },
            { key: "news", label: "Industry News", icon: Newspaper },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                tab === key ? "bg-brand-600 text-white shadow-sm" : "hover:bg-[var(--dp-hover)]"
              )}
              style={tab !== key ? { color: "var(--dp-text-muted)" } : {}}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ─── LOAD BOARD ─── */}
        {tab === "loads" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-2 flex-wrap">
                {equipments.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEquipFilter(e)}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      equipFilter === e ? "border-brand-500 bg-brand-500/10 text-brand-400" : "hover:bg-[var(--dp-hover)]"
                    )}
                    style={equipFilter !== e ? { borderColor: "var(--dp-border)", color: "var(--dp-text-muted)" } : {}}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <button
                onClick={refresh}
                className={cn("ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-[var(--dp-hover)]", refreshing && "opacity-60")}
                style={{ borderColor: "var(--dp-border)", color: "var(--dp-text-muted)" }}
              >
                <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} /> Refresh
              </button>
            </div>

            <div className="grid gap-3">
              {filteredLoads.map((load) => (
                <div
                  key={load.id}
                  className="rounded-xl border p-4 hover:border-brand-600/40 transition-all"
                  style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}
                >
                  <div className="flex items-start gap-4 flex-wrap">
                    {/* Route */}
                    <div className="flex-1 min-w-48">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", EQUIPMENT_COLORS[load.equipment] ?? "text-steel-400 bg-steel-500/10")}>
                          {load.equipment}
                        </span>
                        <span className="text-xs" style={{ color: "var(--dp-text-faint)" }}>#{load.loadId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "var(--dp-text)" }}>{load.origin}</p>
                          <p className="text-xs" style={{ color: "var(--dp-text-muted)" }}>
                            <Calendar className="w-3 h-3 inline mr-0.5" />{load.pickup}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "var(--dp-text-faint)" }} />
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "var(--dp-text)" }}>{load.dest}</p>
                          <p className="text-xs" style={{ color: "var(--dp-text-muted)" }}>
                            <Calendar className="w-3 h-3 inline mr-0.5" />{load.delivery}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex gap-6 text-sm flex-wrap">
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: "var(--dp-text-faint)" }}>Distance</p>
                        <p className="font-medium" style={{ color: "var(--dp-text)" }}>{load.distance.toLocaleString()} mi</p>
                      </div>
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: "var(--dp-text-faint)" }}>Weight</p>
                        <p className="font-medium" style={{ color: "var(--dp-text)" }}>{load.weight.toLocaleString()} lbs</p>
                      </div>
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: "var(--dp-text-faint)" }}>Rate</p>
                        <p className="font-semibold text-green-400">${load.rate.toLocaleString()}</p>
                        <p className="text-xs text-green-400/70">${load.ratePerMile}/mi</p>
                      </div>
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: "var(--dp-text-faint)" }}>Broker</p>
                        <p className="font-medium text-xs" style={{ color: "var(--dp-text)" }}>{load.broker}</p>
                        <a href={`tel:${load.contact}`} className="text-xs text-brand-400 hover:underline">{load.contact}</a>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <a
                        href={`tel:${load.contact}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium hover:bg-green-500/20 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Broker
                      </a>
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-600/10 text-brand-400 border border-brand-600/20 text-xs font-medium hover:bg-brand-600/20 transition-colors">
                        <Truck className="w-3.5 h-3.5" /> Assign Truck
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── DRIVER JOBS ─── */}
        {tab === "jobs" && (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border p-5 hover:border-brand-600/40 transition-all"
                style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold" style={{ color: "var(--dp-text)" }}>{job.company}</h3>
                    <p className="text-sm" style={{ color: "var(--dp-text-muted)" }}>{job.type} · {job.city}, {job.state}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-brand-600/10 text-brand-400 border border-brand-600/20 font-medium shrink-0">
                    {job.cdl}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-green-400 shrink-0" />
                    <span className="text-green-400 font-medium">{job.pay}</span>
                    {job.sign_on_bonus && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        +{job.sign_on_bonus} sign-on
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {job.benefits.map((b: string) => (
                      <span key={b} className="text-xs px-2 py-0.5 rounded-md" style={{ background: "var(--dp-hover)", color: "var(--dp-text-muted)" }}>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t" style={{ borderColor: "var(--dp-border)" }}>
                  <a
                    href={`tel:${job.contact}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium hover:bg-green-500/20 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> {job.contact}
                  </a>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-brand-600/10 text-brand-400 border border-brand-600/20 text-xs font-medium hover:bg-brand-600/20 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Apply Online
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── CARRIER LOOKUP (FMCSA) ─── */}
        {tab === "carriers" && (
          <div className="space-y-6">
            <div
              className="rounded-xl border p-5"
              style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}
            >
              <h2 className="font-semibold mb-1" style={{ color: "var(--dp-text)" }}>FMCSA Carrier Lookup</h2>
              <p className="text-sm mb-4" style={{ color: "var(--dp-text-muted)" }}>
                Search the federal carrier database by company name, DOT number, or MC number. Add <code className="text-xs bg-[var(--dp-hover)] px-1 rounded">FMCSA_WEB_KEY</code> to .env.local for live results.
              </p>
              <div className="flex gap-2 flex-wrap">
                <div className="flex gap-1 p-1 rounded-lg border" style={{ background: "var(--dp-input-bg)", borderColor: "var(--dp-input-border)" }}>
                  {(["name", "dot", "mc"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setCarrierType(t)}
                      className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all uppercase tracking-wide",
                        carrierType === t ? "bg-brand-600 text-white" : ""
                      )}
                      style={carrierType !== t ? { color: "var(--dp-text-muted)" } : {}}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex-1 flex gap-2 min-w-56">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ background: "var(--dp-input-bg)", borderColor: "var(--dp-input-border)" }}>
                    <Search className="w-4 h-4 shrink-0" style={{ color: "var(--dp-text-faint)" }} />
                    <input
                      value={carrierQuery}
                      onChange={(e) => setCarrierQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchCarriers()}
                      placeholder={carrierType === "name" ? "Carrier name…" : carrierType === "dot" ? "DOT number…" : "MC number…"}
                      className="flex-1 bg-transparent text-sm outline-none"
                      style={{ color: "var(--dp-text)" }}
                    />
                  </div>
                  <button
                    onClick={searchCarriers}
                    disabled={loadingCarriers}
                    className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
                  >
                    {loadingCarriers ? "…" : "Search"}
                  </button>
                </div>
              </div>
            </div>

            {carriers.length > 0 && (
              <div className="grid gap-3 md:grid-cols-2">
                {carriers.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-xl border p-4 hover:border-brand-600/40 transition-all"
                    style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-semibold text-sm" style={{ color: "var(--dp-text)" }}>{c.legalName}</h3>
                        <p className="text-xs" style={{ color: "var(--dp-text-muted)" }}>{c.city}, {c.state}</p>
                      </div>
                      {c.safetyRating && (
                        <span className={cn("text-xs font-medium flex items-center gap-1", SAFETY_COLORS[c.safetyRating] ?? "text-steel-400")}>
                          {c.safetyRating === "Satisfactory" ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          {c.safetyRating}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <p style={{ color: "var(--dp-text-faint)" }}>DOT#</p>
                        <p className="font-medium" style={{ color: "var(--dp-text)" }}>{c.dotNumber}</p>
                      </div>
                      <div>
                        <p style={{ color: "var(--dp-text-faint)" }}>MC#</p>
                        <p className="font-medium" style={{ color: "var(--dp-text)" }}>{c.mcNumber}</p>
                      </div>
                      {c.powerUnits && <div><p style={{ color: "var(--dp-text-faint)" }}>Trucks</p><p className="font-medium" style={{ color: "var(--dp-text)" }}>{c.powerUnits}</p></div>}
                      {c.drivers && <div><p style={{ color: "var(--dp-text-faint)" }}>Drivers</p><p className="font-medium" style={{ color: "var(--dp-text)" }}>{c.drivers}</p></div>}
                    </div>
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-xs text-brand-400 hover:underline">
                        <Phone className="w-3.5 h-3.5" /> {c.phone}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── INDUSTRY NEWS ─── */}
        {tab === "news" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: "var(--dp-text-muted)" }}>Live industry headlines · Updates every 30 minutes</p>
              <button
                onClick={refresh}
                className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-[var(--dp-hover)]", refreshing && "opacity-60")}
                style={{ borderColor: "var(--dp-border)", color: "var(--dp-text-muted)" }}
              >
                <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} /> Refresh
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {news.map((n, i) => (
                <a
                  key={i}
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border p-4 hover:border-brand-600/40 transition-all group"
                  style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-600/10 text-brand-400 border border-brand-600/20">{n.source}</span>
                    <span className="text-xs" style={{ color: "var(--dp-text-faint)" }}>{n.published}</span>
                  </div>
                  <h3 className="text-sm font-semibold mb-1 group-hover:text-brand-400 transition-colors" style={{ color: "var(--dp-text)" }}>{n.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--dp-text-muted)" }}>{n.summary}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
