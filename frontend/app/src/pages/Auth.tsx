import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Github, Hexagon } from "lucide-react";

export default function Auth({ mode = "login" }: { mode?: "login" | "register" }) {
  const [isLogin, setIsLogin] = useState(mode === "login");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful login/register
    navigate("/");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-cave-void/80 backdrop-blur-md -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-br from-cave-violet/20 via-cave-magenta/20 to-cave-gold/20 rounded-3xl blur-xl opacity-50" />
        
        <div className="relative glass-dark rounded-3xl p-8 border border-white/10 overflow-hidden shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col items-center mb-8 text-center">
            <Link 
              to="/"
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cave-violet to-cave-magenta flex items-center justify-center shadow-lg mb-6 cursor-pointer group"
            >
              <Hexagon className="w-6 h-6 text-white group-hover:rotate-180 transition-transform duration-500" />
            </Link>
            <h1 className="type-title text-2xl font-bold mb-2">
              {isLogin ? "Welcome Back" : "Initiate Protocol"}
            </h1>
            <p className="type-ui text-xs text-white/50 tracking-widest uppercase font-semibold">
              {isLogin ? "Your clearance is required" : "Create your shadow identity"}
            </p>
          </form>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <AuthInput icon={<User className="w-4 h-4" />} placeholder="Codename" type="text" />
                </motion.div>
              )}
            </AnimatePresence>
            
            <AuthInput icon={<Mail className="w-4 h-4" />} placeholder="Encrypted Email" type="email" />
            <AuthInput icon={<Lock className="w-4 h-4" />} placeholder="Pass-Key" type="password" />
            
            <button 
              onClick={handleSubmit}
              className="w-full py-3 mt-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl type-ui text-sm font-bold tracking-widest hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all flex items-center justify-center gap-2 group text-white uppercase"
            >
              {isLogin ? "Decrypt & Enter" : "Authorize Manifestation"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center type-ui text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-[#0f0f13] px-4 text-white/30 rounded-full">Secure Layer Auth</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg glass-dark hover:bg-white/10 transition-colors border border-white/10 type-ui text-xs font-bold text-white/60">
                <Github className="w-4 h-4" /> Github
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg glass-dark hover:bg-white/10 transition-colors border border-white/10 type-ui text-xs font-bold text-white/60">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg> Google
              </button>
            </div>
          </div>

          <p className="mt-8 text-center type-ui text-[10px] uppercase font-bold tracking-widest text-white/40">
            {isLogin ? "First time in the cave?" : "Already part of the network?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-violet-400 hover:text-fuchsia-400 transition-colors underline underline-offset-4"
            >
              {isLogin ? "Request Manifestation" : "Access Console"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function AuthInput({ icon, placeholder, type }: { icon: React.ReactNode, placeholder: string, type: string }) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-violet-400 transition-colors">
        {icon}
      </div>
      <input 
        type={type} 
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 type-ui text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.08] transition-all placeholder:text-white/20 text-white"
      />
    </div>
  );
}
