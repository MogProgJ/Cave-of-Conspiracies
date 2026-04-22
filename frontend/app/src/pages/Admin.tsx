import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
    ShieldCheck, 
    Flag, 
    Users, 
    Activity, 
    AlertTriangle, 
    Eye, 
    ShieldAlert, 
    Terminal, 
    Filter, 
    Cpu, 
    Network,
    Lock,
    Unlock
} from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = React.useState("Signal Quarantine");
  
  const [toggles, setToggles] = React.useState({
    ipMasking: true,
    nlpAnalyzer: true,
    lexiconFilter: true,
    globalPrivacy: false,
    staticDampening: true
  });

  const [quarantineList, setQuarantineList] = React.useState([
    { id: 1, u: "Node_82", r: "Identity Leak", s: "In Istanbul anomalies, the real name of...", p: "High", status: "pending" },
    { id: 2, u: "VoidHunter", r: "Static Overflow", s: "MANIFEST ERROR: 0x404 VOID DETECTED...", p: "Med", status: "pending" },
    { id: 3, u: "Anon-14", r: "Unlicensed Signal", s: "Find the oracle's real address here: [LINK REDACTED]", p: "Crit", status: "pending" },
    { id: 4, u: "Specter_9", r: "Metadata Poisoning", s: "I injected the census data with false coordinates...", p: "Low", status: "pending" },
  ]);

  const updateQuarantineStatus = (id: number, newStatus: string) => {
    setQuarantineList(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const toggleSetting = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const STATS = [
    { label: "Network Capacity", value: "94.2%", icon: <Network />, color: "text-emerald-400" },
    { label: "Encryption Health", value: "99.9%", icon: <Lock />, color: "text-emerald-500" },
    { label: "Anomalous Load", value: "LOW", icon: <Activity />, color: "text-violet-400" },
    { label: "Archon Handshakes", value: "1,241", icon: <ShieldCheck />, color: "text-fuchsia-400" },
  ];

  return (
    <div className="pt-24 pb-24 max-w-[1200px] mx-auto px-4 space-y-12">
      {/* Header Overlay Style */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-violet-400" />
                </div>
                <h1 className="type-title text-2xl">Oracle Console <span className="opacity-30 text-sm ml-2">v4.1</span></h1>
            </div>
            <p className="type-ui text-xs opacity-40">Access Level: 7 • System Authority: ROOT</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-white/[0.02] px-4 py-2 rounded-lg flex items-center gap-3 border border-white/5">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 blur-sm animate-ping opacity-50" />
                </div>
                <span className="type-ui text-xs font-semibold text-white/60">Global Sync Stable</span>
            </div>
            <button className="bg-white/5 px-4 py-2 rounded-lg border border-white/10 type-ui text-xs font-semibold hover:bg-white/10 hover:border-white/20 transition-all text-white/80">
                Force Recon
            </button>
        </div>
      </header>

      {/* Stats Cluster */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
            <div key={i} className="glass-dark rounded-2xl p-6 border-white/5 relative overflow-hidden group hover:bg-white/[0.02] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="type-ui text-xs font-semibold opacity-50">{stat.label}</div>
                  <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center ${stat.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                    {React.cloneElement(stat.icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
                  </div>
                </div>
                <div className="type-title text-3xl font-mono">{stat.value}</div>
            </div>
        ))}
      </div>

      {/* Control Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Tab-driven Control Center */}
        <section className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-8 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar whitespace-nowrap">
                {["Signal Quarantine", "Anomaly Logs", "Node Registry"].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`type-ui text-sm font-semibold transition-all relative pb-2 ${
                      activeTab === tab ? "text-violet-400" : "text-white/40 hover:text-white"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-400" />
                    )}
                  </button>
                ))}
            </div>

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === "Signal Quarantine" ? (
                  <motion.div 
                    key="quarantine"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                   <AnimatePresence mode="popLayout">
                    {quarantineList.map((item, i) => (
                        <motion.div 
                          layout
                          key={item.id} 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`p-4 rounded-xl border flex items-center justify-between group transition-all ${item.status === 'pending' ? 'bg-white/[0.02] border-white/5 hover:border-violet-500/30 hover:bg-white/[0.04]' : 'bg-white/[0.01] border-transparent opacity-60'}`}>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="type-ui text-xs font-mono text-violet-400">ID: {item.u}</span>
                                    <span className={`type-ui text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                      item.p === "Crit" ? "bg-red-500/10 text-red-400" : "bg-white/5 text-white/50"
                                    }`}>
                                      {item.p} Priority
                                    </span>
                                    {item.status !== 'pending' && (
                                       <span className={`type-ui text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                          item.status === 'restored' ? 'text-emerald-400 bg-emerald-500/10' :
                                          item.status === 'quarantined' ? 'text-red-400 bg-red-500/10' :
                                          'text-amber-400 bg-amber-500/10'
                                       }`}>
                                          {item.status}
                                       </span>
                                    )}
                                </div>
                                <p className={`type-ui text-sm line-clamp-1 ${item.status === 'pending' ? 'text-white/80' : 'text-white/40 line-through'}`}>{item.s}</p>
                            </div>
                            {item.status === 'pending' ? (
                                <div className="flex gap-2">
                                     <button onClick={() => updateQuarantineStatus(item.id, 'restored')} title="Exonerate" className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg hover:bg-emerald-500/20 text-white/40 hover:text-emerald-400 transition-all"><ShieldCheck className="w-4 h-4" /></button>
                                     <button onClick={() => updateQuarantineStatus(item.id, 'quarantined')} title="Quarantine" className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"><Flag className="w-4 h-4" /></button>
                                     <button onClick={() => updateQuarantineStatus(item.id, 'escalated')} title="Escalate" className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg hover:bg-white/20 text-white/40 hover:text-white transition-all"><AlertTriangle className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                  <button onClick={() => updateQuarantineStatus(item.id, 'pending')} className="type-ui text-xs font-semibold hover:text-white text-white/40 transition-colors bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10">Undo Action</button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                   </AnimatePresence>
                  </motion.div>
                ) : activeTab === "Anomaly Logs" ? (
                  <motion.div 
                    key="logs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                   {[
                        { time: "23:04:12", source: "Node_82", action: "Failed Auth Handshake", status: "WARN" },
                        { time: "22:59:01", source: "System", action: "Automated Backup Triggered", status: "INFO" },
                        { time: "22:14:44", source: "Unknown", action: "DDoS Attempt Blocked - Istanbul Port", status: "CRIT" },
                        { time: "21:02:10", source: "Admin", action: "Manual Override on Sector 4", status: "INFO" },
                        { time: "20:45:00", source: "Node_82", action: "Excessive Token Generation", status: "WARN" },
                    ].map((log, i) => (
                        <div key={i} className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/[0.01] border border-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                            <div className="flex items-center gap-4">
                                <span className="font-mono text-xs text-white/40 w-16">{log.time}</span>
                                <span className={`type-ui text-[10px] font-bold px-2 py-0.5 rounded text-center w-12 ${log.status === 'CRIT' ? 'bg-red-500/20 text-red-400' : log.status === 'WARN' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {log.status}
                                </span>
                                <span className="type-ui text-sm text-white/80">{log.action}</span>
                            </div>
                            <span className="type-ui text-xs text-white/40">Src: {log.source}</span>
                        </div>
                    ))}
                  </motion.div>
                ) : activeTab === "Node Registry" ? (
                  <motion.div 
                    key="registry"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                   {[
                        { name: "Alpha Protocol", members: 4200, status: "Active", type: "Tier 1" },
                        { name: "Shadow State", members: 890, status: "Encrypted", type: "Tier 2" },
                        { name: "The Abyss", members: 12400, status: "Active", type: "Tier 1" },
                        { name: "Chronos", members: 300, status: "Locked", type: "Tier 3" },
                    ].map((node, i) => (
                        <div key={i} className="p-5 rounded-2xl glass-dark border border-white/5 hover:bg-white/[0.02] transition-colors flex flex-col justify-between h-32 group">
                            <div className="flex justify-between items-start">
                                <h4 className="type-title text-lg">{node.name}</h4>
                                <span className={`w-2 h-2 rounded-full ${node.status === 'Active' ? 'bg-emerald-500' : node.status === 'Encrypted' ? 'bg-violet-500' : 'bg-red-500'}`}></span>
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="type-ui text-xs text-white/60 font-semibold">{node.members.toLocaleString()} Operatives</span>
                                <span className="type-ui text-[10px] font-bold px-2 py-1 bg-white/5 rounded-md text-white/50 uppercase tracking-widest">{node.type}</span>
                            </div>
                        </div>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
        </section>

        {/* Sidebar Vitals Cluster */}
        <section className="lg:col-span-4 space-y-6">
            <div className="glass-dark rounded-2xl p-6 border-white/5 space-y-6">
                <h3 className="type-title text-lg border-b border-white/5 pb-4">Sub-Systems</h3>
                <div className="space-y-4">
                    {[
                        { id: 'ipMasking', label: "IP Masking Protocol" },
                        { id: 'nlpAnalyzer', label: "NLP Sentiment Analyzer" },
                        { id: 'lexiconFilter', label: "Banned Lexicon Filter" },
                        { id: 'globalPrivacy', label: "Global Privacy Layer" },
                        { id: 'staticDampening', label: "Static Dampening" },
                    ].map((f, i) => (
                        <div key={i} className="flex items-center justify-between group">
                            <span className="type-ui text-sm text-white/60 group-hover:text-white transition-colors">{f.label}</span>
                            <button 
                                onClick={() => toggleSetting(f.id as keyof typeof toggles)}
                                className={`w-10 h-5 rounded-full p-0.5 transition-all duration-300 relative ${toggles[f.id as keyof typeof toggles] ? "bg-emerald-500" : "bg-white/10"}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${toggles[f.id as keyof typeof toggles] ? "translate-x-5" : "translate-x-0"}`} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-dark rounded-2xl p-6 border-white/5 space-y-6">
                <h3 className="type-title text-lg border-b border-white/5 pb-4">Relay Health</h3>
                <div className="space-y-5">
                    {[
                        { name: "Deep State Nexus", health: 92, color: "bg-violet-500" },
                        { name: "Outer World Inflow", health: 78, color: "bg-fuchsia-500" },
                        { name: "Techno Myth Uplink", health: 98, color: "bg-emerald-500" },
                    ].map((c, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between type-ui text-xs font-semibold text-white/70">
                                <span>{c.name}</span>
                                <span>{c.health}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${c.health}%` }}
                                  transition={{ duration: 1.5, delay: 0.2 }}
                                  className={`h-full ${c.color} shadow-[0_0_10px_rgba(139,92,246,0.3)]`} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] group border border-white/5">
              <img src="https://picsum.photos/seed/tech/800/600?blur=4" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" alt="hardware node" />
              <div className="absolute inset-0 bg-gradient-to-t from-cave-void via-cave-void/40 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-center space-y-2">
                 <Cpu className="w-6 h-6 text-violet-400 mx-auto" />
                 <h4 className="type-title text-base">Node 4 Online</h4>
                 <p className="type-ui text-xs text-white/50">Temp normal. All cycles reporting stable.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
}
