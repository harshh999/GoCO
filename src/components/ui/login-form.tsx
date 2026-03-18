"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2 } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";

type LoginTab = "email";

function SmokeyBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse animation-delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse animation-delay-2000" />
      </div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20" />
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const [activeTab] = useState<LoginTab>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Email/Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handle Email/Password Sign In using API
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Login failed");
      }

      // Login successful - the session cookie is already set by the API
      // Redirect based on role
      if (data.data.role === "SUPER_ADMIN") {
        router.push("/superadmin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Invalid credentials";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-8 text-center border-b border-white/10">
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-white/60 mt-2">Sign in to continue</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium text-white bg-white/5"
          >
            <Mail className="w-4 h-4" />
            Admin Login
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Email Login Form */}
          {activeTab === "email" && (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <GlassButton 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 font-semibold"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              </GlassButton>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center">
          <p className="text-sm text-white/50">
            For customer login, visit the store catalog
          </p>
        </div>
      </div>
    </div>
  );
}

export { SmokeyBackground, LoginForm };
