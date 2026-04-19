"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Truck, Users, Navigation, Shield, BarChart3 } from "lucide-react";

const LandingHero = dynamic(() => import("@/components/three/LandingHero"), { ssr: false });

const features = [
  { icon: Truck, title: "Fleet Management", desc: "Track trucks by size, usage, segment, load capacity, and distance range. Full permit & license tracking." },
  { icon: Users, title: "Driver & Client Hub", desc: "Manage your entire driver roster and client directory. CDL tracking, expiry alerts, billing profiles." },
  { icon: Navigation, title: "Smart Dispatching", desc: "Multi-step dispatch orders with real-time status tracking, route visualization, and financial reporting." },
  { icon: Shield, title: "Compliance Ready", desc: "DOT, MC, IFTA, IRP, Hazmat tracking. Never miss a permit expiry again." },
  { icon: BarChart3, title: "Revenue Insights", desc: "Dashboard stats, monthly revenue, active routes, and completed order analytics at a glance." },
  { icon: Zap, title: "Built for Speed", desc: "Lightning fast GraphQL API with real-time updates. Designed for dispatchers who move fast." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-steel-950 text-steel-100">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <LandingHero />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 bg-brand-600/20 border border-brand-500/30 rounded-full px-4 py-1.5 text-sm text-brand-400 mb-6">
              <Zap className="w-3.5 h-3.5" /> Professional Truck Dispatching Platform
            </div>
          </motion.div>
          <motion.h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
            Dispatch<span className="text-brand-400">Pro</span>
          </motion.h1>
          <motion.p className="text-xl md:text-2xl text-steel-300 mb-10 max-w-2xl mx-auto leading-relaxed" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            The modern dispatching platform for serious carriers. Manage your fleet, drivers, clients, and orders — all in one place.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <Link href="/sign-up"><Button size="lg" className="text-base px-8 shadow-lg shadow-brand-900/40">Get Started Free</Button></Link>
            <Link href="/sign-in"><Button variant="outline" size="lg" className="text-base px-8">Sign In</Button></Link>
          </motion.div>
        </div>
        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <motion.div className="w-6 h-10 border-2 border-steel-600 rounded-full flex items-start justify-center pt-2" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}>
            <div className="w-1.5 h-3 bg-brand-400 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl font-bold text-white mb-4">Everything you need to run your fleet</h2>
          <p className="text-steel-400 text-lg max-w-2xl mx-auto">Built for dispatchers, fleet managers, and owner-operators who demand speed and reliability.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} className="bg-steel-900/60 border border-steel-800 rounded-xl p-6 hover:border-brand-600/50 transition-colors group"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <div className="w-10 h-10 rounded-lg bg-brand-600/20 flex items-center justify-center mb-4 group-hover:bg-brand-600/30 transition-colors">
                <f.icon className="w-5 h-5 text-brand-400" />
              </div>
              <h3 className="font-semibold text-steel-100 mb-2">{f.title}</h3>
              <p className="text-sm text-steel-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <motion.div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-brand-900/40 to-steel-900 border border-brand-700/30 rounded-2xl p-12"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl font-bold text-white mb-4">Ready to modernize your dispatch?</h2>
          <p className="text-steel-300 mb-8 text-lg">Set up your company, add your fleet, and start dispatching in minutes.</p>
          <Link href="/sign-up"><Button size="lg" className="text-base px-10 shadow-xl shadow-brand-900/50">Start for Free →</Button></Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-steel-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-steel-500">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-400" />
            <span className="font-semibold text-steel-400">DispatchPro</span>
          </div>
          <p>© {new Date().getFullYear()} DispatchPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
