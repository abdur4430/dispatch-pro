"use client";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Phone, Mail, MapPin, Target, MessageSquare, TrendingUp, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const COLD_CALL_SCRIPT = [
  { step: "Opener (5 sec)", text: '"Hi, this is [Name] with [Company]. Am I speaking with the transportation or logistics manager?"', tip: "If not the right person, ask who is and call them directly." },
  { step: "Hook (10 sec)", text: '"Perfect. We\'re a carrier based in [City] running [equipment] on [lanes]. I\'m reaching out because we have consistent capacity available and I\'d love to discuss how we could support your freight."', tip: "Mention a specific lane or equipment type relevant to their business." },
  { step: "Qualify (30 sec)", text: '"Quick question — how much freight are you moving per week, and what are your primary lanes? Are you working with carriers directly or mostly through brokers right now?"', tip: "Listen more than you talk. Their answer tells you what to pitch." },
  { step: "Value Prop (20 sec)", text: '"What I hear from a lot of shippers is that broker-only arrangements leave them scrambling when capacity gets tight. We offer direct carrier relationships with real-time tracking, consistent drivers, and net-30 billing."', tip: "Address the pain point you uncovered in the qualifying question." },
  { step: "Close (10 sec)", text: '"I don\'t want to take too much of your time today — could we schedule a 15-minute call this week to see if there\'s a fit? I can also send over our carrier packet if you\'d like."', tip: "Always end with a specific, low-commitment ask." },
];

const PROSPECTING_SOURCES = [
  { source: "Google Maps", how: "Search '[city] manufacturing plants', '[city] food distributors', '[city] warehouses'. Most listings include phone numbers and addresses.", effort: "Low", quality: "Medium" },
  { source: "LinkedIn Sales Navigator", how: "Search for 'Logistics Manager', 'Transportation Manager', 'Supply Chain Director' at companies in your lanes. Message first, then call.", effort: "Medium", quality: "High" },
  { source: "FMCSA Shipper List", how: "FMCSA publishes shipper/broker data. Filter by state and industry for targeted prospecting. Use our Carrier Lookup to find contact info.", effort: "Medium", quality: "High" },
  { source: "Load Boards (reverse)", how: "Look at who's posting loads on DAT and Truckstop in your lane. These are active shippers. Call them directly — often they're using brokers and would prefer carrier-direct.", effort: "Low", quality: "Very High" },
  { source: "Industry Associations", how: "National Association of Manufacturers (NAM), Food Industry Association, National Retail Federation — all have member directories.", effort: "Medium", quality: "High" },
  { source: "Trade Publications", how: "FreightWaves, Logistics Management, Supply Chain Dive run articles on companies expanding distribution networks. These are warm leads — they're actively growing.", effort: "Low", quality: "High" },
  { source: "Port Authority Directories", how: "If you run to/from ports, port authority websites list all registered importers/exporters. Prime targets for drayage and transloading.", effort: "Low", quality: "Very High" },
  { source: "Referrals from Drivers", how: "Your drivers talk to dock workers, shipping managers, and plant supervisors every day. Incentivize them to bring back leads. Best source of warm introductions.", effort: "Low", quality: "Very High" },
];

