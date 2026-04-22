import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Shell from "./components/layout/Shell";
import { ThemeProvider } from "./ThemeContext";

// Core Pages
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import CommunityDetail from "./pages/CommunityDetail";
import ThreadDetail from "./pages/ThreadDetail";
import Search from "./pages/Search";

// Identity Pages
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Auth from "./pages/Auth";

// Trust / Moderation Pages
import Guidelines from "./pages/Guidelines";
import Safety from "./pages/Safety";
import Admin from "./pages/Admin";

// Brand Pages
import About from "./pages/About";
import Vision from "./pages/Vision";
import Editorial from "./pages/Editorial";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="selection:bg-violet-500/30 selection:text-white">
          <Shell>
            <Routes>
              {/* Core Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/community/:id" element={<CommunityDetail />} />
              <Route path="/thread/:id" element={<ThreadDetail />} />
              <Route path="/search" element={<Search />} />

              {/* Identity Routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/register" element={<Auth mode="register" />} />

              {/* Trust / Safety Routes */}
              <Route path="/guidelines" element={<Guidelines />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/admin" element={<Admin />} />

              {/* Brand Routes */}
              <Route path="/about" element={<About />} />
              <Route path="/vision" element={<Vision />} />
              <Route path="/editorial" element={<Editorial />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Shell>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
