import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import {
  Zap, ShoppingCart, LogOut, LayoutDashboard,
  Shield, Search, Menu, X
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const cartCount = useSelector((s) => s.cart.items?.length || 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-dark-800/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              Tech<span className="text-brand-400">Relive</span>
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search mobiles, laptops, accessories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 py-2 text-sm"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/" className="text-white/60 hover:text-white text-sm font-medium px-3 py-2 transition-colors">
              Browse
            </Link>

            {user?.role === "seller" || user?.role === "admin" ? (
              <Link to="/seller/dashboard" className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-medium px-3 py-2 transition-colors">
                <LayoutDashboard size={15} /> Dashboard
              </Link>
            ) : null}

            {user?.role === "admin" && (
              <Link to="/admin" className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-sm font-medium px-3 py-2 transition-colors">
                <Shield size={15} /> Admin
              </Link>
            )}

            <Link to="/cart" className="relative btn-outline flex items-center gap-2 text-sm py-2">
              <ShoppingCart size={16} />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-sm hidden lg:block">{user.name.split(" ")[0]}</span>
                <button onClick={handleLogout} className="btn-outline flex items-center gap-1.5 text-sm py-2">
                  <LogOut size={15} /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-outline text-sm py-2">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Sign Up</Link>
              </>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white/60 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-white/5 pt-4">
            <form onSubmit={handleSearch} className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 py-2 text-sm"
              />
            </form>
            <Link to="/" className="block px-3 py-2 text-white/70 hover:text-white text-sm" onClick={() => setMobileOpen(false)}>Browse</Link>
            <Link to="/cart" className="block px-3 py-2 text-white/70 hover:text-white text-sm" onClick={() => setMobileOpen(false)}>Cart ({cartCount})</Link>
            {user ? (
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 text-white/70 hover:text-white text-sm">
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-white/70 hover:text-white text-sm" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className="block px-3 py-2 text-brand-400 font-semibold text-sm" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
