import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { MOCK_NOTIFICATIONS } from "../data/mockData";
import { Bell, MessageSquare, Shield, Zap, Filter, CheckCheck, Trash2, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

export default function Notifications() {
  const [activeFilter, setActiveFilter] = React.useState("All Signals");
  const [notifications, setNotifications] = React.useState(MOCK_NOTIFICATIONS);
  
  const filteredNotifications = notifications.filter(n => {
      if (activeFilter === "All Signals") return true;
      if (activeFilter === "Replies" && n.type === "reply") return true;
      if (activeFilter === "Moderation" && n.type === "moderation") return true;
      if (activeFilter === "System" && n.type === "system") return true;
      return false;
  });

  const handleClearAll = () => {
     setNotifications([]);
  };

  const handleRestore = () => {
    setNotifications(MOCK_NOTIFICATIONS);
  };

  const markAsRead = (id: string) => {
     setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: string) => {
     setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="pt-24 pb-24 max-w-[900px] mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="type-title">Signals</h1>
        {notifications.length > 0 && (
          <button 
             onClick={handleClearAll}
             className="flex items-center gap-2 type-ui text-xs font-semibold opacity-50 hover:opacity-100 transition-opacity whitespace-nowrap bg-white/5 px-4 py-2 rounded-full hover:bg-white/10"
          >
              <CheckCheck className="w-4 h-4" /> Clear All Frequencies
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-white/5 pb-4">
        {["All Signals", "Replies", "Moderation", "System"].map((f, i) => (
            <button 
                key={i} 
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    activeFilter === f ? "bg-violet-500 text-white shadow-[0_2px_10px_rgba(139,92,246,0.5)]" : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
            >
                {f}
            </button>
        ))}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n, i) => (
                  <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`glass-dark p-4 md:p-6 rounded-2xl border border-white/5 relative group hover:bg-white/[0.04] transition-colors ${!n.read ? "bg-violet-500/[0.02] border-violet-500/20" : ""}`}
                  >
                  {!n.read && (
                      <div className="absolute top-1/2 -translate-y-1/2 left-3 w-2 h-2 bg-violet-400 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                  )}
                  
                  <div className="flex items-start justify-between gap-4 pl-4">
                      <div className="flex gap-4 w-full">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              n.type === "reply" ? "bg-emerald-500/10 text-emerald-400" : 
                              n.type === "moderation" ? "bg-red-500/10 text-red-500" : "bg-violet-500/10 text-violet-400"
                          }`}>
                              {n.type === "reply" && <MessageSquare className="w-4 h-4" />}
                              {n.type === "system" && <Zap className="w-4 h-4" />}
                              {n.type === "moderation" && <Shield className="w-4 h-4" />}
                          </div>
                          <div className="flex flex-col gap-1 w-full">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="type-metadata text-[9px] opacity-50">{n.type} Signal</span>
                                  <span className="text-white/20 text-xs">•</span>
                                  <span className="type-metadata text-[9px] text-white/30">{n.timestamp}</span>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!n.read && (
                                      <button onClick={() => markAsRead(n.id)} className="p-1 text-white/40 hover:text-white transition-colors" title="Mark as Read">
                                          <CheckCheck className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button onClick={() => deleteNotification(n.id)} className="p-1 text-white/40 hover:text-red-400 transition-colors" title="Delete">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                              </div>
                              <h3 className="type-ui font-semibold text-white/90 text-sm mt-1">{n.title}</h3>
                              <p className="type-ui text-sm opacity-60 leading-relaxed line-clamp-2 mt-0.5">{n.message}</p>
                              
                              <div className="flex items-center gap-3 mt-3">
                                {n.link && (
                                    <Link 
                                      to={n.link} 
                                      onClick={() => markAsRead(n.id)}
                                      className="px-4 py-1.5 rounded border border-white/10 type-ui text-xs font-semibold transition-all bg-white/5 hover:bg-white/10 hover:border-violet-500/30"
                                    >
                                        Intercept Payload
                                    </Link>
                                )}
                              </div>
                          </div>
                      </div>
                  </div>
              </motion.div>
          ))
      ) : (
          <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 opacity-40 space-y-4"
          >
              <Bell className="w-8 h-8 mx-auto mb-2 text-white/30" />
              <p className="type-title text-xl">No Signals Detected</p>
              <p className="type-ui text-sm">This frequency channel has been scrubbed clean.</p>
              
              {notifications.length === 0 && (
                 <button onClick={handleRestore} className="inline-flex flex items-center gap-2 type-ui text-xs font-semibold px-4 py-2 mt-4 border border-white/10 rounded-full hover:bg-white/5 transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" /> Force Signal Restore
                 </button>
              )}
          </motion.div>
      )}
      </AnimatePresence>
  </div>

      <div className="text-center pt-8 opacity-20 type-metadata text-[10px]">
        End of recent activity
      </div>
    </div>
  );
}
