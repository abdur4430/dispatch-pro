"use client";
import dynamic from "next/dynamic";
import { useState, useCallback, useRef } from "react";
import { AppTopbar } from "@/components/layout/AppTopbar";
import {
  MapPin, Navigation, Fuel, DollarSign, Clock, Wind, Thermometer,
  AlertTriangle, Search, ChevronDown, Truck, RefreshCw, RotateCcw,
  TrendingUp, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false, loading: () => (
  <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--dp-bg-alt)" }}>
    <div className="text-center" style={{ color: "var(--dp-text-muted)" }}>
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
      Loading map…
    </div>
  </div>
)});

const TRUCK_CONFIGS: Record<string, { mpg: number; fuelCapGal: number; label: string; weightClass: string }> = {
  "cargo-van":    { mpg: 18, fuelCapGal: 25,  label: "Cargo Van",        weightClass: "Class 2" },
  "sprinter":     { mpg: 15, fuelCapGal: 26,  label: "Sprinter Van",     weightClass: "Class 3" },
  "box-16":       { mpg: 11, fuelCapGal: 40,  label: "Box Truck 16 ft",  weightClass: "Class 4–5" },
  "box-26":       { mpg: 9,  fuelCapGal: 55,  label: "Box Truck 26 ft",  weightClass: "Class 6" },
  "flatbed-48":   { mpg: 6.5,fuelCapGal: 150, label: "Flatbed 48 ft",    weightClass: "Class 8" },
  "flatbed-53":   { mpg: 6,  fuelCapGal: 150, label: "Dry Van 53 ft",    weightClass: "Class 8" },
  "reefer":       { mpg: 5.8,fuelCapGal: 150, label: "Reefer 53 ft",     weightClass: "Class 8" },
  "tanker":       { mpg: 5.5,fuelCapGal: 150, label: "Tanker",           weightClass: "Class 8" },
  "step-deck":    { mpg: 6.2,fuelCapGal: 150, label: "Step Deck",        weightClass: "Class 8" },
  "lowboy":       { mpg: 5,  fuelCapGal: 150, label: "Lowboy / RGN",     weightClass: "Class 8" },
};

type Place = { display: string; lat: number; lon: number };
type Weather = { temp: number; feelsLike: number; windSpeed: number; precipitation: number; condition: { label: string; icon: string; severity: string }; alert: string | null };
type Waypoint = { lat: number; lon: number; label: string; weather?: Weather };

