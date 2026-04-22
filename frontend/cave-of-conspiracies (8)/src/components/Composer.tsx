import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, EyeOff, Hash, ImagePlus, Ghost, ShieldAlert, Sparkles, X, ChevronDown } from "lucide-react";

export default function Composer() {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [hasMedia, setHasMedia] = React.useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = React.useState(false);
  const [selectedNode, setSelectedNode] = React.useState("Global Nexus");

  const MOCK_NODES = ["Global Nexus", "Biological", "Technological", "Historical", "Unknown Anomalies"];

  const handleManifest = () => {
    if (!content.trim() || !title.trim()) return;
    setIsSubmitting(true);
    // Simulate encryption/sending
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsExpanded(false);
        setContent("");
        setTitle("");
        setHasMedia(false);
        setIsAnonymous(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="mb-8 relative">
      <AnimatePresence>
        {!isExpanded ? (
          <motion.div 
            layoutId="composer"
            onClick={() => setIsExpanded(true)}
            className="glass-dark rounded-2xl p-4 flex items-center justify-between cursor-pointer group border-white/5 hover:border-white/10 transition-all shadow-lg"
          >
            <div className="flex items-center gap-4 px-2">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-violet-400 group-hover:bg-violet-400/10 transition-all">
                <Send className="w-4 h-4" />
              </div>
              <span className="type-ui opacity-40 group-hover:opacity-70 transition-opacity">Manifest a new signal...</span>
            </div>
            <div className="flex gap-2">
               <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-colors">
                  <ImagePlus className="w-4 h-4" />
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            layoutId="composer"
            className="glass-dark rounded-2xl p-6 border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] relative overflow-hidden"
          >
            {/* Success Overlay */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-cave-void/90 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-4"
                >
                  <motion.div 
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                  >
                    <Sparkles className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                  <div className="space-y-1">
                    <h3 className="type-title text-xl">Signal Manifested</h3>
                    <p className="type-ui text-sm text-white/50">Your transmission has been encrypted.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center text-violet-400">
                  <Send className="w-4 h-4" />
                </div>
                <h2 className="type-title text-base">New Transmission</h2>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-white/30 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Transmission Title..."
                  className="w-full bg-transparent border-none text-base font-semibold text-white placeholder:text-white/20 focus:ring-0 px-0"
                />
                <textarea 
                  autoFocus
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Record your findings here..."
                  className="w-full h-24 bg-transparent border-none text-sm text-white/80 placeholder:text-white/20 focus:ring-0 resize-none px-0"
                />
                <AnimatePresence>
                   {hasMedia && (
                     <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-2">
                       <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden group">
                          <img src="https://picsum.photos/seed/anomaly/100/100?blur=2" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                          <button onClick={() => setHasMedia(false)} className="absolute top-1 right-1 bg-black/50 p-0.5 rounded-full hover:bg-black text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-all"><X className="w-3 h-3" /></button>
                       </div>
                     </motion.div>
                   )}
                </AnimatePresence>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5 relative">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                      isAnonymous 
                        ? "bg-fuchsia-600/10 border-fuchsia-500/30 text-fuchsia-400" 
                        : "bg-transparent border-transparent text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Ghost className="w-4 h-4" />
                    <span className="type-ui text-xs font-semibold">Anonymize</span>
                  </button>
                  
                  <div className="relative">
                    <button onClick={() => setIsSelectorOpen(!isSelectorOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-transparent text-white/60 hover:text-white hover:bg-white/5 transition-all">
                      <Hash className="w-4 h-4 text-violet-400" />
                      <span className="type-ui text-xs font-semibold">{selectedNode}</span>
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                    <AnimatePresence>
                      {isSelectorOpen && (
                         <>
                           <div className="fixed inset-0 z-10" onClick={() => setIsSelectorOpen(false)} />
                           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute bottom-full left-0 mb-2 w-48 glass-dark rounded-xl border border-white/10 shadow-2xl z-20 py-2 overflow-hidden">
                              {MOCK_NODES.map(node => (
                                <button key={node} onClick={() => { setSelectedNode(node); setIsSelectorOpen(false); }} className="w-full text-left px-4 py-2 type-ui text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                                  # {node}
                                </button>
                              ))}
                           </motion.div>
                         </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setHasMedia(true)} className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${hasMedia ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
                    <ImagePlus className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleManifest}
                    disabled={isSubmitting || !content.trim() || !title.trim()}
                    className={`px-6 py-2 rounded-full type-ui text-xs font-bold transition-all relative overflow-hidden ${
                      isSubmitting || !content.trim() || !title.trim()
                        ? "opacity-30 cursor-not-allowed bg-white/10 text-white/50" 
                        : "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_4px_16px_rgba(139,92,246,0.4)]"
                    }`}
                  >
                    {isSubmitting ? (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 mx-auto"
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      "Manifest"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
