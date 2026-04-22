import React from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Eye, Shield, Terminal, Zap, ChevronDown, ChevronRight, Radio, Ghost, Cpu } from "lucide-react";
import { Link } from "react-router-dom";

export default function Editorial() {
  const { scrollY } = useScroll();
  const titleY = useTransform(scrollY, [0, 1000], [0, 400]);

  return (
    <div className="relative min-h-[300vh] bg-cave-void overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-24">
        <motion.div 
          style={{ y: titleY }}
          className="relative z-10 text-center space-y-6 px-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 glass-dark rounded-full border border-white/10 type-ui text-[10px] uppercase font-bold tracking-widest text-violet-400 mb-6 shadow-2xl">
             <Radio className="w-3 h-3 animate-pulse" /> Signal Established
          </div>
          <h1 className="type-display-large text-6xl md:text-[8vw] leading-none tracking-tight gradient-text p-4 pb-0">
            VOID SIGNAL
          </h1>
          <p className="type-ui text-lg md:text-xl font-semibold opacity-40 uppercase tracking-widest">
            Transmission Layer v4.0.0
          </p>
          
          <div className="pt-20">
             <ChevronDown className="w-6 h-6 text-white/30 mx-auto animate-bounce" />
          </div>
        </motion.div>

        {/* Cinematic background elements */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] opacity-30" style={{ background: "radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, transparent 60%)" }} />
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] opacity-5"
            >
               <div className="w-full h-full border border-dashed border-white/20 rounded-full" />
            </motion.div>
        </div>
      </section>

      {/* Floating Story Blocks */}
      <div className="max-w-6xl mx-auto px-6 space-y-48 py-32 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ margin: "-20%" }}
                className="space-y-6"
            >
                <div className="type-ui text-[10px] uppercase font-bold tracking-widest text-violet-500">Anomaly Detected</div>
                <h2 className="type-display-medium text-4xl md:text-5xl text-white/90 leading-tight">The Sky is a Projection.</h2>
                <p className="type-ui text-base md:text-lg opacity-60 leading-relaxed">
                    Intercepted telemetry from high-altitude weather balloons confirms 
                    the presence of a geometric structural layer above the upper troposphere. 
                    They call it the Atmosphere. We call it the Shell.
                </p>
                <Link to="/explore" className="inline-flex items-center gap-3 type-ui text-xs font-bold uppercase tracking-widest text-violet-400 hover:text-white transition-colors group mt-4">
                    Enter the Investigation <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity group-hover:translate-x-1" />
                </Link>
            </motion.div>
            <div className="relative aspect-[4/3] w-full">
                 <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%)" }} />
                 <img src="https://picsum.photos/seed/sky/800/600?blur=5" className="relative glass-dark border-white/5 rounded-3xl object-cover grayscale opacity-50 h-full w-full" alt="sky" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="order-last md:order-first relative aspect-[4/3] w-full">
                 <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at center, rgba(217, 70, 239, 0.1) 0%, transparent 70%)" }} />
                 <img src="https://picsum.photos/seed/server/800/600?blur=5" className="relative glass-dark border-white/5 rounded-3xl object-cover grayscale opacity-50 h-full w-full" alt="tech" />
            </div>
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ margin: "-20%" }}
                className="space-y-6 md:text-right"
            >
                <div className="type-ui text-[10px] uppercase font-bold tracking-widest text-fuchsia-500">Signal Intercept</div>
                <h2 className="type-display-medium text-4xl md:text-5xl text-white/90 leading-tight">Sentient Hardware.</h2>
                <p className="type-ui text-base md:text-lg opacity-60 leading-relaxed md:ml-auto">
                    There are server farms in the Arctic that have been off the grid 
                    since 2012. Yet, they are still broadcasting. The cooling systems are 
                    offline. The hardware isn't overheating. It's breathing.
                </p>
                <Link to="/explore" className="inline-flex items-center gap-3 type-ui text-xs font-bold uppercase tracking-widest text-fuchsia-400 hover:text-white transition-colors group mt-4 justify-end">
                    Intercept Signal <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity group-hover:translate-x-1" />
                </Link>
            </motion.div>
        </div>

        <section className="text-center space-y-16 pt-24">
            <h2 className="type-display-medium text-5xl md:text-7xl opacity-10">THE DEEP SEED</h2>
            <div className="relative max-w-3xl mx-auto glass-dark p-12 md:p-20 rounded-3xl border border-white/5 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-violet-600/5 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                <Ghost className="w-16 h-16 text-white/20 mx-auto mb-10 group-hover:text-violet-400/50 transition-colors duration-1000" />
                <p className="type-ui text-xl md:text-2xl font-light opacity-80 leading-relaxed mb-12 italic text-white/90">
                    "Every secret is a signal. Every signal is a door. We are the ones who refuse to turn away from the threshold."
                </p>
                <Link to="/" className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full type-ui text-sm font-bold uppercase tracking-widest text-white transition-all inline-block">
                    Authorize Entry
                </Link>
            </div>
        </section>
      </div>

      <div className="h-[30vh] bg-gradient-to-t from-cave-void to-transparent absolute bottom-0 w-full z-30 pointer-events-none" />
    </div>
  );
}
