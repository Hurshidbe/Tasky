"use client";

import React, { useState } from "react";
import { Lock, ArrowRight, Loader2, Layout, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ResetPasswordPage() {
  const params = useParams();
  const id = params.id as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post(`/auth/reset-password/${id}`, {
        password: password,
        return_password: confirmPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Link invalid or expired. Please request a new password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-[420px] bg-slate-900/40 backdrop-blur-2xl p-10 rounded-[32px] border border-white/5 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 mb-6 transition-transform">
            <Layout className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Reset Password</h1>
          <p className="text-slate-500 text-sm font-medium text-center">
            Set your new password to regain access to Tasky
          </p>
        </div>

        {success ? (
          <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Password Updated!</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your password has been successfully updated. You can now use your new password to log in.
            </p>
            <Link
              href="/login"
              className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all active:scale-[0.98] mt-4 text-sm uppercase tracking-widest"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium p-3.5 rounded-xl mb-6 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-5 outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-slate-200 text-sm placeholder:text-slate-600"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-5 outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-slate-200 text-sm placeholder:text-slate-600"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all active:scale-[0.98] mt-2 disabled:opacity-70 text-sm uppercase tracking-widest"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Save Password <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
