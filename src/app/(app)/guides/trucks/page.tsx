"use client";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Truck, Weight, Ruler, MapPin, Package, ChevronDown, ChevronRight } from "lucide-react";

const TRUCK_GUIDE = [
  {
    category: "Cargo Vans & Sprinters",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    trucks: [
      {
        name: "Cargo Van",
        payload: "Up to 3,500 lbs",
        dims: "8–10 ft cargo",
        range: "Local / Last-mile",
        cdl: "No CDL required",
        uses: ["E-commerce delivery", "Small parcel", "Medical supplies", "Catering", "Small moves"],
        bestFor: "Last-mile urban delivery and courier services. Ideal when you need speed and flexibility in city environments.",
        avoid: "Heavy freight, palletized loads, or anything over 3,500 lbs. Poor for interstate hauls.",
        pay: "$80–$150/day",
        brokers: ["Amazon Flex", "DoorDash Drive", "Roadie", "GoShip (small shipments)"],
      },
      {
        name: "Sprinter Van (3500 series)",
        payload: "Up to 5,000 lbs",
        dims: "144–170\" wheelbase",
        range: "Local / Regional",
        cdl: "No CDL required",
        uses: ["Medical equipment", "Expedited freight", "Catering & events", "Temperature-sensitive cargo", "Luxury vehicle transport"],
        bestFor: "Time-sensitive expedited freight where full trucks aren't needed. High value-per-mile runs.",
        avoid: "Loads over 5,000 lbs. Not cost-effective for long haul vs. box trucks.",
        pay: "$120–$250/day",
        brokers: ["Echo Global", "XPO Freight", "Coyote (expedited)", "Landstar"],
      },
    ],
  },
  {
    category: "Box Trucks",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    trucks: [
      {
        name: "Box Truck 16 ft",
        payload: "Up to 10,000 lbs",
        dims: "16 ft × 7 ft × 7 ft",
        range: "Local / Regional",
        cdl: "Class B CDL typically",
        uses: ["Furniture delivery", "Appliances", "Office moves", "Small LTL freight", "Retail restocking"],
        bestFor: "Local and metro-area freight. Great for retail chains, furniture stores, and appliance deliveries.",
        avoid: "Long haul – fuel costs are disproportionate at highway speeds over 500 miles.",
        pay: "$150–$300/day",
        brokers: ["GoShip", "uShip", "Convoy (small loads)", "Uber Freight"],
      },
      {
        name: "Box Truck 24–26 ft",
        payload: "Up to 26,000 lbs",
        dims: "26 ft × 8 ft × 8 ft",
        range: "Regional / Long-haul",
        cdl: "Class B CDL",
        uses: ["Regional LTL", "Furniture & appliances", "Trade show exhibits", "Multi-stop retail routes", "White-glove delivery"],
        bestFor: "The workhorse for regional routes. Strong demand from retail chains and furniture companies.",
        avoid: "Exceeding 26,000 lbs GVWR requires Class A CDL. Don't overload.",
        pay: "$250–$600/day",
        brokers: ["XPO Logistics", "Echo Global", "CH Robinson", "Schneider"],
      },
    ],
  },
  {
    category: "Flatbeds & Open Deck",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    trucks: [
      {
        name: "Standard Flatbed 48 ft",
        payload: "Up to 48,000 lbs",
        dims: "48 ft × 8.5 ft",
        range: "Regional / Long-haul",
        cdl: "Class A CDL",
        uses: ["Construction materials", "Steel & lumber", "Machinery", "Oversized equipment", "Agricultural equipment"],
        bestFor: "Construction industry is the primary customer. Consistent demand in areas with active infrastructure projects.",
        avoid: "Cargo that can't be secured with straps/chains. Temperature-sensitive freight.",
        pay: "$2.50–$4.50/mile",
        brokers: ["Landstar", "CH Robinson", "Coyote", "Echo Global (flatbed division)"],
      },
      {
        name: "Step Deck / Drop Deck",
        payload: "Up to 42,000 lbs",
        dims: "48–53 ft, lower deck 10 ft",
        range: "Regional / Long-haul",
        cdl: "Class A CDL",
        uses: ["Tall equipment", "Farm machinery", "Heavy construction equipment", "Oversized freight up to 10 ft tall"],
        bestFor: "Equipment that's too tall for standard flatbed (over 8.5 ft) but doesn't need a lowboy. Pays premium rates.",
        avoid: "Very heavy equipment (use lowboy instead). Requires tie-down expertise.",
        pay: "$2.75–$5.00/mile",
        brokers: ["Landstar", "Worldwide Express", "Mode Transportation"],
      },
      {
        name: "Lowboy (RGN)",
        payload: "Up to 80,000+ lbs",
        dims: "Up to 29 ft + 10 ft well",
        range: "Regional / Long-haul",
        cdl: "Class A CDL + permits",
        uses: ["Heavy construction equipment", "Military equipment", "Industrial machinery", "Cranes", "Mining equipment"],
        bestFor: "Highest-paying freight in trucking. Specialized carriers charge premium rates for heavy haul.",
        avoid: "Requires state-specific oversize permits, pilot cars, and route surveys. Not for new operators.",
        pay: "$4.00–$8.00+/mile",
        brokers: ["Heavy haul specialists", "Landstar", "Anderson Trucking Service"],
      },
    ],
  },
  {
    category: "Semi / 18-Wheeler",
    color: "text-brand-400",
    bg: "bg-brand-500/10",
    border: "border-brand-500/20",
    trucks: [
      {
        name: "Dry Van (53 ft)",
        payload: "Up to 45,000 lbs",
        dims: "53 ft × 8.5 ft × 9 ft",
        range: "Regional / OTR",
        cdl: "Class A CDL",
        uses: ["Consumer goods", "Food (non-temp)", "Electronics", "Retail freight", "Manufacturing"],
        bestFor: "The most common load type. High freight volume means consistent availability year-round.",
        avoid: "Temperature-sensitive cargo. Flatbed loads that can't fit inside.",
        pay: "$2.20–$3.50/mile",
        brokers: ["CH Robinson", "Echo Global", "Coyote", "Convoy", "Uber Freight", "Transplace"],
      },
      {
        name: "Refrigerated (Reefer)",
        payload: "Up to 42,000 lbs",
        dims: "53 ft, temperature-controlled",
        range: "Regional / OTR",
        cdl: "Class A CDL",
        uses: ["Produce & grocery", "Pharmaceuticals", "Meat & dairy", "Flowers", "Temperature-sensitive chemicals"],
        bestFor: "Premium freight rates vs. dry van. Consistent demand from grocery chains and food distributors.",
        avoid: "Higher maintenance costs. Requires fuel to run reefer unit. Monitor temperature constantly.",
        pay: "$2.50–$4.00/mile",
        brokers: ["CH Robinson (produce)", "Coyote", "Produce Junction", "Echo Global"],
      },
      {
        name: "Tanker",
        payload: "Up to 40,000 lbs (liquid)",
        dims: "Various, typically 40–45 ft",
        range: "Regional / OTR",
        cdl: "Class A CDL + Tanker endorsement (N)",
        uses: ["Fuel & petroleum", "Food-grade liquids", "Chemicals", "Water", "Milk & dairy"],
        bestFor: "Specialized endorsement commands premium pay. Petroleum tankers are recession-resistant.",
        avoid: "Hazmat loads require additional HAZMAT endorsement (H). Complex loading/unloading procedures.",
        pay: "$3.00–$5.00/mile",
        brokers: ["Kenan Advantage Group", "Quality Distribution", "Trimac Transportation"],
      },
    ],
  },
];

