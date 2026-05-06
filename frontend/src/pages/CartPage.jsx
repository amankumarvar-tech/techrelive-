import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, clearCart } from "../store/slices/cartSlice";
import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, ArrowRight, PackageOpen } from "lucide-react";

export default function CartPage() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.cart.items);
  const total = items.reduce((sum, i) => sum + i.price, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart size={22} className="text-brand-400" />
        <h1 className="font-display font-bold text-2xl">Your Cart</h1>
        <span className="badge bg-brand-500/15 text-brand-400 border-brand-500/20">{items?.length || 0} items</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 card">
          <PackageOpen size={40} className="text-white/20 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-white/50 mb-2">Your cart is empty</h3>
          <p className="text-white/30 text-sm mb-6">Browse listings and add some gadgets!</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            Browse Listings <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="card p-4 flex items-center gap-4">
              <Link to={`/products/${item._id}`} className="w-14 h-14 rounded-xl overflow-hidden bg-dark-600 shrink-0 hover:opacity-80 transition-opacity">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item._id}`} className="font-display font-semibold text-sm hover:text-brand-400 transition-colors line-clamp-1">
                  {item.title}
                </Link>
                <p className="text-white/40 text-xs mt-0.5 font-mono">
                  {item.category} · Grade {item.condition}
                </p>
              </div>
              <p className="font-display font-bold text-lg shrink-0">₹{item.price.toLocaleString("en-IN")}</p>
              <button
                onClick={() => dispatch(removeFromCart(item._id))}
                className="text-white/20 hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <div className="card p-5 mt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-semibold text-white/70">Total</span>
              <span className="font-display font-black text-2xl">₹{total.toLocaleString("en-IN")}</span>
            </div>
            <p className="text-white/30 text-xs mb-4 font-mono">
              * Each item is a unique second-hand listing. Orders are placed per item.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => dispatch(clearCart())}
                className="btn-outline text-sm flex items-center gap-2 text-red-400 border-red-500/20 hover:border-red-500/40"
              >
                <Trash2 size={14} /> Clear Cart
              </button>
              <button className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
                Proceed to Checkout <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
