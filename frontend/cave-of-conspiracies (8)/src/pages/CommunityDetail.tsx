import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { MOCK_COMMUNITIES, MOCK_THREADS } from "../data/mockData";
import ThreadCard from "../components/ThreadCard";
import Composer from "../components/Composer";
import { ShieldCheck, Users, Activity, ChevronLeft, Share2, MoreHorizontal, Info } from "lucide-react";

export default function CommunityDetail() {
  const { id } = useParams();
  const community = MOCK_COMMUNITIES.find(c => c.id === id) || MOCK_COMMUNITIES[0];
  const threads = MOCK_THREADS.filter(t => t.communityId === community.id);
  
  const [isJoined, setIsJoined] = React.useState(false);
  const [isJoining, setIsJoining] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("Top");

  const handleJoin = () => {
      if (isJoined) {
          setIsJoined(false);
          return;
      }
      setIsJoining(true);
      setTimeout(() => {
          setIsJoining(false);
          setIsJoined(true);
      }, 1000);
  };

  return (
    <div className="pt-24 pb-24 max-w-[1200px] mx-auto px-4">
      {/* Community Hero */}
      <div className="relative h-64 rounded-3xl overflow-hidden mb-8 border border-white/5 shadow-2xl">
        <img 
            src={community.heroImage} 
            alt={community.name} 
            className="w-full h-full object-cover grayscale opacity-30"
            referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cave-void via-cave-void/80 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
            <Link to="/explore" className="flex items-center gap-2 type-ui text-xs font-semibold text-white/40 hover:text-white transition-colors mb-4 w-fit">
                <ChevronLeft className="w-4 h-4" /> Back to Nexus
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="type-display-medium text-4xl md:text-5xl mb-2">{community.name}</h1>
                    <p className="type-ui text-sm opacity-60 max-w-xl leading-relaxed">{community.description}</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleJoin}
                        disabled={isJoining}
                        className={`px-6 py-2.5 rounded-full type-ui text-sm font-bold transition-all relative w-40 flex items-center justify-center ${
                            isJoining ? "bg-white/10 text-white/50 cursor-wait" :
                            isJoined ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20" :
                            "bg-white text-black hover:bg-violet-400 hover:text-white"
                        }`}
                    >
                        {isJoining ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full" />
                        ) : isJoined ? (
                            "Joined"
                        ) : (
                            "Join Network"
                        )}
                    </button>
                    <button className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
                        <Share2 className="w-4 h-4 text-white/60" />
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Feed Column */}
        <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between opacity-50 border-b border-white/5 pb-4">
                <h2 className="type-ui text-xs font-bold uppercase tracking-widest text-violet-400">Manifestation Feed</h2>
                <div className="flex gap-4 type-ui text-xs font-semibold">
                    {["Top", "Recent", "Active"].map(tab => (
                        <button 
                           key={tab} 
                           onClick={() => setActiveTab(tab)}
                           className={`transition-colors ${activeTab === tab ? "text-white underline underline-offset-4" : "text-white/40 hover:text-white"}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <Composer />

            <div className="space-y-4">
                {threads.length > 0 ? (
                    threads.map((thread) => (
                        <ThreadCard 
                            key={thread.id} 
                            {...thread}
                        />
                    ))
                ) : (
                    <div className="glass-dark rounded-2xl p-12 text-center border-white/5 opacity-50 type-ui text-sm">
                        The frequency is silent. No transmissions detected in this coordinate yet.
                    </div>
                )}
            </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
            <section className="glass-dark rounded-2xl p-6 border-white/5">
                <h3 className="type-title text-lg mb-4">Protocols</h3>
                <ul className="space-y-3">
                    {community.rules.map((rule, i) => (
                        <li key={i} className="flex gap-3 type-ui text-sm opacity-70 leading-relaxed">
                            <span className="text-violet-400 font-mono text-xs mt-0.5">{(i+1).toString().padStart(2, '0')}.</span>
                            {rule}
                        </li>
                    ))}
                </ul>
            </section>

            <section className="glass-dark rounded-2xl p-6 border-white/5">
                <h3 className="type-title text-lg mb-4">Active Resonators</h3>
                <div className="space-y-3">
                    {community.moderators.map((mod, i) => (
                        <div key={i} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-white/[0.02] rounded-lg transition-colors -mx-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <span className="type-ui text-sm font-semibold opacity-80 group-hover:opacity-100">{mod}</span>
                            </div>
                            <span className="type-ui text-[10px] font-bold uppercase tracking-widest text-emerald-500 opacity-50 group-hover:opacity-100">Mod</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="glass-dark rounded-2xl p-6 border-white/5">
                <div className="grid grid-cols-2 gap-4 divide-x divide-white/5">
                    <div className="text-center">
                        <div className="type-ui text-[10px] uppercase font-bold tracking-widest opacity-40 mb-1">Members</div>
                        <div className="type-title text-2xl">{community.members.toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                        <div className="type-ui text-[10px] uppercase font-bold tracking-widest opacity-40 mb-1">Active Nodes</div>
                        <div className="type-title text-2xl">{community.activeNodes}</div>
                    </div>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}
