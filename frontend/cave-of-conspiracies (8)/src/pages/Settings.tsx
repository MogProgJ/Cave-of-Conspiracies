import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../ThemeContext";
import { 
    User, 
    Lock, 
    Bell, 
    Eye, 
    Shield, 
    Monitor, 
    Globe, 
    Smartphone,
    CreditCard,
    Cpu,
    CheckCircle2,
    ChevronRight,
    CircleDashed,
    Camera
} from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = React.useState("identity");
  const { theme, setTheme, density, setDensity, effects, setEffects } = useTheme();

  // Mock states for settings
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'Direct Resonances': true,
    'Proxy Breach Warnings': true,
    'Thread Anomalies': false,
    'Network Datarate': false
  });

  const TABS = [
      { id: "identity", label: "Identity", icon: <User className="w-4 h-4" /> },
      { id: "security", label: "Protection", icon: <Shield className="w-4 h-4" /> },
      { id: "notifications", label: "Signals", icon: <Bell className="w-4 h-4" /> },
      { id: "display", label: "Aesthetic", icon: <Monitor className="w-4 h-4" /> },
      { id: "privacy", label: "Shadows", icon: <Eye className="w-4 h-4" /> },
  ];

  const [isSavingIdentity, setIsSavingIdentity] = useState(false);
  const [identitySaved, setIdentitySaved] = useState(false);
  
  const [requestingElevation, setRequestingElevation] = useState(false);
  const [elevationStatus, setElevationStatus] = useState("Request Elevation");

  const handleToggle = (key: string) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveIdentity = () => {
    setIsSavingIdentity(true);
    setIdentitySaved(false);
    setTimeout(() => {
        setIsSavingIdentity(false);
        setIdentitySaved(true);
        setTimeout(() => setIdentitySaved(false), 2000);
    }, 1000);
  };

  const handleRequestElevation = () => {
    if (requestingElevation || elevationStatus !== "Request Elevation") return;
    setRequestingElevation(true);
    setElevationStatus("Transmitting...");
    setTimeout(() => {
        setRequestingElevation(false);
        setElevationStatus("Oracle Review Pending");
    }, 1500);
  };

  return (
    <div className="pt-24 pb-24 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Navigation Rail */}
        <aside className="md:w-56 flex-shrink-0">
            <h1 className="type-title text-2xl mb-6 pl-4">Settings</h1>
            <div className="space-y-1">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl type-ui text-sm font-medium transition-all ${
                            activeTab === tab.id 
                                ? "bg-white/10 text-white shadow-sm" 
                                : "text-white/50 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
            <div className="glass-dark rounded-2xl p-6 md:p-8 border-transparent hover:border-white/5 transition-all min-h-[500px]">
                {activeTab === "identity" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        <section className="space-y-6">
                            <h2 className="type-title">Signal Identity</h2>
                            <div className="flex items-center gap-6 p-6 border border-white/5 rounded-2xl bg-white/[0.02]">
                                <div className="relative group cursor-pointer">
                                    <div className="w-20 h-20 rounded-full border border-white/10 bg-white/5 overflow-hidden">
                                        <img src="https://picsum.photos/seed/archon/200/200" alt="avatar" />
                                    </div>
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                        <Camera className="w-6 h-6 text-white/80" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="type-ui text-xs font-semibold text-white/50">Current ID</div>
                                    <div className="text-xl font-mono text-white/90">Archon_93</div>
                                    <button className="type-ui text-xs text-violet-400 hover:text-violet-300 transition-colors mt-2">Edit Avatar</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="type-ui text-xs font-semibold text-white/50 pl-2">Node Alias</label>
                                    <input type="text" defaultValue="Signal Interceptor" className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 type-ui text-sm focus:border-violet-500/30 transition-all outline-none text-white focus:bg-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <label className="type-ui text-xs font-semibold text-white/50 pl-2">Access Level</label>
                                    <div className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 type-ui text-sm text-white/40 font-mono flex items-center cursor-not-allowed">
                                        LEVEL 4 <Lock className="w-3 h-3 ml-2 opacity-50"/>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="type-ui text-xs font-semibold text-white/50 pl-2">Public Manifesto</label>
                                <textarea defaultValue="Observation is the first step toward containment. We see what they hide." className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 type-ui text-sm focus:border-violet-500/30 transition-all outline-none min-h-[100px] resize-none text-white focus:bg-white/10"></textarea>
                            </div>
                        </section>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-4">
                          <AnimatePresence>
                              {identitySaved && (
                                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-emerald-400 type-ui text-xs font-semibold">
                                  <CheckCircle2 className="w-4 h-4" /> Config Synced
                                </motion.div>
                              )}
                          </AnimatePresence>
                          <button 
                            onClick={handleSaveIdentity}
                            disabled={isSavingIdentity}
                            className={`px-6 py-2.5 rounded-full type-ui font-bold transition-all text-sm w-40 flex items-center justify-center ${
                              isSavingIdentity ? "bg-white/10 text-white/50 cursor-wait" : "bg-white text-black hover:bg-neutral-200"
                            }`}
                          >
                              {isSavingIdentity ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><CircleDashed className="w-5 h-5 mx-auto" /></motion.div>
                              ) : "Save Changes"}
                          </button>
                        </div>
                    </motion.div>
                )}

                {activeTab === "security" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        <section className="space-y-6">
                            <h2 className="type-title">Layered Protection</h2>
                            <div className="space-y-2">
                                {[
                                    { title: "Quantum Pass-Key", desc: "Rotate encryption key automatically.", value: "Enabled", icon: <Lock /> },
                                    { title: "Two-Factor Signal", desc: "Authorize entry via secondary node.", value: "Verified", icon: <Smartphone /> },
                                    { title: "Shadow Mode", desc: "Hide active status from the local grid.", value: "Restricted", icon: <Eye /> },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:bg-white/[0.04] transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 opacity-80">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <div className="type-ui text-sm font-semibold">{item.title}</div>
                                                <div className="type-ui text-xs text-white/40 mt-0.5">{item.desc}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`type-ui text-xs font-bold ${item.value === 'Restricted' ? 'text-white/40' : 'text-emerald-400'}`}>{item.value}</span>
                                            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </motion.div>
                )}

                {activeTab === "notifications" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        <section className="space-y-6">
                            <div>
                              <h2 className="type-title">Signal Protocols</h2>
                              <p className="type-ui text-sm text-white/50 mt-2 max-w-lg">
                                  Determine which anomalies trigger grid alerts. Noise reduction is recommended.
                              </p>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { title: "Direct Resonances", desc: "Alerts when your node is explicitly tagged." },
                                    { title: "Thread Anomalies", desc: "Spikes in activity around tracked subjects." },
                                    { title: "Proxy Breach Warnings", desc: "Immediate visual ping on failed handshakes." },
                                    { title: "Network Datarate", desc: "Weekly drops of high-value aggregated signals." },
                                ].map((item, i) => (
                                    <div key={i} onClick={() => handleToggle(item.title)} className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:bg-white/[0.04] transition-colors cursor-pointer group">
                                        <div>
                                            <div className="type-ui text-sm font-semibold">{item.title}</div>
                                            <div className="type-ui text-xs text-white/40 mt-0.5">{item.desc}</div>
                                        </div>
                                        <div className={`relative w-11 h-6 rounded-full transition-colors ${toggles[item.title] ? 'bg-violet-500' : 'bg-white/10'}`}>
                                            <div className={`absolute top-1 bottom-1 w-4 rounded-full bg-white transition-transform ${toggles[item.title] ? 'translate-x-[22px]' : 'translate-x-1'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </motion.div>
                )}

                {activeTab === "display" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                        <section>
                            <div>
                                <h2 className="type-title">Appearance Engine</h2>
                                <p className="type-ui text-sm text-white/50 mt-2 max-w-lg">
                                    Configure grid aesthetics, structural density, and processing constraints.
                                </p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="type-ui text-xs font-bold uppercase tracking-widest text-[#808090]">Theme Protocol</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { id: "void", name: "Void", desc: "Original dark violet signature" },
                                    { id: "slate", name: "Slate", desc: "Neutral quiet monochrome" },
                                    { id: "obsidian", name: "Obsidian", desc: "Cold modern deep blues" }
                                ].map(t => (
                                    <button 
                                      key={t.id}
                                      onClick={() => setTheme(t.id as "void" | "slate" | "obsidian")}
                                      className={`text-left p-4 rounded-xl transition-all border ${
                                          theme === t.id 
                                            ? "bg-violet-500/10 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.1)]" 
                                            : "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
                                      }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="type-ui font-semibold text-white/90">{t.name}</div>
                                            {theme === t.id && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                                        </div>
                                        <div className="type-ui text-[10px] text-white/40 leading-relaxed">{t.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="type-ui text-xs font-bold uppercase tracking-widest text-[#808090]">Structural Density</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button 
                                  onClick={() => setDensity("comfortable")}
                                  className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${
                                      density === "comfortable" ? "bg-violet-500/10 border-violet-500/50" : "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
                                  }`}
                                >
                                    <div className="space-y-1 w-8 flex flex-col items-center opacity-50">
                                        <div className="w-6 h-1 rounded bg-white/50" />
                                        <div className="w-6 h-1 rounded bg-white/50" />
                                    </div>
                                    <div className="text-left">
                                        <div className="type-ui text-sm font-semibold text-white/90">Comfortable</div>
                                        <div className="type-ui text-[10px] text-white/40">Default padding and spacing.</div>
                                    </div>
                                </button>
                                <button 
                                  onClick={() => setDensity("compact")}
                                  className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${
                                      density === "compact" ? "bg-violet-500/10 border-violet-500/50" : "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
                                  }`}
                                >
                                    <div className="space-y-0.5 w-8 flex flex-col items-center opacity-50">
                                        <div className="w-6 h-1 rounded bg-white/50" />
                                        <div className="w-6 h-1 rounded bg-white/50" />
                                        <div className="w-6 h-1 rounded bg-white/50" />
                                    </div>
                                    <div className="text-left">
                                        <div className="type-ui text-sm font-semibold text-white/90">Compact</div>
                                        <div className="type-ui text-[10px] text-white/40">High-density data rendering.</div>
                                    </div>
                                </button>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="type-ui text-xs font-bold uppercase tracking-widest text-[#808090]">Processing Overheads</h3>
                            <div className="space-y-2">
                                <div 
                                  onClick={() => setEffects("standard")} 
                                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors cursor-pointer ${
                                      effects === "standard" ? "border-violet-500/50 bg-violet-500/10" : "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
                                  }`}
                                >
                                    <div>
                                        <div className="type-ui text-sm font-semibold">Standard Effects (Vignette & Glow)</div>
                                        <div className="type-ui text-xs text-white/40 mt-0.5">Atmosphere enabled. Deep visual immersion.</div>
                                    </div>
                                    <div className={`relative w-4 h-4 rounded-full border ${effects === "standard" ? "border-violet-400 bg-violet-400" : "border-white/20"} flex items-center justify-center`}>
                                        {effects === "standard" && <div className="w-1.5 h-1.5 rounded-full bg-[#030308]" />}
                                    </div>
                                </div>
                                <div 
                                  onClick={() => setEffects("reduced")} 
                                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors cursor-pointer ${
                                      effects === "reduced" ? "border-violet-500/50 bg-violet-500/10" : "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
                                  }`}
                                >
                                    <div>
                                        <div className="type-ui text-sm font-semibold">Reduced Render Overhead</div>
                                        <div className="type-ui text-xs text-secondary-500/70 mt-0.5">Disable backdrop blurs and heavy animations for peak hardware response.</div>
                                    </div>
                                    <div className={`relative w-4 h-4 rounded-full border ${effects === "reduced" ? "border-violet-400 bg-violet-400" : "border-white/20"} flex items-center justify-center`}>
                                        {effects === "reduced" && <div className="w-1.5 h-1.5 rounded-full bg-[#030308]" />}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </motion.div>
                )}

                {activeTab === "privacy" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center py-20 min-h-[400px]">
                        <div className="w-16 h-16 rounded-full glass border-white/10 flex items-center justify-center mb-6 relative">
                            <div className="absolute inset-0 rounded-full border border-fuchsia-500/30 animate-[ping_3s_ease-in-out_infinite]" />
                            <Lock className="w-6 h-6 text-fuchsia-400 opacity-80" />
                        </div>
                        <h2 className="type-title mb-3">The Shadows are Sealed</h2>
                        <p className="type-ui text-sm text-white/50 max-w-md mx-auto mb-8 leading-relaxed">
                            Total network obscurity requires Tier 3 clearance. Your current cryptographic footprint leaves a verifiable trail.
                        </p>
                        <button 
                            onClick={handleRequestElevation}
                            disabled={requestingElevation || elevationStatus !== "Request Elevation"}
                            className={`px-6 py-2.5 rounded-full border border-fuchsia-500/30 text-fuchsia-300 type-ui text-xs font-bold hover:bg-fuchsia-500/10 transition-colors w-52 flex items-center justify-center ${
                              requestingElevation ? "bg-fuchsia-500/10 opacity-70 cursor-wait" : 
                              elevationStatus !== "Request Elevation" ? "bg-white/5 border-white/10 text-white/40 cursor-not-allowed hover:bg-white/5" : ""
                            }`}
                        >
                            {requestingElevation ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><CircleDashed className="w-4 h-4 mx-auto" /></motion.div>
                            ) : elevationStatus}
                        </button>
                    </motion.div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
}
