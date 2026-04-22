import React from "react";
import { motion } from "motion/react";
import { BookOpen, Shield, Ghost, Users, Activity, Scale, EyeOff, Terminal } from "lucide-react";

export default function Guidelines() {
  return (
    <div className="pt-24 pb-24 max-w-4xl mx-auto space-y-24 px-4 overflow-hidden">
      {/* Intro */}
      <section className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-8 shadow-sm">
            <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="type-display-large text-5xl md:text-6xl gradient-text pb-2">Rules of Engagement.</h1>
        <p className="type-ui text-[10px] uppercase tracking-widest opacity-50 max-w-lg mx-auto leading-relaxed font-bold">
            Protocol v4.0.2 // Established for total operational clarity.
        </p>
      </section>

      {/* Main Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {[
            { 
                title: "Absolute Anonymity", 
                icon: <EyeOff className="w-6 h-6" />, 
                desc: "Your node identity is your shield. Respect the shadow. Doxxing or attempting to reveal real-world identities results in immediate permanent blacklisting." 
            },
            { 
                title: "Signal Integrity", 
                icon: <Terminal className="w-6 h-6" />, 
                desc: "Post with intention. We are here for data, patterns, and theories—not noise. Low-effort spam or meaningless static will be pruned by the Archons." 
            },
            { 
                title: "Zero State Influence", 
                icon: <Shield className="w-6 h-6" />, 
                desc: "This is a strictly non-state space. Any detection of state-sponsored psychological operations or influence campaigns will be met with full filtration." 
            },
            { 
                title: "The Logic of Truth", 
                icon: <Scale className="w-6 h-6" />, 
                desc: "Be prepared to back your signal. Use citations, telemetry, and logic. We hunt for the hidden, but we do not invent the impossible for entertainment." 
            }
        ].map((item, i) => (
            <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-dark p-8 md:p-10 rounded-3xl border border-white/5 space-y-6 hover:bg-white/[0.04] transition-colors"
            >
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20">
                    {item.icon}
                </div>
                <h3 className="type-title text-2xl text-white/90">{item.title}</h3>
                <p className="type-ui text-sm opacity-60 leading-relaxed">{item.desc}</p>
            </motion.div>
        ))}
      </div>

      {/* Enforcement */}
      <section className="glass-dark rounded-3xl p-10 md:p-16 border border-white/5 space-y-12">
         <div className="text-center space-y-4">
            <h2 className="type-display-medium text-3xl md:text-4xl text-white/90">The Enforcement Ladder</h2>
            <p className="type-ui text-xs uppercase tracking-widest opacity-40 font-bold">What happens when frequencies clash.</p>
         </div>
         
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            {[
                { l: "Phase 1", t: "Pruning", d: "Content removal and temporary node suppression for minor noise incidents." },
                { l: "Phase 2", t: "Restriction", d: "Suspension of transmission privileges. Observation mode only for duration of penalty." },
                { l: "Phase 3", t: "Purge", d: "Total coordinate removal. Permanent IP/Identity block from all network signals." }
            ].map((p, i) => (
                <div key={i} className="space-y-4">
                    <div className="type-ui text-[10px] uppercase font-bold tracking-widest text-violet-500">{p.l}</div>
                    <div className="type-title text-xl text-white/90">{p.t}</div>
                    <p className="type-ui text-sm opacity-60 leading-relaxed">{p.d}</p>
                </div>
            ))}
         </div>
      </section>

      <div className="text-center">
         <button className="px-10 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full type-ui font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all">
            Acknowledge & Sync
         </button>
      </div>
    </div>
  );
}
