import React from "react";
import Navbar from "../Navbar";
import GlowBackground from "../GlowBackground";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";

export default function Shell({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen relative flex flex-col selection:bg-cave-violet/30 selection:text-white">
      <GlowBackground />
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.22, 1, 0.36, 1] 
            }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="w-full py-24 px-8 mt-24 border-t border-white/5 bg-cave-void/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1 flex flex-col gap-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(139,92,246,0.3)]">C</div>
               <span className="font-serif text-2xl tracking-tighter italic">Cave of Conspiracies</span>
            </div>
            <p className="text-xs opacity-40 leading-relaxed font-light">
              Establishing 1:1 signal resonance across the distributed network since the digital awakening.
              Proceed with absolute discretion.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
             <span className="type-metadata opacity-40">Navigation</span>
             <div className="flex flex-col gap-2 type-ui opacity-30">
               <a href="/" className="hover:opacity-100 transition-opacity">Nexus</a>
               <a href="/explore" className="hover:opacity-100 transition-opacity">Explore</a>
               <a href="/editorial" className="hover:opacity-100 transition-opacity">Editorial</a>
             </div>
          </div>

          <div className="flex flex-col gap-4">
             <span className="type-metadata opacity-40">Protocols</span>
             <div className="flex flex-col gap-2 type-ui opacity-30">
               <a href="/guidelines" className="hover:opacity-100 transition-opacity">Guidelines</a>
               <a href="/safety" className="hover:opacity-100 transition-opacity">Safety</a>
               <a href="/vision" className="hover:opacity-100 transition-opacity">Vision</a>
             </div>
          </div>

          <div className="flex flex-col gap-4">
             <span className="type-metadata opacity-40">Network Status</span>
             <div className="flex flex-col gap-3">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="type-metadata text-emerald-500/60">Distributed Nodes Online</span>
               </div>
               <div className="text-[10px] font-mono opacity-20 uppercase tracking-widest">
                 System v4.1.2 // Encryption: QUANTUM-READY
               </div>
             </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto mt-24 pt-8 border-t border-white/5 flex justify-between items-center opacity-20">
           <span className="type-metadata">© 2026 Distributed Network</span>
           <span className="type-metadata italic">Silence is the only currency of truth.</span>
        </div>
      </footer>
    </div>
  );
}
