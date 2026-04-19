"use client";
import { useState, useRef, useCallback } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { AppTopbar } from "@/components/layout/AppTopbar";
import {
  Phone, PhoneOff, PhoneIncoming, PhoneMissed, PhoneCall,
  Delete, Clock, Star, Users, Search, Mic, MicOff,
  Volume2, VolumeX, MoreHorizontal, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const CONTACTS_QUERY = gql`
  query DialerContacts {
    drivers(first: 50) { nodes { id firstName lastName phone status } }
    clients(first: 50) { nodes { id name contactName phone } }
  }
`;

const KEYS = [
  { digit: "1", sub: "" }, { digit: "2", sub: "ABC" }, { digit: "3", sub: "DEF" },
  { digit: "4", sub: "GHI" }, { digit: "5", sub: "JKL" }, { digit: "6", sub: "MNO" },
  { digit: "7", sub: "PQRS" }, { digit: "8", sub: "TUV" }, { digit: "9", sub: "WXYZ" },
  { digit: "*", sub: "" }, { digit: "0", sub: "+" }, { digit: "#", sub: "" },
];

const MOCK_HISTORY = [
  { id: "1", name: "Bob Trucking LLC", number: "+1-312-555-0198", type: "outgoing", duration: "4:32", when: "2 min ago" },
  { id: "2", name: "Chicago Freight Co", number: "+1-773-555-0145", type: "incoming", duration: "1:18", when: "1h ago" },
  { id: "3", name: "Mike Wilson (Driver)", number: "+1-847-555-0172", type: "missed", duration: "", when: "3h ago" },
  { id: "4", name: "Great Lakes Dispatch", number: "+1-312-555-0234", type: "outgoing", duration: "12:44", when: "Yesterday" },
  { id: "5", name: "Sarah Chen (Client)", number: "+1-708-555-0167", type: "outgoing", duration: "7:05", when: "Yesterday" },
  { id: "6", name: "Midwest Carriers", number: "+1-630-555-0189", type: "incoming", duration: "3:21", when: "2 days ago" },
];

type CallState = "idle" | "calling" | "active" | "ended";

export default function DialerPage() {
  const [tab, setTab] = useState<"keypad" | "contacts" | "history">("keypad");
  const [digits, setDigits] = useState("");
  const [callState, setCallState] = useState<CallState>("idle");
  const [callTarget, setCallTarget] = useState<{ name: string; number: string } | null>(null);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [search, setSearch] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data } = useQuery<any>(CONTACTS_QUERY);

  const allContacts = [
    ...(data?.drivers?.nodes ?? []).map((d: any) => ({
      id: d.id, name: `${d.firstName} ${d.lastName}`, number: d.phone ?? "",
      type: "driver", status: d.status,
    })),
    ...(data?.clients?.nodes ?? []).map((c: any) => ({
      id: c.id, name: c.name, number: c.phone ?? "",
      type: "client", contactName: c.contactName,
    })),
  ].filter((c) => c.number);

  const filtered = allContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.number.includes(search)
  );

  function pressKey(k: string) {
    setDigits((d) => d + k);
  }

  function backspace() {
    setDigits((d) => d.slice(0, -1));
  }

  function startCall(name: string, number: string) {
    setCallTarget({ name, number });
    setCallState("calling");
    setElapsed(0);
    // Simulate connection after 2s
    setTimeout(() => {
      setCallState("active");
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }, 2000);
  }

  function callFromKeypad() {
    if (!digits) return;
    startCall(digits, digits);
  }

  function hangUp() {
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState("ended");
    setTimeout(() => { setCallState("idle"); setCallTarget(null); setDigits(""); }, 1500);
  }

  function formatElapsed(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }

  const historyIcon = (type: string) => {
    if (type === "outgoing") return <PhoneCall className="w-4 h-4 text-brand-400" />;
    if (type === "missed") return <PhoneMissed className="w-4 h-4 text-red-400" />;
    return <PhoneIncoming className="w-4 h-4 text-green-400" />;
  };

  return (
    <div style={{ background: "var(--dp-bg)", minHeight: "100vh" }}>
      <AppTopbar title="Dialer" subtitle="Click-to-call with your contacts" />

      <div className="p-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT: Keypad / Active Call ── */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}
          >
            {/* Active Call Overlay */}
            {callState !== "idle" && (
              <div className="p-8 flex flex-col items-center gap-6">
                <div className="relative">
                  <div
                    className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white",
                      callState === "active" ? "bg-green-600 animate-pulse-ring" : "bg-steel-600"
                    )}
                  >
                    {callTarget?.name?.[0]?.toUpperCase() ?? "#"}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xl font-semibold" style={{ color: "var(--dp-text)" }}>{callTarget?.name}</p>
                  <p className="text-sm mt-1" style={{ color: "var(--dp-text-muted)" }}>
                    {callState === "calling" && "Calling…"}
                    {callState === "active" && formatElapsed(elapsed)}
                    {callState === "ended" && "Call ended"}
                  </p>
                </div>

                {callState === "active" && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => setMuted(!muted)}
                      className={cn("w-14 h-14 rounded-full flex items-center justify-center border transition-all",
                        muted ? "bg-red-500/20 border-red-500/50 text-red-400" : "border-[var(--dp-border)] hover:bg-[var(--dp-hover)]"
                      )}
                      style={muted ? {} : { color: "var(--dp-text-muted)" }}
                    >
                      {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setSpeakerOn(!speakerOn)}
                      className={cn("w-14 h-14 rounded-full flex items-center justify-center border transition-all",
                        speakerOn ? "bg-brand-500/20 border-brand-500/50 text-brand-400" : "border-[var(--dp-border)] hover:bg-[var(--dp-hover)]"
                      )}
                      style={speakerOn ? {} : { color: "var(--dp-text-muted)" }}
                    >
                      {speakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                  </div>
                )}

                <button
                  onClick={hangUp}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-all"
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </button>
              </div>
            )}

            {callState === "idle" && (
              <>
                {/* Display */}
                <div className="p-6 pb-2 text-center">
                  <div
                    className="text-3xl font-mono tracking-widest min-h-[2.5rem]"
                    style={{ color: "var(--dp-text)" }}
                  >
                    {digits || <span style={{ color: "var(--dp-text-faint)" }}>Enter number</span>}
                  </div>
                </div>

                {/* Keypad Grid */}
                <div className="px-8 py-4 grid grid-cols-3 gap-4 justify-items-center">
                  {KEYS.map(({ digit, sub }) => (
                    <button key={digit} className="key-btn" onClick={() => pressKey(digit)}>
                      <span className="text-xl font-semibold" style={{ color: "var(--dp-text)" }}>{digit}</span>
                      {sub && <span className="text-[10px] tracking-widest mt-0.5" style={{ color: "var(--dp-text-faint)" }}>{sub}</span>}
                    </button>
                  ))}
                </div>

                {/* Call / Delete row */}
                <div className="px-8 pb-8 flex items-center justify-center gap-8 mt-2">
                  <div className="w-16" />
                  <button
                    onClick={callFromKeypad}
                    disabled={!digits}
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all",
                      digits ? "bg-green-500 hover:bg-green-600" : "opacity-40 cursor-not-allowed"
                    )}
                    style={{ background: digits ? undefined : "var(--dp-surface)" }}
                  >
                    <Phone className="w-7 h-7 text-white" />
                  </button>
                  <button
                    onClick={backspace}
                    className="w-16 h-16 flex items-center justify-center transition-all"
                    style={{ color: "var(--dp-text-muted)" }}
                  >
                    {digits && <Delete className="w-6 h-6" />}
                  </button>
                </div>

                {/* Twilio Integration Notice */}
                <div className="mx-6 mb-6 px-4 py-3 rounded-lg text-xs border border-brand-600/30 bg-brand-600/5" style={{ color: "var(--dp-text-muted)" }}>
                  <strong className="text-brand-400">Connect Twilio</strong> — Add <code className="text-xs bg-[var(--dp-hover)] px-1 rounded">TWILIO_SID</code>, <code className="text-xs bg-[var(--dp-hover)] px-1 rounded">TWILIO_TOKEN</code>, and <code className="text-xs bg-[var(--dp-hover)] px-1 rounded">TWILIO_NUMBER</code> to .env.local for live calls via WebRTC.
                </div>
              </>
            )}
          </div>

          {/* ── RIGHT: Contacts / History ── */}
          <div
            className="rounded-2xl border overflow-hidden flex flex-col"
            style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}
          >
            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: "var(--dp-border)" }}>
              {(["contacts", "history"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "flex-1 py-3 text-sm font-medium capitalize transition-colors",
                    tab === t ? "text-brand-400 border-b-2 border-brand-500" : ""
                  )}
                  style={tab !== t ? { color: "var(--dp-text-muted)" } : {}}
                >
                  {t === "contacts" ? <span className="flex items-center justify-center gap-1"><Users className="w-3.5 h-3.5" /> Contacts</span> : <span className="flex items-center justify-center gap-1"><Clock className="w-3.5 h-3.5" /> Recent Calls</span>}
                </button>
              ))}
            </div>

            {/* Search */}
            {tab === "contacts" && (
              <div className="p-3 border-b" style={{ borderColor: "var(--dp-border)" }}>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ background: "var(--dp-input-bg)", borderColor: "var(--dp-input-border)" }}>
                  <Search className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--dp-text-faint)" }} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search drivers & clients…"
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: "var(--dp-text)" }}
                  />
                </div>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "var(--dp-border)" }}>
              {tab === "contacts" &&
                (filtered.length === 0 ? (
                  <div className="p-8 text-center text-sm" style={{ color: "var(--dp-text-muted)" }}>
                    No contacts with phone numbers yet.<br />Add them in Drivers or Clients.
                  </div>
                ) : (
                  filtered.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--dp-hover)] cursor-pointer transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-full bg-brand-600/20 flex items-center justify-center text-sm font-bold text-brand-400 shrink-0">
                        {c.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--dp-text)" }}>{c.name}</p>
                        <p className="text-xs truncate" style={{ color: "var(--dp-text-muted)" }}>
                          {c.type === "driver" ? "Driver" : "Client"} · {c.number}
                        </p>
                      </div>
                      <button
                        onClick={() => startCall(c.name, c.number)}
                        className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 transition-all hover:bg-green-500/30"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ))}

              {tab === "history" &&
                MOCK_HISTORY.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--dp-hover)] cursor-pointer transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--dp-hover)" }}>
                      {historyIcon(h.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--dp-text)" }}>{h.name}</p>
                      <p className="text-xs" style={{ color: "var(--dp-text-muted)" }}>
                        {h.number} {h.duration && `· ${h.duration}`} · {h.when}
                      </p>
                    </div>
                    <button
                      onClick={() => startCall(h.name, h.number)}
                      className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 transition-all hover:bg-green-500/30"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>

            {/* Power Dialer Banner */}
            <div className="p-4 border-t" style={{ borderColor: "var(--dp-border)" }}>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-600/10 border border-brand-600/20">
                <Phone className="w-5 h-5 text-brand-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-400">Power Dialer</p>
                  <p className="text-xs" style={{ color: "var(--dp-text-muted)" }}>Auto-dial all contacts in a list sequentially</p>
                </div>
                <button className="text-xs px-3 py-1.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors">
                  Start
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
