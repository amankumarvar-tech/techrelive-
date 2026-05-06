import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../../store/slices/cartSlice";
import { ShoppingCart, Eye, CheckCircle, Trash2 } from "lucide-react";

const CONDITION_BADGE = {
  A: "badge-A",
  B: "badge-B",
  C: "badge-C",
};
const CONDITION_LABEL = { A: "Like New", B: "Good", C: "Fair" };

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const inCart = useSelector((s) => s.cart.items.some((i) => i._id === product._id));

  const handleCart = (e) => {
    e.preventDefault();
    inCart ? dispatch(removeFromCart(product._id)) : dispatch(addToCart(product));
  };

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/products/${product._id}`} className="card group flex flex-col hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-dark-600">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10">
            <span className="font-display text-5xl">📱</span>
          </div>
        )}
        {/* Condition badge */}
        <span className={`absolute top-2.5 left-2.5 ${CONDITION_BADGE[product.condition]}`}>
          Grade {product.condition} · {CONDITION_LABEL[product.condition]}
        </span>
        {discount > 0 && (
          <span className="absolute top-2.5 right-2.5 badge bg-brand-500/90 text-white">
            -{discount}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-white/40 text-xs font-mono mb-1">{product.category}</p>
          <h3 className="font-display font-semibold text-sm leading-snug line-clamp-2 group-hover:text-brand-400 transition-colors">
            {product.title}
          </h3>
        </div>

        <div className="flex items-end gap-2 mt-auto pt-2">
          <span className="font-display font-bold text-xl text-white">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-white/30 text-xs line-through font-mono">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-white/30 text-xs flex items-center gap-1">
            <Eye size={11} /> {product.views ?? 0}
          </span>
          <button
            onClick={handleCart}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
              inCart
                ? "bg-emerald-500/15 text-emerald-400 hover:bg-red-500/15 hover:text-red-400"
                : "bg-brand-500/15 text-brand-400 hover:bg-brand-500 hover:text-white"
            }`}
          >
            {inCart ? <><CheckCircle size={13} /> Added</> : <><ShoppingCart size={13} /> Add</>}
          </button>
        </div>
      </div>
    </Link>
  );
}
