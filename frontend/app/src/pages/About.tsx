import React from "react";
import { motion } from "motion/react";
import { Coffee, Globe, Hexagon, Radio, Sparkles, User, Zap } from "lucide-react";

export default function About() {
  return (
    <div className="pt-24 pb-24 space-y-24 px-4 overflow-hidden">
      {/* Manifesto Intro */}
      <section className="max-w-4xl mx-auto text-center space-y-8">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center font-bold text-2xl shadow-xl mb-8"
        >
            C
        </motion.div>
        <h1 className="type-display-large text-5xl md:text-7xl gradient-text leading-tight px-4 pb-2">
            The World is<br />Not as it Appears.
        </h1>
        <p className="type-ui text-lg md:text-xl font-medium opacity-50 leading-relaxed max-w-3xl mx-auto px-4">
            "Cave of Conspiracies was forged in the digital dark ages—a sanctuary for those who saw the glitches in the narrative and refused to look away."
        </p>
      </section>

      {/* Story Grid */}
      <section className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="space-y-12">
                <div className="space-y-4">
                    <h2 className="type-display-medium text-3xl md:text-4xl text-white/90 underline underline-offset-8 decoration-violet-500/30">The Origin Signal</h2>
                    <p className="type-ui text-base md:text-lg opacity-60 leading-relaxed">
                        It started in a BBS forum in 1997. A single thread about the 
                        unexplained disappearance of a remote island in the Pacific. 
                        Governments denied the island's existence. The forum members proved its coordinates.
                    </p>
                </div>
                <div className="space-y-4 lg:text-right">
                    <h2 className="type-display-medium text-3xl md:text-4xl text-white/90 underline underline-offset-8 decoration-fuchsia-500/30">The Digital Exodus</h2>
                    <p className="type-ui text-base md:text-lg opacity-60 leading-relaxed lg:pl-12">
                        As the mainstream internet became a surveillance engine, we moved 
                        deeper. We built our own protocols, our own encryption, and our own trust. 
                        The Cave isn't just a website. It's a distributed conscience.
                    </p>
                </div>
            </div>
            <div className="relative aspect-[4/3] md:aspect-square w-full max-w-lg mx-auto lg:max-w-none">
                <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at center, rgba(139, 92, 246, 0.2) 0%, transparent 70%)" }} />
                <div className="relative h-full glass-dark rounded-3xl border border-white/5 flex items-center justify-center p-12 overflow-hidden">
                    <div className="absolute inset-0 opacity-10 font-mono text-[8px] leading-tight break-all p-8 select-none">
                        {Array(100).fill("01010011 01001001 01001100 01000101 01001110 01000011 01000101 ").join("")}
                    </div>
                    <Hexagon className="w-full h-full text-violet-500/10 max-w-[200px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center space-y-4 w-full">
                         <Radio className="w-12 h-12 text-white/40 mx-auto animate-pulse" />
                         <div className="type-ui text-[10px] uppercase font-bold tracking-widest opacity-40">Broadcasting Truth</div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white/[0.02] border border-white/5 rounded-3xl py-16 md:py-24 px-8 md:px-16 max-w-6xl mx-auto">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
                { t: "Radical Anonymity", d: "You are your theory. Your location and history are irrelevant.", i: <User /> },
                { t: "Collective Intelligence", d: "Truth is a consensus reality built from fragmented signals.", i: <Sparkles /> },
                { t: "Unfettered Access", d: "Knowledge belongs to the interceptor. No filters.", i: <Zap /> },
            ].map((v, i) => (
                <div key={i} className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-violet-400 mb-6">
                        {v.i}
                    </div>
                    <h3 className="type-title text-xl text-white/90">{v.t}</h3>
                    <p className="type-ui text-sm opacity-60 leading-relaxed pr-4">{v.d}</p>
                </div>
            ))}
         </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-24 pt-8">
        <h2 className="type-display-medium text-4xl md:text-5xl gradient-text mb-10 pb-2">The Cave is Open.</h2>
        <a href="/register" className="inline-block px-10 py-4 bg-white/5 border border-white/10 rounded-full type-ui font-semibold text-white hover:bg-white/10 transition-colors shadow-lg shadow-violet-500/5">
            Join the Distributed Conscious
        </a>
      </section>
    </div>
  );
}