const EMAIL_TEMPLATES = [
  {
    label: "Initial Outreach",
    subject: "Carrier capacity on [Chicago → Dallas] lane — direct rates available",
    body: `Hi [Name],

I wanted to reach out because we're a carrier running consistent capacity on the [Chicago → Dallas] corridor and I noticed [Company Name] likely has freight moving through that lane.

We specialize in [equipment type] and currently have [X] trucks available per week on this lane. Unlike broker arrangements, we offer:
• Direct carrier relationship with real drivers, not middlemen
• Real-time tracking via [ELD system]
• Competitive net-30 billing
• Consistent pricing — no surge pricing when the market tightens

Would you be open to a quick 10-minute call this week to see if there's a fit?

[Your Name]
[Company] | DOT# [number] | MC# [number]
[Phone] | [Email]`,
  },
  {
    label: "Follow-Up (Day 5)",
    subject: "Following up — [Your Company] capacity on [Lane]",
    body: `Hi [Name],

I sent a note last week about our capacity on [Lane] and wanted to follow up. I know you're busy, so I'll be brief.

We currently have [X] trucks available per week and can offer [rate range] for consistent volume. I've attached our carrier packet with authority, insurance, and safety record.

If now isn't the right time, I completely understand — but I'd love to stay on your radar for when you need a reliable direct carrier.

15 minutes this week?

[Your Name]`,
  },
  {
    label: "Re-engagement (90 days)",
    subject: "We just expanded our fleet — capacity available in [your market]",
    body: `Hi [Name],

I reached out a few months back about carrier capacity. We've since added [X] new trucks to our fleet and now cover [lanes] with dedicated equipment.

I'm reaching back out because [specific reason: capacity crunch coming, we now have reefer, we're running a new lane, etc.].

Would it make sense to revisit the conversation? Happy to send an updated rate sheet.

[Your Name]`,
  },
];

