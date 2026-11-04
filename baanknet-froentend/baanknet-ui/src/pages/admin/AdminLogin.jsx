import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
    Lock,
    Mail,
    Eye,
    EyeOff,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    KeyRound
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
            setError(err.message || "Invalid credentials. Use the Quick Sign In button below.");
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
                setError(err.message || "Sign in failed.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F3F4F6] px-4 py-12 text-gray-800 font-sans">
            <div className="w-full max-w-md space-y-6">
                {/* Brand Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-2.5 rounded-xl bg-white border border-gray-200 shadow-xs mb-1">
                        <img src={logoImg} alt="Bidwallah Logo" className="h-8 w-auto object-contain" />
                    </div>

                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                        Admin Sign In
                    </h1>
                    <p className="text-xs text-gray-500">
                        Bidwallah Property &amp; Auction Management Console
                    </p>
                </div>

                {/* Login Box */}
                <div className="rounded-2xl border border-gray-200/80 bg-white/60 backdrop-blur-xl p-6 sm:p-8 shadow-sm space-y-5">
                    {/* Error Banner */}
                    {error && (
                        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 font-medium">
                            <AlertCircle size={16} className="text-red-500 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Quick Sign In */}
                    <button
                        type="button"
                        onClick={handleInstantLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 py-3 px-4 text-xs font-semibold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                        <KeyRound size={15} />
                        <span>{loading ? "Signing in..." : "Quick Admin Sign In"}</span>
                        <ArrowRight size={14} />
                    </button>

                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink mx-3 text-[11px] font-medium text-gray-400">
                            Or sign in with email
                        </span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    {/* Credentials Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Email Address
                            </label>
                            <div className="flex items-center rounded-lg bg-gray-50 border border-gray-200 px-3.5 py-2.5 focus-within:border-red-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500/10 transition">
                                <Mail size={15} className="text-gray-400 mr-2.5 shrink-0" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@bidwallah.com"
                                    className="w-full bg-transparent text-xs font-medium text-gray-900 placeholder-gray-400 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div className="flex items-center rounded-lg bg-gray-50 border border-gray-200 px-3.5 py-2.5 focus-within:border-red-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500/10 transition">
                                <Lock size={15} className="text-gray-400 mr-2.5 shrink-0" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-transparent text-xs font-medium text-gray-900 placeholder-gray-400 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer ml-2"
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 px-4 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                        >
                            {loading ? "Authenticating..." : "Sign In with Credentials"}
                        </button>
                    </form>

                    {/* Pre-filled Account Notice */}
                    <div className="text-center pt-1">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-red-700 font-medium bg-red-50 border border-red-200/80 px-3 py-1 rounded-full">
                            <CheckCircle2 size={12} className="text-red-600" />
                            <span>Default workspace credentials pre-filled</span>
                        </span>
                    </div>
                </div>

                {/* Back to Public Site */}
                <div className="text-center">
                    <Link
                        to="/"
                        className="text-xs text-slate-500 hover:text-blue-600 transition font-medium"
                    >
                        ← Back to Public Marketplace
                    </Link>
                </div>
            </div>
        </div>
    );
}
