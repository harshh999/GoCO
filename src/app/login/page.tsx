"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

type Role = "SUPER_ADMIN" | "ADMIN" | null;

function LoginContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const rawRedirect = searchParams.get("redirect");

  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function getDefaultRedirect(role: string) {
    if (role === "SUPER_ADMIN") return "/superadmin/dashboard";
    return "/dashboard";
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        const role: string = data.data.role;
        const dest = rawRedirect ?? getDefaultRedirect(role);
        
        toast(`Authorized as ${role}. Redirecting to ${dest}...`, "success");
        
        // Use window.location for a hard redirect to ensure cookies are fresh
        setTimeout(() => {
          window.location.assign(dest);
        }, 800);
      } else {
        const errorMsg = data.error ?? "Invalid credentials";
        setError(errorMsg);
        toast(errorMsg, "error");
      }
    } catch {
      const errorMsg = "Something went wrong. Please try again.";
      setError(errorMsg);
      toast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }

  const roleCards = [
    {
      key: "SUPER_ADMIN" as Role,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 01.75 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-2.283-.639-4.419-1.752-6.236A11.979 11.979 0 0112 2.964z" />
        </svg>
      ),
      label: "SuperAdmin",
      desc: "System owner · All stores",
      hint: "superadmin@goretail.com",
      color: "from-violet-600 to-indigo-600",
      border: "border-violet-200 bg-violet-50 hover:border-violet-400",
      activeBorder: "border-violet-600 bg-violet-50 ring-2 ring-violet-200",
      labelColor: "text-violet-700",
      descColor: "text-violet-500",
    },
    {
      key: "ADMIN" as Role,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
        </svg>
      ),
      label: "Store Admin",
      desc: "Manage your store",
      hint: "admin1@freshcafe.com",
      color: "from-gray-700 to-gray-900",
      border: "border-gray-200 bg-gray-50 hover:border-gray-400",
      activeBorder: "border-gray-900 bg-gray-50 ring-2 ring-gray-200",
      labelColor: "text-gray-800",
      descColor: "text-gray-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex flex-col">
      {/* Subtle top bar */}
      <div className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-950 rounded-lg flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">GR</span>
            </div>
            <span className="text-sm font-bold text-gray-900 tracking-tight">GoRetail</span>
          </div>
          <Link
            href="/catalog"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors font-medium"
          >
            Browse Catalog
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-[28px] font-bold text-gray-950 tracking-tight">Welcome to GoRetail</h1>
            <p className="text-gray-500 text-[15px] mt-2">Choose how you&apos;d like to continue</p>
          </div>

          {/* Role cards */}
          <div className="space-y-3 mb-6">
            {roleCards.map((card) => (
              <button
                key={card.key}
                onClick={() => setSelectedRole(selectedRole === card.key ? null : card.key)}
                className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 ${
                  selectedRole === card.key ? card.activeBorder : card.border
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shrink-0`}>
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${card.labelColor}`}>{card.label}</p>
                    <p className={`text-xs mt-0.5 ${card.descColor}`}>{card.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    selectedRole === card.key
                      ? "border-gray-900 bg-gray-900"
                      : "border-gray-300"
                  }`}>
                    {selectedRole === card.key && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {/* Guest tile */}
            <Link
              href="/catalog"
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Continue as Customer</p>
                <p className="text-xs text-gray-500 mt-0.5">Browse catalog · No login required</p>
              </div>
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Login form — slides in when a role is selected */}
          {selectedRole && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fade-in">
              <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-4">
                {selectedRole === "SUPER_ADMIN" ? "SuperAdmin Login" : "Store Admin Login"}
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                        selectedRole === "SUPER_ADMIN"
                          ? "superadmin@goretail.com"
                          : "admin1@freshcafe.com"
                      }
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-3 pr-11 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPw ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gray-950 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              {/* Hint */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-[11px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Demo credentials</p>
                {selectedRole === "SUPER_ADMIN" ? (
                  <p className="text-xs text-gray-400 font-mono">superadmin@goretail.com · SuperAdmin@123</p>
                ) : (
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-400 font-mono">admin1@freshcafe.com · Admin@123</p>
                    <p className="text-xs text-gray-400 font-mono">admin2@urbanfashion.com · Admin@123</p>
                    <p className="text-xs text-gray-400 font-mono">admin3@techgadgets.com · Admin@123</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-8">
            GoRetail · GoCo (GoCommerce) by Lazlle &amp; Co.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginContent />
    </Suspense>
  );
}
