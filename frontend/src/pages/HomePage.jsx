import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Zap, ArrowRight, RefreshCw } from "lucide-react";
import api from "../utils/api";
import ProductCard from "../components/common/ProductCard";

const CATEGORIES = ["All", "Mobile", "Laptop", "Tablet", "Accessories", "Camera", "Audio", "Gaming"];
const CONDITIONS = [
  { value: "", label: "Any Condition" },
  { value: "A", label: "Grade A – Like New" },
  { value: "B", label: "Grade B – Good" },
  { value: "C", label: "Grade C – Fair" },
];
const SORTS = [
  { value: "-createdAt", label: "Newest First" },
  { value: "price", label: "Price: Low → High" },
  { value: "-price", label: "Price: High → Low" },
  { value: "-views", label: "Most Viewed" },
];

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    condition: "",
    sort: "-createdAt",
    search: searchParams.get("search") || "",
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category && filters.category !== "All") params.set("category", filters.category);
      if (filters.condition) params.set("condition", filters.condition);
      if (filters.search) params.set("search", filters.search);
      params.set("sort", filters.sort);
      params.set("page", page);
      params.set("limit", 12);

      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Sync URL search param
  useEffect(() => {
    const s = searchParams.get("search");
    const c = searchParams.get("category");
    if (s || c) setFilters((f) => ({ ...f, search: s || f.search, category: c || f.category }));
  }, []);

  const updateFilter = (key, val) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: val }));
  };

  const reset = () => {
    setFilters({ category: "", condition: "", sort: "-createdAt", search: "" });
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero strip */}
      <section className="relative rounded-3xl overflow-hidden mb-12 bg-gradient-to-br from-dark-700 via-dark-600 to-dark-700 border border-white/5 p-8 md:p-12">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/20 text-brand-400 text-xs font-mono px-3 py-1.5 rounded-full mb-4">
            <Zap size={12} fill="currentColor" /> Verified Listings · Condition-Graded
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl leading-tight mb-4">
            Give Tech a<br />
            <span className="text-brand-400">Second Life.</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed mb-6">
            Browse quality second-hand gadgets — every listing graded A, B, or C so you know exactly what you're getting.
          </p>
          <a href="#listings" className="btn-primary inline-flex items-center gap-2">
            Browse Listings <ArrowRight size={16} />
          </a>
        </div>
        {/* Decorative circles */}
        <div className="absolute right-8 top-8 w-48 h-48 rounded-full border border-brand-500/10 hidden md:block" />
        <div className="absolute right-16 top-16 w-32 h-32 rounded-full border border-brand-500/10 hidden md:block" />
        <div className="absolute right-24 top-24 w-16 h-16 rounded-full bg-brand-500/10 hidden md:block" />
      </section>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => updateFilter("category", cat === "All" ? "" : cat)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-display font-semibold transition-all duration-200 ${
              (filters.category === cat || (cat === "All" && !filters.category))
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                : "bg-dark-700 text-white/50 hover:text-white hover:bg-dark-600 border border-white/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8" id="listings">
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <SlidersHorizontal size={14} />
          <span className="font-display">Filters</span>
        </div>

        <select
          value={filters.condition}
          onChange={(e) => updateFilter("condition", e.target.value)}
          className="input py-2 text-sm w-auto min-w-[180px]"
        >
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="input py-2 text-sm w-auto min-w-[160px]"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {(filters.category || filters.condition || filters.search) && (
          <button onClick={reset} className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors">
            <RefreshCw size={13} /> Reset
          </button>
        )}

        <span className="ml-auto text-white/30 text-xs font-mono">{total} listings</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[4/3] bg-dark-600" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-dark-500 rounded w-1/3" />
                <div className="h-4 bg-dark-500 rounded w-3/4" />
                <div className="h-6 bg-dark-500 rounded w-1/2 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="font-display font-semibold text-white/60 mb-2">No listings found</h3>
          <p className="text-white/30 text-sm">Try adjusting your filters or search term</p>
          <button onClick={reset} className="btn-outline mt-4 text-sm">Clear filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p, i) => (
              <div key={p._id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-outline text-sm py-2 disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-white/40 text-sm font-mono px-4">
                {page} / {pages}
              </span>
              <button
                disabled={page === pages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-outline text-sm py-2 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
