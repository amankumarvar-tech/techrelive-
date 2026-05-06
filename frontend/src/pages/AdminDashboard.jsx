import { useState, useEffect } from "react";
import { Shield, CheckCircle2, XCircle, Users, Package, BarChart3, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../utils/api";

export default function AdminDashboard() {
  const [tab, setTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState({});
  const [msg, setMsg] = useState("");

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(""), 3000); };

  useEffect(() => {
    const loadAll = async () => {
      const [p, s, u] = await Promise.all([
        api.get("/admin/products/pending"),
        api.get("/admin/stats"),
        api.get("/admin/users"),
      ]);
      setPending(p.data.products);
      setStats(s.data.stats);
      setUsers(u.data.users);
      setLoading(false);
    };
    loadAll();
  }, []);

  const approve = async (id) => {
    await api.put(`/admin/products/${id}/approve`, { note: note[id] || "" });
    setPending((prev) => prev.filter((p) => p._id !== id));
    flash("✅ Listing approved!");
  };

  const reject = async (id) => {
    const reason = note[id] || prompt("Reason for rejection (optional):");
    await api.put(`/admin/products/${id}/reject`, { note: reason || "" });
    setPending((prev) => prev.filter((p) => p._id !== id));
    flash("❌ Listing rejected.");
  };

  const verifySeller = async (id) => {
    await api.put(`/admin/users/${id}/verify-seller`);
    setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isVerified: true } : u));
    flash("✅ Seller verified!");
  };

  const TABS = [
    { key: "pending", label: "Pending Approvals", icon: Package, count: pending?.length || 0 },
    { key: "stats", label: "Stats", icon: BarChart3 },
    { key: "users", label: "Users", icon: Users, count: users?.length || 0 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-amber-400" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl">Admin Panel</h1>
          <p className="text-white/40 text-sm">Manage listings and users</p>
        </div>
      </div>

      {msg && (
        <div className="mb-6 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl">{msg}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/5 pb-0">
        {TABS.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-display font-semibold border-b-2 transition-colors -mb-px ${tab === key ? "border-brand-500 text-brand-400" : "border-transparent text-white/40 hover:text-white"
              }`}
          >
            <Icon size={15} />
            {label}
            {count !== undefined && (
              <span className={`badge text-xs ${tab === key ? "bg-brand-500/20 text-brand-400" : "bg-white/10 text-white/40"}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="card h-24 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Pending Approvals */}
          {tab === "pending" && (
            <div className="space-y-4">
              {pending.length === 0 ? (
                <div className="text-center py-16 card">
                  <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">All caught up! No pending listings.</p>
                </div>
              ) : pending.map((p) => (
                <div key={p._id} className="card p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-dark-600 shrink-0">
                      {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-display font-semibold text-sm">{p.title}</h3>
                          <p className="text-white/40 text-xs mt-0.5 font-mono">
                            ₹{p.price?.toLocaleString("en-IN")} · Grade {p.condition} · {p.category}
                          </p>
                          <p className="text-white/30 text-xs mt-0.5">
                            Seller: {p.seller?.name} ({p.seller?.email})
                          </p>
                        </div>
                        <Link to={`/products/${p._id}`} className="text-white/30 hover:text-white transition-colors shrink-0">
                          <Eye size={15} />
                        </Link>
                      </div>
                      <p className="text-white/40 text-xs mt-2 line-clamp-2">{p.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
                    <input
                      type="text"
                      placeholder="Optional note to seller..."
                      value={note[p._id] || ""}
                      onChange={(e) => setNote((n) => ({ ...n, [p._id]: e.target.value }))}
                      className="input py-1.5 text-xs flex-1"
                    />
                    <button onClick={() => approve(p._id)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all duration-200">
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button onClick={() => reject(p._id)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200">
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {tab === "stats" && stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: stats.totalUsers, color: "text-white" },
                { label: "All Products", value: stats.totalProducts, color: "text-sky-400" },
                { label: "Pending", value: stats.pendingProducts, color: "text-amber-400" },
                { label: "Live Listings", value: stats.approvedProducts, color: "text-emerald-400" },
              ].map((s) => (
                <div key={s.label} className="card p-6 text-center">
                  <p className={`font-display font-black text-4xl ${s.color}`}>{s.value}</p>
                  <p className="text-white/30 text-xs font-mono mt-2">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Users */}
          {tab === "users" && (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u._id} className="card p-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-display font-bold text-sm shrink-0">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm">{u.name}</p>
                    <p className="text-white/30 text-xs font-mono">{u.email}</p>
                  </div>
                  <span className={`badge ${u.role === "admin" ? "bg-amber-500/15 text-amber-400 border-amber-500/20" : u.role === "seller" ? "bg-sky-500/15 text-sky-400 border-sky-500/20" : "bg-white/5 text-white/40 border-white/10"}`}>
                    {u.role}
                  </span>
                  {u.role === "seller" && !u.isVerified && (
                    <button
                      onClick={() => verifySeller(u._id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all duration-200"
                    >
                      Verify Seller
                    </button>
                  )}
                  {u.isVerified && (
                    <span className="badge bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      <CheckCircle2 size={11} /> Verified
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
