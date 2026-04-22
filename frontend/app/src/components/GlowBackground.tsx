import { motion } from "motion/react";

export default function GlowBackground() {
  return (
    <div className="fixed inset-0 -z-50 bg-cave-void overflow-hidden pointer-events-none">
      {/* Base Atmospheric Layer */}
      <div className="absolute inset-0 glow-mesh scale-110" />
      
      {/* Drifting Signal Lines */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ 
              y: "-100%", 
              opacity: [0, 0.5, 0],
              x: Math.random() * 100 - 50 
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 3,
              ease: "linear"
            }}
            className="absolute w-px h-64 bg-gradient-to-b from-transparent via-cave-violet to-transparent blur-[1px]"
            style={{ left: `${20 + i * 15}%` }}
          />
        ))}
      </div>

      {/* Nebula Pockets - Switched to cheaper radial gradients instead of heavy blurs */}
      <motion.div 
        animate={{ 
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -left-[10%] w-[120%] h-[80%] rounded-full opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, transparent 60%)" }}
      />
      
      <motion.div 
        animate={{ 
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[20%] -right-[10%] w-[120%] h-[80%] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle at center, rgba(217, 70, 239, 0.1) 0%, transparent 60%)" }}
      />

      {/* Detail Textures */}
      <div className="absolute inset-0 noise mix-blend-overlay opacity-30" />
      <div className="absolute inset-0 vignette" />
    </div>
  );
}
