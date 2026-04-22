import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useParams } from "react-router-dom";
import { MOCK_USER, MOCK_THREADS, MOCK_COMMUNITIES } from "../data/mockData";
import ThreadCard from "../components/ThreadCard";
import { 
    Settings, 
    Shield, 
    Award, 
    Calendar, 
    BarChart3, 
    Hexagon, 
    Map, 
    Zap, 
    Eye,
    MessageSquare,
    ChevronRight,
    Activity
} from "lucide-react";

export default function Profile() {
  const { id } = useParams();
  const user = MOCK_USER; // In real app, fetch by id
  const userThreads = MOCK_THREADS.filter(t => t.authorId === user.id);
  
  const [activeTab, setActiveTab] = React.useState("Transmissions");
  const TABS = ["Transmissions", "Whispers", "The Archive"];

  const mockWhispers = [
    { id: 1, threadTitle: "The Antarctica Signal", threadId: "t1", text: "The electromagnetic resonance in that region has been known since the 50s. What's new is the digital modulation. Someone updated the software.", time: "2h ago", votes: 45 },
    { id: 2, threadTitle: "Istanbul Hardware", threadId: "t2", text: "Check your packet loss when routing through Turkish servers. It's not standard internet weather. It's an active filter.", time: "3d ago", votes: 12 },
    { id: 3, threadTitle: "Missing Satellite V-9", threadId: "t3", text: "They said it burned up in reentry. I tracked the debris field — nothing matched the mass profile.", time: "1w ago", votes: 89 }
  ];

  const archivedThreads = MOCK_THREADS.filter(t => t.id === "t2" || t.id === "t4");

  return (
    <div className="pt-24 pb-24 max-w-6xl mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Sidebar */}
        <aside className="lg:w-80 flex-shrink-0 space-y-6">
            <div className="glass-dark rounded-2xl p-6 border-white/5 relative overflow-hidden group">
                <div className="absolute top-4 right-4">
                    <Link to="/settings" className="p-2 glass rounded-lg text-white/40 hover:text-white transition-colors">
                        <Settings className="w-4 h-4" />
                    </Link>
                </div>

                <div className="flex flex-col items-center text-center mt-4">
                    <div className="relative mb-5">
                        <div className="absolute inset-0 bg-violet-600 blur-2xl opacity-20" />
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 p-0.5">
                            <img 
                                src={user.avatar} 
                                alt={user.codename} 
                                className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-500"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full glass border border-white/20 flex items-center justify-center shadow-lg bg-cave-void">
                            <Shield className="w-4 h-4 text-violet-400" />
                        </div>
                    </div>

                    <h1 className="type-title text-2xl mb-1 text-white/90">{user.codename}</h1>
                    <p className="type-ui text-[10px] font-bold uppercase tracking-widest text-violet-400 opacity-80 mb-6">{user.title}</p>
                    
                    <p className="type-ui text-sm text-white/50 leading-relaxed mb-6 px-2">
                        "{user.manifesto}"
                    </p>

                    <div className="grid grid-cols-3 gap-2 w-full pt-6 border-t border-white/5">
                        <div className="text-center">
                            <div className="type-ui text-lg font-semibold text-white/80">{user.stats.truthScore}</div>
                            <div className="type-ui text-[9px] font-bold uppercase tracking-widest text-white/30 mt-1">Truth</div>
                        </div>
                        <div className="text-center">
                            <div className="type-ui text-lg font-semibold text-white/80">{user.stats.credits}</div>
                            <div className="type-ui text-[9px] font-bold uppercase tracking-widest text-white/30 mt-1">Credits</div>
                        </div>
                        <div className="text-center">
                            <div className="type-ui text-lg font-semibold text-white/80">{user.stats.anomalies}</div>
                            <div className="type-ui text-[9px] font-bold uppercase tracking-widest text-white/30 mt-1">Anoms</div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="glass-dark rounded-2xl p-6 border-white/5">
                <h3 className="type-ui text-xs font-bold uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Signal Resonance
                </h3>
                <div className="space-y-3">
                    {MOCK_COMMUNITIES.slice(0, 3).map((c, i) => (
                        <Link to={`/community/${c.id}`} key={i} className="flex items-center justify-between group p-2 hover:bg-white/[0.02] rounded-lg transition-colors -mx-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-violet-400 opacity-60 group-hover:opacity-100 transition-opacity uppercase font-bold text-[10px]">
                                    {c.name[0]}
                                </div>
                                <span className="type-ui text-sm font-semibold opacity-60 group-hover:opacity-100 transition-opacity">{c.name}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-20" />
                        </Link>
                    ))}
                </div>
            </section>
        </aside>

        {/* Content Area */}
        <main className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-2">
                <nav className="flex gap-6 overflow-x-auto no-scrollbar">
                    {TABS.map((tab, i) => (
                        <button 
                            key={i} 
                            onClick={() => setActiveTab(tab)}
                            className={`type-ui text-xs font-bold uppercase tracking-widest transition-all relative py-3 whitespace-nowrap ${
                                activeTab === tab ? "text-violet-400" : "text-white/30 hover:text-white/60"
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-400" />
                            )}
                        </button>
                    ))}
                </nav>
                <div className="type-ui text-[10px] font-bold uppercase tracking-widest opacity-30 whitespace-nowrap">
                    Node Active // Since 2024.12.04
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {activeTab === "Transmissions" && (
                        <motion.div key="transmissions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
                            {userThreads.length > 0 ? (
                                userThreads.map(thread => (
                                    <ThreadCard key={thread.id} {...thread} />
                                ))
                            ) : (
                                <div className="text-center py-16 type-ui text-sm opacity-30 italic">No transmissions found.</div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "Whispers" && (
                        <motion.div key="whispers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
                            {mockWhispers.map((whisper) => (
                                <div key={whisper.id} className="glass-dark rounded-2xl p-6 border-white/5 group relative">
                                    <div className="flex items-center justify-between mb-3 text-white/40">
                                        <div className="flex items-center gap-2 type-ui text-[10px] font-bold uppercase tracking-widest">
                                            <MessageSquare className="w-3 h-3" />
                                            <span>Whisper on</span>
                                            <Link to={`/thread/${whisper.threadId}`} className="text-violet-400 hover:text-violet-300 transition-colors uppercase">
                                                {whisper.threadTitle}
                                            </Link>
                                        </div>
                                        <span className="type-ui text-[10px] tracking-widest">{whisper.time}</span>
                                    </div>
                                    <p className="type-ui text-sm text-white/80 leading-relaxed mb-4">
                                        {whisper.text}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 type-ui text-xs font-semibold text-white/40">
                                            <svg className="w-3 h-3 text-violet-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l8 16H4z"/></svg> {whisper.votes}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === "The Archive" && (
                        <motion.div key="archive" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
                            {archivedThreads.map(thread => (
                                <ThreadCard key={`archived-${thread.id}`} {...thread} />
                            ))}
                            {archivedThreads.length === 0 && (
                                <div className="text-center py-16 type-ui text-sm opacity-30 italic">No archived signals found.</div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Empty state or more content */}
            {activeTab === "Transmissions" && userThreads.length > 0 && (
              <div className="text-center py-16 type-ui text-sm opacity-30 italic">
                  Search deeper for older transmissions.
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
