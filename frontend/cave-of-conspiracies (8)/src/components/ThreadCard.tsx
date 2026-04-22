import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { MessageSquare, ArrowBigUp, ArrowBigDown, Share2, MoreHorizontal, Shield, Flag, Check, Copy, Bookmark, EyeOff, VolumeX } from "lucide-react";
import Modal from "./ui/Modal";

interface ThreadCardProps {
  id: string;
  authorName: string;
  communityName: string;
  communityId: string;
  timestamp: string;
  title: string;
  content: string;
  votes: number;
  comments: number;
  isAnonymous?: boolean;
}

export default function ThreadCard({
  id,
  authorName,
  communityName,
  communityId,
  timestamp,
  title,
  content,
  votes: initialVotes,
  comments,
  isAnonymous = false,
}: ThreadCardProps) {
  const [voteCount, setVoteCount] = React.useState(initialVotes);
  const [userVote, setUserVote] = React.useState<0 | 1 | -1>(0);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [reportSubmitted, setReportSubmitted] = React.useState(false);
  const [isHidden, setIsHidden] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  const handleVote = (val: 1 | -1) => {
    if (userVote === val) {
      setVoteCount(voteCount - val);
      setUserVote(0);
    } else {
      setVoteCount(voteCount - userVote + val);
      setUserVote(val);
    }
  };

  const copyToClipboard = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitReport = () => {
    setReportSubmitted(true);
    setTimeout(() => {
      setIsReportModalOpen(false);
      setReportSubmitted(false);
    }, 2000);
  };

  if (isHidden) {
      return (
          <div className="glass-dark rounded-2xl p-6 text-center border-white/5 opacity-50 my-4 flex items-center justify-between transition-all">
             <span className="type-ui text-sm text-white/50">Transmission scrubbed from your feed.</span>
             <button onClick={() => setIsHidden(false)} className="type-ui text-xs font-bold text-violet-400 hover:text-white transition-colors">Undo</button>
          </div>
      );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-dark rounded-[24px] p-6 md:p-8 hover:translate-y-[-2px] transition-all duration-300 border-white/5 relative group"
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className={`type-metadata text-[9px] px-2.5 py-1 rounded-md border transition-colors ${
                isAnonymous 
                  ? "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20" 
                  : "bg-violet-500/10 text-violet-400 border-violet-500/20"
              }`}>
                {isAnonymous ? "ENCRYPTED" : "VERIFIED"}
              </span>
              <span className="type-metadata text-[9px] text-white/40">
                {isAnonymous ? "ANONYMOUS NODE" : authorName.toUpperCase()}
              </span>
              {isSaved && (
                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 rounded">
                  In Vault
                </span>
              )}
            </div>
            <div className="type-metadata text-[9px] text-white/30 flex items-center gap-2">
              {timestamp} <span className="text-white/20">•</span> 
              <Link to={`/community/${communityId}`} className="hover:text-violet-400 transition-colors">
                {communityName}
              </Link>
            </div>
          </div>
          <div className="flex gap-2 relative">
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/40 hover:text-white transition-all"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button 
                 onClick={(e) => { e.preventDefault(); setIsMenuOpen(!isMenuOpen); }}
                 className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/40 hover:text-white transition-all"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); }} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 top-10 w-52 glass-dark rounded-2xl border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.8)] z-50 overflow-hidden flex flex-col py-2"
                  >
                    <button 
                      onClick={(e) => { e.preventDefault(); copyToClipboard(); setIsMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 type-ui text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all text-left"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />} Copy Coordinate
                    </button>
                    <button 
                      onClick={(e) => { e.preventDefault(); setIsSaved(!isSaved); setIsMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 type-ui text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all text-left"
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? "text-violet-400 fill-violet-400/20" : ""}`} /> {isSaved ? "Remove from Vault" : "Save to Vault"}
                    </button>
                    <button 
                      onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 type-ui text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all text-left"
                    >
                      <VolumeX className="w-4 h-4" /> Mute Frequency
                    </button>
                    <button 
                      onClick={(e) => { e.preventDefault(); setIsHidden(true); setIsMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 type-ui text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all text-left"
                    >
                      <EyeOff className="w-4 h-4" /> Hide from Feed
                    </button>
                    <div className="h-px bg-white/10 my-1" />
                    <button 
                      onClick={(e) => { e.preventDefault(); setIsReportModalOpen(true); setIsMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 type-ui text-xs font-semibold text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all text-left"
                    >
                      <Flag className="w-4 h-4" /> Report Anomaly
                    </button>
                  </motion.div>
                </>
              )}
          </div>
        </div>

        <Link to={`/thread/${id}`} className="block group/title mb-6">
          <h3 className="type-title text-xl mb-3 group-hover/title:text-violet-300 transition-colors line-clamp-2">
              {title}
          </h3>
          <p className="type-ui text-sm text-white/60 leading-relaxed line-clamp-3 antialiased">
              {content}
          </p>
        </Link>

        <div className="flex items-center justify-between pt-5 mt-2">
          <div className="flex items-center gap-4">
              <div className="flex items-center bg-white/5 rounded-full border border-white/5 overflow-hidden">
                  <button 
                    onClick={() => handleVote(1)}
                    className={`px-3 py-2 transition-all flex items-center justify-center hover:bg-white/10 ${
                      userVote === 1 ? "text-violet-400" : "text-white/40 hover:text-white"
                    }`}
                  >
                    <ArrowBigUp className="w-4 h-4" />
                  </button>
                  <span className="font-sans text-xs font-semibold w-8 text-center text-white/80">{voteCount > 999 ? (voteCount/1000).toFixed(1) + 'k' : voteCount}</span>
                  <button 
                    onClick={() => handleVote(-1)}
                    className={`px-3 py-2 transition-all flex items-center justify-center hover:bg-white/10 ${
                      userVote === -1 ? "text-fuchsia-400" : "text-white/40 hover:text-white"
                    }`}
                  >
                    <ArrowBigDown className="w-4 h-4" />
                  </button>
              </div>
              <Link to={`/thread/${id}`} className="flex items-center gap-2 type-ui font-semibold text-white/40 hover:text-white hover:bg-white/5 px-4 py-2 rounded-full transition-all">
                  <MessageSquare className="w-4 h-4" />
                  <span>{comments}</span>
              </Link>
          </div>
          
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-red-500/10 text-red-500/60 hover:text-red-400 flex items-center gap-2"
          >
             <Flag className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Share Modal */}
      <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Distribute Signal">
        <div className="space-y-8 text-center">
          <p className="type-ui opacity-40 italic">Select node for redistribution across the unified network.</p>
          <div className="grid grid-cols-2 gap-4">
            <button className="glass py-4 rounded-2xl type-ui hover:bg-white/5 transition-all text-white/60">Shadow Message</button>
            <button className="glass py-4 rounded-2xl type-ui hover:bg-white/5 transition-all text-white/60">Node Direct</button>
          </div>
          <div className="relative group">
            <input 
              readOnly 
              value={`caveofconspiracies.net/signal/${id}`}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 type-ui text-white/40 focus:outline-none focus:border-violet-500/40 transition-colors"
            />
            <button 
              onClick={copyToClipboard}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 glass rounded-xl hover:text-white transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Signal Quarantine">
        <div className="space-y-6">
          {reportSubmitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-4"
            >
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
                {["Inaccurate Data", "Node Harassment", "Encryption Violation", "State Propaganda"].map((reason) => (
                  <button 
                    key={reason}
                    onClick={submitReport}
                    className="w-full text-left glass p-5 rounded-3xl type-ui hover:bg-red-500/10 hover:border-red-500/20 transition-all text-white/60 group"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
