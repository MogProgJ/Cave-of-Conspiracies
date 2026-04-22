import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  ChevronLeft,
  Flag,
  Shield,
  User,
  Quote,
  Reply,
  Copy,
  Check,
  Send,
  Bookmark,
} from "lucide-react";
import Modal from "../components/ui/Modal";
import { createComment, getThread, submitReport, voteThread, ThreadDetail as ApiThreadDetail } from "../lib/api";
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

export default function ThreadDetail() {
  const { id } = useParams();
  const threadId = Number(id);
  const navigate = useNavigate();
  const { session } = useAuth();

  const [thread, setThread] = React.useState<ApiThreadDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [userVote, setUserVote] = React.useState<0 | 1 | -1>(0);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [reportSubmitted, setReportSubmitted] = React.useState(false);
  const [isAnswering, setIsAnswering] = React.useState(false);
  const [answerContent, setAnswerContent] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!Number.isFinite(threadId) || threadId <= 0) {
      setError("Invalid thread id.");
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await getThread(threadId);
    if (!res.ok) {
      setError(res.error);
      setLoading(false);
      return;
    }
    setThread(res.data);
    setError(null);
    setLoading(false);
  }, [threadId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleVote = async (val: 1 | -1) => {
    if (!thread) return;
    const type = val === 1 ? 'up' : 'down';
    const res = await voteThread(thread.id, { type });
    if (!res.ok) {
      return;
    }
    setThread({ ...thread, upvotes: res.data.upvotes, downvotes: res.data.downvotes });
    setUserVote(val);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/app/thread/${threadId}`).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitReportReason = async (reason: 'spam' | 'abuse' | 'illegal' | 'misinfo' | 'other') => {
    if (!thread) return;
    const res = await submitReport({ target_type: 'message', target_id: thread.id, reason });
    if (!res.ok) {
      return;
    }
    setReportSubmitted(true);
    setTimeout(() => {
      setIsReportModalOpen(false);
      setTimeout(() => setReportSubmitted(false), 300);
    }, 2000);
  };

  const submitComment = async () => {
    if (!thread || !answerContent.trim()) return;
    if (!session.authenticated) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    const res = await createComment(thread.id, { body: answerContent.trim() });
    if (!res.ok) {
      setIsSubmitting(false);
      return;
    }

    setThread({
      ...thread,
      comments: [...thread.comments, res.data.comment],
    });
    setAnswerContent("");
    setIsSubmitting(false);
    setIsAnswering(false);
  };

  if (loading) {
    return <div className="pt-24 pb-24 max-w-5xl mx-auto px-4 type-ui text-sm text-white/40">Loading thread...</div>;
  }

  if (error || !thread) {
    return <div className="pt-24 pb-24 max-w-5xl mx-auto px-4 type-ui text-sm text-red-300">Unable to load thread: {error ?? "Unknown error"}</div>;
  }

  return (
    <div className="pt-24 pb-24 max-w-5xl mx-auto px-4">
      <Link to="/" className="flex items-center gap-2 type-ui text-xs font-semibold text-white/40 hover:text-white transition-colors mb-8 w-fit">
        <ChevronLeft className="w-4 h-4" /> Back to Signal
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-10">
          <article>
            <div className="flex items-center gap-3 mb-6">
              <span className="type-ui text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-violet-500/20 text-violet-300">VERIFIED</span>
              <span className="type-ui text-xs text-white/40">
                Posted {toLocalTimeLabel(thread.created_at)} by <span className="font-semibold text-white/60">{thread.author ?? "Anon"}</span> in{" "}
                {thread.community ? (
                  <Link to={`/community/${thread.community.slug}`} className="font-semibold text-violet-400 hover:underline">{thread.community.name}</Link>
                ) : (
                  <span className="font-semibold text-violet-400">General</span>
                )}
              </span>
            </div>

            <h1 className="type-display-medium text-3xl md:text-4xl leading-tight mb-6 text-white/95">{thread.title}</h1>

            <div className="prose prose-invert max-w-none">
              <p className="type-ui text-base md:text-lg opacity-80 leading-relaxed whitespace-pre-wrap mb-8">{thread.body}</p>
            </div>

            <div className="flex items-center justify-between py-6 border-y border-white/5">
              <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                <div className="flex items-center gap-1 bg-white/5 rounded-full px-3 py-1.5 border border-white/10 mr-2">
                  <button onClick={() => void handleVote(1)} className={`p-1 transition-colors ${userVote === 1 ? "text-violet-400" : "text-white/40 hover:text-white"}`}><ArrowBigUp className="w-5 h-5" /></button>
                  <span className="type-ui font-semibold text-sm w-10 text-center">{thread.upvotes - thread.downvotes}</span>
                  <button onClick={() => void handleVote(-1)} className={`p-1 transition-colors ${userVote === -1 ? "text-fuchsia-400" : "text-white/40 hover:text-white"}`}><ArrowBigDown className="w-5 h-5" /></button>
                </div>

                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`flex items-center gap-2 type-ui text-xs md:text-sm font-semibold transition-colors bg-white/5 border border-white/10 rounded-full px-4 py-2 hover:bg-white/10 ${isSaved ? "text-violet-400 border-violet-500/30" : "text-white/40 hover:text-white"}`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-violet-400/20' : ''}`} /> {isSaved ? "Saved to Vault" : "Save to Vault"}
                </button>
                <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-2 type-ui text-xs md:text-sm font-semibold text-white/40 hover:text-white transition-colors bg-white/5 border border-white/10 rounded-full px-4 py-2 hover:bg-white/10">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
              <button onClick={() => setIsReportModalOpen(true)} className="flex items-center gap-2 type-ui text-xs font-semibold text-red-500/50 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg">
                <Flag className="w-4 h-4" /> Report
              </button>
            </div>
          </article>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="type-title text-xl">Whispers <span className="text-white/40 text-sm ml-2 font-normal">({thread.comments.length})</span></h3>
              <button onClick={() => setIsAnswering(!isAnswering)} className="px-6 py-2 bg-white text-black rounded-full type-ui text-xs font-bold hover:bg-violet-400 hover:text-white transition-colors">
                {isAnswering ? "Cancel Tracking" : "Intercept Signal"}
              </button>
            </div>

            <AnimatePresence>
              {isAnswering && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass-dark rounded-2xl p-4 border border-violet-500/30 overflow-hidden">
                  <textarea
                    autoFocus
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    placeholder="Manifest your whisper..."
                    className="w-full bg-transparent text-sm type-ui text-white/80 placeholder:text-white/30 resize-none outline-none min-h-[100px] p-2"
                  />
                  <div className="flex justify-end pt-3 border-t border-white/5 mt-2">
                    <button
                      onClick={() => void submitComment()}
                      disabled={!answerContent.trim() || isSubmitting}
                      className={`flex items-center gap-2 px-5 py-2 rounded-full type-ui text-xs font-bold transition-all ${
                        !answerContent.trim() || isSubmitting
                          ? "bg-white/10 text-white/40 cursor-not-allowed"
                          : "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_4px_16px_rgba(139,92,246,0.3)]"
                      }`}
                    >
                      {isSubmitting ? "Transmitting..." : <><Send className="w-4 h-4" /> Transmit</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {thread.comments.map((c) => (
                  <motion.div key={c.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-dark rounded-2xl p-6 border-white/5 relative group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-white/40" />
                        </div>
                        <div>
                          <div className="type-ui text-sm font-semibold text-white/80">{c.author ?? "Anon"}</div>
                          <div className="type-ui text-xs text-white/30">{toLocalTimeLabel(c.created_at)}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setAnswerContent(`> ${c.body}\n\n`); setIsAnswering(true); }} className="p-2 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-colors" title="Quote"><Quote className="w-4 h-4" /></button>
                        <button onClick={() => { setAnswerContent(`@${c.author ?? 'anon'} `); setIsAnswering(true); }} className="p-2 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-colors" title="Reply"><Reply className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <p className="type-ui text-sm opacity-80 leading-relaxed ml-11 whitespace-pre-wrap">{c.body}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <section className="glass-dark rounded-2xl p-6 border-white/5">
            <h3 className="type-title text-lg mb-4">Coordinate Context</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="type-ui text-xs uppercase font-bold tracking-widest text-white/30">Community</span>
                {thread.community ? (
                  <Link to={`/community/${thread.community.slug}`} className="type-ui text-sm font-semibold text-violet-400 hover:underline">{thread.community.name}</Link>
                ) : (
                  <span className="type-ui text-sm font-semibold text-violet-400">General</span>
                )}
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="type-ui text-xs uppercase font-bold tracking-widest text-white/30">Security</span>
                <span className="type-ui text-xs font-mono text-white/60">Restricted</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="type-ui text-xs uppercase font-bold tracking-widest text-white/30">Author</span>
                <span className="type-ui text-sm text-white/60">{thread.author ?? "Anonymized Node"}</span>
              </div>
            </div>
          </section>

          <section className="glass-dark rounded-2xl p-6 border-white/5">
            <h3 className="type-title text-lg mb-4">Related Transmissions</h3>
            <div className="space-y-4 type-ui text-sm text-white/50">Use Explore or Community feed to discover related threads.</div>
          </section>
        </div>
      </div>

      <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Distribute Signal">
        <div className="space-y-8 text-center">
          <p className="type-ui opacity-40 italic">Select node for redistribution across the unified network.</p>
          <div className="grid grid-cols-2 gap-4">
            <button className="glass py-4 rounded-2xl type-ui hover:bg-white/5 transition-all text-white/60">Shadow Message</button>
            <button className="glass py-4 rounded-2xl type-ui hover:bg-white/5 transition-all text-white/60">Node Direct</button>
          </div>
          <div className="relative group">
            <input readOnly value={`${window.location.origin}/app/thread/${thread.id}`} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 type-ui text-white/40 focus:outline-none focus:border-violet-500/40 transition-colors" />
            <button onClick={copyToClipboard} className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 glass rounded-xl hover:text-white transition-all">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Signal Quarantine">
        <div className="space-y-6">
          {reportSubmitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
                <Shield className="w-8 h-8 text-red-500" />
              </div>
              <p className="type-display-medium text-2xl">Signal Reported</p>
              <p className="type-ui opacity-40">The Oracle will review this transmission for network toxicity.</p>
            </motion.div>
          ) : (
            <>
              <p className="type-ui opacity-40 italic mb-4">Reason for quarantine request:</p>
              <div className="space-y-3">
                <button onClick={() => void submitReportReason('misinfo')} className="w-full text-left glass p-5 rounded-3xl type-ui hover:bg-red-500/10 hover:border-red-500/20 transition-all text-white/60 group">Inaccurate Data</button>
                <button onClick={() => void submitReportReason('abuse')} className="w-full text-left glass p-5 rounded-3xl type-ui hover:bg-red-500/10 hover:border-red-500/20 transition-all text-white/60 group">Node Harassment</button>
                <button onClick={() => void submitReportReason('illegal')} className="w-full text-left glass p-5 rounded-3xl type-ui hover:bg-red-500/10 hover:border-red-500/20 transition-all text-white/60 group">Encryption Violation</button>
                <button onClick={() => void submitReportReason('spam')} className="w-full text-left glass p-5 rounded-3xl type-ui hover:bg-red-500/10 hover:border-red-500/20 transition-all text-white/60 group">State Propaganda</button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
