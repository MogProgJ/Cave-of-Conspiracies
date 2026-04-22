import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { Compass, Search as SearchIcon, Users, Activity, ChevronRight } from "lucide-react";
import { CommunityCard, getCommunities } from "../lib/api";

export default function Explore() {
  const [activeTab, setActiveTab] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [communities, setCommunities] = React.useState<CommunityCard[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    const run = async () => {
      const res = await getCommunities();
      if (!active) return;
      if (res.ok) {
        setCommunities(res.data.communities);
      }
      setLoading(false);
    };
    void run();
    return () => {
      active = false;
    };
  }, []);

  const tabs = React.useMemo(() => {
    const categories = Array.from(new Set(communities.map((c) => c.category)));
    return ["All", ...categories];
  }, [communities]);

  const filteredCommunities = communities.filter((c) => {
    const matchesTab = activeTab === "All" || c.category === activeTab;
    const summary = `${c.name} ${c.tagline ?? ""} ${c.category}`.toLowerCase();
    const matchesSearch = summary.includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="pt-24 pb-24 max-w-[1200px] mx-auto px-4 space-y-16">
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

      <section className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="col-span-full type-ui text-sm text-white/40">Loading communities...</div>
          ) : filteredCommunities.length > 0 ? (
            filteredCommunities.map((community, i) => (
              <motion.div
                key={community.slug}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="h-full"
              >
                <Link
                  to={`/community/${community.slug}`}
                  className="block glass-dark rounded-2xl p-6 border-white/5 hover:border-violet-500/30 transition-all group relative overflow-hidden h-full flex flex-col"
                >
                  <div className="absolute -top-4 -right-4 w-40 h-40 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" style={{ background: "radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%)" }} />

                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center type-title text-2xl text-violet-400 group-hover:bg-violet-400 group-hover:text-white transition-all duration-300">
                      {community.name[0]}
                    </div>
                    <div className="type-ui text-[10px] uppercase tracking-widest text-violet-300">{community.category}</div>
                  </div>

                  <div className="space-y-2 mb-6 flex-grow">
                    <h3 className="type-title text-xl group-hover:text-violet-300 transition-colors leading-tight">{community.name}</h3>
                    <p className="type-ui text-sm opacity-60 line-clamp-3 leading-relaxed mt-2">{community.tagline ?? "No tagline yet."}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                    <div className="flex flex-col">
                      <span className="type-ui text-[10px] text-white/30 uppercase tracking-widest font-bold">7d Posts</span>
                      <span className="type-ui text-sm font-semibold">{community.posts_7d}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-violet-500/40 group-hover:text-white group-hover:bg-violet-500 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-24 text-center space-y-6 opacity-40">
              <Users className="w-16 h-16 mx-auto text-white/50" />
              <div>
                <p className="type-title text-2xl mb-2">No Signal Detected</p>
                <p className="type-ui text-sm">Refine your resonance search to detect hidden nodes.</p>
              </div>
              <button onClick={() => { setSearchQuery(""); setActiveTab("All"); }} className="type-ui text-sm font-semibold hover:text-white transition-colors underline underline-offset-4">
                Reset Exploration Nexus
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
