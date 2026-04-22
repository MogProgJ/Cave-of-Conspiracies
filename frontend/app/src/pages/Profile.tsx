import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ThreadCard from "../components/ThreadCard";
import { Settings, Shield, MessageSquare, ChevronRight, Activity } from "lucide-react";
import { getMyProfile, getProfile, submitReport, voteThread } from "../lib/api";
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

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [activeTab, setActiveTab] = React.useState("Transmissions");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [payload, setPayload] = React.useState<{
    profile: {
      id: number;
      display_name: string;
      bio: string | null;
      role: string;
      joined_at: string;
      stats: { post_count: number; comment_count: number };
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
    comments: Array<{
      id: number;
      body: string;
      author: string | null;
      created_at: string;
    }>;
  } | null>(null);

  const isOwnProfile = !id || (session.account && Number(id) === session.account.id);

  React.useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      const res = isOwnProfile
        ? await getMyProfile()
        : await getProfile(Number(id));

      if (!active) return;

      if (!res.ok) {
        setError(res.error);
        setLoading(false);
        if (isOwnProfile && !session.authenticated) {
          navigate('/login');
        }
        return;
      }

      setPayload(res.data);
      setError(null);
      setLoading(false);
    };
    void run();
    return () => {
      active = false;
    };
  }, [id, isOwnProfile, navigate, session.authenticated]);

  const profile = payload?.profile;
  const userThreads = payload?.threads ?? [];
  const userComments = payload?.comments ?? [];
  const archiveMock = userThreads.slice(0, 1);

  const tabs = ["Transmissions", "Whispers", "The Archive"];

  return (
    <div className="pt-24 pb-24 max-w-6xl mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-8">
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
                  <div className="w-full h-full rounded-full bg-cave-void flex items-center justify-center type-title text-2xl">
                    {(profile?.display_name ?? "U").slice(0, 1).toUpperCase()}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full glass border border-white/20 flex items-center justify-center shadow-lg bg-cave-void">
                  <Shield className="w-4 h-4 text-violet-400" />
                </div>
              </div>

              <h1 className="type-title text-2xl mb-1 text-white/90">{profile?.display_name ?? "User"}</h1>
              <p className="type-ui text-[10px] font-bold uppercase tracking-widest text-violet-400 opacity-80 mb-6">{profile?.role ?? "user"}</p>

              <p className="type-ui text-sm text-white/50 leading-relaxed mb-6 px-2">
                {profile?.bio ? `"${profile.bio}"` : "No bio yet."}
              </p>

              <div className="grid grid-cols-3 gap-2 w-full pt-6 border-t border-white/5">
                <div className="text-center">
                  <div className="type-ui text-lg font-semibold text-white/80">{profile?.stats.post_count ?? 0}</div>
                  <div className="type-ui text-[9px] font-bold uppercase tracking-widest text-white/30 mt-1">Posts</div>
                </div>
                <div className="text-center">
                  <div className="type-ui text-lg font-semibold text-white/80">{profile?.stats.comment_count ?? 0}</div>
                  <div className="type-ui text-[9px] font-bold uppercase tracking-widest text-white/30 mt-1">Comments</div>
                </div>
                <div className="text-center">
                  <div className="type-ui text-lg font-semibold text-white/80">{(profile?.stats.post_count ?? 0) + (profile?.stats.comment_count ?? 0)}</div>
                  <div className="type-ui text-[9px] font-bold uppercase tracking-widest text-white/30 mt-1">Signals</div>
                </div>
              </div>
            </div>
          </div>

          <section className="glass-dark rounded-2xl p-6 border-white/5">
            <h3 className="type-ui text-xs font-bold uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Signal Resonance
            </h3>
            <div className="space-y-3">
              {[...new Set(userThreads.map((t) => t.community?.name).filter(Boolean))].slice(0, 3).map((name) => {
                const thread = userThreads.find((t) => t.community?.name === name);
                return (
                  <Link to={`/community/${thread?.community?.slug ?? 'general'}`} key={name} className="flex items-center justify-between group p-2 hover:bg-white/[0.02] rounded-lg transition-colors -mx-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-violet-400 opacity-60 group-hover:opacity-100 transition-opacity uppercase font-bold text-[10px]">
                        {(name ?? "G").slice(0, 1)}
                      </div>
                      <span className="type-ui text-sm font-semibold opacity-60 group-hover:opacity-100 transition-opacity">{name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-20" />
                  </Link>
                );
              })}
            </div>
          </section>
        </aside>

        <main className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-2">
            <nav className="flex gap-6 overflow-x-auto no-scrollbar">
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(tab)}
                  className={`type-ui text-xs font-bold uppercase tracking-widest transition-all relative py-3 whitespace-nowrap ${
                    activeTab === tab ? "text-violet-400" : "text-white/30 hover:text-white/60"
                  }`}
                >
                  {tab}
                  {activeTab === tab && <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-400" />}
                </button>
              ))}
            </nav>
            <div className="type-ui text-[10px] font-bold uppercase tracking-widest opacity-30 whitespace-nowrap">
              Node Active // {profile?.joined_at ? new Date(profile.joined_at).toLocaleDateString() : "Unknown"}
            </div>
          </div>

          {loading ? (
            <div className="type-ui text-sm text-white/40">Loading profile...</div>
          ) : error ? (
            <div className="type-ui text-sm text-red-300">Unable to load profile: {error}</div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {activeTab === "Transmissions" && (
                  <motion.div key="transmissions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
                    {userThreads.length > 0 ? (
                      userThreads.map((thread) => (
                        <ThreadCard
                          key={thread.id}
                          id={thread.id}
                          authorName={thread.author ?? profile?.display_name ?? "Anon"}
                          communityName={thread.community?.name ?? "General"}
                          communitySlug={thread.community?.slug ?? "general"}
                          timestamp={toLocalTimeLabel(thread.created_at)}
                          title={thread.title}
                          content={thread.body_preview}
                          upvotes={thread.upvotes}
                          downvotes={thread.downvotes}
                          comments={thread.comment_count}
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
                      <div className="text-center py-16 type-ui text-sm opacity-30 italic">No transmissions found.</div>
                    )}
                  </motion.div>
                )}

                {activeTab === "Whispers" && (
                  <motion.div key="whispers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
                    {userComments.length > 0 ? (
                      userComments.map((whisper) => (
                        <div key={whisper.id} className="glass-dark rounded-2xl p-6 border-white/5 group relative">
                          <div className="flex items-center justify-between mb-3 text-white/40">
                            <div className="flex items-center gap-2 type-ui text-[10px] font-bold uppercase tracking-widest">
                              <MessageSquare className="w-3 h-3" />
                              <span>Whisper</span>
                            </div>
                            <span className="type-ui text-[10px] tracking-widest">{toLocalTimeLabel(whisper.created_at)}</span>
                          </div>
                          <p className="type-ui text-sm text-white/80 leading-relaxed mb-4">{whisper.body}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16 type-ui text-sm opacity-30 italic">No whispers found.</div>
                    )}
                  </motion.div>
                )}

                {activeTab === "The Archive" && (
                  <motion.div key="archive" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
                    {archiveMock.map((thread) => (
                      <ThreadCard
                        key={`archived-${thread.id}`}
                        id={thread.id}
                        authorName={thread.author ?? profile?.display_name ?? "Anon"}
                        communityName={thread.community?.name ?? "General"}
                        communitySlug={thread.community?.slug ?? "general"}
                        timestamp={toLocalTimeLabel(thread.created_at)}
                        title={thread.title}
                        content={thread.body_preview}
                        upvotes={thread.upvotes}
                        downvotes={thread.downvotes}
                        comments={thread.comment_count}
                      />
                    ))}
                    {archiveMock.length === 0 && (
                      <div className="text-center py-16 type-ui text-sm opacity-30 italic">No archived signals found.</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