export default function OutreachGuidePage() {
  return (
    <div style={{ background: "var(--dp-bg)", minHeight: "100vh" }}>
      <AppTopbar title="Outreach Guide" subtitle="How to prospect, pitch, and close trucking company relationships" />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Hero */}
        <div className="rounded-2xl border p-6" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--dp-text)" }}>Trucking Industry Outreach Playbook</h2>
              <p className="text-sm" style={{ color: "var(--dp-text-muted)" }}>Proven scripts, templates, and strategies for landing carrier and shipper accounts</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[
              { label: "Cold Call Close Rate", value: "2–5%", sub: "industry average" },
              { label: "Follow-Ups Needed", value: "5–8x", sub: "to close most deals" },
              { label: "Best Call Times", value: "Tue–Thu", sub: "9–11am & 2–4pm" },
              { label: "Email Open Rate", value: "~24%", sub: "with good subject lines" },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: "var(--dp-hover)" }}>
                <p className="text-lg font-bold text-brand-400">{s.value}</p>
                <p className="text-xs font-medium" style={{ color: "var(--dp-text)" }}>{s.label}</p>
                <p className="text-xs" style={{ color: "var(--dp-text-faint)" }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cold Call Script */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
          <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "var(--dp-border)" }}>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Phone className="w-4 h-4 text-green-400" />
            </div>
            <h3 className="font-bold text-green-400">Proven Cold Call Script (60 seconds)</h3>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--dp-border)" }}>
            {COLD_CALL_SCRIPT.map(({ step, text, tip }) => (
              <div key={step} className="px-6 py-4">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 shrink-0 mt-0.5">{step}</span>
                  <div>
                    <p className="text-sm font-medium italic mb-1.5" style={{ color: "var(--dp-text)" }}>{text}</p>
                    <p className="text-xs flex items-start gap-1.5" style={{ color: "var(--dp-text-muted)" }}>
                      <Zap className="w-3 h-3 text-yellow-400 shrink-0 mt-0.5" />
                      <span><strong className="text-yellow-400">Pro tip:</strong> {tip}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prospecting Sources */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
          <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "var(--dp-border)" }}>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-brand-400" />
            </div>
            <h3 className="font-bold text-brand-400">Where to Find Trucking Clients</h3>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--dp-border)" }}>
            {PROSPECTING_SOURCES.map(({ source, how, effort, quality }) => {
              const qualityColor = quality === "Very High" ? "text-green-400 bg-green-500/10" : quality === "High" ? "text-brand-400 bg-brand-500/10" : "text-yellow-400 bg-yellow-500/10";
              return (
                <div key={source} className="px-6 py-4 flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="text-sm font-semibold" style={{ color: "var(--dp-text)" }}>{source}</h4>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", qualityColor)}>
                        {quality} quality
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--dp-hover)", color: "var(--dp-text-faint)" }}>
                        {effort} effort
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: "var(--dp-text-muted)" }}>{how}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Email Templates */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
          <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "var(--dp-border)" }}>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="font-bold text-purple-400">Email Templates</h3>
          </div>
          <div className="divide-y space-y-0" style={{ borderColor: "var(--dp-border)" }}>
            {EMAIL_TEMPLATES.map(({ label, subject, body }) => (
              <div key={label} className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold" style={{ color: "var(--dp-text)" }}>{label}</h4>
                  <button
                    onClick={() => navigator.clipboard?.writeText(`Subject: ${subject}\n\n${body}`)}
                    className="text-xs px-2 py-1 rounded-lg border hover:bg-[var(--dp-hover)] transition-colors"
                    style={{ borderColor: "var(--dp-border)", color: "var(--dp-text-faint)" }}
                  >
                    Copy
                  </button>
                </div>
                <div className="rounded-lg p-3 mb-2 text-xs" style={{ background: "var(--dp-hover)", color: "var(--dp-text-muted)" }}>
                  <strong style={{ color: "var(--dp-text)" }}>Subject:</strong> {subject}
                </div>
                <pre
                  className="text-xs leading-relaxed whitespace-pre-wrap font-sans rounded-lg p-3"
                  style={{ background: "var(--dp-hover)", color: "var(--dp-text-muted)" }}
                >
                  {body}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Objection Handling */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
          <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "var(--dp-border)" }}>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="font-bold text-red-400">Handling Common Objections</h3>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--dp-border)" }}>
            {[
              { obj: '"We already have carriers."', response: '"That\'s great — most of my best clients said the same thing before we started. My question is: do you have backup capacity when your primary carriers are full? We could be your overflow solution, no risk."' },
              { obj: '"Your rate is too high."', response: '"I understand — can I ask what you\'re paying now? [listen] The difference you\'re seeing likely reflects our on-time percentage and direct driver communication. What\'s a late delivery actually cost you when it happens?"' },
              { obj: '"We only use brokers."', response: '"Brokers are a great tool — we work with them too. But direct carrier relationships give you price certainty and someone accountable when things go wrong. Brokers can\'t make a driver stay for a late pickup. We can."' },
              { obj: '"Send me your information."', response: '"Absolutely — I\'ll send it right now while I have you. Quick question though: if the rates look good after you review it, what would the next step look like on your end? Is there someone else I should include?"' },
              { obj: '"We\'re not looking right now."', response: '"No problem at all. When do you typically make changes to your carrier mix? [listen] I\'d love to stay on your radar. Would it be okay if I followed up in [timeframe they gave you]?"' },
            ].map(({ obj, response }) => (
              <div key={obj} className="px-6 py-4">
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--dp-text)" }}>{obj}</p>
                <p className="text-sm italic" style={{ color: "var(--dp-text-muted)" }}>{response}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Plan */}
        <div className="rounded-2xl border p-6 bg-brand-600/5 border-brand-600/20">
          <h3 className="font-bold text-brand-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> 30-Day Outreach Action Plan
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { period: "Week 1–2", title: "Build Your List", items: ["Identify 50 target companies using load board reverse-prospecting", "Find decision-maker names via LinkedIn", "Verify phone numbers via company websites", "Segment by lane match to your capacity"] },
              { period: "Week 2–3", title: "First Contact", items: ["Call 10 prospects per day (takes ~2 hours)", "Send email same day to all called numbers", "Log outcomes in your CRM or DispatchPro", "Book 3–5 follow-up calls"] },
              { period: "Week 3–4", title: "Follow Up & Close", items: ["Follow up on all 'send info' responses", "Second call to non-responders", "Schedule demo calls with interested prospects", "Close first test load from at least 1 new client"] },
            ].map(({ period, title, items }) => (
              <div key={period} className="rounded-xl p-4 border" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
                <span className="text-xs text-brand-400 font-bold">{period}</span>
                <h4 className="font-semibold mt-1 mb-3 text-sm" style={{ color: "var(--dp-text)" }}>{title}</h4>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs" style={{ color: "var(--dp-text-muted)" }}>
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
