import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { MOCK_COMMUNITIES } from "../data/mockData";
import { Compass, Filter, Search as SearchIcon, Users, Activity, ExternalLink, ChevronRight, Sparkles } from "lucide-react";

export default function Explore() {
  const [activeTab, setActiveTab] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const TABS = ["All", "Biological", "Technological", "Historical", "Extraterrestrial"];
  
  const filteredCommunities = MOCK_COMMUNITIES.filter(c => {
    const matchesTab = activeTab === "All" || c.category === activeTab;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="pt-24 pb-24 max-w-[1200px] mx-auto px-4 space-y-16">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-violet-400">
            <Compass className="w-6 h-6" />
            <span className="type-ui text-xs font-semibold opacity-60">Node Exploration Protocol</span>
          </div>
          <h1 className="type-display-medium text-4xl">Archive Nexus</h1>
          <p className="type-ui text-sm opacity-50 max-w-xl leading-relaxed">
            Navigate the distributed repositories of the network. Each node represents a pocket of specialized manifestation.
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-80">
          <div className="relative group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-violet-400 transition-colors" />
            <input 
              type="text"
              placeholder="Search frequencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 type-ui text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/40 transition-all focus:bg-white/10"
            />
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full type-ui text-xs font-semibold transition-all relative ${
                activeTab === tab 
                  ? "text-white bg-violet-600 shadow-md" 
                  : "text-white/40 hover:text-white bg-white/5 hover:bg-white/10"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 type-ui text-xs font-semibold opacity-40">
          <Activity className="w-4 h-4" />
          <span>Showing {filteredCommunities.length} Active Nodes</span>
        </div>
      </section>

      {/* Results Grid - Using Masonry-like grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {filteredCommunities.length > 0 ? (
            filteredCommunities.map((community, i) => (
              <motion.div
                key={community.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="h-full"
              >
                <Link 
                  to={`/community/${community.id}`}
                  className="block glass-dark rounded-2xl p-6 border-white/5 hover:border-violet-500/30 transition-all group relative overflow-hidden h-full flex flex-col"
                >
                  <div className="absolute -top-4 -right-4 w-40 h-40 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" style={{ background: "radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%)" }} />
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center type-title text-2xl text-violet-400 group-hover:bg-violet-400 group-hover:text-white transition-all duration-300">
                      {community.name[0]}
                    </div>
                    <div className="flex -space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="w-6 h-6 rounded-full border-2 border-cave-void bg-white/10 overflow-hidden">
                          <img src={`https://picsum.photos/seed/user${community.id}${j}/30/30`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 mb-6 flex-grow">
                    <div className="type-ui text-[10px] font-bold uppercase tracking-widest text-violet-400 opacity-80">{community.category}</div>
                    <h3 className="type-title text-xl group-hover:text-violet-300 transition-colors leading-tight">{community.name}</h3>
                    <p className="type-ui text-sm opacity-60 line-clamp-3 leading-relaxed mt-2">{community.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                    <div className="flex flex-col">
                      <span className="type-ui text-[10px] text-white/30 uppercase tracking-widest font-bold">Resonators</span>
                      <span className="type-ui text-sm font-semibold">{community.members.toLocaleString()}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-violet-500/40 group-hover:text-white group-hover:bg-violet-500 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-24 text-center space-y-6 opacity-40"
            >
              <Users className="w-16 h-16 mx-auto text-white/50" />
              <div>
                <p className="type-title text-2xl mb-2">No Signal Detected</p>
                <p className="type-ui text-sm">Refine your resonance search to detect hidden nodes.</p>
              </div>
              <button 
                onClick={() => { setSearchQuery(""); setActiveTab("All"); }}
                className="type-ui text-sm font-semibold hover:text-white transition-colors underline underline-offset-4"
              >
                Reset Exploration Nexus
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Pulse (Spatial Upgrade) */}
      <section className="glass-dark rounded-3xl p-12 text-center relative overflow-hidden border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/5 via-transparent to-fuchsia-600/5 pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {[
            { label: "Archived Theories", value: "1,240,491", detail: "+12k this cycle" },
            { label: "Active Conspirators", value: "84,002", detail: "Global coverage" },
            { label: "Verified Anomalies", value: "412", detail: "Oracle confirmed" }
          ].map((stat, i) => (
            <div key={i} className="space-y-2 p-6 rounded-2xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
              <div className="type-ui text-xs font-semibold text-white/40 uppercase tracking-widest">{stat.label}</div>
              <div className="type-title text-4xl">{stat.value}</div>
              <div className="type-ui text-xs font-semibold text-emerald-400">{stat.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-12 px-4">
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="type-title text-2xl">Found a hidden signal?</h2>
          <p className="type-ui text-sm text-white/50">Submit your coordinate for network indexing. Discretion is required.</p>
          <button 
             onClick={() => alert("Node Manifestation capability locked to Tier 2 Operatives and above.")}
             className="px-8 py-3 bg-white text-black rounded-full type-ui text-sm font-bold hover:bg-violet-400 hover:text-white transition-all shadow-md mt-4 inline-block">
            Manifest New Node
          </button>
        </div>
      </section>
    </div>
  );
}
