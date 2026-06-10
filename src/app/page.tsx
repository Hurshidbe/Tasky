"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, Layout } from "lucide-react";

// ─── Mini floating card components ─────────────────────────────────────────

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <span
      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 border border-white/10 shadow-inner"
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  );
}

function TeamCard() {
  const members = [
    { name: "Maria Lopez",   role: "UI/UX Designer",  color: "#10b981", ini: "ML" },
    { name: "Tom Wilson",    role: "DevOps Engineer",  color: "#ef4444", ini: "TW" },
  ];
  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-48 sm:w-52 space-y-3">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
        Team Members
      </p>
      <div className="space-y-2.5">
        {members.map((m) => (
          <div key={m.name} className="flex items-center gap-3">
            <Avatar initials={m.ini} color={m.color} />
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-200 truncate">{m.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{m.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsCard() {
  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-40 sm:w-44 space-y-3">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
        This Week
      </p>
      {/* Mini chart bars */}
      <div className="flex items-end gap-1.5 h-10">
        {[60, 80, 50, 95, 70, 85, 75].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${h}%`,
              backgroundColor: i === 3 ? "#3b82f6" : "rgba(255, 255, 255, 0.1)",
            }}
          />
        ))}
      </div>
      <div className="flex justify-between items-center pt-1">
        <div>
          <div className="text-sm font-black text-slate-100">84%</div>
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Done</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-black text-emerald-400">+12</div>
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Tasks</div>
        </div>
      </div>
    </div>
  );
}

function KanbanCard() {
  const tasks = [
    { label: "Design review",    dot: "bg-blue-500" },
    { label: "API integration",  dot: "bg-emerald-500" },
    { label: "Deploy to prod",   dot: "bg-rose-500" },
  ];
  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-44 sm:w-48 space-y-3">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
        In Progress
      </p>
      <div className="space-y-2.5">
        {tasks.map((t) => (
          <div key={t.label} className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${t.dot} shrink-0`} />
            <span className="text-xs text-slate-300 font-semibold truncate">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationBadge() {
  return (
    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3.5 py-2 rounded-xl text-xs font-bold shadow-[0_10px_30px_rgba(239,68,68,0.15)] inline-flex items-center gap-2 select-none whitespace-nowrap">
      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
      <span>3 tasks overdue</span>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col relative overflow-hidden font-sans">
      {/* Background Animated Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="relative z-20 bg-slate-950/20 backdrop-blur-md">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Layout className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">Tasky</span>
          </div>



          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12 md:py-20 lg:py-24 flex flex-col lg:flex-row items-center gap-16 relative z-10 flex-grow">
        {/* Left Column (Content) */}
        <div className="flex-1 space-y-8 text-center lg:text-left max-w-2xl lg:max-w-none">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold text-primary shadow-inner select-none mx-auto lg:mx-0">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Discover a new way of working</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none text-white">
            From idea <br />
            to <span className="bg-gradient-to-r from-primary via-blue-400 to-indigo-400 bg-clip-text text-transparent">done.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
            Collaborate with your team, manage projects, track progress, and deliver results faster from one unified, modern workspace.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <Link
              href="/register"
              className="bg-primary hover:bg-primary/95 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98] text-xs uppercase tracking-wider flex items-center gap-2"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center lg:justify-start gap-4 pt-8 border-t border-white/5">
            <div className="flex -space-x-2.5">
              {["SJ", "AC", "ML", "TW"].map((ini, i) => {
                const colors = ["bg-indigo-500", "bg-amber-500", "bg-emerald-500", "bg-rose-500"];
                return (
                  <div key={ini} className={`w-8 h-8 rounded-full border-2 border-[#030712] flex items-center justify-center font-bold text-[10px] text-white ${colors[i]} shadow-md`}>
                    {ini}
                  </div>
                );
              })}
            </div>
            <span className="text-xs font-semibold text-slate-400">
              <strong className="text-slate-200 font-extrabold text-sm">2,400+</strong> teams use Tasky
            </span>
          </div>
        </div>

        {/* Right Column (Visual Canvas) */}
        <div className="flex-1 w-full flex justify-center items-center">
          <div className="relative w-full max-w-[500px] h-[480px] sm:h-[500px] rounded-3xl border border-white/10 bg-slate-900/10 backdrop-blur-md shadow-2xl overflow-hidden flex items-center justify-center">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Dashboard hero image with tilt/perspective */}
            <div className="absolute inset-0 flex items-center justify-center p-6 opacity-35">
              <Image
                src="/dashboard-hero.png"
                alt="Tasky dashboard preview"
                width={500}
                height={350}
                className="object-contain rounded-2xl transform perspective-800 rotate-y-6"
                priority
              />
            </div>

            {/* Glowing Accent */}
            <div className="absolute top-0 right-0 w-0 h-0 border-t-[80px] border-t-amber-500/80 border-l-[80px] border-l-transparent pointer-events-none" />

            {/* Floating UI Cards */}
            <div className="absolute top-6 left-6 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              <TeamCard />
            </div>

            <div className="absolute top-6 right-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <StatsCard />
            </div>

            <div className="absolute bottom-28 left-6 transform -rotate-1 hover:rotate-0 transition-transform duration-300 z-10">
              <NotificationBadge />
            </div>

            <div className="absolute bottom-6 right-6 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <KanbanCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
