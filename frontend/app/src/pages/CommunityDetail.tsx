import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import ThreadCard from "../components/ThreadCard";
import Composer from "../components/Composer";
import { ShieldCheck, ChevronLeft, Share2 } from "lucide-react";
import { createThread, getCommunity, submitReport, voteThread } from "../lib/api";
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

export default function CommunityDetail() {
  const { slug = "general" } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [activeTab, setActiveTab] = React.useState("Top");
  const [isJoined, setIsJoined] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [payload, setPayload] = React.useState<{
    community: {
      slug: string;
      name: string;
      tagline: string | null;
      category: string;
      posts_7d: number;
      comments_7d: number;
    };
    threads: Array<{
      id: number;
      title: string;
      body_preview: string;
      author: string | null;
      community: { slug: string; name: string } | null;
      upvotes: number;
      downvotes: number;
      comment_count: number;
      created_at: string;
    }>;
  } | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const sort = activeTab === "Recent" ? "new" : activeTab === "Active" ? "old" : "top";
    const res = await getCommunity(slug);
    if (!res.ok) {
      setError(res.error);
      setLoading(false);
      return;
    }
    const sortedThreads = [...res.data.threads];
    if (sort === 'new') {
      sortedThreads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === 'old') {
      sortedThreads.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      sortedThreads.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    }

    setPayload({
      community: res.data.community,
      threads: sortedThreads,
    });
    setError(null);
    setLoading(false);
  }, [slug, activeTab]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const community = payload?.community;
  const threads = payload?.threads ?? [];

  return (
    <div className="pt-24 pb-24 max-w-[1200px] mx-auto px-4">
      <div className="relative h-64 rounded-3xl overflow-hidden mb-8 border border-white/5 shadow-2xl bg-gradient-to-br from-violet-900/40 to-cave-void">
        <div className="absolute inset-0 bg-gradient-to-t from-cave-void via-cave-void/80 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
          <Link to="/explore" className="flex items-center gap-2 type-ui text-xs font-semibold text-white/40 hover:text-white transition-colors mb-4 w-fit">
            <ChevronLeft className="w-4 h-4" /> Back to Nexus
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="type-display-medium text-4xl md:text-5xl mb-2">{community?.name ?? "Community"}</h1>
              <p className="type-ui text-sm opacity-60 max-w-xl leading-relaxed">{community?.tagline ?? "Signals converge in this coordinate."}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsJoined((v) => !v)}
                className={`px-6 py-2.5 rounded-full type-ui text-sm font-bold transition-all relative w-40 flex items-center justify-center ${
                  isJoined
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                    : "bg-white text-black hover:bg-violet-400 hover:text-white"
                }`}
              >
                {isJoined ? "Joined" : "Join Network"}
              </button>
              <button className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
                <Share2 className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between opacity-50 border-b border-white/5 pb-4">
            <h2 className="type-ui text-xs font-bold uppercase tracking-widest text-violet-400">Manifestation Feed</h2>
            <div className="flex gap-4 type-ui text-xs font-semibold">
              {["Top", "Recent", "Active"].map((tab) => (
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

          <Composer
            isAuthenticated={session.authenticated}
            defaultCommunitySlug={slug}
            onRequireAuth={() => navigate('/login')}
            options={community ? [{ slug: community.slug, label: community.name }] : undefined}
            onSubmit={async ({ title, body, community_slug }) => {
              const res = await createThread({ title, body, community_slug });
              if (!res.ok) {
                return { ok: false, error: res.error };
              }
              await load();
              return { ok: true };
            }}
          />

          {loading ? (
            <div className="type-ui text-sm text-white/40">Loading community feed...</div>
          ) : error ? (
            <div className="glass-dark rounded-2xl p-12 text-center border-white/5 opacity-70 type-ui text-sm text-red-300">
              Unable to load community: {error}
            </div>
          ) : (
            <div className="space-y-4">
              {threads.length > 0 ? (
                threads.map((thread) => (
                  <ThreadCard
                    key={thread.id}
                    id={thread.id}
                    authorName={thread.author ?? "Anon"}
                    communityName={thread.community?.name ?? (community?.name ?? "General")}
                    communitySlug={thread.community?.slug ?? (community?.slug ?? "general")}
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
                      return { ok: true, upvotes: res.data.upvotes, downvotes: res.data.downvotes };
                    }}
                    onReport={async (id, reason) => {
                      const res = await submitReport({ target_type: 'message', target_id: id, reason });
                      if (!res.ok) return { ok: false, error: res.error };
                      return { ok: true };
                    }}
                  />
                ))
              ) : (
                <div className="glass-dark rounded-2xl p-12 text-center border-white/5 opacity-50 type-ui text-sm">
                  The frequency is silent. No transmissions detected in this coordinate yet.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <section className="glass-dark rounded-2xl p-6 border-white/5">
            <h3 className="type-title text-lg mb-4">Protocols</h3>
            <ul className="space-y-3">
              {[
                "Respect source evidence",
                "No personal info leaks",
                "Avoid duplicate threads",
              ].map((rule, i) => (
                <li key={i} className="flex gap-3 type-ui text-sm opacity-70 leading-relaxed">
                  <span className="text-violet-400 font-mono text-xs mt-0.5">{(i + 1).toString().padStart(2, '0')}.</span>
                  {rule}
                </li>
              ))}
            </ul>
          </section>

          <section className="glass-dark rounded-2xl p-6 border-white/5">
            <h3 className="type-title text-lg mb-4">Active Resonators</h3>
            <div className="space-y-3">
              {["Oracle_0", "Specter_V", "Hex_Driver"].map((mod, i) => (
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
                <div className="type-ui text-[10px] uppercase font-bold tracking-widest opacity-40 mb-1">7d Posts</div>
                <div className="type-title text-2xl">{community?.posts_7d ?? 0}</div>
              </div>
              <div className="text-center">
                <div className="type-ui text-[10px] uppercase font-bold tracking-widest opacity-40 mb-1">7d Comments</div>
                <div className="type-title text-2xl">{community?.comments_7d ?? 0}</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
