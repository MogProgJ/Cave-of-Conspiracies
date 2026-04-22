import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import Composer from "../components/Composer";
import ThreadCard from "../components/ThreadCard";
import { TrendingUp, Activity, Sparkles, Radio, ArrowRight, Eye } from "lucide-react";
import {
  CommunityCard,
  ThreadCard as ApiThreadCard,
  createThread,
  getCommunities,
  getFeed,
  submitReport,
  voteThread,
} from "../lib/api";
import { useAuth } from "../context/AuthContext";

function toLocalTimeLabel(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "just now";
  const delta = Math.floor((Date.now() - t) / 1000);
  if (delta < 60) return "just now";
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 86400)}d ago`;
}

const FILTER_TO_SORT: Record<string, 'new' | 'top' | 'old'> = {
  Resonant: 'top',
  Recent: 'new',
  Undetected: 'old',
};

export default function Home() {
  const [feedFilter, setFeedFilter] = React.useState("Resonant");
  const [threads, setThreads] = React.useState<ApiThreadCard[]>([]);
  const [communities, setCommunities] = React.useState<CommunityCard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const { session } = useAuth();
  const navigate = useNavigate();

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const [feedRes, communityRes] = await Promise.all([
      getFeed({ sort: FILTER_TO_SORT[feedFilter], limit: 20 }),
      getCommunities(),
    ]);

    if (!feedRes.ok) {
      setError(feedRes.error);
      setLoading(false);
      return;
    }

    setThreads(feedRes.data.threads);
    if (communityRes.ok) {
      setCommunities(communityRes.data.communities);
    }
    setLoading(false);
  }, [feedFilter]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filterDescriptions = {
    Resonant: "High-engagement anomalies verified by the network.",
    Recent: "Latest intercepted transmissions.",
    Undetected: "Low-resonance signals hiding in the noise.",
  };

  return (
    <div className="pt-24 pb-24 max-w-[1280px] mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 space-y-8">
          <section className="relative space-y-6 pb-4 border-b border-white/5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
              <h1 className="type-display-large text-4xl md:text-5xl">
                Seek the <span className="gradient-text-accent">Static.</span>
              </h1>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1 }} className="space-y-6">
              <p className="type-ui text-base md:text-lg opacity-60 max-w-xl pr-4">
                The surface world is a curated lie. Welcome to the distributed conscience of the invisible network.
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <Link to="/explore" className="px-5 py-2.5 bg-white text-cave-void rounded-full type-ui text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-violet-400 hover:text-white transition-colors shadow-sm">
                  Explore Nodes <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/about" className="group flex items-center gap-3 px-3 py-2 rounded-full hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:bg-transparent transition-colors">
                    <Eye className="w-4 h-4 text-white/50 group-hover:text-violet-400" />
                  </div>
                  <span className="type-ui text-[10px] font-bold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">Our Protocol</span>
                </Link>
              </div>
            </motion.div>
          </section>

          <div className="relative pt-2">
            <Composer
              isAuthenticated={session.authenticated}
              onRequireAuth={() => navigate('/login')}
              onSubmit={async (payload) => {
                const res = await createThread(payload);
                if (!res.ok) {
                  return { ok: false, error: res.error };
                }
                await load();
                return { ok: true };
              }}
              options={communities.map((c) => ({ slug: c.slug, label: c.name }))}
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col border-b border-white/5 pb-3 gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Radio className="w-4 h-4 text-violet-400" />
                  <h2 className="type-title text-lg">Global Feed</h2>
                </div>
                <div className="flex gap-4">
                  {["Resonant", "Recent", "Undetected"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFeedFilter(f)}
                      className={`type-ui text-xs font-bold uppercase tracking-widest transition-all relative py-2 ${
                        feedFilter === f ? "text-violet-400" : "text-white/30 hover:text-white/80"
                      }`}
                    >
                      {f}
                      {feedFilter === f && <motion.div layoutId="feed-filter" className="absolute -bottom-[2px] left-0 w-full h-[2px] bg-violet-400" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="type-ui text-[10px] uppercase tracking-widest text-[#808090] opacity-80 pt-1">
                {filterDescriptions[feedFilter as keyof typeof filterDescriptions]}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 type-ui text-sm text-red-300">
                Unable to load feed: {error}
              </div>
            )}

            {loading ? (
              <div className="type-ui text-sm text-white/40 py-6">Loading feed...</div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {threads.map((thread) => (
                    <motion.div key={thread.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
                      <ThreadCard
                        id={thread.id}
                        authorName={thread.author ?? "Anon"}
                        communityName={thread.community?.name ?? "General"}
                        communitySlug={thread.community?.slug ?? "general"}
                        timestamp={toLocalTimeLabel(thread.created_at)}
                        title={thread.title}
                        content={thread.body_preview}
                        upvotes={thread.upvotes}
                        downvotes={thread.downvotes}
                        comments={thread.comment_count}
                        isAnonymous={!thread.author}
                        onVote={async (id, type) => {
                          const res = await voteThread(id, { type });
                          if (!res.ok) return { ok: false };
                          return {
                            ok: true,
                            upvotes: res.data.upvotes,
                            downvotes: res.data.downvotes,
                          };
                        }}
                        onReport={async (id, reason) => {
                          const res = await submitReport({ target_type: 'message', target_id: id, reason });
                          if (!res.ok) return { ok: false, error: res.error };
                          return { ok: true };
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <SidebarModule title="Active Resonance" icon={<Activity className="w-4 h-4" />}>
            <div className="grid grid-cols-1 gap-2">
              {communities.slice(0, 4).map((community) => (
                <Link
                  to={`/community/${community.slug}`}
                  key={community.slug}
                  className="glass-dark rounded-xl p-3 flex items-center justify-between group hover:bg-white/[0.04] hover:border-violet-500/30 transition-all border-transparent border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-violet-400 opacity-60 group-hover:opacity-100 group-hover:bg-violet-500/20 transition-all type-title text-base font-bold">
                      {community.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="type-ui text-sm font-semibold group-hover:text-violet-300 transition-colors leading-tight">{community.name}</span>
                      <span className="type-ui text-[10px] text-white/40">{community.posts_7d} posts / 7d</span>
                    </div>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                </Link>
              ))}
            </div>
            <Link to="/explore" className="block text-center pt-4 type-ui text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">
              View All Nodes
            </Link>
          </SidebarModule>

          <section className="glass-dark rounded-2xl p-6 text-center space-y-5 border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Radio className="w-6 h-6 text-violet-400 mx-auto animate-pulse" />
            <div className="space-y-1.5 relative z-10">
              <h3 className="type-title text-base">Intercept Signal</h3>
              <p className="type-ui text-xs text-white/50 leading-relaxed">Have you detected a shift in the narrative? Manifest your findings.</p>
            </div>
            <button className="w-full py-2.5 glass-dark bg-white/5 border border-white/10 rounded-lg type-ui text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all relative z-10 text-white/80 hover:text-white">
              Start Transmission
            </button>
          </section>

          <section className="glass-dark rounded-2xl p-6 border-white/5 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <h3 className="type-title text-base flex-1">Trending Signals</h3>
            </div>
            <div className="space-y-4">
              {threads.slice(0, 3).map((thread, i) => (
                <Link key={thread.id} to={`/thread/${thread.id}`} className="group cursor-pointer flex gap-3 p-2 -mx-2 hover:bg-white/[0.02] rounded-lg transition-colors">
                  <span className="type-ui text-xs font-bold text-white/20 group-hover:text-violet-400 transition-colors pt-0.5">0{i + 1}</span>
                  <div className="flex flex-col gap-1">
                    <h4 className="type-ui text-sm font-semibold text-white/80 group-hover:text-violet-300 transition-colors leading-snug break-words line-clamp-2">{thread.title}</h4>
                    <div className="flex items-center gap-2 type-ui text-[10px] uppercase tracking-widest font-bold">
                      <span className="text-violet-400/80">{thread.upvotes - thread.downvotes} Resonance</span>
                      <span className="text-white/20">•</span>
                      <span className="text-white/40">{thread.community?.name ?? 'General'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SidebarModule({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass-dark rounded-2xl p-6 border-white/5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
          {icon}
        </div>
        <h3 className="type-title text-base">{title}</h3>
      </div>
      {children}
    </div>
  );
}
