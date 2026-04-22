import React from "react";
import { motion } from "motion/react";
import { ShieldAlert, ShieldCheck, Lock, EyeOff, Key, Radio, Zap } from "lucide-react";

export default function Safety() {
  return (
    <div className="pt-24 pb-24 max-w-[1080px] mx-auto space-y-24 px-4 overflow-hidden">
      {/* Intro */}
      <section className="text-center space-y-6">
        <h1 className="type-display-large text-5xl md:text-6xl gradient-text px-4 pb-2">Operational Security.</h1>
        <p className="type-ui text-base md:text-lg opacity-60 max-w-2xl mx-auto leading-relaxed px-4">
            Protecting your node is our primary directive. Learn how the Cave secures your signals, 
            preserves your shadow, and counters surveillance.
        </p>
      </section>

      {/* Security Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {[
            { 
                t: "Signal Masking", 
                i: <EyeOff className="w-5 h-5" />, 
                d: "We strip all metadata from your transmissions at the ingress point. No IP logs, no device headers." 
            },
            { 
                t: "Encrypted Storage", 
                i: <Lock className="w-5 h-5" />, 
                d: "Data is fragmented across distributed nodes. Even with physical access, no single node holds a full signal." 
            },
            { 
                t: "Quantum Guard", 
                i: <Key className="w-5 h-5" />, 
                d: "Future-proof encryption protocols protect the archives against upcoming brute-force decryption eras." 
            }
        ].map((feat, i) => (
            <div key={i} className="glass-dark p-8 md:p-10 rounded-3xl border border-white/5 space-y-6 flex flex-col items-center text-center hover:bg-white/[0.04] transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    {feat.i}
                </div>
                <h3 className="type-title text-xl text-white/90">{feat.t}</h3>
                <p className="type-ui text-sm opacity-60 leading-relaxed font-light">{feat.d}</p>
            </div>
        ))}
      </div>

      {/* Reporting flow explanation */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
         <div className="space-y-8">
            <div className="type-ui text-[10px] uppercase font-bold tracking-widest text-violet-500">Threat Response</div>
            <h2 className="type-display-medium text-4xl md:text-5xl text-white/90 leading-tight">Intercepting Harm, Not Identity.</h2>
            <p className="type-ui text-base opacity-60 leading-relaxed max-w-md">
                Our reporting system is designed to remove toxic noise without compromising the anonymous nature of the reporter or the reported. 
                Archons review signals based on content logic, not user history.
            </p>
            <div className="space-y-4">
                {[
                    "Flag for Noise: Misinformation or Static",
                    "Flag for Breach: Doxxing or Identity Leak",
                    "Flag for Hazard: Real-world threat vectors"
                ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3 type-ui text-xs font-bold text-white/70">
                        <Zap className="w-4 h-4 text-violet-400 flex-shrink-0" /> 
                        <span>{s}</span>
                    </div>
                ))}
            </div>
         </div>
         <div className="relative max-w-md mx-auto w-full">
            <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%)" }} />
            <div className="relative glass-dark p-8 md:p-12 rounded-3xl border border-white/5 space-y-8 shadow-2xl">
                <div className="flex items-center gap-4">
                    <ShieldCheck className="w-10 h-10 text-emerald-400" />
                    <div>
                        <div className="type-title text-sm font-bold">Node Integrity Status</div>
                        <div className="type-ui text-[10px] uppercase tracking-widest text-emerald-400 mt-1">Total Operational Security</div>
                    </div>
                </div>
                <div className="h-px w-full bg-white/10" />
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <div className="type-ui text-[10px] uppercase opacity-40 font-bold tracking-widest mb-3">Reports Active</div>
                        <div className="type-title text-3xl">1,204</div>
                    </div>
                    <div>
                        <div className="type-ui text-[10px] uppercase opacity-40 font-bold tracking-widest mb-3">Signal Health</div>
                        <div className="type-title text-3xl text-emerald-400">99.8%</div>
                    </div>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 type-ui text-[10px] font-mono opacity-60 leading-relaxed tracking-wider">
                    ENCRYPTION: AES-256-GCM <br />
                    ROUTING: DISTRIBUTED-ONION-V4 <br />
                    LIFESPAN: INFINITE_ARCHIVE
                </div>
            </div>
         </div>
      </section>

      {/* Trust Quote */}
      <section className="text-center py-24 border-t border-white/5">
        <blockquote className="type-display-medium text-2xl md:text-3xl font-light text-white/40 max-w-4xl mx-auto leading-relaxed">
            "We provide the cave, but you provide the light. Without our protocols, silence is static. With them, silence is a shield."
        </blockquote>
      </section>
    </div>
  );
}
