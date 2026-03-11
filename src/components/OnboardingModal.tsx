"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "goretail_onboarded";

type RoleId = "superadmin" | "admin" | "customer";

const DEMO_CREDS = {
  superadmin: {
    label: "SUPERADMIN LOGIN",
    email: "superadmin@goretail.com",
    password: "SuperAdmin@123",
    redirect: "/superadmin/dashboard",
    hints: [{ email: "superadmin@goretail.com", password: "SuperAdmin@123" }],
  },
  admin: {
    label: "STORE ADMIN LOGIN",
    email: "admin1@freshcafe.com",
    password: "Admin@123",
    redirect: "/dashboard",
    hints: [
      { email: "admin1@freshcafe.com", password: "Admin@123" },
      { email: "admin2@urbanfashion.com", password: "Admin@123" },
      { email: "admin3@techgadgets.com", password: "Admin@123" },
    ],
  },
};

const ROLES: Array<{
  id: RoleId;
  title: string;
  subtitle: string;
  iconBg: string;
  icon: React.ReactNode;
}> = [
  {
    id: "superadmin",
    title: "SuperAdmin",
    subtitle: "System owner · All stores",
    iconBg: "bg-violet-100",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-violet-600">
        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V6zM3 15.75a3 3 0 013-3h2.25a3 3 0 013 3V18a3 3 0 01-3 3H6a3 3 0 01-3-3v-2.25zm9.75 0a3 3 0 013-3H18a3 3 0 013 3V18a3 3 0 01-3 3h-2.25a3 3 0 01-3-3v-2.25z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: "admin",
    title: "Store Admin",
    subtitle: "Manage your store",
    iconBg: "bg-gray-100",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-700">
        <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
      </svg>
    ),
  },
  {
    id: "customer",
    title: "Continue as Customer",
    subtitle: "Browse catalog · No login required",
    iconBg: "bg-emerald-100",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-emerald-600">
        <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function OnboardingModal() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<RoleId | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      const t = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(t);
    } else {
      router.replace("/catalog");
    }
  }, [router]);

  function handleSelectRole(id: RoleId) {
    setSelected(id);
    setError("");
    if (id === "superadmin" || id === "admin") {
      const creds = DEMO_CREDS[id];
      setEmail(creds.email);
      setPassword(creds.password);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || selected === "customer") return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Invalid credentials");
        setLoading(false);
        return;
      }
      localStorage.setItem(STORAGE_KEY, "1");
      router.push(DEMO_CREDS[selected].redirect);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  function handleCustomerContinue() {
    localStorage.setItem(STORAGE_KEY, "1");
    router.push("/catalog");
  }

  if (!mounted || !visible) {
    return (
      <div className="fixed inset-0 bg-[#F5F7FA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-950 rounded-full animate-spin" />
      </div>
    );
  }

  const loginRole = selected === "superadmin" || selected === "admin" ? selected : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5F7FA] p-4 overflow-y-auto">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gray-950 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-sm font-black tracking-tight">GR</span>
          </div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">GoRetail</h1>
          <p className="text-sm text-gray-500 mt-1">Choose how you want to continue</p>
        </div>

        {/* Role Cards */}
        <div className="space-y-2 mb-4">
          {ROLES.map((role) => {
            const isSelected = selected === role.id;
            return (
              <button
                key={role.id}
                onClick={() => {
                  if (role.id === "customer") {
                    handleCustomerContinue();
                  } else {
                    handleSelectRole(role.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150
                  ${isSelected
                    ? "border-gray-950 bg-white shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
              >
                {/* Radio indicator */}
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                  ${isSelected ? "border-gray-950" : "border-gray-300"}`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-gray-950" />}
                </div>

                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${role.iconBg}`}>
                  {role.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{role.title}</p>
                  <p className="text-xs text-gray-500">{role.subtitle}</p>
                </div>

                {/* Chevron for customer */}
                {role.id === "customer" && (
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Inline Login Form */}
        {loginRole && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              {DEMO_CREDS[loginRole].label}
            </p>

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-950/20 focus:border-gray-950 bg-gray-50"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-950/20 focus:border-gray-950 bg-gray-50 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-red-600">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-gray-950 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 active:bg-gray-950 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Demo credential hints */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 font-medium mb-2 uppercase tracking-wider">Demo accounts — click to fill</p>
              <div className="space-y-1">
                {DEMO_CREDS[loginRole].hints.map((hint) => (
                  <button
                    key={hint.email}
                    type="button"
                    onClick={() => { setEmail(hint.email); setPassword(hint.password); setError(""); }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                  >
                    <span className="text-[11px] font-mono text-gray-600 group-hover:text-gray-900">{hint.email}</span>
                    <span className="text-[11px] text-gray-400 ml-2">/ {hint.password}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
