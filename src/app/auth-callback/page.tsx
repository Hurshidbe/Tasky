"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const token = searchParams.get("token");
      const refresh_token = searchParams.get("refresh_token");

      console.log("Auth Callback received params:", { 
        hasToken: !!token, 
        hasRefreshToken: !!refresh_token 
      });

      if (token) {
        localStorage.setItem("access_token", token);
        if (refresh_token) {
          localStorage.setItem("refresh_token", refresh_token);
        }
        
        // Kichik kechikish bilan dashboardga o'tish (storage yozib ulgurishi uchun)
        setTimeout(() => {
          router.replace("/dashboard");
        }, 500);
      } else {
        const error = searchParams.get("error");
        setErrorMessage(error || "Token topilmadi. Google orqali kirishda xatolik yuz berdi.");
      }
    } catch (err) {
      console.error("Callback error:", err);
      setErrorMessage("Kutilmagan xatolik yuz berdi.");
    }
  }, [router, searchParams]);

  if (errorMessage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-white text-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-6" />
        <h1 className="text-2xl font-bold mb-2">Kirishda xatolik</h1>
        <p className="text-slate-400 mb-8 max-w-md">{errorMessage}</p>
        <Link href="/login" className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all">
          Login sahifasiga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-slate-950 text-white">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10" />
      </div>
      <div className="text-center">
        <p className="text-xl font-bold tracking-tight">Xavfsiz kirish...</p>
        <p className="text-slate-500 text-sm mt-1">Iltimos, kuting, biz sizni tizimga ulamoqdamiz</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-slate-950 text-white">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
