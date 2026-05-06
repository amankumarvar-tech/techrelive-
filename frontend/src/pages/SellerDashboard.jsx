import { useState, useEffect } from "react";
import { Plus, Package, Clock, CheckCircle2, XCircle, Pencil, Trash2, Upload } from "lucide-react";
import api from "../utils/api";

const CATEGORIES = ["Mobile", "Laptop", "Tablet", "Accessories", "Camera", "Audio", "Gaming", "Other"];
const CONDITIONS = [
  { value: "A", label: "Grade A – Like New" },
  { value: "B", label: "Grade B – Good" },
  { value: "C", label: "Grade C – Fair" },
];

const STATUS_STYLES = {
  pending:  { color: "text-amber-400",  bg: "bg-amber-500/10  border-amber-500/20",  icon: Clock         },
  approved: { color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/20",icon: CheckCircle2  },
  rejected: { color: "text-red-400",   bg: "bg-red-500/10    border-red-500/20",    icon: XCircle       },
  sold:     { color: "text-sky-400",   bg: "bg-sky-500/10    border-sky-500/20",    icon: Package       },
};

const EMPTY_FORM = {
  title: "", description: "", price: "", originalPrice: "",
  category: "Mobile", condition: "B", brand: "", model: "",
  images: [], location: { city: "", state: "" },
};

export default function SellerDashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const fetchListings = async () => {
    try {
      const { data } = await api.get("/products/seller/my-listings");
      setListings(data.products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const flash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await api.put(`/products/${editId}`, form);
        flash("success", "Listing updated and re-submitted for approval.");
      } else {
        await api.post("/products", form);
        flash("success", "Listing submitted for admin approval!");
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditId(null);
      fetchListings();
    } catch (err) {
      flash("error", err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (p) => {
    setForm({ ...p, price: String(p.price), originalPrice: String(p.originalPrice || "") });
    setEditId(p._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this listing?")) return;
    await api.delete(`/products/${id}`);
    flash("success", "Listing deleted.");
    fetchListings();
  };

  const stats = {
    total: listings.length,
    pending: listings.filter((l) => l.status === "pending").length,
    approved: listings.filter((l) => l.status === "approved").length,
    sold: listings.filter((l) => l.status === "sold").length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl">Seller Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Manage your gadget listings</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(EMPTY_FORM); }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> {showForm ? "Cancel" : "New Listing"}
        </button>
      </div>

      {/* Flash message */}
      {msg.text && (
        <div className={`mb-6 px-4 py-3 rounded-xl border text-sm ${
          msg.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {msg.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Pending", value: stats.pending, color: "text-amber-400" },
          { label: "Approved", value: stats.approved, color: "text-emerald-400" },
          { label: "Sold", value: stats.sold, color: "text-sky-400" },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`font-display font-bold text-3xl ${s.color}`}>{s.value}</p>
            <p className="text-white/40 text-xs font-mono mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-8 space-y-5">
          <h2 className="font-display font-semibold text-lg border-b border-white/10 pb-3">
            {editId ? "Edit Listing" : "Post a Gadget"}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-white/60 mb-1.5 font-display">Title *</label>
              <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. iPhone 14 Pro Max 256GB Space Black" className="input" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5 font-display">Category *</label>
              <select required value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5 font-display">Condition *</label>
              <select required value={form.condition} onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))} className="input">
                {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5 font-display">Selling Price (₹) *</label>
              <input required type="number" min="1" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="12000" className="input" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5 font-display">Original MRP (₹)</label>
              <input type="number" min="0" value={form.originalPrice} onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
                placeholder="65000" className="input" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5 font-display">Brand</label>
              <input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                placeholder="Apple" className="input" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5 font-display">Model</label>
              <input value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                placeholder="iPhone 14 Pro Max" className="input" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5 font-display">City</label>
              <input value={form.location.city} onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, city: e.target.value } }))}
                placeholder="Mumbai" className="input" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5 font-display">State</label>
              <input value={form.location.state} onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, state: e.target.value } }))}
                placeholder="Maharashtra" className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-white/60 mb-1.5 font-display">Image URLs (comma-separated)</label>
              <input
                value={form.images?.join(", ") || ""}
                onChange={(e) => setForm((f) => ({ ...f, images: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
                placeholder="https://example.com/img1.jpg, https://..."
                className="input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-white/60 mb-1.5 font-display">Description *</label>
              <textarea required rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the condition, any accessories included, reason for selling..." className="input resize-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              <Upload size={15} /> {submitting ? "Submitting..." : editId ? "Update Listing" : "Submit for Review"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-outline">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Listings table */}
      <div className="space-y-3">
        <h2 className="font-display font-semibold text-base text-white/70">My Listings</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-20 animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 card">
            <Package size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No listings yet. Post your first gadget!</p>
          </div>
        ) : (
          listings.map((p) => {
            const S = STATUS_STYLES[p.status] || STATUS_STYLES.pending;
            const Icon = S.icon;
            return (
              <div key={p._id} className="card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-dark-600 shrink-0">
                  {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm truncate">{p.title}</p>
                  <p className="text-white/40 text-xs font-mono mt-0.5">
                    ₹{p.price.toLocaleString("en-IN")} · Grade {p.condition} · {p.category}
                  </p>
                </div>
                <div className={`flex items-center gap-1.5 badge ${S.bg} ${S.color}`}>
                  <Icon size={12} /> {p.status}
                </div>
                {p.status !== "sold" && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleEdit(p)} className="text-white/30 hover:text-brand-400 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="text-white/30 hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
