"use client";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Users, CheckCircle, AlertCircle, DollarSign, FileText, Phone, Clock, Star } from "lucide-react";

const SECTIONS = [
  {
    icon: Star,
    title: "Identifying Ideal Clients",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    content: [
      { heading: "High-Volume Shippers", body: "Target businesses that ship multiple times per week — grocery distributors, manufacturing plants, auto parts suppliers. These create recurring revenue vs. one-off moves." },
      { heading: "Time-Sensitive Cargo Owners", body: "Medical suppliers, perishable food companies, and automotive manufacturers need reliable on-time delivery and will pay premium rates for it." },
      { heading: "Niche Industry Match", body: "Pair your equipment to an industry: refrigerated trucks → grocery chains; flatbeds → construction companies; dry vans → retail and e-commerce." },
      { heading: "Red Flags to Avoid", body: "Brokers who consistently low-ball, clients who refuse to sign contracts, shippers with history of cargo claims, and anyone requesting net-60+ payment terms without credit history." },
    ],
  },
  {
    icon: FileText,
    title: "Onboarding a New Client",
    color: "text-brand-400",
    bg: "bg-brand-500/10",
    content: [
      { heading: "Step 1: Rate Confirmation Letter", body: "Always get agreed rates in writing before the first load. Include lane, equipment type, base rate, fuel surcharge method (EIA-indexed or flat %), and accessorial charges." },
      { heading: "Step 2: Credit Application", body: "New clients should complete a credit app so you know their payment behavior. Use a service like D&B to verify their credit score before extending terms." },
      { heading: "Step 3: W-9 & Insurance Certificates", body: "Exchange insurance certificates. Your carrier insurance should list the client as additional insured where required. Get their Certificate of Insurance too." },
      { heading: "Step 4: Bill of Lading Setup", body: "Agree on BOL format, special instructions, and who signs. Establish who handles detention, layover, and lumper fees upfront to avoid disputes." },
      { heading: "Step 5: EDI or TMS Integration", body: "For large clients, explore EDI connectivity (210 invoicing, 214 status updates, 204 load tender) to streamline communication and eliminate manual entry." },
    ],
  },
  {
    icon: DollarSign,
    title: "Billing & Collections",
    color: "text-green-400",
    bg: "bg-green-500/10",
    content: [
      { heading: "Invoice Same Day", body: "Invoice the moment POD (Proof of Delivery) is confirmed. Delayed invoicing = delayed payment. Attach BOL, delivery receipt, and any accessorial documentation." },
      { heading: "Payment Terms Strategy", body: "New clients: Net-15. Established clients: Net-30. Never Net-60+ unless you're factoring receivables. Quick-pay at 2% discount is often worth the arbitrage." },
      { heading: "Freight Factoring", body: "For cash flow, factor your invoices with companies like OTR Capital, RTS Financial, or Triumph Business Capital. Typical rate: 1.5–3.5% per invoice for immediate payment." },
      { heading: "Collections Escalation", body: "Day 1-15: polite reminder. Day 16-30: formal demand letter. Day 31-45: collection agency or small claims court. Keep all documentation. File a freight claim if cargo was disputed." },
      { heading: "Double Broker Warning", body: "Always verify the load origin. If you're brokered a load from another broker (double brokering), you may have limited legal recourse if the shipper doesn't pay the original broker." },
    ],
  },
  {
    icon: Phone,
    title: "Client Communication Standards",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    content: [
      { heading: "Proactive Status Updates", body: "Don't wait for clients to ask. Call at pickup confirmation, any delays >30 min, and delivery confirmation. Text works for quick updates; email for documentation." },
      { heading: "Delay Protocol", body: "If a load will be late: call the client immediately, give a revised ETA, explain the reason, and document it. Surprises destroy trust. Early communication preserves it." },
      { heading: "Quarterly Business Reviews", body: "For top clients, schedule quarterly calls. Review on-time percentage, claim rates, volume, and rates. Clients who feel valued give you more freight." },
      { heading: "After-Hours Coverage", body: "Drivers run 24/7. Have a dispatch phone number staffed after hours or use an answering service. Unanswered calls at 2am cost loads and relationships." },
    ],
  },
  {
    icon: Clock,
    title: "Retention & Growth",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    content: [
      { heading: "Dedicated Lanes", body: "Offer dedicated lane pricing — slightly lower rate for volume commitment. Clients love rate predictability; you get guaranteed revenue. Win-win." },
      { heading: "Performance Reporting", body: "Send monthly scorecards showing on-time %, claims ratio, average transit time. Clients who see your data are less likely to shop your lane to competitors." },
      { heading: "Capacity Guarantees During Tight Markets", body: "When capacity is scarce (produce season, peak holidays), clients who pay fair rates deserve priority. Let them know you'll always have a truck for them." },
      { heading: "Expanding Wallet Share", body: "Once you've established trust, ask: 'We're expanding our reefer fleet — are there temperature-controlled lanes we could help you with?' Organic growth from existing clients is the cheapest sales you'll ever do." },
    ],
  },
];

export default function ClientGuidePage() {
  return (
    <div style={{ background: "var(--dp-bg)", minHeight: "100vh" }}>
      <AppTopbar title="Client Playbook" subtitle="Build, manage, and grow profitable shipper relationships" />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Hero */}
        <div className="rounded-2xl border p-6" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--dp-text)" }}>The Complete Client Playbook</h2>
              <p className="text-sm" style={{ color: "var(--dp-text-muted)" }}>From prospecting to long-term contracts — everything a dispatcher needs</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Avg Client LTV", value: "$180K+", sub: "over 3 years" },
              { label: "Invoice on Day", value: "Same", sub: "of delivery" },
              { label: "Ideal Terms", value: "Net-30", sub: "for new clients" },
              { label: "QBR Cadence", value: "Quarterly", sub: "for key accounts" },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: "var(--dp-hover)" }}>
                <p className="text-lg font-bold text-brand-400">{s.value}</p>
                <p className="text-xs font-medium" style={{ color: "var(--dp-text)" }}>{s.label}</p>
                <p className="text-xs" style={{ color: "var(--dp-text-faint)" }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map(({ icon: Icon, title, color, bg, content }) => (
          <div key={title} className="rounded-2xl border overflow-hidden" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
            <div className={`flex items-center gap-3 px-6 py-4 border-b`} style={{ borderColor: "var(--dp-border)" }}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <h3 className={`font-bold ${color}`}>{title}</h3>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--dp-border)" }}>
              {content.map(({ heading, body }) => (
                <div key={heading} className="px-6 py-4">
                  <h4 className="text-sm font-semibold mb-1" style={{ color: "var(--dp-text)" }}>{heading}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--dp-text-muted)" }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Quick Reference Card */}
        <div className="rounded-2xl border p-6 bg-brand-600/5 border-brand-600/20">
          <h3 className="font-bold text-brand-400 mb-4">Quick Reference: Client Lifecycle Checklist</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "Rate confirmation letter signed",
              "Credit application completed & verified",
              "Insurance certificates exchanged",
              "BOL format & accessorial policy agreed",
              "Invoicing address & contact confirmed",
              "Payment terms in writing",
              "Emergency contact for after-hours",
              "EDI or TMS integration (if applicable)",
              "First load debrief call scheduled",
              "Quarterly review calendar invite sent",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--dp-text-muted)" }}>
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