export default function MapPage() {
  const [originQ, setOriginQ] = useState("");
  const [destQ, setDestQ] = useState("");
  const [originSuggestions, setOriginSuggestions] = useState<Place[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<Place[]>([]);
  const [origin, setOrigin] = useState<Place | null>(null);
  const [dest, setDest] = useState<Place | null>(null);
  const [truck, setTruck] = useState("flatbed-53");
  const [ratePerMile, setRatePerMile] = useState("2.80");
  const [dieselPrice, setDieselPrice] = useState("3.68");
  const [routeGeo, setRouteGeo] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<{ distanceMiles: number; durationHours: number } | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function geocode(q: string, setter: (s: Place[]) => void) {
    if (q.length < 3) { setter([]); return; }
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setter(data.slice(0, 4));
  }

  function onOriginChange(v: string) {
    setOriginQ(v);
    setOrigin(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => geocode(v, setOriginSuggestions), 350);
  }

  function onDestChange(v: string) {
    setDestQ(v);
    setDest(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => geocode(v, setDestSuggestions), 350);
  }

  function selectOrigin(p: Place) {
    setOrigin(p);
    setOriginQ(p.display.split(",").slice(0, 2).join(","));
    setOriginSuggestions([]);
  }

  function selectDest(p: Place) {
    setDest(p);
    setDestQ(p.display.split(",").slice(0, 2).join(","));
    setDestSuggestions([]);
  }

  async function planRoute() {
    if (!origin || !dest) { setError("Select both origin and destination from suggestions"); return; }
    setLoading(true);
    setError("");
    setRouteGeo(null);
    setRouteInfo(null);
    setWaypoints([]);

    try {
      const r = await fetch(`/api/route-plan?olat=${origin.lat}&olon=${origin.lon}&dlat=${dest.lat}&dlon=${dest.lon}`);
      const rdata = await r.json();
      if (rdata.error) throw new Error(rdata.error);

      setRouteGeo(rdata.geometry);
      setRouteInfo({ distanceMiles: rdata.distanceMiles, durationHours: rdata.durationHours });

      // Fetch weather for each waypoint in parallel
      const wps: Waypoint[] = rdata.waypoints;
      const weathers = await Promise.all(
        wps.map((wp: Waypoint) =>
          fetch(`/api/weather?lat=${wp.lat}&lon=${wp.lon}`)
            .then((r) => r.json())
            .catch(() => null)
        )
      );
      setWaypoints(wps.map((wp: Waypoint, i: number) => ({ ...wp, weather: weathers[i] })));
    } catch (e: any) {
      setError(e.message ?? "Route planning failed");
    }
    setLoading(false);
  }

  function reset() {
    setOriginQ(""); setDestQ(""); setOrigin(null); setDest(null);
    setRouteGeo(null); setRouteInfo(null); setWaypoints([]); setError("");
  }

  const cfg = TRUCK_CONFIGS[truck];
  const dist = routeInfo?.distanceMiles ?? 0;
  const hours = routeInfo?.durationHours ?? 0;
  const grossRevenue = dist * parseFloat(ratePerMile || "0");
  const fuelGallons = dist / cfg.mpg;
  const fuelCost = fuelGallons * parseFloat(dieselPrice || "0");
  const netRevenue = grossRevenue - fuelCost;
  const stops = cfg.fuelCapGal > 100 ? Math.ceil(fuelGallons / cfg.fuelCapGal) : 0;
  const driverHosDays = Math.ceil(hours / 11); // 11hr driving limit per HOS
  const revenuePerHour = hours > 0 ? grossRevenue / hours : 0;

  const severityColor = (s: string) => {
    if (s === "severe") return "text-red-400 bg-red-500/10 border-red-500/20";
    if (s === "warning") return "text-orange-400 bg-orange-500/10 border-orange-500/20";
    if (s === "caution") return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    return "text-green-400 bg-green-500/10 border-green-500/20";
  };

  return (
    <div style={{ background: "var(--dp-bg)", minHeight: "100vh" }}>
      <AppTopbar title="Route Planner" subtitle="Map · Weather · Fuel & revenue calculator" />

      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* ── LEFT PANEL ── */}
        <div className="w-[360px] shrink-0 flex flex-col border-r overflow-y-auto" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
          {/* Route Inputs */}
          <div className="p-4 space-y-3 border-b" style={{ borderColor: "var(--dp-border)" }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--dp-text)" }}>Plan a Route</h2>

            {/* Origin */}
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border" style={{ background: "var(--dp-input-bg)", borderColor: origin ? "#22c55e" : "var(--dp-input-border)" }}>
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-3 h-3 text-green-400" />
                </div>
                <input
                  value={originQ}
                  onChange={(e) => onOriginChange(e.target.value)}
                  placeholder="Origin city or address…"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "var(--dp-text)" }}
                />
                {origin && <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />}
              </div>
              {originSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-20 overflow-hidden" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
                  {originSuggestions.map((s, i) => (
                    <button key={i} onClick={() => selectOrigin(s)} className="w-full text-left px-3 py-2.5 text-xs hover:bg-[var(--dp-hover)] transition-colors border-b last:border-0" style={{ borderColor: "var(--dp-border)", color: "var(--dp-text)" }}>
                      {s.display.split(",").slice(0, 3).join(",")}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Destination */}
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border" style={{ background: "var(--dp-input-bg)", borderColor: dest ? "#ef4444" : "var(--dp-input-border)" }}>
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-3 h-3 text-red-400" />
                </div>
                <input
                  value={destQ}
                  onChange={(e) => onDestChange(e.target.value)}
                  placeholder="Destination city or address…"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "var(--dp-text)" }}
                />
                {dest && <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />}
              </div>
              {destSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-20 overflow-hidden" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
                  {destSuggestions.map((s, i) => (
                    <button key={i} onClick={() => selectDest(s)} className="w-full text-left px-3 py-2.5 text-xs hover:bg-[var(--dp-hover)] transition-colors border-b last:border-0" style={{ borderColor: "var(--dp-border)", color: "var(--dp-text)" }}>
                      {s.display.split(",").slice(0, 3).join(",")}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Truck Selector */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--dp-text-muted)" }}>Equipment</label>
              <div className="relative">
                <select
                  value={truck}
                  onChange={(e) => setTruck(e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 rounded-xl border text-sm outline-none pr-8"
                  style={{ background: "var(--dp-input-bg)", borderColor: "var(--dp-input-border)", color: "var(--dp-text)" }}
                >
                  {Object.entries(TRUCK_CONFIGS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label} ({v.weightClass}, {v.mpg} MPG)</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--dp-text-faint)" }} />
              </div>
            </div>

            {/* Rate & Diesel */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--dp-text-muted)" }}>Rate / mile ($)</label>
                <input
                  value={ratePerMile}
                  onChange={(e) => setRatePerMile(e.target.value)}
                  type="number" step="0.01" min="0"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ background: "var(--dp-input-bg)", borderColor: "var(--dp-input-border)", color: "var(--dp-text)" }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--dp-text-muted)" }}>Diesel / gal ($)</label>
                <input
                  value={dieselPrice}
                  onChange={(e) => setDieselPrice(e.target.value)}
                  type="number" step="0.01" min="0"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ background: "var(--dp-input-bg)", borderColor: "var(--dp-input-border)", color: "var(--dp-text)" }}
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={planRoute}
                disabled={loading || !origin || !dest}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                {loading ? "Routing…" : "Plan Route"}
              </button>
              {(origin || dest) && (
                <button onClick={reset} className="p-2.5 rounded-xl border hover:bg-[var(--dp-hover)] transition-colors" style={{ borderColor: "var(--dp-border)", color: "var(--dp-text-muted)" }}>
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Route Stats */}
          {routeInfo && (
            <div className="p-4 space-y-4 border-b" style={{ borderColor: "var(--dp-border)" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--dp-text)" }}>Route Summary</h3>

              {/* Key numbers */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Distance", value: `${dist.toLocaleString()} mi`, icon: MapPin, color: "text-brand-400" },
                  { label: "Drive Time", value: `${hours}h${hours !== Math.floor(hours) ? ` ${Math.round((hours % 1) * 60)}m` : ""}`, icon: Clock, color: "text-yellow-400" },
                  { label: "Gross Revenue", value: `$${grossRevenue.toLocaleString("en", { maximumFractionDigits: 0 })}`, icon: DollarSign, color: "text-green-400" },
                  { label: "Fuel Cost", value: `$${fuelCost.toLocaleString("en", { maximumFractionDigits: 0 })}`, icon: Fuel, color: "text-orange-400" },
                  { label: "Net (fuel only)", value: `$${netRevenue.toLocaleString("en", { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: netRevenue > 0 ? "text-green-400" : "text-red-400" },
                  { label: "Revenue / hr", value: `$${revenuePerHour.toFixed(0)}/h`, icon: DollarSign, color: "text-purple-400" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: "var(--dp-hover)" }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className={cn("w-3.5 h-3.5", color)} />
                      <span className="text-xs" style={{ color: "var(--dp-text-faint)" }}>{label}</span>
                    </div>
                    <p className={cn("text-base font-bold", color)}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Additional details */}
              <div className="rounded-xl border p-3 space-y-2 text-xs" style={{ borderColor: "var(--dp-border)" }}>
                <div className="flex justify-between">
                  <span style={{ color: "var(--dp-text-muted)" }}>Fuel needed</span>
                  <span className="font-medium" style={{ color: "var(--dp-text)" }}>{fuelGallons.toFixed(0)} gallons</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--dp-text-muted)" }}>Fuel stops</span>
                  <span className="font-medium" style={{ color: "var(--dp-text)" }}>{stops > 0 ? stops : "None needed"}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--dp-text-muted)" }}>HOS driving days</span>
                  <span className="font-medium" style={{ color: "var(--dp-text)" }}>{driverHosDays} day{driverHosDays > 1 ? "s" : ""} (11hr rule)</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--dp-text-muted)" }}>{cfg.label} avg MPG</span>
                  <span className="font-medium" style={{ color: "var(--dp-text)" }}>{cfg.mpg} MPG</span>
                </div>
              </div>
            </div>
          )}

          {/* Weather Strip */}
          {waypoints.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--dp-text)" }}>Weather Along Route</h3>
              <div className="space-y-2">
                {waypoints.map((wp, i) => {
                  const w = wp.weather;
                  if (!w) return null;
                  return (
                    <div
                      key={i}
                      className={cn("rounded-xl border p-3", severityColor(w.condition?.severity ?? "good"))}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">{wp.label}</span>
                        <span className="text-lg">{w.condition?.icon}</span>
                      </div>
                      <p className="text-sm font-bold">{w.temp}°F — {w.condition?.label}</p>
                      <div className="flex gap-3 mt-1 text-xs opacity-80">
                        <span><Wind className="w-3 h-3 inline mr-0.5" />{w.windSpeed} mph</span>
                        {w.precipitation > 0 && <span>💧 {w.precipitation}" precip</span>}
                      </div>
                      {w.alert && (
                        <div className="flex items-start gap-1.5 mt-2 text-xs font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          {w.alert}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Weather safety notice */}
              <div className="mt-3 p-3 rounded-xl text-xs border border-brand-500/20 bg-brand-500/5" style={{ color: "var(--dp-text-muted)" }}>
                <Info className="w-3.5 h-3.5 inline mr-1 text-brand-400" />
                Weather data via Open-Meteo. Always verify forecasts before departure and adjust HOS planning for weather delays.
              </div>
            </div>
          )}
        </div>

        {/* ── MAP PANEL ── */}
        <div className="flex-1 relative">
          <MapView
            routeGeometry={routeGeo}
            origin={origin}
            dest={dest}
            waypoints={waypoints}
          />
        </div>
      </div>
    </div>
  );
}
