import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../store/slices/cartSlice";
import {
  ShoppingCart, CheckCircle, ArrowLeft, Eye, MapPin,
  Shield, Star, ChevronLeft, ChevronRight, Share2
} from "lucide-react";
import api from "../utils/api";

const CONDITION_INFO = {
  A: { label: "Like New", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", desc: "Minimal signs of use. All original accessories may be included." },
  B: { label: "Good", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20", desc: "Light scratches or minor wear. Fully functional." },
  C: { label: "Fair", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", desc: "Visible wear and cosmetic damage. Works properly." },
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inCart = useSelector((s) => s.cart.items.some((i) => i._id === id));

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .catch(() => setError("Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-dark-700 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-6 bg-dark-700 rounded w-1/3" />
          <div className="h-8 bg-dark-700 rounded w-3/4" />
          <div className="h-10 bg-dark-700 rounded w-1/2" />
          <div className="h-4 bg-dark-700 rounded" />
          <div className="h-4 bg-dark-700 rounded w-4/5" />
        </div>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="text-center py-32">
      <p className="text-white/40 mb-4">{error || "Product not found"}</p>
      <button onClick={() => navigate(-1)} className="btn-outline text-sm">Go Back</button>
    </div>
  );

  const cond = CONDITION_INFO[product.condition] || CONDITION_INFO.C;
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const images = product.images?.length ? product.images : [""];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to listings
      </button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-dark-700 border border-white/5">
            {images[imgIndex] ? (
              <img src={images[imgIndex]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">📱</div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIndex ? "border-brand-500" : "border-white/10 hover:border-white/30"
                    }`}
                >
                  {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : null}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-white/40 text-xs font-mono mb-1">{product.category} · {product.brand}</p>
            <h1 className="font-display font-bold text-2xl md:text-3xl leading-tight mb-3">{product.title}</h1>

            {/* Condition badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm ${cond.bg}`}>
              <Shield size={14} className={cond.color} />
              <span className={`font-semibold font-mono ${cond.color}`}>Grade {product.condition}</span>
              <span className="text-white/50">·</span>
              <span className="text-white/60">{cond.label}</span>
            </div>
            <p className="text-white/40 text-xs mt-1.5 pl-1">{cond.desc}</p>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="font-display font-black text-4xl">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {discount > 0 && (
              <>
                <span className="text-white/30 text-lg line-through font-mono">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
                <span className="badge bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-white/40">
            <span className="flex items-center gap-1.5"><Eye size={14} /> {product.views} views</span>
            {product.location?.city && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} /> {product.location.city}, {product.location.state}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="bg-dark-700 rounded-2xl p-4 border border-white/5">
            <h3 className="font-display font-semibold text-sm mb-2 text-white/70">Description</h3>
            <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {/* Specs */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="bg-dark-700 rounded-2xl p-4 border border-white/5">
              <h3 className="font-display font-semibold text-sm mb-3 text-white/70">Specifications</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                {Object.entries(product.specifications).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-white/30 text-xs font-mono capitalize">{k}</dt>
                    <dd className="text-white/80 text-sm">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {/* Seller */}
          {product.seller && (
            <div className="flex items-center gap-3 p-4 bg-dark-700 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-display font-bold text-sm">
                {product.seller.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-display font-semibold text-sm">{product.seller.sellerProfile?.storeName || product.seller.name}</p>
                {product.seller.sellerProfile?.rating > 0 && (
                  <p className="text-yellow-400 text-xs flex items-center gap-1">
                    <Star size={11} fill="currentColor" /> {product.seller.sellerProfile.rating.toFixed(1)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => inCart ? dispatch(removeFromCart(product._id)) : dispatch(addToCart(product))}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold transition-all duration-200 active:scale-95 ${inCart
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                : "btn-primary"
                }`}
            >
              {inCart ? <><CheckCircle size={18} /> Added to Cart</> : <><ShoppingCart size={18} /> Add to Cart</>}
            </button>
            <button
              onClick={() => navigator.share?.({ title: product.title, url: window.location.href })}
              className="btn-outline w-12 flex items-center justify-center"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
