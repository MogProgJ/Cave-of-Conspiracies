import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../ThemeContext";
import {
  User,
  Lock,
  Bell,
  Eye,
  Shield,
  Monitor,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
} from "lucide-react";
import {
  changeMyPassword,
  getProfileSettings,
  ProfileSettings,
  updateProfileSettings,
} from "../lib/api";

export default function Settings() {
  const [activeTab, setActiveTab] = React.useState("identity");
  const { theme, setTheme, density, setDensity, effects, setEffects } = useTheme();

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "Direct Resonances": true,
    "Proxy Breach Warnings": true,
    "Thread Anomalies": false,
    "Network Datarate": false,
  });

  const TABS = [
    { id: "identity", label: "Identity", icon: <User className="w-4 h-4" /> },
    { id: "security", label: "Protection", icon: <Shield className="w-4 h-4" /> },
    { id: "notifications", label: "Signals", icon: <Bell className="w-4 h-4" /> },
    { id: "display", label: "Aesthetic", icon: <Monitor className="w-4 h-4" /> },
    { id: "privacy", label: "Shadows", icon: <Eye className="w-4 h-4" /> },
  ];

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  const [isSavingIdentity, setIsSavingIdentity] = useState(false);
  const [identitySaved, setIdentitySaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  React.useEffect(() => {
    const run = async () => {
      setSettingsLoading(true);
      const res = await getProfileSettings();
      if (res.ok) {
        setProfileSettings(res.data);
        setDisplayName(res.data.display_name);
        setBio(res.data.bio ?? "");
        setSettingsError(null);
      } else {
        setSettingsError(res.error);
      }
      setSettingsLoading(false);
    };
    void run();
  }, []);

  const handleToggle = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveIdentity = async () => {
    setIsSavingIdentity(true);
    setIdentitySaved(false);
    const res = await updateProfileSettings({
      display_name: displayName,
      bio,
    });
    if (res.ok) {
      setProfileSettings(res.data);
      setIdentitySaved(true);
      setTimeout(() => setIdentitySaved(false), 2000);
      setSettingsError(null);
    } else {
      setSettingsError(res.error);
    }
    setIsSavingIdentity(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordSaved(false);
    setPasswordError(null);

    const res = await changeMyPassword({
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });

    if (res.ok) {
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setTimeout(() => setPasswordSaved(false), 2000);
    } else {
      setPasswordError(res.error);
    }

    setPasswordSaving(false);
  };

  return (
    <div className="pt-24 pb-24 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
        <aside className="md:w-56 flex-shrink-0">
          <h1 className="type-title text-2xl mb-6 pl-4">Settings</h1>
          <div className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl type-ui text-sm font-medium transition-all ${
                  activeTab === tab.id ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 space-y-6">
          <div className="glass-dark rounded-2xl p-6 md:p-8 border-transparent hover:border-white/5 transition-all min-h-[500px]">
            {settingsLoading ? (
              <div className="py-24 text-center type-ui text-sm text-white/50">Loading settings...</div>
            ) : settingsError ? (
              <div className="py-24 text-center type-ui text-sm text-red-300">{settingsError}</div>
            ) : null}

            {activeTab === "identity" && !settingsLoading && profileSettings && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <section className="space-y-6">
                  <h2 className="type-title">Signal Identity</h2>
                  <div className="p-6 border border-white/5 rounded-2xl bg-white/[0.02] space-y-2">
                    <div className="type-ui text-xs font-semibold text-white/50">Account Email</div>
                    <div className="type-ui text-sm text-white/80">{profileSettings.email}</div>
                    <div className="type-ui text-xs text-white/40">Joined {new Date(profileSettings.created_at).toLocaleDateString()}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="type-ui text-xs font-semibold text-white/50 pl-2">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 type-ui text-sm focus:border-violet-500/30 transition-all outline-none text-white focus:bg-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="type-ui text-xs font-semibold text-white/50 pl-2">Role</label>
                      <div className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 type-ui text-sm text-white/60">
                        {profileSettings.role}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="type-ui text-xs font-semibold text-white/50 pl-2">Public Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 type-ui text-sm focus:border-violet-500/30 transition-all outline-none min-h-[100px] resize-none text-white focus:bg-white/10"
                    />
                  </div>
                </section>

                <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-4">
                  <AnimatePresence>
                    {identitySaved && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-emerald-400 type-ui text-xs font-semibold"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Saved
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    onClick={() => void handleSaveIdentity()}
                    disabled={isSavingIdentity}
                    className={`px-6 py-2.5 rounded-full type-ui font-bold transition-all text-sm w-40 flex items-center justify-center ${
                      isSavingIdentity ? "bg-white/10 text-white/50 cursor-wait" : "bg-white text-black hover:bg-neutral-200"
                    }`}
                  >
                    {isSavingIdentity ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <CircleDashed className="w-5 h-5 mx-auto" />
                      </motion.div>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <section className="space-y-6">
                  <h2 className="type-title">Password Security</h2>
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                    <div className="space-y-2">
                      <label className="type-ui text-xs font-semibold text-white/50 pl-2">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 type-ui text-sm focus:border-violet-500/30 outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="type-ui text-xs font-semibold text-white/50 pl-2">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 type-ui text-sm focus:border-violet-500/30 outline-none"
                        minLength={8}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="type-ui text-xs font-semibold text-white/50 pl-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={newPasswordConfirm}
                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 type-ui text-sm focus:border-violet-500/30 outline-none"
                        minLength={8}
                        required
                      />
                    </div>
                    {passwordError ? <p className="type-ui text-xs text-red-300">{passwordError}</p> : null}
                    {passwordSaved ? <p className="type-ui text-xs text-emerald-300">Password updated.</p> : null}
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="px-5 py-2.5 rounded-xl bg-white text-black type-ui text-sm font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-60"
                    >
                      {passwordSaving ? "Updating..." : "Change Password"}
                    </button>
                  </form>
                </section>

                <section className="space-y-2">
                  {[
                    { title: "Two-Factor Signal", desc: "Authorize entry via secondary node.", value: "Planned", icon: <Smartphone /> },
                    { title: "Shadow Mode", desc: "Hide active status from local grid.", value: "Restricted", icon: <Eye /> },
                    { title: "Session Device List", desc: "Review active devices and tokens.", value: "Planned", icon: <Lock /> },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:bg-white/[0.04] transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 opacity-80">
                          {item.icon}
                        </div>
                        <div>
                          <div className="type-ui text-sm font-semibold">{item.title}</div>
                          <div className="type-ui text-xs text-white/40 mt-0.5">{item.desc}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="type-ui text-xs font-bold text-white/50">{item.value}</span>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                      </div>
                    </div>
                  ))}
                </section>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <section className="space-y-6">
                  <div>
                    <h2 className="type-title">Signal Protocols</h2>
                    <p className="type-ui text-sm text-white/50 mt-2 max-w-lg">
                      Determine which anomalies trigger grid alerts.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { title: "Direct Resonances", desc: "Alerts when your node is explicitly tagged." },
                      { title: "Thread Anomalies", desc: "Spikes in activity around tracked subjects." },
                      { title: "Proxy Breach Warnings", desc: "Immediate visual ping on failed handshakes." },
                      { title: "Network Datarate", desc: "Weekly drops of high-value aggregated signals." },
                    ].map((item, i) => (
                      <div
                        key={i}
                        onClick={() => handleToggle(item.title)}
                        className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="type-ui text-sm font-semibold">{item.title}</div>
                          <div className="type-ui text-xs text-white/40 mt-0.5">{item.desc}</div>
                        </div>
                        <div className={`relative w-11 h-6 rounded-full transition-colors ${toggles[item.title] ? "bg-violet-500" : "bg-white/10"}`}>
                          <div className={`absolute top-1 bottom-1 w-4 rounded-full bg-white transition-transform ${toggles[item.title] ? "translate-x-[22px]" : "translate-x-1"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "display" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <section>
                  <div>
                    <h2 className="type-title">Appearance Engine</h2>
                    <p className="type-ui text-sm text-white/50 mt-2 max-w-lg">Configure theme, density, and effects.</p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="type-ui text-xs font-bold uppercase tracking-widest text-[#808090]">Theme Protocol</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: "void", name: "Void", desc: "Original dark violet signature" },
                      { id: "slate", name: "Slate", desc: "Neutral quiet monochrome" },
                      { id: "obsidian", name: "Obsidian", desc: "Cold modern deep blues" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id as "void" | "slate" | "obsidian")}
                        className={`text-left p-4 rounded-xl transition-all border ${
                          theme === t.id
                            ? "bg-violet-500/10 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                            : "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="type-ui font-semibold text-white/90">{t.name}</div>
                          {theme === t.id && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                        </div>
                        <div className="type-ui text-[10px] text-white/40 leading-relaxed">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="type-ui text-xs font-bold uppercase tracking-widest text-[#808090]">Structural Density</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setDensity("comfortable")}
                      className={`p-4 rounded-xl transition-all border ${
                        density === "comfortable" ? "bg-violet-500/10 border-violet-500/50" : "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="type-ui text-sm font-semibold text-white/90 text-left">Comfortable</div>
                    </button>
                    <button
                      onClick={() => setDensity("compact")}
                      className={`p-4 rounded-xl transition-all border ${
                        density === "compact" ? "bg-violet-500/10 border-violet-500/50" : "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="type-ui text-sm font-semibold text-white/90 text-left">Compact</div>
                    </button>
                  </div>
                </section>

                <section className="space-y-2">
                  <button
                    onClick={() => setEffects("standard")}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${
                      effects === "standard" ? "border-violet-500/50 bg-violet-500/10" : "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="type-ui text-sm font-semibold">Standard Effects</div>
                  </button>
                  <button
                    onClick={() => setEffects("reduced")}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${
                      effects === "reduced" ? "border-violet-500/50 bg-violet-500/10" : "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="type-ui text-sm font-semibold">Reduced Overhead</div>
                  </button>
                </section>
              </motion.div>
            )}

            {activeTab === "privacy" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center py-20 min-h-[400px]">
                <div className="w-16 h-16 rounded-full glass border-white/10 flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 rounded-full border border-fuchsia-500/30 animate-[ping_3s_ease-in-out_infinite]" />
                  <Lock className="w-6 h-6 text-fuchsia-400 opacity-80" />
                </div>
                <h2 className="type-title mb-3">The Shadows are Sealed</h2>
                <p className="type-ui text-sm text-white/50 max-w-md mx-auto leading-relaxed">
                  Total network obscurity requires higher clearance and is not yet backend-configurable.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
