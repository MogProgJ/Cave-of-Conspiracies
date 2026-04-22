import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { 
  User, 
  Search, 
  Bell, 
  ShieldAlert, 
  Compass, 
  FileText,
  Hexagon
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  if (isAuthPage) return null;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-cave-void/80 backdrop-blur-xl">
      <div className="w-full max-w-[1500px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center font-bold text-white text-sm shadow-sm transition-transform duration-300">
            C
          </div>
          <span className="font-serif text-lg font-bold tracking-tighter italic leading-none group-hover:text-white/80 transition-colors">
            Cave of Conspiracies
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center space-x-1 h-full">
          {[
            { label: "Nexus", to: "/" },
            { label: "Explore", to: "/explore" },
            { label: "Signals", to: "/notifications" },
            { label: "Vault", to: "/admin" }
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `type-ui text-xs h-full flex items-center px-4 relative transition-colors ${
                  isActive ? "text-white font-semibold" : "text-white/40 hover:text-white/80 hover:bg-white/[0.02]"
                }`
              }
            >
              <span className="relative z-10">{item.label}</span>
              {location.pathname === item.to && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                />
              )}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link to="/search" className="w-9 h-9 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-colors">
            <Search className="w-4 h-4" />
          </Link>
          
          <div className="w-px h-4 bg-white/10 mx-2" />
          
          <NavLink 
            to="/notifications"
            className={({ isActive }) => 
              `w-9 h-9 flex items-center justify-center rounded-full relative transition-colors ${isActive ? "text-violet-400 bg-violet-500/10" : "text-white/40 hover:text-white hover:bg-white/5"}`
            }
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-violet-500 rounded-full border border-cave-void shadow-[0_0_5px_rgba(139,92,246,0.8)]" />
          </NavLink>
          
          <NavLink 
            to="/profile"
            className={({ isActive }) => 
              `w-8 h-8 ml-2 rounded-full border flex items-center justify-center overflow-hidden transition-all ${
                isActive ? "border-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.2)]" : "border-white/10 opacity-70 hover:opacity-100"
              }`
            }
          >
            <img src="https://picsum.photos/seed/archon/100/100" alt="Avatar" className="w-full h-full object-cover" />
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
