import React from "react";
import { motion } from "motion/react";
import { Eye, Globe, Hexagon, Layers, Search, Sparkles, Zap } from "lucide-react";

export default function Vision() {
  return (
    <div className="pt-32 pb-24 max-w-5xl mx-auto space-y-24 px-4">
      {/* Vision Header */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 type-ui text-[10px] font-bold uppercase tracking-widest text-violet-500">
           <Zap className="w-4 h-4" /> The 100-Year Protocol
        </div>
        <h1 className="type-display-large text-5xl md:text-7xl gradient-text leading-tight py-2">
          A Permanent<br />Record for the<br />Forbidden.
        </h1>
        <p className="type-ui text-lg md:text-xl font-medium opacity-50 leading-relaxed max-w-2xl">
            "Our vision is the preservation of the narrative's outliers. We build for a future where 
            information is free from the gravity of institutional control."
        </p>
      </section>

      {/* Philosophy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
         {[
           { t: "Decentralized Truth", d: "No single server holds the keys. The Cave is a peer-to-peer consciousness that exists across ten thousand nodes.", i: <Globe /> },
           { t: "The Long Archive", d: "We are building an archive that outlives its creators. A digital library buried in the limestone of the internet.", i: <Layers /> },
           { t: "Cognitive Liberty", d: "Information should not be restricted by the person’s geographic location or socioeconomic status.", i: <Eye /> },
           { t: "Algorithmic Neutrality", d: "Zero recommendation algorithms. You find what you seek, not what we want you to see.", i: <Search /> },
         ].map((p, i) => (
             <div key={i} className="p-10 md:p-12 bg-cave-void hover:bg-white/[0.02] transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-400 mb-6 border border-violet-500/20 group-hover:bg-violet-600/30 transition-all">
                    {p.i}
                </div>
                <h3 className="type-title text-2xl text-white/90 mb-4">{p.t}</h3>
                <p className="type-ui text-sm opacity-60 leading-relaxed">{p.d}</p>
             </div>
         ))}
      </div>

      {/* Future Roadmap section (conceptual) */}
      <section className="glass-dark p-8 md:p-16 rounded-3xl border border-white/5 space-y-12">
        <h2 className="type-display-medium text-3xl md:text-4xl text-white/90 text-center">Evolution of the Signal</h2>
        <div className="relative border-l border-white/5 ml-4 pl-10 md:pl-12 space-y-12">
            {[
                { y: "2026", t: "The Great Intercept", d: "Deployment of the v4.0.0 Sophisticated Dark interface and global node expansion." },
                { y: "2027", t: "Neural Transmissions", d: "Introduction of encrypted cognitive signatures for high-clearance conspirators." },
                { y: "2028", t: "The Deep Archive", d: "Launching the first solar-powered physical storage node in the Great Altai Mountains." },
            ].map((ev, i) => (
                <div key={i} className="relative">
                    <div className="absolute -left-[45px] md:-left-[53px] top-1 w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                    <div className="type-ui text-[10px] uppercase font-bold tracking-widest text-violet-400 mb-2">{ev.y}</div>
                    <div className="type-title text-xl text-white/80">{ev.t}</div>
                    <p className="type-ui text-sm opacity-60 mt-2">{ev.d}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Quote */}
      <div className="text-center pb-12 pt-8">
         <Sparkles className="w-8 h-8 text-violet-400 mx-auto mb-6 opacity-40" />
         <p className="type-ui text-xl md:text-2xl font-light text-white/40 max-w-3xl mx-auto italic">
            "The greatest conspiracy is the one that tells you there are none. We are the antidote to the comfortably numb."
         </p>
      </div>
    </div>
  );
}
