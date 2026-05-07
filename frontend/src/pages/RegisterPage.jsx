import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "../store/slices/authSlice";
import { Zap, Eye, EyeOff, AlertCircle, User, ShoppingBag } from "lucide-react";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token, authReady } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "buyer" });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (authReady && token) navigate("/");
    return () => dispatch(clearError());
  }, [authReady, token, navigate, dispatch]);

  const submit = (e) => {
    e.preventDefault();
    dispatch(registerUser(form));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap size={24} className="text-white" fill="white" />
          </div>
          <h1 className="font-display font-bold text-2xl">Create account</h1>
          <p className="text-white/40 text-sm mt-1">Join TechRelive today</p>
        </div>

        <div className="card p-6 md:p-8">
          {error && (
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { val: "buyer", label: "I'm a Buyer", icon: ShoppingBag },
              { val: "seller", label: "I'm a Seller", icon: User },
            ].map(({ val, label, icon: Icon }) => (
              <button
                key={val}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: val }))}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 ${form.role === val
                    ? "bg-brand-500/15 border-brand-500/40 text-brand-400"
                    : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                  }`}
              >
                <Icon size={20} />
                <span className="text-xs font-display font-semibold">{label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-display font-medium text-white/70 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-display font-medium text-white/70 mb-1.5">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-display font-medium text-white/70 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="input pr-11"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