export default function TruckGuidePage() {
  const [openTruck, setOpenTruck] = useState<string | null>(null);

  return (
    <div style={{ background: "var(--dp-bg)", minHeight: "100vh" }}>
      <AppTopbar title="Truck Types Guide" subtitle="Which truck for which load — a complete dispatcher reference" />

      <div className="p-6 max-w-5xl mx-auto space-y-8">
        {/* Intro */}
        <div className="rounded-2xl border p-6" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
              <Truck className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg" style={{ color: "var(--dp-text)" }}>Complete Truck Selection Guide</h2>
              <p className="text-sm" style={{ color: "var(--dp-text-muted)" }}>Match equipment to freight type for maximum efficiency and profit</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[
              { label: "Equipment Types", value: "12+" },
              { label: "CDL Classes Covered", value: "A, B, None" },
              { label: "Rate Ranges", value: "Included" },
              { label: "Top Brokers", value: "Per Type" },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded-lg" style={{ background: "var(--dp-hover)" }}>
                <p className="text-xl font-bold text-brand-400">{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--dp-text-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Truck Categories */}
        {TRUCK_GUIDE.map((cat) => (
          <div key={cat.category}>
            <h2 className={cn("text-sm font-bold uppercase tracking-widest mb-3", cat.color)}>{cat.category}</h2>
            <div className="space-y-3">
              {cat.trucks.map((truck) => {
                const key = truck.name;
                const open = openTruck === key;
                return (
                  <div
                    key={key}
                    className={cn("rounded-xl border transition-all", open ? cat.border : "")}
                    style={{ background: "var(--dp-surface)", borderColor: open ? undefined : "var(--dp-border)" }}
                  >
                    <button
                      onClick={() => setOpenTruck(open ? null : key)}
                      className="w-full flex items-center gap-4 p-4 text-left"
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", cat.bg)}>
                        <Truck className={cn("w-5 h-5", cat.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold" style={{ color: "var(--dp-text)" }}>{truck.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--dp-hover)", color: "var(--dp-text-muted)" }}>{truck.cdl}</span>
                        </div>
                        <div className="flex gap-4 mt-1 text-xs flex-wrap" style={{ color: "var(--dp-text-muted)" }}>
                          <span className="flex items-center gap-1"><Weight className="w-3 h-3" />{truck.payload}</span>
                          <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{truck.dims}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{truck.range}</span>
                          <span className="font-medium text-green-400">{truck.pay}</span>
                        </div>
                      </div>
                      {open ? <ChevronDown className="w-4 h-4 shrink-0" style={{ color: "var(--dp-text-faint)" }} /> : <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "var(--dp-text-faint)" }} />}
                    </button>

                    {open && (
                      <div className="px-4 pb-5 space-y-4 border-t" style={{ borderColor: "var(--dp-border)" }}>
                        <div className="grid md:grid-cols-2 gap-4 pt-4">
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wide mb-2 text-green-400">✓ Best For</h4>
                            <p className="text-sm leading-relaxed" style={{ color: "var(--dp-text-muted)" }}>{truck.bestFor}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wide mb-2 text-red-400">✗ Avoid When</h4>
                            <p className="text-sm leading-relaxed" style={{ color: "var(--dp-text-muted)" }}>{truck.avoid}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--dp-text-faint)" }}>Common Uses</h4>
                          <div className="flex flex-wrap gap-2">
                            {truck.uses.map((u) => (
                              <span key={u} className={cn("text-xs px-2 py-1 rounded-md", cat.bg, cat.color)}>{u}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--dp-text-faint)" }}>Top Brokers for This Equipment</h4>
                          <div className="flex flex-wrap gap-2">
                            {truck.brokers.map((b) => (
                              <span key={b} className="text-xs px-2 py-1 rounded-md border" style={{ borderColor: "var(--dp-border)", color: "var(--dp-text-muted)", background: "var(--dp-hover)" }}>{b}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
