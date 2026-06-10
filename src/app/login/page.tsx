"use client";

import React, { useState } from "react";
import { Mail, Lock, ArrowRight, Loader2, Layout, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResetSuccess("");

    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token } = response.data;
      
      localStorage.setItem("access_token", access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setResetLoading(true);
    setError("");
    setResetSuccess("");
    try {
      await api.post("/auth/password-reset-request", { email });
      setResetSuccess("Reset email sent successfully");
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Something went wrong. Please try again.";
      if (errMsg.includes("bunday email saytda")) {
        setError("This email is not registered.");
      } else {
        setError(errMsg);
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-[360px] bg-slate-900/40 backdrop-blur-2xl p-7 rounded-3xl border border-white/5 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4 transition-transform">
            <Layout className="text-white w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">Welcome Back</h1>
          <p className="text-slate-500 text-xs font-medium text-center">
            Sign in to continue to Tasky
          </p>
        </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-medium p-2.5 rounded-xl mb-4 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <div className="flex-1 text-left">
            {error === "Incorrect email/password" ? (
              <span>
                Incorrect email/password.{" "}
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="underline hover:text-rose-300 font-semibold cursor-pointer disabled:opacity-50"
                >
                  {resetLoading ? "Sending..." : "Forgot password?"}
                </button>
              </span>
            ) : (
              <span>{error}</span>
            )}
          </div>
        </div>
      )}

        {resetSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium p-3 rounded-xl mb-4 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{resetSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
            <input
              type="email"
              required
              className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-slate-200 text-xs placeholder:text-slate-600"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
            <input
              type="password"
              required
              className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-slate-200 text-xs placeholder:text-slate-600"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-black py-2.5 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all active:scale-[0.98] mt-2 disabled:opacity-70 text-xs uppercase tracking-widest cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-3.5 h-3.5" /></>}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.2em]">
            <span className="bg-[#0f172a] px-3 text-slate-600">OR</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-2.5 rounded-xl border border-white/5 flex items-center justify-center gap-3 transition-all active:scale-[0.98] text-xs cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        <div className="mt-6 text-center text-[11px] font-bold">
          <span className="text-slate-600">No account? </span>
          <Link href="/register" className="text-primary hover:underline underline-offset-4 decoration-2 transition-all">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
