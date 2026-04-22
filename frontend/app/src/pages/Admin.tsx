import React from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Flag,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Lock,
  Unlock,
  Eye,
  Trash,
  RotateCcw,
  Filter,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  AdminReportItem,
  adminLogin,
  adminLogout,
  applyModeration,
  getAdminReports,
} from "../lib/api";

export default function Admin() {
  const { session, refreshSession } = useAuth();
  const [adminPassword, setAdminPassword] = React.useState("");
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [authLoading, setAuthLoading] = React.useState(false);
  const [reports, setReports] = React.useState<AdminReportItem[]>([]);
  const [statusFilter, setStatusFilter] = React.useState("open");
  const [loadingReports, setLoadingReports] = React.useState(false);
  const [reportError, setReportError] = React.useState<string | null>(null);
  const [actingId, setActingId] = React.useState<number | null>(null);

  const fetchReports = React.useCallback(async (status: string) => {
    setLoadingReports(true);
    const res = await getAdminReports(status);
    if (res.ok) {
      setReports(res.data.reports);
      setReportError(null);
    } else {
      setReportError(res.error);
    }
    setLoadingReports(false);
  }, []);

  React.useEffect(() => {
    if (session.is_admin) {
      void fetchReports(statusFilter);
    }
  }, [session.is_admin, statusFilter, fetchReports]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const res = await adminLogin({ password: adminPassword });
    if (!res.ok) {
      setAuthError(res.error);
      setAuthLoading(false);
      return;
    }
    setAuthError(null);
    setAdminPassword("");
    await refreshSession();
    setAuthLoading(false);
  };

  const handleAdminLogout = async () => {
    setAuthLoading(true);
    await adminLogout();
    await refreshSession();
    setReports([]);
    setAuthLoading(false);
  };

  const handleModerationAction = async (
    report: AdminReportItem,
    action: "hide" | "remove" | "restore" | "dismiss",
  ) => {
    setActingId(report.id);
    const res = await applyModeration({
      target_type: report.target_type,
      target_id: report.target_id,
      action,
      report_id: report.id,
      reason: `Admin action: ${action}`,
    });
    if (res.ok) {
      await fetchReports(statusFilter);
      setReportError(null);
    } else {
      setReportError(res.error);
    }
    setActingId(null);
  };

  const openCount = reports.filter((r) => r.status === "open").length;

  return (
    <div className="pt-24 pb-24 max-w-[1200px] mx-auto px-4 space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-violet-400" />
            </div>
            <h1 className="type-title text-2xl">Oracle Console</h1>
          </div>
          <p className="type-ui text-xs opacity-40">Backend-backed moderation and report actions</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-white/[0.02] px-4 py-2 rounded-lg flex items-center gap-3 border border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="type-ui text-xs font-semibold text-white/60">Session {session.is_admin ? "Admin" : "User"}</span>
          </div>
          {session.is_admin ? (
            <button
              onClick={handleAdminLogout}
              disabled={authLoading}
              className="bg-white/5 px-4 py-2 rounded-lg border border-white/10 type-ui text-xs font-semibold hover:bg-white/10 hover:border-white/20 transition-all text-white/80 disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-2"><Unlock className="w-3 h-3" /> Exit Admin</span>
            </button>
          ) : null}
        </div>
      </header>

      {!session.is_admin ? (
        <section className="max-w-lg glass-dark rounded-2xl p-8 border-white/10 space-y-5">
          <h2 className="type-title text-xl">Admin Authentication</h2>
          <p className="type-ui text-sm text-white/60">Enter the configured admin password to access moderation tools.</p>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <label className="block space-y-2">
              <span className="type-ui text-xs uppercase tracking-widest text-white/40">Admin Password</span>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 type-ui text-sm focus:border-violet-500/40 outline-none"
                  placeholder="Enter admin password"
                  required
                />
              </div>
            </label>
            {authError ? <p className="type-ui text-xs text-red-300">{authError}</p> : null}
            <button
              type="submit"
              disabled={authLoading}
              className="px-5 py-2.5 rounded-xl bg-white text-black type-ui text-sm font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-60"
            >
              {authLoading ? "Authorizing..." : "Enter Console"}
            </button>
          </form>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-violet-400" />
                <span className="type-ui text-xs uppercase tracking-widest text-white/50">Report Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 type-ui text-xs"
                >
                  <option value="open">open</option>
                  <option value="reviewed">reviewed</option>
                  <option value="dismissed">dismissed</option>
                  <option value="all">all</option>
                </select>
              </div>
              <button
                onClick={() => void fetchReports(statusFilter)}
                className="type-ui text-xs px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                Refresh
              </button>
            </div>

            {loadingReports ? (
              <div className="py-16 text-center type-ui text-sm text-white/50">Loading reports...</div>
            ) : reportError ? (
              <div className="py-16 text-center type-ui text-sm text-red-300">{reportError}</div>
            ) : reports.length === 0 ? (
              <div className="py-16 text-center type-ui text-sm text-white/50">No reports in this status.</div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <motion.div
                    layout
                    key={report.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border bg-white/[0.02] border-white/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="type-ui text-xs font-mono text-violet-400">Report #{report.id}</span>
                          <span className="type-ui text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-white/5 text-white/60">
                            {report.target_type} #{report.target_id}
                          </span>
                          <span className="type-ui text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-amber-500/15 text-amber-300">
                            {report.reason}
                          </span>
                          <span className="type-ui text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-violet-500/15 text-violet-300">
                            {report.status}
                          </span>
                        </div>
                        <p className="type-ui text-sm text-white/80 line-clamp-2">{report.target_body ?? "No content snapshot"}</p>
                        {report.note ? <p className="type-ui text-xs text-white/50">Reporter note: {report.note}</p> : null}
                        <p className="type-ui text-xs text-white/35">Created: {new Date(report.created_at).toLocaleString()}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => void handleModerationAction(report, "hide")}
                          disabled={actingId === report.id}
                          title="Hide"
                          className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg hover:bg-amber-500/20 text-white/40 hover:text-amber-300 transition-all disabled:opacity-50"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => void handleModerationAction(report, "remove")}
                          disabled={actingId === report.id}
                          title="Remove"
                          className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-300 transition-all disabled:opacity-50"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => void handleModerationAction(report, "restore")}
                          disabled={actingId === report.id}
                          title="Restore"
                          className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg hover:bg-emerald-500/20 text-white/40 hover:text-emerald-300 transition-all disabled:opacity-50"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => void handleModerationAction(report, "dismiss")}
                          disabled={actingId === report.id}
                          title="Dismiss Report"
                          className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg hover:bg-white/20 text-white/40 hover:text-white transition-all disabled:opacity-50"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <section className="lg:col-span-4 space-y-6">
            <div className="glass-dark rounded-2xl p-6 border-white/5 space-y-5">
              <h3 className="type-title text-lg border-b border-white/5 pb-4">Moderation Snapshot</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="type-ui text-sm text-white/60">Loaded Reports</span>
                  <span className="type-title text-xl">{reports.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="type-ui text-sm text-white/60">Open in View</span>
                  <span className="type-title text-xl">{openCount}</span>
                </div>
              </div>
            </div>

            <div className="glass-dark rounded-2xl p-6 border-white/5 space-y-4">
              <h3 className="type-title text-lg border-b border-white/5 pb-4">Action Legend</h3>
              <div className="space-y-3 type-ui text-sm text-white/70">
                <p className="flex items-center gap-2"><Eye className="w-4 h-4 text-amber-300" /> Hide: set content status to hidden</p>
                <p className="flex items-center gap-2"><Flag className="w-4 h-4 text-red-300" /> Remove: set content status to removed</p>
                <p className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-300" /> Restore: set content status to visible</p>
                <p className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-white/70" /> Dismiss: close report only</p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
