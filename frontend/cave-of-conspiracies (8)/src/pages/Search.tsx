import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search as SearchIcon, Compass, Filter, Clock, TrendingUp, X, ChevronRight, Activity, Users, FileText, Radio } from "lucide-react";
import { MOCK_THREADS, MOCK_COMMUNITIES } from "../data/mockData";
import { Link } from "react-router-dom";

export default function Search() {
  const [query, setQuery] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);
  const [recentSearches, setRecentSearches] = React.useState([
    "Shadow Government", 
    "Tesla Pulse Codes", 
    "The Grid"
  ]);

  const handleClearAll = () => setRecentSearches([]);
  const handleRemoveSearch = (e: React.MouseEvent, searchToRemove: string) => {
    e.stopPropagation();
    setRecentSearches(prev => prev.filter(s => s !== searchToRemove));
  };

  const filteredThreads = MOCK_THREADS.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) || 
    t.content.toLowerCase().includes(query.toLowerCase())
  );

  const filteredCommunities = MOCK_COMMUNITIES.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.description.toLowerCase().includes(query.toLowerCase())
  );

  const hasResults = query.length > 0 && (filteredThreads.length > 0 || filteredCommunities.length > 0);

  return (
    <div className="pt-24 pb-24 min-h-[80vh] max-w-[1000px] mx-auto overflow-hidden px-4">
      {/* Search Bar Visual Authority */}
      <section className="relative z-20 mb-12">
        <div className={`relative transition-all duration-500 ${isFocused ? "scale-[1.02]" : "scale-100"}`}>
          <SearchIcon className={`absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors duration-300 ${isFocused ? "text-violet-400" : "text-white/30"}`} />
          <input 
            autoFocus
            type="text"
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, nodes, frequencies..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-16 pr-12 type-title text-xl md:text-2xl placeholder:opacity-30 placeholder:font-normal focus:outline-none focus:border-violet-500/50 transition-all focus:bg-white/[0.05] shadow-lg"
          />
          <AnimatePresence>
            {query && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setQuery("")}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
              >
                <X className="w-4 h-4 text-white/60" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </section>

      <div className="min-h-[500px]">
        {!query ? (
          /* Empty state: Exploration Guide */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="glass-dark rounded-2xl p-8 border-white/5 space-y-6">
              <div className="flex items-center gap-3 text-violet-400">
                <TrendingUp className="w-5 h-5" />
                <h3 className="type-ui text-xs font-bold uppercase tracking-widest text-white/50">Trending Searches</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Antarctica Signal Decoded",
                  "Biological Mesh Errors",
                  "1890 Census Missing Nodes",
                  "Orbital Silence Layer"
                ].map((t, i) => (
                  <li 
                    key={i} 
                    onClick={() => setQuery(t)}
                    className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="type-title text-base group-hover:text-violet-300 transition-colors">{t}</span>
                    <ChevronRight className="w-4 h-4 opacity-20 group-hover:opacity-60" />
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-dark rounded-2xl p-8 border-white/5 space-y-6">
              <div className="flex items-center gap-3 text-violet-400">
                <Clock className="w-5 h-5" />
                <h3 className="type-ui text-xs font-bold uppercase tracking-widest text-white/50">Recent Expeditions</h3>
              </div>
              
              {recentSearches.length > 0 ? (
                <>
                  <ul className="space-y-4">
                    {recentSearches.map((t, i) => (
                      <li 
                        key={i} 
                        onClick={() => setQuery(t)}
                        className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                      >
                        <span className="type-ui text-sm text-white/60">{t}</span>
                        <X 
                          onClick={(e) => handleRemoveSearch(e, t)}
                          className="w-3 h-3 opacity-30 hover:opacity-100 hover:text-red-400" 
                        />
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={handleClearAll}
                    className="type-ui text-xs text-white/30 hover:text-white transition-colors underline underline-offset-4 pt-2"
                  >
                    Clear History
                  </button>
                </>
              ) : (
                <div className="py-8 text-left text-white/30 type-ui text-sm italic">
                  No recent expeditions.
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Results state */
          <AnimatePresence mode="wait">
            {hasResults ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {/* Result Groups */}
                {filteredCommunities.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="type-ui text-xs font-bold uppercase tracking-widest opacity-50 flex items-center gap-2 mb-4">
                       <Activity className="w-4 h-4" /> Signal Nodes <span className="opacity-50 font-normal ml-1">({filteredCommunities.length})</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredCommunities.map((c) => (
                        <Link to={`/community/${c.id}`} key={c.id} className="glass-dark p-5 rounded-2xl border-white/5 hover:bg-white/[0.02] transition-colors group flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center type-title text-xl text-white/60 group-hover:text-violet-400 group-hover:bg-white/10 transition-colors">
                            {c.name[0]}
                           </div>
                           <div>
                              <h5 className="type-title text-base group-hover:text-violet-300 transition-colors">{c.name}</h5>
                              <p className="type-ui text-xs text-white/40 font-semibold">{c.members.toLocaleString()} Resonators</p>
                           </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {filteredThreads.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="type-ui text-xs font-bold uppercase tracking-widest opacity-50 flex items-center gap-2 mb-4 mt-8">
                       <Radio className="w-4 h-4" /> Transmissions <span className="opacity-50 font-normal ml-1">({filteredThreads.length})</span>
                    </h4>
                    <div className="space-y-3">
                      {filteredThreads.map((t) => (
                        <Link to={`/thread/${t.id}`} key={t.id} className="block glass-dark p-6 rounded-2xl border-white/5 hover:bg-white/[0.02] transition-colors group">
                           <div className="type-ui text-[10px] font-bold uppercase tracking-widest text-violet-400 opacity-80 mb-2">{t.communityName} // NODE</div>
                           <h5 className="type-title text-lg mb-2 group-hover:text-violet-300 transition-colors">{t.title}</h5>
                           <p className="type-ui text-sm text-white/60 line-clamp-2">{t.content}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 text-center space-y-6 opacity-60"
              >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                   <SearchIcon className="w-6 h-6 text-white/40" />
                </div>
                <div className="space-y-2">
                  <p className="type-title text-xl">No Data Found</p>
                  <p className="type-ui text-sm text-white/60">The frequency "{query}" returned no active signal signatures.</p>
                </div>
                <button 
                  onClick={() => setQuery("")}
                  className="type-ui text-sm font-semibold hover:text-white transition-colors underline underline-offset-4 pt-2"
                >
                  Restart Interceptor
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
