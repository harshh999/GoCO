"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  User
} from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import Input from "./Input";
import { Chrome, Mail, Phone, Lock, ArrowRight, Loader2 } from "lucide-react";

type LoginTab = "email" | "google" | "phone";

export default function Login1() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LoginTab>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Email/Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Phone OTP state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  // Initialize reCAPTCHA
  useEffect(() => {
    if (typeof window !== "undefined" && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        }
      });
    }
  }, []);

  // Store user in Firebase Realtime Database
  const storeUserInDatabase = async (user: User, loginMethod: string) => {
    const userData = {
      email: user.email || null,
      phoneNumber: user.phoneNumber || null,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      role: "ADMIN", // Default role
      loginMethod,
      createdAt: Date.now(),
      uid: user.uid
    };

    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
    } catch (err) {
      console.error("Failed to store user in database:", err);
    }
  };

  // Handle Google Sign In
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log("Google login success:", user);
      
      await storeUserInDatabase(user, "google");
      
      // Redirect based on role
      if (user.email?.includes("superadmin")) {
        router.push("/superadmin/dashboard");
      } else {
        router.push("/catalog");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Google login failed";
      console.error("Google login error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Email/Password Sign In
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("Email login success:", user);
      
      await storeUserInDatabase(user, "email");
      
      // Redirect based on email
      if (email.includes("superadmin")) {
        router.push("/superadmin/dashboard");
      } else {
        router.push("/catalog");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Invalid email or password";
      console.error("Email login error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      // Format phone number with country code
      const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
      
      const verifier = window.recaptchaVerifier;
      if (!verifier) {
        throw new Error("reCAPTCHA not initialized");
      }
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      console.log("OTP sent successfully");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send OTP";
      console.error("Send OTP error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) {
      setError("Please request OTP first");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      console.log("Phone login success:", user);
      
      await storeUserInDatabase(user, "phone");
      
      router.push("/catalog");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Invalid OTP";
      console.error("Verify OTP error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "email" as const, label: "Email", icon: Mail },
    { id: "google" as const, label: "Google", icon: Chrome },
    { id: "phone" as const, label: "Phone", icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-1/3 -right-32 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/3 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl shadow-lg shadow-violet-600/20 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-violet-900/5 border border-white/50 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setError("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "text-violet-600 bg-violet-50/50"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Hidden reCAPTCHA container */}
            <div id="recaptcha-container" className="hidden"></div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email Login Form */}
            {activeTab === "email" && (
              <form onSubmit={handleEmailLogin} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  icon={<Mail className="w-4 h-4 text-gray-400" />}
                />
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    icon={<Lock className="w-4 h-4 text-gray-400" />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Google Login */}
            {activeTab === "google" && (
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Chrome className="w-5 h-5 text-blue-500" />
                      Continue with Google
                    </>
                  )}
                </button>
                <p className="text-center text-sm text-gray-500">
                  We&apos;ll redirect you to Google for authentication
                </p>
              </div>
            )}

            {/* Phone OTP Login */}
            {activeTab === "phone" && (
              <div className="space-y-5">
                {!otpSent ? (
                  <>
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="Enter phone number (e.g., 919999999999)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      icon={<Phone className="w-4 h-4 text-gray-400" />}
                      hint="Include country code (e.g., +91 for India)"
                    />
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Send OTP"
                      )}
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-5">
                    <Input
                      label="Enter OTP"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      icon={<Lock className="w-4 h-4 text-gray-400" />}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Verify & Sign In"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                        setConfirmationResult(null);
                        setError("");
                      }}
                      className="w-full text-sm text-gray-500 hover:text-gray-700"
                    >
                      Change phone number
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <a href="/register" className="text-violet-600 font-semibold hover:text-violet-700">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add global type declaration for reCAPTCHA
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}
