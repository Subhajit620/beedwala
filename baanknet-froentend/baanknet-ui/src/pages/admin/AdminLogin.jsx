import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
    Lock,
    Mail,
    Eye,
    EyeOff,
    Sparkles,
    ArrowRight,
    AlertCircle,
    Shield,
    CheckCircle2
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import logoImg from "../../assets/logo.jpg";

export default function AdminLogin() {
    const { login, quickDemoLogin, isAuthenticated } = useAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/admin";

    const [email, setEmail] = useState("admin@bidwallah.com");
    const [password, setPassword] = useState("admin123");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // If already logged in, redirect directly
    if (isAuthenticated) {
        navigate(from, { replace: true });
    }

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || "Invalid credentials. Please click the 1-Click Login button below.");
        } finally {
            setLoading(false);
        }
    };

    const handleInstantLogin = async () => {
        setError("");
        setLoading(true);
        try {
            await quickDemoLogin();
            navigate(from, { replace: true });
        } catch {
            // Fallback to standard login with defaults
            try {
                await login("admin@bidwallah.com", "admin123");
                navigate(from, { replace: true });
            } catch (err) {
                setError(err.message || "Instant access failed.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 -left-20 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-20 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md space-y-6 relative z-10 animate-scale-up">
                {/* Brand Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-white shadow-xl shadow-amber-500/10 mb-1">
                        <img src={logoImg} alt="Baanknet Logo" className="h-8 w-auto object-contain" />
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        Admin Sign In
                    </h1>
                    <p className="text-xs text-slate-400">
                        Baanknet SARFAESI Auction Management Console
                    </p>
                </div>

                {/* Login Box */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
                    {/* Error Banner */}
                    {error && (
                        <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
                            <AlertCircle size={16} className="text-rose-400 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* ⚡ 1-Click Instant Login (Super Simple) */}
                    <button
                        type="button"
                        onClick={handleInstantLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 py-3.5 px-4 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 transition cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                        <Sparkles size={16} />
                        <span>{loading ? "Signing in..." : "⚡ 1-Click Instant Admin Login"}</span>
                        <ArrowRight size={14} />
                    </button>

                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-800"></div>
                        <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Or sign in with email
                        </span>
                        <div className="flex-grow border-t border-slate-800"></div>
                    </div>

                    {/* Simple Clean Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                Email Address
                            </label>
                            <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 focus-within:border-amber-500 transition">
                                <Mail size={16} className="text-slate-500 mr-2 shrink-0" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@bidwallah.com"
                                    className="w-full bg-transparent text-xs font-semibold text-white placeholder-slate-600 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                Password
                            </label>
                            <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 focus-within:border-amber-500 transition">
                                <Lock size={16} className="text-slate-500 mr-2 shrink-0" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-transparent text-xs font-semibold text-white placeholder-slate-600 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-slate-500 hover:text-slate-300 cursor-pointer ml-2"
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-4 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                        >
                            {loading ? "Authenticating..." : "Sign In with Credentials"}
                        </button>
                    </form>

                    {/* Pre-filled Account Notice */}
                    <div className="text-center pt-1">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                            <CheckCircle2 size={12} />
                            <span>Demo credentials pre-filled & ready</span>
                        </span>
                    </div>
                </div>

                {/* Back to Public Site */}
                <div className="text-center">
                    <Link
                        to="/"
                        className="text-xs text-slate-400 hover:text-amber-400 transition font-medium"
                    >
                        ← Back to Public Marketplace
                    </Link>
                </div>
            </div>
        </div>
    );
}
